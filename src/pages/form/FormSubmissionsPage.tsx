import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Pagination, SubmissionTable, DeleteConfirmDialog, ExportDropdown } from '../../components';
import { submissionService, formConfigService } from '../../services';
import type { Submission, FormConfig, SubmissionStats, SubmissionQueryParams } from '../../types';
import { renderFieldValue } from '../../utils/submissionFieldRenderer';

function FormSubmissionsPage() {
  const { formSlug } = useParams<{ formSlug: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');

  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<Submission | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!formSlug) return;
    try {
      setLoading(true);
      const params: SubmissionQueryParams = {
        form_slug: formSlug,
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_dir: sortDir,
        search: search || undefined,
      };
      const result = await submissionService.getSubmissions(params);
      setSubmissions(result.data);
      setCurrentPage(result.current_page);
      setLastPage(result.last_page);
      setTotal(result.total);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [formSlug, currentPage, perPage, sortBy, sortDir, search]);

  const fetchFormConfig = useCallback(async () => {
    if (!formSlug) return;
    try {
      const config = await formConfigService.getFormBySlug(formSlug);
      setFormConfig(config);
    } catch {
    }
  }, [formSlug]);

  const fetchStats = useCallback(async () => {
    if (!formSlug) return;
    try {
      const s = await submissionService.getStats(formSlug);
      setStats(s);
    } catch {
    }
  }, [formSlug]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchFormConfig();
  }, [fetchFormConfig]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleExportCsv = async () => {
    if (!formSlug) return;
    try {
      setDownloading(true);
      const blob = await submissionService.exportCsv(formSlug);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formSlug}-submissions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV', error);
      alert('Failed to export CSV');
    } finally {
      setDownloading(false);
    }
  };

  const handleExportXlsx = async () => {
    if (!formSlug) return;
    try {
      setDownloading(true);
      const blob = await submissionService.exportXlsx(formSlug);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formSlug}-submissions-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export XLSX', error);
      alert('Failed to export XLSX');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteDialog) return;
    try {
      await submissionService.deleteSubmission(showDeleteDialog.id);
      setShowDeleteDialog(null);
      fetchSubmissions();
      fetchStats();
    } catch {
      alert('Failed to delete submission');
    }
  };

  return (
    <>
      {showDeleteDialog && (
        <DeleteConfirmDialog
          submission={showDeleteDialog}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(null)}
          loading={false}
        />
      )}

      {viewSubmission && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50" onClick={() => setViewSubmission(null)} />
          <div className="relative bg-white rounded-lg shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">Submission Details</h2>
              <button
                onClick={() => setViewSubmission(null)}
                className="text-[#a1a1a1] hover:text-[#525252] transition-colors"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {viewSubmission.dynamic_data && Object.keys(viewSubmission.dynamic_data).length > 0 && formConfig?.fields ? (
                formConfig.fields.map((field) => {
                  const value = viewSubmission.dynamic_data?.[field.id];
                  return (
                    <div key={field.id}>
                      <p className="text-xs sm:text-sm text-[#737373] font-medium">{field.label}</p>
                      <div className="text-sm sm:text-base text-[#1a1a1a] mt-1">
                        {renderFieldValue({ field, value })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[#737373]">No data available.</p>
              )}
              <div>
                <p className="text-xs sm:text-sm text-[#737373] font-medium">Submitted At</p>
                <p className="text-sm sm:text-base text-[#1a1a1a]">{new Date(viewSubmission.submitted_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Submissions</h2>
            <p className="text-[#737373]">Managing form: {formConfig?.title || formSlug}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <ExportDropdown
              onExportCsv={handleExportCsv}
              onExportXlsx={handleExportXlsx}
              loading={downloading}
            />
            <Link to={`/dashboard/f/${formSlug}/builder`}>
              <Button variant="secondary">Go to Builder</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
            <p className="text-xs sm:text-sm text-[#737373] font-medium">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">{stats?.total ?? 0}</p>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
            <p className="text-xs sm:text-sm text-[#737373] font-medium">Today</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">{stats?.today ?? 0}</p>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
            <p className="text-xs sm:text-sm text-[#737373] font-medium">This Week</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">{stats?.this_week ?? 0}</p>
          </div>
          <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
            <p className="text-xs sm:text-sm text-[#737373] font-medium">This Month</p>
            <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">{stats?.this_month ?? 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgba(0,0,0,0.08)]">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search submissions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="flex-1 px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <SubmissionTable
                submissions={submissions}
                formFields={formConfig?.fields}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onView={(s) => setViewSubmission(s)}
                onEdit={(s) => setViewSubmission(s)}
                onDelete={(s) => setShowDeleteDialog(s)}
              />
              {total > 0 && (
                <Pagination
                  currentPage={currentPage}
                  lastPage={lastPage}
                  total={total}
                  perPage={perPage}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default FormSubmissionsPage;