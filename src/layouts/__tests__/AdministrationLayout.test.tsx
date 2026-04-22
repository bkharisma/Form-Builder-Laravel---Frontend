import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdministrationLayout from '../AdministrationLayout';
import { authService, settingsService } from '../../services';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../services', () => ({
  authService: {
    getUser: vi.fn(),
    logout: vi.fn(),
  },
  settingsService: {
    getPublicSettings: vi.fn().mockResolvedValue({ app_name: 'Test App' }),
  },
}));

vi.mock('../../hooks/useSidebarCollapse', () => ({
  useSidebarCollapse: () => ({
    isCollapsed: false,
    isMobileOpen: false,
    toggleCollapse: vi.fn(),
    openMobile: vi.fn(),
    closeMobile: vi.fn(),
  }),
}));

describe('AdministrationLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar items for admins', async () => {
    vi.mocked(authService.getUser).mockResolvedValue({
      user: { id: 1, name: 'Admin', role: 'admin' }
    });

    render(
      <MemoryRouter>
        <AdministrationLayout pageTitle="Admin Area">
          <div>Admin Content</div>
        </AdministrationLayout>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Module Portal')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('App Settings')).toBeInTheDocument();
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('redirects non-admins to dashboard', async () => {
    vi.mocked(authService.getUser).mockResolvedValue({
      user: { id: 2, name: 'User', role: 'user' }
    });

    render(
      <MemoryRouter>
        <AdministrationLayout pageTitle="Admin Area">
          <div>Secret Content</div>
        </AdministrationLayout>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});
