"use client";

import { CheckinEditor } from '../../components/CheckinEditor';
import { TableFilterSort } from '../../components/TableFilterSort';

const pending = [
  { kr: 'Scrap rate <= 0.8%', owner: 'PE Lead', status: 'Due this week' },
];

export default function CheckinsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-white font-semibold">Weekly Check-ins</h2>
      <CheckinEditor krId="kr_1" current={1.1} forecast={0.95} confidence={0.55} onSubmit={() => {}} />
      <div className="card">
        <div className="text-white mb-2">Pending</div>
        <TableFilterSort columns={[{ key: 'kr', label: 'KR' }, { key: 'owner', label: 'Owner' }, { key: 'status', label: 'Status' }]} data={pending} />
      </div>
    </div>
  );
}
