import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Category, CategoryWithCount, Flashcard, Question, QuestionBrief, SeedCategory } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/quizz.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Fail loudly and early if the data directory is not writable  otherwise the
// first write (seeding a fresh DB, or an ALTER during a migration) throws deep
// inside better-sqlite3 and the only symptom is a 502 from the proxy. This is
// almost always a volume-ownership problem on the host.
try {
  fs.accessSync(dataDir, fs.constants.W_OK);
} catch {
  console.error(
    `FATAL: data directory ${dataDir} is not writable by this process (uid ${process.getuid?.() ?? '?'}). ` +
    `Fix the ownership/permissions of the mounted volume.`
  );
  process.exit(1);
}

export const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  runMigrations();
  seedIfEmpty();
  migrateToRootedTree();
  console.log('Database initialized');
}

// Ad-hoc "add column if missing" migration, mirroring the pattern used across
// the other *-estv apps (no formal migration framework, just idempotent checks).
function runMigrations() {
  const questionColumns = db.prepare("PRAGMA table_info(questions)").all() as { name: string }[];
  const hasExplanation = questionColumns.some((c) => c.name === 'explanation');
  if (!hasExplanation) {
    db.exec('ALTER TABLE questions ADD COLUMN explanation TEXT');
  }

  const categoryColumns = db.prepare("PRAGMA table_info(categories)").all() as { name: string }[];
  const hasParentId = categoryColumns.some((c) => c.name === 'parent_id');
  if (!hasParentId) {
    db.exec('ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL');
  }

  const hasDiagramSvg = questionColumns.some((c) => c.name === 'diagram_svg');
  if (!hasDiagramSvg) {
    db.exec('ALTER TABLE questions ADD COLUMN diagram_svg TEXT');
  }

  const hasLesson = categoryColumns.some((c) => c.name === 'lesson');
  if (!hasLesson) {
    db.exec('ALTER TABLE categories ADD COLUMN lesson TEXT');
  }
}

// Categories used to be a flat list, then a two-level list; they are now a tree
// of any depth rooted at "School" and "Others". A database created before that
// change has its subjects sitting at the top level, so file them under "Others"
// once. `PRAGMA user_version` makes this strictly one-shot: renaming or deleting
// either root afterwards must not resurrect it on the next boot.
const SCHEMA_VERSION = 1;

