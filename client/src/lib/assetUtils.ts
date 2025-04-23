// Utility functions for managing assets like images

// Return the loot crate image path
export function getLootCrateImage() {
  return {
    src: '/images/loot crate.png',
    alt: 'Loot Crate'
  };
}

// Function to get character image path
export function getCharacterImage() {
  return {
    src: '/images/basecharacter.png',
    alt: 'Character'
  };
}

// Function to get background image path
export function getBackgroundImage() {
  return {
    src: '/images/wallbg.png',
    alt: 'Background'
  };
}

// Function to map item types to image paths
export function getItemImagePath(itemType: string): string {
  const itemImages: Record<string, string> = {
    'cloth': '/images/cloth.png',
    'metal': '/images/copper.png',
    'tech-scrap': '/images/techscrap.png',
    'circuit-board': '/images/circuit board.png',
    'sensor-crystal': '/images/crystal.png',
    'alchemy-ink': '/images/ink.png',
    'forgehero-codex': '/images/forgehero.png',
    'elementium-bar': '/images/neon-realm-pixelart.png',
    'power-crystal': '/images/pandora-pixelart.png',
    'cogsworth-gear': '/images/cogsworth-pixelart.png',
    'nebula-essence': '/images/nebula-pixelart.png',
    // Add more mappings as needed
  };
  
  return itemImages[itemType] || '/images/loot crate.png'; // Default fallback image
}