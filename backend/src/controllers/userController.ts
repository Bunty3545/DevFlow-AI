import { Response } from 'express';
import { UserRepo, ActivityLogRepo } from '../models/store';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await UserRepo.find();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role, department, organization, isActive, assignedProjects } = req.body;

    const user = await UserRepo.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (role) user.role = role;
    if (department) user.department = department;
    if (organization) user.organization = organization;
    if (isActive !== undefined) user.isActive = isActive;
    if (assignedProjects) user.assignedProjects = assignedProjects;

    await user.save();

    await ActivityLogRepo.create({
      userId: req.user?._id.toString() || 'system',
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'admin',
      action: 'USER_ROLE_UPDATED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `Updated role of ${user.email} to ${user.role}`
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organization: user.organization,
        phone: user.phone,
        isActive: user.isActive,
        assignedProjects: user.assignedProjects
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (req.user?._id.toString() === userId) {
      res.status(400).json({ success: false, message: 'Cannot delete your own administrator account.' });
      return;
    }

    const deleted = await UserRepo.findByIdAndDelete(userId);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User removed successfully.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
