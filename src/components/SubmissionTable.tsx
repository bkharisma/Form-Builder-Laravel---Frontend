import type { Submission, FormField } from '../types';
import { renderTableCellValue } from '../utils/submissionFieldRenderer';

interface SubmissionTableProps {
  submissions: Submission[];
  formFields?: FormField[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (field: string) => void;
  onView: (submission: Submission) => void;
  onEdit: (submission: Submission) => void;
  onDelete: (submission: Submission) => void;
}

function SubmissionTable({ submissions, formFields, sortBy, sortDir, onSort, onView, onEdit, onDelete }: SubmissionTableProps) {
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const hasDynamicData = submissions.some(s => s.dynamic_data && Object.keys(s.dynamic_data).length > 0);
  const columns = formFields && formFields.length > 0 && hasDynamicData
    ? [...formFields.map(f => ({ key: `dynamic_${f.id}`, label: f.label })), { key: 'submitted_at', label: 'Submitted At' }]
    : [{ key: 'submitted_at', label: 'Submitted At' }];

  const getCellValue = (submission: Submission, columnKey: string): string | boolean | number | undefined => {
    if (columnKey.startsWith('dynamic_')) {
      const fieldId = columnKey.replace('dynamic_', '');
      return submission.dynamic_data?.[fieldId] as string | boolean | number | undefined;
    }
    return submission[columnKey as keyof Submission] as string;
  };

  const formatCellValue = (value: string | boolean | number | undefined, field?: FormField): React.ReactNode => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (field) {
      return renderTableCellValue({ field, value });
    }
    return String(value);
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortBy !== columnKey) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <p className="text-[#737373] text-lg font-medium">No submissions found</p>
        <p className="text-[#a1a1a1] text-sm mt-1">Try adjusting your filters or add a new record</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-[#f5f5f5] border-b border-[rgba(0,0,0,0.08)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#525252] uppercase tracking-wider cursor-pointer select-none hover:bg-[#f0f0f0] transition-colors"
                  onClick={() => onSort(col.key)}
                  role="columnheader"
                  aria-sort={sortBy === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="flex items-center">
                    {col.label}
                    <SortIcon columnKey={col.key} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-[#525252] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-[#f5f5f5] transition-colors">
                {columns.map((col) => {
                  const field = col.key.startsWith('dynamic_')
                    ? formFields?.find(f => f.id === col.key.replace('dynamic_', ''))
                    : undefined;
                  return (
                    <td key={col.key} className="px-4 py-3 text-sm text-[#525252]">
                      {col.key === 'submitted_at'
                        ? formatDateTime(submission.submitted_at)
                        : formatCellValue(getCellValue(submission, col.key) as string | boolean | undefined, field)}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(submission)}
                      className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      aria-label={`View submission ${submission.id}`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEdit(submission)}
                      className="px-2 py-1 text-[#525252] hover:bg-[#f0f0f0] rounded transition-colors"
                      aria-label={`Edit submission ${submission.id}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(submission)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label={`Delete submission ${submission.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-[rgba(0,0,0,0.08)]">
        {submissions.map((submission) => {
          const primaryField = formFields?.[0];
          const primaryValue = primaryField && submission.dynamic_data
            ? formatCellValue(submission.dynamic_data[primaryField.id])
            : undefined;
          const secondaryValue = formFields?.[1] && submission.dynamic_data
            ? formatCellValue(submission.dynamic_data[formFields[1].id])
            : undefined;

          return (
            <div key={submission.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">{primaryValue || '-'}</p>
                  <p className="text-sm text-[#737373]">{secondaryValue || '-'}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onView(submission)} className="text-blue-600 text-sm font-medium" aria-label={`View submission ${submission.id}`}>View</button>
                  <button onClick={() => onEdit(submission)} className="text-[#525252] text-sm font-medium" aria-label={`Edit submission ${submission.id}`}>Edit</button>
                  <button onClick={() => onDelete(submission)} className="text-red-600 text-sm font-medium" aria-label={`Delete submission ${submission.id}`}>Del</button>
                </div>
              </div>
              <p className="text-xs text-[#a1a1a1]">{formatDateTime(submission.submitted_at)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SubmissionTable;