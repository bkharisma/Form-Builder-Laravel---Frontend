interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  rows?: number;
}

function TextArea({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  touched = false,
  rows = 3,
}: TextAreaProps) {
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
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        rows={rows}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`
          w-full px-3 py-2 text-sm border rounded-lg transition-colors resize-none
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

export default TextArea;
