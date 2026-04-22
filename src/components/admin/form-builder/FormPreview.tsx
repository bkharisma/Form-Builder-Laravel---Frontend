import type { FormField, SelectOption } from '../../../types';

interface FormPreviewProps {
  fields: FormField[];
  isOpen: boolean;
  onClose: () => void;
}

function FormPreview({ fields, isOpen, onClose }: FormPreviewProps) {
  if (!isOpen) return null;

  const enabledFields = fields.filter((f) => f.enabled);

  const renderField = (field: FormField) => {
    const baseClasses = "w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#f5f5f5] text-[#737373] text-sm sm:text-base";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className={`${baseClasses} min-h-[60px] sm:min-h-[80px]`}
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'select':
        return (
          <select className={baseClasses} disabled>
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((opt: SelectOption) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.id}
              className="h-4 w-4 text-blue-600 border-[rgba(0,0,0,0.15)] rounded"
              disabled
            />
            <span className="text-sm text-[#737373]">{field.label}</span>
          </div>
        );
      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-[rgba(0,0,0,0.15)] rounded-md p-6 text-center bg-[#f5f5f5]">
            <svg className="mx-auto h-8 w-8 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
            </svg>
            <p className="mt-1 text-xs text-[#a1a1a1]">Upload files</p>
          </div>
        );
      case 'image_upload':
        return (
          <div className="border-2 border-dashed border-[rgba(0,0,0,0.15)] rounded-md p-6 text-center bg-[#f5f5f5]">
            <svg className="mx-auto h-8 w-8 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1 text-xs text-[#a1a1a1]">Upload images</p>
          </div>
        );
      case 'signature':
        return (
          <div className="border-2 border-[rgba(0,0,0,0.15)] rounded-md p-6 text-center bg-[#f5f5f5]">
            <p className="text-sm text-[#a1a1a1] italic">Sign here</p>
          </div>
        );
      case 'radio':
        return (
          <div className={field.layout_direction === 'horizontal' ? 'flex flex-wrap gap-3' : 'space-y-2'}>
            {field.options?.map((opt: SelectOption) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm text-[#737373]">
                <input type="radio" name={field.id} disabled className="h-4 w-4 text-blue-600 border-[rgba(0,0,0,0.15)]" />
                {opt.label}
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            className={baseClasses}
            placeholder={field.placeholder}
            disabled
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">Form Preview</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#a1a1a1] hover:text-[#1a1a1a] hover:bg-[rgba(0,0,0,0.04)] rounded-lg transition-colors"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {enabledFields.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-[#737373]">No enabled fields to preview</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-[#737373] mb-3 sm:mb-4">
                This is a preview of how the form will appear to respondents. Fields are displayed in read-only mode.
              </p>
              {enabledFields.map((field) => (
                <div key={field.id}>
                  {field.type !== 'checkbox' && (
                    <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                  {field.help_text && (
                    <p className="mt-1 text-xs sm:text-sm text-[#737373]">{field.help_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-[#f5f5f5]">
          <button
            onClick={onClose}
            className="w-full px-3 sm:px-4 py-2 bg-[#e5e5e5] text-[#374151] font-medium rounded-md hover:bg-[#d4d4d4] focus:outline-none focus:ring-2 focus:ring-[#737373] focus:ring-offset-2 text-sm sm:text-base"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormPreview;