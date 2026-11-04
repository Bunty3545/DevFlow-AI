'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  Eye,
  LineChart,
  BrainCircuit,
  AlertTriangle,
  Milestone,
  IndianRupee,
  MapPin,
  FileSpreadsheet,
  Users,
  Settings,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  interface NavItem {
    name: string;
    href: string;
    icon: any;
    badge?: string;
    adminOnly?: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navigationGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'GIS Project Map', href: '/gis-map', icon: MapPin }
      ]
    },
    {
      title: 'PROJECT OPERATIONS',
      items: [
        { name: 'All Projects', href: '/projects', icon: FolderKanban },
        { name: 'Project Monitoring', href: '/monitoring', icon: Eye }
      ]
    },
    {
      title: 'AI & PREDICTIVE ANALYTICS',
      items: [
        { name: 'Predictive Risk Analytics', href: '/risk-analytics', icon: LineChart, badge: 'EVM' },
        { name: 'AI Project Assistant', href: '/ai-assistant', icon: BrainCircuit, badge: 'AI' },
        { name: 'Financial Analytics', href: '/financials', icon: IndianRupee }
      ]
    },
    {
      title: 'GOVERNANCE & EXECUTION',
      items: [
        { name: 'Issue Management', href: '/issues', icon: AlertTriangle },
        { name: 'Milestone Tracking', href: '/milestones', icon: Milestone },
        { name: 'Reports & Export', href: '/reports', icon: FileSpreadsheet }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { name: 'User Management', href: '/users', icon: Users, adminOnly: true },
        { name: 'System Settings', href: '/settings', icon: Settings },
        { name: 'My Profile', href: '/profile', icon: UserCheck }
      ]
    }
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-gov-border dark:border-gov-darkBorder bg-slate-50/80 dark:bg-gov-darkBg transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0 min-h-[calc(100vh-4rem)]`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationGroups.map((group, gIdx) => {
          // Filter out items that require admin role if not admin
          const visibleItems = group.items.filter(item => !item.adminOnly || role === 'admin');
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </p>
              )}
              {visibleItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600'}`} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / System Status */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>DevFlow AI Intelligence</span>
          </div>
          <p className="mt-1 text-[10px] leading-tight text-slate-400">
            Predictive EVM Engine v2.4 (Active Monitoring)
          </p>
        </div>
      )}
    </aside>
  );
}
