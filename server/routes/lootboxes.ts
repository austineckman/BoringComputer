import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { generateLootBoxRewards, openLootBox } from '../lootBoxSystem';
import { lootBoxes } from '@shared/schema';
import { z } from 'zod';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// GET /api/lootboxes - Get all lootboxes for authenticated user
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    // Fetch lootboxes from DB for this user
    const userLootboxes = await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.userId, user.id));
    
    return res.json(userLootboxes);
  } catch (error) {
    console.error('Error fetching lootboxes:', error);
    return res.status(500).json({ message: 'Failed to fetch lootboxes' });
  }
});

// GET /api/lootboxes/:id - Get a specific lootbox
router.get('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const lootboxId = parseInt(req.params.id);
    
    // Fetch specific lootbox
    const [lootbox] = await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.id, lootboxId))
      .where(eq(lootBoxes.userId, user.id));
    
    if (!lootbox) {
      return res.status(404).json({ message: 'Lootbox not found' });
    }
    
    return res.json(lootbox);
  } catch (error) {
    console.error('Error fetching lootbox:', error);
    return res.status(500).json({ message: 'Failed to fetch lootbox' });
  }
});

// POST /api/lootboxes/:id/open - Open a lootbox and get rewards
router.post('/:id/open', async (req, res) => {
  try {
    const user = (req as any).user;
    const lootboxId = parseInt(req.params.id);
    
    // Check if the lootbox exists and belongs to this user
    const [lootbox] = await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.id, lootboxId))
      .where(eq(lootBoxes.userId, user.id));
    
    if (!lootbox) {
      return res.status(404).json({ message: 'Lootbox not found' });
    }
    
    if (lootbox.opened) {
      return res.status(400).json({ message: 'This lootbox has already been opened' });
    }
    
    // Open the lootbox and get rewards
    const result = await openLootBox(lootboxId, user.id);
    
    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }
    
    // Return rewards to the client
    return res.json({ success: true, rewards: result.rewards });
  } catch (error) {
    console.error('Error opening lootbox:', error);
    return res.status(500).json({ message: 'Failed to open lootbox' });
  }
});

// Schema for creating a lootbox (admin only)
const createLootboxSchema = z.object({
  userId: z.number(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  image: z.string().optional(),
  source: z.string(),
  sourceId: z.string().optional().nullable()
});

// POST /api/lootboxes - Create a new lootbox (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const lootboxData = createLootboxSchema.parse(req.body);
    
    const [newLootbox] = await db
      .insert(lootBoxes)
      .values({
        userId: lootboxData.userId,
        type: lootboxData.type,
        opened: false,
        source: lootboxData.source,
        sourceId: lootboxData.sourceId || null,
        rewards: [],
        name: lootboxData.name,
        description: lootboxData.description,
        rarity: lootboxData.rarity,
        image: lootboxData.image || null
      })
      .returning();
    
    return res.status(201).json(newLootbox);
  } catch (error) {
    console.error('Error creating lootbox:', error);
    return res.status(500).json({ message: 'Failed to create lootbox' });
  }
});

// Schema for generating lootboxes for a user (admin only)
const generateLootboxSchema = z.object({
  userId: z.number(),
  type: z.string(),
  quantity: z.number().min(1).default(1),
  source: z.string().default('admin'),
  sourceId: z.string().optional().nullable()
});

// POST /api/lootboxes/generate - Generate lootboxes for a user (admin only)
router.post('/generate', adminAuth, async (req, res) => {
  try {
    const generateData = generateLootboxSchema.parse(req.body);
    const createdLootboxes = [];
    
    // Create the specified number of lootboxes
    for (let i = 0; i < generateData.quantity; i++) {
      const [newLootbox] = await db
        .insert(lootBoxes)
        .values({
          userId: generateData.userId,
          type: generateData.type,
          opened: false,
          source: generateData.source,
          sourceId: generateData.sourceId || null,
          rewards: []
        })
        .returning();
      
      createdLootboxes.push(newLootbox);
      
      // Add entry to inventory history
      await storage.createInventoryHistory({
        userId: generateData.userId,
        type: `lootbox-${generateData.type}`,
        quantity: 1,
        action: 'gained',
        source: generateData.source
      });
    }
    
    return res.status(201).json({ 
      message: `Created ${generateData.quantity} lootboxes for user ${generateData.userId}`,
      lootboxes: createdLootboxes 
    });
  } catch (error) {
    console.error('Error generating lootboxes:', error);
    return res.status(500).json({ message: 'Failed to generate lootboxes' });
  }
});

// DELETE /api/lootboxes/:id - Delete a lootbox (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const lootboxId = parseInt(req.params.id);
    
    // Check if the lootbox exists
    const [lootbox] = await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.id, lootboxId));
    
    if (!lootbox) {
      return res.status(404).json({ message: 'Lootbox not found' });
    }
    
    // Delete the lootbox
    await db
      .delete(lootBoxes)
      .where(eq(lootBoxes.id, lootboxId));
    
    return res.json({ message: 'Lootbox deleted successfully' });
  } catch (error) {
    console.error('Error deleting lootbox:', error);
    return res.status(500).json({ message: 'Failed to delete lootbox' });
  }
});

export default router;