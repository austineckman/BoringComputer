import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { getItemDetails } from '@/lib/itemDatabase';
import { getRarityColorClass } from '@/lib/styleUtils';
import { LootBox } from '@/pages/new-inventory';

// Define drag item types
export const INVENTORY_ITEM = 'inventoryItem';
export const EMPTY_SLOT = 'emptySlot';

// Props for empty slots
interface EmptySlotProps {
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
}

// Component for empty inventory slots that can be drop targets
export function DraggableEmptySlot({ index, moveItem }: EmptySlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Set up drop target for empty slots
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: INVENTORY_ITEM,
    drop: (draggedItem: { index: number, type: string }) => {
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Move the item to this empty slot
      moveItem(dragIndex, hoverIndex);
      
      // Update the index of the dragged item
      draggedItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Initialize the drop ref
  drop(ref);
  
  return (
    <div 
      ref={ref}
      className="w-full h-full rounded-md pixel-empty-slot"
    >
      <div className="w-full h-full flex items-center justify-center">
        {/* Empty slot - no + sign */}
      </div>
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-brand-orange/20 border-2 border-brand-orange/40 rounded-md z-10"></div>
      )}
    </div>
  );
}

interface DraggableInventoryItemProps {
  item: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox} | null;
  index: number;
  renderResourceIcon: (type: string, size?: string) => React.ReactNode;
  handleItemHover: (type: string) => void;
  handleItemClick: (item: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox}) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  onLootBoxOpen: (lootBox: LootBox) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function DraggableInventoryItem({
  item,
  index,
  renderResourceIcon,
  handleItemHover,
  handleItemClick,
  moveItem,
  onLootBoxOpen
}: DraggableInventoryItemProps) {
  
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  
  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: INVENTORY_ITEM,
    item: () => {
      return { index, id: `item-${index}`, type: INVENTORY_ITEM }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        // Reset if not dropped on a valid target
        // No action needed, React will maintain the original state
      }
    }
  });
  
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: INVENTORY_ITEM,
    drop: (draggedItem: DragItem) => {
      const dragIndex = draggedItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Call the moveItem function to handle the swap logic
      moveItem(dragIndex, hoverIndex);
      
      // Update the index of the dragged item
      draggedItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  // Initialize drag and drop refs using reference merging
  drag(drop(ref));
  
  if (!item) return null;
  
  const opacity = isDragging ? 0.4 : 1;
  
  // Get item details for rarity info
  const itemDetails = getItemDetails(item.type);
  const rarity = itemDetails?.rarity || 'common';

  return (
    <div 
      ref={ref}
      className={`aspect-square pixel-item-container rarity-${rarity} rounded-md p-1 relative cursor-pointer ${isDragging ? 'dragging' : ''}`}
      style={{ opacity }}
      onMouseEnter={() => handleItemHover(item.type)}
      onClick={() => {
        if (item.isLootBox && item.lootBoxData && item.lootBoxData.id) {
          // Use the loot box modal instead of navigation
          if (onLootBoxOpen) {
            onLootBoxOpen(item.lootBoxData);
          }
        } else {
          // Regular item click handling
          handleItemClick(item);
        }
      }}
    >
      <div className="flex items-center justify-center h-full relative">
        {item.isLootBox ? (
          <div className="w-full h-full flex items-center justify-center rounded-md overflow-hidden">
            <img 
              src={item.lootBoxData?.image || "/images/loot-crate.png"} 
              alt={item.lootBoxData?.name || "Loot Crate"}
              className="w-[32px] h-[32px] pixelated transform scale-[2] origin-center" 
              title={item.lootBoxData?.name || "Loot Crate"}
            />
          </div>
        ) : (
          <div className="pixel-scale-2 relative">
            {/* Using exact size for 32x32 pixel art with 2x scaling */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <img 
                src={itemDetails?.imagePath || ''}
                alt={itemDetails?.name || item.type}
                className="w-[32px] h-[32px] pixelated transform scale-[2] origin-center" 
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            
            {/* Equipment icon badge - only for equippable items */}
            {getItemDetails(item.type).isEquippable && (
              <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-brand-yellow border border-brand-dark" 
                   title={`Equippable: ${getItemDetails(item.type).equipSlot}`}>
              </div>
            )}
            
            {/* Glow effect for rare items */}
            {getItemDetails(item.type).rarity !== 'common' && (
              <div className="absolute inset-0 rounded-lg animate-pulse-slow opacity-50" 
                   style={{
                     boxShadow: `0 0 8px 1px ${
                       getItemDetails(item.type).rarity === 'legendary' ? 'rgba(245, 158, 11, 0.5)' :
                       getItemDetails(item.type).rarity === 'epic' ? 'rgba(168, 85, 247, 0.5)' :
                       getItemDetails(item.type).rarity === 'rare' ? 'rgba(59, 130, 246, 0.5)' :
                       'rgba(34, 197, 94, 0.5)'
                     }`
                   }}></div>
            )}
          </div>
        )}
      </div>
      <div className="pixel-quantity-badge">
        {item.quantity}
      </div>
      
      {/* Visual indicator for drop target */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-brand-orange/20 border-2 border-brand-orange/40 rounded-md z-10"></div>
      )}
      
      {/* Loot box open button */}
      {item.isLootBox && (
        <div className="absolute bottom-0 left-0 w-full flex justify-center mb-5">
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2 py-0.5 text-xs bg-brand-orange/20 hover:bg-brand-orange/30 border-brand-orange/30"
            onClick={(e) => {
              e.stopPropagation();
              if (item.lootBoxData && item.lootBoxData.id) {
                // Use the loot box modal instead of navigation
                if (onLootBoxOpen) {
                  onLootBoxOpen(item.lootBoxData);
                }
              }
            }}
          >
            Open
          </Button>
        </div>
      )}
    </div>
  );
}