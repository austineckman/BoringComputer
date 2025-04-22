// itemDatabase.ts - Central repository for all item information
// This ensures consistent naming and descriptions across the application

export interface ItemDetail {
  id: string;         // Internal ID matching database record
  name: string;       // Display name shown in UI
  type: string;       // Item type (matches API values)
  flavorText: string; // Flavor/lore description
  usageDescription: string; // How the item is used in crafting/gameplay
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; // Rarity for visual styling
  stackable: boolean; // Whether the item can stack in inventory
  category: 'material' | 'loot-box' | 'crafted-item' | 'consumable'; // Item category for filtering
}

// Main item database
export const itemDatabase: Record<string, ItemDetail> = {
  'cloth': {
    id: 'cloth',
    name: 'Astral Cloth',
    type: 'cloth',
    flavorText: 'Shimmering fabric woven from starlight and cosmic dust. It feels cool to the touch yet radiates a gentle warmth.',
    usageDescription: 'Used in crafting armor, bandages, and enchanted gear. Highly sought after by wizards for its magical conductivity.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  },
  'copper': {
    id: 'copper',
    name: 'Copper Ingot',
    type: 'copper',
    flavorText: 'Gleaming with a warm reddish glow, these ingots were mined from the heart of Cogsworth\'s mechanical mountains.',
    usageDescription: 'Essential component for basic circuitry, wiring, and foundational machine parts in Gizbo\'s workshop.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  },
  'crystal': {
    id: 'crystal',
    name: 'Prismatic Crystal',
    type: 'crystal',
    flavorText: 'Faceted gems that capture and refract light in impossible patterns. Some say they contain fragments of frozen time.',
    usageDescription: 'Powers high-end devices and serves as energy storage. Can be refined into sensor arrays or focusing lenses.',
    rarity: 'uncommon',
    stackable: true,
    category: 'material'
  },
  'tech-scrap': {
    id: 'tech-scrap',
    name: 'Tech Scrap',
    type: 'tech-scrap',
    flavorText: 'Salvaged components from abandoned machinery. Each piece tells a story of innovation and obsolescence.',
    usageDescription: 'Gizbo\'s favorite material for prototype building. Can be broken down or reassembled into various gadget parts.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  },
  'techscrap': {
    id: 'techscrap',
    name: 'Tech Scrap',
    type: 'techscrap',
    flavorText: 'Salvaged components from abandoned machinery. Each piece tells a story of innovation and obsolescence.',
    usageDescription: 'Gizbo\'s favorite material for prototype building. Can be broken down or reassembled into various gadget parts.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  },
  'metal': {
    id: 'metal',
    name: 'Reinforced Metal',
    type: 'metal',
    flavorText: 'Alloyed plates with an unusually high tensile strength. Surprisingly lightweight despite their durability.',
    usageDescription: 'Structural component for advanced machinery and weapons. Forms the backbone of Gizbo\'s most impressive creations.',
    rarity: 'uncommon',
    stackable: true,
    category: 'material'
  },
  'circuit-board': {
    id: 'circuit-board',
    name: 'Logic Circuit',
    type: 'circuit-board',
    flavorText: 'Intricate pathways etched into synthetic substrate, pulsing with electrical potential.',
    usageDescription: 'The brain of any complex machine. Can be programmed for various functions from simple automation to AI capabilities.',
    rarity: 'uncommon',
    stackable: true,
    category: 'material'
  },
  'wire': {
    id: 'wire',
    name: 'Conductive Wire',
    type: 'wire',
    flavorText: 'Spools of impossibly thin metal filament that seem to hum with anticipation when uncoiled.',
    usageDescription: 'Connects components and transmits power or data. Essential for any electrical system Gizbo designs.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  },
  'gear': {
    id: 'gear',
    name: 'Precision Gears',
    type: 'gear',
    flavorText: 'Perfectly toothed wheels that mesh together with satisfying clicks. Each one is calibrated to micrometer precision.',
    usageDescription: 'Mechanical components for clockwork devices. Gizbo insists these never go out of style despite newer technologies.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  },
  'battery': {
    id: 'battery',
    name: 'Power Cell',
    type: 'battery',
    flavorText: 'Compact energy storage that emits a faint blue glow. Warm to the touch and occasionally makes soft chirping noises.',
    usageDescription: 'Portable power source for gadgets and gizmos. Can be overcharged for explosive results (not recommended by Gizbo).',
    rarity: 'uncommon',
    stackable: true,
    category: 'material'
  },
  'microchip': {
    id: 'microchip',
    name: 'Neural Processor',
    type: 'microchip',
    flavorText: 'Microscopic architecture denser than a city skyline, etched onto a sliver of material no larger than a fingernail.',
    usageDescription: 'The cutting edge of computational technology. Enables advanced features in Gizbo\'s most ambitious projects.',
    rarity: 'rare',
    stackable: true,
    category: 'material'
  },
  'ink': {
    id: 'ink',
    name: 'Luminous Ink',
    type: 'ink',
    flavorText: 'A vibrant orange liquid that seems to glow from within. It shifts and moves as if alive, even when the vial is still.',
    usageDescription: 'Used for inscribing magical circuits and encoding advanced programming. Essential for documenting blueprints and schematics.',
    rarity: 'uncommon',
    stackable: true,
    category: 'material'
  },
  'loot-crate': {
    id: 'loot-crate',
    name: 'Adventure Loot Crate',
    type: 'loot-crate',
    flavorText: 'A mysterious container covered in arcane symbols. Something valuable rattles inside when you shake it.',
    usageDescription: 'Contains random materials salvaged from adventure sites. Free to open and always yields useful components.',
    rarity: 'common',
    stackable: true,
    category: 'loot-box'
  },
  'common-loot-box': {
    id: 'common-loot-box',
    name: 'Common Loot Crate',
    type: 'common-loot-box',
    flavorText: 'A standard container with various salvaged materials from your adventures. Worth checking out.',
    usageDescription: 'Contains a small assortment of common crafting materials. Free to open with a chance for uncommon materials.',
    rarity: 'common',
    stackable: true,
    category: 'loot-box'
  },
  'rare-loot-box': {
    id: 'rare-loot-box',
    name: 'Rare Loot Crate',
    type: 'rare-loot-box',
    flavorText: 'A sturdy container with interesting markings. Seems to contain more valuable materials than usual.',
    usageDescription: 'Contains a mix of common and uncommon crafting materials with a chance for rare components.',
    rarity: 'rare',
    stackable: true,
    category: 'loot-box'
  },
  'epic-loot-box': {
    id: 'epic-loot-box',
    name: 'Epic Loot Crate',
    type: 'epic-loot-box',
    flavorText: 'An ornate container with glowing symbols that shift and change. Something powerful awaits inside.',
    usageDescription: 'Guaranteed to contain uncommon and rare materials with a chance for epic components.',
    rarity: 'epic',
    stackable: true,
    category: 'loot-box'
  }
};

// Helper function to get item details with fallback for unknown items
export function getItemDetails(itemType: string): ItemDetail {
  // Try to find the item in our database
  const normalizedType = itemType.toLowerCase().trim();
  
  if (normalizedType in itemDatabase) {
    return itemDatabase[normalizedType];
  }
  
  // If it's a loot box with a prefix (e.g. "common-loot-box")
  if (normalizedType.endsWith('-loot-box') || normalizedType.includes('loot')) {
    // Try to parse out rarity if present
    const parts = normalizedType.split('-');
    let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common';
    
    if (parts.length > 1 && ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(parts[0])) {
      rarity = parts[0] as any;
    }
    
    // Default loot box details
    return {
      id: normalizedType,
      name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Loot Crate`,
      type: normalizedType,
      flavorText: 'A container filled with adventure supplies and crafting materials. Shake it to hear items rattling inside.',
      usageDescription: 'Contains random materials you can use for crafting. Free to open!',
      rarity: rarity,
      stackable: true,
      category: 'loot-box'
    };
  }
  
  // Default fallback for any unknown item
  return {
    id: normalizedType,
    name: normalizedType.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
    type: normalizedType,
    flavorText: 'A mysterious material with untapped potential. Gizbo seems very interested in studying it further.',
    usageDescription: 'Can be used in various experimental crafting projects. Gizbo is still discovering its applications.',
    rarity: 'common',
    stackable: true,
    category: 'material'
  };
}

// Helper function to get style classes based on item rarity
export function getRarityClasses(rarity: string): {
  border: string;
  bg: string;
  text: string;
  pulseAnimation: string;
} {
  switch (rarity) {
    case 'legendary':
      return {
        border: 'border-amber-400',
        bg: 'bg-amber-900/20',
        text: 'text-amber-400',
        pulseAnimation: 'bg-legendary-pulse'
      };
    case 'epic':
      return {
        border: 'border-purple-400',
        bg: 'bg-purple-900/20',
        text: 'text-purple-400',
        pulseAnimation: 'bg-epic-pulse'
      };
    case 'rare':
      return {
        border: 'border-blue-400',
        bg: 'bg-blue-900/20',
        text: 'text-blue-400',
        pulseAnimation: 'bg-rare-pulse'
      };
    case 'uncommon':
      return {
        border: 'border-green-400',
        bg: 'bg-green-900/20',
        text: 'text-green-400',
        pulseAnimation: 'bg-uncommon-pulse'
      };
    case 'common':
    default:
      return {
        border: 'border-gray-400',
        bg: 'bg-gray-900/20',
        text: 'text-gray-200',
        pulseAnimation: 'bg-common-pulse'
      };
  }
}