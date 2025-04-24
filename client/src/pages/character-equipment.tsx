import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Zap, Award, SkullIcon, Swords } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentSlot } from '@/components/character/EquipmentSlot';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { getItemDetails } from '@/lib/itemDatabase';

// Import the base character and wall background
import baseCharacterImage from '@assets/basecharacter.png';
import wallBackgroundImage from '@assets/wallbg.png';

// Equipment slot types
type SlotType = 'head' | 'torso' | 'legs' | 'accessory' | 'hands';

// Equipment item structure
interface EquipmentItem {
  id: number;
  userId: number;
  itemId: string;
  slot: SlotType;
  equippedAt: string;
}

// Inventory item structure
interface InventoryItem {
  type: string;
  quantity: number;
}

export default function CharacterEquipment() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('equipment');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Fetch the user's equipment
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/character/equipment'],
    queryFn: () => fetch('/api/character/equipment').then(res => res.json()),
    enabled: !!user,
  });

  // Fetch the user's inventory
  const { data: inventory, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()),
    enabled: !!user,
  });

  // Fetch all items (for item details)
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/items'],
    queryFn: () => fetch('/api/items').then(res => res.json()),
  });

  // Group equipment by slot
  const equipmentBySlot = React.useMemo(() => {
    if (!equipment) return {} as Record<SlotType, EquipmentItem>;
    
    const result = {} as Record<SlotType, EquipmentItem>;
    equipment.forEach((item: EquipmentItem) => {
      result[item.slot] = item;
    });
    
    return result;
  }, [equipment]);

  // Filter inventory for equippable items
  const equippableItems = React.useMemo(() => {
    if (!inventory || !items) return [];
    
    return inventory
      .filter((invItem: InventoryItem) => {
        const itemDetails = getItemDetails(invItem.type);
        return itemDetails?.isEquippable && invItem.quantity > 0;
      })
      .sort((a: InventoryItem, b: InventoryItem) => {
        const itemA = getItemDetails(a.type);
        const itemB = getItemDetails(b.type);
        
        // Sort by rarity first (legendary -> common)
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        const rarityDiff = rarityOrder[itemA.rarity] - rarityOrder[itemB.rarity];
        
        if (rarityDiff !== 0) return rarityDiff;
        
        // If same rarity, sort by name
        return itemA.name.localeCompare(itemB.name);
      });
  }, [inventory, items]);

  // Mutation for equipping items
  const equipMutation = useMutation({
    mutationFn: async ({ itemId, slot }: { itemId: string, slot: SlotType }) => {
      const response = await apiRequest('POST', '/api/character/equipment', { itemId, slot });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      sounds.achievement();
      toast({
        title: "Item equipped!",
        description: "Your character gear has been updated.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      sounds.error();
      toast({
        title: "Failed to equip item",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation for unequipping items
  const unequipMutation = useMutation({
    mutationFn: async (slot: SlotType) => {
      const response = await apiRequest('DELETE', `/api/character/equipment/${slot}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      sounds.hover();
      toast({
        title: "Item unequipped",
        description: "Equipment removed from your character.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      sounds.error();
      toast({
        title: "Failed to remove equipment",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle equipping an item to a slot
  const handleEquipItem = (itemId: string, slot: SlotType) => {
    equipMutation.mutate({ itemId, slot });
  };

  // Handle unequipping an item from a slot
  const handleUnequipItem = (slot: SlotType) => {
    unequipMutation.mutate(slot);
  };

  // Handle selecting an item in inventory
  const handleSelectItem = (itemId: string) => {
    setSelectedItem(itemId === selectedItem ? null : itemId);
    sounds.hover();
  };

  // Loading state
  if (isLoadingEquipment || isLoadingInventory || isLoadingItems) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="container mx-auto px-4 py-6"
        style={{
          backgroundImage: `url(${wallBackgroundImage})`,
          backgroundSize: 'repeat',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Character with Equipment */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <Card className="shadow-lg border-2 border-brand-orange/20 bg-space-dark/80 backdrop-blur">
              <CardHeader className="pb-1">
                <CardTitle className="text-xl font-pixel text-brand-orange">Character Sheet</CardTitle>
                <CardDescription>Equip items to customize your character</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                {/* Character Panel */}
                <div className="relative w-full aspect-square bg-space-dark/60 rounded-lg border border-space-light/20 overflow-hidden">
                  {/* Base Character Image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src={baseCharacterImage} 
                      alt="Base Character" 
                      className="pixelated w-40 h-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  
                  {/* Equipped Items as Overlays */}
                  {Object.entries(equipmentBySlot).map(([slot, item]) => {
                    const itemDetails = getItemDetails(item.itemId);
                    // Check if item has custom overlay image, fall back to regular image
                    const overlayImage = itemDetails?.overlayPath || itemDetails?.imagePath;
                    
                    if (!overlayImage) return null;
                    
                    // Position the overlay based on slot
                    const positionClass = 
                      slot === 'head' ? 'top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 
                      slot === 'torso' ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                      slot === 'legs' ? 'bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2' :
                      slot === 'hands' ? 'top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2' :
                      'bottom-1/3 right-1/3 transform translate-x-1/2 translate-y-1/2'; // accessory
                    
                    return (
                      <div 
                        key={slot} 
                        className={`absolute ${positionClass} pointer-events-none z-10`}
                      >
                        <img 
                          src={overlayImage} 
                          alt={itemDetails?.name}
                          className="pixelated w-16 h-16 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    );
                  })}
                  
                  {/* Equipment Slots */}
                  <div className="absolute inset-0 grid grid-cols-1 z-20">
                    {/* Head Slot */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <EquipmentSlot
                        slot="head"
                        equipmentItem={equipmentBySlot.head}
                        onEquip={(itemId) => handleEquipItem(itemId, 'head')}
                        onUnequip={() => handleUnequipItem('head')}
                        icon={<SkullIcon size={16} />}
                        label="Head"
                      />
                    </div>
                    
                    {/* Torso Slot */}
                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                      <EquipmentSlot
                        slot="torso"
                        equipmentItem={equipmentBySlot.torso}
                        onEquip={(itemId) => handleEquipItem(itemId, 'torso')}
                        onUnequip={() => handleUnequipItem('torso')}
                        icon={<Shield size={16} />}
                        label="Torso"
                      />
                    </div>
                    
                    {/* Legs Slot */}
                    <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
                      <EquipmentSlot
                        slot="legs"
                        equipmentItem={equipmentBySlot.legs}
                        onEquip={(itemId) => handleEquipItem(itemId, 'legs')}
                        onUnequip={() => handleUnequipItem('legs')}
                        icon={<Zap size={16} />}
                        label="Legs"
                      />
                    </div>
                    
                    {/* Hands Slot */}
                    <div className="absolute top-1/2 left-10 transform -translate-y-1/2">
                      <EquipmentSlot
                        slot="hands"
                        equipmentItem={equipmentBySlot.hands}
                        onEquip={(itemId) => handleEquipItem(itemId, 'hands')}
                        onUnequip={() => handleUnequipItem('hands')}
                        icon={<Swords size={16} />}
                        label="Hands"
                      />
                    </div>
                    
                    {/* Accessory Slot */}
                    <div className="absolute top-1/2 right-10 transform -translate-y-1/2">
                      <EquipmentSlot
                        slot="accessory"
                        equipmentItem={equipmentBySlot.accessory}
                        onEquip={(itemId) => handleEquipItem(itemId, 'accessory')}
                        onUnequip={() => handleUnequipItem('accessory')}
                        icon={<Award size={16} />}
                        label="Accessory"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Character Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-space-dark/80 p-3 rounded-md border border-space-light/20">
                    <div className="text-xs text-brand-light/80">Level</div>
                    <div className="text-lg font-bold text-brand-orange">{user?.level || 1}</div>
                  </div>
                  <div className="bg-space-dark/80 p-3 rounded-md border border-space-light/20">
                    <div className="text-xs text-brand-light/80">XP</div>
                    <div className="text-lg font-bold text-brand-blue">{user?.xp || 0}</div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter>
                <p className="text-xs text-space-light/60">Equip items to enhance your character and unlock new abilities</p>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right Column - Inventory and Equipment */}
          <div className="w-full md:w-1/2 lg:w-3/5">
            <Tabs defaultValue="equipment" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="equipment">Available Equipment</TabsTrigger>
                <TabsTrigger value="stats">Bonuses & Stats</TabsTrigger>
              </TabsList>
              
              <TabsContent value="equipment" className="space-y-4">
                <Card className="shadow-lg border-2 border-brand-orange/20 bg-space-dark/80 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-pixel text-brand-orange">Equippable Items</CardTitle>
                    <CardDescription>Drag items to equipment slots or click to select</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {equippableItems.length === 0 ? (
                      <div className="text-center py-8 text-space-light/60">
                        <p>You don't have any equippable items yet.</p>
                        <p className="mt-2 text-sm">Complete quests or craft equipment to obtain gear!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {equippableItems.map((item: InventoryItem) => {
                          const itemDetails = getItemDetails(item.type);
                          
                          return (
                            <TooltipProvider key={item.type}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={`
                                      bg-space-mid p-2 rounded-md border border-space-light/20 flex flex-col items-center cursor-pointer
                                      hover:bg-space-light/10 transition-colors
                                      ${selectedItem === item.type ? 'ring-2 ring-brand-orange' : ''}
                                      ${itemDetails?.rarity === 'legendary' ? 'border-amber-500/50' : ''}
                                      ${itemDetails?.rarity === 'epic' ? 'border-purple-500/50' : ''}
                                      ${itemDetails?.rarity === 'rare' ? 'border-blue-500/50' : ''}
                                      ${itemDetails?.rarity === 'uncommon' ? 'border-green-500/50' : ''}
                                    `}
                                    onClick={() => handleSelectItem(item.type)}
                                  >
                                    <div className="relative w-12 h-12 mb-1">
                                      <img 
                                        src={itemDetails?.imagePath} 
                                        alt={itemDetails?.name} 
                                        className="pixelated w-full h-full object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                      />
                                      
                                      {/* Rarity indicator */}
                                      <div className={`
                                        absolute inset-0 rounded opacity-20
                                        ${itemDetails?.rarity === 'legendary' ? 'bg-gradient-to-br from-amber-300 to-transparent' : ''}
                                        ${itemDetails?.rarity === 'epic' ? 'bg-gradient-to-br from-purple-300 to-transparent' : ''}
                                        ${itemDetails?.rarity === 'rare' ? 'bg-gradient-to-br from-blue-300 to-transparent' : ''}
                                        ${itemDetails?.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-300 to-transparent' : ''}
                                      `}></div>
                                      
                                      {/* Quantity badge */}
                                      <div className="absolute bottom-0 right-0 bg-space-dark/80 text-xs px-1 rounded-sm border border-space-light/20">
                                        {item.quantity}
                                      </div>
                                    </div>
                                    
                                    <div className="w-full text-center">
                                      <div className="text-xs font-medium truncate">{itemDetails?.name}</div>
                                      <div className="text-xxs text-space-light/60 truncate">
                                        {itemDetails?.equipSlot}
                                      </div>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="w-64">
                                  <div>
                                    <div className={`
                                      text-sm font-bold mb-1
                                      ${itemDetails?.rarity === 'legendary' ? 'text-amber-300' : ''}
                                      ${itemDetails?.rarity === 'epic' ? 'text-purple-300' : ''}
                                      ${itemDetails?.rarity === 'rare' ? 'text-blue-300' : ''}
                                      ${itemDetails?.rarity === 'uncommon' ? 'text-green-300' : ''}
                                      ${itemDetails?.rarity === 'common' ? 'text-gray-300' : ''}
                                    `}>
                                      {itemDetails?.name}
                                    </div>
                                    <div className="text-xs mb-2">{itemDetails?.description}</div>
                                    {itemDetails?.flavorText && (
                                      <div className="text-xs italic text-space-light/60 border-t border-space-light/20 pt-1 mt-1">
                                        "{itemDetails.flavorText}"
                                      </div>
                                    )}
                                    <div className="mt-2 flex justify-between items-center">
                                      <div className="text-xxs uppercase font-semibold">
                                        {itemDetails?.rarity} • {itemDetails?.equipSlot}
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="h-7 text-xs px-2"
                                        onClick={() => {
                                          const slot = itemDetails?.equipSlot as SlotType;
                                          handleEquipItem(item.type, slot);
                                        }}
                                      >
                                        Equip
                                      </Button>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Selected Item Details */}
                {selectedItem && (
                  <Card className="shadow-lg border-2 border-brand-orange/20 bg-space-dark/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-pixel text-brand-orange">
                        {getItemDetails(selectedItem)?.name || 'Selected Item'}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-space-mid rounded-md border border-space-light/20 flex items-center justify-center">
                          <img 
                            src={getItemDetails(selectedItem)?.imagePath} 
                            alt={getItemDetails(selectedItem)?.name} 
                            className="pixelated w-16 h-16 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-sm mb-2">{getItemDetails(selectedItem)?.description}</p>
                          
                          {getItemDetails(selectedItem)?.flavorText && (
                            <p className="text-xs italic text-space-light/60">"{getItemDetails(selectedItem)?.flavorText}"</p>
                          )}
                          
                          <div className="flex justify-end mt-4">
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => {
                                const slot = getItemDetails(selectedItem)?.equipSlot as SlotType;
                                handleEquipItem(selectedItem, slot);
                              }}
                            >
                              Equip Item
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="stats">
                <Card className="shadow-lg border-2 border-brand-orange/20 bg-space-dark/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-xl font-pixel text-brand-orange">Character Stats</CardTitle>
                    <CardDescription>Stats and bonuses from your equipped gear</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-space-mid p-3 rounded-md border border-space-light/20">
                          <div className="text-xs text-brand-light/80">Defense Rating</div>
                          <div className="text-lg font-bold text-brand-blue">
                            {calculateTotalDefense(equipment)}
                          </div>
                        </div>
                        
                        <div className="bg-space-mid p-3 rounded-md border border-space-light/20">
                          <div className="text-xs text-brand-light/80">Magic Power</div>
                          <div className="text-lg font-bold text-purple-400">
                            {calculateTotalMagic(equipment)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-space-mid p-3 rounded-md border border-space-light/20">
                        <div className="text-xs text-brand-light/80 mb-1">Equipment Set</div>
                        <div className="text-sm">
                          {Object.entries(equipmentBySlot).map(([slot, item]) => (
                            <div key={slot} className="flex justify-between items-center py-1 border-b border-space-light/10 last:border-0">
                              <div className="capitalize">{slot}</div>
                              <div className="font-medium">{getItemDetails(item.itemId)?.name || '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Set Bonuses (future feature) */}
                      <div className="bg-space-mid p-3 rounded-md border border-space-light/20">
                        <div className="text-xs text-brand-light/80 mb-1">Set Bonuses</div>
                        <div className="text-sm italic text-space-light/60">
                          Complete equipment sets to unlock special bonuses.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

// Helper function to calculate total defense from equipment
function calculateTotalDefense(equipment: EquipmentItem[]) {
  if (!equipment || !Array.isArray(equipment)) return 0;
  
  // Based on rarity of items, sum up defense value
  return equipment.reduce((total, item) => {
    const itemDetails = getItemDetails(item.itemId);
    const rarityValue = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 5,
      legendary: 8
    };
    
    return total + (rarityValue[itemDetails?.rarity || 'common'] || 0);
  }, 0);
}

// Helper function to calculate total magic from equipment
function calculateTotalMagic(equipment: EquipmentItem[]) {
  if (!equipment || !Array.isArray(equipment)) return 0;
  
  // For now just count the number of magical items (epic or legendary)
  return equipment.reduce((total, item) => {
    const itemDetails = getItemDetails(item.itemId);
    if (itemDetails?.rarity === 'epic' || itemDetails?.rarity === 'legendary') {
      return total + 1;
    }
    return total;
  }, 0);
}