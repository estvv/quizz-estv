import { useState } from 'react';
import type { McqExercise as McqExerciseType } from '../../types';
import type { Response } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: McqExerciseType;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function McqExercise({ exercise, revealed, onCommit }: Props) {
  const { choices, correct, hint } = exercise.payload;
  const [picked, setPicked] = useState<number | null>(null);

  function pick(index: number) {
    if (revealed) return;
    setPicked(index);
    onCommit(index);
  }

  function buttonClasses(index: number): string {
    if (!revealed) {
      return 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50';
    }
    if (index === correct) return 'bg-emerald-100 border-emerald-500 text-emerald-800';
    if (index === picked) return 'bg-red-50 border-red-500 text-red-700';
    return 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed';
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">{exercise.prompt}</h2>
      {hint && <p className="text-sm text-neutral-400 mb-4">{hint}</p>}

      <div className="space-y-3 mt-4">
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => pick(index)}
            disabled={revealed}
            className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border-2 transition-colors ${buttonClasses(index)}`}
          >
            <span className="w-6 h-6 shrink-0 rounded-full border border-current flex items-center justify-center text-xs font-semibold">
              {LABELS[index] ?? index + 1}
            </span>
            <span className="text-sm">{choice}</span>
          </button>
        ))}
      </div>

      {revealed && (
        <Feedback
          correct={picked === correct}
          diagramSvg={exercise.diagram_svg}
          explanation={exercise.explanation}
        />
      )}
    </div>
  );
}
