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
  'loot-crate': {
    src: lootCrateImg,
    alt: 'Loot Crate'
  }
};

// Default fallback emojis for resources without images
export const resourceEmojis: Record<string, string> = {
  'metal': '🔩',
  'circuit-board': '🔌',
  'wire': '🧵',
  'gear': '⚙️',
  'battery': '🔋',
  'microchip': '🖥️',
  'plastic': '📏',
  'rubber': '🧊',
  'nano-fiber': '🧪',
  'quantum-bit': '✨',
};

// Helper function to get a resource image or emoji
export const getResourceDisplay = (type: string): { isImage: boolean; value: string; alt?: string } => {
  if (type in resourceImages) {
    return {
      isImage: true,
      value: resourceImages[type].src,
      alt: resourceImages[type].alt
    };
  }
  
  return {
    isImage: false,
    value: resourceEmojis[type] || '🔮' // Fallback to mystery emoji
  };
};

// Helper function to get loot crate image
export const getLootCrateImage = (): ResourceImage => {
  return resourceImages['loot-crate'];
};