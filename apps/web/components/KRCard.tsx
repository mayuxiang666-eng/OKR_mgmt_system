import { ProgressBar } from './ProgressBar';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface KRCardProps {
  id: string;
  title: string;
  metricType: string;
  target: number;
  current?: number;
  forecast?: number;
  progress: number;
  confidence: number;
  status: 'onTrack' | 'atRisk' | 'offTrack';
}

export function KRCard({ title, metricType, target, current, forecast, progress, confidence, status }: KRCardProps) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">KR ({metricType})</p>
          <h3 className="text-lg text-white">{title}</h3>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Target: {target}</div>
          {current !== undefined && <div>Current: {current}</div>}
          {forecast !== undefined && <div>Forecast: {forecast}</div>}
        </div>
      </div>
      <ProgressBar value={progress} status={status} />
      <ConfidenceBadge value={confidence} />
    </div>
  );
}
