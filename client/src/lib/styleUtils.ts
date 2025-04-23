import { ItemDetails } from '@/lib/itemDatabase';

/**
 * Get the CSS class for an item's border and background based on rarity
 */
export function getRarityColorClass(itemType: string): string {
  // Use the existing getItemDetails function to get rarity
  const rarity = typeof itemType === 'string' && !itemType.includes('loot-box') 
    ? getItemDetails(itemType)?.rarity || 'common'
    : 'common';
  
  return getItemRarityColorClass(rarity);
}

/**
 * Get the CSS class for an item based directly on rarity value
 */
export function getItemRarityColorClass(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'border-2 border-amber-500/60 bg-amber-950/30 hover:border-amber-400 hover:bg-amber-900/40';
    case 'epic':
      return 'border-2 border-purple-500/60 bg-purple-950/30 hover:border-purple-400 hover:bg-purple-900/40';
    case 'rare':
      return 'border-2 border-blue-500/60 bg-blue-950/30 hover:border-blue-400 hover:bg-blue-900/40';
    case 'uncommon':
      return 'border-2 border-green-500/60 bg-green-950/30 hover:border-green-400 hover:bg-green-900/40';
    case 'common':
    default:
      return 'border-2 border-slate-500/40 bg-slate-800/30 hover:border-slate-400 hover:bg-slate-700/40';
  }
}

/**
 * Get the text color class for an item based on rarity
 */
export function getRarityTextColorClass(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-amber-300';
    case 'epic':
      return 'text-purple-300';
    case 'rare':
      return 'text-blue-300';
    case 'uncommon':
      return 'text-green-300';
    case 'common':
    default:
      return 'text-slate-300';
  }
}

/**
 * Get the background color class for an item based on rarity
 */
export function getRarityBgColorClass(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'bg-amber-500/20';
    case 'epic':
      return 'bg-purple-500/20';
    case 'rare':
      return 'bg-blue-500/20';
    case 'uncommon':
      return 'bg-green-500/20';
    case 'common':
    default:
      return 'bg-slate-500/20';
  }
}

/**
 * Get the border color class for an item based on rarity
 */
export function getRarityBorderColorClass(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'border-amber-500/50';
    case 'epic':
      return 'border-purple-500/50';
    case 'rare':
      return 'border-blue-500/50';
    case 'uncommon':
      return 'border-green-500/50';
    case 'common':
    default:
      return 'border-slate-500/50';
  }
}

/**
 * Get the full badge class for rarity display
 */
export function getRarityBadgeClass(rarity: string): string {
  return `${getRarityBgColorClass(rarity)} ${getRarityTextColorClass(rarity)} border ${getRarityBorderColorClass(rarity)}`;
}

/**
 * Get CSS shadow style for glow effect based on rarity
 */
export function getRarityGlowStyle(rarity: string): React.CSSProperties {
  const shadowColor = rarity === 'legendary' ? 'rgba(245, 158, 11, 0.6)' :
                      rarity === 'epic' ? 'rgba(168, 85, 247, 0.6)' :
                      rarity === 'rare' ? 'rgba(59, 130, 246, 0.6)' :
                      rarity === 'uncommon' ? 'rgba(34, 197, 94, 0.6)' :
                      'rgba(156, 163, 175, 0.3)';
  
  return {
    boxShadow: `0 0 15px 2px ${shadowColor}`
  };
}

// Import this at the end to avoid circular dependency issues
import { getItemDetails } from '@/lib/itemDatabase';