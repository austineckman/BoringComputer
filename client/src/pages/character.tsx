import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Shield, 
  Helmet, 
  Shirt, 
  Pants, 
  Gem, 
  Hand, 
  Search, 
  Sparkles, 
  X 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import DraggableInventoryItem from '@/components/inventory/DraggableInventoryItem';

// Import character base image
import baseCharacterPath from '@assets/basecharacter.png';
import wallbgPath from '@assets/wallbg.png';

// ItemType definition for drag and drop
const ItemTypes = {
  INVENTORY_ITEM: 'inventoryItem',
  EQUIPMENT_SLOT: 'equipmentSlot'
};

// Define equipment slot types
const slotTypes = [
  { id: 'head', name: 'Head', icon: <Helmet className="w-6 h-6" />, acceptType: 'head' },
  { id: 'torso', name: 'Torso', icon: <Shirt className="w-6 h-6" />, acceptType: 'torso' },
  { id: 'legs', name: 'Legs', icon: <Pants className="w-6 h-6" />, acceptType: 'legs' },
  { id: 'accessory', name: 'Accessory', icon: <Gem className="w-6 h-6" />, acceptType: 'accessory' },
  { id: 'hands', name: 'Hands', icon: <Hand className="w-6 h-6" />, acceptType: 'hands' },
];

// Equipment Slot component
const EquipmentSlot = ({ slot, item, onUnequip }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.INVENTORY_ITEM,
    canDrop: (droppedItem) => droppedItem.equipSlot === slot.id,
    drop: (droppedItem) => ({ slotId: slot.id }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  // Apply visual styles based on drag state
  const slotStyle = {
    background: isOver && canDrop ? 'rgba(0, 255, 0, 0.2)' :
                isOver && !canDrop ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    border: isOver ? '2px dashed #888' : '2px solid #444',
  };

  return (
    <div 
      ref={drop}
      className="flex flex-col items-center"
    >
      <div className="text-sm mb-1">{slot.name}</div>
      <div 
        className="w-16 h-16 rounded-md flex items-center justify-center relative transition-all duration-200"
        style={slotStyle}
      >
        {item ? (
          <div className="relative">
            <img 
              src={item.imagePath} 
              alt={item.name} 
              className="w-12 h-12 object-contain"
            />
            <button 
              onClick={() => onUnequip(slot.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="text-gray-400">{slot.icon}</div>
        )}
      </div>
    </div>
  );
};

// Inventory item component specifically for the character page
const CharacterInventoryItem = ({ item, onEquip }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.INVENTORY_ITEM,
    item: { ...item, type: ItemTypes.INVENTORY_ITEM },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (draggedItem, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && dropResult.slotId) {
        onEquip(item.id, dropResult.slotId);
      }
    },
  });

  // Apply visual styles for drag state
  const itemStyle = {
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div 
      ref={drag} 
      style={itemStyle}
      className="p-2 rounded-md border border-gray-700 bg-gray-800 hover:bg-gray-700 transition-all"
    >
      <div className="flex items-center space-x-2">
        <img 
          src={item.imagePath} 
          alt={item.name} 
          className="w-10 h-10 object-contain"
        />
        <div>
          <div className="text-sm font-medium">{item.name}</div>
          <div className="text-xs text-gray-400">{item.equipSlot}</div>
        </div>
      </div>
    </div>
  );
};

