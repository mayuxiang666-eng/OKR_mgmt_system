export interface HeatmapPoint {
  label: string;
  value: number;
}

export interface HeatmapProps {
  data: HeatmapPoint[];
  legend?: string;
}

export function Heatmap({ data, legend }: HeatmapProps) {
  return (
    <div className="card space-y-2">
      <div className="text-white font-medium">{legend || 'Trend'}</div>
      <div className="grid grid-cols-6 gap-1">
        {data.map((pt) => (
          <div key={pt.label} className="h-10 rounded" style={{ background: `rgba(56, 189, 248, ${pt.value})` }} title={`${pt.label}: ${pt.value}`} />
        ))}
      </div>
    </div>
  );
}
