import { useState } from 'react';
import type { VocabExercise as VocabExerciseType } from '../../types';
import type { Response } from '../../utils/grade';
import { matchesAccept } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: VocabExerciseType;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

// The vocab card: the hangeul on top, the French meaning (graded) and the
// romanisation (optional bonus, never scored but always spelled out). An
// "Indice" button reveals the four options so a stuck learner has a fallback.
export function VocabExercise({ exercise, revealed, onCommit }: Props) {
  const { ko, rr, rr_accept, fr, hint } = exercise.payload;
  const [sens, setSens] = useState('');
  const [prononciation, setPrononciation] = useState('');
  const [showHint, setShowHint] = useState(false);

  const sensOk = revealed && matchesAccept(fr, sens, 'loose');
  const romajaAccept = [rr, ...(rr_accept ?? [])];
  const romajaFilled = prononciation.trim() !== '';
  const romajaOk = revealed && matchesAccept(romajaAccept, prononciation, 'romaja');

  function fieldClasses(ok: boolean, filled: boolean): string {
    if (!revealed) return 'border-neutral-200 focus:border-neutral-400';
    if (ok) return 'border-emerald-500 bg-emerald-50 text-emerald-800';
    if (filled) return 'border-red-500 bg-red-50 text-red-700';
    return 'border-neutral-200 bg-neutral-50 text-neutral-500';
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!revealed && sens.trim() !== '') onCommit({ sens, prononciation });
      }}
    >
      <p className="text-6xl font-semibold text-neutral-900 text-center my-6">{ko}</p>

      <label className="block text-sm font-medium text-neutral-600 mb-1">Sens (français)</label>
      <input
        type="text"
        value={sens}
        onChange={(e) => setSens(e.target.value)}
        disabled={revealed}
        autoFocus
        autoComplete="off"
        spellCheck={false}
        placeholder="en français"
        className={`w-full px-4 py-3 rounded-lg border-2 text-sm outline-none transition-colors ${fieldClasses(sensOk, true)}`}
      />

      <label className="block text-sm font-medium text-neutral-600 mt-4 mb-1">
        Prononciation <span className="text-neutral-400 font-normal">(optionnel)</span>
      </label>
      <input
        type="text"
        value={prononciation}
        onChange={(e) => setPrononciation(e.target.value)}
        disabled={revealed}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="romanisation"
        className={`w-full px-4 py-3 rounded-lg border-2 text-sm outline-none transition-colors ${fieldClasses(romajaOk, romajaFilled)}`}
      />

      {!revealed && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={sens.trim() === ''}
            className="px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Valider
          </button>
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="text-sm text-neutral-500 hover:text-neutral-800 underline underline-offset-2"
          >
            Indice
          </button>
        </div>
      )}

      {!revealed && showHint && (
        <div className="mt-3 flex flex-wrap gap-2">
          {hint.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSens(option)}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 hover:border-neutral-400 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {revealed && (
        <Feedback
          correct={sensOk}
          correctAnswer={sensOk ? undefined : fr[0]}
          diagramSvg={exercise.diagram_svg}
          explanation={
            romajaOk
              ? `Prononciation : ${rr}  bien joué, garde ce réflexe.`
              : romajaFilled
                ? `Prononciation : ${rr} (tu avais mis « ${prononciation.trim()} »).`
                : `Prononciation : ${rr}  essaie de la donner à chaque fois.`
          }
        />
      )}
    </form>
  );
}
