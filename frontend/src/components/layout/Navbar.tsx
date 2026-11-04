'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bell,
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Activity,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Navbar() {
  const { user, role, logout, switchRoleForDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ' • ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<UserRole, { label: string; color: string; badge: string }> = {
    admin: { label: 'Administrator', color: 'bg-red-500/10 text-red-600 border-red-300 dark:border-red-800', badge: 'MoSPI IPMD Admin' },
    officer: { label: 'Monitoring Officer', color: 'bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800', badge: 'Central Officer' },
    manager: { label: 'Project Manager', color: 'bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800', badge: 'NHAI / Project Lead' },
    agency: { label: 'Implementing Agency', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800', badge: 'Contractor Agency' }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gov-border dark:border-gov-darkBorder bg-white/95 dark:bg-gov-darkCard/95 px-4 md:px-6 backdrop-blur transition-colors">
      {/* Left: Branding & Portal Title */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-900 to-indigo-600 text-white shadow-md group-hover:scale-105 transition-transform">
            <Activity className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-gov-navy dark:text-white">
                DevFlow <span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
              <span className="rounded bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800 dark:text-blue-300">
                Enterprise v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              AI-Powered Software Development & Project Intelligence Platform
            </p>
          </div>
        </Link>
      </div>

      {/* Middle: Live Time & Status Indicator */}
      <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-medium">Live Telemetry Active</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>{currentTime}</span>
      </div>

      {/* Right: Quick Role Switcher, Dark Mode, Profile */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${roleLabels[role]?.color || ''}`}
            title="Switch User Role to test Role-Based Access Control"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{roleLabels[role]?.label || role}</span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role (Demo)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enforces backend security permissions dynamically:
                </p>
              </div>

              {(['admin', 'officer', 'manager', 'agency'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRoleForDemo(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
                    role === r
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`h-2 w-2 rounded-full ${r === 'admin' ? 'bg-red-500' : r === 'officer' ? 'bg-blue-500' : r === 'manager' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <span>{roleLabels[r].label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{roleLabels[r].badge}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* AI Assistant Quick Pill */}
        <Link
          href="/ai-assistant"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-medium shadow-sm transition-all"
        >
          <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-spin-slow" />
          <span className="hidden sm:inline">AI Copilot</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-300 dark:border-blue-700">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'IN'}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold leading-none text-slate-800 dark:text-slate-200">
                {user?.name || 'Authorized Official'}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {user?.department || 'MoSPI Cell'}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 inline-block text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                  {user?.role} Access Level
                </div>
              </div>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>System Settings</span>
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center space-x-2 px-3 py-2 text-xs rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

