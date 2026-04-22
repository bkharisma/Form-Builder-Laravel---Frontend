import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import FormsLayout from '../FormsLayout';
import { authService, settingsService } from '../../services';

vi.mock('../../services', () => ({
  authService: {
    getUser: vi.fn().mockResolvedValue({ user: { id: 1, name: 'Admin', role: 'admin' } }),
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

const renderWithRouter = (path: string) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FormsLayout pageTitle="Test Page">
        <div>Test Content</div>
      </FormsLayout>
    </MemoryRouter>
  );
};

describe('FormsLayout Sidebar Filtering', () => {
  it('shows only Dashboard in sidebar when on /dashboard', async () => {
    renderWithRouter('/dashboard');
    
    expect(screen.getByText('Module Portal')).toBeInTheDocument();
    expect(screen.queryByText('Forms')).not.toBeInTheDocument();
    expect(screen.queryByText('Event Manager')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Users')).not.toBeInTheDocument();
  });

  it('shows Dashboard and Forms in sidebar when on /dashboard/forms', async () => {
    renderWithRouter('/dashboard/forms');
    
    expect(screen.getByText('Module Portal')).toBeInTheDocument();
    expect(screen.getByText('Forms')).toBeInTheDocument();
    expect(screen.queryByText('Event Manager')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin Users')).not.toBeInTheDocument();
  });

  it('shows all items (fallback) for other dashboard paths using FormsLayout', async () => {
    renderWithRouter('/dashboard/profile');
    
    expect(screen.getByText('Module Portal')).toBeInTheDocument();
    expect(screen.getByText('Forms')).toBeInTheDocument();
    expect(screen.getByText('Event Manager')).toBeInTheDocument();
    expect(screen.getByText('Admin Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
