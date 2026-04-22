import type { ValidationRules } from '../../../types';

interface ValidationEditorProps {
  fieldType: string;
  validation?: ValidationRules;
  onChange: (validation: ValidationRules) => void;
}

function ValidationEditor({ fieldType, validation = {}, onChange }: ValidationEditorProps) {
  const handleChange = (key: keyof ValidationRules, value: string | number | undefined) => {
    onChange({
      ...validation,
      [key]: value === '' || value === undefined ? undefined : value,
    });
  };

  const showLengthValidation = fieldType === 'text' || fieldType === 'textarea';
  const showValueValidation = fieldType === 'number';
  const showPattern = fieldType === 'text' || fieldType === 'textarea' || fieldType === 'tel';

  return (
    <div className="space-y-2 sm:space-y-3">
      <h4 className="text-xs sm:text-sm font-medium text-[#374151]">Validation Rules</h4>

      {showLengthValidation && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs text-[#525252] mb-1">Min Length</label>
            <input
              type="number"
              min="0"
              value={validation.min_length ?? ''}
              onChange={(e) => handleChange('min_length', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-[#525252] mb-1">Max Length</label>
            <input
              type="number"
              min="1"
              value={validation.max_length ?? ''}
              onChange={(e) => handleChange('max_length', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="255"
            />
          </div>
        </div>
      )}

      {showValueValidation && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <label className="block text-xs text-[#525252] mb-1">Min Value</label>
            <input
              type="number"
              value={validation.min_value ?? ''}
              onChange={(e) => handleChange('min_value', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs text-[#525252] mb-1">Max Value</label>
            <input
              type="number"
              value={validation.max_value ?? ''}
              onChange={(e) => handleChange('max_value', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="100"
            />
          </div>
        </div>
      )}

      {showPattern && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-[#525252] mb-1">Regex Pattern (optional)</label>
            <input
              type="text"
              value={validation.pattern ?? ''}
              onChange={(e) => handleChange('pattern', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs sm:text-sm"
              placeholder="^[A-Za-z]+$"
            />
            <p className="text-xs text-[#737373] mt-1">Regular expression pattern for custom validation</p>
          </div>
          {validation.pattern && (
            <div>
              <label className="block text-xs text-[#525252] mb-1">Pattern Error Message</label>
              <input
                type="text"
                value={validation.pattern_message ?? ''}
                onChange={(e) => handleChange('pattern_message', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Invalid format"
              />
            </div>
          )}
        </div>
      )}

      {!showLengthValidation && !showValueValidation && !showPattern && (
        <p className="text-xs text-[#737373] italic">No additional validation options for this field type.</p>
      )}
    </div>
  );
}

export default ValidationEditor;