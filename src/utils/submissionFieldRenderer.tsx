import type { FormField } from '../types';

interface RenderFieldValueProps {
  field: FormField;
  value: string | boolean | number | undefined | null;
  baseUrl?: string;
}

const baseUrlDefault = import.meta.env.VITE_API_URL || '';

function isBase64Image(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function getFileUrl(fileId: number | string, baseUrl: string): string {
  return `${baseUrl}/upload/${fileId}`;
}

function downloadBase64Image(dataUrl: string, filename: string) {
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function renderFieldValue({ field, value, baseUrl }: RenderFieldValueProps): React.ReactNode {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  const effectiveBaseUrl = baseUrl || baseUrlDefault;

  if (field.type === 'image_upload' || field.type === 'signature') {
    if (isBase64Image(value)) {
      const filename = field.type === 'signature' ? 'signature.png' : 'image.png';
      return (
        <div className="space-y-2">
          <img
            src={value}
            alt={field.type === 'signature' ? 'Signature' : 'Uploaded'}
            className="max-w-xs h-auto border border-gray-200 rounded"
          />
          <button
            type="button"
            onClick={() => downloadBase64Image(value, filename)}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Download {field.type === 'signature' ? 'signature' : 'image'}
          </button>
        </div>
      );
    }

    const fileId = typeof value === 'number' ? value : parseInt(String(value), 10);
    if (!fileId || isNaN(fileId)) return String(value);

    const fileUrl = getFileUrl(fileId, effectiveBaseUrl);

    return (
      <div className="space-y-2">
        <img
          src={fileUrl}
          alt={field.type === 'signature' ? 'Signature' : 'Uploaded'}
          className="max-w-xs h-auto rounded-lg border border-gray-200"
        />
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          View full size
        </a>
      </div>
    );
  }

  if (field.type === 'file_upload') {
    if (isBase64Image(value)) {
      return (
        <div className="space-y-2">
          <img src={value} alt="Uploaded" className="max-w-xs h-auto rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={() => downloadBase64Image(value, 'file.png')}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Download image
          </button>
        </div>
      );
    }

    const fileId = typeof value === 'number' ? value : parseInt(String(value), 10);
    if (!fileId || isNaN(fileId)) return String(value);

    const fileUrl = getFileUrl(fileId, effectiveBaseUrl);

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary-600 hover:text-primary-700 underline"
      >
        View file
      </a>
    );
  }

  return String(value);
}

export function renderTableCellValue({ field, value, baseUrl }: RenderFieldValueProps): React.ReactNode {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  const effectiveBaseUrl = baseUrl || baseUrlDefault;

  if (field.type === 'image_upload' || field.type === 'signature') {
    let src = '';
    let isBase64 = false;
    if (isBase64Image(value)) {
      src = value;
      isBase64 = true;
    } else {
      const fileId = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!fileId || isNaN(fileId)) return String(value);
      src = getFileUrl(fileId, effectiveBaseUrl);
    }

    const filename = field.type === 'signature' ? 'signature.png' : 'image.png';

    if (isBase64) {
      return (
        <button
          type="button"
          onClick={() => downloadBase64Image(src, filename)}
          className="inline-block cursor-pointer"
          title={`Download ${field.type === 'signature' ? 'signature' : 'image'}`}
        >
          <img
            src={src}
            alt={field.type === 'signature' ? 'Signature' : 'Uploaded'}
            className="w-10 h-10 object-cover rounded border border-gray-200"
          />
        </button>
      );
    }

    const fileUrl = src;

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <img
          src={src}
          alt={field.type === 'signature' ? 'Signature' : 'Uploaded'}
          className="w-10 h-10 object-cover rounded border border-gray-200"
        />
      </a>
    );
  }

  if (field.type === 'file_upload') {
    let fileUrl = '';
    if (isBase64Image(value)) {
      fileUrl = value;
    } else {
      const fileId = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!fileId || isNaN(fileId)) return String(value);
      fileUrl = getFileUrl(fileId, effectiveBaseUrl);
    }

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
      >
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        View
      </a>
    );
  }

  return String(value);
}
