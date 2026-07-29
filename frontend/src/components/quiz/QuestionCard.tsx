import type { Choice, Question } from '../../types';

interface Props {
  question: Question;
  chosen: Choice | null;
  revealed: boolean;
  onAnswer: (choice: Choice) => void;
}

const CHOICES: Choice[] = ['A', 'B', 'C', 'D'];

function choiceText(question: Question, choice: Choice): string {
  return {
    A: question.choice_a,
    B: question.choice_b,
    C: question.choice_c,
    D: question.choice_d,
  }[choice];
}

export function QuestionCard({ question, chosen, revealed, onAnswer }: Props) {
  function buttonClasses(choice: Choice): string {
    if (!revealed) {
      return 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50';
    }
    const isCorrect = choice === question.correct_choice;
    const isChosenWrong = choice === chosen && !isCorrect;

    if (isCorrect) return 'bg-emerald-100 border-emerald-500 text-emerald-800';
    if (isChosenWrong) return 'bg-red-50 border-red-500 text-red-700';
    return 'bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed';
  }

  const isAnswerCorrect = chosen === question.correct_choice;

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-6">{question.question_text}</h2>

      <div className="space-y-3">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            onClick={() => !revealed && onAnswer(choice)}
            disabled={revealed}
            className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border-2 transition-colors ${buttonClasses(choice)}`}
          >
            <span className="w-6 h-6 shrink-0 rounded-full border border-current flex items-center justify-center text-xs font-semibold">
              {choice}
            </span>
            <span className="text-sm">{choiceText(question, choice)}</span>
          </button>
        ))}
      </div>

      {revealed && (
        <div className="mt-4 p-4 rounded-lg border border-neutral-200 bg-neutral-50">
          <p className={`text-sm font-semibold mb-1 ${isAnswerCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
            {isAnswerCorrect ? 'Bonne réponse !' : 'Pas tout à fait...'}
          </p>
          {question.explanation && (
            <p className="text-sm text-neutral-600">{question.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
