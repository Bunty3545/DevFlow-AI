'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Key,
  Sliders,
  Bell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [cpiCutoff, setCpiCutoff] = useState('0.85');
  const [spiCutoff, setSpiCutoff] = useState('0.85');
  const [criticalCutoff, setCriticalCutoff] = useState('75');
  const [tokenBudgetLimit, setTokenBudgetLimit] = useState('1000000');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        setHasKey(Boolean(res.data.hasGeminiApiKey));
        setMaskedKey(res.data.maskedGeminiApiKey || '');
        setCpiCutoff(String(res.data.cpiCutoff ?? '0.85'));
        setSpiCutoff(String(res.data.spiCutoff ?? '0.85'));
        setCriticalCutoff(String(res.data.criticalCutoff ?? '75'));
        setTokenBudgetLimit(String(res.data.tokenBudgetLimit ?? '1000000'));
        setEmailAlerts(Boolean(res.data.emailAlerts ?? true));
      }
    } catch (err) {
      // Ignore initial load error if unauthenticated
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      const res = await api.updateSettings({
        geminiApiKey: apiKey.trim() || undefined,
        cpiCutoff: Number(cpiCutoff),
        spiCutoff: Number(spiCutoff),
        criticalCutoff: Number(criticalCutoff),
        tokenBudgetLimit: Number(tokenBudgetLimit),
        emailAlerts
      });
      if (res.success && res.data) {
        setHasKey(Boolean(res.data.hasGeminiApiKey));
        setMaskedKey(res.data.maskedGeminiApiKey || '');
        setApiKey('');
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration. Make sure you are signed in as Administrator or Officer.');
    } finally {
      setSaving(false);
    }
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
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Platform configuration updated and active immediately for DevFlow AI Copilot!</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: LLM & Gemini Engine */}
        <div className="p-5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h2>AI Assistant & LLM Integration (Google Gemini API)</h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                hasKey
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {hasKey ? `Active (${maskedKey})` : 'Not Configured (Fallback Mode)'}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            DevFlow AI supports real-time multimodal reasoning (voice, text & screenshot analysis) via Google Gemini API. Paste your key below to activate it immediately without restarting the server.
          </p>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gemini API Key {hasKey ? '(leave blank to keep existing active key)' : ''}
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-blue-600 hover:underline font-medium"
              >
                <span>Get Key from Google AI Studio</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder={hasKey ? `Active key: ${maskedKey} (enter new key to replace)` : 'AIzaSy...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Persisted locally in backend runtime config (`backend/.env` `GEMINI_API_KEY` is also supported).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Total AI Token Quota Budget (for Usage &amp; Remaining Tracker)
            </label>
            <input
              type="number"
              min={1000}
              step={10000}
              value={tokenBudgetLimit}
              onChange={(e) => setTokenBudgetLimit(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Default: 1,000,000 tokens. Used and Remaining tokens update live from Gemini usageMetadata.
            </span>
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
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
