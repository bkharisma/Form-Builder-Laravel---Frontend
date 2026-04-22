import type { User } from '../types';
import { Button } from '../components';

interface AdminUserDeleteDialogProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  errorMessage?: string;
}

function AdminUserDeleteDialog({ user, onConfirm, onCancel, loading = false, errorMessage }: AdminUserDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-md p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a]">Delete Admin User</h3>
            <p className="text-xs sm:text-sm text-[#737373] mt-1">
              Are you sure you want to delete <span className="font-semibold text-[#374151]">{user.name}</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-2 sm:gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading} className="flex-1 sm:flex-none">
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AdminUserDeleteDialog;