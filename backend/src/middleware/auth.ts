import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UserRepo } from '../models/store';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

    const user = await UserRepo.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, message: 'Account has been deactivated.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
