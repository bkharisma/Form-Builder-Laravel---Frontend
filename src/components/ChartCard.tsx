import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  loading?: boolean;
  isEmpty?: boolean;
  children: ReactNode;
}

function ChartCard({ title, loading, isEmpty, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-sm p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3 sm:mb-4">{title}</h3>
      {loading ? (
        <div className="h-48 sm:h-64 bg-[#f5f5f5] rounded-lg animate-pulse" />
      ) : isEmpty ? (
        <div className="h-48 sm:h-64 flex items-center justify-center text-[#737373] text-sm">
          No data for selected period
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default ChartCard;
