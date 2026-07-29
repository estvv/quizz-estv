export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-neutral-500 mb-1.5">
        <span>Question {current + 1}/{total}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
