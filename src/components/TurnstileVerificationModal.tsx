import { useEffect, useCallback, useRef } from 'react';
import { useTurnstile } from '../hooks';
import { Button } from '../components';

interface TurnstileVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
}

const TURNSTILE_CONTAINER_ID = 'turnstile-widget-container';

function TurnstileVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: TurnstileVerificationModalProps) {
  const { token, isLoading, error, reset, render } = useTurnstile();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      render(TURNSTILE_CONTAINER_ID);
    } else {
      reset();
    }
  }, [isOpen, render, reset]);

  useEffect(() => {
    if (token && isOpen) {
      onSuccess(token);
    }
  }, [token, isOpen, onSuccess]);

  useEffect(() => {
    if (error && isOpen) {
      onError(error);
    }
  }, [error, isOpen, onError]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="turnstile-modal-title"
    >
      <div className="fixed inset-0 bg-black/70" onClick={handleCancel} />

      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          relative bg-gray-900 rounded-lg shadow-sm w-full max-w-md
          ${isMobile ? 'h-full max-h-none' : 'max-h-[90vh] overflow-y-auto'}
        `}
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-8 w-8 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>

            <h2
              id="turnstile-modal-title"
              className="text-2xl font-bold text-white mb-2"
            >
              Verify You're Human
            </h2>
            <p className="text-[#a1a1a1]">
              Complete the verification to proceed
            </p>
          </div>

          <div className="flex justify-center">
            <div
              id={TURNSTILE_CONTAINER_ID}
              className="min-h-[65px] flex items-center justify-center"
            />
          </div>

          {isLoading && (
            <div className="text-center text-[#a1a1a1] text-sm">
              <div className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading verification...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <div>
                  <p className="text-red-400 text-sm font-medium">
                    Verification Error
                  </p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[#737373] text-xs">
            Taking too long?{' '}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              Refresh page
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TurnstileVerificationModal;