import { useState } from 'react';
import { Button } from './index';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (slug: string) => void;
}

function CreateFormModal({ isOpen, onClose, onCreated }: CreateFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const { formConfigService } = await import('../services');
      const form = await formConfigService.createForm({
        title: title.trim(),
        description: description.trim() || undefined,
        fields: [],
      });
      onCreated(form.slug);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to create form. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (creating) return;
    setTitle('');
    setDescription('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-md p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">Create New Form</h2>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-2 text-[#a1a1a1] hover:text-[#525252] hover:bg-[#f0f0f0] rounded-lg transition-colors"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="form-title" className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="form-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Contact Us"
              className="block w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              required
            />
          </div>

          <div>
            <label htmlFor="form-description" className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
              Description <span className="text-[#a1a1a1]">(optional)</span>
            </label>
            <textarea
              id="form-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this form for?"
              rows={3}
              className="block w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 pt-2">
            <Button variant="secondary" onClick={handleClose} disabled={creating}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={creating} disabled={!title.trim()}>
              Create Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateFormModal;