import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services';
import type { User } from '../types';

const FORM_ICON_PATH = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";

const ADMIN_ICON_PATH = "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z";
const ARROW_ICON_PATH = "M17 8l4 4m0 0l-4 4m4-4H3";

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    authService.getUser().then((res) => {
      setUser(res.user);
    }).catch(() => { });
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a1a] tracking-tight mb-4">
          Welcome back, {user?.name || 'User'}
        </h1>
        <p className="text-lg text-[#737373] max-w-2xl mx-auto">
          Select a module below to manage your operations.
        </p>
      </div>

      <div className={`grid ${isAdmin ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-lg mx-auto'} gap-6 sm:gap-8 px-4 sm:px-0`}>
        <Link to="/dashboard/forms" className="group block h-full">
          <div className="h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-[rgba(0,0,0,0.08)] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-blue-600">
              <svg className="w-20 h-20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d={FORM_ICON_PATH} />
              </svg>
            </div>
            <div className="p-8 sm:p-10 relative z-10">
              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={FORM_ICON_PATH} />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-3 group-hover:text-blue-600 transition-colors">Form Builder</h2>
              <p className="text-[#737373] text-sm mb-6 line-clamp-2">
                Create, design, and manage dynamic forms. View submissions and generate detailed analytics reports.
              </p>
              <div className="inline-flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                Enter Module
                <svg className="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW_ICON_PATH} />
                </svg>
              </div>
            </div>
          </div>
        </Link>



        {isAdmin && (
          <Link to="/dashboard/admin-users" className="group block h-full">
            <div className="h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-[rgba(0,0,0,0.08)] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-blue-600">
                <svg className="w-20 h-20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={ADMIN_ICON_PATH} />
                </svg>
              </div>
              <div className="p-8 sm:p-10 relative z-10">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ADMIN_ICON_PATH} />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-3 group-hover:text-blue-600 transition-colors">App Administration</h2>
                <p className="text-[#737373] text-sm mb-6 line-clamp-2">
                  Manage administrative users, roles, and overall application settings.
                </p>
                <div className="inline-flex items-center text-blue-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Enter Module
                  <svg className="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ARROW_ICON_PATH} />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;