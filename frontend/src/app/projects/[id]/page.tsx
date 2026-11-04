'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '../../../services/api';
import {
  ArrowLeft,
  Calendar,
  Building,
  MapPin,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Percent,
  Plus
} from 'lucide-react';
import { getProjectImage } from '../../../utils/projectImages';

export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const res = await api.getProjectById(id);
      if (res.success) {
        setProject(res.data);
        setMilestones(res.milestones || []);
        setIssues(res.issues || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
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

  if (error || !project) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white dark:bg-gov-darkCard border border-slate-200 dark:border-slate-800">
        <p className="text-sm font-semibold text-red-600">{error || 'Project not found.'}</p>
        <Link href="/projects" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-xs rounded-lg">
          Back to Projects Registry
        </Link>
      </div>
    );
  }

  const budgetUtilization = Math.round((project.actualExpenditure / (project.revisedCost || project.approvedCost || 1)) * 100);
  const lag = Number((project.plannedProgress - project.actualProgress).toFixed(1));

  return (
    <div className="space-y-6">
      {/* Back button & Title banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Projects Registry</span>
          </Link>

          <div className="flex items-center space-x-3">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              {project.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
              {project.projectId}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <Building className="h-3.5 w-3.5 text-blue-500" />
              <span>{project.ministry}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              <span>{project.district}, {project.state}</span>
            </span>
            <span>•</span>
            <span>Agency: <strong>{project.implementingAgency}</strong></span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/monitoring`}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Open Monitoring Dossier
          </Link>
        </div>
      </div>

      {/* City & Site Visual Hero Banner */}
      <div className="relative h-56 md:h-72 w-full rounded-2xl overflow-hidden shadow-md group">
        <img
          src={getProjectImage(project)}
          alt={project.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as any).src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 rounded-lg bg-blue-600/90 text-white text-xs font-bold backdrop-blur-md">
              📍 {project.district}, {project.state}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-medium backdrop-blur-md">
              {project.sector}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 text-xs font-mono backdrop-blur-md">
              {project.latitude}°N, {project.longitude}°E
            </span>
          </div>
          <p className="text-white text-sm md:text-base font-semibold drop-shadow max-w-3xl">
            {project.description}
          </p>
        </div>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Physical Completion</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{project.actualProgress}%</span>
            <span className="text-xs text-slate-400 font-medium">/ Pln: {project.plannedProgress}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${project.actualProgress}%` }}></div>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            {lag > 0 ? `${lag}% behind target schedule` : 'Tracking ahead of planned schedule'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Financial Utilization</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{project.actualExpenditure} Cr</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(budgetUtilization, 100)}%` }}></div>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">
            {budgetUtilization}% of Approved Budget (₹{project.approvedCost} Cr)
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Earned Value Indices</span>
          <div className="flex items-center space-x-4 mt-2">
            <div>
              <p className="text-[10px] text-slate-400">CPI (Cost)</p>
              <p className={`text-lg font-extrabold ${project.cpi >= 1.0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {project.cpi}
              </p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
              <p className="text-[10px] text-slate-400">SPI (Schedule)</p>
              <p className={`text-lg font-extrabold ${project.spi >= 1.0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {project.spi}
              </p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">Target threshold ≥ 1.0</p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">MoSPI Risk Rating</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className={`text-2xl font-black ${
              project.riskLevel === 'Critical' ? 'text-red-600' : project.riskLevel === 'High' ? 'text-orange-500' : 'text-emerald-600'
            }`}>
              {project.riskScore}/100
            </span>
            <span className="text-xs font-bold uppercase">{project.riskLevel}</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Projected delay: <strong>{project.projectedDelayMonths} mos</strong>
          </p>
        </div>
      </div>

      {/* AI Risk Assessment Dossier */}
      <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 font-bold text-sm mb-2">
          <Sparkles className="h-4 w-4" />
          <span>InfraWatch AI – Diagnostic Evaluation</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {project.aiRiskSummary || 'EVM metrics show steady milestone execution adhering to baseline schedule.'}
        </p>

        {project.keyHighlights && project.keyHighlights.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-900/30 flex flex-wrap gap-2">
            {project.keyHighlights.map((kh: string, idx: number) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ✓ {kh}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Milestones & Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones Timeline */}
        <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Milestone Tracking</h2>
            <Link href="/milestones" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No milestones registered yet.</p>
            ) : (
              milestones.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs flex items-center justify-between"
                >
                  <div className="flex items-start space-x-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[10px] mt-0.5">
                      {m.sequence}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{m.title}</p>
                      <p className="text-[10px] text-slate-400">
                        Planned Target: {new Date(m.plannedCompletionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{m.progressPercentage}%</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : m.status === 'Delayed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Issues & Bottlenecks */}
        <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Implementation Issues</h2>
            <Link href="/issues" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Issue Board
            </Link>
          </div>

          <div className="space-y-3">
            {issues.length === 0 ? (
              <p className="text-xs text-emerald-600 py-4 text-center font-medium">✓ No open bottlenecks flagged for this project.</p>
            ) : (
              issues.map((i: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{i.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      i.severity === 'Critical' ? 'bg-red-100 text-red-800' : i.severity === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {i.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {i.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Category: {i.category}</span>
                    <span>Status: <strong className="text-slate-700 dark:text-slate-300">{i.status}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

