import { Router } from 'express';
import { storage } from '../storage';
import { authenticate } from '../auth';
import { db } from '../db';
import { LootBoxType } from '../lootBoxSystem';
import { eq } from 'drizzle-orm';
import { lootBoxConfigs as lootBoxConfigsTable } from '@shared/schema';
import { getAllLootBoxConfigs } from '../lootBoxConfig';

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
        image: config?.image || '/images/lootboxes/common_lootbox.png',
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

// Get a single lootbox by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const lootBoxId = parseInt(req.params.id);
    if (isNaN(lootBoxId)) {
      return res.status(400).json({ error: 'Invalid lootbox ID' });
    }
    
    // Get the lootbox
    const lootBox = await storage.getLootBox(lootBoxId);
    if (!lootBox) {
      return res.status(404).json({ error: 'Lootbox not found' });
    }
    
    // Verify that the lootbox belongs to the user
    if (lootBox.userId !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this lootbox' });
    }
    
    // Get the lootbox config
    const config = await storage.getLootBoxConfig(lootBox.type);
    
    // Enhance lootbox with config details
    const enhancedLootBox = {
      ...lootBox,
      image: config?.image || '/images/lootboxes/common_lootbox.png',
      description: config?.description || `A ${lootBox.type} lootbox`,
      name: config?.name || `${lootBox.type.charAt(0).toUpperCase() + lootBox.type.slice(1)} Lootbox`,
      rarity: lootBox.type
    };
    
    return res.json(enhancedLootBox);
  } catch (error) {
    console.error('Error fetching lootbox:', error);
    return res.status(500).json({ error: 'Failed to fetch lootbox' });
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
    
    // Get the lootbox
    const lootBox = await storage.getLootBox(lootBoxId);
    if (!lootBox) {
      return res.status(404).json({ error: 'Lootbox not found' });
    }
    
    // Verify that the lootbox belongs to the user
    if (lootBox.userId !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to open this lootbox' });
    }
    
    // Check if the lootbox is already opened
    if (lootBox.opened) {
      return res.status(400).json({ error: 'This lootbox has already been opened' });
    }
    
    // Open the lootbox and get rewards
    const result = await storage.openLootBox(lootBoxId, user.id);
    
    return res.json(result);
  } catch (error) {
    console.error('Error opening lootbox:', error);
    return res.status(500).json({ error: 'Failed to open lootbox' });
  }
});

// Get lootbox configurations for the UI (using our static config)
router.get('/configs/all', async (req, res) => {
  try {
    // Use in-memory configurations
    const configs = getAllLootBoxConfigs();
    
    return res.json(configs);
  } catch (error) {
    console.error('Error fetching lootbox configurations:', error);
    return res.status(500).json({ error: 'Failed to fetch lootbox configurations' });
  }
});

// Get a specific lootbox configuration (using our static config)
router.get('/configs/:id', async (req, res) => {
  try {
    const configId = req.params.id as LootBoxType;
    
    // Use in-memory configurations
    const configs = getAllLootBoxConfigs();
    const config = configs.find(c => c.id === configId);
    
    if (!config) {
      return res.status(404).json({ error: 'Lootbox configuration not found' });
    }
    
    return res.json(config);
  } catch (error) {
    console.error('Error fetching lootbox configuration:', error);
    return res.status(500).json({ error: 'Failed to fetch lootbox configuration' });
  }
});

export default router;