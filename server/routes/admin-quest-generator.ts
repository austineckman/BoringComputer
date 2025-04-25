import express, { Request, Response } from "express";
import OpenAI from "openai";
import { adminAuth } from "../middleware/adminAuth";
import { nanoid } from "nanoid";
import * as fs from "fs";
import * as path from "path";
import { db } from "../db";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "quest-images");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

// Middleware to ensure user is an admin
router.use(adminAuth);

interface QuestGenRequest {
  kitId: string;
  theme?: string;
  missionKeywords?: string;
  difficulty?: number;
  includeImage?: boolean;
}

interface GeneratedQuest {
  title: string;
  description: string;
  imageUrl?: string;
  components: string[];
  xpReward: number;
  lootSuggestion: string;
  adventureLine?: string;
}

// Endpoint to generate a quest
router.post("/api/admin/generate-quest", async (req: Request, res: Response) => {
  const { kitId, theme, missionKeywords, difficulty = 3, includeImage = true } = req.body as QuestGenRequest;
  
  try {
    // Fetch the kit details
    const kit = await db.query.kits.findFirst({
      where: (kits, { eq }) => eq(kits.id, kitId),
      with: {
        components: true,
      },
    });
    
    if (!kit) {
      return res.status(404).json({ error: "Kit not found" });
    }
    
    // Prepare the components for the prompt
    const componentsList = kit.components.map(comp => `${comp.name}: ${comp.description}`).join("\n");
    
    // Generate quest content
    const questContent = await generateQuestContent(
      kit.name,
      kit.description,
      componentsList,
      theme || "",
      missionKeywords || "",
      difficulty
    );
    
    let imageUrl;
    if (includeImage) {
      // Generate an image for the quest
      imageUrl = await generateQuestImage(questContent.title, questContent.description, theme || "");
    }
    
    // Prepare response
    const response: GeneratedQuest = {
      title: questContent.title,
      description: questContent.description,
      imageUrl,
      components: questContent.requiredComponents,
      xpReward: questContent.xpReward,
      lootSuggestion: questContent.lootSuggestion,
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error generating quest:", error);
    res.status(500).json({ error: "Failed to generate quest content" });
  }
});

// Function to generate quest content using OpenAI
async function generateQuestContent(
  kitName: string,
  kitDescription: string,
  componentsList: string,
  theme: string,
  missionKeywords: string,
  difficulty: number
) {
  const difficultyLabels = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"];
  const difficultyText = difficultyLabels[difficulty - 1] || "Medium";
  
  const themePrompt = theme ? `The theme is: ${theme}` : "";
  const keywordsPrompt = missionKeywords 
    ? `The mission should involve: ${missionKeywords}` 
    : "";
  
  const prompt = `Generate an educational quest for a hands-on electronics kit. 

KIT INFORMATION:
Name: ${kitName}
Description: ${kitDescription}

COMPONENTS AVAILABLE:
${componentsList}

QUEST REQUIREMENTS:
${themePrompt}
${keywordsPrompt}
Difficulty level: ${difficultyText}

The quest should be educational, engaging, and involve using electronics components in a creative way.
The response should be JSON formatted with the following fields:
- title: an exciting title for the quest (max 60 characters)
- description: a detailed quest description with at least 200-300 words including context, story, and specific technical steps
- requiredComponents: an array of 2-4 required component names from the list above
- xpReward: a number between 100-500 based on difficulty
- lootSuggestion: a suggestion for a loot item the player might receive

Make sure the description has both a narrative part and technical instructions. Use a pixel art game style writing tone.`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a quest designer for an educational STEM game focusing on electronics and coding." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in OpenAI request:", error);
    throw new Error("Failed to generate quest content with AI");
  }
}

// Function to generate an image for the quest using DALL-E
async function generateQuestImage(title: string, description: string, theme: string) {
  try {
    const prompt = `Create a pixel art style image for an educational electronics quest titled "${title}". The quest is about ${description.substring(0, 100)}... Theme: ${theme || "technology"}. Use vibrant colors and a 16-bit retro game aesthetic. The image should be suitable as a quest header image.`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    });
    
    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    // Download and save the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Create a unique filename
    const imageId = nanoid(8);
    const filename = `${imageId}.png`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Save the image to the uploads directory
    fs.writeFileSync(filepath, Buffer.from(imageBuffer));
    
    // Return the path to the saved image
    return `/uploads/quest-images/${filename}`;
  } catch (error) {
    console.error("Error generating image:", error);
    // Don't throw here - we'll continue without an image
    return undefined;
  }
}

export default router;