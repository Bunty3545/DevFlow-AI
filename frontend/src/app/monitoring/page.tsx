'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileCheck,
  TrendingUp,
  Percent,
  AlertTriangle,
  History,
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  IndianRupee,
  Image as ImageIcon
} from 'lucide-react';
import { getProjectImage } from '../../utils/projectImages';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function MonitoringPage() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Agency update submission form
  const [physicalProgress, setPhysicalProgress] = useState(0);
  const [periodExpenditure, setPeriodExpenditure] = useState(0);
  const [workCompletedSummary, setWorkCompletedSummary] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [nextMonthPlan, setNextMonthPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      if (res.success && res.data.length > 0) {
        setProjects(res.data);
        const defaultId = res.data[0].projectId;
        setSelectedProjectId(defaultId);
        await loadDossier(defaultId);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDossier = async (projectId: string) => {
    try {
      const res = await api.getMonitoringDossier(projectId);
      if (res.success) {
        setDossier(res);
        setPhysicalProgress(res.project.actualProgress);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProjectId(val);
    loadDossier(val);
  };

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmitting(true);
    try {
      await api.submitProgressUpdate(selectedProjectId, {
        physicalProgress: Number(physicalProgress),
        periodExpenditure: Number(periodExpenditure),
        workCompletedSummary,
        challengesFaced,
        nextMonthPlan
      });
      alert('Monthly progress update submitted successfully!');
      setWorkCompletedSummary('');
      setChallengesFaced('');
      setNextMonthPlan('');
      setPeriodExpenditure(0);
      loadDossier(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (updateId: string, status: 'Approved' | 'Rejected') => {
    const remarks = prompt(`Enter review remarks for ${status.toLowerCase()} update:`);
    if (remarks !== null) {
      try {
        await api.reviewProgressUpdate(updateId, { status, reviewRemarks: remarks });
        loadDossier(selectedProjectId);
      } catch (err: any) {
        alert(err.message || 'Review failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gov-darkCard p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Project Monitoring & Field Verification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validate physical accomplishments, expenditure utilization, and site updates.
          </p>
        </div>

        <div className="w-full md:w-80">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Select Project To Monitor
          </label>
          <select
            value={selectedProjectId}
            onChange={handleProjectChange}
            className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectId} — {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {dossier && (
        <>
          {/* City Infrastructure & Live Site Visual Spotlight */}
          <div className="overflow-hidden rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Photo Showcase */}
              <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full overflow-hidden bg-slate-900 group">
                <img
                  src={getProjectImage(dossier.project)}
                  alt={dossier.project.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold">
                      <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                      <span>{dossier.project.district}, {dossier.project.state}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold">
                      {dossier.project.sector}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-sm md:text-base leading-snug drop-shadow-md">
                    {dossier.project.name}
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 font-mono">
                    ID: {dossier.project.projectId} • {dossier.project.latitude?.toFixed(4)}°N, {dossier.project.longitude?.toFixed(4)}°E
                  </p>
                </div>
              </div>

              {/* Site Telemetry & Overview */}
              <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Implementing Agency</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-blue-600" />
                        <span>{dossier.project.implementingAgency}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Project Director</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {dossier.project.projectManager}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Status / Risk Severity</span>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-0.5 ${
                        dossier.project.riskLevel === 'Critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                          : dossier.project.riskLevel === 'High'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}>
                        {dossier.project.riskLevel} Risk ({dossier.project.riskScore}/100)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">
                    {dossier.project.description}
                  </p>
                </div>

                {/* Progress Comparison */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Physical Completion: <span className="text-blue-600 font-bold">{dossier.project.actualProgress}%</span>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Target Planned: {dossier.project.plannedProgress}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className="h-full bg-slate-300 dark:bg-slate-700 absolute left-0 top-0"
                      style={{ width: `${dossier.project.plannedProgress}%` }}
                    />
                    <div
                      className="h-full bg-blue-600 rounded-full relative z-10 transition-all duration-700"
                      style={{ width: `${dossier.project.actualProgress}%` }}
                    />
                  </div>
                </div>

                {/* Highlights tags */}
                {dossier.project.keyHighlights && dossier.project.keyHighlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dossier.project.keyHighlights.slice(0, 3).map((h: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Monitoring Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Physical Progress Lag</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-black ${
                  dossier.metrics.physicalLag > 15 ? 'text-red-500' : dossier.metrics.physicalLag > 5 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {dossier.metrics.physicalLag}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Act: {dossier.project.actualProgress}% vs Pln: {dossier.project.plannedProgress}%
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Budget Utilization Rate</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {dossier.metrics.budgetUtilization}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                ₹{dossier.project.actualExpenditure} spent of ₹{dossier.project.revisedCost || dossier.project.approvedCost} Cr
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Cost Performance Index (CPI)</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className={`text-2xl font-black ${dossier.metrics.cpi >= 1.0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {dossier.metrics.cpi}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Schedule Index (SPI): {dossier.metrics.spi}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">Projected Schedule Delay</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black text-amber-500">
                  {dossier.metrics.projectedDelayMonths} mos
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Est. Cost Overrun: ₹{dossier.metrics.projectedOverrun} Cr
              </p>
            </div>
          </div>

          {/* S-Curve Chart */}
          <div className="rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Physical Execution S-Curve Profile
                </h2>
                <p className="text-[11px] text-slate-400">
                  Cumulative Planned Value (PV) vs Earned Physical Value (EV)
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                MoSPI Benchmark
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dossier.sCurvePoints}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                    formatter={(val: any) => [`${val}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="planned" name="Planned Progress (%)" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="actual" name="Actual Physical Progress (%)" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Agency Progress Submission & Officer Review Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form for Submitting Progress (Implementing Agency & PM) */}
            <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm mb-3">
                <Send className="h-4 w-4 text-blue-600" />
                <h2>Submit Monthly Project Progress Update</h2>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Field contractor / Implementing agency progress submission for officer verification.
              </p>

              <form onSubmit={handleProgressSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      New Cumulative Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={physicalProgress}
                      onChange={(e) => setPhysicalProgress(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      Period Expenditure (₹ Cr)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={periodExpenditure}
                      onChange={(e) => setPeriodExpenditure(Number(e.target.value))}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Summary of Civil Works Completed
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Completed 4.5 km embankment, 12 pier caps..."
                    value={workCompletedSummary}
                    onChange={(e) => setWorkCompletedSummary(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Challenges / Hindrances Faced On Site
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Heavy rainfall, pending utility shifting..."
                    value={challengesFaced}
                    onChange={(e) => setChallengesFaced(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Plan of Action for Next Month
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Launching steel girders over railway crossing..."
                    value={nextMonthPlan}
                    onChange={(e) => setNextMonthPlan(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  {submitting ? 'Submitting to Directorate...' : 'Submit Progress Update for Review'}
                </button>
              </form>
            </div>

            {/* Verification Queue & Update History */}
            <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
                    <History className="h-4 w-4 text-emerald-600" />
                    <h2>Progress Review & Verification Queue</h2>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {dossier.updates.length} records logged
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                  {dossier.updates.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No update reports filed yet.</p>
                  ) : (
                    dossier.updates.map((up: any) => (
                      <div
                        key={up._id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              Reported Progress: {up.physicalProgress}%
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              (+₹{up.periodExpenditure} Cr spent)
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            up.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : up.status === 'Rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {up.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                          {up.workCompletedSummary}
                        </p>

                        {up.challengesFaced && (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                            Bottlenecks: {up.challengesFaced}
                          </p>
                        )}

                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                          <span>By {up.submittedBy} • {new Date(up.updateDate).toLocaleDateString()}</span>

                          {(role === 'officer' || role === 'admin') && up.status === 'Pending Review' && (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleReview(up._id, 'Approved')}
                                className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReview(up._id, 'Rejected')}
                                className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

