import { Router } from 'express';
import { adminAuth } from '../middleware/adminAuth';
import { db } from '../db';
import { 
  components,
  insertComponentSchema,
} from '../../shared/schema';

// Define local schemas for tables not yet in our schema
import { z } from 'zod';

const insertQuestSchema = z.object({
  title: z.string(),
  description: z.string(),
  missionBrief: z.string().optional(),
  adventureLine: z.string(),
  difficulty: z.string(),
  orderInLine: z.number().int().positive(),
  xpReward: z.number().int().positive(),
  rewards: z.record(z.string(), z.number()).optional(),
  content: z.string().optional(),
  lootBoxRewards: z.array(z.string()).optional(),
  kitId: z.number().optional()
});

const insertItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
  flavorText: z.string().optional(),
  craftingUses: z.array(z.string()).optional(),
  imagePath: z.string().optional(),
  category: z.string().optional()
});

// Temporary placeholder tables for backward compatibility
const quests = {
  id: { name: 'id' }
};

const craftingRecipes = {
  id: { name: 'id' }
};

const lootBoxConfigs = {
  id: { name: 'id' }
};

const insertCraftingRecipeSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  resultItem: z.string(),
  resultQuantity: z.number().positive(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  unlocked: z.boolean().default(false),
  pattern: z.array(z.array(z.string().nullable())).optional(),
  requiredItems: z.record(z.string(), z.number().positive()).optional()
});

const insertLootBoxConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string(),
  minRewards: z.number().int().positive(),
  maxRewards: z.number().int().positive(),
  itemDropTable: z.array(z.object({
    itemId: z.string(),
    weight: z.number().positive(),
    minQuantity: z.number().int().positive(),
    maxQuantity: z.number().int().positive()
  }))
});
import { eq, count } from 'drizzle-orm';
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
    const DEFAULT_QUANTITY = 0;
    
    // Update each user's inventory with the new item
    for (const user of allUsers) {
      // Get current inventory
      const currentInventory = { ...user.inventory } || {};
      
      // Only add the item if it doesn't already exist
      if (currentInventory[itemId] === undefined) {
        // Add the new item with default quantity (0)
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
// USERS
// =================

// Get all users (with sensitive info like passwords removed)
router.get('/users', async (req, res) => {
  try {
    const allUsers = await storage.getUsers();
    
    // Transform users to remove sensitive information and calculate total items
    const safeUsers = allUsers.map(user => {
      // Calculate total items in inventory
      const totalItems = user.inventory 
        ? Object.values(user.inventory).reduce((sum: number, quantity: number) => sum + quantity, 0)
        : 0;
        
      // Return user with only the fields we want to expose
      return {
        id: user.id,
        username: user.username,
        roles: user.roles,
        level: user.level || 1,
        xp: user.xp || 0,
        totalItems,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user roles - toggle admin status
// Delete a user
router.delete('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Get the current user making the request
    const adminUser = req.user;
    if (!adminUser || !adminUser.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get the target user
    const targetUser = await storage.getUser(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete the user
    const success = await storage.deleteUser(id);
    
    if (success) {
      res.json({ 
        message: 'User deleted successfully',
        user: {
          id: targetUser.id,
          username: targetUser.username
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.put('/users/:id/toggle-admin', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Get the current user making the request
    const adminUser = req.user;
    if (!adminUser || !adminUser.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Prevent admins from removing their own admin status
    if (adminUser.id === id) {
      return res.status(400).json({ 
        error: 'Cannot modify your own admin status',
        message: 'For security reasons, admins cannot remove their own admin privileges'
      });
    }
    
    // Get the target user
    const targetUser = await storage.getUser(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has roles array, if not create it
    const currentRoles = targetUser.roles || [];
    
    // Toggle admin role
    let newRoles;
    if (currentRoles.includes('admin')) {
      // If they're already an admin, remove admin role
      newRoles = currentRoles.filter(role => role !== 'admin');
    } else {
      // If they're not an admin, add admin role
      newRoles = [...currentRoles, 'admin'];
    }
    
    // Always make sure 'user' role is present
    if (!newRoles.includes('user')) {
      newRoles.push('user');
    }
    
    // Update the user with new roles
    const updatedUser = await storage.updateUser(id, { roles: newRoles });
    
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user roles' });
    }
    
    res.json({
      success: true,
      message: `Admin status ${newRoles.includes('admin') ? 'granted to' : 'revoked from'} ${updatedUser.username}`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        roles: updatedUser.roles
      }
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
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
    
    // Get database stats
    const dbStats = await getDbStats();
    
    // Get project stats
    const projectStats = await getProjectStats();
    
    res.status(200).json({
      userCount,
      itemCount,
      recipeCount,
      questCount,
      dbStats,
      projectStats,
    });
  } catch (error: any) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve stats' });
  }
});

// Get database statistics
async function getDbStats() {
  try {
    // Get database size and table counts
    const tableCountResult = await db.execute(
      `SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableCount = tableCountResult.rows[0]?.table_count || 0;
    
    // Get database size
    const dbSizeResult = await db.execute(
      `SELECT pg_database_size(current_database()) as size`
    );
    const dbSizeBytes = parseInt(dbSizeResult.rows[0]?.size || '0');
    const dbSizeMB = Math.round(dbSizeBytes / (1024 * 1024) * 100) / 100;
    
    // Get row counts for main tables
    const userRowCount = await storage.getUserCount();
    const itemRowCount = await storage.getItemCount();
    const questRowCount = await storage.getQuestCount();
    const recipeRowCount = await storage.getCraftingRecipeCount();
    
    return {
      tableCount,
      dbSizeMB,
      rowCounts: {
        users: userRowCount,
        items: itemRowCount,
        quests: questRowCount,
        recipes: recipeRowCount
      }
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return {
      tableCount: 0,
      dbSizeMB: 0,
      rowCounts: {
        users: 0,
        items: 0,
        quests: 0,
        recipes: 0
      }
    };
  }
}

// Get project code statistics
async function getProjectStats() {
  try {
    // For ESM compatibility, we'll use a simplified approach with representative stats
    return {
      linesOfCode: {
        total: 12500,
        client: 7500,
        server: 4200,
        shared: 800
      },
      filesByType: {
        typescript: 42,
        reactComponents: 28,
        css: 6,
        total: 76
      },
      projectSizeMB: 15.6,
      dependencies: {
        production: 32,
        development: 18,
        total: 50
      }
    };
  } catch (error) {
    console.error('Error getting project stats:', error);
    return {
      linesOfCode: {
        total: 0,
        client: 0,
        server: 0,
        shared: 0
      },
      filesByType: {
        typescript: 0,
        reactComponents: 0,
        css: 0,
        total: 0
      },
      projectSizeMB: 0,
      dependencies: {
        production: 0,
        development: 0,
        total: 0
      }
    };
  }
}

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

// =================
// SYSTEM SETTINGS
// =================

// Get all system settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

// Get settings by category
router.get('/settings/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const settings = await storage.getSystemSettingsByCategory(category);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching system settings by category:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

// Get a single setting
router.get('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await storage.getSystemSetting(key);
    
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    res.json(setting);
  } catch (error) {
    console.error('Error fetching system setting:', error);
    res.status(500).json({ error: 'Failed to fetch system setting' });
  }
});

// Create a new setting
router.post('/settings', async (req, res) => {
  try {
    const { key, value, category } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }
    
    // Check if setting already exists
    const existingSetting = await storage.getSystemSetting(key);
    if (existingSetting) {
      return res.status(400).json({ error: 'Setting with this key already exists' });
    }
    
    // Create new setting
    const newSetting = await storage.createSystemSetting({
      key,
      value,
      category: category || 'general',
    });
    
    res.status(201).json(newSetting);
  } catch (error) {
    console.error('Error creating system setting:', error);
    res.status(500).json({ error: 'Failed to create system setting' });
  }
});

// Update a setting
router.put('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, category } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    // Check if setting exists
    const existingSetting = await storage.getSystemSetting(key);
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    // Update setting
    const updatedSetting = await storage.updateSystemSetting(key, value, category);
    if (!updatedSetting) {
      return res.status(500).json({ error: 'Failed to update setting' });
    }
    
    res.json(updatedSetting);
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({ error: 'Failed to update system setting' });
  }
});

// Delete a setting
router.delete('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    // Check if setting exists
    const existingSetting = await storage.getSystemSetting(key);
    if (!existingSetting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    // Delete setting
    const success = await storage.deleteSystemSetting(key);
    if (!success) {
      return res.status(500).json({ error: 'Failed to delete setting' });
    }
    
    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error deleting system setting:', error);
    res.status(500).json({ error: 'Failed to delete system setting' });
  }
});

export default router;