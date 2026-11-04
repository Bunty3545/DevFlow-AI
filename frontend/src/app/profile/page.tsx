'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  User,
  Shield,
  Building,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({
        name,
        department,
        organization,
        phone,
        password: newPassword || undefined
      });
      setSaved(true);
      setNewPassword('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Official User Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Authorized monitoring identity under the Government of India MoSPI portal.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* User Identity Card */}
      <div className="p-6 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-extrabold text-xl shadow-md border-2 border-white dark:border-slate-800">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'IN'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{user?.department} • {user?.organization}</p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 text-[10px]">Access Level</span>
          <p className="font-bold text-emerald-600 dark:text-emerald-400">Security Clearance Level 3</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Update Official Credentials
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Official Mobile</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Organization</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors"
            >
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

