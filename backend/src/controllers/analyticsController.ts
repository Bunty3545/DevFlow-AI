import { Response } from 'express';
import { ProjectRepo, IssueRepo, ActivityLogRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await ProjectRepo.find();

    const totalProjects = projects.length;
    const onTrack = projects.filter(p => p.riskLevel === 'Low' && p.status !== 'Delayed' && p.status !== 'Critical').length;
    const delayed = projects.filter(p => p.status === 'Delayed' || p.plannedProgress - p.actualProgress > 10).length;
    const highRisk = projects.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length;
    const completed = projects.filter(p => p.status === 'Completed').length;

    const totalApprovedBudget = Number(projects.reduce((sum, p) => sum + (p.approvedCost || 0), 0).toFixed(2));
    const totalRevisedBudget = Number(projects.reduce((sum, p) => sum + (p.revisedCost || p.approvedCost || 0), 0).toFixed(2));
    const totalExpenditure = Number(projects.reduce((sum, p) => sum + (p.actualExpenditure || 0), 0).toFixed(2));
    const totalCostOverrun = Number(Math.max(0, totalRevisedBudget - totalApprovedBudget).toFixed(2));

    const avgPhysicalProgress = totalProjects > 0
      ? Number((projects.reduce((sum, p) => sum + p.actualProgress, 0) / totalProjects).toFixed(1))
      : 0;

    const avgPlannedProgress = totalProjects > 0
      ? Number((projects.reduce((sum, p) => sum + p.plannedProgress, 0) / totalProjects).toFixed(1))
      : 0;

    const sectorMap: { [key: string]: { count: number; approvedCost: number; expenditure: number; avgProgress: number } } = {};
    projects.forEach(p => {
      const s = p.sector || 'Other';
      if (!sectorMap[s]) {
        sectorMap[s] = { count: 0, approvedCost: 0, expenditure: 0, avgProgress: 0 };
      }
      sectorMap[s].count += 1;
      sectorMap[s].approvedCost += p.approvedCost;
      sectorMap[s].expenditure += p.actualExpenditure;
      sectorMap[s].avgProgress += p.actualProgress;
    });

    const sectorAnalytics = Object.entries(sectorMap).map(([sector, val]) => ({
      sector,
      count: val.count,
      approvedCost: Number(val.approvedCost.toFixed(2)),
      expenditure: Number(val.expenditure.toFixed(2)),
      avgProgress: Number((val.avgProgress / val.count).toFixed(1))
    }));

    const riskDistribution = [
      { name: 'Low Risk', value: projects.filter(p => p.riskLevel === 'Low').length, color: '#10B981' },
      { name: 'Medium Risk', value: projects.filter(p => p.riskLevel === 'Medium').length, color: '#F59E0B' },
      { name: 'High Risk', value: projects.filter(p => p.riskLevel === 'High').length, color: '#F97316' },
      { name: 'Critical Risk', value: projects.filter(p => p.riskLevel === 'Critical').length, color: '#EF4444' }
    ];

    const statusDistribution = [
      { name: 'On Track', value: onTrack },
      { name: 'Delayed', value: delayed },
      { name: 'Critical', value: highRisk },
      { name: 'Completed', value: completed }
    ];

    const expenditureTrends = [
      { quarter: 'Q1 FY24', planned: 24500, actual: 21800 },
      { quarter: 'Q2 FY24', planned: 29800, actual: 27400 },
      { quarter: 'Q3 FY24', planned: 33400, actual: 30100 },
      { quarter: 'Q4 FY24', planned: 38200, actual: 35900 },
      { quarter: 'Q1 FY25', planned: 41000, actual: 37200 },
      { quarter: 'Q2 FY25', planned: 46500, actual: 41800 }
    ];

    const recentActivities = await ActivityLogRepo.find();

    const criticalIssues = await IssueRepo.find({ severity: 'Critical', status: { $ne: 'Closed' } });

    const criticalAlerts = [
      ...criticalIssues.slice(0, 5).map(ci => ({
        id: ci.issueId,
        type: 'issue' as const,
        title: `Critical Bottleneck: ${ci.title}`,
        projectId: ci.projectId,
        severity: 'Critical',
        date: ci.createdAt
      })),
      ...projects
        .filter(p => p.riskLevel === 'Critical')
        .slice(0, 3)
        .map(cp => ({
          id: cp.projectId,
          type: 'risk' as const,
          title: `Severe Schedule Lag: ${cp.name} is ${(cp.plannedProgress - cp.actualProgress).toFixed(1)}% behind target`,
          projectId: cp.projectId,
          severity: 'Critical',
          date: cp.lastUpdated
        }))
    ];

    res.status(200).json({
      success: true,
      summary: {
        totalProjects,
        onTrack,
        delayed,
        highRisk,
        completed,
        totalApprovedBudget,
        totalRevisedBudget,
        totalExpenditure,
        totalCostOverrun,
        avgPhysicalProgress,
        avgPlannedProgress,
        budgetUtilizationRate: Number(((totalExpenditure / totalApprovedBudget) * 100).toFixed(1))
      },
      sectorAnalytics,
      riskDistribution,
      statusDistribution,
      expenditureTrends,
      recentActivities,
      criticalAlerts
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
