'use client';

import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  X,
  Plus,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  IndianRupee,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { INDIAN_CITY_PRESETS, CURATED_INFRA_PHOTOS } from '../../utils/projectImages';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'financials' | 'image_location'>('details');

  const [form, setForm] = useState({
    projectId: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    description: '',
    sector: 'Urban Transport & Metro',
    ministry: 'Ministry of Housing and Urban Affairs',
    state: 'Karnataka',
    district: 'Bengaluru',
    implementingAgency: 'Bangalore Metro Rail Corporation (BMRCL)',
    projectManager: 'Er. Suresh Nambiar',
    approvedCost: 3500,
    revisedCost: 3650,
    actualExpenditure: 1200,
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 3).toISOString().split('T')[0],
    plannedProgress: 45,
    actualProgress: 38,
    status: 'In Progress',
    latitude: 12.9716,
    longitude: 77.5946,
    imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    keyHighlightInput: 'High-speed mass transit corridor with smart automated signaling'
  });

  if (!isOpen) return null;

  const handleCityPreset = (preset: typeof INDIAN_CITY_PRESETS[0]) => {
    setForm(prev => ({
      ...prev,
      district: preset.city,
      state: preset.state,
      latitude: preset.lat,
      longitude: preset.lng,
      imageUrl: preset.imageUrl,
      name: prev.name || `${preset.city} Smart Mobility & Infrastructure Corridor`
    }));
  };

  const handleAutoGenerateId = () => {
    const letters = ['DEL', 'MUM', 'BLR', 'HYD', 'AMD', 'KOL', 'PUN', 'VNS'];
    const chosen = letters[Math.floor(Math.random() * letters.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setForm(prev => ({ ...prev, projectId: `PRJ-${chosen}-${num}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Project Name is required.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...form,
        projectId: form.projectId.toUpperCase().trim(),
        approvedCost: Number(form.approvedCost),
        revisedCost: Number(form.revisedCost),
        actualExpenditure: Number(form.actualExpenditure),
        plannedProgress: Number(form.plannedProgress),
        actualProgress: Number(form.actualProgress),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        keyHighlights: form.keyHighlightInput.split('\n').filter(h => h.trim().length > 0)
      };

      const res = await api.createProject(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to create project');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-gov-darkCard border border-gov-border dark:border-gov-darkBorder shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gov-border dark:border-gov-darkBorder px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Register New Infrastructure Project
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Add project details, budget, city location coordinates, and site photography.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gov-border dark:border-gov-darkBorder px-6 text-xs font-semibold bg-white dark:bg-gov-darkCard">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. Core Overview & Sector
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'financials'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. Budget & Progress
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image_location')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'image_location'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            3. City Photo & GIS Coordinates
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: Core Details */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Project ID
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoGenerateId}
                      className="text-[10px] text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>Auto Gen</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={form.projectId}
                    onChange={e => setForm({ ...form, projectId: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase"
                    placeholder="PRJ-BLR-017"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="e.g. Bengaluru Metro Phase 3 Outer Ring Road Line"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Description & Scope
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Detailed project summary, engineering specifications, and intended economic impact..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sector
                  </label>
                  <select
                    value={form.sector}
                    onChange={e => setForm({ ...form, sector: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Roads & Highways">Roads & Highways</option>
                    <option value="Railways">Railways</option>
                    <option value="Urban Transport & Metro">Urban Transport & Metro</option>
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Power & Renewable Energy">Power & Renewable Energy</option>
                    <option value="Ports & Shipping">Ports & Shipping</option>
                    <option value="Civil Aviation">Civil Aviation</option>
                    <option value="Smart Cities">Smart Cities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Central Ministry
                  </label>
                  <input
                    type="text"
                    value={form.ministry}
                    onChange={e => setForm({ ...form, ministry: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Ministry of Housing and Urban Affairs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Implementing Agency
                  </label>
                  <input
                    type="text"
                    required
                    value={form.implementingAgency}
                    onChange={e => setForm({ ...form, implementingAgency: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="e.g. NHAI, DMRC, RVNL, BMRCL"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Director / Manager Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.projectManager}
                    onChange={e => setForm({ ...form, projectManager: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Er. Suresh Nambiar"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Financials & Dates */}
          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Original Approved Cost (₹ Cr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.1"
                      value={form.approvedCost}
                      onChange={e => setForm({ ...form, approvedCost: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Revised Cost (₹ Cr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.1"
                      value={form.revisedCost}
                      onChange={e => setForm({ ...form, revisedCost: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Expenditure (₹ Cr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={form.actualExpenditure}
                      onChange={e => setForm({ ...form, actualExpenditure: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-7 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.targetCompletionDate}
                    onChange={e => setForm({ ...form, targetCompletionDate: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Planned Target Progress: {form.plannedProgress}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.plannedProgress}
                    onChange={e => setForm({ ...form, plannedProgress: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Actual Physical Accomplished: {form.actualProgress}%
                    </label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.actualProgress}
                    onChange={e => setForm({ ...form, actualProgress: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Milestones & Technical Highlights (one per line)
                </label>
                <textarea
                  rows={2}
                  value={form.keyHighlightInput}
                  onChange={e => setForm({ ...form, keyHighlightInput: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Automated signaling contract awarded&#10;Over 60% viaduct pier casting completed"
                />
              </div>
            </div>
          )}

          {/* TAB 3: City Photo & GIS Coordinates */}
          {activeTab === 'image_location' && (
            <div className="space-y-4">
              {/* Quick City Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quick 1-Click Indian City Presets
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Click any city below to automatically fill District, State, GIS Map Coordinates, and High-Resolution City Photo:
                </p>
                <div className="flex flex-wrap gap-2">
                  {INDIAN_CITY_PRESETS.map(preset => (
                    <button
                      key={preset.city}
                      type="button"
                      onClick={() => handleCityPreset(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.district.toLowerCase() === preset.city.toLowerCase()
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                      }`}
                    >
                      📍 {preset.city}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    District / City
                  </label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Bengaluru"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State / UT
                  </label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    placeholder="Karnataka"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.latitude}
                    onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={form.longitude}
                    onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Photo Input and Curated Options */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Site & City Photo (URL or Choose from Curated)
                </label>
                
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                />

                {/* Preset Infrastructure Thumbnails */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Or select an infrastructure category photo:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {CURATED_INFRA_PHOTOS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: item.url })}
                        className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all ${
                          form.imageUrl === item.url ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.title}
                          className="h-14 w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                          <span className="text-[9px] text-white font-bold leading-tight truncate">
                            {item.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                {form.imageUrl && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
                      Live Photo Preview:
                    </span>
                    <div className="relative h-40 w-full rounded-lg overflow-hidden shadow-inner">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold flex items-center space-x-1.5">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        <span>{form.district || 'City'}, {form.state}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gov-border dark:border-gov-darkBorder">
            <div className="flex space-x-2">
              {activeTab !== 'details' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'image_location' ? 'financials' : 'details')}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  &larr; Back
                </button>
              )}
              {activeTab !== 'image_location' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'details' ? 'financials' : 'image_location')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Next &rarr;
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Save & Deploy Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

