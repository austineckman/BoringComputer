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
  'cloth': {
    id: 'cloth',
    name: 'Synthetic Fabric',
    description: 'A lightweight, durable synthetic fabric with excellent tensile strength. Used in various crafting recipes.',
    flavorText: 'Nano-woven threads create a material stronger than steel but light as a feather.',
    rarity: 'common',
    craftingUses: ['insulation', 'wiring-protection', 'circuit-backing'],
    imagePath: '/images/resources/cloth.png'
  },
  'metal': {
    id: 'metal',
    name: 'Duranium Alloy',
    description: 'A high-strength metal alloy resistant to extreme temperatures and pressures. Commonly used in advanced engineering.',
    flavorText: 'This space-age metal blend can withstand the vacuum of space and the heat of reentry.',
    rarity: 'common',
    craftingUses: ['chassis', 'structural-support', 'heat-sink'],
    imagePath: '/images/resources/metal.png'
  },
  'tech-scrap': {
    id: 'tech-scrap',
    name: 'Tech Scrap',
    description: 'Salvaged electronic components that can be repurposed for new devices. Contains valuable rare earth elements.',
    flavorText: 'One explorer\'s junk is a crafter\'s treasure. These bits of technology hold secrets of past civilizations.',
    rarity: 'uncommon',
    craftingUses: ['microcontrollers', 'sensors', 'power-supply'],
    imagePath: '/images/resources/tech-scrap.png'
  },
  'circuit-board': {
    id: 'circuit-board',
    name: 'Quantum Circuit Board',
    description: 'Advanced circuitry capable of quantum computing operations. The foundation of most high-tech equipment.',
    flavorText: 'Microscopic superconducting pathways capable of computing in multiple dimensions simultaneously.',
    rarity: 'rare',
    craftingUses: ['processing-unit', 'memory-banks', 'communication-array'],
    imagePath: '/images/resources/circuit-board.png'
  },
  'sensor-crystal': {
    id: 'sensor-crystal',
    name: 'Resonant Crystal',
    description: 'A rare crystal with unique electromagnetic properties. Used in advanced sensing and scanning equipment.',
    flavorText: 'These crystals hum with energy, vibrating in tune with quantum fluctuations in the environment.',
    rarity: 'epic',
    craftingUses: ['signal-amplifier', 'detection-array', 'energy-focus'],
    imagePath: '/images/resources/crystal.png'
  },
  'alchemy-ink': {
    id: 'alchemy-ink',
    name: 'Luminous Ink',
    description: 'A mysterious bioluminescent substance that responds to electrical impulses. Crucial for advanced interfaces.',
    flavorText: 'Harvested from deep-sea creatures on distant worlds, this ink seems almost aware of its surroundings.',
    rarity: 'legendary',
    craftingUses: ['neural-interface', 'holographic-display', 'quantum-inscription'],
    imagePath: '/images/resources/ink.png'
  },
  'loot-crate': {
    id: 'loot-crate',
    name: 'Salvage Crate',
    description: 'A sealed container with valuable materials. Free to open and may contain various resources.',
    flavorText: 'Scattered across abandoned outposts, these crates contain treasures from fallen civilizations.',
    rarity: 'common',
    craftingUses: [],
    imagePath: '/images/resources/loot-crate.png'
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