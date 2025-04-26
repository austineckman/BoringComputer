import { Request, Response, Router } from "express";
import { authenticate, requireAdmin } from "../auth";
import { db } from "../db";
import { storage } from "../storage";

const adminQuestsRoutes = Router();

// Get all quests (admin only)
adminQuestsRoutes.get("/", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get all quests from storage
    const quests = await storage.getQuests();
    
    // Add component requirements to each quest
    const questsWithComponents = [];
    for (const quest of quests) {
      try {
        const components = await storage.getQuestComponentsWithDetails(quest.id);
        
        // Add component requirements to quest object
        const questWithComponents = {
          ...quest,
          componentRequirements: components || []
        };
        questsWithComponents.push(questWithComponents);
      } catch (err) {
        console.error(`Error fetching components for quest ${quest.id}:`, err);
        questsWithComponents.push(quest); // Add quest without components
      }
    }
    
    // Return quests with components
    res.json(questsWithComponents);
  } catch (error) {
    console.error("Error fetching quests:", error);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

// Get a specific quest by ID (admin only)
adminQuestsRoutes.get("/:id", authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const questId = parseInt(req.params.id);
    
    if (isNaN(questId)) {
      return res.status(400).json({ error: "Invalid quest ID" });
    }
    
    // Get quest from storage
    const quest = await storage.getQuest(questId);
    
    if (!quest) {
      return res.status(404).json({ error: "Quest not found" });
    }
    
    // Get component requirements for quest
    const components = await storage.getQuestComponentsWithDetails(questId);
    
    // Add component requirements to quest object
    const questWithComponents = {
      ...quest,
      componentRequirements: components || []
    };
    
    res.json(questWithComponents);
  } catch (error) {
    console.error("Error fetching quest:", error);
    res.status(500).json({ error: "Failed to fetch quest" });
  }
});

export default adminQuestsRoutes;