import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { getResourceIconProps } from '@/lib/resourceImages';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import wallBgImage from '@assets/wallbg.png';
import baseCharacterImage from '@assets/basecharacter.png';
import { getRarityColorClass } from '@/lib/styleUtils';

// Types
interface Equipment {
  id: string;
  name: string;
  description: string;
  flavorText: string | null;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  imagePath: string;
  equippedAt: string;
}

interface EquipmentState {
  head?: Equipment;
  chest?: Equipment;
  legs?: Equipment;
  feet?: Equipment;
  leftHand?: Equipment;
  rightHand?: Equipment;
  accessory1?: Equipment;
  accessory2?: Equipment;
}

interface InventoryItem {
  type: string;
  quantity: number;
  isEquippable?: boolean;
  equipSlot?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  name?: string;
}

// Component for displaying a single equipment slot
const EquipmentSlot = ({
  slot,
  item,
  onUnequip,
  onItemHover,
  onSlotClick,
}: {
  slot: string;
  item?: Equipment;
  onUnequip: (slot: string) => void;
  onItemHover: (item?: Equipment) => void;
  onSlotClick: (slot: string) => void;
}) => {
  const slotDisplayNames: Record<string, string> = {
    head: 'Head',
    chest: 'Chest',
    legs: 'Legs',
    feet: 'Feet',
    leftHand: 'Left Hand',
    rightHand: 'Right Hand',
    accessory1: 'Accessory 1',
    accessory2: 'Accessory 2',
  };

  // Determine slot icon based on slot type
  const getSlotIcon = () => {
    switch(slot) {
      case 'head': return '👑';
      case 'chest': return '👕';
      case 'legs': return '👖';
      case 'feet': return '👞';
      case 'leftHand': return '🛡️';
      case 'rightHand': return '⚔️';
      case 'accessory1': 
      case 'accessory2': 
        return '💍';
      default: return '📦';
    }
  };

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onItemHover(item)}
      onMouseLeave={() => onItemHover(undefined)}
    >
      <div 
        className={`
          w-16 h-16 border-2 rounded-md flex items-center justify-center
          ${item ? getRarityColorClass(item.rarity) : 'bg-gray-800 border-gray-600'}
          hover:border-brand-orange transition-all duration-200
          ${!item ? 'cursor-pointer' : ''}
        `}
        onClick={() => !item && onSlotClick(slot)}
      >
        {item ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={item.imagePath}
              alt={item.name}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnequip(slot);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              title="Unequip"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-lg">{getSlotIcon()}</span>
            <span className="text-gray-400 text-xs">{slotDisplayNames[slot]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component
export default function CharacterEquipment() {
  const [equipmentState, setEquipmentState] = useState<EquipmentState>({});
  const [hoveredItem, setHoveredItem] = useState<Equipment | undefined>();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const soundEffects = useSoundEffects();
  const queryClient = useQueryClient();

  // Fetch character equipment
  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['/api/character/equipment'],
    enabled: true,
  });

  // Fetch inventory items
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: true,
  });

  // Equip item mutation
  const equipMutation = useMutation({
    mutationFn: (data: { itemId: string; slot: string }) => {
      return apiRequest('/api/character/equip', 'POST', data);
    },
    onSuccess: () => {
      soundEffects.sounds.success();
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      setSelectedItem(null);
      setSelectedSlot(null);
    },
    onError: (error) => {
      console.error('Error equipping item:', error);
      soundEffects.sounds.error();
    },
  });

  // Unequip item mutation
  const unequipMutation = useMutation({
    mutationFn: (data: { slot: string }) => {
      return apiRequest('/api/character/unequip', 'POST', data);
    },
    onSuccess: () => {
      soundEffects.sounds.success();
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
    },
    onError: (error) => {
      console.error('Error unequipping item:', error);
      soundEffects.sounds.error();
    },
  });

  // Update equipment state when data is loaded
  useEffect(() => {
    if (equipment) {
      setEquipmentState(equipment);
    }
  }, [equipment]);

  // Handle equipping an item
  const handleEquipItem = (itemId: string, slot: string) => {
    equipMutation.mutate({ itemId, slot });
  };

  // Handle unequipping an item
  const handleUnequipItem = (slot: string) => {
    unequipMutation.mutate({ slot });
  };

  // Filter inventory to only show equippable items
  const equippableItems = inventory?.filter((item: InventoryItem) => 
    item.isEquippable && item.quantity > 0
  ) || [];

  const getEquippableItemsForSlot = (slot: string) => {
    return equippableItems.filter((item: InventoryItem) => 
      item.equipSlot === slot
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-brand-orange">Character Equipment</h2>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Character preview */}
          <Card className="flex-1 h-[600px] overflow-hidden relative">
            <CardContent className="p-0 h-full">
              <div 
                className="h-full w-full flex items-center justify-center relative"
                style={{ 
                  backgroundImage: `url(${wallBgImage})`,
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Base character image */}
                <div className="relative w-80 h-96">
                  <img 
                    src={baseCharacterImage} 
                    alt="Character" 
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                  
                  {/* Equipment overlays would go here in a more advanced implementation */}
                  {equipmentState.head && (
                    <img 
                      src={equipmentState.head.imagePath} 
                      alt={equipmentState.head.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.chest && (
                    <img 
                      src={equipmentState.chest.imagePath} 
                      alt={equipmentState.chest.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.legs && (
                    <img 
                      src={equipmentState.legs.imagePath} 
                      alt={equipmentState.legs.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.feet && (
                    <img 
                      src={equipmentState.feet.imagePath} 
                      alt={equipmentState.feet.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.leftHand && (
                    <img 
                      src={equipmentState.leftHand.imagePath} 
                      alt={equipmentState.leftHand.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.rightHand && (
                    <img 
                      src={equipmentState.rightHand.imagePath} 
                      alt={equipmentState.rightHand.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.accessory1 && (
                    <img 
                      src={equipmentState.accessory1.imagePath} 
                      alt={equipmentState.accessory1.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                  
                  {equipmentState.accessory2 && (
                    <img 
                      src={equipmentState.accessory2.imagePath} 
                      alt={equipmentState.accessory2.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Equipment slots and item details */}
          <div className="flex-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Equipment Slots</h3>
                
                <div className="grid grid-cols-4 gap-4">
                  <EquipmentSlot 
                    slot="head" 
                    item={equipmentState.head} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="chest" 
                    item={equipmentState.chest} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="legs" 
                    item={equipmentState.legs} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="feet" 
                    item={equipmentState.feet} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="leftHand" 
                    item={equipmentState.leftHand} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="rightHand" 
                    item={equipmentState.rightHand} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="accessory1" 
                    item={equipmentState.accessory1} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                  <EquipmentSlot 
                    slot="accessory2" 
                    item={equipmentState.accessory2} 
                    onUnequip={handleUnequipItem}
                    onItemHover={setHoveredItem}
                    onSlotClick={setSelectedSlot}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Item Detail Card */}
            <Card className="mb-6 bg-gray-850 border-gray-700">
              <CardContent className="p-6 min-h-[150px]">
                {hoveredItem ? (
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 flex-shrink-0 border-2 rounded-md p-1 ${getRarityColorClass(hoveredItem.rarity)}`}>
                      <img 
                        src={hoveredItem.imagePath} 
                        alt={hoveredItem.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-xl font-bold ${getRarityColorClass(hoveredItem.rarity, 'text')}`}>
                          {hoveredItem.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRarityColorClass(hoveredItem.rarity, 'bg')}`}>
                          {hoveredItem.rarity.charAt(0).toUpperCase() + hoveredItem.rarity.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{hoveredItem.description}</p>
                      {hoveredItem.flavorText && (
                        <p className="text-gray-400 text-xs italic border-l-2 border-gray-700 pl-2 mt-2">"{hoveredItem.flavorText}"</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Equipped at: {new Date(hoveredItem.equippedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : selectedSlot ? (
                  <div className="text-center">
                    <p className="text-gray-400">Select an item for the <span className="text-brand-orange font-medium">{selectedSlot}</span> slot</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-gray-400">Hover over an equipped item to see details</p>
                    <p className="text-gray-500 text-xs">Or click an empty slot to equip a new item</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Equippable Inventory Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Equippable Items</h3>
                
                {selectedSlot ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium">
                        Select an item for: <span className="text-brand-orange">{selectedSlot}</span>
                      </h4>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedSlot(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-3">
                      {getEquippableItemsForSlot(selectedSlot)
                        .map((item: InventoryItem) => (
                          <TooltipProvider key={item.type}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div 
                                  className={`
                                    w-12 h-12 border-2 rounded-md flex items-center justify-center cursor-pointer
                                    ${getRarityColorClass(item.rarity || 'common')}
                                  `}
                                  onClick={() => handleEquipItem(item.type, selectedSlot)}
                                >
                                  <div className="relative w-full h-full flex items-center justify-center">
                                    <img {...getResourceIconProps(item.type, "md")} />
                                    <div className="absolute bottom-0 right-0 bg-gray-800 bg-opacity-70 rounded-sm px-1 text-xs">
                                      {item.quantity}
                                    </div>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.name || item.type}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-400 mb-4">Click on an empty slot to equip an item</p>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {['head', 'chest', 'legs', 'feet', 'leftHand', 'rightHand', 'accessory1', 'accessory2'].map((slot) => (
                        <Button 
                          key={slot} 
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedSlot(slot)}
                          disabled={!!equipmentState[slot as keyof EquipmentState]}
                        >
                          {slot.charAt(0).toUpperCase() + slot.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-6 flex justify-center">
              <Link href="/character">
                <Button variant="outline">
                  Back to Character
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}