import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, Package2, Clock, Sparkles, Info, Book, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LootBoxItem, LootBoxRewardModal } from '@/components/inventory/LootBox';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest, queryClient } from '@/lib/queryClient';
import ResetDatabaseButton from '@/components/debug/ResetDatabaseButton';

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

// Resource images mapping - these are just placeholders for the material icons
const resourceIcons: Record<string, string> = {
  'cloth': '🧵',
  'metal': '🔗',
  'tech-scrap': '🔌',
  'circuit-board': '🖥️',
  'crystal-core': '💎',
  'energy-cell': '🔋',
  'nano-chip': '🔬',
  'quantum-relay': '📡',
  'loot-box': '📦'
};

export default function Inventory() {
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [currentRewards, setCurrentRewards] = useState<{type: string, quantity: number}[]>([]);
  const [activeTab, setActiveTab] = useState("materials");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Get inventory resources
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['/api/inventory'],
    queryFn: () => fetch('/api/inventory').then(res => res.json()),
  });
  
  // Get loot boxes
  const { data: lootBoxes, isLoading: isLoadingLootBoxes } = useQuery({
    queryKey: ['/api/loot-boxes'],
    queryFn: () => fetch('/api/loot-boxes').then(res => res.json()),
  });
  
  // Get inventory history
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/inventory/history'],
    queryFn: () => fetch('/api/inventory/history').then(res => res.json()),
  });
  
  const handleLootBoxOpen = (lootBox: LootBox, rewards: {type: string, quantity: number}[]) => {
    try {
      sounds.questComplete();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    setCurrentRewards(rewards);
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
                          onClick={() => item?.isLootBox && item.lootBoxData && handleLootBoxOpen(item.lootBoxData, [])}
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
                              <p className="text-xs mt-1 text-brand-light/60">
                                Click to open this crate
                              </p>
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
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`aspect-square bg-space-dark border ${item ? 'border-space-light/40 hover:border-brand-orange/60' : 'border-space-light/10'} rounded-md p-1 relative cursor-pointer transition-colors`}
                          onMouseEnter={() => item && handleItemHover(item.type)}
                        >
                          {item && !item.isLootBox && (
                            <>
                              <div className="flex items-center justify-center h-full">
                                <span className="text-2xl">{resourceIcons[item.type] || '🔮'}</span>
                              </div>
                              <div className="absolute bottom-0 right-0 px-1.5 py-0.5 text-xs bg-space-darkest/80 rounded-tl-md rounded-br-sm">
                                {item.quantity}
                              </div>
                            </>
                          )}
                        </div>
                      </TooltipTrigger>
                      {item && !item.isLootBox && (
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
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="loot-boxes" className="mt-0">
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
                {inventoryGrid.map((item, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`aspect-square bg-space-dark border ${item ? 'border-space-light/40 hover:border-brand-orange/60' : 'border-space-light/10'} rounded-md p-1 relative cursor-pointer transition-colors`}
                          onMouseEnter={() => item && handleItemHover(item.type)}
                          onClick={() => item?.isLootBox && item.lootBoxData && handleLootBoxOpen(item.lootBoxData, [])}
                        >
                          {item && item.isLootBox && (
                            <>
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
                            </>
                          )}
                        </div>
                      </TooltipTrigger>
                      {item && item.isLootBox && (
                        <TooltipContent side="top" className="bg-space-dark border-brand-orange/30 text-brand-light p-3">
                          <div className="space-y-1">
                            <p className="font-bold capitalize text-brand-orange">
                              {item.lootBoxData?.type} Loot Crate
                            </p>
                            <p className="text-xs text-brand-light/70">
                              A sealed container with valuable materials. Free to open.
                            </p>
                            <p className="text-xs text-brand-yellow">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-xs mt-1 text-brand-light/60">
                              Click to open this crate
                            </p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </TabsContent>
            
            {/* History Tab */}
            <TabsContent value="history" className="mt-0">
              <div className="bg-space-dark rounded-lg border border-space-light/10 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Book className="text-brand-orange" size={20} />
                  <h3 className="text-xl font-bold">Resource History</h3>
                </div>
                
                {history && history.length > 0 ? (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {history.map((entry: any, index: number) => (
                      <div key={index} className="p-3 border border-space-light/10 rounded-md flex justify-between items-center bg-space-mid hover:bg-space-mid/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-space-dark flex items-center justify-center">
                            <span className="text-xl">{resourceIcons[entry.type] || '🔮'}</span>
                          </div>
                          <div>
                            <span className={`font-medium capitalize ${entry.action === 'gained' ? 'text-green-400' : 'text-red-400'}`}>
                              {entry.action === 'gained' ? '+' : '-'}{entry.quantity} {entry.type.replace('-', ' ')}
                            </span>
                            <p className="text-xs text-brand-light/60">
                              {entry.source}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-brand-light/50 whitespace-nowrap">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-brand-light/40">
                    <Package2 className="mx-auto mb-2 h-10 w-10 opacity-50" />
                    <p>No resource history yet.</p>
                    <p className="text-xs mt-2">Complete quests to earn resources!</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Item Details Panel (showing when hovering over an item) */}
        {hoveredItem && (
          <div className="bg-space-dark rounded-lg border border-brand-orange/20 p-4 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-md bg-space-mid flex items-center justify-center">
                <span className="text-3xl">{resourceIcons[hoveredItem] || '🔮'}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold capitalize text-brand-orange">
                  {hoveredItem.replace('-', ' ')}
                </h3>
                <p className="text-sm text-brand-light/70 mt-1">
                  {hoveredItem.includes('loot-box') 
                    ? "A sealed container with valuable materials. Free to open and received as quest rewards."
                    : "A crafting material used in Gizbo's Forge to create both digital and physical rewards."
                  }
                </p>
              </div>
              
              <div className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2 border-brand-orange/20">
                  <Info size={14} />
                  <span>Details</span>
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loot Box Rewards Modal */}
        <LootBoxRewardModal 
          isOpen={isRewardModalOpen}
          onClose={closeRewardModal}
          rewards={currentRewards}
        />
        
        {/* Development tools */}
        <div className="mt-8 border-t border-space-light/20 pt-4">
          <h3 className="text-xl font-bold text-brand-orange mb-2">Development Tools</h3>
          <p className="text-brand-light/70 text-sm mb-4">
            These tools are for development and testing purposes only. 
            Use them to reset your progress and test features.
          </p>
          <div className="max-w-xs">
            <ResetDatabaseButton />
          </div>
        </div>
      </div>
  );
}