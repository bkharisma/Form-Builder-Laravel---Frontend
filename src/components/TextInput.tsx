interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  autoComplete?: string;
}

function TextInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  required = false,
  error,
  touched = false,
  autoComplete,
}: TextInputProps) {
  const hasError = touched && !!error;

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#525252]"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${hasError
            ? 'border-red-500 bg-red-50'
            : 'border-[rgba(0,0,0,0.15)] bg-[#f0f0f0] hover:border-[rgba(0,0,0,0.25)] focus:border-blue-500'
          }
        `}
      />
      {hasError && (
        <p id={`${id}-error`} className="text-red-600 text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextInput;
