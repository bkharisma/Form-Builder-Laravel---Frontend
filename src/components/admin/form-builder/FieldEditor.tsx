import { useState } from 'react';
import type { FormField, FormFieldType, ValidationRules, SelectOption, ConditionalLogic } from '../../../types';
import ValidationEditor from './ValidationEditor';
import OptionsEditor from './OptionsEditor';
import RadioOptionsEditor from './RadioOptionsEditor';
import ExtensionEditor from './ExtensionEditor';
import ConditionalLogicEditor from './ConditionalLogicEditor';

interface FieldEditorProps {
  field: FormField | null;
  onSave: (field: Omit<FormField, 'id' | 'order'>) => void;
  onCancel: () => void;
  availableFields: FormField[];
}

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'tel', label: 'Phone' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Button' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'file_upload', label: 'File Upload' },
  { value: 'image_upload', label: 'Image Upload' },
  { value: 'signature', label: 'Signature' },

];

const DEFAULT_OPTIONS: SelectOption[] = [
  { value: 'option_1', label: 'Option 1' },
  { value: 'option_2', label: 'Option 2' },
];

function FieldEditor({ field, onSave, onCancel, availableFields }: FieldEditorProps) {
  const [type, setType] = useState<FormFieldType>(field?.type || 'text');
  const [label, setLabel] = useState(field?.label || '');
  const [required, setRequired] = useState(field?.required ?? true);
  const [enabled, setEnabled] = useState(field?.enabled ?? true);
  const [isUnique, setIsUnique] = useState(field?.is_unique ?? false);
  const [placeholder, setPlaceholder] = useState(field?.placeholder || '');
  const [helpText, setHelpText] = useState(field?.help_text || '');
  const [validation, setValidation] = useState<ValidationRules>(field?.validation || {});
  const [options, setOptions] = useState<SelectOption[]>(field?.options || DEFAULT_OPTIONS);
  const [maxFileSize, setMaxFileSize] = useState<number | ''>(field?.validation?.max_file_size ?? '');
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>(field?.validation?.allowed_extensions ?? []);
  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>(field?.layout_direction ?? 'vertical');
  const [defaultValue, setDefaultValue] = useState<string>(field?.default_value ?? '');
  const [conditionalLogic, setConditionalLogic] = useState<ConditionalLogic | undefined>(field?.conditional_logic);

  const UNIQUE_CAPABLE_TYPES: FormFieldType[] = ['text', 'email', 'tel', 'number'];

  const handleTypeChange = (newType: FormFieldType) => {
    setType(newType);
    if (!UNIQUE_CAPABLE_TYPES.includes(newType)) {
      setIsUnique(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fieldValidation: ValidationRules = { ...validation };
    if (type === 'file_upload' || type === 'image_upload') {
      if (maxFileSize !== '') {
        fieldValidation.max_file_size = maxFileSize;
      }
      if (type === 'file_upload' && allowedExtensions.length > 0) {
        fieldValidation.allowed_extensions = allowedExtensions;
      }
    }

    const fieldData: Omit<FormField, 'id' | 'order'> = {
      type,
      label,
      required,
      enabled,
      is_unique: isUnique,
      placeholder: placeholder || undefined,
      help_text: helpText || undefined,
      validation: Object.keys(fieldValidation).length > 0 ? fieldValidation : undefined,
      options: type === 'select' || type === 'radio' ? options : undefined,
      layout_direction: type === 'radio' ? layoutDirection : undefined,
      default_value: type === 'radio' && defaultValue ? defaultValue : undefined,
      conditional_logic: conditionalLogic,
    };

    onSave(fieldData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1.5 sm:mb-2">
          Field Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {FIELD_TYPES.map((ft) => (
            <button
              key={ft.value}
              type="button"
              onClick={() => handleTypeChange(ft.value)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm font-medium transition-colors ${type === ft.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-[#374151] border-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.02)]'
                }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
          Label <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Enter field label"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[rgba(0,0,0,0.15)] rounded"
          />
          <label htmlFor="required" className="ml-2 text-xs sm:text-sm text-[#374151]">
            Required field
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[rgba(0,0,0,0.15)] rounded"
          />
          <label htmlFor="enabled" className="ml-2 text-xs sm:text-sm text-[#374151]">
            Enabled
          </label>
        </div>
        {UNIQUE_CAPABLE_TYPES.includes(type) && (
          <div className="flex items-center col-span-2">
            <input
              type="checkbox"
              id="is_unique"
              checked={isUnique}
              onChange={(e) => setIsUnique(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[rgba(0,0,0,0.15)] rounded"
            />
            <label htmlFor="is_unique" className="ml-2 text-xs sm:text-sm text-[#374151]">
              Unique Data — auto-fill form from this field
            </label>
          </div>
        )}
      </div>

      {(type === 'text' || type === 'textarea' || type === 'email' || type === 'tel' || type === 'number') && (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
            Placeholder (optional)
          </label>
          <input
            type="text"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Enter placeholder text"
          />
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
          Help Text (optional)
        </label>
        <textarea
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          placeholder="Additional help text for this field"
          rows={2}
        />
      </div>

      {type === 'select' && (
        <OptionsEditor options={options} onChange={setOptions} />
      )}

      {type === 'radio' && (
        <RadioOptionsEditor
          options={options}
          onChange={setOptions}
          layoutDirection={layoutDirection}
          onLayoutChange={setLayoutDirection}
          defaultValue={defaultValue}
          onDefaultValueChange={setDefaultValue}
        />
      )}

      {type === 'file_upload' && (
        <div className="space-y-2 sm:space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
              Max File Size (KB)
            </label>
            <input
              type="number"
              min="1"
              max="51200"
              value={maxFileSize}
              onChange={(e) => setMaxFileSize(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="10240"
            />
          </div>
          <ExtensionEditor extensions={allowedExtensions} onChange={setAllowedExtensions} />
        </div>
      )}

      {type === 'image_upload' && (
        <div>
          <label className="block text-xs sm:text-sm font-medium text-[#374151] mb-1">
            Max File Size (KB)
          </label>
          <input
            type="number"
            min="1"
            max="10240"
            value={maxFileSize}
            onChange={(e) => setMaxFileSize(e.target.value ? parseInt(e.target.value) : '')}
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="5120"
          />
        </div>
      )}

      <ConditionalLogicEditor
        logic={conditionalLogic}
        onChange={setConditionalLogic}
        availableFields={availableFields || []}
      />

      <ValidationEditor fieldType={type} validation={validation} onChange={setValidation} />

      <div className="flex justify-end gap-2 pt-3 sm:pt-4 border-t flex-wrap">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#374151] bg-white border border-[rgba(0,0,0,0.15)] rounded-md hover:bg-[rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {field ? 'Update Field' : 'Add Field'}
        </button>
      </div>
    </form>
  );
}

export default FieldEditor;