import { Router } from "express";
import { db } from "../db";
import { lootBoxes, lootboxRewards } from "@shared/schema";
import { authenticate } from "../auth";
import { eq, and } from "drizzle-orm";
import { generateLootBoxRewards, openLootBox } from "../lootBoxSystem";
import { itemDatabase } from "../itemDatabase";
import path from "path";
import fs from "fs";

// Setup lootboxes router
const router = Router();

// Get all lootboxes for the current user
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const userLootboxes = await db.query.lootBoxes.findMany({
      where: eq(lootBoxes.userId, userId),
      with: {
        rewards: true
      }
    });
    
    // Enhance lootboxes with image paths
    const enhancedLootboxes = userLootboxes.map(lootbox => {
      // Get lootbox image based on type or rarity
      const imagePath = `/images/lootboxes/${lootbox.type}_lootbox.png`;
      
      return {
        ...lootbox,
        image: lootbox.image || imagePath,
        rewards: lootbox.rewards || []
      };
    });
    
    res.json(enhancedLootboxes);
  } catch (error) {
    console.error("Error fetching lootboxes:", error);
    res.status(500).json({ 
      error: "Failed to fetch lootboxes",
      details: error.message 
    });
  }
});

// Open a lootbox
router.post("/:id/open", authenticate, async (req, res) => {
  try {
    const lootboxId = parseInt(req.params.id);
    const userId = req.user!.id;
    
    if (isNaN(lootboxId)) {
      return res.status(400).json({ error: "Invalid lootbox ID" });
    }
    
    // Open the lootbox and get rewards
    const result = await openLootBox(lootboxId, userId);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: result.message || "Failed to open lootbox" 
      });
    }
    
    // Enhance the rewards with item details
    const enhancedRewards = result.rewards?.map(reward => {
      const itemDetails = itemDatabase[reward.id] || null;
      
      return {
        ...reward,
        name: itemDetails?.name || "Unknown Item",
        description: itemDetails?.description || "",
        rarity: itemDetails?.rarity || "common",
        imagePath: itemDetails?.imagePath || ""
      };
    });
    
    res.json({ 
      success: true, 
      message: "Lootbox opened successfully!",
      rewards: enhancedRewards || []
    });
  } catch (error) {
    console.error("Error opening lootbox:", error);
    res.status(500).json({ 
      error: "Failed to open lootbox",
      details: error.message 
    });
  }
});

// Admin endpoint to create a new lootbox (only accessible by admins)
router.post("/create", authenticate, async (req, res) => {
  try {
    if (!req.user?.roles?.includes("admin")) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    
    const { userId, type, source, sourceId } = req.body;
    
    if (!userId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Insert a new lootbox
    const [newLootbox] = await db.insert(lootBoxes).values({
      userId,
      type,
      source: source || "admin",
      sourceId: sourceId || null,
      opened: false,
      acquiredAt: new Date(),
      openedAt: null,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Lootbox`,
      description: `A ${type} lootbox with mysterious items inside`,
      rarity: type
    }).returning();
    
    res.status(201).json(newLootbox);
  } catch (error) {
    console.error("Error creating lootbox:", error);
    res.status(500).json({ 
      error: "Failed to create lootbox",
      details: error.message 
    });
  }
});

// Admin endpoint to get all lootboxes from all users (only accessible by admins)
router.get("/all", authenticate, async (req, res) => {
  try {
    if (!req.user?.roles?.includes("admin")) {
      return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    
    const allLootboxes = await db.query.lootBoxes.findMany({
      with: {
        rewards: true
      }
    });
    
    res.json(allLootboxes);
  } catch (error) {
    console.error("Error fetching all lootboxes:", error);
    res.status(500).json({ 
      error: "Failed to fetch all lootboxes",
      details: error.message 
    });
  }
});

export default router;