import { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

// Define the CSS for the scrolling animation
import '@/index.css';

export default function LootBoxPreview() {
  const [, setLocation] = useLocation();
  const { lootBoxId } = useParams();
  
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
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
  
  // For handling back button
  const handleBackToInventory = () => {
    setLocation('/inventory');
  };

  // Fetch loot box details
  const { data: lootBox, isLoading: isLoadingLootBox } = useQuery({
    queryKey: [`/api/loot-boxes/${lootBoxId}`],
    enabled: !!lootBoxId,
  });
  
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

  // Handle opening the loot box
  const handleOpenLootBox = async () => {
    if (isOpening || !lootBoxId) return;
    
    try {
      setIsOpening(true);
      
      // API request to open the loot box
      const response = await fetch(`/api/loot-boxes/${lootBoxId}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success && data.rewards && data.rewards.length > 0) {
        // We'll only show the first reward in the animation
        // (Later we could enhance this to cycle through multiple rewards)
        setSelectedReward(data.rewards[0]);
        
        // Generate random items for scrolling effect
        setScrollItems(generateScrollItems());
        
        // Start the animation
        setIsAnimating(true);
        
        // After 12 seconds (matching the CSS animation), show the final reward
        setTimeout(() => {
          setIsAnimating(false);
          setShowFinalReward(true);
        }, 12000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to open loot box",
          variant: "destructive",
        });
        setIsOpening(false);
      }
    } catch (error) {
      console.error("Error opening loot box:", error);
      toast({
        title: "Error",
        description: "Failed to open loot box",
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

  // Loading state
  if (isLoadingLootBox || isLoadingItems) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <RefreshCw size={40} className="mx-auto animate-spin text-brand-orange mb-4" />
          <p className="text-lg">Loading loot box details...</p>
        </div>
      </div>
    );
  }
  
  // If we don't have a loot box, return to inventory
  if (!lootBox) {
    return null;
  }
  
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

  // If we've opened the loot box, show the rewards
  // CSGO-style animation states
  if (isAnimating || showFinalReward) {
    // Render the animation UI
    return (
      <div className="container max-w-4xl py-8">
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
        
        <h1 className="text-3xl font-bold mb-6 text-center">Opening Loot Box</h1>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-full overflow-hidden bg-black/50 border-2 border-brand-orange/50 rounded-lg p-4 mb-8" style={{ height: '300px' }}>
            {/* Loot Crate Image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <img 
                src={lootBoxImage || '/images/loot-crate.png'} 
                alt={lootBoxName} 
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
                        className={`flex flex-col items-center bg-black/30 rounded-md p-3 border-2 ${rarityBorderClass} transition-transform hover:scale-105`}
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
                          
                          <span className="mt-1 inline-block bg-brand-orange/20 px-2 py-0.5 rounded-full text-xs text-brand-orange">
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
        
        <div className="flex justify-center">
          <Button
            onClick={handleBackToInventory}
            className="px-8"
          >
            Return to Inventory
          </Button>
        </div>
      </div>
    );
  }

  // Default view - Loot box details and preview
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