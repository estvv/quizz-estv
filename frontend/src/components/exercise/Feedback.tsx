import type { ReactNode } from 'react';
import type { Figure } from '../../types';
import { Diagram } from '../shared/Diagram';
import { FigureView } from '../diagram/FigureView';

interface Props {
  correct: boolean;
  /** The right answer, spelled out. Shown only when the user got it wrong. */
  correctAnswer?: string;
  diagramSvg: string | null;
  /** JSON figure shown with the explanation (er / diagram / flowchart). */
  figure?: Figure | null;
  explanation: string | null;
  /** Extra content (e.g. a model answer block) rendered before the explanation. */
  children?: ReactNode;
}

// The block that appears once an exercise is answered, shared by every type.
export function Feedback({ correct, correctAnswer, diagramSvg, figure, explanation, children }: Props) {
  return (
    <div className="mt-4 p-4 rounded-lg border border-neutral-200 bg-neutral-50">
      <p className={`text-sm font-semibold mb-1 ${correct ? 'text-emerald-700' : 'text-red-700'}`}>
        {correct ? 'Bonne réponse !' : 'Pas tout à fait...'}
      </p>
      {!correct && correctAnswer && (
        <p className="text-sm text-neutral-700 mb-1">
          Réponse attendue : <span className="font-semibold">{correctAnswer}</span>
        </p>
      )}
      {children}
      {diagramSvg && <Diagram svg={diagramSvg} />}
      {figure && <FigureView figure={figure} />}
      {explanation && <p className="text-sm text-neutral-600 mt-2">{explanation}</p>}
    </div>
  );
}
