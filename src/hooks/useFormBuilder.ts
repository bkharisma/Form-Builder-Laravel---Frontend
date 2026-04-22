import { useState, useCallback } from 'react';
import type { FormField, FormConfig } from '../types';

const generateFieldId = (): string => {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const reorderArray = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const result = Array.from(array);
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

export interface UseFormBuilderReturn {
  fields: FormField[];
  isDirty: boolean;
  setFields: (fields: FormField[]) => void;
  addField: (field: Omit<FormField, 'id' | 'order'>) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  deleteField: (id: string) => void;
  duplicateField: (id: string) => void;
  toggleFieldEnabled: (id: string) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  resetFields: (config: FormConfig | null) => void;
  markSaved: () => void;
}

export function useFormBuilder(initialConfig: FormConfig | null): UseFormBuilderReturn {
  const [fields, setFields] = useState<FormField[]>(initialConfig?.fields || []);
  const [isDirty, setIsDirty] = useState(false);

  const setFieldsWithDirty = useCallback((newFields: FormField[]) => {
    setFields(newFields);
    setIsDirty(true);
  }, []);

  const addField = useCallback((field: Omit<FormField, 'id' | 'order'>) => {
    const newField: FormField = {
      ...field,
      id: generateFieldId(),
      order: fields.length,
    };
    setFieldsWithDirty([...fields, newField]);
  }, [fields, setFieldsWithDirty]);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFieldsWithDirty(
      fields.map((field) => (field.id === id ? { ...field, ...updates } : field))
    );
  }, [fields, setFieldsWithDirty]);

  const deleteField = useCallback((id: string) => {
    const filtered = fields.filter((field) => field.id !== id);
    const reordered = filtered.map((field, index) => ({ ...field, order: index }));
    setFieldsWithDirty(reordered);
  }, [fields, setFieldsWithDirty]);

  const duplicateField = useCallback((id: string) => {
    const fieldToDuplicate = fields.find((field) => field.id === id);
    if (!fieldToDuplicate) return;

    const newField: FormField = {
      ...fieldToDuplicate,
      id: generateFieldId(),
      label: `${fieldToDuplicate.label} (Copy)`,
      order: fields.length,
    };
    setFieldsWithDirty([...fields, newField]);
  }, [fields, setFieldsWithDirty]);

  const toggleFieldEnabled = useCallback((id: string) => {
    setFieldsWithDirty(
      fields.map((field) =>
        field.id === id ? { ...field, enabled: !field.enabled } : field
      )
    );
  }, [fields, setFieldsWithDirty]);

  const reorderFields = useCallback((fromIndex: number, toIndex: number) => {
    const reordered = reorderArray(fields, fromIndex, toIndex).map((field, index) => ({
      ...field,
      order: index,
    }));
    setFieldsWithDirty(reordered);
  }, [fields, setFieldsWithDirty]);

  const resetFields = useCallback((config: FormConfig | null) => {
    setFields(config?.fields || []);
    setIsDirty(false);
  }, []);

  const markSaved = useCallback(() => {
    setIsDirty(false);
  }, []);

  return {
    fields,
    isDirty,
    setFields: setFieldsWithDirty,
    addField,
    updateField,
    deleteField,
    duplicateField,
    toggleFieldEnabled,
    reorderFields,
    resetFields,
    markSaved,
  };
}