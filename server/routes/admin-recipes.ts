import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCraftingRecipeSchema } from '@shared/schema';
import { db } from '../db';
import { craftingRecipes } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '../middleware/auth';

const router = express.Router();

// Create a zod validation schema for recipe creation
const recipeSchema = insertCraftingRecipeSchema.extend({
  // Pattern is a 2D array representing required items in each position
  pattern: z.array(z.array(z.string().nullable())),
  // Dictionary of items required with quantities
  requiredItems: z.record(z.string(), z.number().positive()),
});

// Get all recipes (admin only)
router.get('/', isAdmin, async (_req: Request, res: Response) => {
  try {
    const recipes = await storage.getCraftingRecipes();
    res.status(200).json(recipes);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch recipes' });
  }
});

// Get a recipe by ID (admin only)
router.get('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const recipe = await storage.getCraftingRecipe(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json(recipe);
  } catch (error: any) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch recipe' });
  }
});

// Create a new recipe (admin only)
router.post('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = recipeSchema.parse(req.body);
    
    const newRecipe = await storage.createCraftingRecipe(validatedData);
    
    res.status(201).json(newRecipe);
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Invalid recipe data', errors: error.errors });
    }
    res.status(500).json({ message: error.message || 'Failed to create recipe' });
  }
});

// Update a recipe (admin only)
router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    const validatedData = recipeSchema.partial().parse(req.body);
    
    const updatedRecipe = await storage.updateCraftingRecipe(id, validatedData);
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
});

// Delete a recipe (admin only)
router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid recipe ID' });
    }

    // Check if recipe exists
    const recipe = await storage.getCraftingRecipe(id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Delete the recipe
    const deleted = await db.delete(craftingRecipes).where(eq(craftingRecipes.id, id)).returning();
    
    res.status(200).json({ message: 'Recipe deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: error.message || 'Failed to delete recipe' });
  }
});

export default router;