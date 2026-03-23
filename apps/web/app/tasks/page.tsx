import { TableFilterSort } from '../../components/TableFilterSort';

const tasks = [
  { title: 'Update SOP', assignee: 'PE Eng', status: 'In progress', due: '2026-03-28' },
  { title: 'Train operators', assignee: 'Trainer', status: 'Not started', due: '2026-04-02' },
];

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-white font-semibold">Tasks</h2>
      <TableFilterSort columns={[{ key: 'title', label: 'Task' }, { key: 'assignee', label: 'Owner' }, { key: 'status', label: 'Status' }, { key: 'due', label: 'Due' }]} data={tasks} />
    </div>
  );
}
