import api from './api';
import type {
  User,
  AdminUserFormData,
  AppSettings,
  SettingsFormData,
  TwoFactorSetupResponse,
  PaginatedLoginHistoryResponse,
  ProfileUpdateRequest,
  PasswordUpdateRequest,
  PaginatedResponse,
} from '../types';

export const profileService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/profile');
    return response.data;
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<User> {
    const response = await api.put<User>('/profile', data);
    return response.data;
  },

  async updatePassword(data: PasswordUpdateRequest): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/profile/password', data);
    return response.data;
  },

  async enableTwoFactor(): Promise<TwoFactorSetupResponse> {
    const response = await api.post<TwoFactorSetupResponse>('/profile/two-factor/enable');
    return response.data;
  },

  async verifyTwoFactor(code: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/profile/two-factor/verify', { code });
    return response.data;
  },

  async disableTwoFactor(password: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/profile/two-factor/disable', { password });
    return response.data;
  },

  async regenerateBackupCodes(): Promise<{ backup_codes: string[] }> {
    const response = await api.post<{ backup_codes: string[] }>('/profile/two-factor/regenerate-codes');
    return response.data;
  },

  async getLoginHistory(page = 1, perPage = 10): Promise<PaginatedLoginHistoryResponse> {
    const response = await api.get<PaginatedLoginHistoryResponse>('/profile/login-history', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },
};

export const adminUserService = {
  async getUsers(params?: { page?: number; per_page?: number; search?: string }): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/admin-users', { params });
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await api.get<User>(`/admin-users/${id}`);
    return response.data;
  },

  async createUser(data: AdminUserFormData): Promise<User> {
    const response = await api.post<User>('/admin-users', data);
    return response.data;
  },

  async updateUser(id: number, data: Partial<AdminUserFormData>): Promise<User> {
    const response = await api.put<User>(`/admin-users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin-users/${id}`);
  },

  async downloadTemplate(): Promise<void> {
    const response = await api.get('/admin-users/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'admin_users_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async bulkUploadUsers(file: File): Promise<{ message: string; success_count: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ message: string; success_count: number; errors: string[] }>(
      '/admin-users/bulk',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};

export const settingsService = {
  async getPublicSettings(): Promise<{ app_name: string; app_description: string; logo_url: string | null; favicon_url?: string | null; office_name?: string; office_address?: string }> {
    const response = await api.get<{ app_name: string; app_description: string; logo_url: string | null; favicon_url?: string | null; office_name?: string; office_address?: string }>(
      '/public/settings'
    );
    return response.data;
  },

  async getSettings(): Promise<AppSettings> {
    const response = await api.get<AppSettings>('/admin/settings');
    return response.data;
  },

  async updateSettings(data: SettingsFormData): Promise<AppSettings> {
    const response = await api.put<AppSettings>('/admin/settings', data);
    return response.data;
  },

  async uploadLogo(file: File): Promise<{ message: string; logo_path: string; logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post<{ message: string; logo_path: string; logo_url: string }>(
      '/admin/settings/logo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async uploadFavicon(file: File): Promise<{ message: string; favicon_path: string; favicon_url: string }> {
    const formData = new FormData();
    formData.append('favicon', file);
    const response = await api.post<{ message: string; favicon_path: string; favicon_url: string }>(
      '/admin/settings/favicon',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
