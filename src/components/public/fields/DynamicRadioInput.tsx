import type { FormField } from '../../../types';

interface DynamicRadioInputProps {
  field: FormField;
  value: string;
  error?: string;
  touched: boolean;
  onChange: (id: string, value: string) => void;
  onBlur: (id: string, value: string) => void;
}

function DynamicRadioInput({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
}: DynamicRadioInputProps) {
  const hasError = touched && !!error;
  const options = field.options || [];
  const layoutDirection = field.layout_direction ?? 'vertical';

  return (
    <div className="space-y-1">
      <label className="block text-base font-semibold text-[#374151]">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        role="radiogroup"
        aria-required={field.required}
        className={layoutDirection === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-colors ${
              value === option.value
                ? 'border-blue-500 bg-blue-50'
                : hasError
                  ? 'border-red-400 bg-white hover:border-red-300'
                  : 'border-[rgba(0,0,0,0.15)] bg-white hover:border-[rgba(0,0,0,0.25)]'
            }`}
          >
            <input
              type="radio"
              name={field.id}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(field.id, option.value)}
              onBlur={() => onBlur(field.id, value)}
              className="w-4 h-4 text-blue-600 border-[rgba(0,0,0,0.15)] focus:ring-blue-500"
            />
            <span className="text-base text-[#374151]">{option.label}</span>
          </label>
        ))}
      </div>
      {field.help_text && (
        <p className="text-sm text-[#737373] mt-1">{field.help_text}</p>
      )}
      {hasError && (
        <p className="text-red-600 text-sm" role="alert">{error}</p>
      )}
    </div>
  );
}

export default DynamicRadioInput;
