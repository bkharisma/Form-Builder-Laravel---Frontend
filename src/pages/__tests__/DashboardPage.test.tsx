import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DashboardPage from '../DashboardPage';
import { authService } from '../../services';

vi.mock('../../services', () => ({
  authService: {
    getUser: vi.fn(),
  },
}));

describe('DashboardPage Module Cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3 module cards for admin users', async () => {
    vi.mocked(authService.getUser).mockResolvedValue({
      user: { id: 1, name: 'Admin', role: 'admin' }
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form Builder')).toBeInTheDocument();
      expect(screen.getByText('Event Manager')).toBeInTheDocument();
      expect(screen.getByText('App Administration')).toBeInTheDocument();
    });
  });

  it('renders only 2 module cards for non-admin users', async () => {
    vi.mocked(authService.getUser).mockResolvedValue({
      user: { id: 2, name: 'Manager', role: 'manager' }
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Form Builder')).toBeInTheDocument();
      expect(screen.getByText('Event Manager')).toBeInTheDocument();
      expect(screen.queryByText('App Administration')).not.toBeInTheDocument();
    });
  });
});
