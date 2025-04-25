import express, { Request, Response } from "express";
import { db } from "../db";
import { authenticate } from "../auth";

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(authenticate);

// Get all adventure lines
router.get("/api/adventure-lines", async (req: Request, res: Response) => {
  try {
    // Get distinct adventure lines from the quests table
    const result = await db.query.quests.findMany({
      columns: {
        adventureLine: true
      },
      distinct: ['adventureLine'],
      where: (quests, { isNotNull }) => isNotNull(quests.adventureLine)
    });
    
    // Transform into the format expected by the frontend
    const adventureLines = result
      .filter(item => item.adventureLine) // Filter out any null values
      .map(item => ({
        id: item.adventureLine,
        name: item.adventureLine
      }));
    
    // If no adventure lines exist yet, provide some defaults
    if (adventureLines.length === 0) {
      return res.json([
        { id: "30 Days Lost in Space", name: "30 Days Lost in Space" },
        { id: "Cogsworth City", name: "Cogsworth City" },
        { id: "Neon Realm", name: "Neon Realm" }
      ]);
    }
    
    res.json(adventureLines);
  } catch (error) {
    console.error("Error fetching adventure lines:", error);
    res.status(500).json({ error: "Failed to fetch adventure lines" });
  }
});

export default router;