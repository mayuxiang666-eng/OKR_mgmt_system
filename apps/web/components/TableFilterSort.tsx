export interface TableFilterSortProps<T> {
  columns: { key: keyof T; label: string }[];
  data: T[];
  onChange?: (filters: Record<string, string>) => void;
}

export function TableFilterSort<T extends Record<string, any>>({ columns, data }: TableFilterSortProps<T>) {
  return (
    <table className="w-full text-sm text-slate-200">
      <thead className="text-slate-400">
        <tr>
          {columns.map((c) => (
            <th key={String(c.key)} className="text-left py-2">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-t border-slate-800">
            {columns.map((c) => (
              <td key={String(c.key)} className="py-2 pr-2">{String(row[c.key])}</td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td className="py-3 text-slate-500" colSpan={columns.length}>
              No data
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
