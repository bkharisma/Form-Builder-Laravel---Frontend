import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif";
ChartJS.defaults.color = '#6b7280';
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

ChartJS.defaults.plugins.legend.display = false;

export const chartColors = {
  primary: 'rgb(59, 130, 246)',
  primaryOpaque: 'rgba(59, 130, 246, 0.8)',
  secondary: 'rgb(99, 102, 241)',
  secondaryOpaque: 'rgba(99, 102, 241, 0.8)',
  accent: 'rgb(168, 85, 247)',
  accentOpaque: 'rgba(168, 85, 247, 0.8)',
  success: 'rgb(34, 197, 94)',
  successOpaque: 'rgba(34, 197, 94, 0.8)',
  warning: 'rgb(234, 179, 8)',
  warningOpaque: 'rgba(234, 179, 8, 0.8)',
  danger: 'rgb(239, 68, 68)',
  dangerOpaque: 'rgba(239, 68, 68, 0.8)',
  info: 'rgb(14, 165, 233)',
  infoOpaque: 'rgba(14, 165, 233, 0.8)',
};

export const colorPalette = [
  chartColors.primaryOpaque,
  chartColors.secondaryOpaque,
  chartColors.accentOpaque,
  chartColors.successOpaque,
  chartColors.warningOpaque,
  chartColors.dangerOpaque,
  chartColors.infoOpaque,
];

export const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        precision: 0,
      },
    },
  },
};

export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
};