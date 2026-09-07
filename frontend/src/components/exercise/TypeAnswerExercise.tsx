import { useState } from 'react';
import type { TypeAnswerExercise as TypeAnswerExerciseType } from '../../types';
import type { Response } from '../../utils/grade';
import { isTypeAnswerCorrect } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: TypeAnswerExerciseType;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

export function TypeAnswerExercise({ exercise, revealed, onCommit }: Props) {
  const { placeholder, hint } = exercise.payload;
  const [value, setValue] = useState('');
  const correct = revealed && isTypeAnswerCorrect(exercise.payload, value);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!revealed && value.trim() !== '') onCommit(value);
      }}
    >
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">{exercise.prompt}</h2>
      {hint && <p className="text-sm text-neutral-400 mb-4">{hint}</p>}

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={revealed}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder ?? 'Votre réponse'}
        className={`w-full mt-4 px-4 py-3 rounded-lg border-2 text-sm outline-none transition-colors ${
          revealed
            ? correct
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'border-red-500 bg-red-50 text-red-700'
            : 'border-neutral-200 focus:border-neutral-400'
        }`}
      />

      {!revealed && (
        <button
          type="submit"
          disabled={value.trim() === ''}
          className="mt-3 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Valider
        </button>
      )}

      {revealed && (
        <Feedback
          correct={correct}
          correctAnswer={exercise.payload.accept[0]}
          diagramSvg={exercise.diagram_svg}
          explanation={exercise.explanation}
        />
      )}
    </form>
  );
}
