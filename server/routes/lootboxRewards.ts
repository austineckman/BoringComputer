import { Router } from "express";
import { db } from "../db";
import { lootBoxes } from "@shared/schema";
import { authenticate } from "../auth";
import { eq } from "drizzle-orm";

// Create a router for lootbox rewards
const router = Router();

// Define the relation table separately
export const lootboxRewards = {
  id: "id",
  lootboxId: "lootbox_id",
  itemId: "item_id",
  quantity: "quantity"
};

// Get rewards for a specific lootbox
router.get("/:lootboxId", authenticate, async (req, res) => {
  try {
    const lootboxId = parseInt(req.params.lootboxId);
    const userId = req.user!.id;
    
    // Find lootbox
    const [lootbox] = await db.select().from(lootBoxes).where(
      eq(lootBoxes.id, lootboxId)
    );
    
    if (!lootbox) {
      return res.status(404).json({ error: "Lootbox not found" });
    }
    
    // Verify ownership
    if (lootbox.userId !== userId) {
      return res.status(403).json({ error: "You don't own this lootbox" });
    }
    
    // Return rewards from the lootbox itself
    res.json(lootbox.rewards || []);
  } catch (error) {
    console.error("Error getting lootbox rewards:", error);
    res.status(500).json({ error: "Failed to get lootbox rewards" });
  }
});

export default router;