import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Gift, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getLootCrateImage, getResourceDisplay } from '@/lib/resourceImages';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import LootCrateOpenDialog from '@/components/inventory/LootCrateOpenDialog';
import { LootBoxModal } from '@/components/lootbox/LootBoxModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableInventoryItem, DraggableEmptySlot } from '@/components/inventory/DraggableInventoryItem';
import goldBagIcon from '../assets/506_Gold_Bag_Leather_B.png';

// Resource images are already imported above

// Function to render a resource icon or image
const renderResourceIcon = (type: string, size: 'sm' | 'md' | 'lg' = 'md') => {
  const resource = getResourceDisplay(type);
  
  // All resources are now images
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-full h-full',
    lg: 'w-full h-full'
  };
  
  return (
    <img 
      src={resource.value} 
      alt={resource.alt || type} 
      className={`pixelated ${sizeClasses[size]} object-contain`} 
    />
  );
};

// Using the imported getRarityColorClass function instead
// of defining it here to avoid duplication

interface Resource {
  type: string;
  quantity: number;
  lastAcquired?: string;
}

export interface LootBox {
  id: number;
  userId: number;
  type: string;
  opened: boolean | null;
  rewards: { type: string, quantity: number }[] | null;
  source: string;
  sourceId: number | null;
  acquiredAt: Date | null;
  openedAt: Date | null;
  createdAt?: string; // Optional for backward compatibility with our current UI
}

// Import the centralized item database and utility functions
import { getItemDetails } from '@/lib/itemDatabase';
import { getRarityColorClass } from '@/lib/styleUtils';

