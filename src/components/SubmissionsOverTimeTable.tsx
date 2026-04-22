import TableCard from './TableCard';
import type { ReportDataPoint } from '../types';

interface SubmissionsOverTimeTableProps {
  data: ReportDataPoint[];
  loading?: boolean;
}

function SubmissionsOverTimeTable({ data, loading }: SubmissionsOverTimeTableProps) {
  if (loading || data.length === 0) {
    return (
      <TableCard title="Submissions Over Time" loading={loading} isEmpty={data.length === 0}>
        {null}
      </TableCard>
    );
  }

  return (
    <TableCard title="Submissions Over Time" loading={false} isEmpty={false}>
      <div className="overflow-x-auto">
        <table className="w-full" data-pdf-table="submissions-over-time">
          <thead className="bg-[#f5f5f5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#525252] uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-[#525252] uppercase tracking-wider">
                Submissions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-[#f5f5f5] transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#1a1a1a]">
                  {item.date || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-[#525252] text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}

export default SubmissionsOverTimeTable;