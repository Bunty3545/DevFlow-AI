import { Response } from 'express';
import { ProjectRepo, ExpenditureRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';

export const getFinancialOverview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const filter: any = {};
    if (projectId) filter.projectId = (projectId as string).toUpperCase();

    const projects = await ProjectRepo.find(filter);
    const expenditures = await ExpenditureRepo.find(filter);

    const totalApproved = projects.reduce((s, p) => s + p.approvedCost, 0);
    const totalRevised = projects.reduce((s, p) => s + (p.revisedCost || p.approvedCost), 0);
    const totalExpenditure = projects.reduce((s, p) => s + p.actualExpenditure, 0);
    const remainingBudget = totalRevised - totalExpenditure;
    const overallVariance = totalRevised - totalApproved;
    const utilizationRate = totalRevised > 0 ? (totalExpenditure / totalRevised) * 100 : 0;

    const componentMap: { [key: string]: number } = {
      'Civil Works': 0,
      'Land Acquisition': 0,
      'Equipment & Machinery': 0,
      'Project Consultancy': 0,
      'Contingency & Other': 0
    };

    expenditures.forEach(e => {
      const comp = e.component || 'Civil Works';
      componentMap[comp] = (componentMap[comp] || 0) + e.actualAmount;
    });

    const componentBreakdown = Object.entries(componentMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalApproved: Number(totalApproved.toFixed(2)),
        totalRevised: Number(totalRevised.toFixed(2)),
        totalExpenditure: Number(totalExpenditure.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        overallVariance: Number(overallVariance.toFixed(2)),
        utilizationRate: Number(utilizationRate.toFixed(1))
      },
      componentBreakdown,
      recentExpenditures: expenditures.slice(0, 20),
      projectFinancials: projects.map(p => ({
        projectId: p.projectId,
        name: p.name,
        approvedCost: p.approvedCost,
        revisedCost: p.revisedCost,
        actualExpenditure: p.actualExpenditure,
        remaining: Number((p.revisedCost - p.actualExpenditure).toFixed(2)),
        utilization: Number(((p.actualExpenditure / p.revisedCost) * 100).toFixed(1)),
        cpi: p.cpi,
        projectedOverrun: p.projectedCostOverrun
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addExpenditure = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      financialYear,
      quarter,
      month,
      component,
      plannedAmount,
      actualAmount,
      invoiceNumber,
      vendorName,
      remarks
    } = req.body;

    const project = await ProjectRepo.findOne({ projectId: projectId.toUpperCase() });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const variance = Number(actualAmount) - Number(plannedAmount);

    const record = await ExpenditureRepo.create({
      projectId: project.projectId,
      financialYear: financialYear || '2024-2025',
      quarter: quarter || 'Q3',
      month: month || 'October',
      component: component || 'Civil Works',
      plannedAmount: Number(plannedAmount),
      actualAmount: Number(actualAmount),
      variance: Number(variance.toFixed(2)),
      invoiceNumber: invoiceNumber || '',
      vendorName: vendorName || '',
      recordedBy: req.user?.name || 'Finance Officer',
      remarks: remarks || ''
    });

    project.actualExpenditure += Number(actualAmount);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Expenditure record created successfully',
      data: record
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
