import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Add user to the request object for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    // Add user to the request object for downstream handlers
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Add TypeScript typings for Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}