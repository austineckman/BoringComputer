import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { X } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getItemDetails } from '@/lib/itemDatabase';

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
  pattern = false,
}) => {
  const { sounds } = useSoundEffects();
  const cellRef = useRef<HTMLDivElement>(null);

  // Set up drop target for inventory items
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'inventory-item',
    drop: (item: { id: string }) => {
      sounds.drop();
      onDropItem(row, col, item.id);
      return { row, col };
    },
    canDrop: () => !pattern, // Disable dropping if this is a pattern cell
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }));

  // Apply the drop ref to our element
  drop(cellRef);

  // Handle removing an item from the cell
  const handleRemoveItem = () => {
    if (pattern) return; // Don't allow removing items from pattern cells
    sounds.remove();
    onRemoveItem(row, col);
  };

  // Get item details if we have an item in this cell
  const itemDetails = itemId ? getItemDetails(itemId) : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={cellRef}
            className={`
              relative aspect-square border-2 rounded-md 
              ${isOver && canDrop ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' : ''}
              ${highlighted 
                ? 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20' 
                : 'border-gray-300 dark:border-gray-700'}
              ${itemId ? 'p-1' : 'p-0'}
              ${pattern 
                ? 'cursor-default' 
                : itemId 
                  ? 'cursor-pointer' 
                  : 'cursor-grab'}
              transition-all duration-150
            `}
            onClick={itemId ? handleRemoveItem : undefined}
          >
            {itemId && (
              <>
                <img
                  src={itemDetails?.imagePath || `/items/${itemId}.png`}
                  alt={itemDetails?.name || itemId}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = '/placeholder-item.png';
                  }}
                />
                {!pattern && (
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem();
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {itemId ? (
            <div>
              <div className="font-medium">{itemDetails?.name || itemId}</div>
              {!pattern && <div className="text-xs text-gray-500">Click to remove</div>}
            </div>
          ) : pattern ? (
            <div className="text-xs">Pattern cell</div>
          ) : (
            <div className="text-xs">Drop an item here</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CraftingCell;