'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Activity, Mail, Lock, User, Building, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('officer');
  const [department, setDepartment] = useState('Central Project Monitoring Directorate');
  const [organization, setOrganization] = useState('Ministry of Statistics & Programme Implementation');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        department,
        organization,
        phone
      });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-4">
      <div className="w-full max-w-lg">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/30 text-white mb-2">
            <Activity className="h-7 w-7 text-cyan-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            DevFlow <span className="text-blue-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            AI-Powered Software Development & Project Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-1">Create Authorized Account</h2>
          <p className="text-xs text-slate-400 mb-6">Register your role under the MoSPI monitoring framework</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Official Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand K. Saxena, Director"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gov.in"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="officer">Monitoring Officer (MoSPI)</option>
                  <option value="manager">Project Manager (NHAI / RVNL / DMRC)</option>
                  <option value="agency">Implementing Agency (Contractor / EPC)</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Official Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department / Division</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Highways Monitoring Division"
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
              <span>{loading ? 'Creating Official Account...' : 'Complete Registration'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

