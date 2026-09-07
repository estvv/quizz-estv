import type { Exercise, TypeAnswerPayload } from '../types';

// Fold Latin diacritics only  never touch Hangul.
function foldLatin(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

type NormalizeMode = 'loose' | 'romaja';

export function normalizeAnswer(raw: string, mode: NormalizeMode = 'loose'): string {
  let s = foldLatin(raw.normalize('NFC').trim().toLowerCase());
  s = s.replace(/\s+/g, ' ');
  if (mode === 'romaja') {
    // "sa-gwa" == "sagwa" == "sa gwa"
    s = s.replace(/[\s-]+/g, '');
  }
  return s;
}

export function matchesAccept(accept: string[], input: string, mode: NormalizeMode = 'loose'): boolean {
  const got = normalizeAnswer(input, mode);
  if (got === '') return false;
  return accept.some((a) => normalizeAnswer(a, mode) === got);
}

export function isTypeAnswerCorrect(payload: TypeAnswerPayload, input: string): boolean {
  return matchesAccept(payload.accept, input, payload.normalize ?? 'loose');
}

/** What the session records per exercise, and what the results screen shows. */
export interface Grade {
  correct: boolean;
  /** The correct answer spelled out, for the review list. */
  answer: string;
}

/** The user's raw response, shape depends on the exercise type. */
export type Response =
  | number                                       // mcq: chosen index
  | string                                       // type_answer: the text
  | { sens: string; prononciation: string }      // vocab: the two fields
  | null;

export function gradeExercise(exercise: Exercise, response: Response): Grade {
  switch (exercise.type) {
    case 'mcq': {
      const { choices, correct } = exercise.payload;
      return { correct: response === correct, answer: choices[correct] };
    }
    case 'type_answer': {
      const input = typeof response === 'string' ? response : '';
      return { correct: isTypeAnswerCorrect(exercise.payload, input), answer: exercise.payload.accept[0] };
    }
    case 'vocab': {
      const { fr, ko, rr } = exercise.payload;
      const sens = response && typeof response === 'object' ? response.sens : '';
      return { correct: matchesAccept(fr, sens, 'loose'), answer: `${ko} = ${rr} = ${fr[0]}` };
    }
  }
}
