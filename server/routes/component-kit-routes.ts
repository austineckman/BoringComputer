import { Request, Response, Router } from 'express';
import { authenticate, requireAdmin } from '../auth';
import { componentKitRepository, questRepository } from '../repositories';
import { insertComponentKitSchema, insertKitComponentSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * Get all component kits with their components
 */
router.get('/kits', authenticate, async (req: Request, res: Response) => {
  try {
    const kits = await componentKitRepository.getAllKitsWithComponents();
    return res.json(kits);
  } catch (error) {
    console.error('Error in GET /api/kits endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch component kits", error: (error as Error).message });
  }
});

/**
 * Get a specific component kit with its components
 */
router.get('/kits/:kitId', authenticate, async (req: Request, res: Response) => {
  try {
    const kitId = req.params.kitId;
    const kit = await componentKitRepository.getKitWithComponents(kitId);
    
    if (!kit) {
      return res.status(404).json({ message: "Component kit not found" });
    }
    
    return res.json(kit);
  } catch (error) {
    console.error('Error in GET /api/kits/:kitId endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch component kit", error: (error as Error).message });
  }
});

/**
 * Get quests by component kit
 */
router.get('/kits/:kitId/quests', authenticate, async (req: Request, res: Response) => {
  try {
    const kitId = req.params.kitId;
    
    // Get quests that directly reference this kit
    const questsWithKit = await questRepository.getQuestsByKitId(kitId);
    
    // Get quests that require components from this kit
    const questsWithComponents = await questRepository.getQuestsByComponentKitId(kitId);
    
    // Combine the results, ensuring no duplicates
    const combinedQuestIds = new Set();
    const combinedQuests = [];
    
    [...questsWithKit, ...questsWithComponents].forEach(quest => {
      if (!combinedQuestIds.has(quest.id)) {
        combinedQuestIds.add(quest.id);
        combinedQuests.push(quest);
      }
    });
    
    return res.json(combinedQuests);
  } catch (error) {
    console.error('Error in GET /api/kits/:kitId/quests endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch quests for component kit", error: (error as Error).message });
  }
});

// Admin routes for managing component kits

/**
 * Create a new component kit (admin only)
 */
router.post('/admin/kits', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertComponentKitSchema.parse(req.body);
    
    // Create the component kit
    const kit = await componentKitRepository.create(validatedData);
    
    return res.status(201).json(kit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid component kit data", errors: error.flatten() });
    }
    
    console.error('Error in POST /api/admin/kits endpoint:', error);
    return res.status(500).json({ message: "Failed to create component kit", error: (error as Error).message });
  }
});

/**
 * Update a component kit (admin only)
 */
router.put('/admin/kits/:kitId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const kitId = req.params.kitId;
    
    // Validate request body
    const validatedData = insertComponentKitSchema.partial().parse(req.body);
    
    // Update the component kit
    const kit = await componentKitRepository.update(kitId, validatedData);
    
    if (!kit) {
      return res.status(404).json({ message: "Component kit not found" });
    }
    
    return res.json(kit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid component kit data", errors: error.flatten() });
    }
    
    console.error('Error in PUT /api/admin/kits/:kitId endpoint:', error);
    return res.status(500).json({ message: "Failed to update component kit", error: (error as Error).message });
  }
});

/**
 * Delete a component kit (admin only)
 */
router.delete('/admin/kits/:kitId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const kitId = req.params.kitId;
    
    // Delete the component kit
    const kit = await componentKitRepository.delete(kitId);
    
    if (!kit) {
      return res.status(404).json({ message: "Component kit not found" });
    }
    
    return res.json({ message: "Component kit deleted successfully" });
  } catch (error) {
    console.error('Error in DELETE /api/admin/kits/:kitId endpoint:', error);
    return res.status(500).json({ message: "Failed to delete component kit", error: (error as Error).message });
  }
});

/**
 * Add a component to a kit (admin only)
 */
router.post('/admin/kits/:kitId/components', requireAdmin, async (req: Request, res: Response) => {
  try {
    const kitId = req.params.kitId;
    
    // Validate request body
    const validatedData = insertKitComponentSchema.parse({
      ...req.body,
      kitId
    });
    
    // Add the component to the kit
    const component = await componentKitRepository.addComponent(validatedData);
    
    return res.status(201).json(component);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid component data", errors: error.flatten() });
    }
    
    console.error('Error in POST /api/admin/kits/:kitId/components endpoint:', error);
    return res.status(500).json({ message: "Failed to add component to kit", error: (error as Error).message });
  }
});

/**
 * Update a component (admin only)
 */
router.put('/admin/components/:componentId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const componentId = parseInt(req.params.componentId);
    
    if (isNaN(componentId)) {
      return res.status(400).json({ message: "Invalid component ID" });
    }
    
    // Validate request body
    const validatedData = insertKitComponentSchema.partial().parse(req.body);
    
    // Update the component
    const component = await componentKitRepository.updateComponent(componentId, validatedData);
    
    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }
    
    return res.json(component);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid component data", errors: error.flatten() });
    }
    
    console.error('Error in PUT /api/admin/components/:componentId endpoint:', error);
    return res.status(500).json({ message: "Failed to update component", error: (error as Error).message });
  }
});

/**
 * Delete a component (admin only)
 */
router.delete('/admin/components/:componentId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const componentId = parseInt(req.params.componentId);
    
    if (isNaN(componentId)) {
      return res.status(400).json({ message: "Invalid component ID" });
    }
    
    // Delete the component
    const component = await componentKitRepository.deleteComponent(componentId);
    
    if (!component) {
      return res.status(404).json({ message: "Component not found" });
    }
    
    return res.json({ message: "Component deleted successfully" });
  } catch (error) {
    console.error('Error in DELETE /api/admin/components/:componentId endpoint:', error);
    return res.status(500).json({ message: "Failed to delete component", error: (error as Error).message });
  }
});

export default router;