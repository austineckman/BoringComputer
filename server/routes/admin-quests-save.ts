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
  missionBrief?: string;
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
      missionBrief,
      imageUrl, 
      components,
      xpReward,
      lootSuggestion,
      kitId,
      adventureLine
    } = req.body as SaveQuestRequest;

    console.log("Extracted fields:", {
      title, description, missionBrief, imageUrl, components, xpReward, lootSuggestion, kitId, adventureLine
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
      missionBrief, // mission_brief 
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
      // First get all kit components to find best matches
      const kitComponentsResult = await pool.query(`
        SELECT id, name, description FROM kit_components 
        WHERE kit_id = $1
      `, [kitId]);
      
      const kitComponents = kitComponentsResult.rows;
      console.log(`Found ${kitComponents.length} components in kit ${kitId}`);
      
      // For each AI-generated component name, find the best matching component in the kit
      const componentMatches = [];
      
      for (const aiComponent of components) {
        // First try exact match
        let match = kitComponents.find(comp => 
          comp.name.toLowerCase() === aiComponent.toLowerCase());
        
        // If no exact match, try to find a component containing the AI component name
        if (!match) {
          match = kitComponents.find(comp => 
            comp.name.toLowerCase().includes(aiComponent.toLowerCase()) || 
            (comp.description && comp.description.toLowerCase().includes(aiComponent.toLowerCase())));
        }
        
        // If still no match, try the reverse - AI component name containing a kit component name
        if (!match) {
          match = kitComponents.find(comp => 
            aiComponent.toLowerCase().includes(comp.name.toLowerCase()));
        }
        
        if (match) {
          componentMatches.push(match);
        }
      }
      
      console.log(`Matched ${componentMatches.length} out of ${components.length} components`);
      
      // If we don't have any matches but the kit has components, add the first 3 components from the kit
      if (componentMatches.length === 0 && kitComponents.length > 0) {
        componentMatches.push(...kitComponents.slice(0, Math.min(3, kitComponents.length)));
        console.log(`Using ${componentMatches.length} default components from the kit`);
      }
      
      // Link components to the quest using direct SQL
      if (componentMatches.length > 0) {
        // For each component, insert the relation
        for (const comp of componentMatches) {
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
        console.log(`Added ${componentMatches.length} components to quest`);
      }
    }

    res.status(201).json(newQuest);
  } catch (error) {
    console.error("Error saving quest:", error);
    res.status(500).json({ error: "Failed to save quest" });
  }
});

export default router;