import { useState, useCallback } from 'react';
import type { FormField, DynamicFormData } from '../types';
import { evaluateConditionalLogic } from '../utils/logicEvaluator';

interface ValidationErrors {
  [fieldId: string]: string | undefined;
}

interface TouchedFields {
  [fieldId: string]: boolean;
}

export function useDynamicFormValidation(fields: FormField[]) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateField = useCallback(
    (field: FormField, value: string | boolean): string | undefined => {
      if (field.type === 'checkbox') {
        if (field.required && !value) {
          return `${field.label} is required`;
        }
        return undefined;
      }

      const stringValue = String(value);

      if (field.required && !stringValue.trim()) {
        return `${field.label} is required`;
      }

      const validation = field.validation;
      if (!validation || !stringValue.trim()) {
        return undefined;
      }

      if (validation.min_length && stringValue.length < validation.min_length) {
        return `${field.label} must be at least ${validation.min_length} characters`;
      }

      if (validation.max_length && stringValue.length > validation.max_length) {
        return `${field.label} must be less than ${validation.max_length} characters`;
      }

      if (field.type === 'number') {
        const numValue = parseFloat(stringValue);
        if (!isNaN(numValue)) {
          if (validation.min_value !== undefined && numValue < validation.min_value) {
            return `${field.label} must be at least ${validation.min_value}`;
          }
          if (validation.max_value !== undefined && numValue > validation.max_value) {
            return `${field.label} must be at most ${validation.max_value}`;
          }
        }
      }

      if (field.type === 'email' && stringValue.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(stringValue)) {
          return `Please enter a valid email address`;
        }
      }

      if (field.type === 'tel' && stringValue.trim()) {
        const phoneRegex = /^[\d\s\-+()]{7,20}$/;
        if (!phoneRegex.test(stringValue)) {
          return `Please enter a valid phone number (7-20 digits)`;
        }
      }

      if (validation.pattern && validation.pattern.trim() && stringValue.trim()) {
        try {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(stringValue)) {
            return validation.pattern_message || `${field.label} format is invalid`;
          }
        } catch {
          console.error('Invalid regex pattern:', validation.pattern);
        }
      }

      return undefined;
    },
    []
  );

  const validateForm = useCallback(
    (data: DynamicFormData): boolean => {
      const newErrors: ValidationErrors = {};
      const newTouched: TouchedFields = {};

      for (const field of fields) {
        if (!field.enabled) continue;
        if (!evaluateConditionalLogic(field.conditional_logic, data)) {
          // If conditionally hidden, clear its error and skip validation
          delete newErrors[field.id];
          continue;
        }

        newTouched[field.id] = true;
        const value = data[field.id] ?? (field.type === 'checkbox' ? false : '');
        const error = validateField(field, value as string | boolean);
        if (error) {
          newErrors[field.id] = error;
        }
      }

      setErrors(newErrors);
      setTouched(newTouched);

      return Object.keys(newErrors).length === 0;
    },
    [fields, validateField]
  );

  const handleBlur = useCallback(
    (fieldId: string, value: string | boolean) => {
      setTouched((prev) => ({ ...prev, [fieldId]: true }));
      const field = fields.find((f) => f.id === fieldId);
      if (field) {
        const error = validateField(field, value);
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (error) {
            newErrors[fieldId] = error;
          } else {
            delete newErrors[fieldId];
          }
          return newErrors;
        });
      }
    },
    [fields, validateField]
  );

  const resetValidation = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback(
    (fieldId: string): string | undefined => {
      return touched[fieldId] ? errors[fieldId] : undefined;
    },
    [errors, touched]
  );

  const isFieldTouched = useCallback(
    (fieldId: string): boolean => {
      return touched[fieldId] ?? false;
    },
    [touched]
  );

  return {
    errors,
    touched,
    validateForm,
    handleBlur,
    resetValidation,
    getFieldError,
    isFieldTouched,
  };
}