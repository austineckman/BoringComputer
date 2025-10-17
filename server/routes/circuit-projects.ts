import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticate } from '../auth';
import { conditionalCsrfProtection } from '../middleware/csrf';

const router = Router();

// Get all projects for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const projects = await storage.getCircuitProjects(user.id);
    return res.json(projects);
  } catch (error) {
    console.error('Error fetching circuit projects:', error);
    return res.status(500).json({ message: 'Failed to fetch circuit projects' });
  }
});

// Get all public projects
router.get('/public', async (req, res) => {
  try {
    const projects = await storage.getPublicCircuitProjects();
    return res.json(projects);
  } catch (error) {
    console.error('Error fetching public circuit projects:', error);
    return res.status(500).json({ message: 'Failed to fetch public circuit projects' });
  }
});

// Get a specific project
router.get('/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const project = await storage.getCircuitProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Circuit project not found' });
    }
    
    // If project is not public, check user authentication
    if (!project.isPublic) {
      // Check if user is authenticated
      if (!(req as any).user) {
        return res.status(401).json({ message: 'Unauthorized access to private project' });
      }
      
      // Check if user owns the project
      if (project.userId !== (req as any).user.id) {
        return res.status(403).json({ message: 'You do not have permission to view this project' });
      }
    }
    
    return res.json(project);
  } catch (error) {
    console.error('Error fetching circuit project:', error);
    return res.status(500).json({ message: 'Failed to fetch circuit project' });
  }
});

// Create a new project (supports both authenticated users and guests)
router.post('/', conditionalCsrfProtection, async (req, res) => {
  try {
    const user = (req as any).user; // May be undefined for guest users
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      circuit: z.any(), // Circuit design JSON
      code: z.string(),
      boardCodes: z.record(z.string()).optional(), // Multi-board support
      thumbnail: z.string().optional(),
      isPublic: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
      guestName: z.string().optional() // For guest users
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid project data', 
        errors: result.error.format() 
      });
    }
    
    const projectData = result.data;
    
    // Create the project
    const project = await storage.createCircuitProject({
      userId: user?.id, // Optional for guests
      guestName: projectData.guestName,
      name: projectData.name,
      description: projectData.description || '',
      circuit: projectData.circuit,
      code: projectData.code,
      boardCodes: projectData.boardCodes || {},
      thumbnail: projectData.thumbnail,
      isPublic: projectData.isPublic,
      tags: projectData.tags || []
    });
    
    // Add to user's recent projects if authenticated
    if (user) {
      await storage.addRecentProject(user.id, project.id);
    }
    
    return res.status(201).json(project);
  } catch (error) {
    console.error('Error creating circuit project:', error);
    return res.status(500).json({ message: 'Failed to create circuit project' });
  }
});

// Update a project
router.put('/:id', authenticate, conditionalCsrfProtection, async (req, res) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.id);
    
    // Check if project exists and user owns it
    const existingProject = await storage.getCircuitProject(projectId);
    
    if (!existingProject) {
      return res.status(404).json({ message: 'Circuit project not found' });
    }
    
    if (existingProject.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this project' });
    }
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(1, 'Name is required').optional(),
      description: z.string().optional(),
      circuit: z.any().optional(), // Circuit design JSON
      code: z.string().optional(),
      boardCodes: z.record(z.string()).optional(), // Multi-board support
      thumbnail: z.string().optional(),
      isPublic: z.boolean().optional(),
      tags: z.array(z.string()).optional()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid project data', 
        errors: result.error.format() 
      });
    }
    
    const projectData = result.data;
    
    // Update the project
    const updatedProject = await storage.updateCircuitProject(projectId, projectData);
    
    // Add to user's recent projects
    await storage.addRecentProject(user.id, projectId);
    
    return res.json(updatedProject);
  } catch (error) {
    console.error('Error updating circuit project:', error);
    return res.status(500).json({ message: 'Failed to update circuit project' });
  }
});

// Delete a project
router.delete('/:id', authenticate, conditionalCsrfProtection, async (req, res) => {
  try {
    const user = (req as any).user;
    const projectId = parseInt(req.params.id);
    
    // Check if project exists and user owns it
    const existingProject = await storage.getCircuitProject(projectId);
    
    if (!existingProject) {
      return res.status(404).json({ message: 'Circuit project not found' });
    }
    
    if (existingProject.userId !== user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this project' });
    }
    
    // Delete the project
    const success = await storage.deleteCircuitProject(projectId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete circuit project' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting circuit project:', error);
    return res.status(500).json({ message: 'Failed to delete circuit project' });
  }
});

// Search for projects
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string || '';
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
    
    const projects = await storage.searchCircuitProjects(query, tags);
    return res.json(projects);
  } catch (error) {
    console.error('Error searching circuit projects:', error);
    return res.status(500).json({ message: 'Failed to search circuit projects' });
  }
});

// Get user simulator settings
router.get('/settings', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const settings = await storage.getUserSimulatorSettings(user.id);
    
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        userId: user.id,
        preferences: {
          theme: "default",
          fontSize: 14,
          autosave: true,
          livePreview: true,
          highlightSyntax: true
        },
        recentProjects: [],
        savedTemplates: []
      });
    }
    
    return res.json(settings);
  } catch (error) {
    console.error('Error fetching simulator settings:', error);
    return res.status(500).json({ message: 'Failed to fetch simulator settings' });
  }
});

// Update user simulator settings
router.put('/settings', authenticate, conditionalCsrfProtection, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Validate request body
    const schema = z.object({
      preferences: z.object({
        theme: z.string().optional(),
        fontSize: z.number().optional(),
        autosave: z.boolean().optional(),
        livePreview: z.boolean().optional(),
        highlightSyntax: z.boolean().optional()
      }).optional(),
      savedTemplates: z.array(
        z.object({
          name: z.string(),
          circuit: z.any(),
          code: z.string()
        })
      ).optional()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid settings data', 
        errors: result.error.format() 
      });
    }
    
    const settingsData = result.data;
    
    // Get existing settings or create new ones
    let settings = await storage.getUserSimulatorSettings(user.id);
    
    if (!settings) {
      settings = await storage.createUserSimulatorSettings({
        userId: user.id,
        preferences: settingsData.preferences || {
          theme: "default",
          fontSize: 14,
          autosave: true,
          livePreview: true,
          highlightSyntax: true
        },
        recentProjects: [],
        savedTemplates: settingsData.savedTemplates || []
      });
    } else {
      settings = await storage.updateUserSimulatorSettings(user.id, settingsData);
    }
    
    return res.json(settings);
  } catch (error) {
    console.error('Error updating simulator settings:', error);
    return res.status(500).json({ message: 'Failed to update simulator settings' });
  }
});

// Save a template
router.post('/templates', authenticate, conditionalCsrfProtection, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      circuit: z.any(), // Circuit design JSON
      code: z.string()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid template data', 
        errors: result.error.format() 
      });
    }
    
    const templateData = result.data;
    
    // Save the template
    const settings = await storage.saveTemplate(user.id, templateData);
    
    return res.json(settings);
  } catch (error) {
    console.error('Error saving template:', error);
    return res.status(500).json({ message: 'Failed to save template' });
  }
});

export default router;