import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import baseCharacterImage from '@assets/basecharacter.png';

// Character base image
const CHARACTER_BASE_IMAGE = baseCharacterImage;

// Types for our equipment slots
type EquipmentSlot = 'head' | 'torso' | 'legs' | 'accessory' | 'hands';

interface EquipmentSlotInfo {
  id: EquipmentSlot;
  name: string;
  description: string;
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
    zIndex: number;
  };
}

// Equipment slot definitions with positioning info for overlay items
const EQUIPMENT_SLOTS: EquipmentSlotInfo[] = [
  { 
    id: 'head', 
    name: 'Head', 
    description: 'Helmets, goggles, and headwear',
    position: {
      top: '15%',
      left: '50%',
      width: '80px',
      height: '80px',
      zIndex: 20
    }
  },
  { 
    id: 'torso', 
    name: 'Torso', 
    description: 'Chest armor, shirts, and robes',
    position: {
      top: '38%',
      left: '50%',
      width: '100px',
      height: '100px',
      zIndex: 10
    }
  },
  { 
    id: 'legs', 
    name: 'Legs', 
    description: 'Pants, greaves, and leg protectors',
    position: {
      top: '65%',
      left: '50%',
      width: '90px',
      height: '110px',
      zIndex: 5
    }
  },
  { 
    id: 'accessory', 
    name: 'Accessory', 
    description: 'Capes, wings, and jewelry',
    position: {
      top: '35%',
      left: '85%',
      width: '70px',
      height: '90px',
      zIndex: 15
    }
  },
  { 
    id: 'hands', 
    name: 'Hands', 
    description: 'Weapons, tools, and gloves',
    position: {
      top: '45%',
      left: '23%',
      width: '50px',
      height: '80px',
      zIndex: 25
    }
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
  
  // Query client for cache updates
  const queryClient = useQueryClient();
  
  // Equip mutation
  const equipMutation = useMutation({
    mutationFn: (itemId: string) => {
      return apiRequest('POST', '/api/character/equip', {
        itemId,
        slot: selectedSlot
      });
    },
    onSuccess: () => {
      // Invalidate the equipment cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      toast({
        title: 'Item equipped',
        description: 'The item has been equipped successfully',
        variant: 'default'
      });
      
      // Also refresh inventory data in case quantities change
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
    onError: (error: any) => {
      console.error('Error equipping item:', error);
      toast({
        title: 'Failed to equip item',
        description: error.message || 'There was an error equipping the item',
        variant: 'destructive'
      });
    }
  });
  
  // Unequip mutation
  const unequipMutation = useMutation({
    mutationFn: (slot: EquipmentSlot) => {
      return apiRequest('POST', '/api/character/unequip', {
        slot
      });
    },
    onSuccess: () => {
      // Invalidate the equipment cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      toast({
        title: 'Item unequipped',
        description: 'The item has been removed successfully',
        variant: 'default'
      });
      
      // Also refresh inventory data in case quantities change
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
    onError: (error: any) => {
      console.error('Error unequipping item:', error);
      toast({
        title: 'Failed to unequip item',
        description: error.message || 'There was an error removing the item',
        variant: 'destructive'
      });
    }
  });
  
  // Filter inventory items by the selected slot type
  // Only show items that are equippable and match the selected slot
  const filteredItems = React.useMemo(() => {
    if (!inventoryItems) return [];
    
    // Look for items with ID 'gizbos' for the head slot
    const gizboItemHeadMatch = inventoryItems.some(item => 
      item.id === 'gizbos' && selectedSlot === 'head'
    );
    
    if (gizboItemHeadMatch) {
      console.log("Found Gizbo Glasses for head slot");
    }
    
    return inventoryItems.filter((item: any) => {
      // Special case for Gizbo Glasses (specific handling as per database)
      if (item.id === 'gizbos' && selectedSlot === 'head') {
        return true;
      }
      
      // Check if the item is equippable and matches the selected slot
      // Convert boolean values that might come as strings from PostgreSQL
      const isEquippable = 
        item.isEquippable === true || 
        item.isEquippable === 't' || 
        item.isEquippable === 'true';
      
      return isEquippable && item.equipSlot === selectedSlot;
    });
  }, [inventoryItems, selectedSlot]);
  
  // Handle equipping an item
  const handleEquipItem = (itemId: string) => {
    equipMutation.mutate(itemId);
  };
  
  // Handle unequipping an item
  const handleUnequipItem = (slot: EquipmentSlot) => {
    unequipMutation.mutate(slot);
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
                    <img 
                      src={CHARACTER_BASE_IMAGE}
                      alt="Character Base"
                      className="h-[300px] object-contain"
                    />
                  </div>
                  
                  {/* Equipped items overlay with proper positioning */}
                  {EQUIPMENT_SLOTS.map((slot) => {
                    const equippedItem = equipment?.[slot.id];
                    if (!equippedItem) return null;
                    
                    return (
                      <div 
                        key={`equipped-${slot.id}`}
                        className="absolute transform -translate-x-1/2"
                        style={{
                          top: slot.position.top,
                          left: slot.position.left,
                          zIndex: slot.position.zIndex,
                          width: slot.position.width,
                          height: slot.position.height
                        }}
                      >
                        <img 
                          src={equippedItem.imagePath} 
                          alt={equippedItem.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    );
                  })}
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
                      <div className="flex-1">
                        <h3 className="font-medium">{slot.name}</h3>
                        <p className="text-sm text-gray-500">{slot.description}</p>
                      </div>
                      <div className="flex flex-col items-center">
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
                        {equipment?.[slot.id] && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs mt-1 h-6 px-2 text-red-500 hover:text-red-700" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnequipItem(slot.id);
                            }}
                          >
                            Remove
                          </Button>
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
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.rarity}
                          </Badge>
                          {item.isEquippable && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {item.equipSlot} slot
                            </Badge>
                          )}
                        </div>
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