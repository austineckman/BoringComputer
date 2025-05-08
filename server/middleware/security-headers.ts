import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that adds security headers to all responses
 */
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  // Customize this based on your app's needs
  const cspHeader = process.env.NODE_ENV === 'production' 
    ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';"
    : ""; // In development, we'll keep it open to avoid issues with hot reload
  
  if (process.env.NODE_ENV === 'production') {
    // Only set CSP in production to avoid issues with development tools
    res.setHeader('Content-Security-Policy', cspHeader);
  }
  
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Strict Transport Security (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
}