import { useState } from 'react';
import type { MatchingExercise as MatchingExerciseType } from '../../types';
import type { Response } from '../../utils/grade';
import { Feedback } from './Feedback';
import { FigureView } from '../diagram/FigureView';

interface Props {
  exercise: MatchingExerciseType;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

// Pair each left item with an option from the (shuffled) right column. The
// response is the chosen right index per left item, -1 when left blank.
export function MatchingExercise({ exercise, revealed, onCommit }: Props) {
  const { left, right, solution } = exercise.payload;
  const [picks, setPicks] = useState<number[]>(() => left.map(() => -1));

  const complete = picks.every((p) => p >= 0);

  function pick(row: number, value: number) {
    if (revealed) return;
    setPicks((cur) => cur.map((p, i) => (i === row ? value : p)));
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">{exercise.prompt}</h2>
      {exercise.figure && <FigureView figure={exercise.figure} />}

      <ul className="space-y-2">
        {left.map((item, row) => {
          const ok = picks[row] === solution[row];
          return (
            <li
              key={row}
              className={`rounded-lg border-2 px-3 py-2.5 transition-colors ${
                revealed
                  ? ok
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="text-sm font-medium text-neutral-800 sm:w-2/5">{item}</span>
                <select
                  value={picks[row]}
                  onChange={(e) => pick(row, Number(e.target.value))}
                  disabled={revealed}
                  className="w-full min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1.5 text-sm text-neutral-800 disabled:opacity-100"
                >
                  <option value={-1}>— choisir —</option>
                  {right.map((option, i) => (
                    <option key={i} value={i}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {revealed && !ok && (
                <p className="mt-1.5 text-xs text-neutral-700">
                  Attendu : <span className="font-semibold">{right[solution[row]]}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!revealed && (
        <button
          type="button"
          onClick={() => onCommit(picks)}
          disabled={!complete}
          className="mt-4 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Valider
        </button>
      )}

      {revealed && (
        <Feedback
          correct={picks.every((v, i) => v === solution[i])}
          diagramSvg={exercise.diagram_svg}
          figure={exercise.feedback_figure}
          explanation={exercise.explanation}
        />
      )}
    </div>
  );
}
