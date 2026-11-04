import { Response } from 'express';
import { ProjectRepo, ProjectUpdateRepo, MilestoneRepo, IssueRepo, NotificationRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { calculateProjectRisk } from '../services/riskEngine';

export const getMonitoringDossier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const project = await ProjectRepo.findOne({ projectId: projectId.toUpperCase() });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const updates = await ProjectUpdateRepo.find({ projectId: project.projectId });
    const milestones = await MilestoneRepo.find({ projectId: project.projectId });
    const issues = await IssueRepo.find({ projectId: project.projectId });

    const sCurvePoints = [
      { period: 'Month 1', planned: 5, actual: 5 },
      { period: 'Month 3', planned: 15, actual: 14 },
      { period: 'Month 6', planned: 30, actual: 26 },
      { period: 'Month 9', planned: 45, actual: Math.min(project.actualProgress, 38) },
      { period: 'Current', planned: project.plannedProgress, actual: project.actualProgress },
      { period: 'Target', planned: 100, actual: project.status === 'Completed' ? 100 : null }
    ];

    res.status(200).json({
      success: true,
      project,
      updates,
      milestones,
      issues,
      sCurvePoints,
      metrics: {
        physicalLag: Number((project.plannedProgress - project.actualProgress).toFixed(1)),
        budgetUtilization: Number(((project.actualExpenditure / (project.revisedCost || project.approvedCost)) * 100).toFixed(1)),
        cpi: project.cpi,
        spi: project.spi,
        projectedDelayMonths: project.projectedDelayMonths,
        projectedOverrun: project.projectedCostOverrun
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitProgressUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const {
      physicalProgress,
      periodExpenditure,
      workCompletedSummary,
      challengesFaced,
      nextMonthPlan,
      sitePhotos
    } = req.body;

    const project = await ProjectRepo.findOne({ projectId: projectId.toUpperCase() });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const update = await ProjectUpdateRepo.create({
      projectId: project.projectId,
      submittedBy: req.user?.name || 'Implementing Agency Staff',
      submitterRole: req.user?.role || 'agency',
      physicalProgress: Number(physicalProgress),
      periodExpenditure: Number(periodExpenditure || 0),
      workCompletedSummary,
      challengesFaced: challengesFaced || '',
      nextMonthPlan: nextMonthPlan || '',
      status: req.user?.role === 'admin' ? 'Approved' : 'Pending Review',
      sitePhotos: sitePhotos || []
    });

    if (req.user?.role === 'admin' || req.user?.role === 'manager') {
      project.actualProgress = Number(physicalProgress);
      project.actualExpenditure += Number(periodExpenditure || 0);
      project.lastUpdated = new Date();

      const milestones = await MilestoneRepo.find({ projectId: project.projectId });
      const issues = await IssueRepo.find({ projectId: project.projectId });
      const metrics = calculateProjectRisk(project, milestones, issues);

      project.riskScore = metrics.riskScore;
      project.riskLevel = metrics.riskCategory;
      project.cpi = metrics.cpi;
      project.spi = metrics.spi;
      project.projectedCostOverrun = metrics.projectedCostOverrun;
      project.projectedDelayMonths = metrics.projectedDelayMonths;
      project.predictedCompletionDate = metrics.predictedCompletionDate;

      await project.save();
    }

    await NotificationRepo.create({
      recipientRole: 'officer',
      title: `Progress Update Submitted: ${project.projectId}`,
      message: `Progress reported at ${physicalProgress}% with ₹${periodExpenditure} Cr outlay.`,
      type: 'info',
      relatedProjectId: project.projectId
    });

    res.status(201).json({
      success: true,
      message: 'Progress update submitted successfully.',
      data: update
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reviewProgressUpdate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { updateId } = req.params;
    const { status, reviewRemarks } = req.body;

    const update = await ProjectUpdateRepo.findById(updateId);
    if (!update) {
      res.status(404).json({ success: false, message: 'Update record not found.' });
      return;
    }

    update.status = status;
    update.reviewRemarks = reviewRemarks || '';
    update.reviewedBy = req.user?.name || 'Monitoring Officer';
    await update.save();

    if (status === 'Approved') {
      const project = await ProjectRepo.findOne({ projectId: update.projectId });
      if (project) {
        project.actualProgress = update.physicalProgress;
        project.actualExpenditure += update.periodExpenditure;
        project.lastUpdated = new Date();

        const milestones = await MilestoneRepo.find({ projectId: project.projectId });
        const issues = await IssueRepo.find({ projectId: project.projectId });
        const metrics = calculateProjectRisk(project, milestones, issues);

        project.riskScore = metrics.riskScore;
        project.riskLevel = metrics.riskCategory;
        project.cpi = metrics.cpi;
        project.spi = metrics.spi;
        project.projectedCostOverrun = metrics.projectedCostOverrun;
        project.projectedDelayMonths = metrics.projectedDelayMonths;
        project.predictedCompletionDate = metrics.predictedCompletionDate;

        await project.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Progress update ${status.toLowerCase()} successfully.`,
      data: update
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
