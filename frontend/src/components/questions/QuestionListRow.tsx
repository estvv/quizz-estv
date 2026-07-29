import type { QuestionBrief } from '../../types';

interface Props {
  question: QuestionBrief;
  index: number;
  selectable: boolean;
  selected: boolean;
  onToggle: (id: number) => void;
}

export function QuestionListRow({ question, index, selectable, selected, onToggle }: Props) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 border-b border-neutral-100 last:border-b-0 ${
        selectable ? 'cursor-pointer hover:bg-neutral-50' : ''
      }`}
    >
      {selectable && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(question.id)}
          className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
        />
      )}
      <span className="text-xs text-neutral-400 w-6 shrink-0">{index + 1}.</span>
      <span className="text-sm text-neutral-800">{question.question_text}</span>
    </label>
  );
}
