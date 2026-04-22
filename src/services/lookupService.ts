import type { LookupResponse } from '../types';
import api from './api';

export async function lookupFormData(
  formSlug: string,
  fieldId: string,
  value: string
): Promise<LookupResponse> {
  if (value.length < 5) {
    return { matches: [] };
  }

  try {
    const response = await api.get<LookupResponse>(
      `/public/lookup/${formSlug}`,
      { params: { field_id: fieldId, value } }
    );
    return response.data;
  } catch (error) {
    console.error('Lookup error:', error);
    return { matches: [] };
  }
}
