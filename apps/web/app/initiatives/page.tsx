import Link from 'next/link';
import { TableFilterSort } from '../../components/TableFilterSort';

const data = [
  { name: 'Reflow closed-loop', progress: '30%', health: 'On Track', id: 'proj_1' },
];

export default function InitiativesPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-white font-semibold">Initiatives & Projects</h2>
      <TableFilterSort columns={[{ key: 'name', label: 'Name' }, { key: 'progress', label: 'Progress' }, { key: 'health', label: 'Health' }]} data={data} />
      <div className="text-sm text-slate-300">
        {data.map((row) => (
          <div key={row.id} className="mt-2">
            <Link className="text-sky-300" href={`/projects/${row.id}`}>{row.name}</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