function migrateToRootedTree() {
  const version = db.pragma('user_version', { simple: true }) as number;
  if (version >= SCHEMA_VERSION) return;

  const migrate = db.transaction(() => {
    const roots = db.prepare('SELECT id, name FROM categories WHERE parent_id IS NULL')
      .all() as { id: number; name: string }[];
    const findRoot = (name: string) => roots.find((r) => r.name.toLowerCase() === name.toLowerCase());

    const othersId = findRoot('Others')?.id ?? createCategory('Others', 'slate').id;
    const schoolId = findRoot('School')?.id ?? createCategory('School', 'blue').id;

    const reparent = db.prepare('UPDATE categories SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    for (const root of roots) {
      if (root.id === othersId || root.id === schoolId) continue;
      reparent.run(othersId, root.id);
    }

    db.pragma(`user_version = ${SCHEMA_VERSION}`);
  });
  migrate();
}

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// `slug` is UNIQUE across the whole table, but the same leaf name legitimately
// repeats in different branches  every subject has a "Week 1"  so a bare
// slugify would hit the constraint on the second one. Suffix on collision.
// Nothing reads the slug (routes address categories by id), so the suffix is
// only there to keep the column's guarantee.
function uniqueSlug(name: string): string {
  const base = slugify(name) || 'category';
  const taken = db.prepare('SELECT slug FROM categories WHERE slug LIKE ?')
    .all(`${base}%`) as { slug: string }[];

  const used = new Set(taken.map((row) => row.slug));
  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (c > 0) return;

  const seedPath = path.join(__dirname, 'seed.json');
  if (!fs.existsSync(seedPath)) return;

  const seed: SeedCategory[] = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, color, parent_id, lesson) VALUES (?, ?, ?, ?, ?)');
  const insertQuestion = db.prepare(`INSERT INTO questions
    (category_id, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation, diagram_svg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertFlashcard = db.prepare('INSERT INTO flashcards (category_id, front, back, position) VALUES (?, ?, ?, ?)');

  const seedAll = db.transaction((categories: SeedCategory[]) => {
    // Repeated passes: each pass inserts every category whose `parent` (a key,
    // not an id) is already in. That resolves a tree of any depth regardless of
    // declaration order in the file.
    const idByKey = new Map<string, number>();
    let remaining = [...categories];

    while (remaining.length > 0) {
      const ready = remaining.filter((cat) => !cat.parent || idByKey.has(cat.parent));
      if (ready.length === 0) {
        const names = remaining.map((c) => `${c.name} (parent: ${c.parent})`).join(', ');
        throw new Error(`seed.json: unknown or cyclic parent for ${names}`);
      }

      for (const cat of ready) {
        const slug = uniqueSlug(cat.name);
        const parentId = cat.parent ? idByKey.get(cat.parent)! : null;
        const result = insertCategory.run(cat.name, slug, cat.color ?? 'slate', parentId, cat.lesson ?? null);
        const categoryId = result.lastInsertRowid as number;
        idByKey.set(cat.key ?? cat.name, categoryId);
        for (const q of cat.questions ?? []) {
          insertQuestion.run(categoryId, q.question_text, q.choice_a, q.choice_b, q.choice_c, q.choice_d, q.correct_choice, q.explanation ?? null, q.diagram_svg ?? null);
        }
        (cat.flashcards ?? []).forEach((f, index) => {
          insertFlashcard.run(categoryId, f.front, f.back, index);
        });
      }

      const inserted = new Set(ready);
      remaining = remaining.filter((cat) => !inserted.has(cat));
    }
  });
  seedAll(seed);
  console.log(`Seeded ${seed.length} categories from seed.json`);
}

// --- categories ---

// Correlated subqueries rather than joins: two LEFT JOINs onto the same row
// would multiply each other's rows and inflate both counts. `lesson` is never in
// the column list  only the flag  so the long body stays out of every list.
const CATEGORY_COLUMNS = `
  c.id, c.name, c.slug, c.color, c.parent_id, c.created_at, c.updated_at,
  (SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id) AS question_count,
  (SELECT COUNT(*) FROM flashcards f WHERE f.category_id = c.id) AS flashcard_count,
  (c.lesson IS NOT NULL AND TRIM(c.lesson) != '') AS has_lesson
`;

// SQLite has no boolean type, so has_lesson arrives as 0/1.
function toCategoryWithCount(row: any): CategoryWithCount {
  return { ...row, has_lesson: row.has_lesson === 1 };
}

export function getCategories(): CategoryWithCount[] {
  const rows = db.prepare(`
    SELECT ${CATEGORY_COLUMNS}
    FROM categories c
    ORDER BY c.name COLLATE NOCASE
  `).all();
  return rows.map(toCategoryWithCount);
}

export function getCategoryById(id: number): CategoryWithCount | undefined {
  const row = db.prepare(`SELECT ${CATEGORY_COLUMNS} FROM categories c WHERE c.id = ?`).get(id);
  return row ? toCategoryWithCount(row) : undefined;
}

/** The Markdown body, fetched on its own so it never rides along in a list. */
export function getCategoryLesson(id: number): string | null | undefined {
  const row = db.prepare('SELECT lesson FROM categories WHERE id = ?').get(id) as { lesson: string | null } | undefined;
  return row ? row.lesson : undefined;
}

// Only migrateToRootedTree still creates categories at runtime  it adds the
// two roots to a database that predates them. Everything else comes from
// seed.json at first boot; the HTTP API is read-only.
function createCategory(name: string, color: string): Category {
  const slug = uniqueSlug(name);
  const result = db.prepare('INSERT INTO categories (name, slug, color, parent_id) VALUES (?, ?, ?, NULL)').run(name, slug, color);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as Category;
}

// --- questions ---

export function getQuestionsBrief(categoryId: number): QuestionBrief[] {
  return db.prepare('SELECT id, category_id, question_text FROM questions WHERE category_id = ? ORDER BY id')
    .all(categoryId) as QuestionBrief[];
}

export function getQuestionsFullByCategory(categoryId: number): Question[] {
  return db.prepare('SELECT * FROM questions WHERE category_id = ? ORDER BY id').all(categoryId) as Question[];
}

export function getQuestionsFullByIds(ids: number[]): Question[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...ids) as Question[];
  const byId = new Map(rows.map(r => [r.id, r]));
  return ids.map(id => byId.get(id)).filter((q): q is Question => q !== undefined);
}

export function getQuestionById(id: number): Question | undefined {
  return db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as Question | undefined;
}

// --- flashcards ---

export function getFlashcards(categoryId: number): Flashcard[] {
  return db.prepare('SELECT * FROM flashcards WHERE category_id = ? ORDER BY position, id')
    .all(categoryId) as Flashcard[];
}

export function getFlashcardById(id: number): Flashcard | undefined {
  return db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id) as Flashcard | undefined;
}

