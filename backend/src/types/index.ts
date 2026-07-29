export type Choice = 'A' | 'B' | 'C' | 'D';

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithCount extends Category {
  question_count: number;
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
}

export interface SeedCategory {
  name: string;
  color: string;
  questions: SeedQuestion[];
}
