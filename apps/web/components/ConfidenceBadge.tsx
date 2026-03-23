export interface ConfidenceBadgeProps {
  value: number; // 0-1
}

export function ConfidenceBadge({ value }: ConfidenceBadgeProps) {
  const label = value >= 0.7 ? 'High' : value >= 0.4 ? 'Medium' : 'Low';
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-800 text-slate-200">
      <span className="h-2 w-2 rounded-full" style={{ background: value >= 0.7 ? '#16a34a' : value >= 0.4 ? '#f59e0b' : '#dc2626' }} />
      Confidence {label} ({Math.round(value * 100)}%)
    </span>
  );
}
