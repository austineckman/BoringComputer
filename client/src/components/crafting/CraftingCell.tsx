import React, { useState } from 'react';
import ResourceItem from '@/components/ui/resource-item';
import { cn } from '@/lib/utils';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface CraftingCellProps {
  row: number;
  col: number;
  item: string | null;
  onDrop: (row: number, col: number, itemId: string) => void;
  onRemove: (row: number, col: number) => void;
  isHighlighted?: boolean;
}

const CraftingCell: React.FC<CraftingCellProps> = ({
  row,
  col,
  item,
  onDrop,
  onRemove,
  isHighlighted = false,
}) => {
  const [isOver, setIsOver] = useState(false);
  const { sounds } = useSoundEffects();
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isOver) setIsOver(true);
  };
  
  const handleDragLeave = () => {
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    
    const itemId = e.dataTransfer.getData('itemId');
    if (itemId) {
      onDrop(row, col, itemId);
      sounds.click();
    }
  };
  
  const handleClick = () => {
    if (item) {
      onRemove(row, col);
      sounds.click();
    }
  };
  
  return (
    <div
      className={cn(
        'crafting-cell w-14 h-14 border-2 flex items-center justify-center transition-all duration-150 relative',
        isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
        isHighlighted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
        'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
        item ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {item ? (
        <div className="w-full h-full p-1">
          <ResourceItem type={item as any} quantity={1} size="sm" interactive={false} />
        </div>
      ) : (
        isOver && (
          <div className="w-full h-full flex items-center justify-center text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
          </div>
        )
      )}
      
      {/* Cell coordinates for debugging */}
      {/* <div className="absolute bottom-0 right-0 text-xs text-gray-400">{row},{col}</div> */}
    </div>
  );
};

export default CraftingCell;