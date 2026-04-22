interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

function Pagination({ currentPage, lastPage, total, perPage, onPageChange, onPerPageChange }: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 bg-white border-t border-[rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#525252] order-2 sm:order-1">
        <span className="hidden sm:inline">Showing</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-[rgba(0,0,0,0.15)] rounded-lg px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#f0f0f0]"
          aria-label="Rows per page"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span className="hidden sm:inline">of {total} results</span>
        <span className="sm:hidden">{total} total</span>
      </div>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-[rgba(0,0,0,0.08)] rounded-lg hover:bg-[rgba(0,0,0,0.04)] disabled:opacity-40 disabled:cursor-not-allowed text-[#525252]"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
          let page: number;
          if (lastPage <= 5) {
            page = i + 1;
          } else if (currentPage <= 3) {
            page = i + 1;
          } else if (currentPage >= lastPage - 2) {
            page = lastPage - 4 + i;
          } else {
            page = currentPage - 2 + i;
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'border border-[rgba(0,0,0,0.08)] text-[#525252] hover:bg-[rgba(0,0,0,0.04)]'
              }`}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-[rgba(0,0,0,0.08)] rounded-lg hover:bg-[rgba(0,0,0,0.04)] disabled:opacity-40 disabled:cursor-not-allowed text-[#525252]"
          aria-label="Next page"
        >
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;
