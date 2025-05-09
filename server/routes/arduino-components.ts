import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticate } from '../auth';
import { adminAuth } from '../middleware/adminAuth';
import { conditionalCsrfProtection } from '../middleware/csrf';

const router = Router();

// Get all Arduino components
router.get('/', async (req, res) => {
  try {
    const components = await storage.getArduinoComponents();
    return res.json(components);
  } catch (error) {
    console.error('Error fetching Arduino components:', error);
    return res.status(500).json({ message: 'Failed to fetch Arduino components' });
  }
});

// Get components by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const components = await storage.getArduinoComponentsByCategory(category);
    return res.json(components);
  } catch (error) {
    console.error('Error fetching Arduino components by category:', error);
    return res.status(500).json({ message: 'Failed to fetch Arduino components by category' });
  }
});

// Get a specific component
router.get('/:id', async (req, res) => {
  try {
    const componentId = req.params.id;
    const component = await storage.getArduinoComponent(componentId);
    
    if (!component) {
      return res.status(404).json({ message: 'Arduino component not found' });
    }
    
    return res.json(component);
  } catch (error) {
    console.error('Error fetching Arduino component:', error);
    return res.status(500).json({ message: 'Failed to fetch Arduino component' });
  }
});

// Create a new component (admin only)
router.post('/', authenticate, adminAuth, conditionalCsrfProtection, async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      id: z.string().min(1, 'ID is required'),
      name: z.string().min(1, 'Name is required'),
      description: z.string().min(1, 'Description is required'),
      category: z.string().min(1, 'Category is required'),
      iconPath: z.string().min(1, 'Icon path is required'),
      pins: z.array(z.object({
        name: z.string().min(1, 'Pin name is required'),
        type: z.enum(['input', 'output', 'power', 'ground']),
        description: z.string()
      })).min(1, 'At least one pin is required'),
      properties: z.record(z.any()).optional(),
      exampleCode: z.string().optional()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid component data', 
        errors: result.error.format() 
      });
    }
    
    const componentData = result.data;
    
    // Check if component already exists
    const existingComponent = await storage.getArduinoComponent(componentData.id);
    
    if (existingComponent) {
      return res.status(409).json({ message: 'A component with this ID already exists' });
    }
    
    // Create the component
    const component = await storage.createArduinoComponent({
      id: componentData.id,
      name: componentData.name,
      description: componentData.description,
      category: componentData.category,
      iconPath: componentData.iconPath,
      pins: componentData.pins,
      properties: componentData.properties || {},
      exampleCode: componentData.exampleCode
    });
    
    return res.status(201).json(component);
  } catch (error) {
    console.error('Error creating Arduino component:', error);
    return res.status(500).json({ message: 'Failed to create Arduino component' });
  }
});

// Update a component (admin only)
router.put('/:id', authenticate, adminAuth, conditionalCsrfProtection, async (req, res) => {
  try {
    const componentId = req.params.id;
    
    // Check if component exists
    const existingComponent = await storage.getArduinoComponent(componentId);
    
    if (!existingComponent) {
      return res.status(404).json({ message: 'Arduino component not found' });
    }
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(1, 'Name is required').optional(),
      description: z.string().min(1, 'Description is required').optional(),
      category: z.string().min(1, 'Category is required').optional(),
      iconPath: z.string().min(1, 'Icon path is required').optional(),
      pins: z.array(z.object({
        name: z.string().min(1, 'Pin name is required'),
        type: z.enum(['input', 'output', 'power', 'ground']),
        description: z.string()
      })).optional(),
      properties: z.record(z.any()).optional(),
      exampleCode: z.string().optional()
    });
    
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        message: 'Invalid component data', 
        errors: result.error.format() 
      });
    }
    
    const componentData = result.data;
    
    // Update the component
    const updatedComponent = await storage.updateArduinoComponent(componentId, componentData);
    
    return res.json(updatedComponent);
  } catch (error) {
    console.error('Error updating Arduino component:', error);
    return res.status(500).json({ message: 'Failed to update Arduino component' });
  }
});

// Delete a component (admin only)
router.delete('/:id', authenticate, adminAuth, conditionalCsrfProtection, async (req, res) => {
  try {
    const componentId = req.params.id;
    
    // Check if component exists
    const existingComponent = await storage.getArduinoComponent(componentId);
    
    if (!existingComponent) {
      return res.status(404).json({ message: 'Arduino component not found' });
    }
    
    // Delete the component
    const success = await storage.deleteArduinoComponent(componentId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete Arduino component' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting Arduino component:', error);
    return res.status(500).json({ message: 'Failed to delete Arduino component' });
  }
});

export default router;