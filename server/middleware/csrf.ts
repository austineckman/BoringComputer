import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const csrfTokens = new Map<string, { token: string, expires: number }>();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  // Use Array.from to avoid downlevelIteration issues
  Array.from(csrfTokens.entries()).forEach(([sessionId, data]) => {
    if (data.expires < now) {
      csrfTokens.delete(sessionId);
    }
  });
}, 3600 * 1000);

/**
 * Generate a CSRF token for the current session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  
  // Store the token with a 24-hour expiration
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 24 * 3600 * 1000
  });
  
  return token;
}

/**
 * Validate a CSRF token for the current session
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const storedData = csrfTokens.get(sessionId);
  
  if (!storedData) {
    return false;
  }
  
  // Check if token is expired
  if (storedData.expires < Date.now()) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return storedData.token === token;
}

/**
 * CSRF protection middleware that only applies to state-changing methods
 * This avoids placing CSRF requirements on GET requests
 */
export function conditionalCsrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF protection in development mode for easier testing
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Only apply CSRF protection to state-changing methods and API routes
  if (
    (req.method === 'POST' || 
     req.method === 'PUT' || 
     req.method === 'PATCH' || 
     req.method === 'DELETE') && 
    req.path.startsWith('/api')
  ) {
    // Skip CSRF validation for the login/register endpoints
    if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
      return next();
    }
    
    const sessionId = (req as any).sessionID;
    
    if (!sessionId) {
      return res.status(403).json({ error: 'CSRF validation failed: No session ID' });
    }
    
    const token = req.headers['x-csrf-token'] as string;
    
    if (!token) {
      return res.status(403).json({ error: 'CSRF token is required' });
    }
    
    if (!validateCsrfToken(sessionId, token)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
  }
  
  next();
}

/**
 * Error handler for CSRF errors
 */
export function handleCsrfError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code === 'EBADCSRFTOKEN') {
    // Handle CSRF token errors
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  // Pass other errors to the next middleware
  next(err);
}

/**
 * Endpoint to get a CSRF token
 */
export function getCsrfToken(req: Request, res: Response) {
  // In development mode, return a dummy token
  if (process.env.NODE_ENV === 'development') {
    return res.json({ token: 'dev-csrf-token' });
  }
  
  const sessionId = (req as any).sessionID;
  
  if (!sessionId) {
    return res.status(403).json({ error: 'No session found' });
  }
  
  const token = generateCsrfToken(sessionId);
  
  res.json({ token });
}