// Main Character Page Component
const CharacterPage = () => {
  const { toast } = useToast();
  const [inventoryFilter, setInventoryFilter] = useState('');
  const [showEquippableOnly, setShowEquippableOnly] = useState(true);

  // Fetch user equipment
  const { data: equipment = {} } = useQuery({
    queryKey: ['/api/character/equipment'],
    onError: (error) => {
      console.error('Failed to fetch equipment', error);
      toast({
        title: 'Error',
        description: 'Failed to load your equipment',
        variant: 'destructive',
      });
    }
  });

  // Fetch user inventory
  const { data: userProfile = { inventory: {} } } = useQuery({
    queryKey: ['/api/auth/me'],
    onError: (error) => {
      console.error('Failed to fetch user profile', error);
      toast({
        title: 'Error',
        description: 'Failed to load your profile',
        variant: 'destructive',
      });
    }
  });

  // Fetch all items
  const { data: allItems = [] } = useQuery({
    queryKey: ['/api/items'],
    onError: (error) => {
      console.error('Failed to fetch items', error);
      toast({
        title: 'Error',
        description: 'Failed to load items',
        variant: 'destructive',
      });
    }
  });

  // Equip mutation
  const equipMutation = useMutation({
    mutationFn: async ({ itemId, slot }) => {
      const response = await fetch('/api/character/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, slot }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to equip item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      toast({
        title: 'Item Equipped',
        description: 'Your item has been equipped successfully',
      });
    },
    onError: (error) => {
      console.error('Error equipping item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to equip item',
        variant: 'destructive',
      });
    },
  });

  // Unequip mutation
  const unequipMutation = useMutation({
    mutationFn: async (slot) => {
      const response = await fetch('/api/character/unequip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slot }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unequip item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      toast({
        title: 'Item Unequipped',
        description: 'Your item has been unequipped successfully',
      });
    },
    onError: (error) => {
      console.error('Error unequipping item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to unequip item',
        variant: 'destructive',
      });
    },
  });

  // Handle equipping an item
  const handleEquip = (itemId, slot) => {
    equipMutation.mutate({ itemId, slot });
  };

  // Handle unequipping an item
  const handleUnequip = (slot) => {
    unequipMutation.mutate(slot);
  };

  // Process inventory data
  const inventoryItems = React.useMemo(() => {
    const userInventory = userProfile.inventory || {};
    return Object.entries(userInventory)
      .filter(([itemId, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => {
        const itemDetails = allItems.find(item => item.id === itemId);
        return itemDetails ? {
          ...itemDetails,
          quantity
        } : null;
      })
      .filter(item => item !== null);
  }, [userProfile.inventory, allItems]);
  
  // Filter inventory items based on search and equippable status
  const filteredInventory = React.useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(inventoryFilter.toLowerCase()) || 
                           item.description?.toLowerCase().includes(inventoryFilter.toLowerCase());
      const isEquippable = !showEquippableOnly || item.isEquippable;
      return matchesSearch && isEquippable;
    });
  }, [inventoryItems, inventoryFilter, showEquippableOnly]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto px-4 py-8" style={{ 
        backgroundImage: `url(${wallbgPath})`,
        backgroundSize: 'repeat',
        backgroundPosition: 'center',
      }}>
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Character Equipment</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Character Preview Card */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-2 border-gray-700 bg-black/70">
              <CardHeader>
                <CardTitle>Character Preview</CardTitle>
                <CardDescription>Your adventure awaits</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-8">
                  {/* Base character image */}
                  <img 
                    src={baseCharacterPath} 
                    alt="Base Character" 
                    className="absolute top-0 left-0 w-full h-full object-contain z-10"
                  />
                  
                  {/* Equipment layers would be rendered here, each with appropriate z-index */}
                  {equipment.head && (
                    <img 
                      src={equipment.head.imagePath} 
                      alt={equipment.head.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain z-20"
                    />
                  )}
                  
                  {equipment.torso && (
                    <img 
                      src={equipment.torso.imagePath} 
                      alt={equipment.torso.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain z-30"
                    />
                  )}
                  
                  {equipment.legs && (
                    <img 
                      src={equipment.legs.imagePath} 
                      alt={equipment.legs.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain z-40"
                    />
                  )}
                  
                  {equipment.hands && (
                    <img 
                      src={equipment.hands.imagePath} 
                      alt={equipment.hands.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain z-50"
                    />
                  )}
                  
                  {equipment.accessory && (
                    <img 
                      src={equipment.accessory.imagePath} 
                      alt={equipment.accessory.name} 
                      className="absolute top-0 left-0 w-full h-full object-contain z-60"
                    />
                  )}
                </div>
                
                {/* Equipment slots */}
                <div className="grid grid-cols-5 gap-4 w-full">
                  {slotTypes.map((slot) => (
                    <EquipmentSlot 
                      key={slot.id} 
                      slot={slot} 
                      item={equipment[slot.id]} 
                      onUnequip={handleUnequip}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="text-center text-sm text-gray-400">
                  Drag items from your inventory to equip them.
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Inventory Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-2 border-gray-700 bg-black/70">
              <CardHeader>
                <CardTitle>Your Inventory</CardTitle>
                <CardDescription>Items you've collected</CardDescription>
                
                <div className="flex items-center space-x-2 mt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="pl-8 pr-4 py-2 w-full bg-gray-800 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                      value={inventoryFilter}
                      onChange={(e) => setInventoryFilter(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={showEquippableOnly ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}
                    onClick={() => setShowEquippableOnly(!showEquippableOnly)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Equippable
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-2 space-y-2">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <CharacterInventoryItem
                        key={item.id}
                        item={item}
                        onEquip={handleEquip}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      {inventoryFilter 
                        ? 'No matching items found' 
                        : showEquippableOnly 
                          ? 'No equippable items in your inventory' 
                          : 'Your inventory is empty'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default CharacterPage;