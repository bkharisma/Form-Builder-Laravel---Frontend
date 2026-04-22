import type { ReactNode } from 'react';

interface TableCardProps {
  title: string;
  loading?: boolean;
  isEmpty?: boolean;
  children: ReactNode;
}

function TableCard({ title, loading, isEmpty, children }: TableCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgba(0,0,0,0.08)]">
        <h3 className="text-sm font-semibold text-[#1a1a1a]">{title}</h3>
      </div>
      {loading ? (
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#f5f5f5] rounded w-3/4" />
            <div className="h-4 bg-[#f5f5f5] rounded w-1/2" />
            <div className="h-4 bg-[#f5f5f5] rounded w-5/6" />
          </div>
        </div>
      ) : isEmpty ? (
        <div className="p-8 sm:p-12 text-center text-[#737373] text-sm">
          No data for selected period
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default TableCard;
