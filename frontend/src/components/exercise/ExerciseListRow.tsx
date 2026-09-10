import type { ExerciseBrief, ExerciseType } from '../../types';

interface Props {
  exercise: ExerciseBrief;
  index: number;
  selectable: boolean;
  selected: boolean;
  onToggle: (id: number) => void;
}

const TYPE_LABEL: Record<ExerciseType, string> = {
  mcq: 'QCM',
  type_answer: 'Saisie',
  vocab: 'Mot',
  order_steps: 'Ordre',
  write_algorithm: 'Algo',
  flowchart_build: 'Flowchart',
  er_build: 'Diagramme E-R',
};

export function ExerciseListRow({ exercise, index, selectable, selected, onToggle }: Props) {
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
          onChange={() => onToggle(exercise.id)}
          className="w-4 h-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
        />
      )}
      <span className="text-xs text-neutral-400 w-6 shrink-0">{index + 1}.</span>
      <span className="text-sm text-neutral-800 flex-1">{exercise.prompt}</span>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5">
        {TYPE_LABEL[exercise.type]}
      </span>
    </label>
  );
}
