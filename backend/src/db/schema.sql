-- Self-referencing tree of unbounded depth, rooted at "School" and "Others".
-- A category holding children is a container and carries no study material of
-- its own; all content  lesson, flashcards, questions  hangs off the leaves.
-- Deleting a category drops its whole subtree, done in application code
-- (deleteSubtree) rather than by the SET NULL rule below.
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    color TEXT NOT NULL DEFAULT 'slate',
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    -- Markdown. Deliberately never selected by the category list query: it is a
    -- long body and that list is fetched on every page.
    lesson TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    choice_a TEXT NOT NULL,
    choice_b TEXT NOT NULL,
    choice_c TEXT NOT NULL,
    choice_d TEXT NOT NULL,
    correct_choice TEXT NOT NULL CHECK (correct_choice IN ('A','B','C','D')),
    explanation TEXT,
    diagram_svg TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Generic exercise, supersedes `questions` as the store. `questions` (above) is
-- kept only so an old database keeps parsing; seeding never writes to it any
-- more. `type` discriminates the payload shape; the set of valid types and the
-- payload shapes are enforced in application code (validateExercisePayload in
-- db/index.ts), not by a CHECK, so adding a type needs no migration. `payload`
-- is JSON, validated once at seed time, read-only after.
CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    payload TEXT NOT NULL,
    explanation TEXT,
    diagram_svg TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category_id);

CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flashcards_category ON flashcards(category_id);
