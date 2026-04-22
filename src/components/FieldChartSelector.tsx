import { useState, useEffect } from 'react';
import { dynamicReportService } from '../services';
import type { ChartFieldInfo } from '../types';

interface FieldChartSelectorProps {
  formSlug: string;
  onFieldSelect: (fieldIds: string[]) => void;
  onFieldsLoaded?: (fields: ChartFieldInfo[]) => void;
}

function FieldChartSelector({ formSlug, onFieldSelect, onFieldsLoaded }: FieldChartSelectorProps) {
  const [fields, setFields] = useState<ChartFieldInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    dynamicReportService
      .getChartFields(formSlug)
      .then((response) => {
        if (!cancelled) {
          setFields(response.fields);
          setSelectedFields(response.fields.map((f) => f.id));
          onFieldSelect(response.fields.map((f) => f.id));
          onFieldsLoaded?.(response.fields);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const status = err?.response?.status;
          if (status === 404) {
            setError('No active form configuration found. Please create one in the Form Builder.');
          } else {
            setError('Failed to load chart fields.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [formSlug, onFieldSelect, onFieldsLoaded]);

  const handleToggle = (fieldId: string) => {
    setSelectedFields((prev) => {
      const next = prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId];
      onFieldSelect(next);
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = fields.map((f) => f.id);
    setSelectedFields(allIds);
    onFieldSelect(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
    onFieldSelect([]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-10 bg-[#e5e5e5] rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-[#737373] text-sm">{error}</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm font-medium text-[#374151] whitespace-nowrap">
          Chart fields:
        </label>
        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <button
              key={field.id}
              type="button"
              onClick={() => handleToggle(field.id)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                selectedFields.includes(field.id)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#f0f0f0] text-[#525252] hover:bg-[#e5e5e5]'
              }`}
            >
              {field.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Select all
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="text-xs text-[#737373] hover:text-[#374151] font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default FieldChartSelector;