// Helper functions for asset path handling and image resources

/**
 * Get the correct image path and alt text for a loot crate
 */
export function getLootCrateImage(rarity: string = 'common') {
  // In a more advanced implementation, we could have different images for different rarities
  return {
    src: '/images/loot-crate.png',
    alt: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Loot Crate`,
  };
}

/**
 * Get character image path
 */
export function getCharacterImagePath() {
  // In the future, this could be customized based on equipped items
  return '/images/basecharacter.png';
}

/**
 * Get the background image path
 */
export function getBackgroundImagePath() {
  return '/images/wallbg.png';
}

/**
 * Format image path for consistent usage across components
 */
export function formatImagePath(path: string): string {
  // Remove leading slash if it exists to ensure consistent paths
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  
  // Add public prefix if needed
  if (!path.startsWith('images/') && !path.startsWith('public/')) {
    path = `images/${path}`;
  }
  
  return path;
}

/**
 * Check if an image path exists and return a fallback if not
 */
export function safeImagePath(path: string, fallback: string = '/images/missing.png'): string {
  // In a browser environment, we can't easily check if an image exists before loading
  // For now, we'll just return the path as is, but in a more robust implementation,
  // we might add error handling or checks
  return path || fallback;
}