import * as XLSX from 'xlsx';
import { IProject } from '../models/Project';

export function generateProjectsExcel(projects: IProject[]): Buffer {
  const data = projects.map(p => ({
    'Project ID': p.projectId,
    'Project Name': p.name,
    'Sector': p.sector,
    'Ministry': p.ministry,
    'State': p.state,
    'District': p.district,
    'Agency': p.implementingAgency,
    'Approved Cost (Cr)': p.approvedCost,
    'Revised Cost (Cr)': p.revisedCost,
    'Actual Expenditure (Cr)': p.actualExpenditure,
    'Planned Progress (%)': p.plannedProgress,
    'Actual Progress (%)': p.actualProgress,
    'Status': p.status,
    'Risk Level': p.riskLevel,
    'Risk Score': p.riskScore,
    'CPI': p.cpi,
    'SPI': p.spi,
    'Projected Delay (Months)': p.projectedDelayMonths,
    'Projected Overrun (Cr)': p.projectedCostOverrun,
    'Start Date': new Date(p.startDate).toISOString().split('T')[0],
    'Target Completion': new Date(p.targetCompletionDate).toISOString().split('T')[0]
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Projects Performance');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

export function generateProjectsCSV(projects: IProject[]): string {
  const headers = [
    'Project ID',
    'Project Name',
    'Sector',
    'Ministry',
    'State',
    'District',
    'Approved Cost (Cr)',
    'Revised Cost (Cr)',
    'Actual Expenditure (Cr)',
    'Planned Progress (%)',
    'Actual Progress (%)',
    'Status',
    'Risk Level',
    'Risk Score',
    'CPI',
    'SPI',
    'Projected Delay Months'
  ];

  const rows = projects.map(p => [
    `"${p.projectId}"`,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.sector}"`,
    `"${p.ministry}"`,
    `"${p.state}"`,
    `"${p.district}"`,
    p.approvedCost,
    p.revisedCost,
    p.actualExpenditure,
    p.plannedProgress,
    p.actualProgress,
    `"${p.status}"`,
    `"${p.riskLevel}"`,
    p.riskScore,
    p.cpi,
    p.spi,
    p.projectedDelayMonths
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

