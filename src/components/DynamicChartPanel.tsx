import { useState, useEffect } from 'react';
import DynamicChart from './DynamicChart';
import { dynamicReportService } from '../services';
import { getDefaultChartType, getDataKey } from '../utils/chartTypeMapping';
import type { ChartFieldInfo, ReportDataPoint, DynamicFieldReport } from '../types';

interface DynamicChartPanelProps {
  field: ChartFieldInfo;
  formSlug: string;
  dateFrom?: string;
  dateTo?: string;
  onDataLoaded?: (fieldId: string, report: DynamicFieldReport) => void;
}

function DynamicChartPanel({ field, formSlug, dateFrom, dateTo, onDataLoaded }: DynamicChartPanelProps) {
  const [data, setData] = useState<ReportDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

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
          setLoading(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formSlug, field.id, dateFrom, dateTo]);

  const chartType = getDefaultChartType(field.type);
  const dataKey = getDataKey(field.type);

  return (
    <DynamicChart
      data={data}
      chartType={chartType}
      dataKey={dataKey}
      loading={loading}
      title={field.label}
      panelId={`dynamic-${field.id}`}
    />
  );
}

export default DynamicChartPanel;