import { useState, useEffect } from 'react';
import { profileService } from '../services';
import type { LoginHistoryEntry, PaginatedLoginHistoryResponse } from '../types';
import { Pagination } from '.';

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFullTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function truncateUserAgent(ua: string, maxLength = 40): string {
  if (ua.length <= maxLength) return ua;
  return ua.substring(0, maxLength) + '...';
}

function LoginHistoryTable() {
  const [data, setData] = useState<PaginatedLoginHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const result = await profileService.getLoginHistory(page, perPage);
        setData(result);
      } catch {
        setError('Failed to load login history.');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [page, perPage]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <div className="h-6 bg-[#e5e5e5] rounded w-32 animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 bg-[#e5e5e5] rounded w-32 animate-pulse" />
              <div className="h-4 bg-[#e5e5e5] rounded w-40 animate-pulse flex-1" />
              <div className="h-4 bg-[#e5e5e5] rounded w-24 animate-pulse" />
              <div className="h-6 bg-[#e5e5e5] rounded w-20 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">Login History</h2>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-4">Login History</h2>
        <div className="text-center py-8 text-[#737373]">No login history found.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
        <h2 className="text-xl font-semibold text-[#1a1a1a]">Login History</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[rgba(0,0,0,0.08)]">
          <thead className="bg-[#f5f5f5]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wider">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wider">
                User Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Failure Reason
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[rgba(0,0,0,0.08)]">
            {data.data.map((entry: LoginHistoryEntry) => (
              <tr key={entry.id} className="hover:bg-[#f5f5f5]">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span title={formatFullTimestamp(entry.login_at)} className="text-sm text-[#1a1a1a]">
                    {formatRelativeTime(entry.login_at)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#1a1a1a] font-mono">{entry.ip_address}</span>
                </td>
                <td className="px-6 py-4">
                  <span 
                    title={entry.user_agent} 
                    className="text-sm text-[#525252] cursor-help"
                  >
                    {truncateUserAgent(entry.user_agent)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.success ? (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                      Failed
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.failure_reason ? (
                    <span className="text-sm text-[#525252]">{entry.failure_reason}</span>
                  ) : (
                    <span className="text-sm text-[#a1a1a1]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={data.current_page}
        lastPage={data.last_page}
        total={data.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  );
}

export default LoginHistoryTable;