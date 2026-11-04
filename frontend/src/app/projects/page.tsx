'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  LayoutGrid,
  List,
  IndianRupee,
  MapPin,
  Trash2,
  Edit3,
  X,
  Image as ImageIcon
} from 'lucide-react';
import CreateProjectModal from '../../components/projects/CreateProjectModal';
import { getProjectImage } from '../../utils/projectImages';

export default function ProjectsPage() {
  const { role } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [search, sectorFilter, riskFilter, statusFilter, stateFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (sectorFilter !== 'All') params.sector = sectorFilter;
      if (riskFilter !== 'All') params.riskLevel = riskFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (stateFilter !== 'All') params.state = stateFilter;

      const res = await api.getProjects(params);
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete project: ${name}?`)) {
      try {
        await api.deleteProject(id);
        fetchProjects();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const sectors = ['All', 'Roads & Highways', 'Railways', 'Urban Transport & Metro', 'Water & Sanitation', 'Power & Renewable Energy', 'Ports & Shipping', 'Civil Aviation'];
  const riskLevels = ['All', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['All', 'In Progress', 'Delayed', 'Critical', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            National Infrastructure Projects Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive portfolio monitoring of major capital assets under MoSPI oversight.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add New Project</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Project Name, ID, Agency, or District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sectors.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>)}
          </select>
        </div>

        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {riskLevels.map(r => <option key={r} value={r}>{r === 'All' ? 'All Risk Levels' : `${r} Risk`}</option>)}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statuses.map(st => <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>)}
          </select>
        </div>
      </div>

      {/* Projects Presentation */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-gov-darkCard">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No projects match the selected criteria.</p>
          <button
            onClick={() => { setSearch(''); setSectorFilter('All'); setRiskFilter('All'); setStatusFilter('All'); }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="overflow-x-auto rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Project ID & Title</th>
                <th className="py-3 px-4">Sector & State</th>
                <th className="py-3 px-4">Approved Budget</th>
                <th className="py-3 px-4">Actual Exp.</th>
                <th className="py-3 px-4">Progress (Act / Pln)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {projects.map((p) => {
                const lag = p.plannedProgress - p.actualProgress;
                return (
                  <tr key={p.projectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getProjectImage(p)}
                          alt={p.name}
                          className="h-10 w-14 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm"
                          onError={(e) => {
                            (e.target as any).src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="flex flex-col">
                          <Link href={`/projects/${p.projectId}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline line-clamp-1">
                            {p.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-mono">📍 {p.district}, {p.state} • {p.projectId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div>{p.sector}</div>
                      <span className="text-[10px] text-slate-400">{p.district}, {p.state}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      ₹{p.approvedCost.toLocaleString('en-IN')} Cr
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      ₹{p.actualExpenditure.toLocaleString('en-IN')} Cr
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] mb-1 font-medium">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{p.actualProgress}%</span>
                          <span className="text-slate-400">Pln: {p.plannedProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${lag > 15 ? 'bg-red-500' : lag > 5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(p.actualProgress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : p.status === 'Delayed'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : p.status === 'Critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          p.riskLevel === 'Critical' ? 'bg-red-500' : p.riskLevel === 'High' ? 'bg-orange-500' : p.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.riskScore}</span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/projects/${p.projectId}`}
                          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400"
                          title="View 360 Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {role === 'admin' && (
                          <button
                            onClick={() => handleDelete(p.projectId, p.name)}
                            className="p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-950 text-red-600"
                            title="Delete Project (Admin)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const img = getProjectImage(p);
            return (
              <div
                key={p.projectId}
                className="group rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Photo Banner with City Badge */}
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={img}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-bold backdrop-blur-sm">
                          📍 {p.district}, {p.state}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                          p.riskLevel === 'Critical' ? 'bg-red-600' : p.riskLevel === 'High' ? 'bg-orange-500' : 'bg-emerald-600'
                        }`}>
                          {p.riskLevel} ({p.riskScore}/100)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">
                        {p.projectId} • {p.sector}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link href={`/projects/${p.projectId}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 mb-1">
                      {p.name}
                    </Link>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {p.description}
                    </p>

                    <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Approved Cost:</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{p.approvedCost.toLocaleString('en-IN')} Cr</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400">Physical Progress:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{p.actualProgress}% <span className="text-slate-400 font-normal">/ {p.plannedProgress}%</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.implementingAgency}</span>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/projects/${p.projectId}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <span>360 Dossier</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Register New Project with Full City/Image & GIS */}
      <CreateProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}

