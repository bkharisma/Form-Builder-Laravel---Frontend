import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import { barChartOptions, pieChartOptions, colorPalette, chartColors } from '../config/chartConfig';
import type { ReportDataPoint } from '../types';

export type ChartType = 'bar' | 'horizontalBar' | 'line' | 'pie' | 'doughnut';

interface DynamicChartProps {
  data: ReportDataPoint[];
  chartType: ChartType;
  dataKey: 'date' | 'name';
  loading?: boolean;
  title: string;
  panelId?: string;
}

function DynamicChart({ data, chartType, dataKey, loading, title, panelId }: DynamicChartProps) {
  const labels = data.map((item) => (dataKey === 'date' ? item.date : item.name) || 'Unknown');
  const values = data.map((item) => item.count);

  const isTimeSeries = dataKey === 'date';

  const barDataset = {
    label: 'Submissions',
    data: values,
    backgroundColor: isTimeSeries ? chartColors.primaryOpaque : colorPalette,
    borderColor: isTimeSeries ? chartColors.primary : colorPalette,
    borderWidth: 1,
    borderRadius: 4,
  };

  const lineDataset = {
    label: 'Submissions',
    data: values,
    backgroundColor: chartColors.primaryOpaque,
    borderColor: chartColors.primary,
    borderWidth: 2,
    pointBackgroundColor: chartColors.primary,
    pointRadius: 4,
    tension: 0.4,
    fill: true,
  };

  const pieDataset = {
    data: values,
    backgroundColor: colorPalette,
    borderColor: '#fff',
    borderWidth: 2,
  };

  const horizontalBarOptions = {
    ...barChartOptions,
    indexAxis: 'y' as const,
    plugins: {
      ...barChartOptions.plugins,
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { precision: 0 },
      },
      y: {
        grid: { display: false },
        ticks: { maxRotation: 0 },
      },
    },
  };

  const barOptions = {
    ...barChartOptions,
    plugins: { ...barChartOptions.plugins, legend: { display: false } },
  };

  const lineOptions = {
    ...barChartOptions,
    plugins: { ...barChartOptions.plugins, legend: { display: false } },
  };

  return (
    <ChartCard title={title} loading={loading} isEmpty={data.length === 0}>
      <div className="h-64" data-pdf-chart={panelId}>
        {chartType === 'bar' && (
          <Bar data={{ labels, datasets: [barDataset] }} options={barOptions} />
        )}
        {chartType === 'horizontalBar' && (
          <Bar
            data={{ labels, datasets: [{ ...barDataset, backgroundColor: colorPalette }] }}
            options={horizontalBarOptions}
          />
        )}
        {chartType === 'line' && (
          <Line data={{ labels, datasets: [lineDataset] }} options={lineOptions} />
        )}
        {chartType === 'pie' && (
          <Pie data={{ labels, datasets: [pieDataset] }} options={pieChartOptions} />
        )}
        {chartType === 'doughnut' && (
          <Doughnut data={{ labels, datasets: [pieDataset] }} options={pieChartOptions} />
        )}
      </div>
    </ChartCard>
  );
}

export default DynamicChart;