import React from 'react';
import { useDrop } from 'react-dnd';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getItemDetails } from '@/lib/itemDatabase';
import { cn } from '@/lib/utils';
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
  
  // Setup drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'inventory-item',
    drop: (item: { id: string }) => {
      if (!pattern) {
        onDropItem(row, col, item.id);
        sounds.craftPlace();
      }
      return { row, col };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    canDrop: () => !pattern && !itemId, // Can only drop on empty cells that aren't pattern cells
  }), [row, col, itemId, onDropItem, pattern, sounds]);
  
  // Handle cell click to remove item
  const handleCellClick = () => {
    if (itemId && !pattern) {
      onRemoveItem(row, col);
      sounds.craftDrop();
    }
  };
  
  // Handle remove button click
  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveItem(row, col);
    sounds.craftDrop();
  };
  
  // Get item details if there is an item in this cell
  const itemDetails = itemId ? getItemDetails(itemId) : null;
  
  // Determine cell styling based on state (empty, has item, is highlighted)
  const getCellClasses = () => {
    const baseClasses = 'w-full h-16 rounded-md transition-all duration-200 flex items-center justify-center relative';
    
    if (pattern) {
      // Pattern cell styling
      if (itemId) {
        return cn(
          baseClasses,
          'bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-400 dark:border-gray-600',
          'opacity-70'
        );
      } else {
        return cn(
          baseClasses,
          'bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-400 dark:border-gray-600',
          'opacity-30'
        );
      }
    }
    
    if (itemId) {
      // Cell with an item
      return cn(
        baseClasses,
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer',
        highlighted ? 'ring-2 ring-green-400 dark:ring-green-600' : ''
      );
    }
    
    // Empty cell
    return cn(
      baseClasses,
      'bg-gray-100 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700',
      isOver && canDrop ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : '',
      isOver && !canDrop ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : '',
      !pattern ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''
    );
  };
  
  return (
    <div
      ref={drop}
      className={getCellClasses()}
      onClick={handleCellClick}
    >
      {itemId && itemDetails && (
        <>
          <img 
            src={itemDetails.imagePath}
            alt={itemDetails.name}
            className="max-w-full max-h-full object-contain p-1"
            draggable={false}
          />
          
          {!pattern && (
            <Button 
              size="sm"
              variant="ghost"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50"
              onClick={handleRemoveClick}
            >
              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default CraftingCell;