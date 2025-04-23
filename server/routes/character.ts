import { Router } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { characterEquipment, items, insertCharacterEquipmentSchema } from '@shared/schema';
import { z } from 'zod';
import * as zodSchema from '@shared/schema';

const router = Router();

// Get equipment for the current user
router.get('/equipment', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    
    // Get all character equipment for this user
    const userEquipment = await db.select()
      .from(characterEquipment)
      .where(eq(characterEquipment.userId, userId));
    
    // Fetch item details for each equipped item
    const equippedItems: Record<string, any> = {};
    for (const equipment of userEquipment) {
      const [itemDetails] = await db.select()
        .from(items)
        .where(eq(items.id, equipment.itemId));
      
      if (itemDetails) {
        equippedItems[equipment.slot] = {
          id: itemDetails.id,
          name: itemDetails.name,
          description: itemDetails.description,
          flavorText: itemDetails.flavorText,
          rarity: itemDetails.rarity,
          imagePath: itemDetails.imagePath,
          equippedAt: equipment.equippedAt
        };
      }
    }

    return res.json(equippedItems);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Equip an item to a specific slot
router.post('/equip', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    
    const equipSchema = z.object({
      itemId: z.string().min(1),
      slot: z.enum(['head', 'torso', 'legs', 'accessory', 'hands'])
    });
    
    const result = equipSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: result.error.format() });
    }
    
    const { itemId, slot } = result.data;
    
    // Validate that the item exists
    const [itemExists] = await db.select().from(items).where(eq(items.id, itemId));
    if (!itemExists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Verify that the user has the item in their inventory
    // For now, we're assuming the item exists in the user's inventory

    // Check if the user already has an item equipped in this slot
    const [existingEquipment] = await db.select()
      .from(characterEquipment)
      .where(
        and(
          eq(characterEquipment.userId, userId),
          eq(characterEquipment.slot, slot)
        )
      );
    
    // If there's an item already equipped, update it
    if (existingEquipment) {
      await db.update(characterEquipment)
        .set({ 
          itemId,
          equippedAt: new Date()
        })
        .where(eq(characterEquipment.id, existingEquipment.id));
    } else {
      // Otherwise, insert a new equipment record
      await db.insert(characterEquipment).values({
        userId,
        itemId,
        slot
      });
    }
    
    const [updatedItem] = await db.select()
      .from(items)
      .where(eq(items.id, itemId));
    
    return res.status(200).json({
      message: 'Item equipped successfully',
      equipment: {
        slot,
        item: updatedItem
      }
    });
  } catch (error) {
    console.error('Error equipping item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Unequip an item from a specific slot
router.post('/unequip', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = req.user.id;
    
    const unequipSchema = z.object({
      slot: z.enum(['head', 'torso', 'legs', 'accessory', 'hands'])
    });
    
    const result = unequipSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: 'Invalid request data', errors: result.error.format() });
    }
    
    const { slot } = result.data;
    
    // Find the equipment to remove
    const [existingEquipment] = await db.select()
      .from(characterEquipment)
      .where(
        and(
          eq(characterEquipment.userId, userId),
          eq(characterEquipment.slot, slot)
        )
      );
    
    if (!existingEquipment) {
      return res.status(404).json({ message: 'No item equipped in this slot' });
    }
    
    // Remove the equipment
    await db.delete(characterEquipment)
      .where(eq(characterEquipment.id, existingEquipment.id));
    
    return res.status(200).json({
      message: 'Item unequipped successfully',
      slot
    });
  } catch (error) {
    console.error('Error unequipping item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;