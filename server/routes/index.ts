import { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import questRoutes from './quest-routes';
import componentKitRoutes from './component-kit-routes';

export function registerRoutes(app: Express): Server {
  // API routes
  app.use('/api', questRoutes);
  app.use('/api', componentKitRoutes);
  
  // Add any other route groups here
  
  // Health check endpoint
  app.get('/api/health', (_: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}