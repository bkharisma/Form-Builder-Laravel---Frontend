import { Bar } from 'react-chartjs-2';
import ChartCard from './ChartCard';
import { barChartOptions, chartColors } from '../config/chartConfig';
import type { ReportDataPoint } from '../types';

interface SubmissionsOverTimeChartProps {
  data: ReportDataPoint[];
  loading?: boolean;
  label?: string;
  title?: string;
}

function SubmissionsOverTimeChart({ data, loading, label = 'Submissions', title = 'Submissions Over Time' }: SubmissionsOverTimeChartProps) {
  const chartData = {
    labels: data.map((item) => item.date),
    datasets: [
      {
        label: label,
        data: data.map((item) => item.count),
        backgroundColor: chartColors.primaryOpaque,
        borderColor: chartColors.primary,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    ...barChartOptions,
    plugins: {
      ...barChartOptions.plugins,
      title: {
        display: false,
      },
    },
  };

  return (
    <ChartCard title={title} loading={loading} isEmpty={data.length === 0}>
      <div className="h-64" data-pdf-chart="submissions-over-time">
        <Bar data={chartData} options={options} />
      </div>
    </ChartCard>
  );
}

export default SubmissionsOverTimeChart;