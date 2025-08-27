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

// Middleware to check if the user has Oracle access (CraftingTable role)
// CRITICAL SECURITY: NO DEVELOPMENT BYPASSES FOR ORACLE ACCESS
export const hasOracleAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Oracle access check - isAuthenticated:', req.isAuthenticated());
    console.log('Oracle access check - user exists:', !!req.user);
    
    if (!req.isAuthenticated()) {
      console.log('Oracle access denied - user not authenticated');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = (req as any).user;
    console.log('Oracle access check - user roles:', user?.roles);
    
    // Check if user has Oracle access (ONLY CraftingTable role)
    const hasAccess = user.roles && user.roles.includes('CraftingTable');
    
    if (!hasAccess) {
      console.log('Oracle access denied - user lacks required role');
      return res.status(403).json({ message: 'Oracle access denied. Requires CraftingTable role.' });
    }
    
    console.log('Oracle access granted for user:', user.username);
    next();
  } catch (error) {
    console.error('Oracle access authentication error:', error);
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