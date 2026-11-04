'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  IndianRupee,
  TrendingUp,
  Percent,
  Plus,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  FileSpreadsheet,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export default function FinancialAnalyticsPage() {
  const { role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Add expenditure form
  const [form, setForm] = useState({
    projectId: '',
    financialYear: '2024-2025',
    quarter: 'Q3',
    month: 'December',
    component: 'Civil Works',
    plannedAmount: 100,
    actualAmount: 95,
    invoiceNumber: 'INV-2025-091',
    vendorName: 'Larsen & Toubro Ltd',
    remarks: 'Monthly certified bill'
  });

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const res = await api.getFinancialOverview();
      if (res.success) {
        setData(res);
      }
      const pRes = await api.getProjects();
      if (pRes.success) {
        setProjects(pRes.data);
        if (pRes.data.length > 0) {
          setForm(prev => ({ ...prev, projectId: pRes.data[0].projectId }));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenditure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addExpenditure(form);
      setModalOpen(false);
      fetchFinancials();
    } catch (err: any) {
      alert(err.message || 'Failed to add expenditure record');
    }
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const { summary, componentBreakdown, recentExpenditures, projectFinancials } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Capital Outlay & Financial Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Budget appropriation, price escalation tracking, and expenditure variance auditing.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expenditure Entry</span>
        </button>
      </div>

      {/* 5 Financial KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Approved Budget</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            ₹{summary.totalApproved.toLocaleString('en-IN')} Cr
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Original Sanctioned</p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Revised Estimate</span>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{summary.totalRevised.toLocaleString('en-IN')} Cr
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Post CCEA Revisions</p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Actual Outlay</span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{summary.totalExpenditure.toLocaleString('en-IN')} Cr
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Disbursed to date</p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Cost Overrun Variance</span>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{summary.overallVariance.toLocaleString('en-IN')} Cr
          </p>
          <p className="text-[10px] text-slate-400 mt-1">+{(summary.overallVariance / summary.totalApproved * 100).toFixed(1)}% Cost Revision</p>
        </div>

        <div className="p-4 rounded-xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm">
          <span className="text-[11px] text-slate-400 font-medium">Utilization Rate</span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {summary.utilizationRate}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Of Revised Ceiling</p>
        </div>
      </div>

      {/* Component Breakdown & Project Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component-wise Donut */}
        <div className="rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Component-wise Outlay Breakdown
            </h2>
            <p className="text-[11px] text-slate-400 mb-3">
              Distribution of capital across civil works, land, and equipment
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={componentBreakdown}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {componentBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff'
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')} Cr`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {componentBreakdown.map((cb: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">{cb.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                  ₹{cb.value.toLocaleString('en-IN')} Cr
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Financial Comparison Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Major Project Cost Variance & Remaining Balance
          </h2>
          <p className="text-[11px] text-slate-400 mb-4">
            Auditing individual project cost revisions against expenditure absorption
          </p>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                  <th className="py-2">Project</th>
                  <th className="py-2">Approved</th>
                  <th className="py-2">Revised</th>
                  <th className="py-2">Spent</th>
                  <th className="py-2">Remaining</th>
                  <th className="py-2">CPI</th>
                  <th className="py-2">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projectFinancials.map((pf: any) => (
                  <tr key={pf.projectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                      {pf.name}
                    </td>
                    <td className="py-2.5">₹{pf.approvedCost} Cr</td>
                    <td className="py-2.5 font-semibold">₹{pf.revisedCost} Cr</td>
                    <td className="py-2.5 text-emerald-600 font-bold">₹{pf.actualExpenditure} Cr</td>
                    <td className="py-2.5 text-slate-500">₹{pf.remaining} Cr</td>
                    <td className="py-2.5">
                      <span className={`font-bold ${pf.cpi >= 1.0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {pf.cpi}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="font-bold text-blue-600">{pf.utilization}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Record Expenditure */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Record Capital Expenditure Voucher
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenditure} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Target Project</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Expenditure Component</label>
                  <select
                    value={form.component}
                    onChange={(e) => setForm({ ...form, component: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Civil Works">Civil Works</option>
                    <option value="Land Acquisition">Land Acquisition</option>
                    <option value="Equipment & Machinery">Equipment & Machinery</option>
                    <option value="Project Consultancy">Project Consultancy</option>
                    <option value="Contingency & Other">Contingency & Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Actual Amount (₹ Cr)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={form.actualAmount}
                    onChange={(e) => setForm({ ...form, actualAmount: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Invoice / Reference No.</label>
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Vendor / Beneficiary</label>
                  <input
                    type="text"
                    value={form.vendorName}
                    onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
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
                  Record Entry & Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

