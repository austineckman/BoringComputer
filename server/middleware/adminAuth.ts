import { Request, Response, NextFunction } from 'express';

// Define custom interface to extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to check if user has admin role
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  // For development purposes, temporarily skip admin check
  const BYPASS_AUTH = process.env.NODE_ENV === 'development';
  
  if (BYPASS_AUTH) {
    console.log("⚠️ Development mode: Admin authentication bypassed");
    
    // If there's no user yet, create a mock admin user for development
    if (!req.user) {
      (req as any).user = {
        id: 999,
        username: "devadmin",
        email: "dev@example.com",
        roles: ["admin", "user"],
        level: 10,
        inventory: {
          "copper": 10,
          "crystal": 5,
          "techscrap": 3,
          "circuit_board": 2,
          "cloth": 8
        }
      };
      console.log("⚠️ Development mode: Created mock admin user");
    }
    
    return next();
  }
  
  // Normal admin auth check for production
  
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user has admin role
  const isAdmin = req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes('admin');
  
  if (!isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // User is authenticated and has admin role
  next();
};