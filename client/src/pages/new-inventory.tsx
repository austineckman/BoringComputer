import React, { useState } from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
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

interface Resource {
  type: string;
  quantity: number;
  lastAcquired?: string;
}

interface LootBox {
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

// Import the centralized item database instead of duplicating data
import { getItemDetails, getRarityClasses } from '@/lib/itemDatabase';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox} | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
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
    
    // If it's a loot box, open it
    if (item.isLootBox && item.lootBoxData) {
      handleLootBoxOpen(item.lootBoxData, item.lootBoxData?.rewards || []);
      return;
    }
    
    // Otherwise select the item to show details
    setSelectedItem(item);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
  };
  
  // Component for generating test loot crates
  const GenerateTestCrates = () => {
    const { toast } = useToast();
    const { sounds } = useSoundEffects();
    const [isGenerating, setIsGenerating] = useState(false);
    
    const generateCratesMutation = useMutation({
      mutationFn: async () => {
        const response = await apiRequest('POST', '/api/loot-boxes/generate-test');
        return await response.json();
      },
      onSuccess: (data) => {
        try {
          sounds.questComplete();
        } catch (e) {
          console.warn('Could not play sound', e);
        }
        
        toast({
          title: "Test Crates Generated!",
          description: `${data.lootBoxes.length} new loot crates have been added to your inventory.`,
          variant: "default",
        });
        
        // Invalidate the loot boxes query to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
        setIsGenerating(false);
      },
      onError: (error) => {
        console.error('Error generating test crates:', error);
        toast({
          title: "Failed to Generate Crates",
          description: "There was an error generating test crates. Please try again.",
          variant: "destructive",
        });
        setIsGenerating(false);
      }
    });
    
    // Function to handle generating test crates
    const handleGenerateCrates = () => {
      try {
        sounds.click();
      } catch (e) {
        console.warn('Could not play sound', e);
      }
      
      setIsGenerating(true);
      generateCratesMutation.mutate();
    };
    
    return (
      <Button 
        variant="default" 
        className="gap-2 bg-brand-orange hover:bg-brand-orange/80 text-white font-medium border-2 border-brand-orange/40 shadow-lg shadow-brand-orange/20 relative overflow-hidden"
        disabled={isGenerating}
        onClick={handleGenerateCrates}
      >
        {/* Animated glow effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 animate-shine -translate-x-full"></span>
        
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Gift size={16} />
            <span>Generate Test Crates</span>
          </>
        )}
      </Button>
    );
  };
  
  // Combine resources with loot boxes to display in grid
  const allInventoryItems: {type: string, quantity: number, isLootBox?: boolean, lootBoxData?: LootBox}[] = [];
  
  if (resources) {
    resources.forEach((resource: Resource) => {
      allInventoryItems.push({
        type: resource.type,
        quantity: resource.quantity
      });
    });
  }
  
  // Add loot boxes to inventory items
  if (lootBoxes) {
    const unopenedLootBoxes = lootBoxes.filter((box: LootBox) => !box.opened);
    
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
      allInventoryItems.push({
        type: boxType,
        quantity: groupedBoxes[boxType].count,
        isLootBox: true,
        lootBoxData: groupedBoxes[boxType].boxes[0] // Use first box for display
      });
    });
  }
  
  // Filter items based on active tab
  const filteredItems = allInventoryItems.filter(item => {
    if (activeTab === 'materials') {
      return !item.isLootBox;
    } else if (activeTab === 'loot-boxes') {
      return item.isLootBox;
    }
    return true; // 'all' tab
  });
  
  // Create a grid with empty slots for WoW-style guild bank
  const totalSlots = 42; // 7x6 grid
  const inventoryGrid = Array(totalSlots).fill(null);
  
  // Fill the grid with our items
  filteredItems.forEach((item, index) => {
    if (index < totalSlots) {
      inventoryGrid[index] = item;
    }
  });
  
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
            <h1 className="text-3xl font-bold text-brand-orange">ADVENTURES INVENTORY</h1>
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
            
            <GenerateTestCrates />
          </div>
        </div>
        
        <div className="bg-space-mid rounded-lg border-2 border-space-light/20 p-4 mb-8">
          {/* Item Details Panel - Shown when an item is selected */}
          {selectedItem && (
            <div className="mb-6 bg-space-dark rounded-lg border border-space-light/20 p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Large Image */}
              <div className="flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-space-mid rounded-lg border-2 border-brand-orange/30 p-4 flex items-center justify-center">
                  {selectedItem.isLootBox ? (
                    <img 
                      src={getLootCrateImage().src} 
                      alt={getLootCrateImage().alt}
                      className="w-full h-full object-contain pixelated" 
                    />
                  ) : (
                    renderResourceIcon(selectedItem.type, 'lg')
                  )}
                </div>
              </div>
              
              {/* Center Column - Name and description */}
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-brand-orange mb-2">
                  {getItemDetails(selectedItem.type).name}
                </h3>
                <div className="mb-3 flex items-center">
                  <span className="text-brand-yellow font-medium mr-2">Quantity: {selectedItem.quantity}</span>
                  {!selectedItem.isLootBox && (
                    <span className="text-xs px-2 py-1 bg-brand-orange/20 rounded-full">
                      {getItemDetails(selectedItem.type).category === 'material' ? 'Material' : 'Item'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-light/80 italic mb-4">
                  {getItemDetails(selectedItem.type).flavorText}
                </p>
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
                    onClick={() => selectedItem.lootBoxData && handleLootBoxOpen(selectedItem.lootBoxData, selectedItem.lootBoxData?.rewards || [])}
                  >
                    Open Crate
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex items-center justify-between border-b border-space-light/20 pb-3 mb-4">
              <TabsList className="bg-space-dark">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:text-brand-orange data-[state=active]:bg-brand-orange/20"
                >
                  All Items
                </TabsTrigger>
                <TabsTrigger 
                  value="materials" 
                  className="data-[state=active]:text-brand-orange data-[state=active]:bg-brand-orange/20"
                >
                  Materials
                </TabsTrigger>
                <TabsTrigger 
                  value="loot-boxes" 
                  className="data-[state=active]:text-brand-orange data-[state=active]:bg-brand-orange/20"
                >
                  Loot Crates
                </TabsTrigger>
              </TabsList>
              
              <div className="text-xs text-brand-light/60 hidden md:block">
                <span className="mr-4">Total Items: {allInventoryItems.length}/{totalSlots}</span>
              </div>
            </div>
            
            {/* Grid Layout View - Applies to all tabs except history */}
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 relative">
                {inventoryGrid.map((item, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`aspect-square bg-space-dark border ${item ? 'border-space-light/40 hover:border-brand-orange/60' : 'border-space-light/10'} rounded-md p-1 relative cursor-pointer transition-colors`}
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
                                  <div className="w-full h-full flex items-center justify-center">
                                    {renderResourceIcon(item.type)}
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
                            <p className="font-bold capitalize text-brand-orange">
                              {getItemDetails(item.type).name}
                            </p>
                            <p className="text-xs text-brand-light/70">
                              {getItemDetails(item.type).flavorText.substring(0, 60)}...
                            </p>
                            <p className="text-xs text-brand-yellow">
                              Quantity: {item.quantity}
                            </p>
                            {item.isLootBox && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 w-full bg-brand-orange/20 hover:bg-brand-orange/30 border-brand-orange/30"
                                onClick={() => item.lootBoxData && handleLootBoxOpen(item.lootBoxData, item.lootBoxData?.rewards || [])}
                              >
                                Open Crate
                              </Button>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="materials" className="mt-0">
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                {inventoryGrid.map((item, index) => (
                  item && !item.isLootBox ? (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="aspect-square bg-space-dark border border-space-light/40 hover:border-brand-orange/60 rounded-md p-1 relative cursor-pointer transition-colors"
                            onMouseEnter={() => handleItemHover(item.type)}
                            onClick={() => handleItemClick(item)}
                          >
                            <div className="flex items-center justify-center h-full">
                              <div className="w-full h-full flex items-center justify-center">
                                {renderResourceIcon(item.type)}
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-xs bg-space-darkest/80 rounded-tl-md rounded-br-sm">
                              {item.quantity}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-space-dark border-brand-orange/30 text-brand-light p-3">
                          <div className="space-y-1">
                            <p className="font-bold capitalize text-brand-orange">
                              {getItemDetails(item.type).name}
                            </p>
                            <p className="text-xs text-brand-light/70">
                              {getItemDetails(item.type).flavorText.substring(0, 60)}...
                            </p>
                            <p className="text-xs text-brand-yellow">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div key={index} className="aspect-square bg-space-dark border border-space-light/10 rounded-md"></div>
                  )
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="loot-boxes" className="mt-0">
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                {inventoryGrid.map((item, index) => (
                  item && item.isLootBox ? (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className="aspect-square bg-space-dark border border-space-light/40 hover:border-brand-orange/60 rounded-md p-1 relative cursor-pointer transition-colors"
                            onMouseEnter={() => handleItemHover(item.type)}
                            onClick={() => handleItemClick(item)}
                          >
                            <div className="flex items-center justify-center h-full">
                              <div className={`w-full h-full flex items-center justify-center rounded-md overflow-hidden bg-space-mid`}>
                                <img 
                                  src={getLootCrateImage().src} 
                                  alt={getLootCrateImage().alt}
                                  className="w-full h-full object-contain" 
                                />
                              </div>
                            </div>
                            <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-xs bg-space-darkest/80 rounded-tl-md rounded-br-sm">
                              {item.quantity}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-space-dark border-brand-orange/30 text-brand-light p-3">
                          <div className="space-y-1">
                            <p className="font-bold capitalize text-brand-orange">
                              {getItemDetails(item.type).name}
                            </p>
                            <p className="text-xs text-brand-light/70">
                              {getItemDetails(item.type).flavorText.substring(0, 60)}...
                            </p>
                            <p className="text-xs text-brand-yellow">
                              Quantity: {item.quantity}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 w-full bg-brand-orange/20 hover:bg-brand-orange/30 border-brand-orange/30"
                              onClick={() => item.lootBoxData && handleLootBoxOpen(item.lootBoxData, item.lootBoxData?.rewards || [])}
                            >
                              Open Crate
                            </Button>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div key={index} className="aspect-square bg-space-dark border border-space-light/10 rounded-md"></div>
                  )
                ))}
              </div>
              
              {/* Test Loot Box Generator */}
              <div className="mt-8 p-6 border border-brand-orange/30 rounded-lg bg-space-dark">
                <h3 className="text-xl font-medium text-brand-orange mb-4">Test Loot Boxes Generator</h3>
                <p className="text-sm text-brand-light/80 mb-4">Generate test loot boxes to try out the CS:GO-style opening animation.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <GenerateTestCrates />
                  <GenerateTestCrates />
                  <GenerateTestCrates />
                  <GenerateTestCrates />
                  <GenerateTestCrates />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="bg-space-dark rounded-lg p-4">
                {inventoryHistory && inventoryHistory.length > 0 ? (
                  <div className="space-y-2">
                    {inventoryHistory.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border-b border-space-light/10 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="resource-icon w-6 h-6 flex items-center justify-center">
                            {renderResourceIcon(entry.type, 'sm')}
                          </div>
                          <div>
                            <p className="font-medium">{getItemDetails(entry.type).name}</p>
                            <p className="text-xs text-brand-light/60">
                              {entry.action === 'gained' ? 'Gained from ' : 'Used for '} 
                              <span className="text-brand-orange">{entry.source}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${entry.action === 'gained' ? 'text-green-500' : 'text-red-500'}`}>
                            {entry.action === 'gained' ? '+' : '-'}{entry.quantity}
                          </p>
                          <p className="text-xs text-brand-light/60">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-lg text-brand-light/60">No inventory history yet</p>
                    <p className="text-sm text-brand-light/40 mt-1">Complete quests to earn resources</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
      </div>
  );
}