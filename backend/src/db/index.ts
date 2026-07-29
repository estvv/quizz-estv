import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Category, CategoryWithCount, Question, QuestionBrief, SeedCategory } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/quizz.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  seedIfEmpty();
  console.log('Database initialized');
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

function seedIfEmpty() {
  const { c } = db.prepare('SELECT COUNT(*) as c FROM categories').get() as { c: number };
  if (c > 0) return;

  const seedPath = path.join(__dirname, 'seed.json');
  if (!fs.existsSync(seedPath)) return;

  const seed: SeedCategory[] = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  const insertCategory = db.prepare('INSERT INTO categories (name, slug, color) VALUES (?, ?, ?)');
  const insertQuestion = db.prepare(`INSERT INTO questions
    (category_id, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);

  const seedAll = db.transaction((categories: SeedCategory[]) => {
    for (const cat of categories) {
      const slug = slugify(cat.name);
      const result = insertCategory.run(cat.name, slug, cat.color ?? 'slate');
      const categoryId = result.lastInsertRowid as number;
      for (const q of cat.questions ?? []) {
        insertQuestion.run(categoryId, q.question_text, q.choice_a, q.choice_b, q.choice_c, q.choice_d, q.correct_choice);
      }
    }
  });
  seedAll(seed);
  console.log(`Seeded ${seed.length} categories from seed.json`);
}

// --- categories ---

export function getCategories(): CategoryWithCount[] {
  return db.prepare(`
    SELECT c.*, COUNT(q.id) as question_count
    FROM categories c
    LEFT JOIN questions q ON q.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name COLLATE NOCASE
  `).all() as CategoryWithCount[];
}

export function getCategoryById(id: number): CategoryWithCount | undefined {
  return db.prepare(`
    SELECT c.*, COUNT(q.id) as question_count
    FROM categories c
    LEFT JOIN questions q ON q.category_id = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `).get(id) as CategoryWithCount | undefined;
}

export function createCategory(name: string, color: string): Category {
  const slug = slugify(name);
  const result = db.prepare('INSERT INTO categories (name, slug, color) VALUES (?, ?, ?)').run(name, slug, color);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid) as Category;
}

export function updateCategory(id: number, updates: Partial<{ name: string; color: string }>): Category | undefined {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?', 'slug = ?');
    values.push(updates.name, slugify(updates.name));
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }

  if (fields.length === 0) return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;

  values.push(id);
  db.prepare(`UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
}

export function deleteCategory(id: number): void {
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
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

export interface CreateQuestionInput {
  category_id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: 'A' | 'B' | 'C' | 'D';
}

export function createQuestion(input: CreateQuestionInput): Question {
  const stmt = db.prepare(`INSERT INTO questions
    (category_id, question_text, choice_a, choice_b, choice_c, choice_d, correct_choice)
    VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(
    input.category_id, input.question_text,
    input.choice_a, input.choice_b, input.choice_c, input.choice_d,
    input.correct_choice
  );
  return getQuestionById(result.lastInsertRowid as number)!;
}

export function updateQuestion(id: number, updates: Partial<CreateQuestionInput>): Question | undefined {
  const fields: string[] = [];
  const values: any[] = [];

  const map: Record<string, (v: any) => [string, any]> = {
    category_id: (v) => ['category_id = ?', v],
    question_text: (v) => ['question_text = ?', v],
    choice_a: (v) => ['choice_a = ?', v],
    choice_b: (v) => ['choice_b = ?', v],
    choice_c: (v) => ['choice_c = ?', v],
    choice_d: (v) => ['choice_d = ?', v],
    correct_choice: (v) => ['correct_choice = ?', v],
  };

  for (const [key, value] of Object.entries(updates)) {
    if (key in map && value !== undefined) {
      const [clause, val] = map[key](value);
      fields.push(clause);
      values.push(val);
    }
  }

  if (fields.length === 0) return getQuestionById(id);

  values.push(id);
  db.prepare(`UPDATE questions SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  return getQuestionById(id);
}

export function deleteQuestion(id: number): void {
  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
}
