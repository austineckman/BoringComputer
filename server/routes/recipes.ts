import { Router } from 'express';
import { authenticate } from '../auth';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { craftingRecipes } from '@shared/schema';

const router = Router();

// Get all recipes
router.get('/', authenticate, async (req, res) => {
  try {
    const recipeData = await db.select().from(craftingRecipes);
    res.json(recipeData);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get recipes by category
router.get('/category/:category', authenticate, async (req, res) => {
  try {
    const { category } = req.params;
    const filteredRecipes = await db.select().from(craftingRecipes).where(eq(craftingRecipes.category, category));
    res.json(filteredRecipes);
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get a specific recipe
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);
    
    if (isNaN(recipeId)) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    
    const recipe = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, recipeId)).limit(1);
    
    if (!recipe || recipe.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe[0]);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Craft an item
router.post('/craft', authenticate, async (req, res) => {
  try {
    const { recipeId, gridPattern } = req.body;
    const user = req.user;
    
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }
    
    // Get the recipe from the database
    const recipeResult = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, recipeId)).limit(1);
    
    if (!recipeResult || recipeResult.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const recipe = recipeResult[0];
    
    // TODO: Implement real crafting logic
    // 1. Validate the grid pattern against the recipe pattern
    // 2. Check if the user has the required items in inventory
    // 3. Remove the input items from their inventory
    // 4. Add the output item to their inventory
    // 5. Update user experience/level if needed
    
    // For now, return success with the crafted item
    res.json({
      success: true,
      message: `Successfully crafted ${recipe.name}`,
      resultItem: recipe.resultItem,
      resultQuantity: recipe.resultQuantity || 1
    });
  } catch (error) {
    console.error('Error crafting item:', error);
    res.status(500).json({ error: 'Failed to craft item' });
  }
});

export default router;