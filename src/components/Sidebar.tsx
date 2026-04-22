import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  logoUrl?: string | null;
  userRole?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  children?: { label: string; to: string }[];
}

const Sidebar = ({ isOpen, onClose, logoUrl, userRole, isCollapsed = false, onToggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const isFormContext = location.pathname.startsWith('/dashboard/forms/');
  const currentSlug = isFormContext ? location.pathname.split('/')[3] : null;

  const homeIcon = (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const backArrowIcon = (
    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  const globalNavItems: NavItem[] = [
    {
      label: 'Module Portal',
      icon: location.pathname === '/dashboard' ? homeIcon : backArrowIcon,
      to: '/dashboard',
    },
    {
      label: 'Forms',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      to: '/dashboard/forms',
    },

    {
      label: 'Admin Users',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      to: '/dashboard/admin-users',
    },
    {
      label: 'App Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      to: '/dashboard/settings',
    },
  ];

  const getFormNavItems = (slug: string): NavItem[] => [
    {
      label: 'Forms Dashboard',
      to: `/dashboard/forms/${slug}`,
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      ),
    },
    {
      label: 'Title',
      to: `/dashboard/f/${slug}/title`,
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
    },
    {
      label: 'Form Builder',
      to: `/dashboard/f/${slug}/builder`,
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3h9m3-4.5c0 1.875-0.75 3.75-2.25 5.25s-3.375 2.25-5.25 2.25" />
        </svg>
      ),
    },
    {
      label: 'Submissions',
      to: `/dashboard/f/${slug}/submissions`,
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5m-16.5 3.75h16.5M3.75 19.5h16.5m-16.5-7.5h16.5" />
        </svg>
      ),
    },
    {
      label: 'Reports',
      to: `/dashboard/f/${slug}/report/charts`,
      icon: (
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      children: [
        { label: 'Charts', to: `/dashboard/f/${slug}/report/charts` },
        { label: 'Tables', to: `/dashboard/f/${slug}/report/tables` },
      ],
    },
  ];

  let currentNavItems = isFormContext && currentSlug ? getFormNavItems(currentSlug) : globalNavItems;
  if (userRole === 'user' && !isFormContext) {
    currentNavItems = currentNavItems.filter(item =>
      item.label !== 'Admin Users' && item.label !== 'App Settings'
    );
  }

  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    const currentItem = currentNavItems.find(item =>
      item.children?.some(child => location.pathname.startsWith(child.to))
    );
    return currentItem?.label || null;
  });

  const isChildActive = (children: { to: string }[]) => {
    return children.some(child => location.pathname === child.to);
  };

  const toggleExpand = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full ${sidebarWidth} bg-[#f5f5f5] border-r border-[rgba(0,0,0,0.08)] z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 bg-[#f0f0f0] border-b border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded flex-shrink-0" />
              ) : (
                <span className="text-blue-500 text-xl flex-shrink-0">◈</span>
              )}
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-[#737373] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a] transition-colors"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21,2H3A1,1,0,0,0,2,3V21a1,1,0,0,0,1,1H21a1,1,0,0,0,1-1V3A1,1,0,0,0,21,2ZM14,20H4V4H14Zm6,0H16V4h4Z" />
                </svg>
              </button>
            )}
          </div>

          <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 overflow-y-auto">
            {isFormContext && currentSlug && !isCollapsed && (
              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-[rgba(0,0,0,0.08)]">
                <NavLink
                  to="/dashboard"
                  onClick={onClose}
                  className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#737373] hover:text-[#1a1a1a] transition-colors"
                >
                  {location.pathname === '/dashboard' ? homeIcon : backArrowIcon}
                  Back to Portal
                </NavLink>
                <div className="mt-2 sm:mt-3 px-2 text-[10px] sm:text-xs font-bold text-[#a1a1a1] uppercase tracking-wider">
                  Form: {currentSlug}
                </div>
              </div>
            )}

            {currentNavItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`flex items-center justify-between w-full px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors relative ${
                        isChildActive(item.children)
                          ? 'bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]'
                          : 'text-[#525252] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        {item.icon}
                        {!isCollapsed && item.label}
                      </div>
                      {!isCollapsed && (
                        <svg
                          className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${expandedItem === item.label ? 'rotate-180' : ''}`}
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
                      <div className="ml-3 sm:ml-4 mt-1 space-y-1 border-l border-[rgba(0,0,0,0.08)]">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                isActive
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
                  </>
                ) : (
                  <div className="relative group">
                    <NavLink
                      to={item.to!}
                      end={item.to === '/dashboard'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[rgba(0,0,0,0.08)] text-[#1a1a1a]'
                            : 'text-[#525252] hover:bg-[rgba(0,0,0,0.04)] hover:text-[#1a1a1a]'
                        }`
                      }
                    >
                      {item.icon}
                      {!isCollapsed && item.label}
                    </NavLink>
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1a] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
