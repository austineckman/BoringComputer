import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

// Placeholder for character base image
const CHARACTER_BASE_IMAGE = '/images/character-base.png';

// Types for our equipment slots
type EquipmentSlot = 'head' | 'torso' | 'legs' | 'accessory' | 'hands';

interface EquipmentSlotInfo {
  id: EquipmentSlot;
  name: string;
  icon: string;
  description: string;
}

// Equipment slot definitions
const EQUIPMENT_SLOTS: EquipmentSlotInfo[] = [
  { 
    id: 'head', 
    name: 'Head', 
    icon: '👑', 
    description: 'Helmets, goggles, and headwear'
  },
  { 
    id: 'torso', 
    name: 'Torso', 
    icon: '👕', 
    description: 'Chest armor, shirts, and robes'
  },
  { 
    id: 'legs', 
    name: 'Legs', 
    icon: '👖', 
    description: 'Pants, greaves, and leg protectors'
  },
  { 
    id: 'accessory', 
    name: 'Accessory', 
    icon: '🔮', 
    description: 'Capes, wings, and jewelry'
  },
  { 
    id: 'hands', 
    name: 'Hands', 
    icon: '🧤', 
    description: 'Weapons, tools, and gloves'
  }
];

// Rarity colors for styling
const RARITY_COLORS = {
  common: 'bg-gray-200 text-gray-800',
  uncommon: 'bg-green-200 text-green-800',
  rare: 'bg-blue-200 text-blue-800',
  epic: 'bg-purple-200 text-purple-800',
  legendary: 'bg-orange-200 text-orange-800'
};

// Main Character Equipment Component
const CharacterPage = () => {
  // State for the currently selected slot
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>('head');
  
  // Fetch character equipment data
  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['/api/character/equipment'],
    select: (data) => data || {}
  });
  
  // Fetch inventory items
  const { data: inventoryItems, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/inventory'],
    select: (data) => data || []
  });
  
  // Filter inventory items by the selected slot type
  const filteredItems = React.useMemo(() => {
    if (!inventoryItems) return [];
    
    // This is where we would filter items by their slot type
    // For now, we'll just return all items as a placeholder
    return inventoryItems;
  }, [inventoryItems, selectedSlot]);
  
  // Handle equipping an item
  const handleEquipItem = (itemId: string) => {
    // In the future, this will call an API to equip the item
    console.log(`Equipping item ${itemId} to ${selectedSlot} slot`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Character Equipment</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Character Preview Section */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardContent className="flex items-center justify-center p-6 h-[500px]">
              {equipmentLoading ? (
                <Skeleton className="h-full w-3/4" />
              ) : (
                <div className="relative w-3/4 h-full flex items-center justify-center">
                  {/* Base character image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-[300px] w-[150px] bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-400">Character Preview</span>
                    </div>
                  </div>
                  
                  {/* Equipped items would layer on top as absolute positioned elements */}
                  {/* Example of how an equipped item might look: */}
                  {equipment?.head && (
                    <div className="absolute top-[50px] left-1/2 transform -translate-x-1/2">
                      <img 
                        src={equipment.head.imagePath} 
                        alt={equipment.head.name} 
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Equipment Slots Section */}
        <div>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Equipment</h2>
              
              <div className="space-y-4">
                {EQUIPMENT_SLOTS.map((slot) => (
                  <Card 
                    key={slot.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedSlot === slot.id ? "ring-2 ring-primary" : ""
                    )}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <CardContent className="p-3 flex items-center space-x-3">
                      <div className="text-2xl">{slot.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{slot.name}</h3>
                        <p className="text-sm text-gray-500">{slot.description}</p>
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        {equipment?.[slot.id] ? (
                          <img 
                            src={equipment[slot.id].imagePath} 
                            alt={equipment[slot.id].name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">Empty</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Inventory Items Section */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Available Items</h2>
            <Badge variant="outline">
              {selectedSlot.charAt(0).toUpperCase() + selectedSlot.slice(1)} Items
            </Badge>
          </div>
          
          {inventoryLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items available for this slot
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.map((item: any) => (
                <TooltipProvider key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className={cn(
                          "cursor-pointer hover:shadow-md transition-all",
                          RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common
                        )}
                        onClick={() => handleEquipItem(item.id)}
                      >
                        <CardContent className="p-3 flex flex-col items-center">
                          <div className="w-16 h-16 bg-white rounded-md overflow-hidden mb-2 flex items-center justify-center">
                            {item.imagePath ? (
                              <img 
                                src={item.imagePath} 
                                alt={item.name}
                                className="w-14 h-14 object-contain"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-center line-clamp-1">
                            {item.name}
                          </h3>
                          <div className="text-xs mt-1">
                            Qty: {item.quantity}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs">{item.description}</p>
                        <p className="text-xs italic">{item.flavorText}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.rarity}
                        </Badge>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CharacterPage;