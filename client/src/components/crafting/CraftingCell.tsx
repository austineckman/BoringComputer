import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface CraftingCellProps {
  row: number;
  col: number;
  itemId: string | null;
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
  
  // Set up drag functionality for cells with items
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { itemId, sourceType: 'GRID', row, col },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !pattern && !!itemId, // Only allow dragging from grid cells with items and not from pattern
  }), [row, col, itemId, pattern]);
  
  // Set up drop functionality
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ITEM',
    drop: (item: { itemId: string }) => {
      if (!pattern) {
        sounds.drop(); // Play drop sound
        onDropItem(row, col, item.itemId);
      }
      return { row, col };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop() && !pattern,
    }),
    canDrop: () => !pattern, // Don't allow dropping onto pattern cells
  }), [row, col, onDropItem, pattern]);

  const handleCellClick = () => {
    if (itemId && !pattern) {
      sounds.remove(); // Play remove sound
      onRemoveItem(row, col);
    }
  };

  // Get item details if we have an itemId
  const itemDetails = itemId ? getItemDetails(itemId) : null;

  // Determine the cell's styling based on state
  const cellBaseStyle = `
    w-12 h-12 border-2 rounded flex items-center justify-center
    ${pattern ? 'cursor-default' : 'cursor-pointer'}
    ${isOver && canDrop ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30' : ''}
    ${highlighted ? 'border-green-500 bg-green-100 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'}
    ${isDragging ? 'opacity-50' : 'opacity-100'}
    transition-all duration-150
  `;

  return (
    <div
      ref={(node) => {
        // Apply both drag and drop refs if not in pattern mode
        if (!pattern) {
          drag(drop(node));
        }
      }}
      className={cellBaseStyle}
      onClick={handleCellClick}
    >
      {itemId && (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <img
            src={itemDetails?.imagePath || `/items/${itemId}.png`}
            alt={itemDetails?.name || itemId}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-item.png';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CraftingCell;