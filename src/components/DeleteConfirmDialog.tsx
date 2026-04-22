import type { Submission } from '../types';
import { Button } from '../components';

interface DeleteConfirmDialogProps {
  submission: Submission;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function DeleteConfirmDialog({ submission, onConfirm, onCancel, loading = false }: DeleteConfirmDialogProps) {
  const primaryValue = submission.dynamic_data
    ? Object.values(submission.dynamic_data)[0]
    : undefined;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)] w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a1a]">Delete Submission</h3>
            <p className="text-sm text-[#525252] mt-1">
              Are you sure you want to delete the record{primaryValue ? <> for <span className="font-medium text-[#1a1a1a]">{String(primaryValue)}</span></> : ''}? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={loading}>
            Delete Record
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmDialog;
