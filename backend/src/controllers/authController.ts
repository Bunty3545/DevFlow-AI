import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepo, ActivityLogRepo } from '../models/store';
import { IUser } from '../models/User';
import { config } from '../config/config';
import { AuthRequest } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, organization, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await UserRepo.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const user = await UserRepo.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'officer',
      department: department || 'MoSPI Monitoring Division',
      organization: organization || 'Government of India',
      phone: phone || ''
    });

    const token = generateToken(user);

    await ActivityLogRepo.create({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id.toString(),
      details: `New account registered as ${user.role}`
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organization: user.organization
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await UserRepo.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact Administrator.' });
      return;
    }

    const token = generateToken(user);

    await ActivityLogRepo.create({
      userId: user._id.toString(),
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      details: 'User logged in'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organization: user.organization,
        assignedProjects: user.assignedProjects
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        organization: req.user.organization,
        phone: req.user.phone,
        avatar: req.user.avatar,
        assignedProjects: req.user.assignedProjects
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, department, organization, phone, password } = req.body;
    const user = await UserRepo.findById(req.user._id.toString());

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (name) user.name = name;
    if (department) user.department = department;
    if (organization) user.organization = organization;
    if (phone !== undefined) user.phone = phone;
    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        organization: user.organization,
        phone: user.phone
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
