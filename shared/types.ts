/**
 * Shared type definitions for the crafting system
 */

// Item rarity levels
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Recipe difficulty levels
export type RecipeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Basic crafting grid type
export type CraftingGridPattern = Array<Array<string>>;

// Recipe materials map
export interface MaterialMap {
  [itemId: string]: number; // item ID to quantity mapping
}

// Recipe reward type
export interface RecipeReward {
  itemId: string;
  quantity: number;
  type: 'digital' | 'physical' | 'blueprint';
  description: string;
}

// Complete recipe type
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

// Inventory item with metadata
export interface InventoryItem {
  id: string;
  quantity: number;
  lastAcquired: Date | null;
}

// Crafted item result
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