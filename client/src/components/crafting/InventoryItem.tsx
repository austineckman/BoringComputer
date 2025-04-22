import React from 'react';
import { useDrag } from 'react-dnd';
import { getItemDetails } from '@/lib/itemDatabase';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface InventoryItemProps {
  itemId: string;
  quantity: number;
  isRequired?: boolean;
  requiredAmount?: number;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  itemId,
  quantity,
  isRequired = false,
  requiredAmount = 0
}) => {
  const { sounds } = useSoundEffects();
  const itemDetails = getItemDetails(itemId);
  
  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'inventory-item',
    item: { id: itemId },
    canDrag: () => quantity > 0,
    begin: () => {
      sounds.craftPickup();
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        // Item was dropped on a valid target
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  // Determine whether we have enough of this item if it's required
  const hasEnough = quantity >= requiredAmount;
  
  // Get appropriate styling based on item state
  const getItemClasses = () => {
    let className = 'rounded-md bg-white dark:bg-gray-800 p-2 border transition-all ';
    
    // Default border color
    className += 'border-gray-200 dark:border-gray-700 ';
    
    // Required item styling
    if (isRequired) {
      className += hasEnough 
        ? 'ring-1 ring-green-400 dark:ring-green-600 ' 
        : 'ring-1 ring-red-400 dark:ring-red-600 ';
    }
    
    // Dragging state
    if (isDragging) {
      className += 'opacity-50 border-dashed ';
    } else if (quantity > 0) {
      className += 'cursor-grab hover:border-amber-400 dark:hover:border-amber-600 ';
    } else {
      className += 'opacity-50 cursor-not-allowed ';
    }
    
    return className;
  };
  
  // Format the rarity as a badge class
  const getRarityBadgeClass = () => {
    switch (itemDetails.rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'uncommon':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rare':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'epic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'legendary':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            ref={drag}
            className={getItemClasses()}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <img 
                  src={itemDetails.imagePath} 
                  alt={itemDetails.name}
                  className="w-12 h-12 object-contain" 
                />
                <span className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded">
                  {quantity}
                  {isRequired && requiredAmount > 0 ? `/${requiredAmount}` : ''}
                </span>
              </div>
              <div className="mt-1 text-xs font-medium truncate w-full text-center">
                {itemDetails.name}
              </div>
              <div className={`text-[10px] px-1 rounded mt-1 ${getRarityBadgeClass()}`}>
                {itemDetails.rarity}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div>
            <div className="font-bold mb-1">{itemDetails.name}</div>
            <div className="text-sm mb-1">{itemDetails.description}</div>
            <div className="text-xs italic text-gray-500 dark:text-gray-400 mt-1">
              {itemDetails.flavorText}
            </div>
            {itemDetails.craftingUses.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="font-medium">Uses:</span> {itemDetails.craftingUses.join(', ')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItem;