import { useState } from 'react';
import type { OrderStepsExercise as OrderStepsExerciseType } from '../../types';
import type { Response } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: OrderStepsExerciseType;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

export function OrderStepsExercise({ exercise, revealed, onCommit }: Props) {
  const { items, solution } = exercise.payload;
  // order[position] = index into `items`
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));

  const correctAt = (pos: number) => order[pos] === solution[pos];

  function move(pos: number, dir: -1 | 1) {
    const next = pos + dir;
    if (revealed || next < 0 || next >= order.length) return;
    setOrder((cur) => {
      const copy = [...cur];
      [copy[pos], copy[next]] = [copy[next], copy[pos]];
      return copy;
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">{exercise.prompt}</h2>

      <ol className="space-y-2">
        {order.map((itemIndex, pos) => (
          <li
            key={itemIndex}
            className={`flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-colors ${
              revealed
                ? correctAt(pos)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-red-500 bg-red-50'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <span className="w-5 shrink-0 text-xs font-semibold text-neutral-400">{pos + 1}</span>
            <span className="flex-1 font-mono text-sm text-neutral-800">{items[itemIndex]}</span>
            {!revealed && (
              <span className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(pos, -1)}
                  disabled={pos === 0}
                  aria-label="Monter"
                  className="px-1.5 leading-none text-neutral-400 hover:text-neutral-800 disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => move(pos, 1)}
                  disabled={pos === order.length - 1}
                  aria-label="Descendre"
                  className="px-1.5 leading-none text-neutral-400 hover:text-neutral-800 disabled:opacity-20"
                >
                  ▼
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>

      {!revealed && (
        <button
          type="button"
          onClick={() => onCommit(order)}
          className="mt-4 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Valider
        </button>
      )}

      {revealed && (
        <Feedback
          correct={order.every((v, i) => v === solution[i])}
          diagramSvg={exercise.diagram_svg}
          explanation={exercise.explanation}
        >
          <p className="mb-1 text-sm font-medium text-neutral-700">Ordre attendu :</p>
          <pre className="overflow-x-auto rounded bg-white p-3 font-mono text-xs text-neutral-800">
            {solution.map((idx) => items[idx]).join('\n')}
          </pre>
        </Feedback>
      )}
    </div>
  );
}
