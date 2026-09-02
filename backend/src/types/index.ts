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
// the body is fetched per category.
export interface CategoryWithCount extends Category {
  question_count: number;
  flashcard_count: number;
  has_lesson: boolean;
}

export interface QuestionBrief {
  id: number;
  category_id: number;
  question_text: string;
}

export interface Question {
  id: number;
  category_id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: Choice;
  explanation: string | null;
  diagram_svg: string | null;
  created_at: string;
  updated_at: string;
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
  questions: SeedQuestion[];
}
