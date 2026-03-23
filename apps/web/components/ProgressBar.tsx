export interface ProgressBarProps {
  value: number;
  status: 'onTrack' | 'atRisk' | 'offTrack' | 'on_track' | 'at_risk' | 'off_track';
}

function normalizeValue(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  if (value > 1) {
    return Math.min(100, Math.round(value));
  }
  if (value < 0) {
    return 0;
  }
  return Math.round(value * 100);
}

export function ProgressBar({ value, status }: ProgressBarProps) {
  const percent = normalizeValue(value);
  const normalizedStatus =
    status === 'on_track' ? 'onTrack' : status === 'at_risk' ? 'atRisk' : status === 'off_track' ? 'offTrack' : status;
  const color = normalizedStatus === 'onTrack' ? 'bg-onTrack' : normalizedStatus === 'atRisk' ? 'bg-atRisk' : 'bg-offTrack';

  return (
    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2`} style={{ width: `${percent}%` }} />
    </div>
  );
}
