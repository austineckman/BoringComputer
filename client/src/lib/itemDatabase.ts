import { ItemRarity } from '@/../../shared/types';
import { useQuery } from '@tanstack/react-query';

// Import fallback item images (used only if server items aren't loaded yet)
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
  category?: string;
  usageDescription?: string;
  isEquippable?: boolean;
  equipSlot?: 'head' | 'torso' | 'legs' | 'hands' | 'accessory';
}

// Fallback item database with basic items (used only when server items aren't loaded yet)
const fallbackItemDatabase: Record<string, ItemDetails> = {
  'copper': {
    id: 'copper',
    name: 'Copper',
    description: 'A conductive metal used in basic circuits and components.',
    flavorText: 'The foundation of all electronics. Shiny and malleable.',
    rarity: 'common',
    craftingUses: ['circuits', 'wiring', 'conductors'],
    imagePath: copperImage,
    usageDescription: 'Used to craft electronic components and conductive wiring for advanced technology.'
  },
  'cloth': {
    id: 'cloth',
    name: 'Cloth',
    description: 'Soft fabric material used for insulation and wrapping.',
    flavorText: 'Carefully woven threads create a versatile material.',
    rarity: 'common',
    craftingUses: ['insulation', 'wrapping', 'padding'],
    imagePath: clothImage,
    usageDescription: 'Essential for crafting armor padding, insulation, and protective gear against extreme environments.'
  },
  'crystal': {
    id: 'crystal',
    name: 'Crystal',
    description: 'A rare energy-focusing crystal with unique properties.',
    flavorText: 'It hums with an inner energy when held up to the light.',
    rarity: 'rare',
    craftingUses: ['energy', 'focusing', 'amplification'],
    imagePath: crystalImage,
    usageDescription: 'High-value material used in advanced energy weapons and magical artifacts requiring energy amplification.'
  },
  'techscrap': {
    id: 'techscrap',
    name: 'Tech Scrap',
    description: 'Salvaged remnants of advanced technology.',
    flavorText: 'One machine\'s trash is an inventor\'s treasure.',
    rarity: 'uncommon',
    craftingUses: ['recycling', 'components', 'rare materials'],
    imagePath: techscrapImage,
    usageDescription: 'Can be broken down to extract rare components or used directly in crafting improvised devices.'
  },
  'circuit-board': {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'The foundation of electronic devices.',
    flavorText: 'A maze of pathways for electricity to travel.',
    rarity: 'uncommon',
    craftingUses: ['electronics', 'computers', 'devices'],
    imagePath: circuitBoardImage,
    usageDescription: 'Essential component for all advanced technological crafting recipes and equipment upgrades.'
  },
  'loot-crate': {
    id: 'loot-crate',
    name: 'Loot Crate',
    description: 'A mysterious box containing random resources.',
    flavorText: 'What treasures await inside?',
    rarity: 'common',
    craftingUses: [],
    imagePath: lootCrateImage,
    usageDescription: 'Open this crate to receive random resources and materials based on its rarity level.'
  }
};

// Global itemDatabase that will be populated from server
let itemDatabase: Record<string, ItemDetails> = { ...fallbackItemDatabase };

// Function to initialize the item database from server
export async function initializeItemDatabase(): Promise<void> {
  try {
    const response = await fetch('/api/admin/items');
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    
    const items: ItemDetails[] = await response.json();
    
    // Convert array to record for quick lookups
    const itemMap: Record<string, ItemDetails> = {};
    items.forEach(item => {
      itemMap[item.id] = item;
    });
    
    // Update the global item database
    itemDatabase = itemMap;
    
    console.log('Item database loaded from server:', Object.keys(itemDatabase).length, 'items');
  } catch (error) {
    console.error('Error loading item database from server:', error);
    // Keep using the fallback database if there's an error
  }
}

// Initialize the database on module load
initializeItemDatabase();

// Custom hook to work with React components
export function useItemDatabase() {
  const { data: items = [] } = useQuery<ItemDetails[]>({
    queryKey: ['/api/admin/items'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Update the item database when items are fetched
  if (items.length > 0) {
    const itemMap: Record<string, ItemDetails> = {};
    items.forEach(item => {
      itemMap[item.id] = item;
    });
    itemDatabase = itemMap;
  }
  
  return {
    items,
    getItemDetails,
    getAllItems,
    getItemsByRarity,
    getItemsByCraftingUse
  };
}

// Get item details by ID with fallback
export function getItemDetails(itemId: string): ItemDetails {
  if (itemDatabase[itemId]) {
    return itemDatabase[itemId];
  }
  
  // Check fallback database if not in the main database
  if (fallbackItemDatabase[itemId]) {
    return fallbackItemDatabase[itemId];
  }
  
  // Fallback for items not found in either database
  return {
    id: itemId,
    name: itemId.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
    description: 'Unknown item',
    flavorText: 'A mysterious item with unknown properties.',
    rarity: 'common',
    craftingUses: [],
    imagePath: '/images/items/placeholder.png',
    usageDescription: 'This item can be used in crafting recipes or traded with other players.'
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