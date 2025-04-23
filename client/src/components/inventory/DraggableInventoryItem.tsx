import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from '@/components/ui/button';
import { getItemDetails } from '@/lib/itemDatabase';
import { getRarityColorClass } from '@/lib/styleUtils';
import { LootBox } from '@/pages/new-inventory';

// Define drag item type
export const INVENTORY_ITEM = 'inventoryItem';

interface DraggableInventoryItemProps {
  item: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox} | null;
  index: number;
  renderResourceIcon: (type: string, size?: string) => React.ReactNode;
  handleItemHover: (type: string) => void;
  handleItemClick: (item: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox}) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;
  onLootBoxOpen: (lootBox: LootBox) => void;
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
  
  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: INVENTORY_ITEM,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  
  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: INVENTORY_ITEM,
    drop(dragItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);
    },
    hover(dragItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      dragItem.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  
  // Initialize drag and drop refs using reference merging
  const dragDropRef = (node: HTMLDivElement | null) => {
    ref.current = node;
    drag(drop(node));
  };
  
  if (!item) return null;
  
  const opacity = isDragging ? 0.4 : 1;
  
  return (
    <div 
      ref={dragDropRef}
      className={`aspect-square ${getRarityColorClass(item.type)} hover:border-brand-orange/60 hover:shadow-md rounded-md p-1 relative cursor-pointer transition-all duration-200`}
      style={{ opacity }}
      onMouseEnter={() => handleItemHover(item.type)}
      onClick={() => handleItemClick(item)}
    >
      <div className="flex items-center justify-center h-full">
        {item.isLootBox ? (
          <div className="w-full h-full flex items-center justify-center rounded-md overflow-hidden bg-space-mid">
            <img 
              src="/images/loot-crate.png" 
              alt="Loot Crate"
              className="w-full h-full object-contain" 
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            {renderResourceIcon(item.type)}
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
      <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-xs bg-space-darkest/80 rounded-tl-md rounded-br-sm">
        {item.quantity}
      </div>
      {isOver && (
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
              if (item.lootBoxData) {
                onLootBoxOpen(item.lootBoxData);
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