import React from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { INVENTORY_ITEM } from '@/components/inventory/DraggableInventoryItem';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getItemDetails } from '@/lib/itemDatabase';

// Define the types of equipment slots
export type SlotType = 'head' | 'torso' | 'legs' | 'accessory' | 'hands';

// Equipment item structure
interface EquipmentItem {
  id: number;
  userId: number;
  itemId: string;
  slot: SlotType;
  equippedAt: string;
}

interface EquipmentSlotProps {
  slot: SlotType;
  equipmentItem?: EquipmentItem;
  onEquip: (itemId: string) => void;
  onUnequip: () => void;
  icon: React.ReactNode;
  label: string;
}

interface DragItem {
  type: string;
  id: string;
}

export function EquipmentSlot({
  slot,
  equipmentItem,
  onEquip,
  onUnequip,
  icon,
  label
}: EquipmentSlotProps) {
  // Set up drop target
  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: INVENTORY_ITEM,
    drop: (item: DragItem) => {
      // Handle drop of an item onto this slot
      // The dropped item should be equipped to this slot
      if (item.type) {
        onEquip(item.type);
      }
    },
    canDrop: (item: DragItem, monitor: DropTargetMonitor<DragItem, void>) => {
      // Check if this item can be equipped in this slot
      const itemDetails = getItemDetails(item.type);
      return !!(itemDetails?.isEquippable && itemDetails?.equipSlot === slot);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Visual styles based on drop state
  const borderColor = isOver && canDrop 
    ? 'border-brand-orange' 
    : equipmentItem 
      ? 'border-brand-blue' 
      : 'border-space-light/30';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            ref={drop}
            className={`
              w-12 h-12 rounded-md bg-space-dark/70 
              border-2 ${borderColor} transition-colors
              flex items-center justify-center relative
            `}
          >
            {equipmentItem ? (
              // Show equipped item
              <div className="w-full h-full relative">
                <img 
                  src={getItemDetails(equipmentItem.itemId)?.imagePath || ''} 
                  alt={getItemDetails(equipmentItem.itemId)?.name || 'Equipment'} 
                  className="pixelated w-10 h-10 object-contain absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ imageRendering: 'pixelated' }}
                />
                
                {/* Unequip button */}
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnequip();
                  }}
                >
                  <span className="text-[10px]">×</span>
                </Button>
                
                {/* Rarity glow */}
                {getItemDetails(equipmentItem.itemId)?.rarity !== 'common' && (
                  <div 
                    className="absolute inset-0 rounded-sm opacity-30 animate-pulse-slow"
                    style={{
                      boxShadow: `0 0 5px 2px ${
                        getItemDetails(equipmentItem.itemId)?.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.8)' :
                        getItemDetails(equipmentItem.itemId)?.rarity === 'epic' ? 'rgba(168, 85, 247, 0.8)' :
                        getItemDetails(equipmentItem.itemId)?.rarity === 'rare' ? 'rgba(59, 130, 246, 0.8)' :
                        'rgba(34, 197, 94, 0.8)'
                      }`
                    }}
                  ></div>
                )}
              </div>
            ) : (
              // Show empty slot with icon
              <div className="text-space-light/40">
                {icon}
              </div>
            )}
            
            {/* Highlight for valid drop target */}
            {isOver && canDrop && (
              <div className="absolute inset-0 bg-brand-orange/20 border-2 border-brand-orange/40 rounded-sm z-10"></div>
            )}
            
            {/* Invalid drop target */}
            {isOver && !canDrop && (
              <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500/40 rounded-sm z-10"></div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-center">
            <div className="font-medium">{label} Slot</div>
            {equipmentItem ? (
              <div>
                <div className={`
                  text-sm
                  ${getItemDetails(equipmentItem.itemId)?.rarity === 'legendary' ? 'text-amber-300' : ''}
                  ${getItemDetails(equipmentItem.itemId)?.rarity === 'epic' ? 'text-purple-300' : ''}
                  ${getItemDetails(equipmentItem.itemId)?.rarity === 'rare' ? 'text-blue-300' : ''}
                  ${getItemDetails(equipmentItem.itemId)?.rarity === 'uncommon' ? 'text-green-300' : ''}
                `}>
                  {getItemDetails(equipmentItem.itemId)?.name}
                </div>
                <div className="text-xs text-space-light/60 mt-1">Click × to unequip</div>
              </div>
            ) : (
              <div className="text-xs text-space-light/60">
                Drag an item here to equip
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}