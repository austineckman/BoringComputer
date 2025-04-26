import { Request, Response, Router } from "express";
import { authenticate, requireAdmin } from "../auth";
import { db } from "../db";
import { itemDatabase } from "../itemDatabase";

// Sample lootboxes (replace with database implementation later)
let lootBoxes = [
  {
    id: "common-crate",
    name: "Common Crate",
    description: "A simple wooden crate that might contain basic crafting materials.",
    rarity: "common",
    minRewards: 1,
    maxRewards: 3,
    image: "/images/loot-crate.png",
    itemDropTable: [
      { itemId: "copper", weight: 50, minQuantity: 1, maxQuantity: 3 },
      { itemId: "cloth", weight: 40, minQuantity: 1, maxQuantity: 2 },
      { itemId: "techscrap", weight: 10, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: "uncommon-crate",
    name: "Uncommon Crate",
    description: "A reinforced crate with more valuable materials.",
    rarity: "uncommon",
    minRewards: 2,
    maxRewards: 4,
    image: "/images/loot-crate.png",
    itemDropTable: [
      { itemId: "copper", weight: 30, minQuantity: 2, maxQuantity: 4 },
      { itemId: "cloth", weight: 30, minQuantity: 2, maxQuantity: 3 },
      { itemId: "techscrap", weight: 30, minQuantity: 1, maxQuantity: 2 },
      { itemId: "crystal", weight: 10, minQuantity: 1, maxQuantity: 1 }
    ]
  },
  {
    id: "rare-crate",
    name: "Rare Treasure Box",
    description: "A locked box containing rare crafting materials and components.",
    rarity: "rare",
    minRewards: 3,
    maxRewards: 5,
    image: "/images/goldcrate.png",
    itemDropTable: [
      { itemId: "copper", weight: 20, minQuantity: 3, maxQuantity: 5 },
      { itemId: "techscrap", weight: 40, minQuantity: 2, maxQuantity: 4 },
      { itemId: "crystal", weight: 30, minQuantity: 1, maxQuantity: 2 },
      { itemId: "ink", weight: 10, minQuantity: 1, maxQuantity: 1 }
    ]
  }
];

const lootBoxRoutes = Router();

// Get all lootboxes (admin only)
lootBoxRoutes.get("/", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    // In development mode, just return the sample data
    res.json(lootBoxes);
    
    // In production, this would fetch from database
    // const lootBoxesFromDb = await db.select().from(lootBoxTable);
    // res.json(lootBoxesFromDb);
  } catch (error) {
    console.error("Error fetching lootboxes:", error);
    res.status(500).json({ error: "Failed to fetch lootboxes" });
  }
});

// Get a specific lootbox by ID (admin only)
lootBoxRoutes.get("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const lootBoxId = req.params.id;
    
    // Find the lootbox in our sample data
    const lootBox = lootBoxes.find(box => box.id === lootBoxId);
    
    if (!lootBox) {
      return res.status(404).json({ error: "Loot box not found" });
    }
    
    res.json(lootBox);
  } catch (error) {
    console.error("Error fetching lootbox:", error);
    res.status(500).json({ error: "Failed to fetch lootbox" });
  }
});

// Create a new lootbox (admin only)
lootBoxRoutes.post("/", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const newLootBox = req.body;
    
    // Validate the lootbox data
    if (!newLootBox.id || !newLootBox.name || !newLootBox.description || !newLootBox.rarity) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if a lootbox with this ID already exists
    const existingLootBox = lootBoxes.find(box => box.id === newLootBox.id);
    if (existingLootBox) {
      return res.status(400).json({ error: "A lootbox with this ID already exists" });
    }
    
    // In development mode, add to sample data
    lootBoxes.push(newLootBox);
    
    // In production, this would add to database
    // const [insertedLootBox] = await db.insert(lootBoxTable).values(newLootBox).returning();
    
    res.status(201).json(newLootBox);
  } catch (error) {
    console.error("Error creating lootbox:", error);
    res.status(500).json({ error: "Failed to create lootbox" });
  }
});

// Update an existing lootbox (admin only)
lootBoxRoutes.put("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const lootBoxId = req.params.id;
    const updatedLootBox = req.body;
    
    // Validate the lootbox data
    if (!updatedLootBox.name || !updatedLootBox.description || !updatedLootBox.rarity) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Find the lootbox in our sample data
    const lootBoxIndex = lootBoxes.findIndex(box => box.id === lootBoxId);
    
    if (lootBoxIndex === -1) {
      return res.status(404).json({ error: "Loot box not found" });
    }
    
    // In development mode, update sample data
    lootBoxes[lootBoxIndex] = { ...updatedLootBox, id: lootBoxId };
    
    // In production, this would update the database
    // const [updatedLootBoxFromDb] = await db.update(lootBoxTable)
    //   .set(updatedLootBox)
    //   .where(eq(lootBoxTable.id, lootBoxId))
    //   .returning();
    
    res.json(lootBoxes[lootBoxIndex]);
  } catch (error) {
    console.error("Error updating lootbox:", error);
    res.status(500).json({ error: "Failed to update lootbox" });
  }
});

// Delete a lootbox (admin only)
lootBoxRoutes.delete("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const lootBoxId = req.params.id;
    
    // Find the lootbox in our sample data
    const lootBoxIndex = lootBoxes.findIndex(box => box.id === lootBoxId);
    
    if (lootBoxIndex === -1) {
      return res.status(404).json({ error: "Loot box not found" });
    }
    
    // In development mode, remove from sample data
    lootBoxes.splice(lootBoxIndex, 1);
    
    // In production, this would delete from the database
    // await db.delete(lootBoxTable).where(eq(lootBoxTable.id, lootBoxId));
    
    res.status(200).json({ message: "Loot box deleted successfully" });
  } catch (error) {
    console.error("Error deleting lootbox:", error);
    res.status(500).json({ error: "Failed to delete lootbox" });
  }
});

export default lootBoxRoutes;