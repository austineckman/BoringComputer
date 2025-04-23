import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  ShieldX, 
  Loader2,
  RotateCcw
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getResourceDisplay } from '@/lib/resourceImages';
import { getItemDetails } from '@/lib/itemDatabase';
import { getRarityColorClass } from '@/lib/styleUtils';

// Character equipment screen inspired by Terraria
export default function CharacterEquipment() {
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Fetch character equipment
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/character/equipment'],
    queryFn: () => fetch('/api/character/equipment').then(res => res.json()),
  });

  // Fetch inventory items - we'll filter for equippable items
  const { data: inventory, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()),
  });

  // Mutation for equipping an item
  const equipItemMutation = useMutation({
    mutationFn: async ({ itemId, slot }: { itemId: string, slot: string }) => {
      const response = await apiRequest('POST', '/api/character/equipment/equip', {
        itemId,
        slot
      });
      return await response.json();
    },
    onSuccess: () => {
      try {
        sounds.success();
      } catch (e) {
        console.warn('Could not play sound', e);
      }
      
      toast({
        title: "Item Equipped!",
        description: "The item has been equipped to your character.",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Clear selected slot after equipping
      setSelectedSlot(null);
    },
    onError: (error) => {
      try {
        sounds.error();
      } catch (e) {
        console.warn('Could not play sound', e);
      }
      
      console.error('Error equipping item:', error);
      toast({
        title: "Failed to Equip Item",
        description: "There was an error equipping the item. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for unequipping an item
  const unequipItemMutation = useMutation({
    mutationFn: async (slot: string) => {
      const response = await apiRequest('POST', '/api/character/equipment/unequip', {
        slot
      });
      return await response.json();
    },
    onSuccess: () => {
      try {
        sounds.craftDrop();
      } catch (e) {
        console.warn('Could not play sound', e);
      }
      
      toast({
        title: "Item Unequipped",
        description: "The item has been returned to your inventory.",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/character/equipment'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Clear selected slot after unequipping
      setSelectedSlot(null);
    },
    onError: (error) => {
      try {
        sounds.error();
      } catch (e) {
        console.warn('Could not play sound', e);
      }
      
      console.error('Error unequipping item:', error);
      toast({
        title: "Failed to Unequip Item",
        description: "There was an error unequipping the item. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle equipping an item
  const handleEquipItem = (itemId: string) => {
    if (!selectedSlot) return;
    
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    
    equipItemMutation.mutate({ itemId, slot: selectedSlot });
  };

  // Handle unequipping an item
  const handleUnequipItem = (slot: string) => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    
    unequipItemMutation.mutate(slot);
  };

  // Filter for equippable items that match the selected slot
  const availableItemsForSlot = selectedSlot && inventory 
    ? inventory.filter((item: any) => {
        const itemDetails = getItemDetails(item.type);
        return itemDetails.isEquippable && itemDetails.equipSlot === selectedSlot;
      })
    : [];

  // Loading state
  if (isLoadingEquipment || isLoadingInventory) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          className="gap-2 border-brand-orange/30 hover:bg-brand-orange/10 mr-3"
          onClick={() => window.location.href = "/unified-inventory"}
        >
          <ArrowLeft size={16} />
          <span>Back to Inventory</span>
        </Button>
        <h1 className="text-3xl font-bold text-brand-orange">CHARACTER EQUIPMENT</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Character preview */}
        <div className="bg-space-mid rounded-lg p-4 border-2 border-space-light/20 flex flex-col items-center">
          <h2 className="text-xl font-bold text-brand-orange mb-4">Character Preview</h2>
          <div className="relative w-full h-96 bg-space-dark/30 rounded-lg border border-space-light/20 overflow-hidden">
            {/* Background Wall */}
            <img 
              src="/images/wallbg.png" 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            
            {/* Base Character */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="/images/basecharacter.png" 
                alt="Character" 
                className="h-4/5 object-contain pixelated"
              />
            </div>
            
            {/* Equipped Items - will be overlaid on the character */}
            {equipment && Object.keys(equipment).map(slot => {
              if (!equipment[slot]) return null;
              const item = equipment[slot];
              return (
                <div key={slot} className="absolute inset-0 flex items-center justify-center">
                  {/* If we had specific equipment sprites, we would display them here */}
                  {/* For now, just show a small icon indicator */}
                  <div className={`absolute ${
                    slot === 'head' ? 'top-20 right-1/2 translate-x-1/2' : 
                    slot === 'chest' ? 'top-1/3 right-1/2 translate-x-1/2' : 
                    slot === 'legs' ? 'top-1/2 right-1/2 translate-x-1/2' : 
                    slot === 'feet' ? 'bottom-20 right-1/2 translate-x-1/2' : 
                    slot === 'leftHand' ? 'top-1/3 left-20' : 
                    slot === 'rightHand' ? 'top-1/3 right-20' : 
                    'top-1/4 right-1/4'
                  }`}>
                    <div className={`w-10 h-10 rounded-full ${getRarityColorClass(item.id)} p-1 flex items-center justify-center`}>
                      {getResourceDisplay(item.id).isImage && (
                        <img 
                          src={getResourceDisplay(item.id).value} 
                          alt={getResourceDisplay(item.id).alt} 
                          className="w-full h-full object-contain pixelated"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Center column - Equipment slots */}
        <div className="bg-space-mid rounded-lg p-4 border-2 border-space-light/20">
          <h2 className="text-xl font-bold text-brand-orange mb-4">Equipment Slots</h2>
          <div className="grid grid-cols-2 gap-4">
            {['head', 'chest', 'legs', 'feet', 'leftHand', 'rightHand', 'accessory1', 'accessory2'].map(slot => {
              const isEquipped = equipment && equipment[slot];
              const item = isEquipped ? equipment[slot] : null;
              
              return (
                <div 
                  key={slot}
                  className={`
                    aspect-square rounded-lg p-2 relative cursor-pointer transition-all duration-200
                    ${selectedSlot === slot ? 'border-2 border-brand-orange' : 'border border-space-light/20'}
                    ${isEquipped ? getRarityColorClass(item.id) : 'bg-space-dark/50'}
                  `}
                  onClick={() => {
                    try {
                      sounds.hover();
                    } catch (e) {
                      console.warn('Could not play sound', e);
                    }
                    setSelectedSlot(slot);
                  }}
                >
                  <div className="text-xs text-brand-light/70 mb-1 capitalize">
                    {slot.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  
                  {isEquipped ? (
                    <>
                      <div className="flex flex-col items-center justify-center h-[calc(100%-20px)]">
                        <div className="w-12 h-12 bg-space-mid rounded-lg flex items-center justify-center">
                          {getResourceDisplay(item.id).isImage && (
                            <img 
                              src={getResourceDisplay(item.id).value} 
                              alt={getResourceDisplay(item.id).alt} 
                              className="w-full h-full object-contain pixelated"
                            />
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-xs font-medium text-brand-orange">
                            {getItemDetails(item.id).name}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 text-brand-light/40 hover:text-brand-light/80 hover:bg-brand-orange/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequipItem(slot);
                        }}
                      >
                        <RotateCcw size={12} />
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[calc(100%-20px)]">
                      <div className="w-12 h-12 bg-space-dark/50 rounded-lg border border-space-light/10 flex items-center justify-center">
                        <ShieldX size={20} className="text-space-light/30" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Right column - Available items for selected slot */}
        <div className="bg-space-mid rounded-lg p-4 border-2 border-space-light/20">
          <h2 className="text-xl font-bold text-brand-orange mb-4">
            {selectedSlot ? `Available ${selectedSlot.replace(/([A-Z])/g, ' $1').trim()} Items` : 'Select a Slot'}
          </h2>
          
          {selectedSlot ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableItemsForSlot.length > 0 ? (
                availableItemsForSlot.map((item: any) => (
                  <div 
                    key={item.type}
                    className={`${getRarityColorClass(item.type)} p-2 rounded-lg cursor-pointer transition-all hover:border-brand-orange/60`}
                    onClick={() => handleEquipItem(item.type)}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-space-mid rounded-lg flex items-center justify-center">
                        {getResourceDisplay(item.type).isImage && (
                          <img 
                            src={getResourceDisplay(item.type).value} 
                            alt={getResourceDisplay(item.type).alt} 
                            className="w-full h-full object-contain pixelated"
                          />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs font-medium text-brand-orange">
                          {getItemDetails(item.type).name}
                        </p>
                        <p className="text-xs text-brand-light/70">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-brand-light/50">
                  No equippable items found for this slot.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-brand-light/50">
              Select an equipment slot to see available items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}