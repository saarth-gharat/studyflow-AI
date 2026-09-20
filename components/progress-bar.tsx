export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-[var(--muted)]">{label}</span>
          <span className="font-medium text-[var(--text)]">{value}%</span>
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-soft)]">
        <div
          className="h-full rounded-full bg-violet-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}