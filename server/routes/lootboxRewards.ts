import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { lootBoxConfigs } from '@shared/schema';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Schema for get rewards filter
const getRewardsFilterSchema = z.object({
  configId: z.string().optional(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
}).optional();

// GET /api/lootbox-rewards - Get all lootbox reward configs
router.get('/', async (req, res) => {
  try {
    // Parse any query filters
    const filter = getRewardsFilterSchema.parse(req.query);
    
    // Start with a base query
    let query = db.select().from(lootBoxConfigs);
    
    // Apply filters if they exist
    if (filter) {
      if (filter.configId) {
        query = query.where(eq(lootBoxConfigs.id, filter.configId));
      }
      if (filter.rarity) {
        query = query.where(eq(lootBoxConfigs.rarity, filter.rarity));
      }
    }
    
    // Execute the query
    const configs = await query;
    
    // Return the configs
    res.json(configs);
  } catch (error) {
    console.error('Error fetching lootbox reward configs:', error);
    res.status(500).json({ message: 'Failed to fetch lootbox reward configurations' });
  }
});

// GET /api/lootbox-rewards/:id - Get a specific lootbox reward config
router.get('/:id', async (req, res) => {
  try {
    const configId = req.params.id;
    
    // Fetch the specific config
    const [config] = await db
      .select()
      .from(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, configId));
    
    if (!config) {
      return res.status(404).json({ message: 'Lootbox reward configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching specific lootbox reward config:', error);
    res.status(500).json({ message: 'Failed to fetch lootbox reward configuration' });
  }
});

// Schema for creating a lootbox reward config
const createLootboxRewardConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  iconImage: z.string().optional(),
  itemDropTable: z.array(z.object({
    itemId: z.string(),
    weight: z.number().min(1),
    minQuantity: z.number().min(1),
    maxQuantity: z.number().min(1)
  })),
  minRewards: z.number().min(1).default(1),
  maxRewards: z.number().min(1).default(3)
});

// POST /api/lootbox-rewards - Create a new lootbox reward config (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const configData = createLootboxRewardConfigSchema.parse(req.body);
    
    // Check if ID already exists
    const existing = await db
      .select()
      .from(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, configData.id));
    
    if (existing.length) {
      return res.status(400).json({ message: 'A lootbox reward configuration with this ID already exists' });
    }
    
    // Create the new config
    const [newConfig] = await db
      .insert(lootBoxConfigs)
      .values({
        id: configData.id,
        name: configData.name,
        description: configData.description,
        rarity: configData.rarity,
        iconImage: configData.iconImage || null,
        itemDropTable: configData.itemDropTable,
        minRewards: configData.minRewards,
        maxRewards: configData.maxRewards
      })
      .returning();
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error creating lootbox reward config:', error);
    res.status(500).json({ message: 'Failed to create lootbox reward configuration' });
  }
});

// PATCH /api/lootbox-rewards/:id - Update a lootbox reward config (admin only)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const configId = req.params.id;
    
    // Check if the config exists
    const [existingConfig] = await db
      .select()
      .from(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, configId));
    
    if (!existingConfig) {
      return res.status(404).json({ message: 'Lootbox reward configuration not found' });
    }
    
    // Create a partial validation schema for updates
    const updateSchema = createLootboxRewardConfigSchema.partial().omit({ id: true });
    const updateData = updateSchema.parse(req.body);
    
    // Update the config
    const [updatedConfig] = await db
      .update(lootBoxConfigs)
      .set(updateData)
      .where(eq(lootBoxConfigs.id, configId))
      .returning();
    
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating lootbox reward config:', error);
    res.status(500).json({ message: 'Failed to update lootbox reward configuration' });
  }
});

// DELETE /api/lootbox-rewards/:id - Delete a lootbox reward config (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const configId = req.params.id;
    
    // Check if the config exists
    const [existingConfig] = await db
      .select()
      .from(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, configId));
    
    if (!existingConfig) {
      return res.status(404).json({ message: 'Lootbox reward configuration not found' });
    }
    
    // Delete the config
    await db
      .delete(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, configId));
    
    res.json({ message: 'Lootbox reward configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting lootbox reward config:', error);
    res.status(500).json({ message: 'Failed to delete lootbox reward configuration' });
  }
});

// Export the router
export default router;