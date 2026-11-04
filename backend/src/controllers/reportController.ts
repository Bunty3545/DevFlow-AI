import { Response } from 'express';
import { ProjectRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { generateProjectsExcel, generateProjectsCSV } from '../services/exportService';

export const exportProjectsExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectRepo.find();
    const buffer = generateProjectsExcel(projects);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=DevFlow_Projects_Report.xlsx');
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportProjectsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectRepo.find();
    const csvData = generateProjectsCSV(projects);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=DevFlow_Projects_Report.csv');
    res.send(csvData);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComprehensiveReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectRepo.find();

    const totalProjects = projects.length;
    const criticalProjects = projects.filter(p => p.riskLevel === 'Critical');
    const highRiskProjects = projects.filter(p => p.riskLevel === 'High');
    const totalApproved = projects.reduce((s, p) => s + p.approvedCost, 0);
    const totalRevised = projects.reduce((s, p) => s + p.revisedCost, 0);
    const totalSpent = projects.reduce((s, p) => s + p.actualExpenditure, 0);

    res.status(200).json({
      success: true,
      reportMetadata: {
        title: 'MoSPI National Infrastructure Monitoring Dossier',
        generatedAt: new Date(),
        generatedBy: req.user?.name || 'Monitoring Cell',
        authority: 'Ministry of Statistics and Programme Implementation'
      },
      summary: {
        totalProjects,
        criticalCount: criticalProjects.length,
        highRiskCount: highRiskProjects.length,
        totalApprovedCostCr: Number(totalApproved.toFixed(2)),
        totalRevisedCostCr: Number(totalRevised.toFixed(2)),
        totalExpenditureCr: Number(totalSpent.toFixed(2)),
        aggregateCostOverrunCr: Number(Math.max(0, totalRevised - totalApproved).toFixed(2))
      },
      criticalProjectsSummary: criticalProjects.map(cp => ({
        projectId: cp.projectId,
        name: cp.name,
        sector: cp.sector,
        state: cp.state,
        riskScore: cp.riskScore,
        cpi: cp.cpi,
        spi: cp.spi,
        projectedDelayMonths: cp.projectedDelayMonths,
        projectedOverrunCr: cp.projectedCostOverrun,
        keyDrivers: cp.aiRiskSummary
      })),
      allProjects: projects
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
