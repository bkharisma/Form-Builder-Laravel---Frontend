interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

function DateRangeFilter({ dateFrom, dateTo, onDateFromChange, onDateToChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <div className="flex-1">
        <label htmlFor="date-from" className="sr-only">From date</label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-[rgba(0,0,0,0.25)] bg-[#f0f0f0]"
          aria-label="From date"
        />
      </div>
      <span className="text-[#737373] text-sm font-medium">to</span>
      <div className="flex-1">
        <label htmlFor="date-to" className="sr-only">To date</label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-[rgba(0,0,0,0.25)] bg-[#f0f0f0]"
          aria-label="To date"
        />
      </div>
    </div>
  );
}

export default DateRangeFilter;
