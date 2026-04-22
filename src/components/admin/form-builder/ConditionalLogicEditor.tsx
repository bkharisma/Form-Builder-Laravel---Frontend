import type { ConditionalLogic, FieldCondition, FormField } from '../../../types';

interface ConditionalLogicEditorProps {
  logic?: ConditionalLogic;
  onChange: (logic: ConditionalLogic | undefined) => void;
  availableFields: FormField[];
}

function ConditionalLogicEditor({ logic, onChange, availableFields }: ConditionalLogicEditorProps) {
  const enabled = logic?.enabled ?? false;

  const handleToggleEnabled = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      onChange(undefined);
    } else {
      onChange({
        enabled: true,
        action: logic?.action ?? 'show',
        match_type: logic?.match_type ?? 'all',
        conditions: logic?.conditions && logic.conditions.length > 0 
          ? logic.conditions 
          : [{ field_id: availableFields[0]?.id || '', operator: 'equals', value: '' }],
      });
    }
  };

  const updateLogic = (updates: Partial<ConditionalLogic>) => {
    onChange({
      enabled: logic?.enabled ?? true,
      action: logic?.action ?? 'show',
      match_type: logic?.match_type ?? 'all',
      conditions: logic?.conditions ?? [],
      ...updates,
    } as ConditionalLogic);
  };

  const addCondition = () => {
    const newConditions = [
      ...(logic?.conditions || []),
      { field_id: availableFields[0]?.id || '', operator: 'equals' as const, value: '' }
    ];
    updateLogic({ conditions: newConditions });
  };

  const updateCondition = (index: number, updates: Partial<FieldCondition>) => {
    const newConditions = [...(logic?.conditions || [])];
    newConditions[index] = { ...newConditions[index], ...updates };
    updateLogic({ conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = (logic?.conditions || []).filter((_, i) => i !== index);
    updateLogic({ conditions: newConditions });
  };

  return (
    <div className="space-y-4 border border-[rgba(0,0,0,0.08)] rounded-lg p-4 bg-[#f5f5f5]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#1a1a1a]">Conditional Logic</h4>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="logic-enabled"
            checked={enabled}
            onChange={handleToggleEnabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[rgba(0,0,0,0.15)] rounded"
          />
          <label htmlFor="logic-enabled" className="ml-2 text-xs sm:text-sm text-[#374151]">
            Enable rules
          </label>
        </div>
      </div>

      {enabled && (
        <div className="space-y-4 pt-3 border-t border-[rgba(0,0,0,0.08)]">
          {availableFields.length === 0 ? (
            <p className="text-sm text-orange-600">
              There are no other fields available to depend on. Add other fields first.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <select
                  value={logic?.action}
                  onChange={(e) => updateLogic({ action: e.target.value as 'show' | 'hide' })}
                  className="px-2 py-1 text-sm border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="show">Show</option>
                  <option value="hide">Hide</option>
                </select>
                <span>this field if</span>
                <select
                  value={logic?.match_type}
                  onChange={(e) => updateLogic({ match_type: e.target.value as 'all' | 'any' })}
                  className="px-2 py-1 text-sm border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">all</option>
                  <option value="any">any</option>
                </select>
                <span>of the following match:</span>
              </div>

              <div className="space-y-2">
                {(logic?.conditions || []).map((condition, index) => (
                  <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <select
                      value={condition.field_id}
                      onChange={(e) => updateCondition(index, { field_id: e.target.value })}
                      className="flex-1 min-w-[120px] px-2 py-1.5 text-sm border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {availableFields.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>

                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, { operator: e.target.value as any })}
                      className="w-28 px-2 py-1.5 text-sm border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="contains">Contains</option>
                      <option value="not_contains">Not Contains</option>
                      <option value="greater_than">&gt; (Greater)</option>
                      <option value="less_than">&lt; (Less)</option>
                    </select>

                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, { value: e.target.value })}
                      placeholder="Value"
                      className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-[rgba(0,0,0,0.15)] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-1.5 text-[#a1a1a1] hover:text-red-600 rounded-md transition-colors"
                      title="Remove condition"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCondition}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Rule
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ConditionalLogicEditor;
