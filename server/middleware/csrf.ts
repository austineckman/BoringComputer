import { Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

// Create CSRF middleware with cookie-based tokens
export const csrfProtection = csurf({ 
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
});

// Route to get a CSRF token
export const getCsrfToken = (req: Request, res: Response) => {
  return res.json({ csrfToken: req.csrfToken() });
};

// Custom error handler for CSRF errors
export const handleCsrfError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // CSRF token validation failed
    console.error('CSRF attack detected:', req.method, req.path);
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      message: 'Form has been tampered with'
    });
  }
  
  // Pass other errors to next error handler
  next(err);
};

// List of routes that should be exempt from CSRF protection
const csrfExemptRoutes = [
  '/api/auth/login',   // Login can be exempt as it uses credentials
  '/api/auth/register' // Registration can be exempt as it creates a new user
];

// Middleware to conditionally apply CSRF protection
export const conditionalCsrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for exempt routes
  if (csrfExemptRoutes.includes(req.path)) {
    return next();
  }
  
  // Skip CSRF for GET, HEAD, OPTIONS requests (they should be safe)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Apply CSRF protection for all other routes
  return csrfProtection(req, res, next);
};