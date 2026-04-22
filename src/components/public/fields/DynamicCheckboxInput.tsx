import type { FormField } from '../../../types';

interface DynamicCheckboxInputProps {
  field: FormField;
  value: boolean;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: boolean) => void;
  onBlur: (id: string, value: boolean) => void;
}

function DynamicCheckboxInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: DynamicCheckboxInputProps) {
  const hasError = touched && !!error;

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={field.id}
          name={field.id}
          checked={value}
          onChange={(e) => onChange(field.id, e.target.checked)}
          onBlur={() => onBlur(field.id, value)}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-required={field.required}
          className="h-5 w-5 mt-0.5 text-blue-600 border-2 border-[rgba(0,0,0,0.15)] rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500 cursor-pointer"
        />
        <label
          htmlFor={field.id}
          className="text-base text-[#374151] cursor-pointer"
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {field.help_text && (
        <p className="text-sm text-[#737373] ml-8">{field.help_text}</p>
      )}
      {hasError && (
        <p className="text-red-600 text-sm ml-8" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DynamicCheckboxInput;