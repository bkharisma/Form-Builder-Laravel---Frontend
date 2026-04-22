import type { FormField } from '../../../types';

interface DynamicDateInputProps {
  field: FormField;
  value: string;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string, value: string) => void;
}

function DynamicDateInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: DynamicDateInputProps) {
  const hasError = touched && !!error;

  return (
    <div className="space-y-1">
      <label
        htmlFor={field.id}
        className="block text-base font-semibold text-[#374151]"
      >
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="date"
        id={field.id}
        name={field.id}
        value={value}
        onChange={(e) => onChange(field.id, e.target.value)}
        onBlur={() => onBlur(field.id, value)}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-required={field.required}
        className={`
          w-full px-4 py-3 text-lg border-2 rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${hasError
            ? 'border-red-500 bg-red-50'
            : 'border-[rgba(0,0,0,0.15)] bg-white hover:border-[rgba(0,0,0,0.25)] focus:border-blue-500'
          }
        `}
      />
      {field.help_text && (
        <p className="text-sm text-[#737373] mt-1">{field.help_text}</p>
      )}
      {hasError && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DynamicDateInput;