'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth, UserRole } from '../../context/AuthContext';
import {
  Users,
  Shield,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  UserCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export default function UserManagementPage() {
  const { user: currentUser, role: currentRole } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.updateUserRole(editingUser._id, {
        role: editingUser.role,
        department: editingUser.department,
        organization: editingUser.organization,
        isActive: editingUser.isActive
      });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete user: ${name}?`)) {
      try {
        await api.deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Administrator', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
    officer: { label: 'Monitoring Officer', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    manager: { label: 'Project Manager', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    agency: { label: 'Implementing Agency', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User & Access Control Governance
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
              RBAC Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enforcing role-based access control across MoSPI Administrators, Officers, Managers, and Contractors.
          </p>
        </div>
      </div>

      {/* Role Permissions Matrix Card */}
      <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
          MoSPI Four-Tier Role Permissions Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <span className="font-bold text-red-700 dark:text-red-400">1. Administrator</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Full control: user management, project registration & deletion, system settings, global reporting.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
            <span className="font-bold text-blue-700 dark:text-blue-400">2. Monitoring Officer</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Validates and approves contractor monthly progress updates, evaluates risk alerts, generates dossiers.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <span className="font-bold text-amber-700 dark:text-amber-400">3. Project Manager</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Manages assigned projects, updates milestones, assigns bottlenecks, records expenditure vouchers.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">4. Implementing Agency</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
              Submits site progress reports, logs physical hindrances, records monthly contractor outlay.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-[10px] font-bold uppercase text-slate-400">
                <th className="py-3 px-4">Official Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department / Org</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {u.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleLabels[u.role]?.color || ''}`}>
                      {roleLabels[u.role]?.label || u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div>{u.department}</div>
                    <span className="text-[10px] text-slate-400">{u.organization}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center space-x-1 text-[10px] font-bold ${
                      u.isActive ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {u.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {currentRole === 'admin' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                          title="Edit User Role"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {currentUser?.id !== u._id && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-600"
                            title="Remove User"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Read-Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Modify User Role & Privileges
              </h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">User: {editingUser.name}</label>
                <p className="text-slate-800 dark:text-slate-200 font-mono">{editingUser.email}</p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Assigned Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="admin">Administrator</option>
                  <option value="officer">Monitoring Officer</option>
                  <option value="manager">Project Manager</option>
                  <option value="agency">Implementing Agency</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Department</label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={editingUser.isActive}
                  onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="activeCheck" className="text-slate-700 dark:text-slate-300 font-medium">
                  Account is Active
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

