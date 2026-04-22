import { useCallback, useEffect } from 'react';
import type { FormField, DynamicFormData } from '../../types';
import { evaluateConditionalLogic } from '../../utils/logicEvaluator';
import {
  DynamicTextInput,
  DynamicTextAreaInput,
  DynamicEmailInput,
  DynamicNumberInput,
  DynamicTelInput,
  DynamicSelectInput,
  DynamicCheckboxInput,
  DynamicDateInput,
  DynamicTimeInput,
  DynamicFileUploadInput,
  DynamicImageUploadInput,
  DynamicSignatureInput,
  DynamicRadioInput,
} from './fields';
import { useAutoFill } from '../../hooks/useAutoFill';

interface DynamicFormProps {
  fields: FormField[];
  formData: DynamicFormData;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  onChange: (fieldId: string, value: string | boolean) => void;
  onBlur: (fieldId: string, value: string | boolean) => void;
  setFormData?: (updater: (prev: DynamicFormData) => DynamicFormData) => void;
  formSlug?: string;
}

function DynamicForm({
  fields,
  formData,
  errors,
  touched,
  onChange,
  onBlur,
  setFormData,
  formSlug,
}: DynamicFormProps) {
  // Only activate auto-fill when we have both formSlug and a setFormData updater
  const autoFillEnabled = !!formSlug && !!setFormData;

  const noopSetFormData = useCallback(
    (_updater: (prev: DynamicFormData) => DynamicFormData) => {},
    []
  );

  const {
    isLookingUp,
    availableMatches,
    selectedMatchId,
    autoFilledFields,
    performLookup,
    selectMatch,
    handleUserChange,
    handleClearUniqueField,
    uniqueField,
    cleanup,
  } = useAutoFill(
    formSlug ?? '',
    fields,
    formData,
    autoFillEnabled ? setFormData! : noopSetFormData
  );

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const enabledFields = fields
    .filter(f => f.enabled !== false)
    .filter(f => evaluateConditionalLogic(f.conditional_logic, formData))
    .sort((a, b) => a.order - b.order);

  const handleChange = useCallback(
    (fieldId: string, value: string | boolean) => {
      onChange(fieldId, value);
      handleUserChange(fieldId);

      if (autoFillEnabled && uniqueField && fieldId === uniqueField.id) {
        performLookup(fieldId, value as string);
      }
    },
    [onChange, handleUserChange, autoFillEnabled, uniqueField, performLookup]
  );

  const handleBlur = useCallback(
    (fieldId: string, value: string | boolean) => {
      if (autoFillEnabled && uniqueField && fieldId === uniqueField.id && value === '') {
        const shouldClear = handleClearUniqueField();
        if (!shouldClear) return;
      }
      onBlur(fieldId, value);
    },
    [onBlur, autoFillEnabled, uniqueField, handleClearUniqueField]
  );

  const renderField = (field: FormField) => {
    const value = formData[field.id] ?? (field.type === 'checkbox' ? false : '');
    const error = errors[field.id];
    const isTouched = touched[field.id] ?? false;
    const isAutoFilled = autoFilledFields.has(field.id);
    const isUniqueField = autoFillEnabled && field.id === uniqueField?.id;
    const isLoading = isUniqueField && isLookingUp;

    const commonProps = {
      field,
      value: value as string & boolean,
      error,
      touched: isTouched,
      onChange: handleChange,
      onBlur: handleBlur,
      formSlug,
      isAutoFilled,
      isLoading,
    };

    switch (field.type) {
      case 'text':
        return <DynamicTextInput {...commonProps} />;
      case 'textarea':
        return <DynamicTextAreaInput {...commonProps} />;
      case 'email':
        return <DynamicEmailInput {...commonProps} />;
      case 'number':
        return <DynamicNumberInput {...commonProps} />;
      case 'tel':
        return <DynamicTelInput {...commonProps} />;
      case 'select':
        return <DynamicSelectInput {...commonProps} />;
      case 'checkbox':
        return (
          <DynamicCheckboxInput
            field={field}
            value={value as boolean}
            error={error}
            touched={isTouched}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        );
      case 'date':
        return <DynamicDateInput {...commonProps} />;
      case 'time':
        return <DynamicTimeInput {...commonProps} />;
      case 'file_upload':
        return <DynamicFileUploadInput {...commonProps} />;
      case 'image_upload':
        return <DynamicImageUploadInput {...commonProps} />;
      case 'signature':
        return <DynamicSignatureInput {...commonProps} />;
      case 'radio':
        return <DynamicRadioInput {...commonProps} />;
      default:
        return <DynamicTextInput {...commonProps} />;
    }
  };

  if (enabledFields.length === 0) {
    return (
      <div className="text-center py-8 text-[#737373]">
        <p>No form fields are available. The form may not have been published yet, or no fields have been enabled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match selection dropdown (shown when multiple matches found) */}
      {autoFillEnabled && availableMatches.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-800 mb-2">
            Multiple records found. Select one to auto-fill:
          </p>
          <select
            className="w-full text-sm border border-blue-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={selectedMatchId ?? ''}
            onChange={e => selectMatch(Number(e.target.value))}
          >
            {availableMatches.map(m => (
              <option key={m.id} value={m.id}>
                {m.summary.name ?? '—'} &middot; {m.summary.email ?? '—'} &middot; {m.summary.date}
              </option>
            ))}
          </select>
        </div>
      )}

      {enabledFields.map((field) => (
        <div key={field.id}>
          {renderField(field)}
        </div>
      ))}
    </div>
  );
}

export default DynamicForm;