import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import ResourceItem from '@/components/ui/resource-item';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { itemDatabase } from '@/lib/itemDatabase';

interface CraftingCellProps {
  rowIndex: number;
  colIndex: number;
  item: string | null;
  isHighlighted?: boolean;
  onDrop: (item: string, rowIndex: number, colIndex: number) => void;
  onClear: (rowIndex: number, colIndex: number) => void;
  disabled?: boolean;
}

const CraftingCell: React.FC<CraftingCellProps> = ({
  rowIndex,
  colIndex,
  item,
  isHighlighted = false,
  onDrop,
  onClear,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { sounds } = useSoundEffects();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !item) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled || item) return;
    
    const droppedItemId = e.dataTransfer.getData('itemId');
    if (droppedItemId) {
      sounds.craftPlaceItem();
      onDrop(droppedItemId, rowIndex, colIndex);
    }
  };

  const handleClick = () => {
    if (disabled || !item) return;
    sounds.click();
    onClear(rowIndex, colIndex);
  };

  return (
    <div
      className={cn(
        'crafting-cell w-14 h-14 border-2 flex items-center justify-center rounded-lg transition-all',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        isDragOver ? 'border-green-500 bg-green-100 dark:bg-green-900' : 'border-gray-300 dark:border-gray-700',
        isHighlighted ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800',
        item ? 'hover:border-red-500' : 'hover:border-blue-500'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      data-position={`${rowIndex}-${colIndex}`}
    >
      {item ? (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="h-full w-full flex items-center justify-center">
                <ResourceItem
                  type={item as any}
                  quantity={1}
                  size="sm"
                  interactive={false}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{itemDatabase[item]?.name || item}</p>
              <p className="text-xs">Click to remove</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="text-xs text-gray-400">
          {!disabled && '+'}
        </div>
      )}
    </div>
  );
};

export default CraftingCell;