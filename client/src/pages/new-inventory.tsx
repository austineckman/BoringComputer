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
import { useSoundEffects } from '@/hooks/useSoundEffects';

// Define resource icons map
const resourceIcons: Record<string, string> = {
  'cloth': '🧵',
  'metal': '🔧',
  'wood': '🪵',
  'crystal': '💎',
  'energy': '⚡',
  'circuit': '🔌',
  'plating': '🛡️',
  'data': '💾',
  'glass': '🔍',
  'wire': '📎',
  'gear': '⚙️',
  'battery': '🔋',
  'microchip': '🖥️',
  'plastic': '📏',
  'rubber': '🧊',
  'nano-fiber': '🧪',
  'quantum-bit': '✨',
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

export default function Inventory() {
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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
                          onClick={() => item?.isLootBox && item.lootBoxData && handleLootBoxOpen(item.lootBoxData, item.lootBoxData?.rewards || [])}
                        >
                          {item && (
                            <>
                              <div className="flex items-center justify-center h-full">
                                {item.isLootBox ? (
                                  <div className={`w-full h-full flex items-center justify-center rounded-md overflow-hidden ${
                                    item.lootBoxData?.type === 'common' ? 'bg-gray-700 bg-common-pulse' :
                                    item.lootBoxData?.type === 'uncommon' ? 'bg-green-800 bg-uncommon-pulse' :
                                    item.lootBoxData?.type === 'rare' ? 'bg-blue-800 bg-rare-pulse' :
                                    item.lootBoxData?.type === 'epic' ? 'bg-purple-800 bg-epic-pulse' :
                                    'bg-amber-700 bg-legendary-pulse'
                                  }`}>
                                    <span className="text-2xl relative z-10">📦</span>
                                  </div>
                                ) : (
                                  <span className="text-2xl">{resourceIcons[item.type] || '🔮'}</span>
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
                              {item.isLootBox ? `${item.lootBoxData?.type} Loot Crate` : item.type.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-brand-light/70">
                              {item.isLootBox 
                                ? "A sealed container with valuable materials. Free to open."
                                : `Used for crafting in Gizbo's Forge.`
                              }
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
                          >
                            <div className="flex items-center justify-center h-full">
                              <span className="text-2xl">{resourceIcons[item.type] || '🔮'}</span>
                            </div>
                            <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-xs bg-space-darkest/80 rounded-tl-md rounded-br-sm">
                              {item.quantity}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-space-dark border-brand-orange/30 text-brand-light p-3">
                          <div className="space-y-1">
                            <p className="font-bold capitalize text-brand-orange">
                              {item.type.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-brand-light/70">
                              Used for crafting in Gizbo's Forge.
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
                            onClick={() => item.lootBoxData && handleLootBoxOpen(item.lootBoxData, item.lootBoxData?.rewards || [])}
                          >
                            <div className="flex items-center justify-center h-full">
                              <div className={`w-full h-full flex items-center justify-center rounded-md overflow-hidden ${
                                item.lootBoxData?.type === 'common' ? 'bg-gray-700 bg-common-pulse' :
                                item.lootBoxData?.type === 'uncommon' ? 'bg-green-800 bg-uncommon-pulse' :
                                item.lootBoxData?.type === 'rare' ? 'bg-blue-800 bg-rare-pulse' :
                                item.lootBoxData?.type === 'epic' ? 'bg-purple-800 bg-epic-pulse' :
                                'bg-amber-700 bg-legendary-pulse'
                              }`}>
                                <span className="text-2xl relative z-10">📦</span>
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
                              {`${item.lootBoxData?.type} Loot Crate`}
                            </p>
                            <p className="text-xs text-brand-light/70">
                              A sealed container with valuable materials. Free to open.
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
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="bg-space-dark rounded-lg p-4">
                {inventoryHistory && inventoryHistory.length > 0 ? (
                  <div className="space-y-2">
                    {inventoryHistory.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between border-b border-space-light/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{resourceIcons[entry.type] || '🔮'}</span>
                          <div>
                            <p className="font-medium capitalize">{entry.type.replace('-', ' ')}</p>
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
          <DialogContent className="bg-space-dark border-brand-orange/30 sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-brand-orange">Loot Box Rewards!</DialogTitle>
              <DialogDescription className="text-center text-brand-light/70">
                {currentRewards.length > 0 ? "Spinning the loot wheel..." : "No rewards found in this loot box."}
              </DialogDescription>
            </DialogHeader>
            
            {currentRewards.length > 0 ? (
              <div className="relative">
                {/* CS:GO-style item scroll animation - with fixed width */}
                <div className="overflow-hidden max-w-full mx-auto my-6 bg-gradient-to-r from-space-dark via-space-mid to-space-dark border-2 border-brand-orange/50 rounded-md relative">
                  {/* Highlight marker in the center */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-brand-yellow z-10"></div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent z-10"></div>
                  
                  {/* The scrolling items container */}
                  <div className="py-6 flex items-center relative w-[300%] md:w-[200%]" style={{ animation: 'slotMachine 4s cubic-bezier(0.1, 0.4, 0.2, 1) forwards' }}>
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
                          <span className="text-2xl md:text-3xl mb-1">{resourceIcons[randomItem.type] || '🔮'}</span>
                          <span className="font-medium capitalize text-white text-center text-xs md:text-sm">{randomItem.type.replace('-', ' ')}</span>
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
                          <span className="text-2xl md:text-3xl mb-1">{resourceIcons[reward.type] || '🔮'}</span>
                          <span className="font-medium capitalize text-white text-center text-xs md:text-sm">{reward.type.replace('-', ' ')}</span>
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
                        <span className="text-3xl mb-2">{resourceIcons[reward.type] || '🔮'}</span>
                        <span className="font-medium capitalize text-brand-light">{reward.type.replace('-', ' ')}</span>
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