import type { Question } from '../../types';

export interface AnsweredQuestion {
  question: Question;
  chosen: string | null;
  correct: boolean;
}

interface Props {
  answers: AnsweredQuestion[];
  onRestart: () => void;
  onHome: () => void;
}

export function ResultsSummary({ answers, onRestart, onHome }: Props) {
  const score = answers.filter((a) => a.correct).length;
  const total = answers.length;

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Score</p>
        <p className="text-4xl font-bold text-neutral-900">{score} / {total}</p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white mb-6 divide-y divide-neutral-100">
        {answers.map((a, i) => (
          <div key={a.question.id} className="px-4 py-3 flex items-start gap-3">
            <span
              className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                a.correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {a.correct ? '✓' : '✗'}
            </span>
            <div>
              <p className="text-sm text-neutral-800">{i + 1}. {a.question.question_text}</p>
              {!a.correct && (
                <p className="text-xs text-neutral-500 mt-0.5">
                  Bonne réponse : {a.question.correct_choice}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          Recommencer
        </button>
        <button
          onClick={onHome}
          className="px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}
