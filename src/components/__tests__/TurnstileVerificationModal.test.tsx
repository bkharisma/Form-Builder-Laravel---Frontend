import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TurnstileVerificationModal from '../TurnstileVerificationModal';

vi.mock('../../hooks', () => ({
  useTurnstile: vi.fn(),
}));

import { useTurnstile } from '../../hooks';

const mockUseTurnstile = vi.mocked(useTurnstile);

describe('TurnstileVerificationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockReset = vi.fn();
  const mockRender = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTurnstile.mockReturnValue({
      token: null,
      isLoading: false,
      error: null,
      reset: mockReset,
      render: mockRender,
    });
  });

  it('does not render when isOpen is false', () => {
    render(
      <TurnstileVerificationModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(screen.queryByText("Verify You're Human")).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(screen.getByText("Verify You're Human")).toBeInTheDocument();
    expect(screen.getByText('Complete the verification to proceed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByText('Refresh page')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const backdrop = screen.getByRole('dialog').querySelector('.fixed.inset-0.bg-black\\/70');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('displays error message when error is present', () => {
    mockUseTurnstile.mockReturnValue({
      token: null,
      isLoading: false,
      error: 'Verification failed. Please try again.',
      reset: mockReset,
      render: mockRender,
    });

    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Verification Error')).toBeInTheDocument();
    expect(screen.getByText('Verification failed. Please try again.')).toBeInTheDocument();
    expect(mockOnError).toHaveBeenCalledWith('Verification failed. Please try again.');
  });

  it('displays loading state when isLoading is true', () => {
    mockUseTurnstile.mockReturnValue({
      token: null,
      isLoading: true,
      error: null,
      reset: mockReset,
      render: mockRender,
    });

    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Loading verification...')).toBeInTheDocument();
  });

  it('calls onSuccess when token is received', () => {
    mockUseTurnstile.mockReturnValue({
      token: 'test-token-123',
      isLoading: false,
      error: null,
      reset: mockReset,
      render: mockRender,
    });

    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(mockOnSuccess).toHaveBeenCalledWith('test-token-123');
  });

  it('calls render when modal opens', () => {
    const { rerender } = render(
      <TurnstileVerificationModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(mockRender).not.toHaveBeenCalled();

    rerender(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(mockRender).toHaveBeenCalledWith('turnstile-widget-container');
  });

  it('calls reset when modal closes', () => {
    const { rerender } = render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(mockRender).toHaveBeenCalled();

    rerender(
      <TurnstileVerificationModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    expect(mockReset).toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(
      <TurnstileVerificationModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'turnstile-modal-title');
    expect(screen.getByText("Verify You're Human")).toHaveAttribute('id', 'turnstile-modal-title');
  });
});