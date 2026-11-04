import { Response } from 'express';
import { MilestoneRepo, ProjectRepo, IssueRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { calculateProjectRisk } from '../services/riskEngine';

export const getMilestones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const filter: any = {};
    if (projectId) filter.projectId = (projectId as string).toUpperCase();

    const milestones = await MilestoneRepo.find(filter);
    res.status(200).json({ success: true, data: milestones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      title,
      description,
      sequence,
      weightage,
      plannedStartDate,
      plannedCompletionDate,
      isCriticalPath
    } = req.body;

    const project = await ProjectRepo.findOne({ projectId: projectId.toUpperCase() });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const milestone = await MilestoneRepo.create({
      projectId: project.projectId,
      title,
      description: description || '',
      sequence: Number(sequence) || 1,
      weightage: Number(weightage) || 10,
      plannedStartDate: new Date(plannedStartDate),
      plannedCompletionDate: new Date(plannedCompletionDate),
      isCriticalPath: Boolean(isCriticalPath),
      status: 'Pending',
      progressPercentage: 0
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: milestone
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMilestone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const milestone = await MilestoneRepo.findById(id);

    if (!milestone) {
      res.status(404).json({ success: false, message: 'Milestone not found.' });
      return;
    }

    const {
      progressPercentage,
      status,
      actualCompletionDate,
      revisedCompletionDate,
      remarks,
      weightage,
      isCriticalPath
    } = req.body;

    if (progressPercentage !== undefined) milestone.progressPercentage = Number(progressPercentage);
    if (status) milestone.status = status;
    if (actualCompletionDate) milestone.actualCompletionDate = new Date(actualCompletionDate);
    if (revisedCompletionDate) milestone.revisedCompletionDate = new Date(revisedCompletionDate);
    if (remarks !== undefined) milestone.remarks = remarks;
    if (weightage !== undefined) milestone.weightage = Number(weightage);
    if (isCriticalPath !== undefined) milestone.isCriticalPath = Boolean(isCriticalPath);

    if (milestone.progressPercentage === 100 && milestone.status !== 'Completed') {
      milestone.status = 'Completed';
      milestone.actualCompletionDate = new Date();
    }

    await milestone.save();

    const project = await ProjectRepo.findOne({ projectId: milestone.projectId });
    if (project) {
      const allMilestones = await MilestoneRepo.find({ projectId: project.projectId });
      const issues = await IssueRepo.find({ projectId: project.projectId });
      const metrics = calculateProjectRisk(project, allMilestones, issues);

      project.riskScore = metrics.riskScore;
      project.riskLevel = metrics.riskCategory;
      await project.save();
    }

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
