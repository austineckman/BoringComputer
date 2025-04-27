import { Router } from 'express';
import { authenticate } from '../auth';
import { storage } from '../storage';
import { openLootBox } from '../lootBoxSystem';

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

export default router;