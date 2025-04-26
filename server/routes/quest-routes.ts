import express from 'express';
import { authenticate, requireAdmin } from '../auth';
import { questRepository } from '../repositories';
import { z } from 'zod';

const router = express.Router();

/**
 * GET /api/quests
 * Get all quests with their component requirements
 */
router.get('/quests', authenticate, async (req, res) => {
  try {
    // Get all quests with their component requirements
    const quests = await questRepository.getAllQuestsWithComponents();
    
    // Group quests by adventure line for frontend organization
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
    }
    
    const responseData = {
      questsByAdventureLine,
      // Also include a flat list for backward compatibility
      allQuests: quests
    };
    
    return res.json(responseData);
  } catch (error) {
    console.error('Error fetching quests:', error);
    return res.status(500).json({ 
      message: "Failed to fetch quests", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/quests/:id
 * Get a specific quest with its component requirements
 */
router.get('/quests/:id', authenticate, async (req, res) => {
  try {
    const questId = parseInt(req.params.id);
    const quest = await questRepository.findById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    // Get component requirements for this quest
    const componentRequirements = await questRepository.getQuestComponentRequirements(questId);
    
    return res.json({
      ...quest,
      componentRequirements
    });
  } catch (error) {
    console.error('Error fetching quest:', error);
    return res.status(500).json({ 
      message: "Failed to fetch quest", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/quests/active
 * Get the active quest for the current user
 */
router.get('/quests/active', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Get user quests
    const userQuests = await questRepository.getUserQuests(user.id);
    
    // Find the active quest
    const activeUserQuest = userQuests.find(uq => uq.status === 'active');
    
    if (!activeUserQuest) {
      return res.json(null);
    }
    
    // Get quest details
    const quest = await questRepository.findById(activeUserQuest.questId);
    
    if (!quest) {
      return res.json(null);
    }
    
    // Get component requirements for this quest
    const componentRequirements = await questRepository.getQuestComponentRequirements(quest.id);
    
    return res.json({
      ...quest,
      componentRequirements
    });
  } catch (error) {
    console.error('Error fetching active quest:', error);
    return res.status(500).json({ 
      message: "Failed to fetch active quest", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * POST /api/quests/:id/start
 * Start a quest
 */
router.post('/quests/:id/start', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const questId = parseInt(req.params.id);
    
    // Verify the quest exists
    const quest = await questRepository.findById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    // Start quest for user
    await questRepository.startQuest(user.id, questId);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error starting quest:', error);
    return res.status(500).json({ 
      message: "Failed to start quest", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * POST /api/quests/:id/complete
 * Complete a quest
 */
router.post('/quests/:id/complete', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    const questId = parseInt(req.params.id);
    
    // Verify the quest exists
    const quest = await questRepository.findById(questId);
    
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }
    
    // Complete quest for user
    await questRepository.completeQuest(user.id, questId);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error completing quest:', error);
    return res.status(500).json({ 
      message: "Failed to complete quest", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * GET /api/quests/user
 * Get all quests for the current user
 */
router.get('/quests/user', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Get user quests
    const userQuests = await questRepository.getUserQuests(user.id);
    
    // Get all quests
    const allQuests = await questRepository.getAllQuestsWithComponents();
    
    // Get available quests
    const availableQuests = await questRepository.getAvailableQuestsForUser(user.id);
    
    // Determine status for each quest
    const quests = allQuests.map(quest => {
      const userQuest = userQuests.find(uq => uq.questId === quest.id);
      let status = 'locked';
      
      // If in available quests, mark as available
      if (availableQuests.some(aq => aq.id === quest.id)) {
        status = 'available';
      }
      
      // If user has started/completed, use that status
      if (userQuest) {
        status = userQuest.status;
      }
      
      return {
        ...quest,
        status
      };
    });
    
    return res.json(quests);
  } catch (error) {
    console.error('Error fetching user quests:', error);
    return res.status(500).json({ 
      message: "Failed to fetch user quests", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * Admin Routes
 */

/**
 * POST /api/admin/quests
 * Create a new quest (admin)
 */
router.post('/admin/quests', authenticate, requireAdmin, async (req, res) => {
  try {
    // Validate request body
    // Would validate with zod schema here
    const questData = req.body;
    
    const quest = await questRepository.create(questData);
    return res.status(201).json(quest);
  } catch (error) {
    console.error('Error creating quest:', error);
    return res.status(500).json({ 
      message: "Failed to create quest", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * PUT /api/admin/quests/:id
 * Update a quest (admin)
 */
router.put('/admin/quests/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const questId = parseInt(req.params.id);
    // Validate request body
    // Would validate with zod schema here
    const questData = req.body;
    
    const updatedQuest = await questRepository.update(questId, questData);
    
    if (!updatedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    return res.json(updatedQuest);
  } catch (error) {
    console.error('Error updating quest:', error);
    return res.status(500).json({ 
      message: "Failed to update quest", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * DELETE /api/admin/quests/:id
 * Delete a quest (admin)
 */
router.delete('/admin/quests/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const questId = parseInt(req.params.id);
    
    const deletedQuest = await questRepository.delete(questId);
    
    if (!deletedQuest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    return res.status(500).json({ 
      message: "Failed to delete quest", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;