import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Package, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Rarity styles for visual appeal
const rarityStyles = {
  common: 'bg-slate-200 text-slate-700 border-slate-300',
  uncommon: 'bg-green-100 text-green-700 border-green-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300',
};

// Animation classes for the items
const rarityAnimations = {
  common: 'animate-pulse',
  uncommon: 'animate-pulse',
  rare: 'animate-bounce',
  epic: 'animate-bounce',
  legendary: 'animate-ping',
};

export default function LootBoxPreview() {
  const [, params] = useRoute('/loot-box-preview/:id');
  const [, setLocation] = useLocation();
  const [isOpening, setIsOpening] = useState(false);
  const [openedRewards, setOpenedRewards] = useState<Array<{type: string, quantity: number}> | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{type: string, quantity: number} | null>(null);
  const [showFinalReward, setShowFinalReward] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollItems, setScrollItems] = useState<Array<{itemId: string, quantity: number}>>([]);

  // Get the loot box ID from the route params
  const lootBoxId = params?.id ? parseInt(params.id) : undefined;

  // Fetch loot box details
  const { data: lootBox, isLoading: isLoadingLootBox } = useQuery({
    queryKey: [`/api/loot-boxes/${lootBoxId}`],
    enabled: !!lootBoxId,
  });
  
  // We'll extract data later once we know the lootBox exists

  // Fetch all items for displaying names
  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ['/api/admin/items'],
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

  // Generate a set of random items for the scrolling effect
  const generateScrollItems = () => {
    if (!itemDropTable || !items) return [];
    
    // Create an array with 50 random items for scrolling (more items make the animation smoother)
    const scrollItems = [];
    for (let i = 0; i < 50; i++) {
      // For variety in the animation, we'll use the full item table
      const randomIndex = Math.floor(Math.random() * itemDropTable.length);
      const item = itemDropTable[randomIndex];
      
      if (item) {
        const randomQuantity = Math.floor(
          Math.random() * (item.maxQuantity - item.minQuantity + 1) + item.minQuantity
        );
        
        scrollItems.push({
          itemId: item.itemId,
          quantity: randomQuantity
        });
      }
    }
    
    return scrollItems;
  };
  
  // Animation effect to scroll the items
  useEffect(() => {
    if (isAnimating && scrollContainerRef.current) {
      // Start the animation
      const container = scrollContainerRef.current;
      container.style.transform = 'translateX(800%)';
      
      // Force a reflow before adding the animation class
      void container.offsetWidth;
      
      // Trigger the animation
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.style.animation = 'scrollItems 12s cubic-bezier(.2,0,.8,1) forwards';
        }
      }, 100);
    }
  }, [isAnimating]);
  
  // Start the unboxing animation
  const startUnboxingAnimation = (rewards: Array<{type: string, quantity: number}>) => {
    // Generate random items for the scrolling animation
    const items = generateScrollItems();
    
    // Add the actual reward at the end (this will be the one that stops on)
    // Map the rewards to the format expected by the scroll items
    const mappedRewards = rewards.map(reward => ({
      itemId: reward.type,
      quantity: reward.quantity
    }));
    
    // Get item details for rarity-based sorting of the scroll items
    const sortedItems = [...items];
    
    // Add our items to a global variable for access during animation
    // This is a bit of a hack, but it works well for the animation sorting
    (window as any).itemsData = items;
    
    const itemsSorted = sortedItems.sort((a, b) => {
      // Use our component's items state
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
      
      return rarityValue(bDetails?.rarity || 'common') - rarityValue(aDetails?.rarity || 'common');
    });
    
    // Ensure we have enough items for the animation (at least 30)
    const itemsArray = [];
    while (itemsArray.length < 30) {
      itemsArray.push(...itemsSorted);
    }
    
    // We'll show just the first reward at the position that will stop in the center
    const finalItem = mappedRewards[0];
    
    // Place the final item at a strategic position to ensure it lands in the center
    const finalItems = [...itemsArray.slice(0, 25), finalItem, ...itemsArray.slice(0, 10)];
    
    setScrollItems(finalItems);
    setSelectedReward(rewards[0]);
    setIsAnimating(true);
    
    // After 12 seconds, show the final reward
    setTimeout(() => {
      setIsAnimating(false);
      setShowFinalReward(true);
      setIsOpening(false);
      
      // After a delay, show all rewards
      setTimeout(() => {
        setOpenedRewards(rewards);
      }, 2000);
    }, 12000);
  };

  // Handle opening the loot box
  const handleOpenLootBox = async () => {
    if (!lootBoxId) return;

    setIsOpening(true);
    
    try {
      const response = await apiRequest(`/api/loot-boxes/${lootBoxId}/open`, 'POST');
      const data = await response.json();

      if (data.success) {
        // Instead of immediately showing the rewards, start the animation
        startUnboxingAnimation(data.rewards);
        
        toast({
          title: "Opening Loot Box...",
          description: "Get ready to see what's inside!",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to open loot box",
          variant: "destructive"
        });
        setLocation('/inventory');
      }
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: "Error",
        description: "Something went wrong while opening the loot box",
        variant: "destructive"
      });
      setLocation('/inventory');
    } finally {
      // We don't set isOpening to false here, it will be done after the animation
    }
  };

  // Handle returning to inventory
  const handleBackToInventory = () => {
    setLocation('/inventory');
  };

  // If loot box is not found, return to inventory
  useEffect(() => {
    if (!isLoadingLootBox && !lootBox) {
      toast({
        title: "Error",
        description: "Loot box not found",
        variant: "destructive"
      });
      setLocation('/inventory');
    }
  }, [isLoadingLootBox, lootBox, setLocation]);

  // Loading state
  if (isLoadingLootBox) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  // If we've opened the loot box, show the rewards
  // CSGO-style animation states
  if (isAnimating || showFinalReward) {
    // Render the animation UI
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Opening Loot Box
        </h1>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-full overflow-hidden bg-black/50 border-2 border-brand-orange/50 rounded-lg p-4 mb-8" style={{ height: '300px' }}>
            {/* Loot Crate Image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <img 
                src={image || '/images/loot-crate.png'} 
                alt={name} 
                className="w-40 h-40 object-contain"
              />
            </div>
            
            {/* Scrolling Animation Container */}
            {isAnimating && (
              <div 
                className="absolute inset-0 flex items-center" 
                style={{ 
                  overflowX: 'hidden',
                  perspective: '500px'
                }}
              >
                <div 
                  ref={scrollContainerRef}
                  className="flex" 
                  style={{ 
                    transition: 'transform 12s cubic-bezier(.2,0,.8,1)',
                    transform: 'translateX(100%)',
                    willChange: 'transform',
                    animation: 'scrollItems 12s cubic-bezier(.2,0,.8,1) forwards',
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
                    
                    // Middle item (the potential winner) should be larger
                    const isLastItem = index === scrollItems.length - 1;
                    const itemSize = isLastItem ? 'w-32 h-32' : 'w-20 h-20';
                    const itemClasses = isLastItem ? 'z-10 scale-125 shadow-lg shadow-brand-orange/50' : '';
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex-shrink-0 mx-4 flex flex-col items-center justify-center ${itemClasses}`}
                      >
                        <div 
                          className={`${itemSize} flex items-center justify-center rounded-md p-3 border-2 ${rarityBorderClass} bg-black/80`}
                        >
                          <img 
                            src={itemDetails?.imagePath || '/images/items/default.png'} 
                            alt={getItemName(item.itemId)}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="text-center mt-2">
                          <p className={`font-medium text-sm ${rarityColorClass} truncate max-w-32`}>
                            {getItemName(item.itemId)}
                          </p>
                          <span className="text-xs bg-brand-orange/20 px-2 py-0.5 rounded-full text-brand-orange">
                            ×{item.quantity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Fixed indicator line in the center */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-brand-orange z-20 animate-pulse"></div>
              </div>
            )}
            
            {/* Final Reward Display */}
            {showFinalReward && selectedReward && (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-fadeIn">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-brand-orange mb-2">Congratulations!</h2>
                  <p className="text-white">You received:</p>
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
                      case 'legendary': return 'animate-ping';
                      default: return '';
                    }
                  })();
                  
                  return (
                    <div 
                      className={`flex flex-col items-center bg-black/70 rounded-md p-6 border-4 ${rarityBorderClass} animate-scaleIn`}
                    >
                      <div className={`w-40 h-40 flex items-center justify-center mb-4 ${animationClass}`}>
                        <img 
                          src={itemDetails?.imagePath || '/images/items/default.png'} 
                          alt={getItemName(selectedReward.type)}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div className="text-center">
                        <p className={`font-bold text-xl ${rarityColorClass}`}>
                          {getItemName(selectedReward.type)}
                        </p>
                        
                        <div className="flex justify-center items-center mt-2">
                          <span className="bg-brand-orange/30 px-3 py-1 rounded-full text-brand-orange text-lg font-bold">
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
          
          {/* Loading spinner during animation */}
          {isAnimating && (
            <div className="flex flex-col items-center">
              <div className="animate-spin mb-2">
                <RefreshCw size={24} className="text-brand-orange" />
              </div>
              <p>Opening your loot box...</p>
            </div>
          )}
          
          {/* Skip button during animation */}
          {isAnimating && (
            <Button 
              onClick={() => {
                setIsAnimating(false);
                setShowFinalReward(true);
                setTimeout(() => setOpenedRewards([selectedReward!]), 2000);
              }}
              variant="outline"
              className="mt-4"
            >
              Skip Animation
            </Button>
          )}
          
          {/* Continue button after reveal */}
          {showFinalReward && !openedRewards && (
            <Button 
              onClick={() => setOpenedRewards([selectedReward!])}
              className="mt-6 px-8"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Final reward display (after animation)
  if (openedRewards) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Loot Box Opened!
        </h1>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <Package size={64} className="text-brand-orange mb-4" />
          <p className="text-xl mb-4">You received the following items:</p>
          
          <div className="w-full">
            <Card className="p-6 bg-black/30 border border-brand-orange/30">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  
                  // Get animation class
                  const animationClass = (() => {
                    switch(itemRarity) {
                      case 'common': return '';
                      case 'uncommon': return '';
                      case 'rare': return 'animate-pulse';
                      case 'epic': return 'animate-pulse';
                      case 'legendary': return 'animate-pulse';
                      default: return '';
                    }
                  })();
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center bg-black/30 rounded-md p-3 border-2 ${rarityBorderClass} transition-transform hover:scale-105 ${animationClass}`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center mb-2">
                        <img 
                          src={itemDetails?.imagePath || '/images/items/default.png'} 
                          alt={getItemName(reward.type)}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div className="text-center mt-1">
                        <p className={`font-medium text-sm ${rarityColorClass} truncate max-w-full`}>
                          {getItemName(reward.type)}
                        </p>
                        
                        <div className="flex justify-center items-center mt-1 text-xs">
                          <span className="bg-brand-orange/20 px-2 py-0.5 rounded-full text-brand-orange">
                            ×{reward.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={handleBackToInventory} className="px-8">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  // Regular display for loot box preview
  if (!lootBox) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">
          <p>Loot box not found.</p>
          <Button onClick={handleBackToInventory} className="mt-4">
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }
  
  // For debugging purposes
  console.log('Loot box data:', lootBox);
  
  // If we don't have a loot box, return to inventory
  if (!lootBox) {
    return null;
  }
  
  // Get data from either the config or fallback to the loot box data
  const lootBoxConfig = lootBox.config;
  
  // Extract data with fallbacks in case config is missing
  const lootBoxName = lootBox.name;
  const lootBoxDescription = lootBox.description;
  const lootBoxImage = lootBox.image;
  const lootBoxRarity = lootBox.rarity;
  const lootBoxType = lootBox.type;
  
  // If no config, provide default values
  const itemDropTable = lootBoxConfig?.itemDropTable || [];
  const minRewards = lootBoxConfig?.minRewards || 1;
  const maxRewards = lootBoxConfig?.maxRewards || 3;
  const totalWeight = getTotalWeight(itemDropTable);

  return (
    <div className="container max-w-4xl py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToInventory}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Button>
      </div>
      
      {/* Loot Box Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className={`p-4 rounded-lg border-2 ${rarityStyles[lootBoxRarity as keyof typeof rarityStyles] || rarityStyles.common}`}>
            <img 
              src={lootBoxImage || '/images/loot-crate.png'} 
              alt={lootBoxName} 
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{lootBoxName}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${rarityStyles[lootBoxRarity as keyof typeof rarityStyles] || rarityStyles.common}`}>
              {lootBoxRarity?.charAt(0).toUpperCase() + lootBoxRarity?.slice(1)}
            </span>
          </div>
          
          <p className="text-gray-300 mb-4">{lootBoxDescription}</p>
          
          <div className="bg-black/20 rounded-md p-4 border border-brand-orange/20">
            <p className="font-medium">About this loot box:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
              <li>You will receive {minRewards === maxRewards ? minRewards : `${minRewards}-${maxRewards}`} items</li>
              <li>Contains {itemDropTable?.length || 0} potential items</li>
              <li>Rarity: {lootBoxRarity?.charAt(0).toUpperCase() + lootBoxRarity?.slice(1)}</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Potential Rewards Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Potential Rewards</h2>
        
        {(!itemDropTable || !itemDropTable.length) ? (
          <Card className="p-6 text-center border-brand-orange/20">
            <p>No item data available for this loot box.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  className={`flex flex-col items-center bg-black/30 rounded-md p-3 border-2 ${rarityBorderClass} transition-transform hover:scale-105`}
                >
                  <div className="w-16 h-16 flex items-center justify-center mb-2">
                    <img 
                      src={itemDetails?.imagePath || '/images/items/default.png'} 
                      alt={getItemName(item.itemId)}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <div className="text-center mt-1">
                    <p className={`font-medium text-sm ${rarityColorClass} truncate max-w-full`}>
                      {getItemName(item.itemId)}
                    </p>
                    
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-400 w-full">
                      <span>{quantityText}</span>
                      <span className="bg-brand-orange/20 px-2 py-0.5 rounded-full text-brand-orange">{dropChance}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBackToInventory}
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
              <span className="absolute inset-0 bg-brand-orange/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}