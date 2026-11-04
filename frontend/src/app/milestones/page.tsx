'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Milestone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  X,
  ShieldCheck
} from 'lucide-react';

export default function MilestonesPage() {
  const { role } = useAuth();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New Milestone Form
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    sequence: 1,
    weightage: 20,
    plannedStartDate: '2024-01-01',
    plannedCompletionDate: '2025-06-30',
    isCriticalPath: true
  });

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const prjRes = await api.getProjects();
      if (prjRes.success) {
        setProjects(prjRes.data);
        if (form.projectId === '' && prjRes.data.length > 0) {
          setForm(prev => ({ ...prev, projectId: prjRes.data[0].projectId }));
        }
      }

      const pId = selectedProjectId === 'All' ? undefined : selectedProjectId;
      const mRes = await api.getMilestones(pId);
      if (mRes.success) {
        setMilestones(mRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMilestone(form);
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create milestone');
    }
  };

  const handleUpdateStatus = async (id: string, status: string, progressPercentage: number) => {
    try {
      await api.updateMilestone(id, { status, progressPercentage });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update milestone');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Critical Path & Milestone Progression
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
              Work Breakdown
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitoring intermediate execution targets, critical path dependencies, and delivery gates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectId}
              </option>
            ))}
          </select>

          {(role === 'admin' || role === 'manager') && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Milestone</span>
            </button>
          )}
        </div>
      </div>

      {/* Milestone Cards / Timeline */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : milestones.length === 0 ? (
          <p className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-gov-darkCard rounded-2xl border border-slate-200 dark:border-slate-800">
            No milestones registered for this selection.
          </p>
        ) : (
          milestones.map((m) => (
            <div
              key={m._id}
              className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0 mt-0.5">
                  #{m.sequence}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {m.projectId}
                    </span>
                    {m.isCriticalPath && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[9px] font-bold">
                        CRITICAL PATH
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Weight: {m.weightage}%</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {m.title}
                  </h3>

                  {m.remarks && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5">
                      Note: {m.remarks}
                    </p>
                  )}

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                    <span>Target: {new Date(m.plannedCompletionDate).toLocaleDateString()}</span>
                    {m.actualCompletionDate && (
                      <span className="text-emerald-600 font-semibold">
                        Completed: {new Date(m.actualCompletionDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 self-end md:self-auto">
                <div className="w-28 text-right">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {m.progressPercentage}%
                  </span>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${m.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={m.status}
                    onChange={(e) => {
                      const newSt = e.target.value;
                      const newPct = newSt === 'Completed' ? 100 : m.progressPercentage;
                      handleUpdateStatus(m._id, newSt, newPct);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors ${
                      m.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : m.status === 'Delayed'
                        ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                        : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Milestone */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Project Delivery Milestone
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Project</label>
                <select
                  value={form.projectId}
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectId} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tunnel excavation breakthrough (Ch. 12+400)"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Sequence Number</label>
                  <input
                    type="number"
                    min="1"
                    value={form.sequence}
                    onChange={(e) => setForm({ ...form, sequence: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Project Weightage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.weightage}
                    onChange={(e) => setForm({ ...form, weightage: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Planned Start Date</label>
                  <input
                    type="date"
                    value={form.plannedStartDate}
                    onChange={(e) => setForm({ ...form, plannedStartDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={form.plannedCompletionDate}
                    onChange={(e) => setForm({ ...form, plannedCompletionDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="cp"
                  checked={form.isCriticalPath}
                  onChange={(e) => setForm({ ...form, isCriticalPath: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="cp" className="text-slate-700 dark:text-slate-300 font-medium">
                  Designate as Critical Path Activity
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

