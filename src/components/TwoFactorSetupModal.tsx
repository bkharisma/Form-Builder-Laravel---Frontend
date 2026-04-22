import { useState, useEffect, useRef, useCallback } from 'react';
import { profileService } from '../services';
import type { TwoFactorSetupResponse } from '../types';
import { Button, Toast } from '../components';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

function TwoFactorSetupModal({ isOpen, onClose, onComplete }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasLoadedRef.current) {
      setLoading(true);
      profileService.enableTwoFactor()
        .then((data) => {
          setSetupData(data);
          setStep(1);
          hasLoadedRef.current = true;
        })
        .catch(() => {
          setToast({ message: 'Failed to generate 2FA setup data.', type: 'error' });
        })
        .finally(() => {
          setLoading(false);
        });
    }
    if (!isOpen) {
      hasLoadedRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 3) {
      setVerifyCode('');
      setVerifyError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setVerifyCode('');
      setVerifyError('');
      setAcknowledged(false);
      setSecretVisible(false);
      setCopied(false);
      setCodesCopied(false);
    }
  }, [isOpen]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleClose = () => {
    setSetupData(null);
    setStep(1);
    setVerifyCode('');
    setVerifyError('');
    setAcknowledged(false);
    onClose();
  };

  const handleCopySecret = async () => {
    if (!setupData) return;
    await navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAllCodes = async () => {
    if (!setupData) return;
    await navigator.clipboard.writeText(setupData.backup_codes.join('\n'));
    setCodesCopied(true);
    setTimeout(() => setCodesCopied(false), 2000);
  };

  const handleVerifyCodeChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setVerifyCode(cleaned);
    setVerifyError('');
  };

  const handleVerifyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verifyCode.length === 6 && !verifyLoading) {
      handleVerifySubmit();
    }
  };

  const handleVerifySubmit = async () => {
    if (verifyCode.length !== 6) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      await profileService.verifyTwoFactor(verifyCode);
      showToast('Two-factor authentication has been enabled', 'success');
      handleClose();
      onComplete();
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setVerifyError(apiError.message || 'Invalid code. Please try again.');
      setVerifyCode('');
      setTimeout(() => inputRef.current?.focus(), 100);
    } finally {
      setVerifyLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[rgba(0,0,0,0.08)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a]">Enable Two-Factor Authentication</h2>
            <p className="text-sm text-[#737373] mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#a1a1a1] hover:text-[#525252] transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

        {loading ? (
          <div className="p-6 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-[#525252] mt-4">Generating setup data...</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {step === 1 && setupData && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-base text-[#525252]">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>

                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupData.qr_code_url)}`}
                    alt="QR Code for 2FA setup"
                    className="w-48 h-48 rounded-lg border-2 border-[rgba(0,0,0,0.08)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#374151]">Secret Key</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-[#f0f0f0] border-2 border-[rgba(0,0,0,0.15)] rounded-lg font-mono text-base text-[#1a1a1a] break-all">
                      {secretVisible ? setupData.secret : '••••••••••••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecretVisible(!secretVisible)}
                      className="p-3 text-[#737373] hover:text-[#374151] border-2 border-[rgba(0,0,0,0.15)] rounded-lg hover:bg-[#f5f5f5] transition-colors"
                      aria-label={secretVisible ? 'Hide secret' : 'Show secret'}
                    >
                      {secretVisible ? (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.1 5.098M12 15.75h.007v.008H12v-.008zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-3 text-[#737373] hover:text-[#374151] border-2 border-[rgba(0,0,0,0.15)] rounded-lg hover:bg-[#f5f5f5] transition-colors"
                      aria-label="Copy secret"
                    >
                      {copied ? (
                        <svg className="h-5 w-5 text-success-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && setupData && (
              <div className="space-y-6">
                <div>
                  <p className="text-base text-[#525252] mb-4">
                    Save these backup codes in a secure place. They will not be shown again. Each code can only be used once.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {setupData.backup_codes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3 bg-[#f5f5f5] border-2 border-[rgba(0,0,0,0.08)] rounded-lg"
                    >
                      <code className="font-mono text-base text-[#1a1a1a]">{code}</code>
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
                  <Button variant="secondary" onClick={handleCopyAllCodes}>
                    {codesCopied ? 'Copied!' : 'Copy All'}
                  </Button>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <svg className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    Store these codes securely. Each code can only be used once. You can regenerate new codes later from your profile.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-[rgba(0,0,0,0.15)] text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-base text-[#374151]">I have saved my backup codes in a secure place</span>
                </label>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => setStep(3)} disabled={!acknowledged}>
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <p className="text-base text-[#525252]">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => handleVerifyCodeChange(e.target.value)}
                    onKeyDown={handleVerifyKeyDown}
                    placeholder="000000"
                    className={`
                      w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border-2 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${verifyError ? 'border-red-500 bg-red-50' : 'border-[rgba(0,0,0,0.15)] bg-white'}
                    `}
                    disabled={verifyLoading}
                    aria-label="Two-factor authentication code"
                    aria-invalid={!!verifyError}
                  />
                  {verifyError && (
                    <p className="text-red-600 text-sm text-center" role="alert">
                      {verifyError}
                    </p>
                  )}
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    variant="primary"
                    onClick={handleVerifySubmit}
                    loading={verifyLoading}
                    disabled={verifyCode.length !== 6}
                    fullWidth
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TwoFactorSetupModal;
