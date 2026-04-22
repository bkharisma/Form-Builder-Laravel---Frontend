import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services';
import type { User } from '../types';
import { TextInput, Button, FormError, TwoFactorSetupModal } from '../components';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFullTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function truncateUserAgent(ua: string, maxLength = 30): string {
  if (ua.length <= maxLength) return ua;
  return ua.substring(0, maxLength) + '...';
}

function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordTouched, setCurrentPasswordTouched] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [disable2FAPassword, setDisable2FAPassword] = useState('');
  const [disable2FAError, setDisable2FAError] = useState('');
  const [disable2FALoading, setDisable2FALoading] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showCodesSection, setShowCodesSection] = useState(true);
  const [regeneratingCodes, setRegeneratingCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | '2fa' | 'history'>('profile');

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const profile = await profileService.getProfile();
      setUser(profile);
      setName(profile.name);
      setEmail(profile.email);
    } catch {
      setProfileError('Failed to load profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setEmailTouched(true);
    if (nameError || emailError) return;

    setProfileError('');
    setProfileSaving(true);
    try {
      const updated = await profileService.updateProfile({ name, email });
      setUser(updated);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      if (apiError.message?.includes('email')) {
        setProfileError('This email address is already in use.');
      } else {
        setProfileError(apiError.message || 'Failed to update profile.');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordTouched(true);
    setNewPasswordTouched(true);
    setConfirmPasswordTouched(true);
    if (currentPasswordError || newPasswordError || confirmPasswordError) return;

    setPasswordError('');
    setPasswordSaving(true);
    try {
      await profileService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordTouched(false);
      setNewPasswordTouched(false);
      setConfirmPasswordTouched(false);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      if (apiError.message?.includes('current password')) {
        setPasswordError('The current password is incorrect.');
      } else {
        setPasswordError(apiError.message || 'Failed to update password.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handle2FAComplete = useCallback(async () => {
    await loadProfile();
    setShow2FAModal(false);
  }, []);

  const handleDisable2FA = async () => {
    if (!disable2FAPassword.trim()) return;
    setDisable2FAError('');
    setDisable2FALoading(true);
    try {
      await profileService.disableTwoFactor(disable2FAPassword);
      setShowDisableDialog(false);
      setDisable2FAPassword('');
      await loadProfile();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      if (apiError.message?.includes('password')) {
        setDisable2FAError('The password is incorrect.');
      } else {
        setDisable2FAError(apiError.message || 'Failed to disable 2FA.');
      }
    } finally {
      setDisable2FALoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    setRegeneratingCodes(true);
    try {
      const result = await profileService.regenerateBackupCodes();
      setNewBackupCodes(result.backup_codes);
    } catch {
      console.error('Failed to regenerate backup codes');
    } finally {
      setRegeneratingCodes(false);
    }
  };

  const handleCopyAllCodes = async (codes: string[]) => {
    await navigator.clipboard.writeText(codes.join('\n'));
  };

  const nameError = !name.trim()
    ? 'Name is required'
    : name.length > 255
      ? 'Name must be 255 characters or less'
      : '';

  const emailError = !email.trim()
    ? 'Email is required'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Enter a valid email address'
      : '';

  const currentPasswordError = !currentPassword.trim()
    ? 'Current password is required'
    : '';

  const newPasswordError = !newPassword.trim()
    ? 'New password is required'
    : newPassword.length < 8
      ? 'Password must be at least 8 characters'
      : '';

  const confirmPasswordError = !confirmPassword.trim()
    ? 'Password confirmation is required'
    : confirmPassword !== newPassword
      ? 'Passwords do not match'
      : '';

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[28rem] bg-white shadow-sm z-50 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <h2 className="text-xl font-bold text-[#1a1a1a]">My Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#a1a1a1] hover:text-[#525252] hover:bg-[#f0f0f0] rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-[rgba(0,0,0,0.08)]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-[#737373] hover:text-[#374151]'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-[#737373] hover:text-[#374151]'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === '2fa'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-[#737373] hover:text-[#374151]'
            }`}
          >
            2FA
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-[#737373] hover:text-[#374151]'
            }`}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {profileLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-[#e5e5e5] rounded" />
              <div className="h-12 bg-[#e5e5e5] rounded" />
              <div className="h-12 bg-[#e5e5e5] rounded" />
            </div>
          ) : activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileError && <FormError message={profileError} onDismiss={() => setProfileError('')} />}
              <TextInput
                id="profile-name"
                label="Name"
                value={name}
                onChange={setName}
                onBlur={() => setNameTouched(true)}
                required
                error={nameError}
                touched={nameTouched}
              />
              <TextInput
                id="profile-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setEmailTouched(true)}
                required
                error={emailError}
                touched={emailTouched}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#374151]">Role</label>
                <div className="px-4 py-3 bg-[#f0f0f0] border border-[rgba(0,0,0,0.08)] rounded-lg text-[#525252]">
                  {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'}
                </div>
              </div>
              <div className="pt-2">
                <Button type="submit" variant="primary" loading={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : activeTab === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && <FormError message={passwordError} onDismiss={() => setPasswordError('')} />}
              <TextInput
                id="current-password"
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                onBlur={() => setCurrentPasswordTouched(true)}
                required
                error={currentPasswordError}
                touched={currentPasswordTouched}
              />
              <TextInput
                id="new-password"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                onBlur={() => setNewPasswordTouched(true)}
                required
                error={newPasswordError}
                touched={newPasswordTouched}
              />
              <TextInput
                id="confirm-password"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                onBlur={() => setConfirmPasswordTouched(true)}
                required
                error={confirmPasswordError}
                touched={confirmPasswordTouched}
              />
              <div className="pt-2">
                <Button type="submit" variant="primary" loading={passwordSaving}>
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          ) : activeTab === '2fa' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#374151]">Status</span>
                {user?.two_factor_enabled ? (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Enabled
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#f0f0f0] text-[#525252]">
                    Disabled
                  </span>
                )}
              </div>

              {user?.two_factor_enabled ? (
                <div className="space-y-3">
                  <div className="border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowCodesSection(!showCodesSection)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f5f5] transition-colors"
                    >
                      <span className="text-sm font-medium text-[#374151]">Backup Codes</span>
                      <svg className={`h-4 w-4 text-[#a1a1a1] transition-transform ${showCodesSection ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {showCodesSection && (
                      <div className="px-4 pb-4 space-y-3">
                        {newBackupCodes ? (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              {newBackupCodes.map((code, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between px-3 py-2 bg-[#f5f5f5] border border-[rgba(0,0,0,0.08)] rounded-lg"
                                >
                                  <code className="text-sm font-mono text-[#1a1a1a]">{code}</code>
                                  <button
                                    type="button"
                                    onClick={() => navigator.clipboard.writeText(code)}
                                    className="text-[#a1a1a1] hover:text-[#525252] transition-colors"
                                    aria-label={`Copy code ${code}`}
                                  >
                                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-center">
                              <Button variant="secondary" onClick={() => handleCopyAllCodes(newBackupCodes)}>
                                Copy All
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-[#737373]">Your backup codes are stored securely. Click "Regenerate Codes" to get new ones.</p>
                        )}
                        <div className="flex justify-center">
                          <Button variant="secondary" onClick={handleRegenerateCodes} loading={regeneratingCodes}>
                            {regeneratingCodes ? 'Regenerating...' : 'Regenerate Codes'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button variant="secondary" onClick={() => setShowDisableDialog(true)}>
                      Disable 2FA
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#525252] mb-4">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="primary" onClick={() => setShow2FAModal(true)}>
                    Enable 2FA
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <LoginHistorySection />
          )}
        </div>
      </div>

      <TwoFactorSetupModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        onComplete={handle2FAComplete}
      />

      {showDisableDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowDisableDialog(false); setDisable2FAPassword(''); setDisable2FAError(''); }} />
          <div className="relative bg-white rounded-lg shadow-sm w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">Disable 2FA</h3>
                <p className="text-sm text-[#737373]">Enter your password to confirm.</p>
              </div>
            </div>

            {disable2FAError && <FormError message={disable2FAError} onDismiss={() => setDisable2FAError('')} />}

            <TextInput
              id="disable-2fa-password"
              label="Password"
              type="password"
              value={disable2FAPassword}
              onChange={setDisable2FAPassword}
              required
            />

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => { setShowDisableDialog(false); setDisable2FAPassword(''); setDisable2FAError(''); }} disabled={disable2FALoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDisable2FA} loading={disable2FALoading} disabled={!disable2FAPassword.trim()}>
                {disable2FALoading ? 'Disabling...' : 'Disable'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function LoginHistorySection() {
  const [history, setHistory] = useState<{ data: { id: number; ip_address: string; user_agent: string; login_at: string; success: boolean; failure_reason: string | null }[]; current_page: number; last_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const result = await profileService.getLoginHistory(page, 10);
        setHistory(result);
      } catch {
        setHistoryError('Failed to load login history');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [page]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-[#e5e5e5] rounded" />
        ))}
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="text-center py-8 text-red-600 text-sm">
        {historyError}
      </div>
    );
  }

  if (!history || history.data.length === 0) {
    return (
      <div className="text-center py-8 text-[#737373] text-sm">
        No login history found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.data.map((entry) => (
        <div key={entry.id} className="p-3 bg-[#f5f5f5] border border-[rgba(0,0,0,0.08)] rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {entry.success ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Success</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Failed</span>
                )}
                <span className="text-xs text-[#737373]" title={formatFullTimestamp(entry.login_at)}>
                  {formatRelativeTime(entry.login_at)}
                </span>
              </div>
              <div className="text-sm font-mono text-[#1a1a1a]">{entry.ip_address}</div>
              <div className="text-xs text-[#737373] truncate" title={entry.user_agent}>
                {truncateUserAgent(entry.user_agent)}
              </div>
              {entry.failure_reason && (
                <div className="text-xs text-red-600 mt-1">{entry.failure_reason}</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {history.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border border-[rgba(0,0,0,0.15)] rounded-lg hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-[#525252]">
            {page} of {history.last_page}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(history.last_page, p + 1))}
            disabled={page >= history.last_page}
            className="px-3 py-1.5 text-sm border border-[rgba(0,0,0,0.15)] rounded-lg hover:bg-[#f5f5f5] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfilePanel;