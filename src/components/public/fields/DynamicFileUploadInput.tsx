import { useState, useRef } from 'react';
import type { FormField } from '../../../types';
import { uploadService } from '../../../services';

interface DynamicFileUploadInputProps {
  field: FormField;
  value: string;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string, value: string) => void;
  formSlug?: string;
}

const DEFAULT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx', 'odt', 'ods', 'rtf'];

function DynamicFileUploadInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  formSlug,
}: DynamicFileUploadInputProps) {
  const hasError = touched && !!error;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = field.validation?.allowed_extensions ?? DEFAULT_EXTENSIONS;
  const maxFileSize = field.validation?.max_file_size ?? 10240;
  const acceptString = allowedExtensions.map((ext) => `.${ext}`).join(',');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    if (file.size > maxFileSize * 1024) {
      setUploadError(`File size exceeds the maximum limit of ${maxFileSize} KB`);
      return;
    }

    setUploading(true);
    try {
      const response = await uploadService.uploadFile(file, field.id, formSlug);
      onChange(field.id, String(response.id));
      setFileName(response.original_name);
    } catch {
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(field.id, '');
    setFileName(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-base font-semibold text-[#374151]">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {value ? (
        <div className="flex items-center gap-3 px-4 py-3 border-2 border-[rgba(0,0,0,0.15)] rounded-lg bg-[#f5f5f5]">
          <svg className="w-5 h-5 text-[#737373] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm text-[#374151] truncate flex-1">{fileName || 'File uploaded'}</span>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            hasError ? 'border-red-400 bg-red-50' : 'border-[rgba(0,0,0,0.15)] hover:border-blue-400'
          }`}
        >
          <svg className="mx-auto h-12 w-12 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3" />
          </svg>
          <p className="mt-2 text-sm text-[#525252]">
            {uploading ? 'Uploading...' : 'Drag and drop a file, or'}
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptString}
            onChange={handleFileSelect}
            onBlur={() => onBlur(field.id, value)}
            className="hidden"
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-[#a1a1a1]">
            Accepted: {allowedExtensions.join(', ').toUpperCase()} (max {maxFileSize} KB)
          </p>
        </div>
      )}
      {field.help_text && !uploadError && (
        <p className="text-sm text-[#737373] mt-1">{field.help_text}</p>
      )}
      {uploadError && (
        <p className="text-red-600 text-sm" role="alert">{uploadError}</p>
      )}
      {hasError && (
        <p className="text-red-600 text-sm" role="alert">{error}</p>
      )}
    </div>
  );
}

export default DynamicFileUploadInput;
