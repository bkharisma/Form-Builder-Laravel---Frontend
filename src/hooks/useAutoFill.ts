import { useState, useCallback, useRef } from 'react';
import { lookupFormData } from '../services/lookupService';
import type { FormField, DynamicFormData, LookupMatch } from '../types';

export function useAutoFill(
  formSlug: string,
  fields: FormField[],
  _formData: DynamicFormData,
  setFormData: (updater: (prev: DynamicFormData) => DynamicFormData) => void
) {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [availableMatches, setAvailableMatches] = useState<LookupMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  const uniqueField = fields.find(f => f.is_unique);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyMatchData = useCallback(
    (match: LookupMatch, excludeFieldId: string) => {
      const autoFilled = new Set<string>();
      setFormData(prev => {
        const next = { ...prev };
        Object.entries(match.data).forEach(([key, val]) => {
          if (key !== excludeFieldId) {
            next[key] = val;
            autoFilled.add(key);
          }
        });
        return next;
      });
      setAutoFilledFields(autoFilled);
    },
    [setFormData]
  );

  const performLookup = useCallback(
    async (fieldId: string, value: string) => {
      if (!uniqueField || fieldId !== uniqueField.id) return;

      if (value.length < 5) {
        setAvailableMatches([]);
        setSelectedMatchId(null);
        setAutoFilledFields(new Set());
        return;
      }

      setIsLookingUp(true);
      try {
        const response = await lookupFormData(formSlug, fieldId, value);
        setAvailableMatches(response.matches);

        if (response.matches.length > 0) {
          const mostRecent = response.matches[0];
          setSelectedMatchId(mostRecent.id);
          applyMatchData(mostRecent, fieldId);
        }
      } finally {
        setIsLookingUp(false);
      }
    },
    [formSlug, uniqueField, applyMatchData]
  );

  const debouncedLookup = useCallback(
    (fieldId: string, value: string) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        performLookup(fieldId, value);
      }, 500);
    },
    [performLookup]
  );

  const selectMatch = useCallback(
    (matchId: number) => {
      const match = availableMatches.find(m => m.id === matchId);
      if (!match || !uniqueField) return;
      setSelectedMatchId(matchId);
      applyMatchData(match, uniqueField.id);
    },
    [availableMatches, uniqueField, applyMatchData]
  );

  const handleUserChange = useCallback((fieldId: string) => {
    setAutoFilledFields(prev => {
      if (!prev.has(fieldId)) return prev;
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });
  }, []);

  const handleClearUniqueField = useCallback((): boolean => {
    const confirmed = window.confirm('This will clear all auto-filled data. Are you sure?');
    if (confirmed) {
      setAutoFilledFields(new Set());
      setAvailableMatches([]);
      setSelectedMatchId(null);
    }
    return confirmed;
  }, []);

  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  }, []);

  return {
    isLookingUp,
    availableMatches,
    selectedMatchId,
    autoFilledFields,
    performLookup: debouncedLookup,
    selectMatch,
    handleUserChange,
    handleClearUniqueField,
    uniqueField,
    cleanup,
  };
}
