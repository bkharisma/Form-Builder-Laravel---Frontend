import type { SelectOption } from '../../../types';

interface RadioOptionsEditorProps {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
  layoutDirection: 'horizontal' | 'vertical';
  onLayoutChange: (direction: 'horizontal' | 'vertical') => void;
  defaultValue: string;
  onDefaultValueChange: (value: string) => void;
}

function RadioOptionsEditor({
  options,
  onChange,
  layoutDirection,
  onLayoutChange,
  defaultValue,
  onDefaultValueChange,
}: RadioOptionsEditorProps) {
  const addOption = () => {
    const newIndex = options.length + 1;
    onChange([...options, { value: `option_${newIndex}`, label: `Option ${newIndex}` }]);
  };

  const updateOption = (index: number, key: keyof SelectOption, value: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [key]: value };
    onChange(updated);
  };

  const removeOption = (index: number) => {
    const removedOption = options[index];
    const updated = options.filter((_, i) => i !== index);
    onChange(updated);
    if (defaultValue === removedOption.value) {
      onDefaultValueChange('');
    }
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <h4 className="text-xs sm:text-sm font-medium text-[#374151]">Radio Button Options</h4>

      <div>
        <label className="block text-xs text-[#525252] mb-1">Layout Direction</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onLayoutChange('horizontal')}
            className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm font-medium transition-colors ${
              layoutDirection === 'horizontal'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-[#374151] border-[rgba(0,0,0,0.15)] hover:bg-[#f5f5f5]'
            }`}
          >
            Horizontal
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange('vertical')}
            className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm font-medium transition-colors ${
              layoutDirection === 'vertical'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-[#374151] border-[rgba(0,0,0,0.15)] hover:bg-[#f5f5f5]'
            }`}
          >
            Vertical
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDefaultValueChange(option.value)}
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                defaultValue === option.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-[rgba(0,0,0,0.15)]'
              }`}
              title="Set as default"
            >
              {defaultValue === option.value && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </button>
            <input
              type="text"
              value={option.label}
              onChange={(e) => updateOption(index, 'label', e.target.value)}
              className="flex-1 px-2 py-1.5 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Option label"
            />
            <input
              type="text"
              value={option.value}
              onChange={(e) => updateOption(index, 'value', e.target.value)}
              className="w-24 px-2 py-1.5 border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Value"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="Remove option"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add Option
      </button>

      <p className="text-xs text-[#737373] italic">Click the circle next to an option to set it as the default value.</p>
    </div>
  );
}

export default RadioOptionsEditor;
