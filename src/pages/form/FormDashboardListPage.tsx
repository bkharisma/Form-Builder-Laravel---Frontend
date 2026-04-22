import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Pagination, CreateFormModal } from '../../components';
import { formConfigService } from '../../services';
import type { FormListItem, PaginatedResponse } from '../../types';

function DashboardPage() {
  const navigate = useNavigate();
  const [formsData, setFormsData] = useState<PaginatedResponse<FormListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState<string | null>(null);
  const [deleteErrorModal, setDeleteErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });

  const fetchForms = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await formConfigService.getForms(page, 15, search || undefined);
      setFormsData(result);
    } catch {
      setError('Failed to load forms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchForms(1);
  }, [fetchForms]);

  const handleCreateSuccess = (slug: string) => {
    setShowCreateModal(false);
    navigate(`/dashboard/f/${slug}/builder`);
  };

  const requestDelete = (slug: string) => {
    setConfirmDeleteSlug(slug);
  };

  const confirmDeletion = async () => {
    if (!confirmDeleteSlug) return;
    try {
      setDeletingSlug(confirmDeleteSlug);
      await formConfigService.deleteForm(confirmDeleteSlug);
      await fetchForms(formsData?.current_page || 1);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete form. Please try again.';
      setDeleteErrorModal({ isOpen: true, message: msg });
    } finally {
      setDeletingSlug(null);
      setConfirmDeleteSlug(null);
    }
  };

  const handlePageChange = (page: number) => {
    fetchForms(page);
  };

  const handlePerPageChange = (perPage: number) => {
    formConfigService.getForms(1, perPage, search || undefined).then(setFormsData);
  };

  const forms = formsData?.data || [];

  return (
    <>
      <CreateFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreateSuccess}
      />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Forms</h2>
            <p className="text-[#737373]">Manage your created forms and view their dashboards</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <svg className="h-5 w-5 mr-2 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Form
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
            <input
              type="text"
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && (
            <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 sm:px-6 py-3 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-[#737373] mt-4">Loading forms...</p>
            </div>
          ) : forms.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f5f5f5] text-[#525252] font-medium">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Title</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4">Responses</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Created By</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Created</th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
                    {forms.map(form => (
                      <tr key={form.id} className="hover:bg-[#f5f5f5] transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="font-medium text-[#1a1a1a]">{form.title}</div>
                          <div className="text-xs text-[#737373] mt-1">/f/{form.slug}</div>
                          {form.description && (
                            <div className="text-xs text-[#a1a1a1] mt-0.5 line-clamp-1">{form.description}</div>
                          )}
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            form.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : form.status === 'archived'
                                ? 'bg-[#f0f0f0] text-[#525252]'
                                : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {form.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[#525252]">
                          {form.response_count}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[#525252] hidden md:table-cell">
                          {form.created_by?.name || 'Unknown'}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-[#737373] hidden md:table-cell">
                          {new Date(form.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                            <Button variant="secondary" onClick={() => navigate(`/dashboard/f/${form.slug}/submissions`)}>
                              Dashboard
                            </Button>
                            <Button variant="secondary" onClick={() => navigate(`/dashboard/f/${form.slug}/builder`)}>
                              Edit
                            </Button>
                            {form.status === 'published' && (
                              <a
                                href={`/f/${form.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                              >
                                Visit
                              </a>
                            )}
                            <button
                              onClick={() => requestDelete(form.slug)}
                              disabled={deletingSlug === form.slug}
                              className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingSlug === form.slug ? 'Del...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(formsData && formsData.total > 0) && (
                <Pagination
                  currentPage={formsData.current_page}
                  lastPage={formsData.last_page}
                  total={formsData.total}
                  perPage={formsData.per_page}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-[#a1a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-[#1a1a1a]">No forms</h3>
              <p className="mt-1 text-sm text-[#737373]">Get started by creating a new form.</p>
            </div>
          )}
        </div>
      </div>

      {confirmDeleteSlug && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteSlug(null)} />
          <div className="relative bg-white rounded-lg shadow-sm w-full max-w-sm p-6 space-y-4 transform transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">Delete Form</h3>
                <p className="text-sm text-[#737373] mt-1">
                  Are you sure you want to delete this form? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setConfirmDeleteSlug(null)} disabled={deletingSlug !== null}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmDeletion} loading={deletingSlug !== null} className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500/20">
                Delete Form
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteErrorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteErrorModal({ isOpen: false, message: '' })} />
          <div className="relative bg-white rounded-lg shadow-sm w-full max-w-sm p-6 text-center transform transition-all">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-5">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1a1a1a] mb-2">Action Prevented</h3>
            <p className="text-sm sm:text-base text-[#525252] mb-6 font-medium capitalize">{deleteErrorModal.message}</p>
            <Button variant="secondary" onClick={() => setDeleteErrorModal({ isOpen: false, message: '' })} className="w-full">
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default DashboardPage;