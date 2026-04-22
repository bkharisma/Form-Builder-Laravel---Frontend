import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, settingsService } from '../services';
import { TextInput, Button, FormError, TurnstileVerificationModal } from '../components';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [appName, setAppName] = useState('Admin Login');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<number | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const twoFactorInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const emailError = !email.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '';
  const passwordError = !password ? 'Password is required' : '';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await settingsService.getPublicSettings();
        if (settings.app_name) setAppName(settings.app_name);
        if (settings.logo_url) setLogoUrl(settings.logo_url);
      } catch {
        // Use defaults if settings fetch fails
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (twoFactorRequired && twoFactorInputRef.current) {
      twoFactorInputRef.current.focus();
    }
  }, [twoFactorRequired, useBackupCode]);

  const [isTurnstileOpen, setIsTurnstileOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (emailError || passwordError) return;

    setError('');
    setIsTurnstileOpen(true);
  };

  const performLogin = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password, token);
      if (result.requires_2fa) {
        setTwoFactorRequired(true);
        setTwoFactorUserId(result.user.id);
        setPassword('');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
      setTurnstileToken(null);
    }
  }, [email, password, navigate]);

  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setIsTurnstileOpen(false);
  }, []);

  const handleTurnstileError = useCallback(() => {}, []);

  const handleTurnstileClose = useCallback(() => {
    setIsTurnstileOpen(false);
  }, []);

  useEffect(() => {
    if (turnstileToken && !isTurnstileOpen) {
      performLogin(turnstileToken);
    }
  }, [turnstileToken, isTurnstileOpen, performLogin]);

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim() || twoFactorUserId === null) return;

    setTwoFactorError(null);
    setTwoFactorLoading(true);
    try {
      await authService.verify2FA(twoFactorUserId, twoFactorCode);
      navigate('/dashboard');
    } catch (err: unknown) {
      const apiError = err as { message?: string; status?: number };
      if (apiError.status === 429) {
        setTwoFactorError(apiError.message || 'Too many failed attempts. Please try again later.');
      } else {
        setTwoFactorError(apiError.message || 'The provided 2FA code is invalid.');
      }
      setTwoFactorCode('');
      setTimeout(() => twoFactorInputRef.current?.focus(), 0);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handle2FACodeChange = (value: string) => {
    setTwoFactorCode(value);
    setTwoFactorError(null);
    if (!useBackupCode && value.length === 6) {
      setTimeout(() => {
        setTwoFactorCode(value);
      }, 0);
    }
  };

  const handle2FAKeyDown = async (e: React.KeyboardEvent) => {
    if (!useBackupCode && twoFactorCode.length === 6 && e.key === 'Enter') {
      await handle2FASubmit(e);
    }
  };

  const backToLogin = () => {
    setTwoFactorRequired(false);
    setTwoFactorUserId(null);
    setTwoFactorCode('');
    setTwoFactorError(null);
    setUseBackupCode(false);
    setTwoFactorLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-[#f0f0f0] p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-16 sm:h-20 mx-auto mb-3 sm:mb-4"
            />
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-2">{appName}</h1>
          <p className="text-base sm:text-lg text-[#525252]">
            {twoFactorRequired
              ? 'Verify your identity'
              : 'Sign in to manage submissions'}
          </p>
        </div>

        {twoFactorRequired ? (
          <form
            onSubmit={handle2FASubmit}
            className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-5 sm:space-y-6"
            noValidate
          >
            <FormError message={twoFactorError ?? undefined} onDismiss={() => setTwoFactorError(null)} />

            <div className="text-center">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#1a1a1a]">Two-Factor Authentication</h2>
              <p className="text-xs sm:text-sm text-[#737373] mt-1">
                {useBackupCode
                  ? 'Enter your backup code'
                  : 'Enter 6-digit code from your authenticator app'}
              </p>
            </div>

            <div>
              <label htmlFor="twoFactorCode" className="sr-only">
                {useBackupCode ? 'Backup code' : 'Authentication code'}
              </label>
              <input
                ref={twoFactorInputRef}
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => handle2FACodeChange(e.target.value)}
                onKeyDown={handle2FAKeyDown}
                placeholder={useBackupCode ? 'Enter your backup code' : '000000'}
                maxLength={useBackupCode ? undefined : 6}
                disabled={twoFactorLoading}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-center text-xl sm:text-2xl tracking-widest border border-[rgba(0,0,0,0.15)] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="one-time-code"
              />
            </div>

            <Button type="submit" variant="primary" loading={twoFactorLoading} fullWidth disabled={twoFactorLoading || !twoFactorCode.trim()}>
              {twoFactorLoading ? 'Verifying...' : 'Verify'}
            </Button>

            <div className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorCode('');
                  setTwoFactorError(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {useBackupCode ? 'Use authenticator app instead' : 'Use a backup code instead'}
              </button>
              <button
                type="button"
                onClick={backToLogin}
                className="text-sm text-[#737373] hover:text-[#374151]"
              >
                Back to login
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-5 sm:space-y-6"
            noValidate
          >
            <FormError message={error} onDismiss={() => setError('')} />

            <TextInput
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              onBlur={() => setEmailTouched(true)}
              required
              error={emailError}
              touched={emailTouched}
              placeholder="admin@dgb.local"
              autoComplete="email"
            />

            <TextInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              onBlur={() => setPasswordTouched(true)}
              required
              error={passwordError}
              touched={passwordTouched}
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <Button type="submit" variant="primary" loading={loading} fullWidth>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        <TurnstileVerificationModal
          isOpen={isTurnstileOpen}
          onClose={handleTurnstileClose}
          onSuccess={handleTurnstileSuccess}
          onError={handleTurnstileError}
        />
      </div>
    </div>
  );
}

export default LoginPage;
