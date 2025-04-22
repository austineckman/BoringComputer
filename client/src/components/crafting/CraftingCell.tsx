import React from 'react';
import { useDrop } from 'react-dnd';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { cn } from '@/lib/utils';

interface CraftingCellProps {
  row: number;
  col: number;
  itemId: string;
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
  highlighted?: boolean;
  pattern?: boolean;
}

const CraftingCell: React.FC<CraftingCellProps> = ({
  row,
  col,
  itemId,
  onDropItem,
  onRemoveItem,
  highlighted = false,
  pattern = false
}) => {
  const { sounds } = useSoundEffects();
  
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'inventory-item',
    drop: (item: { id: string }) => {
      sounds.craftDrop();
      onDropItem(row, col, item.id);
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    // Disable dropping for pattern display
    canDrop: () => !pattern,
  }), [row, col, onDropItem, pattern, sounds]);
  
  // Handle cell click to remove item
  const handleClick = () => {
    if (itemId && !pattern) {
      sounds.click();
      onRemoveItem(row, col);
    }
  };
  
  // Get item details if there's an item in the cell
  const itemDetails = itemId ? getItemDetails(itemId) : null;
  
  return (
    <div
      ref={pattern ? null : drop}
      className={cn(
        'w-12 h-12 border rounded flex items-center justify-center transition-all',
        {
          'bg-gray-50 dark:bg-gray-800': !itemId && !isOver && !highlighted && !pattern,
          'bg-gray-100 dark:bg-gray-700': !itemId && isOver && !pattern,
          'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700': highlighted,
          'border-dashed': !itemId && !pattern,
          'border-solid border-amber-300 dark:border-amber-700': isOver && canDrop,
          'cursor-pointer': itemId && !pattern,
          'bg-gray-200 dark:bg-gray-900 border-dashed border-gray-400': pattern && !itemId,
          'opacity-60': pattern
        }
      )}
      onClick={handleClick}
    >
      {itemId && itemDetails && (
        <img
          src={itemDetails.imagePath}
          alt={itemDetails.name}
          className={cn(
            'max-w-9 max-h-9 object-contain',
            { 'cursor-pointer hover:scale-105 transition-transform': !pattern }
          )}
        />
      )}
    </div>
  );
};

export default CraftingCell;