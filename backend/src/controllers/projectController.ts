import { Response } from 'express';
import { ProjectRepo, MilestoneRepo, IssueRepo, ActivityLogRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';
import { calculateProjectRisk } from '../services/riskEngine';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      sector,
      ministry,
      state,
      riskLevel,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '50'
    } = req.query;

    const filter: any = {};

    if (req.user?.role === 'manager' && req.user.assignedProjects?.length) {
      filter.projectId = { $in: req.user.assignedProjects };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { projectId: { $regex: search as string, $options: 'i' } },
        { district: { $regex: search as string, $options: 'i' } },
        { implementingAgency: { $regex: search as string, $options: 'i' } }
      ];
    }

    if (sector && sector !== 'All') filter.sector = sector;
    if (ministry && ministry !== 'All') filter.ministry = ministry;
    if (state && state !== 'All') filter.state = state;
    if (riskLevel && riskLevel !== 'All') filter.riskLevel = riskLevel;
    if (status && status !== 'All') filter.status = status;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    sortOption[sortBy as string] = order === 'asc' ? 1 : -1;

    const total = await ProjectRepo.countDocuments(filter);
    const projects = await ProjectRepo.find(filter, {
      sort: sortOption,
      skip,
      limit: limitNum
    });

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await ProjectRepo.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id.toUpperCase() }]
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const milestones = await MilestoneRepo.find({ projectId: project.projectId });
    const issues = await IssueRepo.find({ projectId: project.projectId });

    res.status(200).json({
      success: true,
      data: project,
      milestones,
      issues
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectData = req.body;

    const existing = await ProjectRepo.findOne({ projectId: projectData.projectId?.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: `Project ID ${projectData.projectId} already exists.` });
      return;
    }

    const preliminaryMetrics = calculateProjectRisk(projectData as any);

    const newProject = await ProjectRepo.create({
      ...projectData,
      projectId: projectData.projectId.toUpperCase(),
      riskScore: preliminaryMetrics.riskScore,
      riskLevel: preliminaryMetrics.riskCategory,
      cpi: preliminaryMetrics.cpi,
      spi: preliminaryMetrics.spi,
      projectedCostOverrun: preliminaryMetrics.projectedCostOverrun,
      projectedDelayMonths: preliminaryMetrics.projectedDelayMonths,
      predictedCompletionDate: preliminaryMetrics.predictedCompletionDate,
      aiRiskSummary: preliminaryMetrics.explanation
    });

    await ActivityLogRepo.create({
      userId: req.user?._id.toString() || 'system',
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'admin',
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: newProject.projectId,
      details: `Registered new project: ${newProject.name} with approved cost ₹${newProject.approvedCost} Cr.`
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: newProject
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await ProjectRepo.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id.toUpperCase() }]
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    Object.assign(project, req.body);
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
    project.aiRiskSummary = metrics.explanation;

    await project.save();

    await ActivityLogRepo.create({
      userId: req.user?._id.toString() || 'system',
      userName: req.user?.name || 'User',
      userRole: req.user?.role || 'admin',
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: project.projectId,
      details: `Updated parameters for project ${project.projectId}`
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await ProjectRepo.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { projectId: id.toUpperCase() }]
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    await MilestoneRepo.deleteMany({ projectId: project.projectId });
    await IssueRepo.deleteMany({ projectId: project.projectId });

    await ActivityLogRepo.create({
      userId: req.user?._id.toString() || 'system',
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'admin',
      action: 'PROJECT_DELETED',
      entityType: 'Project',
      entityId: project.projectId,
      details: `Deleted project: ${project.name} (${project.projectId})`
    });

    res.status(200).json({
      success: true,
      message: 'Project and associated records deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
