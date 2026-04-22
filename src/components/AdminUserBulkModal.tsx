import { useState, useRef } from 'react';
import { Button, FormError } from '../components';

interface AdminUserBulkModalProps {
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onDownloadTemplate: () => Promise<void>;
  loading?: boolean;
}

function AdminUserBulkModal({ onClose, onUpload, onDownloadTemplate, loading = false }: AdminUserBulkModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      // Some browsers might not map xlsx correctly, so fallback to checking extension
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(fileExtension)) {
        setError('Please upload a valid Excel or CSV file (.xlsx, .xls, .csv).');
        setFile(null);
        return;
      }
      
      setError(undefined);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setError(undefined);
    await onUpload(file);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">Bulk Import Admins</h2>
          <button
            onClick={onClose}
            className="text-[#a1a1a1] hover:text-[#525252] transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
            <h3 className="font-semibold mb-1">Instructions</h3>
            <p className="mb-2">1. Download the template file below.</p>
            <p className="mb-2">2. Fill in the user details (Name, Email, Role, Password).</p>
            <p>3. Upload the completed file to create the users in bulk.</p>
            <div className="mt-3">
              <Button type="button" variant="secondary" onClick={onDownloadTemplate} disabled={loading} className="text-sm py-1.5">
                <svg className="w-4 h-4 mr-1.5 inline -mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Template
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormError message={error} />
            
            <div className="flex flex-col items-center justify-center w-full">
              <label 
                htmlFor="dropzone-file" 
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#f5f5f5] hover:bg-[#f0f0f0] transition-colors ${file ? 'border-blue-500 bg-blue-50/30' : 'border-[rgba(0,0,0,0.15)]'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-[#737373]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  {file ? (
                    <p className="mb-2 text-sm text-[#1a1a1a] font-semibold">{file.name}</p>
                  ) : (
                    <>
                      <p className="mb-2 text-sm text-[#737373]"><span className="font-semibold">Click to upload</span></p>
                      <p className="text-xs text-[#737373]">.XLSX, .XLS, or .CSV allowed</p>
                    </>
                  )}
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} disabled={!file} className="flex-1 sm:flex-none">
                Upload & Import
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminUserBulkModal;
