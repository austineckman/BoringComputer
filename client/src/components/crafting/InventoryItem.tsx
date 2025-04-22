import React from 'react';
import { useDrag } from 'react-dnd';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

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
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventory-item',
    item: () => {
      sounds.craftPickup();
      return { id: itemId };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        sounds.craftPickup(); // Play sound on "return" to inventory
      }
    },
  }));
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            ref={drag}
            className={`
              relative border p-2 rounded-md cursor-grab active:cursor-grabbing transition-all
              ${isDragging ? 'opacity-30' : 'opacity-100'}
              ${isRequired ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-200 dark:border-gray-700'}
              hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700
            `}
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 relative">
                <img
                  src={itemDetails.imagePath}
                  alt={itemDetails.name}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              
              <div className="mt-1 text-center w-full">
                <p className="text-xs font-medium truncate">{itemDetails.name}</p>
                <div className="flex items-center justify-center mt-1 gap-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {quantity}
                  </Badge>
                  
                  {isRequired && (
                    <Badge variant={quantity >= requiredAmount ? "success" : "outline"} className="text-xs px-1.5 py-0">
                      {requiredAmount}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Rarity indicator */}
              <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${getRarityColor(itemDetails.rarity)}`} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{itemDetails.name}</h4>
              <Badge variant="outline" className="ml-2 capitalize text-xs">
                {itemDetails.rarity}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{itemDetails.description}</p>
            {itemDetails.flavorText && (
              <p className="text-xs italic text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-2 mt-1">{itemDetails.flavorText}</p>
            )}
            {isRequired && (
              <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                <span>Required:</span>
                <span className={quantity >= requiredAmount ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                  {quantity} / {requiredAmount}
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper function to get color based on item rarity
function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-400 dark:bg-gray-500';
    case 'uncommon':
      return 'bg-green-400 dark:bg-green-500';
    case 'rare':
      return 'bg-blue-400 dark:bg-blue-500';
    case 'epic':
      return 'bg-purple-400 dark:bg-purple-500';
    case 'legendary':
      return 'bg-amber-400 dark:bg-amber-500';
    default:
      return 'bg-gray-400 dark:bg-gray-500';
  }
}

export default InventoryItem;