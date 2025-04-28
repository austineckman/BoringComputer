import { Router } from "express";
import { db } from "../db";
import { lootBoxes, insertLootBoxSchema, items, lootBoxConfigs } from "@shared/schema";
import { authenticate } from "../auth";
import { eq, and, desc } from "drizzle-orm";
import { generateLootBoxRewards, LootBoxType } from "../lootBoxSystem";
import { itemDatabase } from "../itemDatabase";

const router = Router();

// Get all lootboxes for the authenticated user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const userLootboxes = await db.select().from(lootBoxes)
      .where(eq(lootBoxes.userId, userId))
      .orderBy(desc(lootBoxes.acquiredAt));
    
    res.json(userLootboxes);
  } catch (error) {
    console.error("Error getting lootboxes:", error);
    res.status(500).json({ error: "Failed to get lootboxes" });
  }
});

// Get a specific lootbox by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const lootboxId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    const [lootbox] = await db.select().from(lootBoxes)
      .where(and(
        eq(lootBoxes.id, lootboxId),
        eq(lootBoxes.userId, userId)
      ));
    
    if (!lootbox) {
      return res.status(404).json({ error: "Lootbox not found" });
    }
    
    res.json(lootbox);
  } catch (error) {
    console.error("Error getting lootbox:", error);
    res.status(500).json({ error: "Failed to get lootbox" });
  }
});

// Create a lootbox (admin only or system endpoint)
router.post("/", authenticate, async (req, res) => {
  try {
    // In a production app, you would check for admin role here
    const validatedData = insertLootBoxSchema.parse(req.body);
    
    const [lootbox] = await db.insert(lootBoxes)
      .values(validatedData)
      .returning();
    
    res.status(201).json(lootbox);
  } catch (error) {
    console.error("Error creating lootbox:", error);
    res.status(500).json({ error: "Failed to create lootbox" });
  }
});

// Open a lootbox
router.post("/:id/open", authenticate, async (req, res) => {
  try {
    const lootboxId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    // Get the lootbox
    const [lootbox] = await db.select().from(lootBoxes)
      .where(and(
        eq(lootBoxes.id, lootboxId),
        eq(lootBoxes.userId, userId)
      ));
    
    if (!lootbox) {
      return res.status(404).json({ error: "Lootbox not found" });
    }
    
    // Check if already opened
    if (lootbox.opened) {
      return res.status(400).json({ error: "Lootbox already opened" });
    }
    
    // Generate rewards if not already generated
    let rewards = lootbox.rewards;
    if (!rewards || rewards.length === 0) {
      // Get associated lootbox config
      const [config] = await db.select().from(lootBoxConfigs)
        .where(eq(lootBoxConfigs.id, lootbox.type));
      
      if (config) {
        // Use configured drop table from lootbox config
        const generatedRewards = [];
        for (const item of config.itemDropTable) {
          // Random quantity between min and max
          const quantity = Math.floor(Math.random() * (item.maxQuantity - item.minQuantity + 1)) + item.minQuantity;
          
          // Only add if quantity > 0
          if (quantity > 0) {
            generatedRewards.push({
              id: item.itemId,
              type: "item",
              quantity
            });
          }
        }
        rewards = generatedRewards;
      } else {
        // Fallback to the generic system if no config found
        rewards = generateLootBoxRewards(lootbox.type as LootBoxType)
          .map(r => ({ id: r.type, type: "item", quantity: r.quantity }));
      }
    }
    
    // Get item details for each reward
    const rewardsWithDetails = rewards.map(reward => {
      const itemInfo = itemDatabase[reward.id] || { 
        name: reward.id,
        description: "Mystery item", 
        rarity: "common",
        imagePath: "/images/unknown.png"
      };
      
      return {
        ...reward,
        name: itemInfo.name,
        description: itemInfo.description,
        rarity: itemInfo.rarity,
        imagePath: itemInfo.imagePath
      };
    });
    
    // Update user's inventory (you'll need to implement this)
    // This is a simplified version - in practice, you'd need a transaction
    // to ensure inventory updates are atomic
    for (const reward of rewards) {
      if (reward.type === "item") {
        // Update inventory (example, implement based on your system)
        const currentInventory = req.user!.inventory || {};
        const currentAmount = currentInventory[reward.id] || 0;
        
        // Update inventory with new amount
        currentInventory[reward.id] = currentAmount + reward.quantity;
        
        // Update user record with new inventory
        await db.update(req.user!.constructor as any)
          .set({ inventory: currentInventory })
          .where(eq((req.user! as any).id, userId));
      }
    }
    
    // Mark the lootbox as opened
    const [updatedLootbox] = await db.update(lootBoxes)
      .set({ 
        opened: true, 
        openedAt: new Date(),
        rewards: rewards
      })
      .where(eq(lootBoxes.id, lootboxId))
      .returning();
    
    // Return the opened lootbox with detailed rewards
    res.json({
      lootbox: updatedLootbox,
      rewards: rewardsWithDetails
    });
  } catch (error) {
    console.error("Error opening lootbox:", error);
    res.status(500).json({ error: "Failed to open lootbox" });
  }
});

export default router;