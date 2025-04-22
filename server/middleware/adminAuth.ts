import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user has admin role
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user has admin role
  const user = req.user as any;
  const isAdmin = user.roles && Array.isArray(user.roles) && user.roles.includes('admin');
  
  if (!isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // User is authenticated and has admin role
  next();
};