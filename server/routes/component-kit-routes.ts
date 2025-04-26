import express from 'express';
import { authenticate, requireAdmin } from '../auth';
import { componentKitRepository } from '../repositories';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /api/component-kits
 * Get all component kits with their components
 */
router.get('/component-kits', authenticate, async (req, res) => {
  try {
    const kits = await componentKitRepository.getAllKitsWithComponents();
    return res.json(kits);
  } catch (error) {
    console.error('Error fetching component kits:', error);
    return res.status(500).json({ 
      message: "Failed to fetch component kits", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/component-kits/:id
 * Get a specific component kit with its components
 */
router.get('/component-kits/:id', authenticate, async (req, res) => {
  try {
    const kitId = req.params.id;
    const kit = await componentKitRepository.getKitWithComponents(kitId);
    
    if (!kit) {
      return res.status(404).json({ message: 'Component kit not found' });
    }
    
    return res.json(kit);
  } catch (error) {
    console.error('Error fetching component kit:', error);
    return res.status(500).json({ 
      message: "Failed to fetch component kit", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * Admin Routes
 */

/**
 * POST /api/admin/component-kits
 * Create a new component kit (admin)
 */
router.post('/admin/component-kits', authenticate, requireAdmin, async (req, res) => {
  try {
    // Validate request body
    // Would validate with zod schema here
    const kitData = req.body;
    
    const kit = await componentKitRepository.create(kitData);
    return res.status(201).json(kit);
  } catch (error) {
    console.error('Error creating component kit:', error);
    return res.status(500).json({ 
      message: "Failed to create component kit", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * PUT /api/admin/component-kits/:id
 * Update a component kit (admin)
 */
router.put('/admin/component-kits/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const kitId = req.params.id;
    // Validate request body
    // Would validate with zod schema here
    const kitData = req.body;
    
    const updatedKit = await componentKitRepository.update(kitId, kitData);
    
    if (!updatedKit) {
      return res.status(404).json({ message: "Component kit not found" });
    }
    
    return res.json(updatedKit);
  } catch (error) {
    console.error('Error updating component kit:', error);
    return res.status(500).json({ 
      message: "Failed to update component kit", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * DELETE /api/admin/component-kits/:id
 * Delete a component kit (admin)
 */
router.delete('/admin/component-kits/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const kitId = req.params.id;
    
    const deletedKit = await componentKitRepository.delete(kitId);
    
    if (!deletedKit) {
      return res.status(404).json({ message: "Component kit not found" });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting component kit:', error);
    return res.status(500).json({ 
      message: "Failed to delete component kit", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/admin/component-kits/:kitId/components
 * Add a component to a kit (admin)
 */
router.post('/admin/component-kits/:kitId/components', authenticate, requireAdmin, async (req, res) => {
  try {
    const kitId = req.params.kitId;
    // Validate request body
    // Would validate with zod schema here
    const componentData = req.body;
    
    const component = await componentKitRepository.addComponentToKit(kitId, componentData);
    return res.status(201).json(component);
  } catch (error) {
    console.error('Error adding component to kit:', error);
    return res.status(500).json({ 
      message: "Failed to add component to kit", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * PUT /api/admin/components/:id
 * Update a component (admin)
 */
router.put('/admin/components/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const componentId = parseInt(req.params.id);
    // Validate request body
    // Would validate with zod schema here
    const componentData = req.body;
    
    const updatedComponent = await componentKitRepository.updateComponent(componentId, componentData);
    
    if (!updatedComponent) {
      return res.status(404).json({ message: "Component not found" });
    }
    
    return res.json(updatedComponent);
  } catch (error) {
    console.error('Error updating component:', error);
    return res.status(500).json({ 
      message: "Failed to update component", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * DELETE /api/admin/components/:id
 * Delete a component (admin)
 */
router.delete('/admin/components/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const componentId = parseInt(req.params.id);
    
    const deletedComponent = await componentKitRepository.deleteComponent(componentId);
    
    if (!deletedComponent) {
      return res.status(404).json({ message: "Component not found" });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting component:', error);
    return res.status(500).json({ 
      message: "Failed to delete component", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/components/reusable
 * Get all reusable components
 */
router.get('/components/reusable', authenticate, async (req, res) => {
  try {
    const components = await componentKitRepository.getReusableComponents();
    return res.json(components);
  } catch (error) {
    console.error('Error fetching reusable components:', error);
    return res.status(500).json({ 
      message: "Failed to fetch reusable components", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * POST /api/admin/components/:id/copy-to/:kitId
 * Copy a component to another kit (admin)
 */
router.post('/admin/components/:id/copy-to/:kitId', authenticate, requireAdmin, async (req, res) => {
  try {
    const componentId = parseInt(req.params.id);
    const kitId = req.params.kitId;
    
    const newComponent = await componentKitRepository.copyComponentToKit(componentId, kitId);
    return res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error copying component to kit:', error);
    return res.status(500).json({ 
      message: "Failed to copy component to kit", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default router;