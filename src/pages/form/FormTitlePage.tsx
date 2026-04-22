import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formConfigService } from '../../services';
import { Button, Toast } from '../../components';

function FormTitlePage() {
  const { formSlug } = useParams<{ formSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (!formSlug) return;
    (async () => {
      try {
        setLoading(true);
        const config = await formConfigService.getFormBySlug(formSlug);
        setTitle(config.title);
        setDescription(config.description || '');
      } catch {
        showToast('Failed to load form details', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [formSlug]);

  const handleSave = async () => {
    if (!formSlug || !title.trim()) return;
    try {
      setSaving(true);
      await formConfigService.updateForm(formSlug, {
        title: title.trim(),
        description: description.trim(),
      });
      showToast('Form details updated successfully');
    } catch (err) {
      const error = err as { message?: string };
      showToast(error.message || 'Failed to update form details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/dashboard/f/${formSlug}/builder`)}
            className="p-2 text-[#525252] hover:bg-[#f0f0f0] rounded-lg transition-colors"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Form Details</h2>
            <p className="text-[#737373]">Edit your form title and description</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 sm:py-4">
            <h3 className="text-lg font-medium text-[#1a1a1a]">Edit Form Details</h3>
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="form-title-input" className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
                Form Title <span className="text-red-500">*</span>
              </label>
              <input
                id="form-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter form title"
                className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="form-description-input" className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
                Description <span className="text-[#a1a1a1]">(optional)</span>
              </label>
              <textarea
                id="form-description-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this form is for"
                rows={4}
                className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-none"
              />
              <p className="text-xs text-[#737373] mt-1">
                This description helps users understand the purpose of your form.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-[rgba(0,0,0,0.08)] bg-[#f5f5f5]">
            <Button variant="secondary" onClick={() => navigate(`/dashboard/f/${formSlug}/builder`)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!title.trim()} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default FormTitlePage;