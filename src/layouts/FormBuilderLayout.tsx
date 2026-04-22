import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { authService, settingsService } from '../services';
import type { User, AppSettings } from '../types';
import { useSidebarCollapse } from '../hooks/useSidebarCollapse';

interface FormBuilderLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageIcon?: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to?: string;
  children?: { label: string; to: string }[];
}

const chartIcon = (
  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const getFormNavItems = (slug: string): NavItem[] => [
  {
    label: 'Title',
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
    to: `/dashboard/f/${slug}/title`,
  },
  {
    label: 'Form Builder',
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m3-4.5c0 1.875-0.75 3.75-2.25 5.25s-3.375 2.25-5.25 2.25" />
      </svg>
    ),
    to: `/dashboard/f/${slug}/builder`,
  },
  {
    label: 'Submissions',
    icon: (
      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5m-16.5 3.75h16.5M3.75 19.5h16.5m-16.5-7.5h16.5" />
      </svg>
    ),
    to: `/dashboard/f/${slug}/submissions`,
  },
  {
    label: 'Reports',
    icon: chartIcon,
    children: [
      { label: 'Charts', to: `/dashboard/f/${slug}/report/charts` },
      { label: 'Tables', to: `/dashboard/f/${slug}/report/tables` },
    ],
  },
];

function FormBuilderLayout({ children, pageTitle, pageIcon }: FormBuilderLayoutProps) {
  const { formSlug } = useParams<{ formSlug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isCollapsed, isMobileOpen, toggleCollapse, openMobile, closeMobile } = useSidebarCollapse();

  const navItems = formSlug ? getFormNavItems(formSlug) : [];

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

  const isChildActive = (children: { to: string }[]) => {
    return children.some(child => location.pathname === child.to);
  };

  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    const currentItem = navItems.find(item =>
      item.children?.some(child => location.pathname.startsWith(child.to))
    );
    return currentItem?.label || null;
  });

  const toggleExpand = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  const renderNavItem = (item: NavItem) => {
    if (item.children) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg font-medium transition-all duration-200 relative group ${isChildActive(item.children)
                ? 'bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]'
                : 'text-[#525252] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]'
              }`}
          >
            <div className="flex items-center">
              {item.icon}
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </div>
            {!isCollapsed && (
              <svg
                className={`h-3 w-3 transition-transform ${expandedItem === item.label ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                {item.label}
              </div>
            )}
          </button>
          {expandedItem === item.label && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]'
                      : 'text-[#525252] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]'
                    }`
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.label} className="relative group">
        <NavLink
          to={item.to!}
          end={item.label === 'Title'}
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
    );
  };

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

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="relative group">
            <NavLink
              to="/dashboard"
              className="flex items-center px-3 py-2.5 rounded-lg font-medium text-[#525252] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a] transition-all duration-200 mb-3"
            >
              {location.pathname === '/dashboard' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              )}
              {!isCollapsed && <span className="ml-3">Module Portal</span>}
            </NavLink>
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                Module Portal
              </div>
            )}
          </div>

          {formSlug && !isCollapsed && (
            <div className="mb-3 pb-3 border-b border-[rgba(0,0,0,0.08)]">
              <div className="px-3 text-[10px] font-bold text-[#a1a1a1] uppercase tracking-wider">
                Form: {formSlug}
              </div>
              <a
                href={`/f/${formSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-[rgba(0,0,0,0.04)] rounded-lg transition-colors"
              >
                <svg className="h-4 w-4 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Visit Form Page
              </a>
            </div>
          )}

          {navItems.map(renderNavItem)}
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
              {user?.name || user?.email || 'User'}
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

export default FormBuilderLayout;
