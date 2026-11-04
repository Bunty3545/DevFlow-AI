'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api } from '../../services/api';
import { MapPin, Filter, Layers, Info, Building2, ExternalLink, ArrowRight, Plus } from 'lucide-react';
import { getProjectImage } from '../../utils/projectImages';
import CreateProjectModal from '../../components/projects/CreateProjectModal';

const ProjectMap = dynamic(() => import('../../components/map/ProjectMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-xs font-semibold text-slate-500">Loading Leaflet OpenStreetMap Engine...</p>
      </div>
    </div>
  )
});

export default function GisMapPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectorFilter, setSectorFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      if (res.success) {
        setProjects(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const states = ['All', ...Array.from(new Set(projects.map(p => p.state)))];
  const sectors = ['All', ...Array.from(new Set(projects.map(p => p.sector)))];

  const filteredProjects = projects.filter(p => {
    if (sectorFilter !== 'All' && p.sector !== sectorFilter) return false;
    if (riskFilter !== 'All' && p.riskLevel !== riskFilter) return false;
    if (stateFilter !== 'All' && p.state !== stateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Geographic Information System (GIS) Project Map
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
              OpenStreetMap + Leaflet
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Spatial monitoring and spatial risk density across Indian states and union territories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Legend */}
          <div className="flex items-center space-x-3 text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="flex items-center space-x-1.5"><span className="h-3 w-3 rounded-full bg-emerald-500"></span><span>Low</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-3 w-3 rounded-full bg-amber-500"></span><span>Medium</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-3 w-3 rounded-full bg-orange-500"></span><span>High</span></span>
            <span className="flex items-center space-x-1.5"><span className="h-3 w-3 rounded-full bg-red-500"></span><span>Critical</span></span>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Project at Location</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">State / UT Filter</label>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            {states.map(st => <option key={st} value={st}>{st === 'All' ? 'All States & UTs' : st}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Infrastructure Sector</label>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            {sectors.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sectors' : s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Risk Severity</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>
        </div>
      </div>

      {/* Map Display */}
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <ProjectMap projects={filteredProjects} />
      )}

      {/* City Infrastructure Visual Gallery */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>City Infrastructure & Site Photo Explorer ({filteredProjects.length} Cities / Sites)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse actual photographs of projects across major Indian cities and industrial corridors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredProjects.map((p) => {
            const img = getProjectImage(p);
            return (
              <div
                key={p.projectId}
                className="group rounded-2xl overflow-hidden border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Photo Header */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={img}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-bold backdrop-blur-sm">
                        📍 {p.district}, {p.state}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white ${
                        p.riskLevel === 'Critical' ? 'bg-red-600' : p.riskLevel === 'High' ? 'bg-orange-500' : 'bg-emerald-600'
                      }`}>
                        {p.riskLevel}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {p.sector}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 block">
                      {p.projectId}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-0.5" title={p.name}>
                      {p.name}
                    </h3>
                  </div>

                  <div className="space-y-1.5 text-[11px] border-t border-slate-100 dark:border-slate-800 pt-2">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Approved Budget:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">₹{p.approvedCost} Cr</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Physical Progress:</span>
                      <span className="font-bold text-blue-600">{p.actualProgress}%</span>
                    </div>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <Link
                      href={`/projects/${p.projectId}`}
                      className="flex-1 text-center py-2 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors"
                    >
                      360 Dossier
                    </Link>
                    <Link
                      href="/monitoring"
                      className="flex-1 text-center py-2 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                    >
                      Monitor ⏱️
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateProjectModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}

