import React, { useState, useEffect } from "react";
import { X, Package, ChevronRight, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import wallbg from "@assets/wallbg.png";
import picklockIconImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import axios from "axios";

interface FullscreenLockpickingAppProps {
  onClose: () => void;
}

interface Lootbox {
  id: number;
  userId: number;
  type: string;
  opened: boolean;
  acquiredAt: string;
  openedAt: string | null;
  rewards: Reward[];
  source: string;
  sourceId: string | null;
  image: string | null;
  description: string | null;
  name: string | null;
  rarity: string | null;
}

interface Reward {
  type: string;
  id: string; 
  quantity: number;
}

interface ItemInfo {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  rarity: string;
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

const FullscreenLockpickingApp: React.FC<FullscreenLockpickingAppProps> = ({ onClose }) => {
  const [lootboxes, setLootboxes] = useState<Lootbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLootbox, setSelectedLootbox] = useState<Lootbox | null>(null);
  const [openingLootbox, setOpeningLootbox] = useState(false);
  const [lootboxRewards, setLootboxRewards] = useState<Reward[]>([]);
  const [showRewards, setShowRewards] = useState(false);
  const [itemsInfo, setItemsInfo] = useState<Record<string, ItemInfo>>({});
  const [animatingReward, setAnimatingReward] = useState(false);

  // Fetch lootboxes from API
  useEffect(() => {
    const fetchLootboxes = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/lootboxes');
        // Filter to only show unopened lootboxes
        const unopenedLootboxes = response.data.filter((box: Lootbox) => !box.opened);
        console.log("Loaded lootboxes from API:", response.data);
        setLootboxes(unopenedLootboxes);
        setError(null);
      } catch (err) {
        console.error('Error fetching lootboxes:', err);
        setError('Failed to load your lootboxes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLootboxes();
  }, []);

  // Fetch item info for all possible rewards
  useEffect(() => {
    const fetchItemsInfo = async () => {
      try {
        const response = await axios.get('/api/items');
        const itemsData = response.data.reduce((acc: Record<string, ItemInfo>, item: ItemInfo) => {
          acc[item.id] = item;
          return acc;
        }, {});
        console.log('Item database loaded from server:', Object.keys(itemsData).length, "items");
        console.log('First few items:', Object.values(itemsData).slice(0, 3));
        setItemsInfo(itemsData);
      } catch (err) {
        console.error('Error fetching items info:', err);
      }
    };

    fetchItemsInfo();
  }, []);

  // Handle lootbox selection
  const handleSelectLootbox = (lootbox: Lootbox) => {
    // Play sound if available
    if (window.sounds) {
      window.sounds.click();
    }
    setSelectedLootbox(lootbox);
    setShowRewards(false);
    setLootboxRewards([]);
  };

  // Handle opening the lootbox
  const handleOpenLootbox = async () => {
    if (!selectedLootbox) return;
    
    try {
      // Play sound if available
      if (window.sounds) {
        window.sounds.click();
      }
      
      setOpeningLootbox(true);
      console.log('Opening lootbox with ID:', selectedLootbox.id);
      const response = await axios.post(`/api/loot-boxes/${selectedLootbox.id}/open`);
      
      // Start opening animation sequence
      setTimeout(() => {
        setAnimatingReward(true);
        
        // After animation, show rewards
        setTimeout(() => {
          setLootboxRewards(response.data.rewards);
          setShowRewards(true);
          setOpeningLootbox(false);
          setAnimatingReward(false);
          
          // Play reward sound if available
          if (window.sounds) {
            window.sounds.reward();
          }
          
          // Remove the opened lootbox from the list
          setLootboxes(lootboxes.filter(box => box.id !== selectedLootbox.id));
        }, 1500);
      }, 800);
    } catch (err) {
      console.error('Error opening lootbox:', err);
      setError('Failed to open the lootbox. Please try again.');
      setOpeningLootbox(false);
    }
  };

  // Render rarity badge with appropriate colors
  const renderRarityBadge = (rarity: string | null) => {
    let bgColor = '';
    let textColor = '';
    let displayRarity = 'Common'; // Default value
    
    // Handle null or undefined rarity
    if (!rarity) {
      bgColor = 'bg-gray-600/70';
      textColor = 'text-gray-200';
      
      return (
        <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
          {displayRarity}
        </span>
      );
    }
    
    displayRarity = rarity; // Use the actual rarity if it exists
    
    switch (rarity.toLowerCase()) {
      case 'common':
        bgColor = 'bg-gray-600/70';
        textColor = 'text-gray-200';
        break;
      case 'uncommon':
        bgColor = 'bg-green-700/70';
        textColor = 'text-green-200';
        break;
      case 'rare':
        bgColor = 'bg-blue-700/70';
        textColor = 'text-blue-200';
        break;
      case 'epic':
        bgColor = 'bg-purple-700/70';
        textColor = 'text-purple-200';
        break;
      case 'legendary':
        bgColor = 'bg-orange-600/70';
        textColor = 'text-orange-200';
        break;
      default:
        bgColor = 'bg-gray-600/70';
        textColor = 'text-gray-200';
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
        {displayRarity}
      </span>
    );
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col bg-black text-white z-50"
      style={{ 
        backgroundImage: `url(${wallbg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Header with title and close button */}
      <div className="bg-black/80 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={picklockIconImage} 
            alt="PickLock" 
            className="w-8 h-8 mr-3" 
            style={{ imageRendering: 'pixelated' }}
          />
          <h1 className="text-2xl font-bold text-blue-400">PickLock.exe</h1>
          <button
            onClick={async () => {
              try {
                const userResponse = await axios.get('/api/user');
                console.log('DEBUG - Current user data:', userResponse.data);
                console.log('DEBUG - Current user inventory:', userResponse.data.inventory);
                const inventoryResponse = await axios.get('/api/inventory');
                console.log('DEBUG - Current inventory data:', inventoryResponse.data);
                alert('User and inventory data logged to console');
              } catch (err) {
                console.error('Error fetching user/inventory data:', err);
                alert('Error fetching data. Check console.');
              }
            }}
            className="ml-4 bg-blue-800 hover:bg-blue-700 text-xs text-white px-2 py-1 rounded"
            onMouseEnter={() => window.sounds?.hover()}
          >
            Debug
          </button>
        </div>
        <button 
          className="text-white hover:text-blue-400" 
          onClick={onClose}
          onMouseEnter={() => window.sounds?.hover()}
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex h-full">
          {/* Left panel - Lootbox list */}
          <div className="w-1/3 pr-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 130px)' }}>
            <h2 className="text-xl font-bold mb-4 text-blue-300">Your Lootboxes</h2>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
                <p className="text-blue-300">Loading your lootboxes...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-300">{error}</p>
                <button 
                  className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-md text-white"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : lootboxes.length === 0 ? (
              <div className="border border-gray-700 bg-black/40 rounded-lg p-6 text-center">
                <Package className="h-16 w-16 text-gray-500 mx-auto mb-3" />
                <p className="text-xl font-medium text-gray-300 mb-2">No Lootboxes Found</p>
                <p className="text-gray-400">
                  You don't have any unopened lootboxes in your inventory. 
                  Complete quests or purchase them from the shop.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lootboxes.map(lootbox => (
                  <div
                    key={lootbox.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all 
                      ${selectedLootbox?.id === lootbox.id 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-gray-700 bg-black/40 hover:border-blue-500/50'}`}
                    onClick={() => handleSelectLootbox(lootbox)}
                    onMouseEnter={() => window.sounds?.hover()}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 flex-shrink-0 bg-black/50 rounded-md flex items-center justify-center overflow-hidden">
                        <img
                          src={lootbox.image || '/images/lootboxes/common_lootbox.png'}
                          alt={lootbox.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).className = 'w-10 h-10 opacity-30';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-white">{lootbox.name}</h3>
                          {renderRarityBadge(lootbox.rarity)}
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2 mt-1">{lootbox.description}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Acquired: {new Date(lootbox.acquiredAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right panel - Selected lootbox and opening interface */}
          <div className="w-2/3 pl-6 border-l border-gray-700 flex flex-col">
            {/* Selected lootbox display */}
            <div className="flex-1">
              {!selectedLootbox ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Package className="h-20 w-20 text-gray-600 mb-4" />
                  <h2 className="text-xl font-medium text-gray-400 mb-2">No Lootbox Selected</h2>
                  <p className="text-gray-500 text-center max-w-md">
                    Select a lootbox from the left to view its details and unlock its hidden treasures.
                  </p>
                </div>
              ) : (
                <div className="h-full">
                  {/* Lootbox Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-blue-300 mb-2">{selectedLootbox.name}</h2>
                    <div className="flex items-center space-x-3 mb-4">
                      {renderRarityBadge(selectedLootbox.rarity)}
                      <span className="text-sm text-gray-400">
                        ID: {selectedLootbox.id}
                      </span>
                    </div>
                    <p className="text-gray-300">{selectedLootbox.description}</p>
                  </div>

                  {/* Lootbox Display */}
                  <div className="flex flex-col items-center justify-center mb-8">
                    <div className={`relative w-48 h-48 bg-black/30 rounded-lg p-4 mb-6 overflow-hidden
                      ${animatingReward ? 'animate-pulse' : ''}`}
                    >
                      {openingLootbox ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                          <Sparkles className="h-20 w-20 text-yellow-400 animate-bounce" />
                        </div>
                      ) : (
                        <img
                          src={selectedLootbox.image || '/images/lootboxes/common_lootbox.png'}
                          alt={selectedLootbox.name}
                          className="w-full h-full object-contain"
                          style={{ 
                            filter: showRewards ? 'blur(10px) brightness(0.7)' : 'none',
                            transition: 'all 0.5s ease'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                            (e.target as HTMLImageElement).style.filter = 'none';
                          }}
                        />
                      )}
                      
                      {/* Show rewards overlay */}
                      {showRewards && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 animate-fadeIn">
                          <Sparkles className="h-12 w-12 text-yellow-400 animate-ping" />
                        </div>
                      )}
                    </div>
                    
                    {!showRewards && !openingLootbox && (
                      <button
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center"
                        onClick={handleOpenLootbox}
                        disabled={openingLootbox}
                        onMouseEnter={() => window.sounds?.hover()}
                      >
                        <Package className="h-5 w-5 mr-2" />
                        Attempt Opening Box
                      </button>
                    )}
                  </div>

                  {/* Rewards Display */}
                  {showRewards && (
                    <div className="bg-black/50 border border-blue-500/50 rounded-lg p-4 animate-fadeIn">
                      <h3 className="text-lg font-medium text-blue-300 mb-4 flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
                        Rewards Unlocked!
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {lootboxRewards.map((reward, index) => {
                          const item = itemsInfo[reward.id];
                          return (
                            <div 
                              key={`${reward.id}-${index}`}
                              className="flex items-center gap-3 bg-gray-900/50 border border-gray-700 rounded-lg p-3 animate-fadeInUp"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="w-12 h-12 bg-black/30 rounded-md flex items-center justify-center overflow-hidden">
                                <img
                                  src={item?.imagePath || '/images/items/placeholder.png'}
                                  alt={item?.name || reward.id}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                                    (e.target as HTMLImageElement).className = 'w-8 h-8 opacity-30';
                                  }}
                                />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-white">
                                    {item?.name || reward.id}
                                  </h4>
                                  <span className="font-bold text-green-400">
                                    x{reward.quantity}
                                  </span>
                                </div>
                                
                                {item && (
                                  <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                                    {item.description}
                                  </p>
                                )}
                                
                                {item && (
                                  <div className="mt-1">
                                    {renderRarityBadge(item.rarity)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {lootboxRewards.length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-gray-400">No rewards found in this lootbox.</p>
                        </div>
                      )}
                      
                      <div className="mt-6 text-center">
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
                          onClick={() => {
                            setSelectedLootbox(null);
                            setShowRewards(false);
                          }}
                          onMouseEnter={() => window.sounds?.hover()}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Bottom section - Potential rewards */}
            {selectedLootbox && !showRewards && (
              <div className="mt-4 bg-black/40 border border-gray-700 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-300 mb-3 flex items-center">
                  <ChevronRight className="h-5 w-5 mr-1" />
                  Potential Rewards
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  This {selectedLootbox.type} lootbox may contain items of varying rarity and quantity.
                  Will you get a common item or a legendary treasure?
                </p>
                
                {/* Display potential rewards based on lootbox type and sorted by rarity */}
                <div className="grid grid-cols-5 gap-3">
                  {/* Sort all possible items by rarity (common, uncommon, rare, epic, legendary) */}
                  {Object.values(itemsInfo)
                    .sort((a, b) => {
                      const rarityOrder = {
                        'common': 1,
                        'uncommon': 2,
                        'rare': 3,
                        'epic': 4,
                        'legendary': 5
                      };
                      return rarityOrder[a.rarity] - rarityOrder[b.rarity];
                    })
                    .filter(item => {
                      // For basic lootboxes, show only common and uncommon items
                      if (selectedLootbox.type === 'basic') {
                        return item.rarity === 'common' || item.rarity === 'uncommon';
                      }
                      // For Oozing-Crate, show items of all rarities
                      return true;
                    })
                    .slice(0, 5) // Show up to 5 items total
                    .map(item => (
                      <div key={item.id} className="bg-black/30 p-2 rounded border border-gray-700 flex flex-col items-center">
                        <div className="w-10 h-10 bg-black/50 rounded-md flex items-center justify-center mb-1 overflow-hidden">
                          <img 
                            src={item.imagePath} 
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                              (e.target as HTMLImageElement).className = 'w-6 h-6 opacity-30';
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-300 truncate w-full text-center">{item.name}</span>
                        {renderRarityBadge(item.rarity)}
                      </div>
                    ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-3 italic">
                  Note: These are example items. Actual rewards are generated randomly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-black/80 border-t border-gray-800 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <span>PickLock.exe v1.0</span>
        <span>MemAllocRem: 8192 KB</span>
      </div>
    </div>
  );
};

export default FullscreenLockpickingApp;