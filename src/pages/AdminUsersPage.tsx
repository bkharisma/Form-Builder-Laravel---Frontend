import { useState, useEffect, useCallback } from 'react';
import { Button, Toast, Pagination, AdminUserModal, AdminUserDeleteDialog, AdminUserBulkModal } from '../components';
import { adminUserService } from '../services';
import type { User, AdminUserFormData } from '../types';

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | undefined>();
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | undefined>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();

  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminUserService.getUsers({ page, per_page: perPage, search: search || undefined });
      setUsers(response.data);
      setTotal(response.total);
      setLastPage(response.last_page);
    } catch {
      setToast({ message: 'Failed to load admin users', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalError(undefined);
    setValidationErrors(undefined);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalError(undefined);
    setValidationErrors(undefined);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setModalError(undefined);
    setValidationErrors(undefined);
  };

  const handleModalSubmit = async (data: AdminUserFormData) => {
    setModalLoading(true);
    setModalError(undefined);
    setValidationErrors(undefined);

    try {
      if (modalMode === 'create') {
        await adminUserService.createUser(data);
        setToast({ message: 'Admin user created successfully', type: 'success' });
      } else if (selectedUser) {
        const updateData: Partial<AdminUserFormData> = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if (data.password) {
          updateData.password = data.password;
          updateData.password_confirmation = data.password_confirmation;
        }
        await adminUserService.updateUser(selectedUser.id, updateData);
        setToast({ message: 'Admin user updated successfully', type: 'success' });
      }
      closeModal();
      fetchUsers();
    } catch (err: unknown) {
      const apiError = err as { message?: string; errors?: Record<string, string[]> };
      if (apiError.errors) {
        setValidationErrors(apiError.errors);
      } else {
        setModalError(apiError.message || 'Failed to save user');
      }
    } finally {
      setModalLoading(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteError(undefined);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    setDeleteError(undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    setDeleteError(undefined);

    try {
      await adminUserService.deleteUser(userToDelete.id);
      setToast({ message: 'Admin user deleted successfully', type: 'success' });
      closeDeleteDialog();
      fetchUsers();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setDeleteError(apiError.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openBulkModal = () => setBulkModalOpen(true);
  const closeBulkModal = () => setBulkModalOpen(false);

  const handleDownloadTemplate = async () => {
    try {
      await adminUserService.downloadTemplate();
    } catch {
      setToast({ message: 'Failed to download template', type: 'error' });
    }
  };

  const handleBulkUpload = async (file: File) => {
    setBulkLoading(true);
    try {
      const resp = await adminUserService.bulkUploadUsers(file);
      if (resp.errors && resp.errors.length > 0) {
        setToast({ message: `${resp.message} Check console for errors.`, type: 'info' });
        console.error('Bulk upload errors:', resp.errors);
      } else {
        setToast({ message: resp.message, type: 'success' });
      }
      closeBulkModal();
      fetchUsers();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setToast({ message: apiError.message || 'Failed to bulk upload', type: 'error' });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Admin Users</h2>
            <p className="text-sm sm:text-base text-[#737373]">Manage administrator accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={openBulkModal}>
              <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Bulk Import
            </Button>
            <Button variant="primary" onClick={openCreateModal}>
              <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add User
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <div className="mb-3 sm:mb-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#a1a1a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 sm:space-y-4 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 sm:h-12 bg-[#e5e5e5] rounded" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[#a1a1a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-[#737373]">No admin users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(0,0,0,0.08)]">
                      <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#737373] uppercase tracking-wider">Name</th>
                      <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#737373] uppercase tracking-wider">Email</th>
                      <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#737373] uppercase tracking-wider">2FA</th>
                      <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#737373] uppercase tracking-wider">Role</th>
                      <th className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#737373] uppercase tracking-wider hidden md:table-cell">Created</th>
                      <th className="text-right py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#737373] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#f5f5f5]">
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-[#1a1a1a] font-medium">{user.name}</td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-[#525252]">{user.email}</td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">
                          {user.two_factor_enabled ? (
                            <span className="inline-flex px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-[#f0f0f0] text-[#1a1a1a]">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[#1a1a1a] capitalize">
                          {user.role || 'Admin'}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-[#525252] hidden md:table-cell">{user.created_at ? formatDate(user.created_at) : '-'}</td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-right space-x-1 sm:space-x-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm px-1.5 sm:px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteDialog(user)}
                            className="text-red-600 hover:text-red-700 font-medium text-xs sm:text-sm px-1.5 sm:px-2 py-1 rounded hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[rgba(0,0,0,0.08)] sm:hidden">
                {users.map((user) => (
                  <div key={user.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user.name}</p>
                        <p className="text-xs text-[#525252] truncate">{user.email}</p>
                      </div>
                      {user.two_factor_enabled ? (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800 flex-shrink-0 ml-2">
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#f0f0f0] text-[#1a1a1a] flex-shrink-0 ml-2">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {user.role || 'Admin'}
                      </span>
                    </div>
                    {user.created_at && (
                      <p className="text-xs text-[#737373]">Created: {formatDate(user.created_at)}</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteDialog(user)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-error-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {lastPage > 1 && (
            <div className="mt-3 sm:mt-4">
              <Pagination
                currentPage={page}
                lastPage={lastPage}
                total={total}
                perPage={perPage}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
              />
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <AdminUserModal
          mode={modalMode}
          user={selectedUser}
          onSubmit={handleModalSubmit}
          onClose={closeModal}
          loading={modalLoading}
          error={modalError}
          validationErrors={validationErrors}
        />
      )}

      {deleteDialogOpen && userToDelete && (
        <AdminUserDeleteDialog
          user={userToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={closeDeleteDialog}
          loading={deleteLoading}
          errorMessage={deleteError}
        />
      )}

      {bulkModalOpen && (
        <AdminUserBulkModal
          onClose={closeBulkModal}
          onUpload={handleBulkUpload}
          onDownloadTemplate={handleDownloadTemplate}
          loading={bulkLoading}
        />
      )}
    </>
  );
}

export default AdminUsersPage;