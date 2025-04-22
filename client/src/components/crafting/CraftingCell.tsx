import React from 'react';
import { useDrop } from 'react-dnd';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getItemDetails } from '@/lib/itemDatabase';

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
  pattern = false,
}) => {
  const { sounds } = useSoundEffects();
  const hasItem = Boolean(itemId);
  
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'inventory-item',
    drop: (item: { id: string }) => {
      sounds.craftDrop();
      onDropItem(row, col, item.id);
      return { row, col };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    // Don't allow dropping if cell already has an item and it's not a pattern view
    canDrop: () => !hasItem || pattern,
  }));
  
  // Handle click to remove item
  const handleRemoveItem = () => {
    if (hasItem && !pattern) {
      sounds.craftPickup();
      onRemoveItem(row, col);
    }
  };
  
  // Determine cell styling
  const getCellClassName = () => {
    let className = 'w-12 h-12 flex items-center justify-center rounded-md transition-all';
    
    // Base style
    if (pattern) {
      className += ' cursor-default';
    } else {
      className += hasItem 
        ? ' cursor-pointer border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800' 
        : ' cursor-default border border-dashed border-gray-300 dark:border-gray-700';
    }
    
    // Hover and drop state
    if (isOver && canDrop) {
      className += ' border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20';
    }
    
    // Highlight for pattern matching
    if (highlighted) {
      className += ' border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20';
    }
    
    return className;
  };
  
  return (
    <div 
      ref={drop}
      className={getCellClassName()}
      onClick={handleRemoveItem}
    >
      {hasItem && (
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src={getItemDetails(itemId).imagePath}
            alt={getItemDetails(itemId).name}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};

export default CraftingCell;