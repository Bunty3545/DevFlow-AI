import { Response } from 'express';
import { IssueRepo, ActivityLogRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';

export const getIssues = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, severity, status, category } = req.query;
    const filter: any = {};

    if (projectId) filter.projectId = (projectId as string).toUpperCase();
    if (severity && severity !== 'All') filter.severity = severity;
    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;

    const issues = await IssueRepo.find(filter);

    const now = new Date();
    const enriched = issues.map((iss: any) => {
      const isOverdue = iss.status !== 'Resolved' && iss.status !== 'Closed' && new Date(iss.dueDate) < now;
      return {
        ...iss,
        isOverdue
      };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, title, description, category, severity, assignedTo, dueDate } = req.body;

    if (!projectId || !title || !description) {
      res.status(400).json({ success: false, message: 'Project ID, title, and description are required.' });
      return;
    }

    const count = await IssueRepo.countDocuments();
    const issueId = `ISSUE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const newIssue = await IssueRepo.create({
      issueId,
      projectId: projectId.toUpperCase(),
      title,
      description,
      category: category || 'Other',
      severity: severity || 'Medium',
      status: 'Open',
      raisedBy: req.user?.name || 'Site Engineer',
      assignedTo: assignedTo || 'Project Manager',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      activityHistory: [
        {
          comment: `Issue logged with ${severity || 'Medium'} severity.`,
          author: req.user?.name || 'Site Engineer',
          authorRole: req.user?.role || 'agency',
          date: new Date()
        }
      ]
    });

    await ActivityLogRepo.create({
      userId: req.user?._id.toString() || 'system',
      userName: req.user?.name || 'Site Engineer',
      userRole: req.user?.role || 'agency',
      action: 'ISSUE_RAISED',
      entityType: 'Issue',
      entityId: newIssue.issueId,
      details: `Logged issue ${newIssue.issueId}: ${newIssue.title}`
    });

    res.status(201).json({
      success: true,
      message: 'Issue raised successfully',
      data: newIssue
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIssue = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, severity, assignedTo, dueDate, escalatedToMinistry, newComment } = req.body;

    const issue = await IssueRepo.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { issueId: id.toUpperCase() }]
    });

    if (!issue) {
      res.status(404).json({ success: false, message: 'Issue not found.' });
      return;
    }

    if (status) {
      issue.status = status;
      if (status === 'Resolved' || status === 'Closed') {
        issue.resolvedDate = new Date();
      }
    }
    if (resolutionNotes !== undefined) issue.resolutionNotes = resolutionNotes;
    if (severity) issue.severity = severity;
    if (assignedTo) issue.assignedTo = assignedTo;
    if (dueDate) issue.dueDate = new Date(dueDate);
    if (escalatedToMinistry !== undefined) issue.escalatedToMinistry = escalatedToMinistry;

    if (newComment) {
      if (!issue.activityHistory) issue.activityHistory = [];
      issue.activityHistory.push({
        comment: newComment,
        author: req.user?.name || 'Officer',
        authorRole: req.user?.role || 'officer',
        date: new Date()
      });
    }

    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: issue
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
