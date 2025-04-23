/**
 * Get the appropriate CSS class for an item's rarity background or text color
 * @param rarity The rarity level of the item
 * @param type Whether to return a background or text color class (default: background)
 * @returns CSS class name for the specified rarity
 */
export function getRarityColorClass(
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
  type: 'bg' | 'border' | 'text' = 'bg'
): string {
  const colors = {
    common: {
      bg: 'bg-gray-700 border-gray-500',
      border: 'border-gray-500',
      text: 'text-gray-300',
    },
    uncommon: {
      bg: 'bg-green-900 bg-opacity-50 border-green-500',
      border: 'border-green-500',
      text: 'text-green-400',
    },
    rare: {
      bg: 'bg-blue-900 bg-opacity-50 border-blue-500',
      border: 'border-blue-500',
      text: 'text-blue-400',
    },
    epic: {
      bg: 'bg-purple-900 bg-opacity-50 border-purple-500',
      border: 'border-purple-500',
      text: 'text-purple-400',
    },
    legendary: {
      bg: 'bg-amber-900 bg-opacity-50 border-amber-500',
      border: 'border-amber-500',
      text: 'text-amber-400',
    },
  };

  return colors[rarity][type];
}

/**
 * Get animation classes based on rarity
 * @param rarity The rarity level of the item
 * @returns CSS animation class for the specified rarity
 */
export function getRarityAnimationClass(
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
): string {
  switch (rarity) {
    case 'legendary':
      return 'animate-pulse-slow border-2 shadow-lg shadow-amber-500/50';
    case 'epic':
      return 'animate-pulse-slow border-2 shadow-md shadow-purple-500/50';
    case 'rare':
      return 'border-2 shadow-sm shadow-blue-500/30';
    case 'uncommon':
      return 'border-2';
    default:
      return '';
  }
}

/**
 * Get badge classes for rarity display
 * @param rarity The rarity level of the item
 * @returns CSS classes for badge displaying rarity
 */
export function getRarityBadgeClass(
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
): string {
  const baseClasses = 'px-2 py-0.5 rounded-full text-xs font-medium';
  
  switch (rarity) {
    case 'legendary':
      return `${baseClasses} bg-amber-900 text-amber-100`;
    case 'epic':
      return `${baseClasses} bg-purple-900 text-purple-100`;
    case 'rare':
      return `${baseClasses} bg-blue-900 text-blue-100`;
    case 'uncommon':
      return `${baseClasses} bg-green-900 text-green-100`;
    default:
      return `${baseClasses} bg-gray-700 text-gray-300`;
  }
}