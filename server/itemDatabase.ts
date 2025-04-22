// Centralized item database for the server
// This mirrors the client-side itemDatabase.ts to ensure consistency

export interface ItemDetails {
  id: string;
  name: string; 
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string; // Optional category for filtering
}

// Create a mutable database that can be modified at runtime by admin operations
export let itemDatabase: Record<string, ItemDetails> = {
  'copper': {
    id: 'copper',
    name: 'Copper',
    description: 'A conductive metal used in basic circuits and components.',
    flavorText: 'The foundation of all electronics. Shiny and malleable.',
    rarity: 'common',
    craftingUses: ['circuits', 'wiring', 'conductors'],
    imagePath: '/assets/copper.png'
  },
  'cloth': {
    id: 'cloth',
    name: 'Cloth',
    description: 'Soft fabric material used for insulation and wrapping.',
    flavorText: 'Carefully woven threads create a versatile material.',
    rarity: 'common',
    craftingUses: ['insulation', 'wrapping', 'padding'],
    imagePath: '/assets/cloth.png'
  },
  'crystal': {
    id: 'crystal',
    name: 'Crystal',
    description: 'A rare energy-focusing crystal with unique properties.',
    flavorText: 'It hums with an inner energy when held up to the light.',
    rarity: 'rare',
    craftingUses: ['energy', 'focusing', 'amplification'],
    imagePath: '/assets/crystal.png'
  },
  'techscrap': {
    id: 'techscrap',
    name: 'Tech Scrap',
    description: 'Salvaged remnants of advanced technology.',
    flavorText: 'One machine\'s trash is an inventor\'s treasure.',
    rarity: 'uncommon',
    craftingUses: ['recycling', 'components', 'rare materials'],
    imagePath: '/assets/techscrap.png'
  },
  'circuit-board': {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'The foundation of electronic devices.',
    flavorText: 'A maze of pathways for electricity to travel.',
    rarity: 'uncommon',
    craftingUses: ['electronics', 'computers', 'devices'],
    imagePath: '/assets/circuit board.png'
  },
  'loot-crate': {
    id: 'loot-crate',
    name: 'Loot Crate',
    description: 'A mysterious box containing random resources.',
    flavorText: 'What treasures await inside?',
    rarity: 'common',
    craftingUses: [],
    imagePath: '/assets/loot crate.png'
  }
};

export function getItemDetails(itemId: string): ItemDetails {
  // Return the item details or a default if the item doesn't exist
  return itemDatabase[itemId] || {
    id: itemId,
    name: itemId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description: 'No description available.',
    flavorText: 'A mysterious item.',
    rarity: 'common',
    craftingUses: [],
    imagePath: '/images/resources/placeholder.png'
  };
}

// Add an item to the database (create or update)
export function addOrUpdateItem(item: ItemDetails): ItemDetails {
  if (!item.id) {
    throw new Error('Item ID is required');
  }
  
  // Store the item in the database
  itemDatabase[item.id] = {
    ...item,
    // Ensure all required fields are present
    craftingUses: item.craftingUses || [],
    // Convert any non-array craftingUses to array format
    ...(item.craftingUses && !Array.isArray(item.craftingUses) 
        ? { craftingUses: String(item.craftingUses).split(',').map(s => s.trim()) } 
        : {})
  };
  
  return itemDatabase[item.id];
}

// Remove an item from the database
export function removeItem(itemId: string): boolean {
  if (!itemDatabase[itemId]) {
    return false;
  }
  
  delete itemDatabase[itemId];
  return true;
}

// Get all items in the database
export function getAllItems(): ItemDetails[] {
  return Object.values(itemDatabase);
}

// Get items by rarity
export function getItemsByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): ItemDetails[] {
  return Object.values(itemDatabase).filter(item => item.rarity === rarity);
}

// Get items by category
export function getItemsByCategory(category: string): ItemDetails[] {
  return Object.values(itemDatabase).filter(item => item.category === category);
}