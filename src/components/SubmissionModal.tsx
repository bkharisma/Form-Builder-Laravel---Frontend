import { useState, useEffect } from 'react';
import type { Submission, SubmissionFormData, FormField } from '../types';
import { TextInput, TextArea, Button, FormError } from '../components';
import { renderFieldValue } from '../utils/submissionFieldRenderer';

interface SubmissionModalProps {
  mode: 'create' | 'view' | 'edit';
  submission?: Submission | null;
  onSubmit: (data: SubmissionFormData) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string;
  formFields?: FormField[];
}

function SubmissionModal({ mode, submission, onSubmit, onClose, loading = false, error, formFields }: SubmissionModalProps) {
  const [formData, setFormData] = useState<SubmissionFormData>({});

  useEffect(() => {
    if (submission && (mode === 'view' || mode === 'edit') && formFields) {
      const initialData: SubmissionFormData = {};
      formFields.forEach((field) => {
        initialData[field.id] = (submission.dynamic_data?.[field.id] as string | boolean | undefined) ?? '';
      });
      setFormData(initialData);
    }
  }, [submission, mode, formFields]);

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.08)] px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            {mode === 'create' && 'Add Submission'}
            {mode === 'view' && 'Submission Details'}
            {mode === 'edit' && 'Edit Submission'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#a1a1a1] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isReadOnly && submission ? (
            <div className="space-y-4">
              {submission.dynamic_data && Object.keys(submission.dynamic_data).length > 0 && formFields ? (
                <>
                  {formFields.map((field) => {
                    const value = submission.dynamic_data?.[field.id];
                    return (
                      <div key={field.id}>
                        <p className="text-sm text-[#737373] font-medium">{field.label}</p>
                        <div className="text-base text-[#1a1a1a] mt-1">
                          {renderFieldValue({ field, value })}
                        </div>
                      </div>
                    );
                  })}
                  <div>
                    <p className="text-sm text-[#737373] font-medium">Submitted At</p>
                    <p className="text-base text-[#1a1a1a]">{new Date(submission.submitted_at).toLocaleString()}</p>
                  </div>
                  {submission.form_config && (
                    <div className="pt-4 border-t border-[rgba(0,0,0,0.08)]">
                      <p className="text-xs text-[#a1a1a1]">
                        Form version: {new Date(submission.form_config.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <p className="text-sm text-[#737373] font-medium">Submitted At</p>
                  <p className="text-base text-[#1a1a1a]">{new Date(submission.submitted_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormError message={error} />

              {formFields && formFields.length > 0 ? (
                formFields.map((field) => (
                  <div key={field.id}>
                    {field.type === 'textarea' ? (
                      <TextArea
                        id={`modal-${field.id}`}
                        label={field.label}
                        value={String(formData[field.id] ?? '')}
                        onChange={(v) => handleChange(field.id, v)}
                        required={field.required}
                        rows={3}
                      />
                    ) : (
                      <TextInput
                        id={`modal-${field.id}`}
                        label={field.label}
                        type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
                        value={String(formData[field.id] ?? '')}
                        onChange={(v) => handleChange(field.id, v)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[#737373] text-center py-4">No form fields configured.</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading} fullWidth>
                  {mode === 'create' ? 'Add Record' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubmissionModal;