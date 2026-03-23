import { ProgressBar } from './ProgressBar';
import { ConfidenceBadge } from './ConfidenceBadge';

export interface ObjectiveCardProps {
  id: string;
  title: string;
  owner?: string;
  progress: number;
  confidence: number;
  status: 'onTrack' | 'atRisk' | 'offTrack';
  priority?: string;
}

export function ObjectiveCard({ title, owner, progress, confidence, status, priority }: ObjectiveCardProps) {
  return (
    <div className="card space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Objective</p>
          <h3 className="text-lg text-white">{title}</h3>
        </div>
        <span className="text-xs text-slate-400">{priority}</span>
      </div>
      <div className="text-slate-400 text-sm">Owner: {owner || 'TBD'}</div>
      <ProgressBar value={progress} status={status} />
      <ConfidenceBadge value={confidence} />
    </div>
  );
}
