interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass?: string;
}

function StatCard({ label, value, icon, colorClass = 'text-blue-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] shadow-sm p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-[#737373] font-medium">{label}</p>
        <p className="text-xl sm:text-3xl font-bold text-[#1a1a1a]">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
