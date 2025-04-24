import React from 'react';
import { useDrop } from 'react-dnd';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getItemDetails } from '@/lib/itemDatabase';

interface CraftingCellProps {
  row: number;
  col: number;
  itemId: string;
  highlighted: boolean;
  onDropItem: (row: number, col: number, itemId: string) => void;
  onRemoveItem: (row: number, col: number) => void;
}

const CraftingCell: React.FC<CraftingCellProps> = ({
  row,
  col,
  itemId,
  highlighted,
  onDropItem,
  onRemoveItem
}) => {
  const { sounds } = useSoundEffects();
  
  // Set up drop functionality
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'item',
    drop: (item: { itemId: string }) => {
      onDropItem(row, col, item.itemId);
      sounds.craftDrop(); // Using craftDrop instead of craftPlace
      return { dropped: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [row, col, onDropItem]);
  
  // Handle removing an item from the cell
  const handleRemove = () => {
    if (itemId) {
      onRemoveItem(row, col);
      sounds.craftDrop();
    }
  };
  
  // Get item details if there's an item in the cell
  const itemDetails = itemId ? getItemDetails(itemId) : null;
  
  return (
    <div
      ref={drop}
      className={cn(
        'w-full aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center relative transition-all',
        highlighted && 'border-primary',
        isOver && canDrop && 'border-green-500 bg-green-500/10',
        isOver && !canDrop && 'border-red-500 bg-red-500/10',
        itemId ? 'bg-background border-solid' : 'bg-background/50'
      )}
      onClick={handleRemove}
    >
      {itemId && itemDetails && (
        <>
          <img 
            src={itemDetails.imagePath} 
            alt={itemDetails.name}
            className="w-4/5 h-4/5 object-contain pixelated transform scale-[1.25] origin-center"
            style={{ imageRendering: 'pixelated' }}
          />
          <div className="absolute bottom-0 right-0 bg-background/80 text-xs px-1 rounded-tl">
            {itemId}
          </div>
        </>
      )}
    </div>
  );
};

export default CraftingCell;