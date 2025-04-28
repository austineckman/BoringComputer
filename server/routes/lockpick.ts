import { Router } from 'express';
import { authenticate } from '../auth';
import { storage } from '../storage';
import { openLootBox, LootBoxType } from '../lootBoxSystem';
import { db } from '../db';
import { lootBoxes as lootBoxesTable } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get user's lootboxes
router.get('/user', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Get user's lootboxes from storage
    const lootBoxes = await storage.getLootBoxes(user.id);
    
    // Get lootbox configs to add additional metadata
    const lootBoxConfigs = await storage.getLootBoxConfigs();
    const configMap = new Map(lootBoxConfigs.map(config => [config.id, config]));
    
    // Enhance lootbox data with config details
    const enhancedLootBoxes = lootBoxes.map(box => {
      const config = configMap.get(box.type);
      return {
        ...box,
        image: config?.image || '/placeholder-lootbox.png',
        description: config?.description || `A ${box.type} lootbox`,
        name: config?.name || `${box.type.charAt(0).toUpperCase() + box.type.slice(1)} Lootbox`,
        rarity: box.type
      };
    });
    
    return res.json(enhancedLootBoxes);
  } catch (error) {
    console.error('Error fetching user lootboxes:', error);
    return res.status(500).json({ error: 'Failed to fetch lootboxes' });
  }
});

// Open a lootbox
router.post('/:id/open', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const lootBoxId = parseInt(req.params.id);
    if (isNaN(lootBoxId)) {
      return res.status(400).json({ error: 'Invalid lootbox ID' });
    }
    
    // Open the lootbox
    const result = await openLootBox(lootBoxId, user.id);
    
    return res.json(result);
  } catch (error) {
    console.error('Error opening lootbox:', error);
    return res.status(500).json({ error: 'Failed to open lootbox', message: (error as Error).message });
  }
});

// Test endpoint to generate lootboxes for development
// Delete all user lootboxes - for testing purposes only
router.post('/clear-all', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Get all user's lootboxes
    const lootBoxes = await storage.getLootBoxes(user.id);
    if (lootBoxes.length === 0) {
      return res.json({
        success: true,
        message: "No lootboxes to clear",
        count: 0
      });
    }
    
    // Delete lootboxes directly from the database
    const deletedCount = await db.delete(lootBoxesTable)
      .where(eq(lootBoxesTable.userId, user.id))
      .returning()
      .then(result => result.length);
    
    return res.json({
      success: true,
      message: `Deleted ${deletedCount} lootboxes`,
      count: deletedCount
    });
  } catch (error) {
    console.error('Error clearing lootboxes:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear lootboxes",
      error: (error as Error).message
    });
  }
});

router.post('/generate-test', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Get the types and quantities from the request, or use defaults
    const { types = ["common", "uncommon", "rare", "epic", "legendary"] } = req.body;
    const count = req.body.count || 1;
    
    const createdLootBoxes = [];
    
    // Create the specified number of each type of lootbox
    for (const type of types) {
      for (let i = 0; i < count; i++) {
        const lootBox = await storage.createLootBox({
          userId: user.id,
          type: type as LootBoxType,
          opened: false,
          rewards: [],
          source: 'test',
          sourceId: null
        });
        
        createdLootBoxes.push(lootBox);
      }
    }
    
    return res.json({ 
      success: true, 
      message: `Created ${createdLootBoxes.length} lootboxes`, 
      lootBoxes: createdLootBoxes 
    });
  } catch (error) {
    console.error('Error generating test lootboxes:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to generate test lootboxes", 
      error: (error as Error).message 
    });
  }
});

export default router;