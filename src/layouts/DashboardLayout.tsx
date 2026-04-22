import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, settingsService } from '../services';
import type { User, AppSettings } from '../types';
import { Sidebar } from '../components';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isCollapsed, isMobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebarCollapse();

  const fetchUser = useCallback(() => {
    authService.getUser()
      .then((res) => setUser(res.user))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const fetchSettings = useCallback(() => {
    settingsService.getPublicSettings()
      .then((res) => setSettings(res as unknown as AppSettings))
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    fetchUser();
    fetchSettings();
  }, [fetchUser, fetchSettings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      navigate('/login');
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-[#ffffff] flex">
      <Sidebar
        isOpen={isMobileOpen}
        onClose={closeMobile}
        appName={settings?.app_name || 'Form Builder Admin'}
        logoUrl={settings?.logo_url}
        userRole={user?.role}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-30">
          <div className="px-3 sm:px-4 lg:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={openMobile}
                className="lg:hidden p-2 text-[#525252] hover:bg-[rgba(0,0,0,0.04)] rounded-lg"
                aria-label="Toggle menu"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <div className="hidden sm:flex items-center text-[#1a1a1a] font-semibold text-lg tracking-tight">
                {settings?.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-6 w-6 object-contain rounded mr-2" />
                ) : (
                  <span className="text-blue-500 text-lg mr-2">◈</span>
                )}
                {settings?.app_name || 'Form Builder Admin'}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-[#525252] truncate max-w-[120px] sm:max-w-none hidden sm:block">
                {user?.name || user?.email || 'Admin'}
              </span>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-sm font-bold text-white transition-colors"
                >
                  {initials}
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)] py-1 z-50">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        navigate('/dashboard/profile');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-[#374151] hover:bg-[rgba(0,0,0,0.04)]"
                    >
                      <svg className="h-4 w-4 mr-2 text-[#a1a1a1]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.375 3.375 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
