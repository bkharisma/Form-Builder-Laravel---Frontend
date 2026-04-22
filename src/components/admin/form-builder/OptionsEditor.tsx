import type { SelectOption } from '../../../types';
import Button from '../../Button';

interface OptionsEditorProps {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}

function OptionsEditor({ options, onChange }: OptionsEditorProps) {
  const addOption = () => {
    const newOption: SelectOption = {
      value: `option_${options.length + 1}`,
      label: `Option ${options.length + 1}`,
    };
    onChange([...options, newOption]);
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    onChange(updated);
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const moveOption = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= options.length) return;
    const updated = [...options];
    const [removed] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, removed);
    onChange(updated);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-medium text-[#374151]">Options</h4>
        <Button variant="secondary" onClick={addOption} className="text-sm sm:text-base">
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Option
        </Button>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(index, 'label', e.target.value)}
                className="px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Label"
              />
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(index, 'value', e.target.value)}
                className="px-3 py-2 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                placeholder="value"
              />
            </div>
            <div className="flex items-center gap-1 pt-0 sm:pt-2">
              <button
                type="button"
                onClick={() => moveOption(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-[#a1a1a1] hover:text-[#525252] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move up"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveOption(index, index + 1)}
                disabled={index === options.length - 1}
                className="p-1 text-[#a1a1a1] hover:text-[#525252] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move down"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 1}
                className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove option"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#737373]">
        At least one option is required. Label is shown to users, value is stored.
      </p>
    </div>
  );
}

export default OptionsEditor;