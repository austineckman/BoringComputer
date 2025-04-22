// This is a client-side mirror of the server-side itemDatabase for convenience
export interface ItemDetails {
  id: string;
  name: string; 
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
}

export const itemDatabase: Record<string, ItemDetails> = {
  'cloth': {
    id: 'cloth',
    name: 'Synthetic Cloth',
    description: 'A durable synthetic fabric with heat-resistant properties.',
    flavorText: 'Surprisingly comfortable, despite being made from recycled space suits.',
    rarity: 'common',
    craftingUses: ['clothing', 'insulation', 'filters'],
    imagePath: '/assets/cloth.png'
  },
  'copper': {
    id: 'copper',
    name: 'Copper Wire',
    description: 'Conductive material essential for electrical systems.',
    flavorText: 'The lifeblood of any electrical circuit. Handle with care!',
    rarity: 'common',
    craftingUses: ['circuits', 'sensors', 'communication'],
    imagePath: '/assets/copper.png'
  },
  'crystal': {
    id: 'crystal',
    name: 'Power Crystal',
    description: 'Energy-dense crystal capable of storing enormous charge.',
    flavorText: 'Glows with an inner light that seems alive. Warm to the touch.',
    rarity: 'rare',
    craftingUses: ['power sources', 'weapon systems', 'advanced tech'],
    imagePath: '/assets/crystal.png'
  },
  'techscrap': {
    id: 'techscrap',
    name: 'Technical Scrap',
    description: 'Salvaged electronic components with various uses.',
    flavorText: 'One person\'s trash is another person\'s tech breakthrough.',
    rarity: 'uncommon',
    craftingUses: ['repairs', 'improvised tools', 'upgrades'],
    imagePath: '/assets/techscrap.png'
  },
  'ink': {
    id: 'ink',
    name: 'Conductive Ink',
    description: 'Specialized ink that can transmit electrical signals.',
    flavorText: 'Makes circuit drawing an art form. Literally.',
    rarity: 'uncommon',
    craftingUses: ['printed circuits', 'flexible electronics', 'rapid prototyping'],
    imagePath: '/assets/ink.png'
  },
  'loot-crate': {
    id: 'loot-crate',
    name: 'Loot Crate',
    description: 'A mysterious container with unknown contents.',
    flavorText: 'The anticipation of opening is almost as rewarding as the contents. Almost.',
    rarity: 'uncommon',
    craftingUses: ['rewards', 'surprises', 'resources'],
    imagePath: '/assets/loot crate.png'
  }
};

// Helper function to get item details by ID
export function getItemDetails(itemId: string): ItemDetails {
  const item = itemDatabase[itemId];
  if (!item) {
    // Return a placeholder if item not found
    return {
      id: itemId,
      name: itemId.charAt(0).toUpperCase() + itemId.slice(1),
      description: 'Unknown item',
      flavorText: 'Mysterious and undocumented',
      rarity: 'common',
      craftingUses: [],
      imagePath: `/items/${itemId}.png`
    };
  }
  return item;
}