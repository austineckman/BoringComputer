import express, { Request, Response } from "express";
import { db } from "../db";
import { authenticate } from "../auth";

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(authenticate);

// Get all adventure lines
router.get("/api/adventure-lines", async (req: Request, res: Response) => {
  try {
    // Get all quests first
    const allQuests = await db.query.quests.findMany({
      columns: {
        adventureLine: true
      }
    });
    
    // Get unique adventure lines manually
    const uniqueLines = [...new Set(allQuests
      .map(quest => quest.adventureLine)
      .filter(line => line !== null && line !== undefined)
    )];
    
    // Transform into the format expected by the frontend
    const adventureLines = uniqueLines.map(line => ({
      id: line,
      name: line
    }));
    
    console.log("Adventure lines found:", adventureLines);
    
    res.json(adventureLines);
  } catch (error) {
    console.error("Error fetching adventure lines:", error);
    res.status(500).json({ error: "Failed to fetch adventure lines" });
  }
});

export default router;