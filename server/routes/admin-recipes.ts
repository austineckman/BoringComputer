import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCraftingRecipeSchema } from '@shared/schema';
import { isAdmin } from '../middleware/auth';

const router = express.Router();

// Get all recipes (admin version - shows all, even locked ones)
router.get('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const recipes = await storage.getCraftingRecipes();
    res.status(200).json(recipes);
  } catch (error: any) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch recipes' });
  }
});

// Get a specific recipe by ID (admin version - no unlock check)
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

// Create a new recipe
router.post('/', isAdmin, async (req: Request, res: Response) => {
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
});

// Update an existing recipe
router.patch('/:id', isAdmin, async (req: Request, res: Response) => {
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
});

// Delete a recipe
router.delete('/:id', isAdmin, async (req: Request, res: Response) => {
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
});

export default router;