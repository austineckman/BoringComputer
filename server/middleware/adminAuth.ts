import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure that a user is authenticated and has admin role
 * This protects admin routes from unauthorized access
 */
export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  // First check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Then check if user has admin role
  const user = req.user as any;
  
  // Check roles array for 'admin' role
  if (!user.roles || !Array.isArray(user.roles) || !user.roles.includes('admin')) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  // User is authenticated and has admin role, proceed
  next();
};