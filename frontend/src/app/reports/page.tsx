'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadingType, setDownloadingType] = useState<'excel' | 'csv' | null>(null);

  const handleAuthenticatedDownload = async (type: 'excel' | 'csv') => {
    setDownloadingType(type);
    try {
      if (type === 'excel') {
        await api.downloadExcel();
      } else {
        await api.downloadCsv();
      }
    } catch (err: any) {
      alert(err.message || `Failed to export ${type.toUpperCase()} report`);
    } finally {
      setDownloadingType(null);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await api.getComprehensiveReport();
      if (res.success) {
        setReportData(res);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!reportData) return;
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF('p', 'pt', 'a4');

      // Title & MoSPI Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 595, 70, 'F');

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('Ministry of Statistics and Programme Implementation (MoSPI)', 40, 32);

      doc.setFontSize(10);
      doc.setTextColor(147, 197, 253);
      doc.text('DevFlow AI – AI-Powered Software Development & Project Intelligence Platform', 40, 52);

      // Metadata section
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')} | SIH26103 Verified`, 40, 90);
      doc.text(`Authority: MoSPI Central Monitoring Cell, New Delhi`, 40, 102);

      // Summary Table
      autoTable(doc, {
        startY: 115,
        head: [['Metric Parameter', 'Value']],
        body: [
          ['Total Monitored Projects', `${reportData.summary.totalProjects}`],
          ['Critical & High-Risk Projects', `${reportData.summary.criticalCount + reportData.summary.highRiskCount}`],
          ['Total Approved Capital Outlay', `INR ${reportData.summary.totalApprovedCostCr.toLocaleString('en-IN')} Crores`],
          ['Revised Capital Outlay', `INR ${reportData.summary.totalRevisedCostCr.toLocaleString('en-IN')} Crores`],
          ['Cumulative Actual Expenditure', `INR ${reportData.summary.totalExpenditureCr.toLocaleString('en-IN')} Crores`],
          ['Aggregate Estimated Cost Overrun', `INR ${reportData.summary.aggregateCostOverrunCr.toLocaleString('en-IN')} Crores`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 9 }
      });

      // Projects Performance Table
      const projectRows = (reportData.allProjects || []).map((p: any) => [
        p.projectId,
        p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
        p.sector,
        `INR ${p.approvedCost} Cr`,
        `${p.actualProgress}% / ${p.plannedProgress}%`,
        `${p.riskScore} (${p.riskLevel})`,
        `${p.cpi}`
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Project ID', 'Name', 'Sector', 'Cost', 'Progress', 'Risk', 'CPI']],
        body: projectRows,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      doc.save(`DevFlow_Project_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF report');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const { summary, criticalProjectsSummary } = reportData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Official Reporting & Dossier Generation
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
              MoSPI Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Export high-fidelity executive briefings in PDF, Excel, and CSV formats.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            <span>{generatingPdf ? 'Generating...' : 'Export PDF Dossier'}</span>
          </button>

          <button
            onClick={() => handleAuthenticatedDownload('excel')}
            disabled={downloadingType === 'excel'}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{downloadingType === 'excel' ? 'Downloading...' : 'Download Excel (.xlsx)'}</span>
          </button>

          <button
            onClick={() => handleAuthenticatedDownload('csv')}
            disabled={downloadingType === 'csv'}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>{downloadingType === 'csv' ? 'Downloading...' : 'CSV Dataset'}</span>
          </button>
        </div>
      </div>

      {/* Report Preview Document Container */}
      <div className="p-6 md:p-8 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-6 max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Government of India • MoSPI
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                Infrastructure Project Performance & Risk Review
              </h2>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Reference: MoSPI/IPMD/2026/Q3</p>
              <p>Status: CONFIDENTIAL / OFFICIAL USE</p>
            </div>
          </div>
        </div>

        {/* Executive Overview Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px]">Monitored Assets</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{summary.totalProjects} Projects</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px]">High/Critical Risks</span>
            <p className="text-lg font-black text-red-500 mt-1">{summary.criticalCount + summary.highRiskCount} Projects</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px]">Approved Outlay</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{summary.totalApprovedCostCr.toLocaleString('en-IN')} Cr</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-400 text-[10px]">Aggregate Cost Overrun</span>
            <p className="text-lg font-black text-rose-600 mt-1">₹{summary.aggregateCostOverrunCr.toLocaleString('en-IN')} Cr</p>
          </div>
        </div>

        {/* Critical Surveillance Dossier */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span>Critical Projects Requiring Immediate Apex Intervention</span>
          </h3>

          <div className="space-y-3">
            {criticalProjectsSummary.map((cp: any) => (
              <div
                key={cp.projectId}
                className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {cp.name} ({cp.projectId})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold text-[10px]">
                    Risk Score: {cp.riskScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {cp.keyDrivers || 'Major delay in clearances and high financial variance.'}
                </p>
                <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-1">
                  <span>CPI: <strong>{cp.cpi}</strong></span>
                  <span>SPI: <strong>{cp.spi}</strong></span>
                  <span>Delay Forecast: <strong className="text-red-600">+{cp.projectedDelayMonths} months</strong></span>
                  <span>Overrun Forecast: <strong className="text-red-600">+₹{cp.projectedOverrunCr} Cr</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Sign-off Stamp */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span>Digitally Authenticated by MoSPI Central Project Directorate</span>
          </div>
          <span>Report ID: DOSSIER-2026-SIH</span>
        </div>
      </div>
    </div>
  );
}

