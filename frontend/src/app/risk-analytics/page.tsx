'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  ShieldAlert,
  TrendingDown,
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Info,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

export default function RiskAnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      if (res.success && res.data.length > 0) {
        setProjects(res.data);
        // Default to a critical/high risk project if available
        const highRisk = res.data.find((p: any) => p.riskLevel === 'Critical' || p.riskLevel === 'High') || res.data[0];
        setSelectedProject(highRisk);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const filteredProjects = filterRisk === 'All'
    ? projects
    : projects.filter(p => p.riskLevel === filterRisk);

  // Scatter chart data: X = SPI, Y = CPI, Z = RiskScore
  const scatterData = projects.map(p => ({
    name: p.name,
    projectId: p.projectId,
    spi: p.spi,
    cpi: p.cpi,
    riskScore: p.riskScore,
    riskLevel: p.riskLevel,
    approvedCost: p.approvedCost
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Predictive Risk Analytics & Early Warning System
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
              MoSPI EVM Core
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Statistical forecasting based on Earned Value Management (EVM), cost efficiency, and physical velocity.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            <option value="All">All Risk Categories</option>
            <option value="Critical">Critical Risk Only</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* EVM CPI vs SPI Quadrant Chart */}
      <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Earned Value Management (EVM) Performance Matrix
            </h2>
            <p className="text-[11px] text-slate-400">
              Schedule Performance Index (SPI, X-axis) vs Cost Performance Index (CPI, Y-axis). Baseline = (1.0, 1.0)
            </p>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span><span>Safe (≥ 1.0)</span></span>
            <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span><span>Lagging (&lt; 0.9)</span></span>
            <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500"></span><span>Critical (&lt; 0.8)</span></span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                type="number"
                dataKey="spi"
                name="SPI (Schedule Index)"
                domain={[0.5, 1.3]}
                tick={{ fontSize: 10 }}
                label={{ value: 'Schedule Performance Index (SPI)', position: 'insideBottom', offset: -10, fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="cpi"
                name="CPI (Cost Index)"
                domain={[0.5, 1.3]}
                tick={{ fontSize: 10 }}
                label={{ value: 'Cost Performance Index (CPI)', angle: -90, position: 'insideLeft', fontSize: 10 }}
              />
              <ZAxis type="number" dataKey="riskScore" range={[60, 260]} name="Risk Score" />
              <ReferenceLine x={1.0} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'SPI Baseline', fontSize: 9 }} />
              <ReferenceLine y={1.0} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'CPI Baseline', fontSize: 9 }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff'
                }}
                formatter={(val: any, name: string) => [val, name]}
              />
              <Scatter
                name="Projects"
                data={scatterData}
                onClick={(node: any) => {
                  const target = projects.find(p => p.projectId === node.projectId);
                  if (target) setSelectedProject(target);
                }}
              >
                {scatterData.map((entry, index) => {
                  const color = entry.riskLevel === 'Critical' ? '#EF4444' : entry.riskLevel === 'High' ? '#F97316' : entry.riskLevel === 'Medium' ? '#F59E0B' : '#10B981';
                  return <Cell key={`cell-${index}`} fill={color} className="cursor-pointer hover:opacity-80 transition-opacity" />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Click any point in the scatter matrix to inspect that project's risk diagnosis below.
        </p>
      </div>

      {/* Selected Project Deep-Dive Risk Audit */}
      {selectedProject && (
        <div className="p-6 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedProject.projectId}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  selectedProject.riskLevel === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : selectedProject.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedProject.riskLevel} Risk ({selectedProject.riskScore}/100)
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {selectedProject.name}
              </h2>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400">Sector: <strong>{selectedProject.sector}</strong></span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-400">Location: <strong>{selectedProject.district}, {selectedProject.state}</strong></span>
            </div>
          </div>

          {/* 4 Quantitative Forecast Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cost Performance Index (CPI)
              </span>
              <p className={`text-xl font-black mt-1 ${selectedProject.cpi >= 1.0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {selectedProject.cpi}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {selectedProject.cpi < 1.0 ? 'Over-budget relative to work done' : 'Cost efficient'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Schedule Slippage
              </span>
              <p className="text-xl font-black text-amber-500 mt-1">
                {(selectedProject.plannedProgress - selectedProject.actualProgress).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                SPI = {selectedProject.spi} (Baseline 1.0)
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Projected Cost Overrun
              </span>
              <p className="text-xl font-black text-rose-600 mt-1">
                +₹{selectedProject.projectedCostOverrun} Cr
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                EAC (Estimate at Completion)
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Projected Completion
              </span>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1.5 truncate">
                {selectedProject.predictedCompletionDate ? new Date(selectedProject.predictedCompletionDate).toLocaleDateString() : 'Dec 2026'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                +{selectedProject.projectedDelayMonths} months delay
              </p>
            </div>
          </div>

          {/* Transparent Risk Drivers & Corrective Mitigations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-xs">
              <div className="flex items-center space-x-1.5 text-red-700 dark:text-red-300 font-bold mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Primary Risk Factors (Why is this project at risk?)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedProject.aiRiskSummary || 'Physical execution lags behind target timeline with cost revision variances detected.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 text-xs">
              <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-300 font-bold mb-2">
                <Sparkles className="h-4 w-4" />
                <span>Recommended Corrective Actions (MoSPI Directive)</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 list-disc pl-4">
                <li>Deploy second civil shift for high-priority viaduct and structural sections.</li>
                <li>Convene ministerial task force with state authorities to clear pending utility relocations.</li>
                <li>Institute biometric site attendance and drone LIDAR verification every 14 days.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Priority Watchlist Table */}
      <div className="rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          High-Risk Project Surveillance Watchlist
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                <th className="py-2.5">Project ID & Name</th>
                <th className="py-2.5">Sector</th>
                <th className="py-2.5">Risk Score</th>
                <th className="py-2.5">CPI</th>
                <th className="py-2.5">SPI</th>
                <th className="py-2.5">Delay Forecast</th>
                <th className="py-2.5">Cost Overrun Forecast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProjects.map((p) => (
                <tr
                  key={p.projectId}
                  onClick={() => setSelectedProject(p)}
                  className={`cursor-pointer transition-colors ${
                    selectedProject?.projectId === p.projectId ? 'bg-blue-50/80 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    <div>{p.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{p.projectId}</span>
                  </td>
                  <td className="py-3 text-slate-600 dark:text-slate-300">{p.sector}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      p.riskLevel === 'Critical' ? 'bg-red-100 text-red-700' : p.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.riskScore} ({p.riskLevel})
                    </span>
                  </td>
                  <td className="py-3 font-bold">{p.cpi}</td>
                  <td className="py-3 font-bold">{p.spi}</td>
                  <td className="py-3 text-amber-600 font-semibold">+{p.projectedDelayMonths} mos</td>
                  <td className="py-3 text-rose-600 font-semibold">+₹{p.projectedCostOverrun} Cr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

