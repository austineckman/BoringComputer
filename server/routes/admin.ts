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
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { 
  itemDatabase, 
  ItemDetails, 
  getItemDetails, 
  addOrUpdateItem, 
  removeItem, 
  getAllItems 
} from '../itemDatabase';

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
    res.json(allQuests);
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
    // Use our new getAllItems function
    const allItems = getAllItems();
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
    const item = getItemDetails(id);
    
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
    const itemData = req.body as ItemDetails;
    
    // Validation
    if (!itemData.id || !itemData.name || !itemData.description) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Add the item to our mutable database
    const newItem = addOrUpdateItem(itemData);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update an item
router.put('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if the item exists
    const existingItem = getItemDetails(id);
    
    if (existingItem.id !== id) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const itemData = req.body as ItemDetails;
    
    // Validation
    if (!itemData.id || !itemData.name || !itemData.description) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Update the item in our mutable database
    const updatedItem = addOrUpdateItem(itemData);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete an item
router.delete('/items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if the item exists
    const existingItem = getItemDetails(id);
    
    if (existingItem.id !== id) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Remove the item from our mutable database
    const success = removeItem(id);
    
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

export default router;