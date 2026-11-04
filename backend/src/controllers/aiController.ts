import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { askInfraAssistant } from '../services/geminiService';
import { ProjectRepo, IssueRepo, MilestoneRepo } from '../models/store';
import { calculateProjectRisk } from '../services/riskEngine';

export const handleAiQuery = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, projectId } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ success: false, message: 'Message query is required.' });
      return;
    }

    const aiResponse = await askInfraAssistant(message, projectId);

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
