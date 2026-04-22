import { useState, useRef, useEffect } from 'react';
import type { FormField } from '../../../types';
import { uploadService } from '../../../services';

interface DynamicImageUploadInputProps {
  field: FormField;
  value: string;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string, value: string) => void;
  formSlug?: string;
}

function DynamicImageUploadInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  formSlug,
}: DynamicImageUploadInputProps) {
  const hasError = touched && !!error;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const maxFileSize = field.validation?.max_file_size ?? 5120;

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleFileSelect = async (file: File) => {
    setUploadError(null);

    if (file.size > maxFileSize * 1024) {
      setUploadError(`Image size exceeds the maximum limit of ${maxFileSize} KB`);
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = blobUrl;
    setPreviewUrl(blobUrl);

    setUploading(true);
    try {
      const response = await uploadService.uploadImage(file, field.id, formSlug);
      onChange(field.id, String(response.id));
    } catch {
      setUploadError('Failed to upload image. Please try again.');
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
  };

  const handleCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileSelect(file);
  };

  const handleRemove = () => {
    onChange(field.id, '');
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = null;
    setPreviewUrl(null);
    setUploadError(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-1">
      <label className="block text-base font-semibold text-[#374151]">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {value ? (
        <div className="relative inline-block">
          <img
            src={previewUrl || `/api/upload/${value}`}
            alt="Uploaded"
            className="w-36 h-36 object-cover rounded-lg border-2 border-[rgba(0,0,0,0.15)]"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
          >
            &times;
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            hasError ? 'border-red-400 bg-red-50' : 'border-[rgba(0,0,0,0.15)] hover:border-blue-400'
          }`}
        >
          <svg className="mx-auto h-12 w-12 text-[#a1a1a1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? (
            <p className="mt-2 text-sm text-[#525252]">Uploading...</p>
          ) : (
            <>
              <div className="mt-3 flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Choose from Gallery
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700"
                >
                  Take Photo
                </button>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryChange}
                onBlur={() => onBlur(field.id, value)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraChange}
                onBlur={() => onBlur(field.id, value)}
                className="hidden"
              />
            </>
          )}
          <p className="mt-2 text-xs text-[#a1a1a1]">Max {maxFileSize} KB</p>
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

export default DynamicImageUploadInput;
