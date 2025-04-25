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
    console.log("Request body:", JSON.stringify(req.body));
    
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

    console.log("Extracted fields:", {
      title, description, imageUrl, components, xpReward, lootSuggestion, kitId, adventureLine
    });

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
    
    console.log("Preparing quest with rewards:", questRewards);
    
    // Instead of using Drizzle ORM which is having validation issues,
    // let's use a direct SQL query that we know works from our test
    const rewardsJSON = JSON.stringify(
      questRewards.length > 0 ? 
        questRewards.map(reward => ({
          type: "item",
          id: reward.id,
          quantity: reward.quantity
        })) : 
        []
    );
    
    const contentJSON = JSON.stringify({
      videos: [],
      images: imageUrl ? [imageUrl] : [],
      codeBlocks: []
    });
    
    const lootBoxRewardsJSON = JSON.stringify([]);
    
    // Use the pool directly for a raw query
    const { pool } = await import('../db');
    const result = await pool.query(`
      INSERT INTO quests (
        title, 
        description, 
        adventure_line, 
        difficulty, 
        order_in_line, 
        xp_reward, 
        date, 
        kit_id, 
        mission_brief, 
        active, 
        loot_box_rewards, 
        rewards, 
        content
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING *
    `, [
      title, 
      description, 
      adventureLine || 'Default Adventure',
      1, // difficulty 
      0, // order_in_line
      xpReward || 100, 
      new Date().toISOString().split('T')[0], // date
      kitId,
      null, // mission_brief 
      true, // active
      lootBoxRewardsJSON,
      rewardsJSON,
      contentJSON
    ]);
    
    const newQuest = result.rows[0];

    if (!newQuest) {
      return res.status(500).json({ error: "Failed to create quest" });
    }

    // Now add the components for this quest using direct SQL
    if (components.length > 0) {
      // First get the components IDs with a direct query
      const componentsResult = await pool.query(`
        SELECT id, name FROM kit_components 
        WHERE kit_id = $1 AND name = ANY($2)
      `, [kitId, components]);
      
      console.log("Found components:", componentsResult.rows);
      
      // Link components to the quest using direct SQL
      if (componentsResult.rows.length > 0) {
        // For each component, insert the relation
        for (const comp of componentsResult.rows) {
          await pool.query(`
            INSERT INTO quest_components (
              quest_id, component_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4)
          `, [
            newQuest.id, 
            comp.id, 
            new Date(), 
            new Date()
          ]);
        }
        console.log(`Added ${componentsResult.rows.length} components to quest`);
      }
    }

    res.status(201).json(newQuest);
  } catch (error) {
    console.error("Error saving quest:", error);
    res.status(500).json({ error: "Failed to save quest" });
  }
});

export default router;