import React, { useState } from 'react';
import ResourceItem from '@/components/ui/resource-item';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { itemDatabase } from '@/lib/itemDatabase';

interface InventoryItemProps {
  itemId: string;
  quantity: number;
  disabled?: boolean;
  requiredQuantity?: number;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  itemId,
  quantity,
  disabled = false,
  requiredQuantity,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const { sounds } = useSoundEffects();
  const itemDetails = itemDatabase[itemId];
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled || quantity <= 0) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('itemId', itemId);
    setIsDragging(true);
    sounds.hover();
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const isRequired = requiredQuantity !== undefined && requiredQuantity > 0;
  const hasEnough = isRequired && quantity >= requiredQuantity;
  const notEnough = isRequired && quantity < requiredQuantity;
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inventory-item transition-all duration-200 p-1 rounded-lg',
              isDragging ? 'opacity-50' : 'opacity-100',
              disabled || quantity <= 0 ? 'cursor-not-allowed opacity-40' : 'cursor-grab hover:scale-105 hover:shadow-md',
              isRequired && 'border-2',
              hasEnough ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
              notEnough ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 
              isRequired ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''
            )}
            draggable={!disabled && quantity > 0}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="relative">
              <ResourceItem
                type={itemId as any}
                quantity={quantity}
                size="md"
                interactive={!disabled && quantity > 0}
              />
              
              {isRequired && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {requiredQuantity}
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-semibold">{itemDetails?.name || itemId}</p>
          {isRequired && (
            <p className="text-xs">
              {hasEnough 
                ? `✓ Have ${quantity}/${requiredQuantity} required` 
                : `⚠ Need ${requiredQuantity - quantity} more`}
            </p>
          )}
          <p className="text-xs italic">{itemDetails?.flavorText || ''}</p>
          {!disabled && quantity > 0 && <p className="text-xs mt-1">Drag to crafting grid</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItem;