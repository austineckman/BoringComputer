import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InventoryItemProps {
  itemId: string;
  name: string;
  imagePath: string;
  quantity: number;
  isRequired?: boolean;
  requiredAmount?: number;
  hasSufficientAmount?: boolean;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  itemId,
  name,
  imagePath,
  quantity,
  isRequired = false,
  requiredAmount = 0,
  hasSufficientAmount = true,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  // Set up drag and drop functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'inventory-item',
    item: { id: itemId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Apply the drag ref to our element
  drag(itemRef);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={itemRef}
            className={`
              relative p-1 rounded-md cursor-grab border
              ${isDragging ? 'opacity-50' : 'opacity-100'}
              ${isRequired 
                ? hasSufficientAmount 
                  ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
            `}
          >
            <div className="aspect-square w-full flex items-center justify-center p-1">
              <img
                src={imagePath}
                alt={name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  (e.target as HTMLImageElement).src = '/placeholder-item.png';
                }}
              />
            </div>
            <div className="absolute top-0 right-0 min-w-[1.5rem] h-[1.5rem] flex items-center justify-center bg-gray-800 rounded-bl-md rounded-tr-md text-white text-xs font-medium">
              {quantity}
            </div>
            {isRequired && (
              <div 
                className={`
                  absolute bottom-0 left-0 px-1 rounded-tr-md text-xs font-semibold
                  ${hasSufficientAmount
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'}
                `}
              >
                {requiredAmount}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs opacity-80">Quantity: {quantity}</div>
          {isRequired && (
            <div className={`text-xs ${hasSufficientAmount ? 'text-green-500' : 'text-red-500'}`}>
              Required: {requiredAmount}
            </div>
          )}
          <div className="text-xs opacity-80 mt-1">Drag to crafting grid</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItem;