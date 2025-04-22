import React from 'react';
import { useDrag } from 'react-dnd';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getItemDetails } from '@/lib/itemDatabase';

interface InventoryItemProps {
  itemId: string;
  quantity: number;
  onUse?: (itemId: string) => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ itemId, quantity, onUse }) => {
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  
  // Get item details
  const itemDetails = getItemDetails(itemId);
  
  // Set up drag
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item: { itemId, sourceType: 'INVENTORY' },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        // Item was not dropped on a valid target
        sounds.hover();
      }
    },
  }), [itemId]);

  const handleItemClick = () => {
    if (onUse) {
      onUse(itemId);
    } else {
      // Show item details in a toast
      toast({
        title: itemDetails.name,
        description: itemDetails.description,
        duration: 3000,
      });
      sounds.click();
    }
  };

  return (
    <div
      ref={drag}
      className={`
        relative p-1 border-2 border-gray-300 dark:border-gray-700 rounded-md 
        hover:border-amber-400 dark:hover:border-amber-500 bg-gray-100 dark:bg-gray-800
        cursor-grab active:cursor-grabbing transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={handleItemClick}
    >
      <div className="w-12 h-12 flex items-center justify-center">
        <img
          src={itemDetails.imagePath || `/items/${itemId}.png`}
          alt={itemDetails.name}
          className="max-w-full max-h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-item.png';
          }}
        />
      </div>
      <div className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-tl-md">
        {quantity}
      </div>
    </div>
  );
};

export default InventoryItem;