import type { FormField } from '../../../types';

interface DynamicTextInputProps {
  field: FormField;
  value: string;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string, value: string) => void;
  isLoading?: boolean;
  isAutoFilled?: boolean;
  isUnique?: boolean;
}

function DynamicTextInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
  isLoading = false,
  isAutoFilled = false,
  isUnique = false,
}: DynamicTextInputProps) {
  const hasError = touched && !!error;

  return (
    <div className={`space-y-1 transition-all ${isAutoFilled ? 'rounded-lg border border-blue-200 bg-blue-50 p-3' : ''}`}>
      <label
        htmlFor={field.id}
        className="flex items-center gap-1.5 text-base font-semibold text-[#374151]"
      >
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {isUnique && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            lookup
          </span>
        )}
        {isAutoFilled && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            auto-filled
          </span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          id={field.id}
          name={field.id}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          onBlur={() => onBlur(field.id, value)}
          placeholder={field.placeholder}
          disabled={isLoading}
          autoComplete={undefined}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-required={field.required}
          className={`
            w-full px-4 py-3 text-lg border-2 rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${hasError
              ? 'border-red-500 bg-red-50'
              : isAutoFilled
                ? 'border-blue-300 bg-blue-50 hover:border-blue-400'
                : 'border-[rgba(0,0,0,0.15)] bg-white hover:border-[rgba(0,0,0,0.25)] focus:border-blue-500'
            }
            ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          </div>
        )}
      </div>
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

export default DynamicTextInput;