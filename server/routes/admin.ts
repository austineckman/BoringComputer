import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { db } from '../db';
import { 
  quests, 
  items, 
  craftingRecipes,
  lootBoxConfigs,
  insertQuestSchema,
  insertItemSchema,
  insertCraftingRecipeSchema,
  insertLootBoxConfigSchema,
} from '../../shared/schema';
import { eq, count } from 'drizzle-orm';
import { z } from 'zod';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';
import { 
  upload, 
  questImageUpload, 
  recipeHeroUpload,
  lootboxUpload,
  getPublicImageUrl, 
  getPublicQuestImageUrl,
  getPublicRecipeHeroUrl,
  getPublicLootboxUrl
} from '../middlewares/upload';

const router = Router();

// Apply admin authentication to all routes in this router
router.use(adminAuth);

// =================
// QUESTS
// =================

// Get all quests
router.get('/quests', async (req, res) => {
  try {
    const allQuests = await db.select().from(quests);
    
    // For each quest, load its components from the database
    const questsWithComponents = await Promise.all(
      allQuests.map(async (quest) => {
        try {
          // Get the components for this quest
          const questComponents = await storage.getQuestComponents(quest.id);
          console.log(`Found ${questComponents.length} components for quest ID ${quest.id}`);
          
          // Return the quest with its components
          return {
            ...quest,
            components: questComponents.map(comp => ({
              id: comp.componentId,
              required: !comp.isOptional,  // Convert isOptional to required for frontend
              quantity: comp.quantity
            }))
          };
        } catch (error) {
          console.error(`Error loading components for quest ${quest.id}:`, error);
          // If there's an error, just return the quest without components
          return quest;
        }
      })
    );
    
    res.json(questsWithComponents);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Failed to fetch quests' });
  }
});

// Get a single quest
router.get('/quests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quest ID' });
    }
    
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    res.json(quest);
  } catch (error) {
    console.error('Error fetching quest:', error);
    res.status(500).json({ error: 'Failed to fetch quest' });
  }
});

// Create a new quest
router.post('/quests', async (req, res) => {
  try {
    const questData = insertQuestSchema.parse(req.body);
    const [newQuest] = await db.insert(quests).values(questData).returning();
    res.status(201).json(newQuest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating quest:', error);
    res.status(500).json({ error: 'Failed to create quest' });
  }
});

// Update a quest
router.put('/quests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quest ID' });
    }
    
    const questData = insertQuestSchema.parse(req.body);
    const [updatedQuest] = await db
      .update(quests)
      .set(questData)
      .where(eq(quests.id, id))
      .returning();
    
    if (!updatedQuest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    res.json(updatedQuest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating quest:', error);
    res.status(500).json({ error: 'Failed to update quest' });
  }
});

// Delete a quest
router.delete('/quests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid quest ID' });
    }
    
    const [deletedQuest] = await db
      .delete(quests)
      .where(eq(quests.id, id))
      .returning();
    
    if (!deletedQuest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    res.json({ message: 'Quest deleted successfully', quest: deletedQuest });
  } catch (error) {
    console.error('Error deleting quest:', error);
    res.status(500).json({ error: 'Failed to delete quest' });
  }
});

// =================
// ITEMS
// =================

