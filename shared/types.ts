// Define types for item rarities in the game
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Define recipe difficulty levels
export type RecipeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Define the type for the 5x5 crafting grid pattern
export type CraftingGridPattern = Array<Array<string>>;

// Material mapping (item ID to quantity)
export interface MaterialMap {
  [itemId: string]: number;
}

// Recipe reward structure
export interface RecipeReward {
  itemId: string;
  quantity: number;
  type: 'digital' | 'physical' | 'blueprint';
  description: string;
}

// Recipe definition
export interface Recipe {
  id: string;
  name: string;
  description: string; 
  difficulty: RecipeDifficulty;
  pattern: CraftingGridPattern;
  materials: MaterialMap;
  rewards: RecipeReward[];
  unlockedAt: number; // level required to unlock
  imageUrl: string;
}

// Inventory item structure
export interface InventoryItem {
  id: string;
  quantity: number;
  lastAcquired: Date | null;
}

// Crafted item structure
export interface CraftedItem {
  id: number;
  userId: number;
  recipeId: string;
  createdAt: Date;
  status: 'pending' | 'redeemed' | 'shipped';
  trackingNumber?: string;
  redemptionCode?: string;
  shippingAddress?: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}