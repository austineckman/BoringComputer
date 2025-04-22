// Import the pixel art images
import clothImg from '../assets/cloth.png';
import copperImg from '../assets/copper.png';
import crystalImg from '../assets/crystal.png';
import techscrapImg from '../assets/techscrap.png';
import lootCrateImg from '../assets/loot-crate.png';

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
    alt: 'Cloth material'
  },
  'copper': {
    src: copperImg,
    alt: 'Copper material'
  },
  'crystal': {
    src: crystalImg,
    alt: 'Crystal material'
  },
  'tech-scrap': {
    src: techscrapImg,
    alt: 'Tech scrap material'
  },
  'techscrap': {
    src: techscrapImg,
    alt: 'Tech scrap material'
  },
  'metal': {
    src: copperImg, // Reusing copper image for metal
    alt: 'Metal material'
  },
  
  // Additional materials - all using existing images as fallbacks
  'circuit-board': {
    src: techscrapImg, // Using tech scrap for circuit boards
    alt: 'Circuit board'
  },
  'wire': {
    src: techscrapImg,
    alt: 'Wire'
  },
  'gear': {
    src: techscrapImg,
    alt: 'Gear'
  },
  'battery': {
    src: techscrapImg,
    alt: 'Battery'
  },
  'microchip': {
    src: techscrapImg, 
    alt: 'Microchip'
  },
  'plastic': {
    src: techscrapImg,
    alt: 'Plastic'
  },
  'rubber': {
    src: techscrapImg,
    alt: 'Rubber'
  },
  'nano-fiber': {
    src: clothImg, // Using cloth for nano-fiber
    alt: 'Nano-fiber'
  },
  'quantum-bit': {
    src: crystalImg, // Using crystal for quantum-bit
    alt: 'Quantum bit'
  },
  'sensor-crystal': {
    src: crystalImg,
    alt: 'Sensor crystal'
  },
  'alchemy-ink': {
    src: crystalImg,
    alt: 'Alchemy ink'
  },
  'loot-crate': {
    src: lootCrateImg,
    alt: 'Loot Crate'
  }
};

// Helper function to get a resource image
export const getResourceDisplay = (type: string): { isImage: boolean; value: string; alt?: string } => {
  // If the resource type is directly in our map, return it
  if (type in resourceImages) {
    return {
      isImage: true,
      value: resourceImages[type].src,
      alt: resourceImages[type].alt
    };
  }
  
  // Otherwise return a default image (crystal)
  return {
    isImage: true,
    value: resourceImages['crystal'].src,
    alt: `${type.replace('-', ' ')} material`
  };
};

// Helper function to get loot crate image
export const getLootCrateImage = (): ResourceImage => {
  return resourceImages['loot-crate'];
};