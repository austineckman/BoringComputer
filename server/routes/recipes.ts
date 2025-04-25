import { Router } from 'express';
import { authenticate } from '../auth';

const router = Router();

// Dummy recipes for testing until we implement proper recipe database
const recipeData = [
  {
    id: "circuit-board",
    name: "Basic Circuit Board",
    description: "A foundation for any electronics project",
    output: {
      itemId: "circuit-board",
      quantity: 1
    },
    inputs: [
      {
        itemId: "copper",
        quantity: 2,
        position: [0, 0]
      },
      {
        itemId: "crystal",
        quantity: 1,
        position: [0, 1]
      }
    ],
    category: "electronics"
  },
  {
    id: "basic-wand",
    name: "Apprentice's Wand",
    description: "A beginner's magical implement",
    output: {
      itemId: "basic-wand",
      quantity: 1
    },
    inputs: [
      {
        itemId: "wood",
        quantity: 1,
        position: [0, 0]
      },
      {
        itemId: "crystal",
        quantity: 1,
        position: [1, 1]
      }
    ],
    category: "magic"
  },
  {
    id: "energy-potion",
    name: "Energy Potion",
    description: "Restores stamina during adventures",
    output: {
      itemId: "energy-potion",
      quantity: 3
    },
    inputs: [
      {
        itemId: "herb",
        quantity: 2,
        position: [0, 0]
      },
      {
        itemId: "crystal",
        quantity: 1,
        position: [0, 1]
      },
      {
        itemId: "water",
        quantity: 1,
        position: [1, 0]
      }
    ],
    category: "consumables"
  }
];

// Get all recipes
router.get('/', authenticate, (req, res) => {
  res.json(recipeData);
});

// Get recipes by category
router.get('/category/:category', authenticate, (req, res) => {
  const { category } = req.params;
  const filteredRecipes = recipeData.filter(recipe => recipe.category === category);
  res.json(filteredRecipes);
});

// Get a specific recipe
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const recipe = recipeData.find(r => r.id === id);
  
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  res.json(recipe);
});

// Craft an item
router.post('/craft', authenticate, (req, res) => {
  const { recipeId } = req.body;
  
  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }
  
  const recipe = recipeData.find(r => r.id === recipeId);
  
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  // In a real implementation, we would:
  // 1. Check if the user has the required items
  // 2. Remove the input items from their inventory
  // 3. Add the output item to their inventory
  
  // For now, we'll just simulate success
  
  // Dummy response for testing
  res.json({
    success: true,
    message: `Successfully crafted ${recipe.name}`,
    itemId: recipe.output.itemId,
    quantity: recipe.output.quantity
  });
});

export default router;