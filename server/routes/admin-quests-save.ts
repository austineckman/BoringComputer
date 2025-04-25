import express, { Request, Response } from "express";
import { AdminAuthorize } from "@server/middleware/adminAuth";
import { db } from "@server/db";
import { quests, questComponents } from "@shared/schema";
import { nanoid } from "nanoid";

const router = express.Router();

// Middleware to ensure user is an admin
router.use(AdminAuthorize);

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
    const [newQuest] = await db.insert(quests).values({
      title,
      description,
      imagePath: imageUrl || null,
      xpReward: xpReward || 100,
      adventureLine: adventureLine || null,
      kitId,
      status: "active",
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      lootTable: lootSuggestion ? JSON.stringify({
        type: "quest",
        rewards: [
          {
            itemId: "quest-loot-crate",
            quantity: 1,
            note: `Contains: ${lootSuggestion}`
          }
        ]
      }) : null,
      questId: `quest-${nanoid(8)}`,
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