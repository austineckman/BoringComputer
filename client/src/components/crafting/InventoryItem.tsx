import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

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
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  
  // Get item details from database
  const itemDetails = getItemDetails(itemId);
  
  // Setup drag source
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventory-item',
    item: () => {
      sounds.craftPickup();
      return { id: itemId };
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: () => quantity > 0,
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        sounds.craftDrop();
      }
    }
  }), [itemId, quantity, sounds]);
  
  // Handle hover to show tooltip
  const handleMouseEnter = () => {
    sounds.hover();
    setIsTooltipOpen(true);
  };
  
  // Handle mouse leave to hide tooltip
  const handleMouseLeave = () => {
    setIsTooltipOpen(false);
  };
  
  // Determine background color class based on rarity
  const getRarityClass = () => {
    switch (itemDetails.rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'uncommon':
        return 'bg-green-50 dark:bg-green-900/30';
      case 'rare':
        return 'bg-blue-50 dark:bg-blue-900/30';
      case 'epic':
        return 'bg-purple-50 dark:bg-purple-900/30';
      case 'legendary':
        return 'bg-amber-50 dark:bg-amber-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };
  
  // Apply additional styles for required items in crafting
  const getRequirementStyles = () => {
    if (!isRequired) return '';
    return quantity >= requiredAmount 
      ? 'border-green-400 dark:border-green-600' 
      : 'border-red-400 dark:border-red-600';
  };
  
  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen}>
        <TooltipTrigger asChild>
          <div
            ref={drag}
            className={cn(
              'relative p-1 rounded-md border cursor-pointer',
              'transition-all duration-200',
              isDragging ? 'opacity-50' : 'opacity-100',
              getRarityClass(),
              getRequirementStyles(),
              quantity === 0 ? 'grayscale opacity-50' : ''
            )}
            style={{ 
              boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.2)' : 'none',
              transform: isDragging ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-full h-16 flex items-center justify-center">
              <img 
                src={itemDetails.imagePath}
                alt={itemDetails.name}
                className="max-w-full max-h-full object-contain"
                draggable={false}
              />
            </div>
            <div className="absolute bottom-0 right-0 p-0.5">
              <Badge variant={isRequired ? 'outline' : 'secondary'} className="text-xs">
                {quantity}
              </Badge>
            </div>
            {isRequired && (
              <div className="absolute top-0 right-0 p-0.5">
                <Badge 
                  variant={quantity >= requiredAmount ? 'outline' : 'secondary'} 
                  className={cn(
                    'text-xs',
                    quantity >= requiredAmount ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  )}
                >
                  {requiredAmount}
                </Badge>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <div className="space-y-1 max-w-[200px]">
            <p className="font-medium">{itemDetails.name}</p>
            <p className="text-xs opacity-80">{itemDetails.description}</p>
            <p className="text-xs italic opacity-70">{itemDetails.flavorText}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItem;