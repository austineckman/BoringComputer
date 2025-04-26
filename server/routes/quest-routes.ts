import { Request, Response, Router } from 'express';
import { authenticate, requireAdmin } from '../auth';
import { questRepository, componentKitRepository } from '../repositories';
import { insertQuestSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

/**
 * Get all quests with component requirements and kit information
 */
router.get('/quests', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Get user's quests with status information
    const quests = await questRepository.getQuestsForUser(user.id);
    
    // Get quests that are available to the user
    const availableQuests = await questRepository.getAvailableQuestsForUser(user.id);
    
    // Group quests by adventure line
    const questsByAdventureLine: Record<string, any[]> = {};
    
    quests.forEach(quest => {
      const adventureLine = quest.adventureLine;
      if (!questsByAdventureLine[adventureLine]) {
        questsByAdventureLine[adventureLine] = [];
      }
      
      questsByAdventureLine[adventureLine].push(quest);
    });
    
    // Sort each adventure line by orderInLine
    for (const adventureLine in questsByAdventureLine) {
      questsByAdventureLine[adventureLine].sort((a, b) => a.orderInLine - b.orderInLine);
      console.log(`Adventure line ${adventureLine} has ${questsByAdventureLine[adventureLine].length} quests`);
    }
    
    // Log quests with kit associations
    const questsWithKitId = quests.filter(q => q.kitId);
    if (questsWithKitId.length > 0) {
      console.log(`Found ${questsWithKitId.length} quests with direct kit associations:`, 
        questsWithKitId.map(q => ({ id: q.id, title: q.title, kitId: q.kitId })));
    } else {
      console.log('No quests have direct kit associations via kitId field');
    }
    
    // Log component requirements details
    const questsWithComponentReq = quests.filter(q => 
      q.componentRequirements && q.componentRequirements.length > 0);
    
    if (questsWithComponentReq.length > 0) {
      console.log(`Found ${questsWithComponentReq.length} quests with component requirements`);
      console.log('Component requirements summary:');
      
      for (const quest of questsWithComponentReq) {
        console.log(`Quest ${quest.id} (${quest.title}) has ${quest.componentRequirements?.length || 0} components:`);
        for (const qc of quest.componentRequirements) {
          const component = qc.component;
          console.log(`  - ${component.name} (kitId: ${component.kitId || 'none'})`);
        }
      }
    } else {
      console.log('No quests have component requirements');
    }
    
    const responseData = {
      questsByAdventureLine,
      allQuests: Object.values(questsByAdventureLine).flat()
    };
    
    console.log(`Sending response with ${responseData.allQuests.length} total quests in ${Object.keys(responseData.questsByAdventureLine).length} adventure lines`);
    
    return res.json(responseData);
  } catch (error) {
    console.error('Error in /api/quests endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch quests", error: (error as Error).message });
  }
});

/**
 * Get a specific quest by ID with its components
 */
router.get('/quests/:questId', authenticate, async (req: Request, res: Response) => {
  try {
    const questId = parseInt(req.params.questId);
    
    if (isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest ID" });
    }
    
    const quest = await questRepository.getQuestWithComponents(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    return res.json({ quest });
  } catch (error) {
    console.error('Error in /api/quests/:questId endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch quest", error: (error as Error).message });
  }
});

/**
 * Get the currently active quest for a user
 */
router.get('/quests/active', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userQuests = await questRepository.getQuestsForUser(user.id);
    const activeQuest = userQuests.find(q => q.status === 'active');
    
    if (!activeQuest) {
      return res.json(null);
    }
    
    return res.json(activeQuest);
  } catch (error) {
    console.error('Error in /api/quests/active endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch active quest", error: (error as Error).message });
  }
});

/**
 * Start a quest
 */
router.post('/quests/:questId/start', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const questId = parseInt(req.params.questId);
    
    if (isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest ID" });
    }
    
    // Verify the quest exists
    const quest = await questRepository.findById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    // Implementation of starting a quest would go here
    // This depends on how userQuests is handled in your application
    
    return res.json({ success: true, message: "Quest started successfully" });
  } catch (error) {
    console.error('Error in /api/quests/:questId/start endpoint:', error);
    return res.status(500).json({ message: "Failed to start quest", error: (error as Error).message });
  }
});

/**
 * Complete a quest
 */
router.post('/quests/:questId/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const questId = parseInt(req.params.questId);
    const { submission, image } = req.body;
    
    if (isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest ID" });
    }
    
    if (!submission) {
      return res.status(400).json({ message: "Submission text is required" });
    }
    
    // Verify the quest exists
    const quest = await questRepository.findById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    // Implementation of completing a quest would go here
    // This depends on how submissions, userQuests, and rewards are handled
    
    return res.json({ 
      success: true, 
      message: "Quest completed successfully",
      rewards: quest.rewards || [],
      lootBoxRewards: quest.lootBoxRewards || [],
      xpGained: quest.xpReward,
    });
  } catch (error) {
    console.error('Error in /api/quests/:questId/complete endpoint:', error);
    return res.status(500).json({ message: "Failed to complete quest", error: (error as Error).message });
  }
});

/**
 * Create a new quest (admin only)
 */
router.post('/admin/quests', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertQuestSchema.parse(req.body);
    
    // Create the quest
    const quest = await questRepository.create(validatedData);
    
    return res.status(201).json(quest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid quest data", errors: error.flatten() });
    }
    
    console.error('Error in POST /api/admin/quests endpoint:', error);
    return res.status(500).json({ message: "Failed to create quest", error: (error as Error).message });
  }
});

/**
 * Update a quest (admin only)
 */
router.put('/admin/quests/:questId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const questId = parseInt(req.params.questId);
    
    if (isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest ID" });
    }
    
    // Validate request body
    const validatedData = insertQuestSchema.partial().parse(req.body);
    
    // Update the quest
    const quest = await questRepository.update(questId, validatedData);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    return res.json(quest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid quest data", errors: error.flatten() });
    }
    
    console.error('Error in PUT /api/admin/quests/:questId endpoint:', error);
    return res.status(500).json({ message: "Failed to update quest", error: (error as Error).message });
  }
});

/**
 * Delete a quest (admin only)
 */
router.delete('/admin/quests/:questId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const questId = parseInt(req.params.questId);
    
    if (isNaN(questId)) {
      return res.status(400).json({ message: "Invalid quest ID" });
    }
    
    // Delete the quest
    const quest = await questRepository.delete(questId);
    
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    return res.json({ message: "Quest deleted successfully" });
  } catch (error) {
    console.error('Error in DELETE /api/admin/quests/:questId endpoint:', error);
    return res.status(500).json({ message: "Failed to delete quest", error: (error as Error).message });
  }
});

/**
 * Get quests for admin dashboard
 */
router.get('/admin/quests', requireAdmin, async (req: Request, res: Response) => {
  try {
    const quests = await questRepository.getQuestsForAdmin();
    return res.json(quests);
  } catch (error) {
    console.error('Error in GET /api/admin/quests endpoint:', error);
    return res.status(500).json({ message: "Failed to fetch quests", error: (error as Error).message });
  }
});

export default router;