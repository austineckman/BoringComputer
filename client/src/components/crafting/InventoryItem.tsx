import React from 'react';
import { Card } from '@/components/ui/card';
import { useDrag } from 'react-dnd';
import { cn } from '@/lib/utils';
import { getItemDetails } from '@/lib/itemDatabase';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Badge } from '@/components/ui/badge';

interface InventoryItemProps {
  itemId: string;
  quantity: number;
  isRequired?: boolean;
  requiredAmount?: number;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  itemId,
  quantity,
  isRequired = false,
  requiredAmount = 0
}) => {
  const { sounds } = useSoundEffects();
  
  // Get item details from database
  const itemDetails = getItemDetails(itemId);
  
  // Determine if we have enough of this item for the recipe
  const hasEnough = isRequired ? quantity >= requiredAmount : false;
  
  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'item',
    item: { itemId },
    canDrag: quantity > 0,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (_item, monitor) => {
      if (monitor.didDrop()) {
        sounds.craftPickup();
      }
    },
  }), [itemId, quantity]);
  
  // When the user begins dragging, play a sound
  const handleDragStart = () => {
    sounds.hover();
  };
  
  // Get rarity-based styling
  const getRarityStyle = () => {
    switch (itemDetails?.rarity) {
      case 'legendary':
        return 'border-amber-500 bg-amber-500/5';
      case 'epic':
        return 'border-purple-500 bg-purple-500/5';
      case 'rare':
        return 'border-blue-500 bg-blue-500/5';
      case 'uncommon':
        return 'border-green-500 bg-green-500/5';
      default:
        return 'border-gray-300 bg-background';
    }
  };
  
  return (
    <Card
      ref={drag}
      onDragStart={handleDragStart}
      className={cn(
        'p-1 cursor-grab hover:shadow-md transition-all duration-200 relative',
        getRarityStyle(),
        isDragging && 'opacity-50',
        !quantity && 'opacity-30 cursor-not-allowed',
        isRequired && !hasEnough && 'border-red-400 animate-pulse'
      )}
      title={`${itemDetails?.name || itemId} (${quantity})`}
    >
      <div className="w-full aspect-square relative flex items-center justify-center">
        <img 
          src={itemDetails?.imagePath} 
          alt={itemDetails?.name || itemId}
          className="w-[32px] h-[32px] object-contain pixelated transform scale-[1.25] origin-center"
          style={{ imageRendering: 'pixelated' }}
        />
        
        <div className="absolute bottom-0 right-0 text-xs font-semibold bg-background/80 px-1 rounded-tl-md">
          {quantity}
        </div>
        
        {isRequired && (
          <Badge 
            variant="outline" 
            className={cn(
              'absolute top-0 left-0 text-xs',
              hasEnough ? 'border-green-400' : 'border-red-400'
            )}
          >
            {requiredAmount}
            {hasEnough ? ' ✓' : ''}
          </Badge>
        )}
      </div>
    </Card>
  );
};

export default InventoryItem;