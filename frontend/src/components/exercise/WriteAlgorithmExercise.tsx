import { useState } from 'react';
import type { WriteAlgorithmExercise as WriteAlgorithmExerciseType } from '../../types';
import type { Response } from '../../utils/grade';
import { normalizeCode } from '../../utils/grade';
import { Feedback } from './Feedback';

interface Props {
  exercise: WriteAlgorithmExerciseType;
  revealed: boolean;
  onCommit: (response: Response) => void;
}

export function WriteAlgorithmExercise({ exercise, revealed, onCommit }: Props) {
  const { steps, hint } = exercise.payload;
  const [text, setText] = useState('');

  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '');
  const lineOk = (line: string, i: number) =>
    i < steps.length && steps[i].some((form) => normalizeCode(form) === normalizeCode(line));
  const allOk = lines.length === steps.length && lines.every(lineOk);
  const model = steps.map((forms) => forms[0]).join('\n');

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">{exercise.prompt}</h2>
      <p className="text-sm text-neutral-400 mb-1">
        {hint ?? 'Une instruction par ligne. La casse et les espaces sont ignorés ; l’ordre compte.'}
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={revealed}
        rows={Math.max(6, steps.length + 1)}
        autoFocus
        spellCheck={false}
        placeholder={'START\nINPUT ...\n...\nEND'}
        className={`mt-3 w-full rounded-lg border-2 px-4 py-3 font-mono text-sm outline-none transition-colors ${
          revealed
            ? allOk
              ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
              : 'border-red-500 bg-red-50 text-red-900'
            : 'border-neutral-200 focus:border-neutral-400'
        }`}
      />

      {!revealed && (
        <button
          type="button"
          onClick={() => onCommit(text)}
          disabled={text.trim() === ''}
          className="mt-3 px-5 py-2.5 rounded-lg bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Valider
        </button>
      )}

      {revealed && (
        <Feedback correct={allOk} diagramSvg={exercise.diagram_svg} explanation={exercise.explanation}>
          {!allOk && (
            <p className="mb-1 text-sm text-neutral-700">
              {lines.length !== steps.length
                ? `Attendu : ${steps.length} lignes, tu en as ${lines.length}.`
                : 'Une ou plusieurs lignes ne correspondent pas.'}
            </p>
          )}
          <p className="mb-1 text-sm font-medium text-neutral-700">Corrigé :</p>
          <pre className="overflow-x-auto rounded bg-white p-3 font-mono text-xs text-neutral-800">{model}</pre>
        </Feedback>
      )}
    </div>
  );
}
