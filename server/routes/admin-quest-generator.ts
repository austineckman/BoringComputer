import express, { Request, Response } from "express";
import { adminAuth } from "../middleware/adminAuth";
import { db } from "../db";
import OpenAI from "openai";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { nanoid } from 'nanoid';

const router = express.Router();

// Middleware to ensure user is an admin
router.use(adminAuth);

interface QuestGenRequest {
  kitId: string;
  theme?: string;
  missionKeywords?: string;
  difficulty?: number;
  includeImage?: boolean;
  imagePrompt?: string;
}

interface GeneratedQuest {
  title: string;
  description: string;  // This is the flavor text/storytelling (lore)
  missionBrief: string; // This is the clear classroom assignment
  imageUrl?: string;
  components: string[];
  xpReward: number;
  lootSuggestion: string;
  adventureLine?: string;
}

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'quest-images');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Endpoint to generate quest content using OpenAI API
router.post("/api/admin/generate-quest", async (req: Request, res: Response) => {
  try {
    const { kitId, theme, missionKeywords, difficulty = 2, includeImage = true, imagePrompt = "" } = req.body as QuestGenRequest;
    
    if (!kitId) {
      return res.status(400).json({ error: "Kit ID is required" });
    }
    
    // Get kit details
    const kit = await db.query.componentKits.findFirst({
      where: (kits, { eq }) => eq(kits.id, kitId),
      with: {
        components: true
      }
    });
    
    if (!kit) {
      return res.status(404).json({ error: "Kit not found" });
    }
    
    // Get components for the kit with both name and ID
    const kitComponents = kit.components.map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.description
    }));
    const componentNames = kitComponents.map(comp => comp.name);
    
    // Generate quest content
    const questContent = await generateQuestContent({
      kitName: kit.name,
      kitDescription: kit.description || "",
      componentNames,
      theme: theme || "",
      missionKeywords: missionKeywords || "",
      difficulty
    });
    
    // Generate quest image if requested
    let imageUrl = undefined;
    if (includeImage) {
      try {
        imageUrl = await generateQuestImage(
          questContent.title,
          questContent.description,
          theme || kit.name,
          imagePrompt
        );
      } catch (imageError) {
        console.error("Error generating quest image:", imageError);
        // Continue without image if generation fails
      }
    }
    
    // Map the AI-generated component names to actual component IDs
    const selectedComponents = questContent.components;
    
    // Map component names to component objects (with IDs)
    const resolvedComponents = selectedComponents.map(componentName => {
      // First try exact match
      let match = kitComponents.find(comp => 
        comp.name.toLowerCase() === componentName.toLowerCase());
      
      // If no exact match, try to find a component containing the AI component name
      if (!match) {
        match = kitComponents.find(comp => 
          comp.name.toLowerCase().includes(componentName.toLowerCase()) || 
          (comp.description && comp.description.toLowerCase().includes(componentName.toLowerCase())));
      }
      
      // If still no match, try the reverse - AI component name containing a kit component name
      if (!match) {
        match = kitComponents.find(comp => 
          componentName.toLowerCase().includes(comp.name.toLowerCase()));
      }
      
      return match ? match : componentName;
    });
    
    // Provide both component names for display and component IDs for database storage
    const response: GeneratedQuest = {
      title: questContent.title,
      description: questContent.description,
      missionBrief: questContent.missionBrief,
      imageUrl,
      components: selectedComponents,
      componentIds: resolvedComponents.map(c => typeof c === 'string' ? null : c.id),
      xpReward: questContent.xpReward,
      lootSuggestion: questContent.lootSuggestion,
      adventureLine: questContent.adventureLine
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error generating quest:", error);
    res.status(500).json({ error: "Failed to generate quest content" });
  }
});

