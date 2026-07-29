import { useState } from 'react';
import type { Choice, Question } from '../../types';
import type { QuestionInput } from '../../utils/api';

interface Props {
  categoryId: number;
  initial?: Question;
  onSubmit: (input: QuestionInput) => Promise<void>;
  onCancel: () => void;
}

const CHOICE_FIELDS: { key: 'choice_a' | 'choice_b' | 'choice_c' | 'choice_d'; letter: Choice }[] = [
  { key: 'choice_a', letter: 'A' },
  { key: 'choice_b', letter: 'B' },
  { key: 'choice_c', letter: 'C' },
  { key: 'choice_d', letter: 'D' },
];

export function QuestionForm({ categoryId, initial, onSubmit, onCancel }: Props) {
  const [questionText, setQuestionText] = useState(initial?.question_text ?? '');
  const [choices, setChoices] = useState({
    choice_a: initial?.choice_a ?? '',
    choice_b: initial?.choice_b ?? '',
    choice_c: initial?.choice_c ?? '',
    choice_d: initial?.choice_d ?? '',
  });
  const [correctChoice, setCorrectChoice] = useState<Choice>(initial?.correct_choice ?? 'A');
  const [explanation, setExplanation] = useState(initial?.explanation ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isValid = questionText.trim() && Object.values(choices).every((c) => c.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        category_id: categoryId,
        question_text: questionText.trim(),
        choice_a: choices.choice_a.trim(),
        choice_b: choices.choice_b.trim(),
        choice_c: choices.choice_c.trim(),
        choice_d: choices.choice_d.trim(),
        correct_choice: correctChoice,
        explanation: explanation.trim() || null,
      });
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Question</label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={2}
          className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        {CHOICE_FIELDS.map(({ key, letter }) => (
          <div key={key} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrectChoice(letter)}
              title="Marquer comme bonne réponse"
              className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-colors ${
                correctChoice === letter
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-neutral-300 text-neutral-400 hover:border-neutral-400'
              }`}
            >
              {letter}
            </button>
            <input
              value={choices[key]}
              onChange={(e) => setChoices((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={`Choix ${letter}`}
              className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-400">Clique sur une lettre pour la marquer comme bonne réponse.</p>

      <div>
        <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Explication (optionnel)
        </label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          placeholder="Affichée après la réponse : explication, exemple, précision..."
          className="mt-1 w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-neutral-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !isValid}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-white transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
