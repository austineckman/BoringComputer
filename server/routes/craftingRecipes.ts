import { Request, Response } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { craftingRecipes } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Get all crafting recipes
export const getCraftingRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await db.select().from(craftingRecipes).where(eq(craftingRecipes.unlocked, true));
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching crafting recipes:', error);
    res.status(500).json({ message: 'Failed to fetch crafting recipes' });
  }
};

// Get a specific crafting recipe by ID
export const getCraftingRecipeById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid recipe ID' });
  }
  
  try {
    const [recipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching crafting recipe:', error);
    res.status(500).json({ message: 'Failed to fetch crafting recipe' });
  }
};

// Create a new crafting recipe (admin only)
export const createCraftingRecipe = async (req: Request, res: Response) => {
  try {
    const newRecipe = req.body;
    
    // Validate that pattern is a 2D array
    if (!Array.isArray(newRecipe.pattern) || !newRecipe.pattern.every((row: any) => Array.isArray(row))) {
      return res.status(400).json({ message: 'Pattern must be a 2D array' });
    }
    
    // Validate that requiredItems is an object
    if (typeof newRecipe.requiredItems !== 'object' || Array.isArray(newRecipe.requiredItems)) {
      return res.status(400).json({ message: 'requiredItems must be an object' });
    }
    
    const [recipe] = await db.insert(craftingRecipes).values(newRecipe).returning();
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating crafting recipe:', error);
    res.status(500).json({ message: 'Failed to create crafting recipe' });
  }
};

// Update a crafting recipe (admin only)
export const updateCraftingRecipe = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid recipe ID' });
  }
  
  try {
    const updateData = req.body;
    
    // Check if the recipe exists
    const [existingRecipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    
    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Update the recipe
    const [updatedRecipe] = await db
      .update(craftingRecipes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(craftingRecipes.id, id))
      .returning();
    
    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error('Error updating crafting recipe:', error);
    res.status(500).json({ message: 'Failed to update crafting recipe' });
  }
};

// Delete a crafting recipe (admin only)
export const deleteCraftingRecipe = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid recipe ID' });
  }
  
  try {
    // Check if the recipe exists
    const [existingRecipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    
    if (!existingRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Delete the recipe
    await db.delete(craftingRecipes).where(eq(craftingRecipes.id, id));
    
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting crafting recipe:', error);
    res.status(500).json({ message: 'Failed to delete crafting recipe' });
  }
};

// Attempt to craft an item
export const craftItem = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const userId = req.user.id;
  const { recipeId, gridPattern } = req.body;
  
  if (!recipeId || !gridPattern) {
    return res.status(400).json({ message: 'Recipe ID and grid pattern are required' });
  }
  
  try {
    // Get the recipe
    const [recipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, recipeId));
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Get user's inventory
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const inventory = user.inventory || {};
    
    // Validate that the user has all required items
    const requiredItems = recipe.requiredItems as Record<string, number>;
    const missingItems: { itemId: string, required: number, available: number }[] = [];
    
    for (const [itemId, requiredQuantity] of Object.entries(requiredItems)) {
      const availableQuantity = inventory[itemId] || 0;
      if (availableQuantity < requiredQuantity) {
        missingItems.push({
          itemId,
          required: requiredQuantity,
          available: availableQuantity
        });
      }
    }
    
    if (missingItems.length > 0) {
      return res.status(400).json({
        message: 'You don\'t have all required items',
        missingItems
      });
    }
    
    // Validate that the pattern matches
    const patternValid = validatePattern(gridPattern, recipe.pattern as (string | null)[][]);
    if (!patternValid) {
      return res.status(400).json({ message: 'Grid pattern does not match the recipe' });
    }
    
    // Update inventory (remove used items)
    const updatedInventory = { ...inventory };
    for (const [itemId, requiredQuantity] of Object.entries(requiredItems)) {
      updatedInventory[itemId] = (updatedInventory[itemId] || 0) - requiredQuantity;
      
      // Create inventory history for used materials
      await storage.createInventoryHistory({
        userId,
        type: itemId,
        quantity: requiredQuantity,
        action: 'used',
        source: 'crafting'
      });
    }
    
    // Add crafted item to inventory
    const craftedItemId = recipe.resultItem;
    const craftedQuantity = recipe.resultQuantity;
    updatedInventory[craftedItemId] = (updatedInventory[craftedItemId] || 0) + craftedQuantity;
    
    // Create inventory history for crafted item
    await storage.createInventoryHistory({
      userId,
      type: craftedItemId,
      quantity: craftedQuantity,
      action: 'gained',
      source: 'crafting'
    });
    
    // Update user inventory
    await storage.updateUser(userId, { inventory: updatedInventory });
    
    // Return success
    res.status(200).json({
      message: 'Item crafted successfully',
      craftedItem: {
        type: craftedItemId,
        quantity: craftedQuantity
      },
      updatedInventory
    });
    
  } catch (error) {
    console.error('Error crafting item:', error);
    res.status(500).json({ message: 'Failed to craft item' });
  }
};

// Helper function to validate the crafting pattern
function validatePattern(gridPattern: (string | null)[][], recipePattern: (string | null)[][]): boolean {
  // Check each cell in the recipe pattern
  for (let row = 0; row < recipePattern.length; row++) {
    for (let col = 0; col < recipePattern[row].length; col++) {
      const recipeItem = recipePattern[row][col];
      const gridItem = gridPattern[row][col];
      
      // If recipe expects an item but grid doesn't have it (or has wrong item)
      if (recipeItem && recipeItem !== gridItem) {
        return false;
      }
      
      // If recipe expects empty but grid has an item
      if (recipeItem === null && gridItem !== null) {
        return false;
      }
    }
  }
  
  return true;
}