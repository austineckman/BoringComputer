// Import the pixel art images
import clothImg from '../assets/cloth.png';
import copperImg from '../assets/copper.png';
import crystalImg from '../assets/crystal.png';
import techscrapImg from '../assets/techscrap.png';
import lootCrateImg from '../assets/loot-crate.png';
import circuitBoardImg from '@assets/circuit board.png';
import inkImg from '@assets/ink.png';
import gizboImg from '@assets/gizbo.png';  // Optional character image for future use

// Import the item database
import { getItemDetails } from './itemDatabase';

// Type definition for our resource images
export interface ResourceImage {
  src: string;
  alt: string;
}

// Map of resource types to their corresponding images
export const resourceImages: Record<string, ResourceImage> = {
  // Base materials
  'cloth': {
    src: clothImg,
    alt: 'Astral Cloth'
  },
  'copper': {
    src: copperImg,
    alt: 'Copper Ingot'
  },
  'crystal': {
    src: crystalImg,
    alt: 'Prismatic Crystal'
  },
  'tech-scrap': {
    src: techscrapImg,
    alt: 'Tech Scrap'
  },
  'techscrap': {
    src: techscrapImg,
    alt: 'Tech Scrap'
  },
  'metal': {
    src: copperImg, // Reusing copper image for metal
    alt: 'Reinforced Metal'
  },
  
  // Updated materials with proper images and names
  'circuit-board': {
    src: circuitBoardImg,
    alt: 'Logic Circuit'
  },
  'wire': {
    src: techscrapImg,
    alt: 'Conductive Wire'
  },
  'gear': {
    src: techscrapImg,
    alt: 'Precision Gears'
  },
  'battery': {
    src: techscrapImg,
    alt: 'Power Cell'
  },
  'microchip': {
    src: techscrapImg, 
    alt: 'Neural Processor'
  },
  'plastic': {
    src: techscrapImg,
    alt: 'Synthetic Polymer'
  },
  'rubber': {
    src: techscrapImg,
    alt: 'Elastic Compound'
  },
  'nano-fiber': {
    src: clothImg, // Using cloth for nano-fiber
    alt: 'Nano-fiber Weave'
  },
  'quantum-bit': {
    src: crystalImg, // Using crystal for quantum-bit
    alt: 'Quantum Bit'
  },
  'sensor-crystal': {
    src: crystalImg,
    alt: 'Sensor Crystal Array'
  },
  'ink': {
    src: inkImg,
    alt: 'Luminous Ink'
  },
  'alchemy-ink': {
    src: inkImg,
    alt: 'Alchemical Ink'
  },
  'loot-crate': {
    src: lootCrateImg,
    alt: 'Adventure Loot Crate'
  }
};

/**
 * Helper function to get a resource display information
 * This now uses the central item database for consistent naming
 */
export const getResourceDisplay = (type: string): { isImage: boolean; value: string; alt?: string } => {
  // Get item details from the database
  const itemDetails = getItemDetails(type);
  
  // If the resource type is directly in our map, return it with the proper name
  if (type in resourceImages) {
    return {
      isImage: true,
      value: resourceImages[type].src,
      alt: itemDetails.name // Use the name from our centralized database
    };
  }
  
  // Special case for loot boxes with type prefix (e.g. "common-loot-box")
  if (type.includes('loot') || type.endsWith('-box') || type.endsWith('-crate')) {
    return {
      isImage: true,
      value: lootCrateImg,
      alt: itemDetails.name // Use the name from our centralized database
    };
  }
  
  // Otherwise return a default image (crystal)
  return {
    isImage: true,
    value: resourceImages['crystal'].src,
    alt: itemDetails.name // Use the name from our centralized database
  };
};

/**
 * Helper function to get loot crate image
 * This returns a consistent image for all loot boxes
 */
export const getLootCrateImage = (): ResourceImage => {
  return resourceImages['loot-crate'];
};