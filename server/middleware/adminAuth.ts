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
 * CRITICAL SECURITY: NO DEVELOPMENT BYPASSES FOR ADMIN ACCESS
 */
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('Admin auth check - isAuthenticated:', req.isAuthenticated());
  console.log('Admin auth check - user exists:', !!req.user);
  
  // Check if user is authenticated via Passport
  if (!req.isAuthenticated()) {
    console.log('Admin access denied - user not authenticated');
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user has admin role
  const user = req.user as any;
  console.log('Admin auth check - user roles:', user?.roles);
  
  const isAdmin = user.roles && Array.isArray(user.roles) && (user.roles.includes('admin') || user.roles.includes('Founder'));
  
  if (!isAdmin) {
    console.log('Admin access denied - user lacks admin role');
    return res.status(403).json({ message: 'Admin access required' });
  }

  console.log('Admin access granted for user:', user.username);
  next();
};