async function generateQuestContent({
  kitName,
  kitDescription,
  componentNames,
  theme,
  missionKeywords,
  difficulty
}: {
  kitName: string;
  kitDescription: string;
  componentNames: string[];
  theme: string;
  missionKeywords: string;
  difficulty: number;
}): Promise<{
  title: string;
  description: string;
  missionBrief: string;
  components: string[];
  xpReward: number;
  lootSuggestion: string;
  adventureLine?: string;
}> {
  // Get available items from the database for rewards - use actual database items
  const { db } = await import('../db');
  const availableItems = await db.query.items.findMany();
  const itemNames = availableItems.map(item => `${item.name} (id: ${item.id}, rarity: ${item.rarity})`).join(', ');
  
  // Format the prompt with all relevant information
  const prompt = `
    Create an educational and engaging quest for a STEM learning platform.
    
    Kit: ${kitName}
    Kit Description: ${kitDescription}
    Available Components: ${componentNames.join(', ')}
    Theme: ${theme || "futuristic technology"}
    Mission Keywords: ${missionKeywords || "exploration, discovery, problem-solving"}
    Difficulty Level (1-5): ${difficulty}
    
    Please generate a creative quest with:
    1. A catchy title (max 50 chars)
    2. Two separate text sections:
       a. An engaging story/lore description (max a few sentences) with creative flavor text that sets the scene
       b. A clear mission brief with specific instructions on what to build/create (should be direct and clear)
    3. Select 3-5 components from the Available Components list that would be required for this quest
    4. A suggested XP reward (between ${difficulty * 50} and ${difficulty * 100})
    5. A suggested loot reward using ONLY items from this list: ${itemNames}
       Format rewards like "tech-scrap x3, circuit-board x1" - must use exact item IDs, not names
    6. An adventure line name that this quest would fit into (something like "Cogsworth City", "Neon Realm", or "30 Days Lost in Space")
    
    Format your response as a JSON object with these keys:
    "title", "description" (for the story/lore), "missionBrief" (for the clear instructions), "components", "xpReward", "lootSuggestion", "adventureLine"
  `;

  // Call OpenAI API for quest generation
  const completion = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      {
        role: "system",
        content: "You are a creative quest designer for a STEM education platform with a pixel art game aesthetic. Your quests should be engaging, educational, and themed appropriately."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });
  
  // Parse the response
  const responseContent = completion.choices[0].message.content;
  console.log("Raw OpenAI response:", responseContent); // Add logging
  const parsedContent = JSON.parse(responseContent);
  console.log("Parsed content:", parsedContent); // Add logging
  
  // Ensure required fields are present
  const result = {
    title: parsedContent.title || `New ${kitName} Quest`,
    description: parsedContent.description || `A quest using the ${kitName} kit.`,
    missionBrief: parsedContent.missionBrief || `Build something using the ${kitName} components.`,
    components: Array.isArray(parsedContent.components) ? parsedContent.components : componentNames.slice(0, 3),
    xpReward: parsedContent.xpReward || difficulty * 75,
    lootSuggestion: parsedContent.lootSuggestion || "Mystery Components x1",
    adventureLine: parsedContent.adventureLine || kitName
  };
  
  console.log("Final quest content being returned:", result); // Add logging
  return result;
}

async function generateQuestImage(title: string, description: string, theme: string, customPrompt: string = "") {
  try {
    // Build base prompt with strong emphasis on no text
    let basePrompt = `Create a pixel art style image for an educational STEM quest called "${title}". The quest description is: "${description}". Theme: ${theme}. 
    
    The image should be vibrant, educational, and in a retro pixel art style similar to games like Stardew Valley or Terraria, with 16-bit or 32-bit aesthetic. Include relevant STEM elements and make it suitable for children.
    
    IMPORTANT INSTRUCTIONS:
    - DO NOT INCLUDE ANY TEXT WHATSOEVER IN THE IMAGE
    - NO LABELS, NO CAPTIONS, NO SIGNS, NO WORDS
    - FOCUS ONLY ON VISUAL STORYTELLING
    - USE COLOR AND COMPOSITION INSTEAD OF TEXT`;
    
    // Add custom prompt if provided
    if (customPrompt && customPrompt.trim().length > 0) {
      basePrompt += `\n\nAdditional style instructions: ${customPrompt}`;
    }
    
    // Add final reminder about text
    basePrompt += `\n\nFinal reminder: This image must not contain any text, letters, numbers, or written elements of any kind.`;
    
    // Generate the image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: basePrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    if (!response.data[0]?.url) {
      throw new Error("No image URL in response");
    }
    
    // Download the image
    const imageUrl = response.data[0].url;
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // Save the image to the uploads directory
    const fileName = `${nanoid(8)}.png`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    fs.writeFileSync(filePath, Buffer.from(imageResponse.data));
    
    // Return the relative URL to the image
    return `/uploads/quest-images/${fileName}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export default router;