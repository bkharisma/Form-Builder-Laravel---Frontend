import { useState } from 'react';

interface ExtensionEditorProps {
  extensions: string[];
  onChange: (extensions: string[]) => void;
}

const COMMON_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'ppt', 'pptx', 'odt', 'ods', 'rtf', 'jpg', 'png', 'gif', 'webp'];

function ExtensionEditor({ extensions, onChange }: ExtensionEditorProps) {
  const [inputValue, setInputValue] = useState('');

  const addExtension = (ext: string) => {
    const normalized = ext.toLowerCase().replace(/^\.+/, '').trim();
    if (normalized && !extensions.includes(normalized)) {
      onChange([...extensions, normalized]);
    }
  };

  const removeExtension = (ext: string) => {
    onChange(extensions.filter((e) => e !== ext));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const values = inputValue.split(/[, ]+/).filter(Boolean);
      values.forEach(addExtension);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs sm:text-sm font-medium text-[#374151]">
        Allowed File Extensions
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        placeholder="Type extensions (e.g., pdf, docx) and press Enter"
      />
      {extensions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {extensions.map((ext) => (
            <span
              key={ext}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium"
            >
              .{ext}
              <button
                type="button"
                onClick={() => removeExtension(ext)}
                className="ml-0.5 text-blue-400 hover:text-blue-600"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {COMMON_EXTENSIONS.filter((ext) => !extensions.includes(ext)).map((ext) => (
          <button
            key={ext}
            type="button"
            onClick={() => addExtension(ext)}
            className="px-2 py-0.5 bg-[#f0f0f0] text-[#525252] rounded text-xs hover:bg-[#e5e5e5]"
          >
            +.{ext}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExtensionEditor;
