// Define shared types that are used by both client and server

export interface ItemDetails {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  resultItem: string;
  resultQuantity: number;
  materials: { [key: string]: number };
  pattern?: (string | null)[][];
}

export interface InventoryItem {
  type: string;
  quantity: number;
  lastAcquired?: Date | null;
}

export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';