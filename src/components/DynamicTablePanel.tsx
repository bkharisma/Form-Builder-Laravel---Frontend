import { useState, useEffect } from 'react';
import TableCard from './TableCard';
import { dynamicReportService } from '../services';
import type { ChartFieldInfo, ReportDataPoint, DynamicFieldReport } from '../types';

interface DynamicTablePanelProps {
  field: ChartFieldInfo;
  formSlug: string;
  dateFrom?: string;
  dateTo?: string;
  onDataLoaded?: (fieldId: string, report: DynamicFieldReport) => void;
}

function DynamicTablePanel({ field, formSlug, dateFrom, dateTo, onDataLoaded }: DynamicTablePanelProps) {
  const [data, setData] = useState<ReportDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    dynamicReportService
      .getFieldReport(formSlug, field.id, dateFrom, dateTo)
      .then((report) => {
        if (!cancelled) {
          setData(report.data);
          if (onDataLoaded) {
            onDataLoaded(field.id, { field, data: report.data });
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load report data.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formSlug, field.id, dateFrom, dateTo]);

  const isDateField = field.type === 'date';
  const valueLabel = isDateField ? 'Date' : 'Value';

  return (
    <DynamicTablePanelInner
      title={field.label}
      loading={loading}
      data={data}
      valueLabel={valueLabel}
      error={error}
      dataAttr={`dynamic-table-${field.id}`}
    />
  );
}

function DynamicTablePanelInner({
  title,
  loading,
  data,
  valueLabel,
  error,
  dataAttr,
}: {
  title: string;
  loading: boolean;
  data: ReportDataPoint[];
  valueLabel: string;
  error: string | null;
  dataAttr: string;
}) {
  if (error) {
    return (
      <TableCard title={title} loading={false} isEmpty={false}>
        <div className="p-6 text-center text-red-500 text-sm">{error}</div>
      </TableCard>
    );
  }

  if (loading || data.length === 0) {
    return (
      <TableCard title={title} loading={loading} isEmpty={data.length === 0 && !loading}>
        {null}
      </TableCard>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <TableCard title={title} loading={false} isEmpty={false}>
      <div className="overflow-x-auto">
        <table className="w-full" data-pdf-table={dataAttr}>
          <thead className="bg-[#f5f5f5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#525252] uppercase tracking-wider">
                {valueLabel}
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-[#525252] uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-[#525252] uppercase tracking-wider">
                %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
            {data.map((item, index) => {
              const label = item.date || item.name || 'Unknown';
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) + '%' : '0%';
              return (
                <tr key={index} className="hover:bg-[rgba(0,0,0,0.02)] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[#1a1a1a]">
                    {label}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#525252] text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                      {item.count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#525252] text-right">
                    {pct}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-[#f5f5f5]">
            <tr>
              <td className="px-6 py-3 text-sm font-semibold text-[#1a1a1a]">Total</td>
              <td className="px-6 py-3 text-sm font-semibold text-[#1a1a1a] text-right">{total}</td>
              <td className="px-6 py-3 text-sm font-semibold text-[#1a1a1a] text-right">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </TableCard>
  );
}

export default DynamicTablePanel;