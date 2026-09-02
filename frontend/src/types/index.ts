export type Choice = 'A' | 'B' | 'C' | 'D';

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
  question_count: number;
  flashcard_count: number;
  /** The body is fetched separately  a lesson is too long to ride in the list. */
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

/** A flashcard as shown in a session, whichever source it came from. */
export interface StudyCard {
  key: string;
  front: string;
  back: string;
}