export default function Inventory() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox} | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentLootBox, setCurrentLootBox] = useState<LootBox | null>(null);
  const [currentRewards, setCurrentRewards] = useState<{type: string, quantity: number}[]>([]);
  const { sounds } = useSoundEffects();
  
  // Fetch resources from inventory API
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()),
  });
  
  // Fetch loot boxes
  const { data: lootBoxes, isLoading: isLoadingLootBoxes } = useQuery({
    queryKey: ['/api/loot-boxes'],
    queryFn: () => fetch('/api/loot-boxes').then(res => res.json()),
  });
  
  // Fetch inventory history
  const { data: inventoryHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/inventory/history'],
    queryFn: () => fetch('/api/inventory/history').then(res => res.json()),
  });
  
  // Handler for confirming loot box opening from the dialog
  const handleConfirmLootBoxOpen = () => {
    if (currentLootBox) {
      // Close the confirmation dialog
      setIsConfirmDialogOpen(false);
      
      // Open the loot box with the existing function
      handleLootBoxOpen(currentLootBox, currentLootBox.rewards || []);
    }
  };
  
  const handleLootBoxOpen = async (lootBox: LootBox, rewards: {type: string, quantity: number}[]) => {
    try {
      sounds.questComplete();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    
    try {
      // Always try to open the loot box server-side to get fresh rewards
      if (lootBox.id) {
        console.log('Opening loot box with ID:', lootBox.id);
        const response = await apiRequest('POST', `/api/loot-boxes/${lootBox.id}/open`);
        const data = await response.json();
        console.log('Loot box open response:', data);
        
        if (data.success && data.rewards && data.rewards.length > 0) {
          console.log('Using rewards from server:', data.rewards);
          setCurrentRewards(data.rewards);
          
          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
          queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
          queryClient.invalidateQueries({ queryKey: ['/api/inventory/history'] });
          
          setIsRewardModalOpen(true);
          return;
        } else if (data.alreadyOpened && data.rewards && data.rewards.length > 0) {
          console.log('Box already opened, using saved rewards:', data.rewards);
          setCurrentRewards(data.rewards);
          setIsRewardModalOpen(true);
          return;
        }
      }
      
      // If we get here, either there was no loot box ID, or the server didn't return valid rewards
      console.log('Using fallback rewards:', rewards);
      
      // Check if we have fallback rewards
      if (rewards && rewards.length > 0) {
        setCurrentRewards(rewards);
      } else {
        // Generate some default rewards as final fallback
        setCurrentRewards([
          { type: 'cloth', quantity: 2 },
          { type: 'metal', quantity: 1 }
        ]);
      }
      
    } catch (error) {
      console.error('Failed to open loot box:', error);
      
      // Provide default rewards in case of error
      setCurrentRewards([
        { type: 'cloth', quantity: 1 },
        { type: 'metal', quantity: 1 }
      ]);
    }
    
    setIsRewardModalOpen(true);
  };
  
  const closeRewardModal = () => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    setIsRewardModalOpen(false);
  };

  const handleItemHover = (type: string) => {
    setHoveredItem(type);
    try {
      sounds.hover();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
  };
  
  const handleItemClick = (item: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox}) => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    
    // We'll let the DraggableInventoryItem component handle navigation for loot boxes
    if (item.isLootBox && item.lootBoxData) {
      return;
    }
    
    // Otherwise select the item to show details
    setSelectedItem(item);
  };
  
  const handleTabChange = (value: string) => {
    // Handle tab change without setting state
    try {
      sounds.click();
      
      // If the history tab is selected, navigate to the history page
      if (value === 'history') {
        // We don't need to set activeTab anymore, this just handles navigation
        window.location.href = '/history';
      }
    } catch (e) {
      console.warn('Could not play sound', e);
    }
  };
  

  
  // Memoize inventory items to prevent infinite updates
  const allInventoryItems = useMemo(() => {
    const items: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox}[] = [];
    
    if (resources) {
      resources.forEach((resource: Resource) => {
        // Only add items with quantity > 0 to the inventory
        if (resource.quantity > 0) {
          items.push({
            type: resource.type,
            quantity: resource.quantity
          });
        }
      });
    }
    
    // Add loot boxes to inventory items
    if (lootBoxes) {
      console.log("Processing loot boxes for display:", lootBoxes);
      // Filter out opened loot boxes (checking both opened=true and openedAt not null)
      const unopenedLootBoxes = lootBoxes.filter((box: LootBox) => {
        const isOpenedByFlag = !!box.opened; // Convert to boolean
        const isOpenedByDate = !!box.openedAt; // Convert to boolean
        const isNotOpened = !isOpenedByFlag && !isOpenedByDate;
        
        if (!isNotOpened) {
          console.log(`Loot box ${box.id} is filtered out - opened status:`, 
                      { opened: box.opened, openedAt: box.openedAt });
        }
        
        return isNotOpened;
      });
      
      console.log("Unopened loot boxes count:", unopenedLootBoxes.length);
      
      // Group unopened loot boxes by type
      const groupedBoxes: Record<string, {count: number, boxes: LootBox[]}> = {};
      unopenedLootBoxes.forEach((box: LootBox) => {
        const boxType = `${box.type}-loot-box`;
        if (!groupedBoxes[boxType]) {
          groupedBoxes[boxType] = { count: 0, boxes: [] };
        }
        groupedBoxes[boxType].count += 1;
        groupedBoxes[boxType].boxes.push(box);
      });
      
      // Add grouped loot boxes to inventory
      Object.keys(groupedBoxes).forEach(boxType => {
        items.push({
          type: boxType,
          quantity: groupedBoxes[boxType].count,
          isLootBox: true,
          lootBoxData: groupedBoxes[boxType].boxes[0] // Use first box for display
        });
      });
    }
    
    return items;
  }, [resources, lootBoxes]);
  
  // Create a grid with empty slots for WoW-style guild bank
  const totalSlots = 42; // 7x6 grid
  const [inventoryGrid, setInventoryGrid] = useState<Array<{type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox} | null>>(Array(totalSlots).fill(null));
  
  // Save inventory grid layout to localStorage
  const saveInventoryLayout = useCallback((grid: Array<{type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox} | null>) => {
    try {
      // Save only the item types and their positions, not the full data
      const layoutData = grid.map(item => item ? { type: item.type, position: grid.indexOf(item) } : null);
      localStorage.setItem('inventoryLayout', JSON.stringify(layoutData));
    } catch (error) {
      console.warn('Failed to save inventory layout:', error);
    }
  }, []);
  
  // Track loot box data changes to rebuild the grid if loot boxes change
  const [lootBoxesData, setLootBoxesData] = useState<LootBox[] | null>(null);
  
  // Update lootBoxesData when lootBoxes changes
  useEffect(() => {
    if (lootBoxes) {
      setLootBoxesData(lootBoxes);
    }
  }, [lootBoxes]);
  
  // Load inventory grid layout when component mounts and when new items arrive
  useEffect(() => {
    try {
      console.log("Rebuilding inventory grid...");
      
      // Clear the grid completely to ensure it's rebuilt with current data
      // This is necessary to remove opened loot boxes
      const freshGrid = Array(totalSlots).fill(null);
      
      // Attempt to load saved layout
      const savedLayoutStr = localStorage.getItem('inventoryLayout');
      const savedLayout = savedLayoutStr ? JSON.parse(savedLayoutStr) : null;
      
      // Set of item types that already exist in the grid
      const existingItemTypes = new Set();
      
      // Process all inventory items
      for (const item of allInventoryItems) {
        // If this item type is already in the grid, skip it
        if (existingItemTypes.has(item.type)) {
          continue;
        }
        
        // Check if we have position information for this item type from saved layout
        const savedPosition = savedLayout ? 
          savedLayout.findIndex((saved: any) => saved !== null && saved.type === item.type) : -1;
        
        if (savedPosition >= 0 && savedPosition < totalSlots && freshGrid[savedPosition] === null) {
          // If we have a saved position and it's empty, use it
          freshGrid[savedPosition] = item;
        } else {
          // Otherwise, find first empty slot
          const emptySlotIndex = freshGrid.findIndex(slot => slot === null);
          if (emptySlotIndex >= 0) {
            freshGrid[emptySlotIndex] = item;
          } else {
            // No empty slots, append to the end if there's room
            if (freshGrid.length < totalSlots) {
              freshGrid.push(item);
            }
            // If no room, item is ignored (inventory full)
          }
        }
        
        // Mark this item type as processed
        existingItemTypes.add(item.type);
      }
      
      // Always update the grid, since we're completely rebuilding it
      setInventoryGrid(freshGrid);
      saveInventoryLayout(freshGrid);
    } catch (error) {
      console.error('Error processing inventory layout:', error);
    }
  }, [allInventoryItems, totalSlots, saveInventoryLayout, lootBoxesData]);
  
  // Function to move an item from one position to another
  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setInventoryGrid(prevGrid => {
      const newGrid = [...prevGrid];
      // Swap the items
      const temp = newGrid[fromIndex];
      newGrid[fromIndex] = newGrid[toIndex];
      newGrid[toIndex] = temp;
      
      // Save the updated layout to localStorage
      try {
        saveInventoryLayout(newGrid);
      } catch (error) {
        console.warn('Failed to save inventory layout after move:', error);
      }
      
      return newGrid;
    });
    
    try {
      sounds.drop();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
  }, [sounds, saveInventoryLayout]);
  
  if (isLoadingResources || isLoadingLootBoxes || isLoadingHistory) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-orange flex items-center">
              <img 
                src={goldBagIcon} 
                alt="Inventory Bag" 
                className="w-28 h-28 mr-2 object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
              ADVENTURES INVENTORY
            </h1>
            <p className="text-brand-light/70">All the crafting materials and loot you've gathered</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2 border-brand-orange/30 hover:bg-brand-orange/10"
              onClick={() => handleTabChange('history')}
            >
              <Clock size={16} />
              <span>View History</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-space-mid rounded-lg border-2 border-space-light/20 p-4 mb-8">
          {/* Item Details Panel - Shown when an item is selected */}
          {selectedItem && (
            <div className={`mb-6 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-6 ${getRarityColorClass(selectedItem.type)}`}>
              {/* Left Column - Large Image */}
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-space-mid rounded-lg border-2 border-brand-orange/30 p-4 flex items-center justify-center relative">
                  {selectedItem.isLootBox ? (
                    <img 
                      src={getLootCrateImage().src} 
                      alt={getLootCrateImage().alt}
                      className="w-full h-full object-contain pixelated" 
                    />
                  ) : (
                    renderResourceIcon(selectedItem.type, 'lg')
                  )}
                  
                  {/* Glow effect for rare items */}
                  {getItemDetails(selectedItem.type).rarity !== 'common' && (
                    <div className="absolute inset-0 rounded-lg animate-pulse-slow opacity-50" 
                         style={{
                           boxShadow: `0 0 15px 2px ${
                             getItemDetails(selectedItem.type).rarity === 'legendary' ? 'rgba(245, 158, 11, 0.6)' :
                             getItemDetails(selectedItem.type).rarity === 'epic' ? 'rgba(168, 85, 247, 0.6)' :
                             getItemDetails(selectedItem.type).rarity === 'rare' ? 'rgba(59, 130, 246, 0.6)' :
                             'rgba(34, 197, 94, 0.6)'
                           }`
                         }}></div>
                  )}
                </div>
              </div>
              
              {/* Center Column - Name and description */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-brand-orange">
                    {getItemDetails(selectedItem.type).name}
                  </h3>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                    getItemDetails(selectedItem.type).rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                    getItemDetails(selectedItem.type).rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' :
                    getItemDetails(selectedItem.type).rarity === 'rare' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' :
                    getItemDetails(selectedItem.type).rarity === 'uncommon' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                  }`}>
                    {getItemDetails(selectedItem.type).rarity}
                  </div>
                </div>
                <div className="mb-3 flex items-center">
                  <span className="text-brand-yellow font-medium mr-2">Quantity: {selectedItem.quantity}</span>
                  {!selectedItem.isLootBox && (
                    <span className="text-xs px-2 py-1 bg-brand-orange/20 rounded-full">
                      {getItemDetails(selectedItem.type).category === 'material' ? 'Material' : 'Item'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-light/80 italic mb-2">
                  {getItemDetails(selectedItem.type).flavorText}
                </p>
                
                {/* Equipment slot indicator - only show for equippable items */}
                {getItemDetails(selectedItem.type).isEquippable && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-brand-orange/10 rounded-md border border-brand-orange/20">
                    <span className="text-sm text-brand-yellow">Equipment Slot:</span>
                    <span className="text-sm font-semibold text-brand-light px-2 py-0.5 bg-brand-dark rounded-md capitalize">
                      {getItemDetails(selectedItem.type).equipSlot || 'Unknown'}
                    </span>
                  </div>
                )}
                
                <Button 
                  variant="ghost"
                  size="sm"
                  className="self-end text-brand-orange/60 hover:text-brand-orange hover:bg-transparent"
                  onClick={() => setSelectedItem(null)}
                >
                  Close Details
                </Button>
              </div>
              
              {/* Right Column - Usage information */}
              <div className="bg-space-mid/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-brand-yellow mb-2">Usage Information</h4>
                <p className="text-sm text-brand-light/90">
                  {getItemDetails(selectedItem.type).usageDescription || getItemDetails(selectedItem.type).description}
                </p>
                {selectedItem.isLootBox && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full bg-brand-orange/20 hover:bg-brand-orange/30 border-brand-orange/30"
                    onClick={() => {
                      if (selectedItem.lootBoxData) {
                        setCurrentLootBox(selectedItem.lootBoxData);
                        setIsConfirmDialogOpen(true);
                        setSelectedItem(null); // Close details when opening dialog
                      }
                    }}
                  >
                    Open Crate
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Inventory Header with item count */}
            <div className="flex items-center justify-between border-b border-space-light/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <img 
                    src={goldBagIcon} 
                    alt="Inventory Bag" 
                    className="w-24 h-24 mr-2 object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <h3 className="text-lg font-semibold text-brand-orange">Inventory</h3>
                </div>
              </div>
              
              <div className="text-xs text-brand-light/60">
                <span>Total Items: {allInventoryItems.length}/{totalSlots}</span>
              </div>
            </div>
            
            {/* Unified Grid Layout with drag-and-drop functionality */}
            <DndProvider backend={HTML5Backend}>
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 relative">
                {inventoryGrid.map((item, index) => (
                  <div className="aspect-square bg-space-dark border-space-light/10 rounded-md p-1 relative" key={index}>
                    {item ? (
                      <DraggableInventoryItem
                        item={item}
                        index={index}
                        renderResourceIcon={renderResourceIcon}
                        handleItemHover={handleItemHover}
                        handleItemClick={handleItemClick}
                        moveItem={moveItem}
                        onLootBoxOpen={(lootBox) => {
                          setCurrentLootBox(lootBox);
                          setIsConfirmDialogOpen(true);
                        }}
                      />
                    ) : (
                      <DraggableEmptySlot 
                        index={index}
                        moveItem={moveItem}
                      />
                    )}
                  </div>
                ))}
              </div>
            </DndProvider>
            
            {/* Simple version without tabs */}
        </div>
        
        {/* Loot Box Rewards Modal with CS:GO-style Animation */}
        <Dialog open={isRewardModalOpen} onOpenChange={setIsRewardModalOpen}>
          <DialogContent className="bg-space-dark border-brand-orange/30 sm:max-w-md md:max-w-xl mx-auto w-[90%] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-brand-orange">Loot Box Rewards!</DialogTitle>
              <DialogDescription className="text-center text-brand-light/70">
                {currentRewards.length > 0 ? "Spinning the loot wheel..." : "No rewards found in this loot box."}
              </DialogDescription>
            </DialogHeader>
            
            {currentRewards.length > 0 ? (
              <div className="relative">
                {/* CS:GO-style item scroll animation - with better container */}
                <div className="overflow-hidden max-w-full mx-auto my-6 bg-gradient-to-r from-space-dark via-space-mid to-space-dark border-2 border-brand-orange/50 rounded-md relative">
                  {/* Highlight marker in the center */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-brand-yellow z-10"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent z-10"></div>
                  
                  {/* The scrolling items container - Constrained width with flex-nowrap */}
                  <div className="py-4 flex flex-nowrap items-center relative" style={{ 
                    width: '300%', 
                    animation: 'slotMachine 4.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    transformOrigin: 'left center'
                  }}>
                    {/* Generate items for animation */}
                    {[...Array(15)].map((_, idx) => {
                      // Random items for the animation
                      const randomItem = {
                        type: ['cloth', 'metal', 'tech-scrap', 'circuit-board', 'sensor-crystal', 'alchemy-ink'][Math.floor(Math.random() * 6)],
                        quantity: Math.floor(Math.random() * 5) + 1
                      };
                      
                      // Get appropriate pulse animation based on rarity
                      const itemRarityClass = 
                        randomItem.quantity > 10 ? 'bg-legendary-pulse' :
                        randomItem.quantity > 7 ? 'bg-epic-pulse' :
                        randomItem.quantity > 5 ? 'bg-rare-pulse' :
                        randomItem.quantity > 3 ? 'bg-uncommon-pulse' :
                        'bg-common-pulse';
                      
                      return (
                        <div 
                          key={`random-${idx}`} 
                          className={`flex flex-col items-center mx-2 p-3 w-20 h-24 md:w-24 md:h-32 ${itemRarityClass} rounded-lg border border-space-light/40 shadow-lg flex-shrink-0`}
                        >
                          <div className="resource-icon w-12 h-12 flex items-center justify-center mb-1">
                            {renderResourceIcon(randomItem.type, 'lg')}
                          </div>
                          <span className="font-medium text-white text-center text-xs md:text-sm">{getItemDetails(randomItem.type).name}</span>
                          <span className="text-brand-yellow text-sm md:text-lg font-bold">+{randomItem.quantity}</span>
                        </div>
                      );
                    })}
                    
                    {/* Add actual rewards at the end */}
                    {currentRewards.map((reward, index) => {
                      // Get appropriate pulse animation based on rarity
                      const itemRarityClass = 
                        reward.quantity > 10 ? 'bg-legendary-pulse' :
                        reward.quantity > 7 ? 'bg-epic-pulse' :
                        reward.quantity > 5 ? 'bg-rare-pulse' :
                        reward.quantity > 3 ? 'bg-uncommon-pulse' :
                        'bg-common-pulse';
                        
                      return (
                        <div 
                          key={`reward-${index}`} 
                          className={`flex flex-col items-center mx-2 p-3 w-20 h-24 md:w-24 md:h-32 ${itemRarityClass} rounded-lg border-2 border-amber-400/60 shadow-lg flex-shrink-0`}
                        >
                          <div className="resource-icon w-12 h-12 flex items-center justify-center mb-1">
                            {renderResourceIcon(reward.type, 'lg')}
                          </div>
                          <span className="font-medium text-white text-center text-xs md:text-sm">{getItemDetails(reward.type).name}</span>
                          <span className="text-brand-yellow text-sm md:text-lg font-bold">+{reward.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Final rewards display after animation */}
                <div className="grid grid-cols-2 gap-4 my-6">
                  {currentRewards.map((reward, index) => {
                    // Determine rarity class based on quantity
                    const rarityClass = 
                      reward.quantity > 10 ? 'border-amber-400 bg-amber-900/20' :
                      reward.quantity > 7 ? 'border-purple-400 bg-purple-900/20' :
                      reward.quantity > 5 ? 'border-blue-400 bg-blue-900/20' :
                      reward.quantity > 3 ? 'border-green-400 bg-green-900/20' :
                      'border-gray-400 bg-gray-900/20';
                      
                    return (
                      <div 
                        key={index} 
                        className={`flex flex-col items-center p-4 rounded-lg ${rarityClass} border-2 shadow-lg animate-fade-in-up`}
                        style={{ animationDelay: `${4 + index * 0.2}s` }}
                      >
                        <div className="resource-icon w-16 h-16 flex items-center justify-center mb-2">
                          {renderResourceIcon(reward.type, 'lg')}
                        </div>
                        <span className="font-medium text-brand-light">{getItemDetails(reward.type).name}</span>
                        <span className="text-brand-yellow text-lg font-bold">+{reward.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-brand-light/70">No rewards found in this loot box.</p>
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <Button 
                className="bg-brand-orange hover:bg-brand-orange/80 text-white"
                onClick={closeRewardModal}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* New secure modal-based loot box preview and opening */}
        <LootBoxModal
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          lootBoxId={currentLootBox?.id || null}
          onLootBoxOpened={() => {
            // After a successful loot box opening:
            setIsConfirmDialogOpen(false);
            
            // Refresh all relevant data
            queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
            queryClient.invalidateQueries({ queryKey: ['/api/inventory/history'] });
            
            // Force an update of the lootBoxesData state to trigger inventory grid rebuild
            if (lootBoxes) {
              // Make a deep copy of the current loot boxes data with the current box marked as opened
              const updatedLootBoxes = lootBoxes.map(box => {
                if (box.id === currentLootBox?.id) {
                  // Create a new object with the opened status set to true
                  return {
                    ...box, 
                    opened: true,
                    openedAt: new Date()
                  };
                }
                return box;
              });
              
              // Update the state which will trigger the inventory grid rebuild
              setLootBoxesData(updatedLootBoxes);
              
              console.log("Updated loot boxes with opened status:", updatedLootBoxes);
            }
            
            // Play success sound
            try {
              sounds.questComplete();
            } catch (e) {
              console.warn('Could not play sound', e);
            }
          }}
        />
      </div>
  );
}