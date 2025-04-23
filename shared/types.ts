export interface Recipe {
  id: string;
  name: string;
  description: string;
  resultItem: string;
  resultQuantity: number;
  pattern: (string | null)[][];
  requiredItems: Record<string, number>;
  difficulty: string; // Allow for string enum values like 'beginner', 'intermediate', etc.
  category: string;
  unlocked: boolean;
  heroImage?: string; // URL to the hero image
  image?: string; // URL to the recipe image 
  rewards?: RecipeReward[]; // Rewards for crafting this recipe
}

export interface RecipeReward {
  itemId: string;
  quantity: number;
  type?: string;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';