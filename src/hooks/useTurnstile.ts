import { useState, useCallback, useRef, useEffect } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: (error: string) => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  language?: string;
}

interface UseTurnstileReturn {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
  render: (containerId: string) => void;
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

export function useTurnstile(): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may not exist
        }
      }
    };
  }, []);

  const handleSuccess = useCallback((newToken: string) => {
    setToken(newToken);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((errorCode: string) => {
    setError(errorCode);
    setToken(null);
    setIsLoading(false);
  }, []);

  const handleExpired = useCallback(() => {
    setToken(null);
    setIsLoading(true);
  }, []);

  const render = useCallback((containerId: string) => {
    if (!window.turnstile) {
      setError('Turnstile script not loaded. Please refresh the page.');
      setIsLoading(false);
      return;
    }

    if (!TURNSTILE_SITE_KEY) {
      setError('Turnstile site key not configured.');
      setIsLoading(false);
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      setError('Turnstile container not found.');
      setIsLoading(false);
      return;
    }

    container.innerHTML = '';

    setIsLoading(true);
    setError(null);
    setToken(null);

    try {
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: handleSuccess,
        'error-callback': handleError,
        'expired-callback': handleExpired,
        theme: 'dark',
        size: 'normal',
      });
    } catch (err) {
      setError('Failed to initialize Turnstile. Please refresh and try again.');
      setIsLoading(false);
    }
  }, [handleSuccess, handleError, handleExpired]);

  const reset = useCallback(() => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        setToken(null);
        setError(null);
        setIsLoading(true);
      } catch {
        // Widget may not be in a resettable state
      }
    }
  }, []);

  return {
    token,
    isLoading,
    error,
    reset,
    render,
  };
}