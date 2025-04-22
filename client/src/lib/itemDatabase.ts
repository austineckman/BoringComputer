import { ItemRarity } from '@/../../shared/types';

// Import item images
import copperImage from '@assets/copper.png';
import clothImage from '@assets/cloth.png';
import crystalImage from '@assets/crystal.png';
import techscrapImage from '@assets/techscrap.png';
import circuitBoardImage from '@assets/circuit board.png';
import lootCrateImage from '@assets/loot crate.png';

export interface ItemDetails {
  id: string;
  name: string; 
  description: string;
  flavorText: string;
  rarity: ItemRarity;
  craftingUses: string[];
  imagePath: string;
}

// Item database with all available items in the game
export const itemDatabase: Record<string, ItemDetails> = {
  'copper': {
    id: 'copper',
    name: 'Copper',
    description: 'A conductive metal used in basic circuits and components.',
    flavorText: 'The foundation of all electronics. Shiny and malleable.',
    rarity: 'common',
    craftingUses: ['circuits', 'wiring', 'conductors'],
    imagePath: copperImage
  },
  'cloth': {
    id: 'cloth',
    name: 'Cloth',
    description: 'Soft fabric material used for insulation and wrapping.',
    flavorText: 'Carefully woven threads create a versatile material.',
    rarity: 'common',
    craftingUses: ['insulation', 'wrapping', 'padding'],
    imagePath: clothImage
  },
  'crystal': {
    id: 'crystal',
    name: 'Crystal',
    description: 'A rare energy-focusing crystal with unique properties.',
    flavorText: 'It hums with an inner energy when held up to the light.',
    rarity: 'rare',
    craftingUses: ['energy', 'focusing', 'amplification'],
    imagePath: crystalImage
  },
  'techscrap': {
    id: 'techscrap',
    name: 'Tech Scrap',
    description: 'Salvaged remnants of advanced technology.',
    flavorText: 'One machine\'s trash is an inventor\'s treasure.',
    rarity: 'uncommon',
    craftingUses: ['recycling', 'components', 'rare materials'],
    imagePath: techscrapImage
  },
  'circuit-board': {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'The foundation of electronic devices.',
    flavorText: 'A maze of pathways for electricity to travel.',
    rarity: 'uncommon',
    craftingUses: ['electronics', 'computers', 'devices'],
    imagePath: circuitBoardImage
  },
  'loot-crate': {
    id: 'loot-crate',
    name: 'Loot Crate',
    description: 'A mysterious box containing random resources.',
    flavorText: 'What treasures await inside?',
    rarity: 'common',
    craftingUses: [],
    imagePath: lootCrateImage
  }
};

// Get item details by ID with fallback
export function getItemDetails(itemId: string): ItemDetails {
  if (itemDatabase[itemId]) {
    return itemDatabase[itemId];
  }
  
  // Fallback for items not found in the database
  return {
    id: itemId,
    name: itemId.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
    description: 'Unknown item',
    flavorText: '',
    rarity: 'common',
    craftingUses: [],
    imagePath: '/images/items/placeholder.png'
  };
}

// Get all items from the database
export function getAllItems(): ItemDetails[] {
  return Object.values(itemDatabase);
}

// Get items by rarity
export function getItemsByRarity(rarity: ItemRarity): ItemDetails[] {
  return Object.values(itemDatabase).filter(item => item.rarity === rarity);
}

// Get items by crafting use
export function getItemsByCraftingUse(use: string): ItemDetails[] {
  return Object.values(itemDatabase).filter(item => item.craftingUses.includes(use));
}