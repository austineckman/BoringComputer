import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCraftingRecipeSchema } from '@shared/schema';

// Get all recipes for a user
export const getCraftingRecipes = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const recipes = await storage.getAvailableCraftingRecipes(user.id);
    res.status(200).json(recipes);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch recipes' });
  }
};

// Get a specific recipe by ID
export const getCraftingRecipeById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await storage.getCraftingRecipe(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe is unlocked for this user
    if (!recipe.unlocked) {
      return res.status(403).json({ message: 'Recipe is locked' });
    }

    res.status(200).json(recipe);
  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch recipe' });
  }
};

// Create a new recipe (admin only)
export const createCraftingRecipe = async (req: Request, res: Response) => {
  try {
    const recipeSchema = insertCraftingRecipeSchema.extend({
      // Pattern is a 2D array representing required items in each position
      pattern: z.array(z.array(z.string().nullable())),
      // Dictionary of items required with quantities
      requiredItems: z.record(z.string(), z.number().positive()),
    });

    const recipeData = recipeSchema.parse(req.body);
    const newRecipe = await storage.createCraftingRecipe(recipeData);
    
    res.status(201).json(newRecipe);
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid recipe data', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create recipe' });
  }
};

// Update an existing recipe (admin only)
export const updateCraftingRecipe = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipeSchema = insertCraftingRecipeSchema.extend({
      // Pattern is a 2D array representing required items in each position
      pattern: z.array(z.array(z.string().nullable())),
      // Dictionary of items required with quantities
      requiredItems: z.record(z.string(), z.number().positive()),
    }).partial();

    const recipeData = recipeSchema.parse(req.body);
    
    const updatedRecipe = await storage.updateCraftingRecipe(id, recipeData);
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.status(200).json(updatedRecipe);
  } catch (error: any) {
    console.error('Error updating recipe:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid recipe data', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to update recipe' });
  }
};

// Delete a recipe (admin only)
export const deleteCraftingRecipe = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const deleted = await storage.deleteCraftingRecipe(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: error.message || 'Failed to delete recipe' });
  }
};

// Craft an item using a recipe
export const craftItem = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const craftSchema = z.object({
      recipeId: z.number(),
      gridPattern: z.array(z.array(z.string().nullable()))
    });

    const { recipeId, gridPattern } = craftSchema.parse(req.body);
    
    // Get the recipe
    const recipe = await storage.getCraftingRecipe(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe is unlocked for this user
    if (!recipe.unlocked) {
      return res.status(403).json({ message: 'Recipe is locked' });
    }

    // Get user's inventory
    const user = (req as any).user;
    const inventory = user.inventory || {};

    // Validate user has required items
    for (const [itemId, requiredAmount] of Object.entries(recipe.requiredItems)) {
      const userAmount = inventory[itemId] || 0;
      if (userAmount < requiredAmount) {
        return res.status(400).json({ 
          message: 'Missing required items',
          missing: { [itemId]: requiredAmount - userAmount }
        });
      }
    }

    // Check if the grid pattern matches the recipe
    const isValidPattern = validateGridPattern(gridPattern, recipe.pattern);
    if (!isValidPattern) {
      return res.status(400).json({ message: 'Invalid crafting pattern' });
    }

    // Remove required items from inventory
    const updatedInventory = { ...inventory };
    for (const [itemId, requiredAmount] of Object.entries(recipe.requiredItems)) {
      updatedInventory[itemId] = (updatedInventory[itemId] || 0) - requiredAmount;
      
      // Log inventory history
      await storage.createInventoryHistory({
        userId: user.id,
        type: itemId,
        quantity: requiredAmount,
        action: 'used',
        source: 'crafting'
      });
    }

    // Add result item to inventory
    updatedInventory[recipe.resultItem] = (updatedInventory[recipe.resultItem] || 0) + recipe.resultQuantity;
    
    // Log inventory history for crafted item
    await storage.createInventoryHistory({
      userId: user.id,
      type: recipe.resultItem,
      quantity: recipe.resultQuantity,
      action: 'gained',
      source: 'crafting'
    });

    // Update user inventory
    await storage.updateUser(user.id, { inventory: updatedInventory });

    // Award XP if applicable
    const xpReward = calculateXpReward(recipe);
    if (xpReward > 0) {
      await storage.addUserXP(user.id, xpReward);
    }

    res.status(200).json({
      message: 'Item crafted successfully',
      resultItem: recipe.resultItem,
      resultQuantity: recipe.resultQuantity,
      xpGained: xpReward
    });
  } catch (error: any) {
    console.error('Error crafting item:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to craft item' });
  }
};

// Helper function to validate that the grid pattern matches the recipe pattern
function validateGridPattern(
  gridPattern: (string | null)[][],
  recipePattern: (string | null)[][]
): boolean {
  // Both patterns should be 3x3
  if (gridPattern.length !== 3 || recipePattern.length !== 3) {
    return false;
  }

  for (let i = 0; i < 3; i++) {
    if (gridPattern[i].length !== 3 || recipePattern[i].length !== 3) {
      return false;
    }
  }

  // Check if each cell in the grid matches the required pattern
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const requiredItem = recipePattern[row][col];
      const providedItem = gridPattern[row][col];

      // If recipe requires an item in this cell
      if (requiredItem) {
        // Grid must have the same item in this cell
        if (providedItem !== requiredItem) {
          return false;
        }
      } 
      // If recipe doesn't require an item in this cell
      else if (!requiredItem && providedItem) {
        // Grid shouldn't have any item in this cell
        return false;
      }
    }
  }

  return true;
}

// Helper function to calculate XP reward based on recipe difficulty
function calculateXpReward(recipe: any): number {
  // Base XP rewards
  const baseXp = {
    easy: 25,
    medium: 50,
    hard: 100
  };

  // Calculate XP based on difficulty and number of required items
  const difficultyXp = baseXp[recipe.difficulty as keyof typeof baseXp] || 25;
  const requiredItems = recipe.requiredItems || {};
  const itemCountMultiplier = Math.min(
    2.0, // Cap at 2x multiplier
    1.0 + (Object.values(requiredItems).reduce((sum: number, val: number) => sum + val, 0) * 0.05)
  );

  return Math.round(difficultyXp * itemCountMultiplier);
}