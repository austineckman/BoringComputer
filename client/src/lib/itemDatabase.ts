// This is a client-side utility for consistent item metadata
// It parallels the server-side itemDatabase.ts with client-specific functionality

import { ItemDetails } from '../../shared/types';

// Define the client-side item database
const items: Record<string, ItemDetails> = {
  "cloth": {
    id: "cloth",
    name: "Space Cloth",
    description: "A lightweight and durable synthetic fabric developed for space travel.",
    flavorText: "Soft yet sturdy, it's rumored to be made from recycled starlight.",
    rarity: "common",
    craftingUses: ["clothing", "wiring", "padding"],
    imagePath: "/assets/cloth.png"
  },
  "copper": {
    id: "copper",
    name: "Cosmic Copper",
    description: "Highly conductive copper with unique properties from space exposure.",
    flavorText: "This copper has seen things you wouldn't believe. It conducts more than just electricity...",
    rarity: "common",
    craftingUses: ["circuits", "wiring", "tools"],
    imagePath: "/assets/copper.png"
  },
  "crystal": {
    id: "crystal",
    name: "Nebula Crystal",
    description: "A rare crystal formation with unusual energy properties.",
    flavorText: "It hums with the resonance of distant stars.",
    rarity: "rare",
    craftingUses: ["energy", "focusing", "decoration"],
    imagePath: "/assets/crystal.png"
  },
  "techscrap": {
    id: "techscrap",
    name: "Tech Scrap",
    description: "Salvaged components from various technological devices.",
    flavorText: "One explorer's trash is another's treasure trove of innovation.",
    rarity: "uncommon",
    craftingUses: ["repairs", "crafting", "upgrades"],
    imagePath: "/assets/techscrap.png"
  },
  "loot-crate": {
    id: "loot-crate",
    name: "Mystery Loot Crate",
    description: "A sealed container with unknown valuable contents inside.",
    flavorText: "What wonders or oddities might be waiting inside? Only one way to find out!",
    rarity: "uncommon",
    craftingUses: ["opening"],
    imagePath: "/assets/loot crate.png"
  },
  "ink": {
    id: "ink",
    name: "Cosmic Ink",
    description: "A strange fluid that responds to electrical signals.",
    flavorText: "The deepest black you've ever seen, like a portable piece of space itself.",
    rarity: "rare",
    craftingUses: ["writing", "drawing", "coding"],
    imagePath: "/assets/ink.png"
  },
  "ciruit-board": {
    id: "circuit-board",
    name: "Quantum Circuit Board",
    description: "An advanced circuit board capable of complex computational operations.",
    flavorText: "It seems to compute answers before you even ask the question.",
    rarity: "epic",
    craftingUses: ["computing", "automation", "communication"],
    imagePath: "/assets/circuit board.png"
  },
  // Add more items as needed
};

// Cache for rarity classes to avoid recalculating
const rarityClassesCache: Record<string, string> = {
  "common": "bg-gray-200 text-gray-800 border-gray-300",
  "uncommon": "bg-green-100 text-green-800 border-green-300",
  "rare": "bg-blue-100 text-blue-800 border-blue-300",
  "epic": "bg-purple-100 text-purple-800 border-purple-300",
  "legendary": "bg-yellow-100 text-yellow-800 border-yellow-300"
};

/**
 * Get detailed information about an item by its ID
 * @param itemId The ID of the item to look up
 * @returns The item details or a default placeholder if not found
 */
export function getItemDetails(itemId: string): ItemDetails {
  if (items[itemId]) {
    return items[itemId];
  }
  
  // If the item is not in our database, return a placeholder
  return {
    id: itemId,
    name: formatItemName(itemId),
    description: "No description available.",
    flavorText: "This item is shrouded in mystery.",
    rarity: "common",
    craftingUses: [],
    imagePath: `/assets/${itemId}.png` // Attempt to use a convention-based path
  };
}

/**
 * Get CSS classes for styling based on item rarity
 * @param rarity The rarity level of the item
 * @returns CSS classes string for the specified rarity
 */
export function getRarityClasses(rarity: string): string {
  return rarityClassesCache[rarity] || rarityClassesCache.common;
}

/**
 * Format an item ID into a more readable name
 * @param itemId The raw item ID
 * @returns A formatted, human-readable name
 */
function formatItemName(itemId: string): string {
  return itemId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all items in the database
 * @returns An array of all item details
 */
export function getAllItems(): ItemDetails[] {
  return Object.values(items);
}

/**
 * Add a new item to the client-side database (useful for dynamic updates)
 * @param item The item details to add
 */
export function addItem(item: ItemDetails): void {
  items[item.id] = item;
}

export default {
  getItemDetails,
  getRarityClasses,
  getAllItems,
  addItem
};