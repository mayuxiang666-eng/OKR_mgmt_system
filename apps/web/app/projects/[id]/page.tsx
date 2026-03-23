import { ProgressBar } from '../../../components/ProgressBar';
import { TableFilterSort } from '../../../components/TableFilterSort';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const tasks = [
    { title: 'Sensor calibration', status: 'In progress', progress: '40%' },
    { title: 'SPC rules online', status: 'Not started', progress: '0%' },
  ];

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-white text-lg">Project {params.id}</div>
        <div className="text-slate-400 text-sm">KR Links: Scrap rate &lt;= 0.8% (weight 0.5)</div>
        <div className="mt-2">
          <ProgressBar value={0.25} status="atRisk" />
        </div>
      </div>
      <TableFilterSort
        columns={[
          { key: 'title', label: 'Task' },
          { key: 'status', label: 'Status' },
          { key: 'progress', label: 'Progress' },
        ]}
        data={tasks}
      />
    </div>
  );
}
