export interface RiskIndicatorProps {
  riskLevel: 'low' | 'medium' | 'high';
  description?: string;
}

export function RiskIndicator({ riskLevel, description }: RiskIndicatorProps) {
  const color = riskLevel === 'high' ? '#dc2626' : riskLevel === 'medium' ? '#f59e0b' : '#16a34a';
  return (
    <div className="flex items-center gap-2 text-sm text-slate-200">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span>{description || riskLevel}</span>
    </div>
  );
}
