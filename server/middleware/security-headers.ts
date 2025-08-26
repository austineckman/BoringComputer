import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that adds security headers to all responses
 */
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Content Security Policy
  // Updated to allow YouTube embeds while maintaining security
  const cspHeader = process.env.NODE_ENV === 'production' 
    ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.ytimg.com https://ytimg.googleusercontent.com; font-src 'self' data:; connect-src 'self'; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;"
    : ""; // In development, we'll keep it open to avoid issues with hot reload
  
  if (process.env.NODE_ENV === 'production') {
    // Only set CSP in production to avoid issues with development tools
    res.setHeader('Content-Security-Policy', cspHeader);
  }
  
  // Prevent browsers from incorrectly detecting non-scripts as scripts
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Updated X-Frame-Options to allow YouTube embeds while preventing clickjacking
  // SAMEORIGIN allows our site to embed itself but blocks external embedding
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