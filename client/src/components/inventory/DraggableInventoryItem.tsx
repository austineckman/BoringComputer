import { useDrag, useDrop } from 'react-dnd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { getItemDetails } from '@/lib/itemDatabase';
import { LootBox } from '@/pages/new-inventory';
import { getLootCrateImage } from '@/lib/assetUtils';
import { getRarityColorClass } from '@/lib/styleUtils';

// Define the item type identifier for drag & drop
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
  
  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: INVENTORY_ITEM,
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  // Set up drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: INVENTORY_ITEM,
    drop: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  
  // Apply refs to make the element both draggable and a drop target
  const dragDropRef = (el: HTMLDivElement) => {
    drag(el);
    drop(el);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            ref={dragDropRef}
            className={`aspect-square 
              ${item ? `${getRarityColorClass(item.type)} hover:border-brand-orange/60 hover:shadow-md` : 'bg-space-dark border-space-light/10'} 
              ${isDragging ? 'opacity-30' : 'opacity-100'}
              ${isOver ? 'border-dashed border-brand-yellow' : ''}
              rounded-md p-1 relative cursor-pointer transition-all duration-200`}
            onMouseEnter={() => item && handleItemHover(item.type)}
            onClick={() => item && handleItemClick(item)}
          >
            {item && (
              <>
                <div className="flex items-center justify-center h-full">
                  {item.isLootBox ? (
                    <div className={`w-full h-full flex items-center justify-center rounded-md overflow-hidden bg-space-mid`}>
                      <img 
                        src={getLootCrateImage().src} 
                        alt={getLootCrateImage().alt}
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
              </>
            )}
          </div>
        </TooltipTrigger>
        {item && (
          <TooltipContent side="top" className="bg-space-dark border-brand-orange/30 text-brand-light p-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-bold capitalize text-brand-orange">
                  {getItemDetails(item.type).name}
                </p>
                <div className={`px-1.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                  getItemDetails(item.type).rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                  getItemDetails(item.type).rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                  getItemDetails(item.type).rarity === 'rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' :
                  getItemDetails(item.type).rarity === 'uncommon' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                  'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                }`}>
                  {getItemDetails(item.type).rarity}
                </div>
              </div>
              <p className="text-xs text-brand-light/70">
                {getItemDetails(item.type).flavorText.substring(0, 60)}...
              </p>
              <p className="text-xs text-brand-yellow">
                Quantity: {item.quantity}
              </p>
              {/* Show equipment slot in tooltip */}
              {getItemDetails(item.type).isEquippable && (
                <div className="mt-1 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-brand-yellow"></span>
                  <span className="text-brand-light/80">
                    Equips to: <span className="text-brand-light font-medium capitalize">{getItemDetails(item.type).equipSlot}</span>
                  </span>
                </div>
              )}
              {item.isLootBox && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full bg-brand-orange/20 hover:bg-brand-orange/30 border-brand-orange/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.lootBoxData) {
                      onLootBoxOpen(item.lootBoxData);
                    }
                  }}
                >
                  Open Crate
                </Button>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}