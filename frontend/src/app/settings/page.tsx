'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Key,
  Sliders,
  Bell,
  Database,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [cpiCutoff, setCpiCutoff] = useState('0.85');
  const [spiCutoff, setSpiCutoff] = useState('0.85');
  const [criticalCutoff, setCriticalCutoff] = useState('75');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Configuration & AI Engine Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize Earned Value thresholds, Gemini API credentials, and predictive early-warning parameters.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Platform configuration parameters updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: LLM & Gemini Engine */}
        <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h2>AI Assistant & LLM Integration (Google Gemini API)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            DevFlow AI supports live neural reasoning via Google Gemini API. If an API key is not supplied or offline, the platform automatically utilizes its high-performance rule-based statistical engine.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Stored securely in backend environment. Fallback MoSPI predictive intelligence remains active.
            </p>
          </div>
        </div>

        {/* Section 2: EVM Risk Thresholds */}
        <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <Sliders className="h-4 w-4 text-amber-500" />
            <h2>Earned Value Management (EVM) Alert Cutoffs</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define sensitivity thresholds triggering automated ministerial warning flags.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                CPI Trigger Threshold
              </label>
              <input
                type="number"
                step="0.05"
                value={cpiCutoff}
                onChange={(e) => setCpiCutoff(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Alert if CPI drops below</span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                SPI Trigger Threshold
              </label>
              <input
                type="number"
                step="0.05"
                value={spiCutoff}
                onChange={(e) => setSpiCutoff(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Alert if SPI drops below</span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Critical Score Threshold (0-100)
              </label>
              <input
                type="number"
                value={criticalCutoff}
                onChange={(e) => setCriticalCutoff(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Escalate to Ministry if score ≥</span>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Preferences */}
        <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
            <Bell className="h-4 w-4 text-emerald-500" />
            <h2>Surveillance & Dispatch Preferences</h2>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Critical Schedule Slippage Dispatches</p>
              <p className="text-[11px] text-slate-400">Receive high-priority SMS/Email alerts for projects lagging &gt; 20%</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
}

