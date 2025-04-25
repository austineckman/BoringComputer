import express, { Request, Response } from "express";
import { adminAuth } from "../middleware/adminAuth";
import { db } from "../db";
import { quests, questComponents } from "@shared/schema";
import { nanoid } from "nanoid";

const router = express.Router();

// Middleware to ensure user is an admin
router.use(adminAuth);

interface SaveQuestRequest {
  title: string;
  description: string;
  imageUrl?: string;
  components: string[];
  xpReward: number;
  lootSuggestion: string;
  kitId: string;
  adventureLine?: string;
}

// Endpoint to save a generated quest
router.post("/api/admin/quests", async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      imageUrl, 
      components,
      xpReward,
      lootSuggestion,
      kitId,
      adventureLine
    } = req.body as SaveQuestRequest;

    // Simple validation
    if (!title || !description || !kitId || !components || !Array.isArray(components)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new quest
    // Parse the loot suggestion to create actual rewards from our item database
    // Import the items we know we have available
    const { getAllItems } = await import('../itemDatabase');
    const availableItems = getAllItems();
    
    // Convert the text suggestion to valid rewards
    let questRewards = [];
    
    // Get actual items from the database
    const { db } = await import('../db');
    const validItems = await db.query.items.findMany();
    const validItemIds = validItems.map(item => item.id);
    
    // Try to extract potential item matches from the suggestion
    if (lootSuggestion) {
      let foundMatchingItems = false;
      
      for (const item of availableItems) {
        // Only use items that exist in the database
        if (!validItemIds.includes(item.id)) {
          continue;
        }
        
        const itemNameLower = item.name.toLowerCase();
        if (lootSuggestion.toLowerCase().includes(itemNameLower)) {
          // Extract quantity if specified (e.g., "Copper x3")
          const quantityMatch = lootSuggestion.match(
            new RegExp(`${itemNameLower}\\s*(?:x|×)\\s*(\\d+)`, 'i')
          );
          const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
          
          questRewards.push({
            type: "item",
            id: item.id,
            quantity: quantity
          });
          
          foundMatchingItems = true;
        }
      }
      
      // If no matching items were found, add a default item from the valid items
      if (!foundMatchingItems && validItemIds.length > 0) {
        // Use the first item in the database as a fallback
        questRewards.push({
          type: "item",
          id: validItemIds[0],
          quantity: 1
        });
      }
    }
    
    // Create a quest that exactly matches the database schema
    const [newQuest] = await db.insert(quests).values({
      title: title,
      description: description,
      adventure_line: adventureLine || 'Default Adventure',
      difficulty: difficulty || 1,
      order_in_line: 0,
      xp_reward: xpReward || 100,
      date: new Date().toISOString().split('T')[0],
      kit_id: kitId,
      mission_brief: null,
      active: true,
      loot_box_rewards: [],
      // Format the rewards exactly as they are in existing quests
      rewards: questRewards.length > 0 ? questRewards.map(reward => ({
        type: "item",
        id: reward.id,
        quantity: reward.quantity
      })) : [],
      // Format content exactly as expected
      content: {
        videos: [],
        images: imageUrl ? [imageUrl] : [],
        codeBlocks: []
      }
    }).returning();

    if (!newQuest) {
      return res.status(500).json({ error: "Failed to create quest" });
    }

    // Now add the components for this quest
    if (components.length > 0) {
      // Get components data
      const kitComponents = await db.query.kitComponents.findMany({
        where: (comp, { eq, and, inArray }) => and(
          eq(comp.kitId, kitId),
          inArray(comp.name, components)
        )
      });

      // Link components to the quest
      if (kitComponents.length > 0) {
        const componentInserts = kitComponents.map(comp => ({
          questId: newQuest.id,
          componentId: comp.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await db.insert(questComponents).values(componentInserts);
      }
    }

    res.status(201).json(newQuest);
  } catch (error) {
    console.error("Error saving quest:", error);
    res.status(500).json({ error: "Failed to save quest" });
  }
});

export default router;