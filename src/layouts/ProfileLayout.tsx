import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { authService, settingsService } from '../services';
import type { User, AppSettings } from '../types';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

interface ProfileLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageIcon?: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

function ProfileLayout({ children, pageTitle, pageIcon }: ProfileLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isCollapsed, isMobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebarCollapse();

  const navItems: NavItem[] = [
    {
      label: 'Module Portal',
      to: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
    },
  ];

  const fetchUser = useCallback(() => {
    authService.getUser()
      .then((res) => setUser(res.user))
      .catch(() => navigate('/login'));
  }, [navigate]);

  const fetchSettings = useCallback(() => {
    settingsService.getPublicSettings()
      .then((res) => setSettings(res as unknown as AppSettings))
      .catch(() => { });
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

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
    } finally {
      navigate('/login');
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <div className="flex h-screen bg-[#ffffff] font-sans text-[#1a1a1a]">
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMobile} />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 ${sidebarWidth} flex-shrink-0 bg-[#f5f5f5] flex flex-col border-r border-[rgba(0,0,0,0.08)] z-50 md:z-20 transform transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-4 bg-[#f0f0f0] border-b border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center overflow-hidden">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-8 object-contain rounded flex-shrink-0" />
            ) : (
              <span className="text-blue-500 text-xl flex-shrink-0">◈</span>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-[#737373] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a] transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21,2H3A1,1,0,0,0,2,3V21a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V3A1,1,0,0,0,21,2ZM14,20H4V4H14Zm6,0H16V4h4Z" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <div key={item.to} className="relative group">
              <NavLink
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${isActive
                    ? 'bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]'
                    : 'text-[#525252] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]'
                  }`
                }
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={openMobile}
              className="md:hidden p-2 text-[#525252] hover:bg-[rgba(0,0,0,0.04)] rounded-lg"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="flex items-center text-[#1a1a1a] font-semibold text-lg tracking-tight">
              {pageIcon}
              <span className="ml-2">{pageTitle}</span>
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
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfileLayout;
