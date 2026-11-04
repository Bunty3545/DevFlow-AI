'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRoleForDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setLoading(true);
    setError('');
    try {
      await switchRoleForDemo(role);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-4">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30 text-white mb-3">
            <Activity className="h-8 w-8 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            DevFlow <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-Powered Software Development & Project Intelligence Platform
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[11px] text-blue-300">
            <span>Enterprise Project & Delivery Intelligence</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-1">Official Portal Sign In</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your authorized MoSPI or agency credentials</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@devflow.ai"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Official...' : 'Sign In to Platform'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Sign-In
              </span>
              <span className="text-[10px] text-blue-400 font-medium">For Evaluators</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex items-center justify-start p-2 rounded-lg bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 text-red-300 transition-all text-left"
              >
                <div>
                  <p className="font-bold">Administrator</p>
                  <p className="text-[10px] text-slate-400">Dr. Rajesh Sharma</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('officer')}
                className="flex items-center justify-start p-2 rounded-lg bg-blue-950/30 border border-blue-800/40 hover:bg-blue-900/40 text-blue-300 transition-all text-left"
              >
                <div>
                  <p className="font-bold">Monitoring Officer</p>
                  <p className="text-[10px] text-slate-400">Pooja Verma, IES</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager')}
                className="flex items-center justify-start p-2 rounded-lg bg-amber-950/30 border border-amber-800/40 hover:bg-amber-900/40 text-amber-300 transition-all text-left"
              >
                <div>
                  <p className="font-bold">Project Manager</p>
                  <p className="text-[10px] text-slate-400">Er. Rathore (NHAI)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agency')}
                className="flex items-center justify-start p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-900/40 text-emerald-300 transition-all text-left"
              >
                <div>
                  <p className="font-bold">Implementing Agency</p>
                  <p className="text-[10px] text-slate-400">L&T / Afcons JV</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Need an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
              Register New Official
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

