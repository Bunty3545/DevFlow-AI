'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../services/api';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  Percent,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Layers,
  Plus
} from 'lucide-react';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardAnalytics();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-xs font-semibold text-slate-500">Aggregating National Infrastructure Data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        <p className="font-semibold">{error || 'Unable to load dashboard data.'}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, sectorAnalytics, riskDistribution, statusDistribution, expenditureTrends, recentActivities, criticalAlerts } = data;

  const kpis = [
    {
      title: 'Total Projects',
      value: summary.totalProjects,
      sub: 'Monitored under MoSPI',
      icon: FolderKanban,
      color: 'blue',
      badge: 'Active'
    },
    {
      title: 'Projects On Track',
      value: summary.onTrack,
      sub: 'Normal velocity & CPI',
      icon: CheckCircle2,
      color: 'emerald',
      badge: `${Math.round((summary.onTrack / (summary.totalProjects || 1)) * 100)}%`
    },
    {
      title: 'Projects Delayed',
      value: summary.delayed,
      sub: 'Physical progress lag > 10%',
      icon: Clock,
      color: 'amber',
      badge: `${summary.delayed} Needs Attention`
    },
    {
      title: 'High / Critical Risk',
      value: summary.highRisk,
      sub: 'Risk Score ≥ 50 or Critical',
      icon: AlertTriangle,
      color: 'rose',
      badge: 'Escalated'
    },
    {
      title: 'Total Approved Budget',
      value: `₹${(summary.totalApprovedBudget / 1000).toFixed(1)}k Cr`,
      sub: `Revised: ₹${(summary.totalRevisedBudget / 1000).toFixed(1)}k Cr`,
      icon: IndianRupee,
      color: 'indigo'
    },
    {
      title: 'Total Expenditure',
      value: `₹${(summary.totalExpenditure / 1000).toFixed(1)}k Cr`,
      sub: `Utilization Rate: ${summary.budgetUtilizationRate}%`,
      icon: TrendingUp,
      color: 'teal'
    },
    {
      title: 'Avg. Physical Progress',
      value: `${summary.avgPhysicalProgress}%`,
      sub: `Target Planned: ${summary.avgPlannedProgress}%`,
      icon: Percent,
      color: 'cyan'
    },
    {
      title: 'Total Cost Overruns',
      value: `₹${summary.totalCostOverrun.toLocaleString('en-IN')} Cr`,
      sub: 'Cumulative budget slippage',
      icon: ShieldAlert,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gov-darkCard p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Executive Infrastructure Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 text-[10px] font-bold">
              MoSPI Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time descriptive and predictive monitoring for central mega projects exceeding ₹150 Crore.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Project</span>
          </button>

          <Link
            href="/gis-map"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Activity className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>GIS Map View</span>
          </Link>

          <Link
            href="/reports"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <span>Generate Dossier</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <CreateProjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadDashboard}
      />

      {/* 8 Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {kpi.title}
                </span>
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {kpi.value}
                </span>
                {kpi.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {kpi.badge}
                  </span>
                )}
              </div>

              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {kpi.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Section: Sector-wise Outlay + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector-wise Approved vs Expenditure Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Sector-wise Financial Allocation & Expenditure (₹ Cr)
              </h2>
              <p className="text-[11px] text-slate-400">
                Approved Capital vs Actual Expenditure across MoSPI Priority Sectors
              </p>
            </div>
            <Link href="/financials" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1">
              <span>Deep-dive</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorAnalytics} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="sector" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} Cr`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="approvedCost" name="Approved Budget" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenditure" name="Actual Expenditure" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Donut */}
        <div className="rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Project Risk Distribution
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                EVM Scoring
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Multi-factor assessment based on CPI, SPI, and bottlenecks
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {riskDistribution.map((r: any, idx: number) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {r.name}: <strong className="text-slate-900 dark:text-white">{r.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Expenditure Trends Line Chart + Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned vs Actual Quarterly Spending */}
        <div className="lg:col-span-2 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Quarterly Expenditure S-Curve Trajectory (₹ Cr)
              </h2>
              <p className="text-[11px] text-slate-400">
                Tracking planned cash-flow disbursement vs actual site absorption
              </p>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Absorptive Capacity: Steady
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenditureTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff'
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} Cr`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="planned" name="Planned Outlay" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="actual" name="Actual Expenditure" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Alerts & Bottlenecks Panel */}
        <div className="rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Critical Project Alerts</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
                Action Required
              </span>
            </div>

            <div className="space-y-2.5">
              {criticalAlerts && criticalAlerts.length > 0 ? (
                criticalAlerts.slice(0, 4).map((alert: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-red-800 dark:text-red-300 truncate max-w-[180px]">
                        {alert.projectId}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 font-bold">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                      {alert.title}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No critical alerts logged.</p>
              )}
            </div>
          </div>

          <Link
            href="/issues"
            className="mt-4 flex items-center justify-center space-x-1.5 w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <span>View All Bottlenecks & Issues</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Row 3: Live AI Recommendations + Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations Card */}
        <div className="lg:col-span-2 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/20 dark:via-gov-darkCard dark:to-indigo-950/20 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                DevFlow AI – Predictive Early-Warning Insights
              </h2>
            </div>
            <Link
              href="/ai-assistant"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Ask AI Copilot</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Eastern DFC (PRJ-IR-002)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                CPI is critically low at <strong>0.76</strong> with 18.2 months projected delay. Recommended immediate intervention with State Power Transmission Utility for tower relocation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Bundelkhand Water Grid (PRJ-JJM-004)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Hard granite strata in Mauranipur block requires fast-tracking micro-blasting safety clearance to prevent 4-month slippage on water treatment commissioning.
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Audit Trail */}
        <div className="rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Recent System Activity
          </h2>

          <div className="space-y-3">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.slice(0, 4).map((act: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {act.details}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.userName}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No recent logs recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

