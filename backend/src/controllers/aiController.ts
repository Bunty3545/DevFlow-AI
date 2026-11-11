import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { askInfraAssistant } from '../services/geminiService';
import { ProjectRepo, IssueRepo, MilestoneRepo } from '../models/store';
import { calculateProjectRisk } from '../services/riskEngine';
import { config } from '../config/config';
import { systemSettings, persistSystemSettings, getTokenStats } from '../config/memoryStore';

export const getAiStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const activeKey = (systemSettings.geminiApiKey || config.geminiApiKey || '').trim();
  res.status(200).json({
    success: true,
    geminiConfigured: activeKey.length > 10,
    mode: activeKey.length > 10 ? 'gemini_live' : 'statistical_fallback',
    tokenStats: getTokenStats()
  });
};

export const resetTokenStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const { totalBudget } = req.body || {};
  if (totalBudget !== undefined && !Number.isNaN(Number(totalBudget)) && Number(totalBudget) > 0) {
    systemSettings.tokenBudgetLimit = Number(totalBudget);
  } else {
    systemSettings.tokenUsage.totalUsed = 0;
    systemSettings.tokenUsage.promptUsed = 0;
    systemSettings.tokenUsage.responseUsed = 0;
    systemSettings.tokenUsage.requestsCount = 0;
  }
  persistSystemSettings();
  res.status(200).json({
    success: true,
    message: 'Token stats updated.',
    tokenStats: getTokenStats()
  });
};

export const handleAiQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, projectId, image, history } = req.body;

    const hasMessage = typeof message === 'string' && message.trim().length > 0;
    const hasImage = Boolean(image && typeof image.data === 'string' && image.data.trim().length > 0);

    if (!hasMessage && !hasImage) {
      res.status(400).json({ success: false, message: 'Message query or screenshot image is required.' });
      return;
    }

    const aiResponse = await askInfraAssistant(hasMessage ? message : '', {
      specificProjectId: projectId || undefined,
      image: hasImage ? image : undefined,
      history: Array.isArray(history) ? history : []
    });

    res.status(200).json({
      success: true,
      ...aiResponse
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectAiAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const project = await ProjectRepo.findOne({ projectId: projectId.toUpperCase() });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found.' });
      return;
    }

    const milestones = await MilestoneRepo.find({ projectId: project.projectId });
    const issues = await IssueRepo.find({ projectId: project.projectId });
    const risk = calculateProjectRisk(project, milestones, issues);

    const auditPrompt = `Summarize the project status and explain why it is at risk: ${project.name} (${project.projectId})`;
    const aiResponse = await askInfraAssistant(auditPrompt, project.projectId);

    res.status(200).json({
      success: true,
      project: {
        id: project.projectId,
        name: project.name,
        riskScore: risk.riskScore,
        riskCategory: risk.riskCategory,
        cpi: risk.cpi,
        spi: risk.spi,
        projectedDelayMonths: risk.projectedDelayMonths,
        projectedCostOverrun: risk.projectedCostOverrun,
        predictedCompletionDate: risk.predictedCompletionDate,
        primaryRiskDrivers: risk.primaryRiskDrivers,
        recommendedMitigations: risk.recommendedMitigations
      },
      aiSummary: aiResponse.answer,
      source: aiResponse.source
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
