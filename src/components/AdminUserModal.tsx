import { useState, useEffect } from 'react';
import type { User, AdminUserFormData } from '../types';
import { TextInput, Button, FormError } from '../components';

interface AdminUserModalProps {
  mode: 'create' | 'edit';
  user?: User | null;
  onSubmit: (data: AdminUserFormData) => void;
  onClose: () => void;
  loading?: boolean;
  error?: string;
  validationErrors?: Record<string, string[]>;
}

function AdminUserModal({ mode, user, onSubmit, onClose, loading = false, error, validationErrors }: AdminUserModalProps) {
  const [formData, setFormData] = useState<AdminUserFormData>({
    name: '',
    email: '',
    role: 'user',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        password: '',
        password_confirmation: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user',
        password: '',
        password_confirmation: '',
      });
    }
  }, [user, mode]);

  const handleChange = (field: keyof AdminUserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: AdminUserFormData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };
    if (mode === 'create' || formData.password) {
      data.password = formData.password;
      data.password_confirmation = formData.password_confirmation;
    }
    onSubmit(data);
  };

  const getFieldError = (field: string): string | undefined => {
    if (validationErrors && validationErrors[field]) {
      return validationErrors[field][0];
    }
    return undefined;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">
            {mode === 'create' && 'Add Admin User'}
            {mode === 'edit' && 'Edit Admin User'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#a1a1a1] hover:text-[#1a1a1a] transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4" noValidate>
          <FormError message={error} />

          <TextInput
            id="admin-name"
            label="Full Name"
            value={formData.name}
            onChange={(v) => handleChange('name', v)}
            required
            error={getFieldError('name')}
          />

          <TextInput
            id="admin-email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(v) => handleChange('email', v)}
            required
            error={getFieldError('email')}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-role" className="text-sm font-medium text-[#525252]">
              Role
            </label>
            <select
              id="admin-role"
              value={formData.role ?? 'user'}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-[#f0f0f0] border border-[rgba(0,0,0,0.08)] rounded-lg text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white focus:bg-white text-sm"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {getFieldError('role') && (
              <p className="text-sm text-red-600 mt-1">{getFieldError('role')}</p>
            )}
          </div>

          <div>
            <TextInput
              id="admin-password"
              label={mode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(v) => handleChange('password', v)}
              required={mode === 'create'}
              error={getFieldError('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              {showPassword ? 'Hide' : 'Show'} password
            </button>
          </div>

          <TextInput
            id="admin-password-confirmation"
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password_confirmation || ''}
            onChange={(v) => handleChange('password_confirmation', v)}
            required={mode === 'create' || !!formData.password}
            error={getFieldError('password_confirmation')}
          />

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="flex-1 sm:flex-none">
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUserModal;