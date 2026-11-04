'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  Plus,
  Filter,
  Clock,
  CheckCircle,
  MessageSquare,
  ShieldAlert,
  Send,
  X,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';

export default function IssuesPage() {
  const { user, role } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // New Issue form
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    description: '',
    category: 'Land Acquisition',
    severity: 'High',
    assignedTo: 'Special Land Acquisition Officer',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchIssues();
    loadProjects();
  }, [severityFilter, statusFilter, categoryFilter]);

  const loadProjects = async () => {
    const res = await api.getProjects();
    if (res.success) {
      setProjects(res.data);
      if (res.data.length > 0) {
        setForm(prev => ({ ...prev, projectId: res.data[0].projectId }));
      }
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (severityFilter !== 'All') params.severity = severityFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await api.getIssues(params);
      if (res.success) {
        setIssues(res.data);
        if (res.data.length > 0 && !selectedIssue) {
          setSelectedIssue(res.data[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createIssue(form);
      setModalOpen(false);
      fetchIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to raise issue');
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      await api.updateIssue(issueId, { status: newStatus });
      fetchIssues();
      if (selectedIssue && selectedIssue.issueId === issueId) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedIssue) return;
    try {
      await api.updateIssue(selectedIssue.issueId, { newComment: commentText });
      setCommentText('');
      const updated = await api.getIssues({ projectId: selectedIssue.projectId });
      if (updated.success) {
        const found = updated.data.find((i: any) => i.issueId === selectedIssue.issueId);
        if (found) setSelectedIssue(found);
      }
      fetchIssues();
    } catch (err: any) {
      alert(err.message || 'Failed to post note');
    }
  };

  const categories = [
    'All',
    'Land Acquisition',
    'Forest & Environment Clearance',
    'Contractor Delay',
    'Fund Disbursement',
    'Technical & Engineering',
    'Utility Shifting',
    'Law & Order / Local Protest',
    'Weather & Monsoons',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Project Bottlenecks & Issue Management
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
              Escalation Cell
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Systematic resolution tracking for statutory clearances, land disputes, and contractor delays.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Raise Implementation Bottleneck</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Severity Filter</label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical Severity</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hindrance Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>
      </div>

      {/* Main Split: Left Issue List + Right Detail & Comments Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Issues List */}
        <div className="lg:col-span-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-4 shadow-sm space-y-3 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : issues.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No issues match filters.</p>
          ) : (
            issues.map((i) => (
              <div
                key={i.issueId}
                onClick={() => setSelectedIssue(i)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedIssue?.issueId === i.issueId
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                    {i.issueId} • {i.projectId}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {i.isOverdue && (
                      <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-[9px] font-bold">
                        OVERDUE
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      i.severity === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/60' : i.severity === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {i.severity}
                    </span>
                  </div>
                </div>

                <p className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {i.title}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {i.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{i.category}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Status: {i.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Issue Detail & Comments */}
        <div className="lg:col-span-7 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm flex flex-col justify-between">
          {selectedIssue ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {selectedIssue.issueId}
                    </span>
                    <span className="text-slate-400">for Project</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedIssue.projectId}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedIssue.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleStatusChange(selectedIssue.issueId, e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400">Severity</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedIssue.severity}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400">Category</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedIssue.category}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400">Assigned Official</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5 truncate">{selectedIssue.assignedTo}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <span className="text-[10px] text-slate-400">Resolution Deadline</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {new Date(selectedIssue.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400">Detailed Problem Description:</span>
                <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Activity Log & Comments */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Resolution Notes & Official Audit Trail
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedIssue.activityHistory && selectedIssue.activityHistory.length > 0 ? (
                    selectedIssue.activityHistory.map((act: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{act.author} ({act.authorRole})</span>
                          <span>{new Date(act.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">{act.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No comments posted yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add an official instruction or resolution update..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Post Note
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center text-slate-400 text-xs">
              Select an issue on the left to inspect activity.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Raise New Issue */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Log Project Bottleneck / Issue
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Project ID</label>
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
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Forest clearance delayed for section km 45-60"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Problem Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the impediment, root cause, and impact on physical timeline..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Person / Agency</label>
                  <input
                    type="text"
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Resolution Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
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
                  Log Bottleneck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