// Get all items
router.get('/items', async (req, res) => {
  try {
    // Use the storage interface for items
    const allItems = await storage.getItems();
    res.json(allItems);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get a single item
router.get('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const item = await storage.getItem(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create a new item
router.post('/items', async (req, res) => {
  try {
    // Validate with insertItemSchema
    const itemData = insertItemSchema.parse(req.body);
    
    // Add the item to our storage
    const newItem = await storage.createItem(itemData);
    
    // Add the new item to all users' inventories with a default quantity
    await addNewItemToAllUsersInventory(newItem.id);
    
    res.status(201).json(newItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Helper function to add a new item to all users' inventories
async function addNewItemToAllUsersInventory(itemId: string) {
  try {
    // Get all users
    const allUsers = await storage.getUsers();
    
    // Default quantity to add when a new item is created
    const DEFAULT_QUANTITY = 10;
    
    // Update each user's inventory with the new item
    for (const user of allUsers) {
      // Get current inventory
      const currentInventory = { ...user.inventory } || {};
      
      // Only add the item if it doesn't already exist
      if (currentInventory[itemId] === undefined) {
        // Add the new item with default quantity
        currentInventory[itemId] = DEFAULT_QUANTITY;
        
        // Update the user's inventory
        await storage.updateUser(user.id, { inventory: currentInventory });
        
        // Add to inventory history
        await storage.createInventoryHistory({
          userId: user.id,
          type: itemId,
          quantity: DEFAULT_QUANTITY,
          action: 'gained',
          source: 'admin_create_item'
        });
        
        console.log(`Added item ${itemId} to user ${user.username}'s inventory`);
      }
    }
    
    console.log(`Successfully added item ${itemId} to all users' inventories`);
  } catch (error) {
    console.error('Error adding item to users inventories:', error);
    // Don't throw, just log the error - we don't want to fail item creation if this fails
  }
}

// Update an item
router.put('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if the item exists
    const existingItem = await storage.getItem(id);
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Validate with insertItemSchema but allow partial updates
    const itemData = insertItemSchema.partial().parse(req.body);
    
    // Update the item in our storage
    const updatedItem = await storage.updateItem(id, itemData);
    
    if (!updatedItem) {
      return res.status(500).json({ error: 'Failed to update item' });
    }
    
    res.json(updatedItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete an item
router.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if the item exists
    const existingItem = await storage.getItem(id);
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Remove the item from our storage
    const success = await storage.deleteItem(id);
    
    if (success) {
      res.json({
        message: 'Item deleted successfully',
        item: existingItem
      });
    } else {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// =================
// CRAFTING RECIPES
// =================

// Get all crafting recipes
router.get('/recipes', async (req, res) => {
  try {
    const allRecipes = await db.select().from(craftingRecipes);
    res.json(allRecipes);
  } catch (error) {
    console.error('Error fetching crafting recipes:', error);
    res.status(500).json({ error: 'Failed to fetch crafting recipes' });
  }
});

// Get a single crafting recipe
router.get('/recipes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const [recipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create a new crafting recipe
router.post('/recipes', async (req, res) => {
  try {
    const recipeData = insertCraftingRecipeSchema.parse(req.body);
    const [newRecipe] = await db.insert(craftingRecipes).values(recipeData).returning();
    res.status(201).json(newRecipe);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// Update a crafting recipe
router.put('/recipes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const recipeData = insertCraftingRecipeSchema.parse(req.body);
    
    const [updatedRecipe] = await db
      .update(craftingRecipes)
      .set(recipeData)
      .where(eq(craftingRecipes.id, id))
      .returning();
    
    if (!updatedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(updatedRecipe);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Delete a crafting recipe
router.delete('/recipes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const [deletedRecipe] = await db
      .delete(craftingRecipes)
      .where(eq(craftingRecipes.id, id))
      .returning();
    
    if (!deletedRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe deleted successfully', recipe: deletedRecipe });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// =================
// LOOT BOX CONFIGS
// =================

// Get all loot box configs
router.get('/loot-boxes', async (req, res) => {
  try {
    const allConfigs = await db.select().from(lootBoxConfigs);
    res.json(allConfigs);
  } catch (error) {
    console.error('Error fetching loot box configs:', error);
    res.status(500).json({ error: 'Failed to fetch loot box configs' });
  }
});

// Get a single loot box config
router.get('/loot-boxes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [config] = await db.select().from(lootBoxConfigs).where(eq(lootBoxConfigs.id, id));
    
    if (!config) {
      return res.status(404).json({ error: 'Loot box config not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching loot box config:', error);
    res.status(500).json({ error: 'Failed to fetch loot box config' });
  }
});

// Create a new loot box config
router.post('/loot-boxes', async (req, res) => {
  try {
    const configData = insertLootBoxConfigSchema.parse(req.body);
    const [newConfig] = await db.insert(lootBoxConfigs).values(configData).returning();
    res.status(201).json(newConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating loot box config:', error);
    res.status(500).json({ error: 'Failed to create loot box config' });
  }
});

// Update a loot box config
router.put('/loot-boxes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const configData = insertLootBoxConfigSchema.parse(req.body);
    
    const [updatedConfig] = await db
      .update(lootBoxConfigs)
      .set(configData)
      .where(eq(lootBoxConfigs.id, id))
      .returning();
    
    if (!updatedConfig) {
      return res.status(404).json({ error: 'Loot box config not found' });
    }
    
    res.json(updatedConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating loot box config:', error);
    res.status(500).json({ error: 'Failed to update loot box config' });
  }
});

// Delete a loot box config
router.delete('/loot-boxes/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const [deletedConfig] = await db
      .delete(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, id))
      .returning();
    
    if (!deletedConfig) {
      return res.status(404).json({ error: 'Loot box config not found' });
    }
    
    res.json({ message: 'Loot box config deleted successfully', config: deletedConfig });
  } catch (error) {
    console.error('Error deleting loot box config:', error);
    res.status(500).json({ error: 'Failed to delete loot box config' });
  }
});

// =================
// FILE UPLOADS
// =================

// Handle general image upload
router.post('/upload-image', questImageUpload.single('image'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    // Get the file path relative to the public directory
    const filePath = getPublicQuestImageUrl(path.basename(req.file.path));
    
    // Return success response with the image path
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      url: filePath
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Handle recipe hero image upload
router.post('/recipes/upload-hero', recipeHeroUpload.single('heroImage'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    // Get the file path relative to the public directory
    const filePath = getPublicRecipeHeroUrl(path.basename(req.file.path));
    
    // Return success response with the image path
    res.json({ 
      success: true, 
      message: 'Recipe hero image uploaded successfully',
      url: filePath
    });
  } catch (error) {
    console.error('Error uploading recipe hero image:', error);
    res.status(500).json({ error: 'Failed to upload recipe hero image' });
  }
});

// Handle image upload for items
router.post('/items/:itemId/image', upload.single('image'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    // Get the itemId from the URL params
    const { itemId } = req.params;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    // Check if the item exists
    const existingItem = await storage.getItem(itemId);
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get the file path relative to the public directory
    const filePath = getPublicImageUrl(path.basename(req.file.path));
    
    // Update the item with the new image path
    const updatedItem = await storage.updateItem(itemId, { 
      imagePath: filePath 
    });

    if (!updatedItem) {
      return res.status(500).json({ error: 'Failed to update item with new image' });
    }

    // Return success response with the image path
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imagePath: filePath,
      item: updatedItem
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Gather comprehensive stats for admin dashboard
    const userCount = await storage.getUserCount();
    const itemCount = await storage.getItemCount();
    const recipeCount = await storage.getCraftingRecipeCount();
    const questCount = await storage.getQuestCount();
    
    res.status(200).json({
      userCount,
      itemCount,
      recipeCount,
      questCount,
      // Add more stats as needed
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve stats' });
  }
});

// Legacy endpoint for backward compatibility for item uploads by their IDs
// This is kept for compatibility with older code but the specific item upload endpoint is preferred
router.post('/item-upload', upload.single('image'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }

    // Get the itemId from the request body
    const { itemId } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    // Check if the item exists
    const existingItem = await storage.getItem(itemId);
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get the file path relative to the public directory
    const filePath = getPublicImageUrl(path.basename(req.file.path));
    
    // Update the item with the new image path
    const updatedItem = await storage.updateItem(itemId, { 
      imagePath: filePath 
    });

    if (!updatedItem) {
      return res.status(500).json({ error: 'Failed to update item with new image' });
    }

    // Return success response with the image path
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imagePath: filePath,
      item: updatedItem
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// =================
// LOOT BOX CONFIGS
// =================

// Get all loot box configurations
router.get('/lootboxes', async (req, res) => {
  try {
    const allConfigs = await storage.getLootBoxConfigs();
    res.json(allConfigs);
  } catch (error) {
    console.error('Error fetching loot box configs:', error);
    res.status(500).json({ error: 'Failed to fetch loot box configurations' });
  }
});

// Get a single loot box configuration
router.get('/lootboxes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const config = await storage.getLootBoxConfig(id);
    
    if (!config) {
      return res.status(404).json({ error: 'Loot box configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching loot box config:', error);
    res.status(500).json({ error: 'Failed to fetch loot box configuration' });
  }
});

// Create a new loot box configuration
router.post('/lootboxes', async (req, res) => {
  try {
    // Validate request body
    const validatedData = insertLootBoxConfigSchema.parse(req.body);
    
    // Check if config with this ID already exists
    const existingConfig = await storage.getLootBoxConfig(validatedData.id);
    if (existingConfig) {
      return res.status(400).json({ error: 'A loot box configuration with this ID already exists' });
    }
    
    // Validate that weights sum to 100%
    const totalWeight = validatedData.itemDropTable.reduce((sum, item) => sum + item.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({ 
        error: 'Item weights must sum to 100%', 
        currentSum: totalWeight 
      });
    }
    
    // Create the loot box configuration
    const newConfig = await storage.createLootBoxConfig(validatedData);
    
    res.status(201).json(newConfig);
  } catch (error) {
    console.error('Error creating loot box config:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create loot box configuration' });
  }
});

// Update a loot box configuration
router.put('/lootboxes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the config exists
    const existingConfig = await storage.getLootBoxConfig(id);
    if (!existingConfig) {
      return res.status(404).json({ error: 'Loot box configuration not found' });
    }
    
    // Validate request body - skip ID validation since we're using the ID from the URL
    const validatedData = insertLootBoxConfigSchema.omit({ id: true }).parse(req.body);
    
    // Validate that weights sum to 100%
    const totalWeight = validatedData.itemDropTable.reduce((sum, item) => sum + item.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return res.status(400).json({ 
        error: 'Item weights must sum to 100%', 
        currentSum: totalWeight 
      });
    }
    
    // Update the loot box configuration
    const updatedConfig = await storage.updateLootBoxConfig(id, validatedData);
    
    if (!updatedConfig) {
      return res.status(500).json({ error: 'Failed to update loot box configuration' });
    }
    
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating loot box config:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update loot box configuration' });
  }
});

// Delete a loot box configuration
router.delete('/lootboxes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the config exists
    const existingConfig = await storage.getLootBoxConfig(id);
    if (!existingConfig) {
      return res.status(404).json({ error: 'Loot box configuration not found' });
    }
    
    // Delete the loot box configuration
    const success = await storage.deleteLootBoxConfig(id);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete loot box configuration' });
    }
    
    res.json({ success: true, message: 'Loot box configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting loot box config:', error);
    res.status(500).json({ error: 'Failed to delete loot box configuration' });
  }
});

// Upload a loot box image
router.post('/lootboxes/:id/upload', lootboxUpload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file was uploaded' });
    }
    
    // Check if the loot box config exists
    const existingConfig = await storage.getLootBoxConfig(id);
    if (!existingConfig) {
      return res.status(404).json({ error: 'Loot box configuration not found' });
    }
    
    // Get the file path relative to the public directory
    const filePath = getPublicLootboxUrl(path.basename(req.file.path));
    
    // Update the loot box config with the new image path
    const updatedConfig = await storage.updateLootBoxConfig(id, { 
      image: filePath 
    });
    
    if (!updatedConfig) {
      return res.status(500).json({ error: 'Failed to update loot box configuration with new image' });
    }
    
    // Return success response with the image path
    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      imagePath: filePath,
      config: updatedConfig
    });
  } catch (error) {
    console.error('Error uploading loot box image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;