import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Get all available recipes for the user
router.get('/recipes', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const recipes = await storage.getAvailableCraftingRecipes(req.user!.id);
    res.status(200).json(recipes);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch recipes' });
  }
});

// Get a specific recipe by ID
router.get('/recipes/:id', isAuthenticated, async (req: Request, res: Response) => {
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
});

// Craft an item using a recipe
router.post('/craft', isAuthenticated, async (req: Request, res: Response) => {
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
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
        userId: req.user!.id,
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
      userId: req.user!.id,
      type: recipe.resultItem,
      quantity: recipe.resultQuantity,
      action: 'gained',
      source: 'crafting'
    });

    // Update user inventory
    await storage.updateUser(req.user!.id, { inventory: updatedInventory });

    // Award XP if applicable (simple for now - could be more complex later)
    const xpReward = calculateXpReward(recipe);
    if (xpReward > 0) {
      await storage.addUserXP(req.user!.id, xpReward);
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
});

// Helper function to validate that the grid pattern matches the recipe pattern
function validateGridPattern(
  gridPattern: (string | null)[][],
  recipePattern: (string | null)[][]
): boolean {
  // Both patterns should be 5x5
  if (gridPattern.length !== 5 || recipePattern.length !== 5) {
    return false;
  }

  for (let i = 0; i < 5; i++) {
    if (gridPattern[i].length !== 5 || recipePattern[i].length !== 5) {
      return false;
    }
  }

  // Check if each cell in the grid matches the required pattern
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
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
  const itemCountMultiplier = Math.min(
    2.0, // Cap at 2x multiplier
    1.0 + (Object.values(recipe.requiredItems as Record<string, number>).reduce((sum: number, val: number) => sum + val, 0) * 0.05)
  );

  return Math.round(difficultyXp * itemCountMultiplier);
}

export default router;