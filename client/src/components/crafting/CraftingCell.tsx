import React from 'react';
import { useDrop } from 'react-dnd';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';

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
  const hasItem = !!itemId;
  
  // Set up drop target for inventory items
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'inventory-item',
    drop: (item: { id: string }) => {
      onDropItem(row, col, item.id);
      sounds.craftDrop();
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  // Handle removing an item by clicking on it
  const handleRemoveItem = () => {
    if (hasItem && !pattern) {
      onRemoveItem(row, col);
      sounds.craftPickup();
    }
  };
  
  // Display the item details if we have an item
  const itemDetails = hasItem ? getItemDetails(itemId) : null;
  
  return (
    <div
      ref={pattern ? undefined : drop}
      className={`
        w-12 h-12 border rounded-md flex items-center justify-center transition-all 
        ${isOver ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20' : ''}
        ${canDrop && !isOver ? 'border-gray-300 dark:border-gray-600' : ''}
        ${!canDrop && !hasItem ? 'border-gray-200 dark:border-gray-700' : ''}
        ${hasItem ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10' : ''}
        ${highlighted ? 'ring-2 ring-green-400 dark:ring-green-600' : ''}
        ${pattern && !hasItem ? 'bg-gray-50 dark:bg-gray-800 opacity-50' : ''}
        ${hasItem && !pattern ? 'cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/20' : ''}
      `}
      onClick={handleRemoveItem}
    >
      {hasItem && itemDetails ? (
        <div className="relative w-10 h-10">
          <img 
            src={itemDetails.imagePath}
            alt={itemDetails.name}
            className="w-full h-full object-contain" 
            draggable={false}
          />
        </div>
      ) : (
        // Empty cell placeholder
        <div className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-gray-700">
          {isOver ? (
            <div className="animate-pulse w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-700/50"></div>
          ) : (
            <span className="text-xs">+</span>  
          )}
        </div>
      )}
    </div>
  );
};

export default CraftingCell;