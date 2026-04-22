import type { DynamicFormData, FieldCondition, ConditionalLogic } from '../types';

export function evaluateCondition(condition: FieldCondition, formData: DynamicFormData): boolean {
  const fieldValue = formData[condition.field_id];
  
  // Handle empty or undefined field values
  if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      if (condition.operator === 'not_equals' && condition.value !== '') return true;
      if (condition.operator === 'equals' && condition.value === '') return true;
      return false;
  }

  const strFieldValue = typeof fieldValue === 'boolean' ? String(fieldValue) : String(fieldValue).toLowerCase();
  const strConditionValue = String(condition.value).toLowerCase();

  switch (condition.operator) {
    case 'equals':
      return strFieldValue === strConditionValue;
    case 'not_equals':
      return strFieldValue !== strConditionValue;
    case 'contains':
      return strFieldValue.includes(strConditionValue);
    case 'not_contains':
      return !strFieldValue.includes(strConditionValue);
    case 'greater_than': {
      const numField = Number(fieldValue);
      const numCond = Number(condition.value);
      if (!isNaN(numField) && !isNaN(numCond)) {
        return numField > numCond;
      }
      return false;
    }
    case 'less_than': {
      const numField = Number(fieldValue);
      const numCond = Number(condition.value);
      if (!isNaN(numField) && !isNaN(numCond)) {
        return numField < numCond;
      }
      return false;
    }
    default:
      return false;
  }
}

export function evaluateConditionalLogic(logic: ConditionalLogic | undefined, formData: DynamicFormData): boolean {
  if (!logic || !logic.enabled || !logic.conditions || logic.conditions.length === 0) {
    return true; // No logic or disabled logic = visible by default
  }

  let conditionsMet = false;
  
  if (logic.match_type === 'all') {
    conditionsMet = logic.conditions.every(cond => evaluateCondition(cond, formData));
  } else { // 'any'
    conditionsMet = logic.conditions.some(cond => evaluateCondition(cond, formData));
  }

  return logic.action === 'show' ? conditionsMet : !conditionsMet;
}
