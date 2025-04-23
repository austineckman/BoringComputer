import { getItemDetails } from './itemDatabase';

/**
 * Get the CSS class for an item's border and background based on rarity
 */
export function getRarityColorClass(itemType: string): string {
  const itemDetails = getItemDetails(itemType);
  
  switch (itemDetails.rarity) {
    case 'legendary':
      return 'border-amber-400 bg-amber-900/20 border-2';
    case 'epic':
      return 'border-purple-400 bg-purple-900/20 border-2';
    case 'rare':
      return 'border-blue-400 bg-blue-900/20 border-2';
    case 'uncommon':
      return 'border-green-400 bg-green-900/20 border-2';
    case 'common':
    default:
      return 'border-gray-400 bg-gray-800/20 border';
  }
}