import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formConfigService } from '../../services';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import type { FormField, FormConfig } from '../../types';
import { Button, Toast } from '../../components';
import FieldList from '../../components/admin/form-builder/FieldList';
import FieldEditor from '../../components/admin/form-builder/FieldEditor';

function FormBuilderPage() {
  const { formSlug } = useParams<{ formSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [confirmDeleteFieldId, setConfirmDeleteFieldId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    fields,
    isDirty,
    addField,
    updateField,
    deleteField,
    duplicateField,
    toggleFieldEnabled,
    reorderFields,
    resetFields,
    markSaved,
  } = useFormBuilder(config);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchConfig = useCallback(async () => {
    if (!formSlug) return;
    try {
      setLoading(true);
      const data = await formConfigService.getFormBySlug(formSlug);
      setConfig(data);
      resetFields(data);
    } catch (err) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        showToast('Failed to load form configuration', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [formSlug, resetFields, showToast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleAddField = () => {
    setEditingField(null);
    setShowEditor(true);
  };

  const handleEditField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (field) {
      setEditingField(field);
      setShowEditor(true);
    }
  };

  const handleSaveField = (fieldData: Omit<FormField, 'id' | 'order'>) => {
    if (editingField) {
      updateField(editingField.id, fieldData);
    } else {
      addField(fieldData);
    }
    setShowEditor(false);
    setEditingField(null);
  };

  const handleSaveConfig = async () => {
    if (!formSlug) return;

    const uniqueCount = fields.filter(f => f.is_unique).length;
    if (uniqueCount > 1) {
      showToast('Only one field can be marked as unique per form.', 'error');
      return;
    }

    try {
      setSaving(true);
      const data = { 
        fields,
      };
      const updated = await formConfigService.updateForm(formSlug, data);
      setConfig(updated);
      markSaved();
      showToast('Form configuration saved successfully');
    } catch (err) {
      const error = err as { message?: string };
      showToast(error.message || 'Failed to save form configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!formSlug || !config) return;
    const newStatus = config.status === 'published' ? 'draft' : 'published';
    try {
      setSaving(true);
      const updated = await formConfigService.updateForm(formSlug, { status: newStatus });
      setConfig(updated);
      showToast(newStatus === 'published' ? 'Form published successfully' : 'Form unpublished');
    } catch {
      showToast('Failed to update form status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteField = (id: string) => {
    setConfirmDeleteFieldId(id);
  };

  const confirmFieldDeletion = () => {
    if (confirmDeleteFieldId) {
      deleteField(confirmDeleteFieldId);
      setConfirmDeleteFieldId(null);
    }
  };

  if (notFound) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-[#a1a1a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-[#1a1a1a]">Form Not Found</h3>
        <p className="mt-1 text-sm text-[#737373]">The form you are looking for does not exist.</p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">Form Builder</h2>
            <p className="text-[#737373]">Design your submission form: {config?.title || formSlug}</p>
          </div>
          <div className="flex items-center gap-3">
            {config && (
              <Button
                variant={config.status === 'published' ? 'secondary' : 'primary'}
                onClick={handleTogglePublish}
                loading={saving}
                disabled={saving}
              >
                {config.status === 'published' ? (
                  <>
                    <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    Unpublish
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Publish
                  </>
                )}
              </Button>
            )}
            {isDirty && (
              <span className="text-sm text-yellow-600">Unsaved changes</span>
            )}
            <Button variant="secondary" onClick={() => window.open(`/f/${formSlug}`, '_blank')}>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preview
            </Button>
            <Button variant="primary" onClick={handleSaveConfig} loading={saving} disabled={!isDirty}>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Save
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-[rgba(0,0,0,0.08)] px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#1a1a1a]">Form Fields</h3>
              <Button variant="secondary" onClick={handleAddField}>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Field
              </Button>
            </div>
            <p className="mt-1 text-sm text-[#737373]">
              Drag and drop to reorder fields. Click edit to modify field properties.
            </p>
          </div>

          <div className="p-6">
            <FieldList
              fields={fields}
              onReorder={reorderFields}
              onEdit={handleEditField}
              onDuplicate={duplicateField}
              onToggleEnabled={toggleFieldEnabled}
              onDelete={handleDeleteField}
            />
          </div>
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow-sm max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">
                {editingField ? 'Edit Field' : 'Add New Field'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingField(null);
                }}
                className="p-2 text-[#a1a1a1] hover:text-[#525252] hover:bg-[#f0f0f0] rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <FieldEditor
                field={editingField}
                availableFields={fields.filter((f) => f.id !== editingField?.id)}
                onSave={handleSaveField}
                onCancel={() => {
                  setShowEditor(false);
                  setEditingField(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {confirmDeleteFieldId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDeleteFieldId(null)} />
          <div className="relative bg-white rounded-lg shadow-sm w-full max-w-sm p-6 space-y-4 transform transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">Delete Field</h3>
                <p className="text-sm text-[#737373] mt-1">
                  Are you sure you want to delete this field? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setConfirmDeleteFieldId(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmFieldDeletion} className="!bg-red-600 hover:!bg-red-700 focus:!ring-red-500/20">
                Delete Field
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FormBuilderPage;