'use client';

import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, switchRoleForDemo } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthRoute = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    // If not authenticated and not on login page, auto-login as officer/admin for instant demo experience
    if (!isLoading && !isAuthenticated && !isAuthRoute) {
      switchRoleForDemo('officer').catch(() => {
        router.push('/login');
      });
    }
  }, [isLoading, isAuthenticated, isAuthRoute, router, switchRoleForDemo]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Loading DevFlow AI Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

