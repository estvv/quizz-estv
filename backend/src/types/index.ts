export type Choice = 'A' | 'B' | 'C' | 'D';

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

// What the list endpoint returns. `lesson` is deliberately absent: it is a long
// Markdown body and this list is fetched on every page  only the flag travels,
// the body is fetched per category. `question_count` counts exercises (the name
// is kept for the frontend that already reads it).
export interface CategoryWithCount extends Category {
  question_count: number;
  flashcard_count: number;
  has_lesson: boolean;
}

// --- exercises ---

export type ExerciseType = 'mcq' | 'type_answer' | 'vocab';

/** One choice is correct; `correct` indexes into `choices`. */
export interface McqPayload {
  choices: string[];
  correct: number;
  hint?: string;
}

/**
 * Free-text answer, checked client-side against `accept` after normalisation.
 * `romaja` normalisation additionally strips hyphens and spaces so `sa-gwa`,
 * `sagwa` and `sa gwa` all match.
 */
export interface TypeAnswerPayload {
  accept: string[];
  placeholder?: string;
  hint?: string;
  normalize?: 'loose' | 'romaja';
}

/**
 * One vocab word. `sens` (the French) is graded; `prononciation` (the romaja) is
 * an optional bonus field, never graded, always spelled out in the feedback.
 * `hint` is the 4 options revealed by the "Indice" button.
 */
export interface VocabPayload {
  ko: string;
  rr: string;
  rr_accept?: string[];
  fr: string[];
  hint: string[];
}

export type ExercisePayload = McqPayload | TypeAnswerPayload | VocabPayload;

export interface Exercise {
  id: number;
  category_id: number;
  type: ExerciseType;
  prompt: string;
  payload: ExercisePayload;
  explanation: string | null;
  diagram_svg: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

/** Browse form: never carries `payload` (it holds the answers). */
export interface ExerciseBrief {
  id: number;
  category_id: number;
  type: ExerciseType;
  prompt: string;
}

export interface Flashcard {
  id: number;
  category_id: number;
  front: string;
  back: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// --- seed.json shapes ---

/** Legacy sugar: a fixed 4-choice question, expanded into an `mcq` exercise. */
export interface SeedQuestion {
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: Choice;
  explanation?: string;
  diagram_svg?: string;
}

export interface SeedMcqExercise {
  type: 'mcq';
  prompt: string;
  choices: string[];
  correct: number;
  hint?: string;
  explanation?: string;
  diagram_svg?: string;
}

export interface SeedTypeAnswerExercise {
  type: 'type_answer';
  prompt: string;
  accept: string[];
  placeholder?: string;
  hint?: string;
  normalize?: 'loose' | 'romaja';
  explanation?: string;
  diagram_svg?: string;
}

export type SeedExercise = SeedMcqExercise | SeedTypeAnswerExercise;

/** One vocab word, expanded into four exercises at seed time (see db/index.ts). */
export interface SeedVocab {
  ko: string;
  rr: string;
  /** Accepted French answers; `fr[0]` is the canonical one shown as the label. */
  fr: string[];
  /** Extra accepted romanisations (alternate spellings). */
  rr_accept?: string[];
}

export interface SeedFlashcard {
  front: string;
  back: string;
}

export interface SeedCategory {
  name: string;
  /**
   * Identifier that `parent` references point at. Defaults to `name`, and is only
   * needed where a display name repeats across branches  every subject has a
   * "Week 1", so names alone are not unique keys.
   */
  key?: string;
  color: string;
  parent?: string;
  lesson?: string;
  flashcards?: SeedFlashcard[];
  questions?: SeedQuestion[];
  exercises?: SeedExercise[];
  vocab?: SeedVocab[];
}
