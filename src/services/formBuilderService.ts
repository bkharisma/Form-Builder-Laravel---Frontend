import api from './api';
import type {
  Submission,
  SubmissionFormData,
  PaginatedResponse,
  SubmissionQueryParams,
  SubmissionStats,
  FormConfig,
  FormListItem,
  FormConfigFormData,
  CreateFormData,
  FormField,
  ChartFieldInfo,
  DynamicFieldReport,
  FileUploadResponse,
  ReportDataPoint,
  LookupResponse,
} from '../types';

export const submissionService = {
  async submitForm(formSlug: string, data: SubmissionFormData): Promise<Submission> {
    const response = await api.post<Submission>(`/submissions/${formSlug}`, data);
    return response.data;
  },

  async getSubmissions(params: SubmissionQueryParams): Promise<PaginatedResponse<Submission>> {
    const response = await api.get<PaginatedResponse<Submission>>('/admin/submissions', { params });
    return response.data;
  },

  async getSubmission(id: number): Promise<Submission> {
    const response = await api.get<Submission>(`/admin/submissions/${id}`);
    return response.data;
  },

  async getStats(formSlug: string): Promise<SubmissionStats> {
    const response = await api.get<SubmissionStats>('/admin/submissions/stats', {
      params: { form_slug: formSlug },
    });
    return response.data;
  },

  async exportCsv(formSlug: string, params?: Omit<SubmissionQueryParams, 'form_slug'>): Promise<Blob> {
    const response = await api.get('/admin/submissions/export', {
      params: { form_slug: formSlug, ...params },
      responseType: 'blob',
    });
    return response.data;
  },

  async exportXlsx(formSlug: string, params?: Omit<SubmissionQueryParams, 'form_slug'>): Promise<Blob> {
    const response = await api.get('/admin/submissions/export/xlsx', {
      params: { form_slug: formSlug, ...params },
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteSubmission(id: number): Promise<void> {
    await api.delete(`/admin/submissions/${id}`);
  },
};

export const formConfigService = {
  async getForms(page?: number, perPage?: number, search?: string): Promise<PaginatedResponse<FormListItem>> {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (perPage) params.per_page = perPage;
    if (search) params.search = search;
    const response = await api.get<{ data: FormListItem[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>('/admin/form-configs', { params });
    const { data, meta } = response.data;
    return {
      data,
      current_page: meta.current_page,
      last_page: meta.last_page,
      per_page: meta.per_page,
      total: meta.total,
    };
  },

  async getFormBySlug(slug: string): Promise<FormConfig> {
    const response = await api.get<{ data: FormConfig }>(`/admin/form-configs/${slug}`);
    return response.data.data;
  },

  async createForm(data: CreateFormData): Promise<FormConfig> {
    const response = await api.post<{ data: FormConfig }>('/admin/form-configs', data);
    return response.data.data;
  },

  async updateForm(slug: string, data: FormConfigFormData): Promise<FormConfig> {
    const response = await api.put<{ data: FormConfig }>(`/admin/form-configs/${slug}`, data);
    return response.data.data;
  },

  async deleteForm(slug: string): Promise<void> {
    await api.delete(`/admin/form-configs/${slug}`);
  },

  async getPublicFormConfig(slug: string): Promise<{ title: string; description: string | null; fields: FormField[] } | null> {
    try {
      const response = await api.get<{ data: { title: string; description: string | null; fields: FormField[] } }>(`/public/form-config/${slug}`);
      return response.data.data;
    } catch (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export const dynamicReportService = {
  async getChartFields(formSlug: string): Promise<{ fields: ChartFieldInfo[] }> {
    const response = await api.get<{ fields: ChartFieldInfo[] }>('/admin/reports/dynamic-fields', {
      params: { form_slug: formSlug },
    });
    return response.data;
  },

  async getFieldReport(formSlug: string, fieldId: string, dateFrom?: string, dateTo?: string): Promise<DynamicFieldReport> {
    const params: Record<string, string> = { form_slug: formSlug, field_id: fieldId };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    const response = await api.get<DynamicFieldReport>('/admin/reports/dynamic', { params });
    return response.data;
  },
};

export const reportService = {
  async getSubmissionsOverTime(formSlug: string, dateFrom?: string, dateTo?: string): Promise<ReportDataPoint[]> {
    const params: Record<string, string> = { form_slug: formSlug };
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    const response = await api.get<ReportDataPoint[]>('/reports/submissions-over-time', { params });
    return response.data;
  },
};

export const uploadService = {
  async uploadFile(file: File, fieldId?: string, formSlug?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (fieldId) formData.append('field_id', fieldId);
    if (formSlug) formData.append('form_slug', formSlug);
    const response = await api.post<FileUploadResponse>('/upload/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadImage(image: File, fieldId?: string, formSlug?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('image', image);
    if (fieldId) formData.append('field_id', fieldId);
    if (formSlug) formData.append('form_slug', formSlug);
    const response = await api.post<FileUploadResponse>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const lookupService = {
  async lookupFormData(
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
  },
};
