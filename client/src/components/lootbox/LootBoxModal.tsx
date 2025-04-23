import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface LootBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  lootBoxId: number | null;
  onLootBoxOpened: () => void; // Callback to refresh inventory after opening
}

export function LootBoxModal({ isOpen, onClose, lootBoxId, onLootBoxOpened }: LootBoxModalProps) {
  // Get React Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasTransitionStarted, setHasTransitionStarted] = useState(false);
  const [showFinalReward, setShowFinalReward] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{ type: string, quantity: number } | null>(null);
  const [scrollItems, setScrollItems] = useState<Array<{ itemId: string, quantity: number }>>([]);
  const [openedRewards, setOpenedRewards] = useState<Array<{ type: string, quantity: number }> | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOpening, setIsOpening] = useState(false);
  
  // Default values for loot box data
  const [lootBoxData, setLootBoxData] = useState({
    lootBoxName: '',
    lootBoxDescription: '',
    lootBoxImage: '',
    lootBoxRarity: 'common' as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
    lootBoxType: '',
    itemDropTable: [] as Array<{itemId: string, weight: number, minQuantity: number, maxQuantity: number}>,
    minRewards: 1,
    maxRewards: 3,
    totalWeight: 0
  });

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsAnimating(false);
      setHasTransitionStarted(false);
      setShowFinalReward(false);
      setSelectedReward(null);
      setScrollItems([]);
      setOpenedRewards(null);
      setIsOpening(false);
    }
  }, [isOpen]);

  // Update the final item in the scrolling animation when the reward is received
  useEffect(() => {
    if (selectedReward && scrollItems.length > 0 && isAnimating) {
      console.log("Updating final scroll item to match actual reward:", selectedReward);
      const updatedScrollItems = [...scrollItems];
      // Replace the final item with the actual selected reward
      updatedScrollItems[updatedScrollItems.length - 1] = {
        itemId: selectedReward.type,
        quantity: selectedReward.quantity
      };
      setScrollItems(updatedScrollItems);
    }
  }, [selectedReward, isAnimating]);

  // Fetch loot box details
  const { data: lootBox, isLoading: isLoadingLootBox } = useQuery({
    queryKey: [`/api/loot-boxes/${lootBoxId}`],
    enabled: !!lootBoxId && isOpen,
  });
  
  // Fetch all items for displaying names
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/admin/items'],
    enabled: isOpen,
  });

  // Calculate drop chances based on weights
  const calculateDropChance = (weight: number, totalWeight: number) => {
    if (!totalWeight) return 0;
    return ((weight / totalWeight) * 100).toFixed(1);
  };

  // Get the total weight of all items
  const getTotalWeight = (dropTable: Array<{itemId: string, weight: number}>) => {
    if (!dropTable || !Array.isArray(dropTable)) return 0;
    return dropTable.reduce((sum, item) => sum + (item.weight || 0), 0);
  };

  // Get item name from ID
  const getItemName = (itemId: string) => {
    if (!items) return itemId;
    const item = items.find((i: any) => i.id === itemId);
    return item ? item.name : itemId;
  };

  // Update loot box data when lootBox changes
  useEffect(() => {
    if (lootBox) {
      console.log('Loot box data:', lootBox);
      
      const config = lootBox.config || {};
      const itemDropTable = config.itemDropTable || [];
      
      setLootBoxData({
        lootBoxName: lootBox.name || '',
        lootBoxDescription: lootBox.description || '',
        lootBoxImage: lootBox.image || '',
        lootBoxRarity: (lootBox.rarity || 'common') as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        lootBoxType: lootBox.type || '',
        itemDropTable,
        minRewards: config.minRewards || 1,
        maxRewards: config.maxRewards || 3,
        totalWeight: getTotalWeight(itemDropTable)
      });
    }
  }, [lootBox]);

  // Generate a set of random items for the scrolling effect
  const generateScrollItems = () => {
    const { itemDropTable } = lootBoxData;
    if (!itemDropTable || !items || items.length === 0) {
      console.error("No item data available for scrolling animation");
      return [
        { itemId: 'metal', quantity: 1 },
        { itemId: 'cloth', quantity: 1 },
        { itemId: 'tech-scrap', quantity: 1 }
      ];
    }
    
    // Create an array with items for scrolling
    const scrollItems = [];
    
    // First add 30 common items to ensure the animation starts smoothly
    const commonItems = ['metal', 'cloth', 'tech-scrap'];
    
    // Start with guaranteed common items to ensure animation begins correctly
    for (let i = 0; i < 30; i++) {
      const commonItem = commonItems[i % commonItems.length];
      scrollItems.push({
        itemId: commonItem,
        quantity: Math.floor(Math.random() * 3) + 1
      });
    }
    
    // Then add randomized items from the drop table
    for (let i = 0; i < 80; i++) {
      if (itemDropTable.length > 0) {
        const randomIndex = Math.floor(Math.random() * itemDropTable.length);
        const item = itemDropTable[randomIndex];
        
        if (item) {
          // Calculate a random quantity between min and max
          const minQt = item.minQuantity || 1;
          const maxQt = item.maxQuantity || minQt;
          const randomQuantity = Math.floor(Math.random() * (maxQt - minQt + 1)) + minQt;
          
          // Add some rare items to make the scroll more exciting
          if (i % 10 === 0) {  // Every 10 items add a special item
            const rareItems = ['RareCrown', 'gizbos', 'circuit-board', 'sensor-crystal'];
            const randomRareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
            
            scrollItems.push({
              itemId: randomRareItem,
              quantity: 1
            });
          } else {
            scrollItems.push({
              itemId: item.itemId,
              quantity: randomQuantity
            });
          }
        }
      }
    }
    
    // Make sure there are at least 50 items (for minimum animation length)
    if (scrollItems.length < 50) {
      const filler = { itemId: 'metal', quantity: 1 };
      while (scrollItems.length < 50) {
        scrollItems.push(filler);
      }
    }
    
    // Make sure the last item is a placeholder for the actual reward
    scrollItems.push({
      itemId: 'metal', // Placeholder, will be replaced with the actual reward
      quantity: 1      // Placeholder, will be replaced
    });
    
    return scrollItems;
  };

  // Handle opening the loot box
  const handleOpenLootBox = async () => {
    if (isOpening || !lootBoxId) return;
    
    try {
      console.log("Opening loot box ID:", lootBoxId);
      setIsOpening(true);
      
      // API request to open the loot box immediately to get the real reward
      const response = await fetch(`/api/loot-boxes/${lootBoxId}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log("Loot box open response:", data);
      
      if (data.success && data.rewards && data.rewards.length > 0) {
        console.log("Received rewards:", data.rewards);
        // Save all rewards but use the first one for animation
        setOpenedRewards(data.rewards);
        setSelectedReward(data.rewards[0]);
        console.log("Selected reward:", data.rewards[0]);
        
        // Generate 120 scroll items using actual drop table items
        const baseItems = lootBoxData?.itemDropTable?.map(item => item.itemId) || [];
        const fallbackItems = ['metal', 'cloth', 'tech-scrap']; 
        const itemPool = baseItems.length > 0 ? baseItems : fallbackItems;
        
        // Generate a random array of items
        const generatedItems = Array.from({ length: 120 }, () => {
          const randomIndex = Math.floor(Math.random() * itemPool.length);
          const randomItem = itemPool[randomIndex];
          const randomQuantity = Math.floor(Math.random() * 3) + 1; // 1-3
          
          return {
            itemId: randomItem,
            quantity: randomQuantity
          };
        });
        
        // Add a winner item at the very end 
        // Add a buffer item right before to ensure good spacing
        generatedItems.push(
          // Add some filler items before the winner (these will be visible but not the winner)
          {
            itemId: itemPool[Math.floor(Math.random() * itemPool.length)],
            quantity: Math.floor(Math.random() * 3) + 1
          },
          {
            itemId: itemPool[Math.floor(Math.random() * itemPool.length)],
            quantity: Math.floor(Math.random() * 3) + 1
          },
          // Then add the actual winning item
          {
            itemId: data.rewards[0].type,
            quantity: data.rewards[0].quantity
          }
        );
        
        // Set the scroll items
        console.log("Generated scroll items with winning item:", data.rewards[0].type);
        setScrollItems(generatedItems);
        
        // Start the animation
        setIsAnimating(true);
        
        // Delay adding the transition class slightly to ensure DOM is ready
        setTimeout(() => {
          setHasTransitionStarted(true);
        }, 50);
        
        // Use 7 seconds for animation - matches the CSS transition duration
        setTimeout(() => {
          console.log("Animation completed, showing final reward");
          setIsAnimating(false);
          setHasTransitionStarted(false);
          setShowFinalReward(true);
        }, 7000);
      } else {
        console.error("Error from API:", data);
        // Stop animation if there's an error
        setIsAnimating(false);
        toast({
          title: "Error",
          description: data.message || "Failed to open loot box",
          variant: "destructive",
        });
        setIsOpening(false);
      }
    } catch (error) {
      console.error("Error opening loot box:", error);
      // Stop animation if there's an error
      setIsAnimating(false);
      toast({
        title: "Error",
        description: "Failed to open loot box. Please try again.",
        variant: "destructive",
      });
      setIsOpening(false);
    }
  };

  // Define rarity styles for borders and backgrounds
  const rarityStyles = {
    common: 'border-gray-600',
    uncommon: 'border-green-600',
    rare: 'border-blue-600',
    epic: 'border-purple-600',
    legendary: 'border-amber-500',
  };
  
  // Destructure loot box data for easier access
  const {
    lootBoxName,
    lootBoxDescription,
    lootBoxImage,
    lootBoxRarity,
    itemDropTable,
    minRewards,
    maxRewards,
    totalWeight
  } = lootBoxData;

  // Loading state
  if (isLoadingLootBox || isLoadingItems) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <RefreshCw size={40} className="mx-auto animate-spin text-brand-orange mb-4" />
              <p className="text-lg">Loading loot box details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // CSGO-style animation states
  if (isOpen && (isAnimating || showFinalReward)) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] bg-black/90 border-brand-orange/30">
          <DialogHeader>
            <DialogTitle className="text-2xl">Opening Loot Box</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full overflow-hidden bg-gradient-to-b from-black/70 via-black/50 to-black/70 border-2 border-brand-orange/70 rounded-lg p-4 mb-4" style={{ height: '280px', boxShadow: 'inset 0 0 15px rgba(255, 140, 0, 0.2)' }}>
            {/* Loot Crate Image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <img 
                src={lootBoxImage || '/images/loot-crate.png'} 
                alt={lootBoxName} 
                className="w-32 h-32 object-contain"
              />
            </div>
            
            {/* Loading text animation while waiting for API */}
            {isAnimating && !selectedReward && (
              <div className="absolute inset-0 flex items-center justify-center text-brand-orange">
                <RefreshCw size={40} className="animate-spin mr-3" />
                <p>Opening your loot box...</p>
              </div>
            )}
            
            {/* Scrolling Animation Container */}
            {isAnimating && selectedReward && (
              <div 
                className="absolute inset-0 flex items-center" 
                style={{ 
                  overflowX: 'hidden',
                  perspective: '500px'
                }}
              >
                <div 
                  ref={scrollContainerRef}
                  className="flex items-center justify-center py-6" 
                  style={{ 
                    willChange: 'transform',
                    position: 'relative',
                    transition: 'transform 7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: hasTransitionStarted 
                      // Calculate exact position to center the last item (winner) under the indicator
                      ? `translateX(calc(-${(scrollItems.length - 1) * 84}px + 50% - 42px))` 
                      : 'translateX(0px)',
                    padding: '0 450px', // Padding to ensure items are visible at the start
                  }}
                >
                  {scrollItems.map((item, index) => {
                    // Get item details
                    const itemDetails = items?.find((i: any) => i.id === item.itemId);
                    const itemRarity = itemDetails?.rarity || 'common';
                    
                    // Get rarity color and border classes
                    const rarityColorClass = (() => {
                      switch(itemRarity) {
                        case 'common': return 'text-gray-300';
                        case 'uncommon': return 'text-green-400';
                        case 'rare': return 'text-blue-400';
                        case 'epic': return 'text-purple-400';
                        case 'legendary': return 'text-amber-400';
                        default: return 'text-gray-300';
                      }
                    })();
                    
                    const rarityBorderClass = (() => {
                      switch(itemRarity) {
                        case 'common': return 'border-gray-600';
                        case 'uncommon': return 'border-green-600';
                        case 'rare': return 'border-blue-600';
                        case 'epic': return 'border-purple-600';
                        case 'legendary': return 'border-amber-500';
                        default: return 'border-gray-600';
                      }
                    })();
                    
                    const rarityBgClass = (() => {
                      switch(itemRarity) {
                        case 'common': return 'bg-gray-800';
                        case 'uncommon': return 'bg-green-900/40';
                        case 'rare': return 'bg-blue-900/40';
                        case 'epic': return 'bg-purple-900/40';
                        case 'legendary': return 'bg-amber-900/40';
                        default: return 'bg-gray-800';
                      }
                    })();
                    
                    const rarityAnimationClass = (() => {
                      switch(itemRarity) {
                        case 'common': return '';
                        case 'uncommon': return '';
                        case 'rare': return 'animate-pulse-slow';
                        case 'epic': return 'animate-pulse';
                        case 'legendary': return 'animate-ping-slow';
                        default: return '';
                      }
                    })();
                    
                    // Special styling for the final winning item
                    const isLastItem = index === scrollItems.length - 1;
                    const itemSize = isLastItem ? 'w-28 h-28' : 'w-16 h-16';
                    
                    // Add some visual excitement - scale items at certain indices
                    const isSpecialPosition = index % 10 === 0;
                    const specialScale = isSpecialPosition ? 'scale-110' : '';
                    
                    const itemClasses = isLastItem 
                      ? 'z-10 scale-125 shadow-lg shadow-brand-orange/70' 
                      : specialScale;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex-shrink-0 mx-3 flex flex-col items-center justify-center ${itemClasses}`}
                      >
                        <div 
                          className={`${itemSize} flex items-center justify-center rounded-md p-2.5 border-2 ${rarityBorderClass} ${rarityBgClass} ${rarityAnimationClass}`}
                          style={{
                            boxShadow: isLastItem ? '0 0 10px 3px rgba(255, 140, 0, 0.5)' : '',
                            transform: isLastItem ? 'scale(1.3)' : '',
                          }}
                        >
                          <img 
                            src={itemDetails?.imagePath || '/images/items/default.png'} 
                            alt={getItemName(item.itemId)}
                            className="max-w-full max-h-full object-contain"
                          />
                          
                          {/* Special shine effect overlay on rare+ items */}
                          {(itemRarity === 'epic' || itemRarity === 'legendary') && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shine rounded-md"></div>
                          )}
                        </div>
                        <div className="text-center mt-1">
                          <p className={`font-medium text-xs ${rarityColorClass} truncate max-w-24 ${isLastItem ? 'font-bold text-base' : ''}`}>
                            {getItemName(item.itemId)}
                          </p>
                          <span className={`text-xs bg-brand-orange/20 px-1 py-0.5 rounded-full text-brand-orange ${isLastItem ? 'text-sm font-bold' : ''}`}>
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Fixed indicator line in the center */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-brand-orange z-20 animate-pulse" 
                  style={{ 
                    boxShadow: '0 0 8px 2px rgba(255, 140, 0, 0.7)', 
                    transform: 'translateX(-50%)'
                  }}
                ></div>
                
                {/* Add "Winner" text above the line */}
                <div className="absolute left-1/2 top-2 transform -translate-x-1/2 bg-brand-orange px-2 py-0.5 rounded text-xs font-bold text-black z-20">
                  WINNER
                </div>
              </div>
            )}
            
            {/* Final Reward Display */}
            {showFinalReward && selectedReward && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadeIn">
                <div className="text-center mb-2">
                  <h2 className="text-xl font-bold text-brand-orange mb-1">Congratulations!</h2>
                  <p className="text-white text-sm">You received:</p>
                </div>
                
                {(() => {
                  // Get item details for the reward
                  const itemDetails = items?.find((i: any) => i.id === selectedReward.type);
                  const itemRarity = itemDetails?.rarity || 'common';
                  
                  // Get rarity styling
                  const rarityColorClass = (() => {
                    switch(itemRarity) {
                      case 'common': return 'text-gray-300';
                      case 'uncommon': return 'text-green-400';
                      case 'rare': return 'text-blue-400';
                      case 'epic': return 'text-purple-400';
                      case 'legendary': return 'text-amber-400';
                      default: return 'text-gray-300';
                    }
                  })();
                  
                  const rarityBorderClass = (() => {
                    switch(itemRarity) {
                      case 'common': return 'border-gray-600';
                      case 'uncommon': return 'border-green-600';
                      case 'rare': return 'border-blue-600';
                      case 'epic': return 'border-purple-600';
                      case 'legendary': return 'border-amber-500';
                      default: return 'border-gray-600';
                    }
                  })();
                  
                  // Animation class for the reward
                  const animationClass = (() => {
                    switch(itemRarity) {
                      case 'common': return '';
                      case 'uncommon': return 'animate-pulse';
                      case 'rare': return 'animate-pulse';
                      case 'epic': return 'animate-bounce';
                      case 'legendary': return 'animate-ping-slow';
                      default: return '';
                    }
                  })();
                  
                  return (
                    <div 
                      className={`flex flex-col items-center bg-black/70 rounded-md p-4 border-3 ${rarityBorderClass} animate-scaleIn`}
                    >
                      <div className={`w-32 h-32 flex items-center justify-center mb-2 ${animationClass}`}>
                        <img 
                          src={itemDetails?.imagePath || '/images/items/default.png'} 
                          alt={getItemName(selectedReward.type)}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div className="text-center">
                        <p className={`font-bold text-lg ${rarityColorClass}`}>
                          {getItemName(selectedReward.type)}
                        </p>
                        
                        <div className="flex justify-center items-center mt-1">
                          <span className="bg-brand-orange/30 px-2 py-0.5 rounded-full text-brand-orange text-md font-bold">
                            ×{selectedReward.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-center gap-4 sm:justify-center">
            {/* Skip animation button */}
            {isAnimating && (
              <Button 
                onClick={() => {
                  console.log("Skipping animation");
                  setIsAnimating(false);
                  setHasTransitionStarted(false);
                  setShowFinalReward(true);
                }}
                variant="outline"
                size="sm"
              >
                Skip Animation
              </Button>
            )}
            
            {/* Continue button after reveal */}
            {showFinalReward && selectedReward && (
              <Button 
                onClick={() => {
                  console.log("Continue button clicked, showing all rewards");
                  // If we haven't already set openedRewards, use the selectedReward
                  if (!openedRewards) {
                    setOpenedRewards([selectedReward]);
                  }
                  // Make sure we're no longer in animation states
                  setIsAnimating(false);
                  setShowFinalReward(false);
                  
                  // Important: Invalidate cache to refresh loot box and inventory data
                  queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
                  
                  onLootBoxOpened(); // Notify parent component
                }}
                className="px-8"
              >
                Continue to Rewards
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Final reward display (after animation)
  if (isOpen && openedRewards && openedRewards.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] bg-black/90 border-brand-orange/30 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">Loot Box Opened!</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X size={16} />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center mb-4">
            <Package size={40} className="text-brand-orange mb-2" />
            <p className="text-lg mb-3">You received the following items:</p>
            
            <div className="w-full">
              <Card className="p-4 bg-black/30 border border-brand-orange/30">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[...openedRewards]
                    .sort((a, b) => {
                      // Get item details for both items
                      const aDetails = items?.find((i: any) => i.id === a.type);
                      const bDetails = items?.find((i: any) => i.id === b.type);
                      
                      // Get rarity values (numerical - higher is more rare)
                      const rarityValue = (rarity: string) => {
                        switch(rarity) {
                          case 'legendary': return 5;
                          case 'epic': return 4;
                          case 'rare': return 3;
                          case 'uncommon': return 2;
                          case 'common': return 1;
                          default: return 0;
                        }
                      };
                      
                      // Sort by rarity (descending)
                      return rarityValue(bDetails?.rarity || 'common') - rarityValue(aDetails?.rarity || 'common');
                    })
                    .map((reward, index) => {
                      // Get item details
                      const itemDetails = items?.find((i: any) => i.id === reward.type);
                      const itemRarity = itemDetails?.rarity || 'common';
                      
                      // Get rarity color class
                      const rarityColorClass = (() => {
                        switch(itemRarity) {
                          case 'common': return 'text-gray-300';
                          case 'uncommon': return 'text-green-400';
                          case 'rare': return 'text-blue-400';
                          case 'epic': return 'text-purple-400';
                          case 'legendary': return 'text-amber-400';
                          default: return 'text-gray-300';
                        }
                      })();
                      
                      const rarityBorderClass = (() => {
                        switch(itemRarity) {
                          case 'common': return 'border-gray-600';
                          case 'uncommon': return 'border-green-600';
                          case 'rare': return 'border-blue-600';
                          case 'epic': return 'border-purple-600';
                          case 'legendary': return 'border-amber-500';
                          default: return 'border-gray-600';
                        }
                      })();
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex flex-col items-center bg-black/30 rounded-md p-2 border-2 ${rarityBorderClass} transition-transform hover:scale-105`}
                        >
                          <div className="w-12 h-12 flex items-center justify-center mb-1">
                            <img 
                              src={itemDetails?.imagePath || '/images/items/default.png'} 
                              alt={getItemName(reward.type)}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          
                          <div className="text-center mt-1">
                            <p className={`font-medium text-xs ${rarityColorClass} truncate max-w-full`}>
                              {getItemName(reward.type)}
                            </p>
                            
                            <span className="mt-1 inline-block bg-brand-orange/20 px-1 py-0.5 rounded-full text-xs text-brand-orange">
                              ×{reward.quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => {
                // Important: Invalidate cache to refresh loot box and inventory data
                queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
                queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
                
                onClose();
                // Reset all states
                setIsOpening(false);
                setOpenedRewards(null);
                setSelectedReward(null);
                setShowFinalReward(false);
                setIsAnimating(false);
                setHasTransitionStarted(false);
              }}
              className="w-full"
            >
              Return to Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default loot box preview (before opening)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full bg-${lootBoxRarity}-500`}></span>
              {lootBoxName || `${lootBoxRarity.charAt(0).toUpperCase() + lootBoxRarity.slice(1)} Loot Box`}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className={`p-3 rounded-lg border-2 ${rarityStyles[lootBoxRarity as keyof typeof rarityStyles] || rarityStyles.common}`}>
              <img 
                src={lootBoxImage || '/images/loot-crate.png'} 
                alt={lootBoxName} 
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
          
          <div className="flex-grow">
            <p className="text-gray-300 mb-3">{lootBoxDescription}</p>
            
            <div className="bg-black/20 rounded-md p-3 border border-brand-orange/20">
              <p className="font-medium text-sm">About this loot box:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300 text-sm">
                <li>You will receive {minRewards === maxRewards ? minRewards : `${minRewards}-${maxRewards}`} items</li>
                <li>Contains {itemDropTable?.length || 0} potential items</li>
                <li>Rarity: {lootBoxRarity?.charAt(0).toUpperCase() + lootBoxRarity?.slice(1)}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Potential Rewards Grid */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Potential Rewards</h3>
          
          {(!itemDropTable || !itemDropTable.length) ? (
            <Card className="p-4 text-center border-brand-orange/20 text-sm">
              <p>No item data available for this loot box.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.isArray(itemDropTable) && [...itemDropTable]
                .sort((a, b) => {
                  // Get item details for both items
                  const aDetails = items?.find((i: any) => i.id === a.itemId);
                  const bDetails = items?.find((i: any) => i.id === b.itemId);
                  
                  // Get rarity values (numerical - higher is more rare)
                  const rarityValue = (rarity: string) => {
                    switch(rarity) {
                      case 'legendary': return 5;
                      case 'epic': return 4;
                      case 'rare': return 3;
                      case 'uncommon': return 2;
                      case 'common': return 1;
                      default: return 0;
                    }
                  };
                  
                  // Sort by rarity (descending)
                  return rarityValue(bDetails?.rarity || 'common') - rarityValue(aDetails?.rarity || 'common');
                })
                .map((item, index) => {
                // Get item details
                const itemDetails = items?.find((i: any) => i.id === item.itemId);
                const itemRarity = itemDetails?.rarity || 'common';
                
                // Get rarity color class
                const rarityColorClass = (() => {
                  switch(itemRarity) {
                    case 'common': return 'text-gray-300';
                    case 'uncommon': return 'text-green-400';
                    case 'rare': return 'text-blue-400';
                    case 'epic': return 'text-purple-400';
                    case 'legendary': return 'text-amber-400';
                    default: return 'text-gray-300';
                  }
                })();
                
                // Get rarity border class
                const rarityBorderClass = (() => {
                  switch(itemRarity) {
                    case 'common': return 'border-gray-600';
                    case 'uncommon': return 'border-green-600';
                    case 'rare': return 'border-blue-600';
                    case 'epic': return 'border-purple-600';
                    case 'legendary': return 'border-amber-500';
                    default: return 'border-gray-600';
                  }
                })();
                
                // Get quantity text
                const quantityText = item.minQuantity === item.maxQuantity 
                  ? `×${item.minQuantity}` 
                  : `×${item.minQuantity}-${item.maxQuantity}`;
                  
                // Get drop chance
                const dropChance = calculateDropChance(item.weight, totalWeight);
                
                return (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center bg-black/30 rounded-md p-2 border ${rarityBorderClass} transition-transform hover:scale-105`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-1">
                      <img 
                        src={itemDetails?.imagePath || '/images/items/default.png'} 
                        alt={getItemName(item.itemId)}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    
                    <div className="text-center mt-1">
                      <p className={`font-medium text-xs ${rarityColorClass} truncate max-w-full`}>
                        {getItemName(item.itemId)}
                      </p>
                      
                      <div className="flex justify-between items-center mt-0.5 text-xs text-gray-400 w-full px-1">
                        <span>{quantityText}</span>
                        <span className="bg-brand-orange/20 px-1 py-0.5 rounded-full text-xs text-brand-orange">{dropChance}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleOpenLootBox}
            disabled={isOpening}
            className="relative group overflow-hidden"
          >
            {isOpening ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <span className="relative z-10">Open Loot Box</span>
                <span className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 via-white/20 to-brand-orange/0 -translate-x-full group-hover:animate-shine"></span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}