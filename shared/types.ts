// Types for the crafting system

/**
 * Recipe interface that defines the structure of a crafting recipe
 */
export interface Recipe {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number; // Level required to unlock this recipe
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Materials required for crafting (item ID and quantity needed)
  materials: Record<string, number>;
  
  // The pattern is a 2D grid of item IDs or empty strings for empty cells
  pattern: string[][];
  
  // Rewards for successfully crafting the recipe
  rewards: RecipeReward[];
}

/**
 * Reward received for successfully crafting a recipe
 */
export interface RecipeReward {
  id?: string;
  itemId: string;
  quantity: number;
  type: 'item' | 'resource' | 'blueprint' | 'xp';
}

/**
 * Information about a crafting pattern match
 */
export interface PatternMatch {
  matches: boolean;
  recipeId: string | null;
  matchedCells: { row: number; col: number }[];
}

/**
 * Result of a crafting operation
 */
export interface CraftingResult {
  success: boolean;
  message: string;
  recipe: Recipe | null;
  rewards: RecipeReward[];
}