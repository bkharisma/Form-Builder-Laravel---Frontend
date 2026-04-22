import api from './api';
import type {
  AuthUser,
  LoginResponse,
} from '../types';

export const authService = {
  async login(email: string, password: string, turnstileToken?: string): Promise<AuthUser & { token?: string; requires_2fa?: boolean }> {
    const response = await api.post<AuthUser & { token?: string; requires_2fa?: boolean }>('/login', {
      email,
      password,
      cf_turnstile_response: turnstileToken,
    });
    const data = response.data;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  async verify2FA(userId: number, code: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/login/2fa', { user_id: userId, code });
    const data = response.data;
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  async getUser(): Promise<AuthUser> {
    const response = await api.get<AuthUser>('/user');
    return response.data;
  },
};

export * from './administrationService';
export * from './formBuilderService';


