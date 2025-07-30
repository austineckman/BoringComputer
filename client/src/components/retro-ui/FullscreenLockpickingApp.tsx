import React, { useState, useEffect } from "react";
import { X, Package, ChevronRight, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import wallbg from "@assets/wallbg.png";
import picklockIconImage from "@assets/Untitled design - 2025-04-26T171551.402.png";
import hacklockLogo from "@assets/Untitled design - 2025-04-28T131146.641.png";
import lootCrateImg from "@assets/loot crate.png"; // Fallback image only
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

interface ItemDropEntry {
  itemId: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
}

interface LootBoxConfig {
  id: string;
  name: string;
  description: string;
  rarity: string;
  itemDropTable: ItemDropEntry[];
  minRewards: number;
  maxRewards: number;
  image: string;
  createdAt: string;
  updatedAt: string;
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
  const [caseAnimation, setCaseAnimation] = useState(false);
  const [finalReward, setFinalReward] = useState<any>(null);
  const [spinningItems, setSpinningItems] = useState<any[]>([]);
  const [lootboxConfigs, setLootboxConfigs] = useState<Record<string, LootBoxConfig>>({});
  const [potentialRewards, setPotentialRewards] = useState<ItemInfo[]>([]);

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

  // Fetch lootbox configurations from the API
  useEffect(() => {
    const fetchLootboxConfigs = async () => {
      try {
        // Use the same endpoint that the Oracle app uses to get real lootbox configurations
        const response = await axios.get('/api/admin/lootboxes');
        
        // Convert the array to a record object with ID as key for easy lookup
        const lootboxConfigData = response.data.reduce((acc: Record<string, LootBoxConfig>, config: LootBoxConfig) => {
          acc[config.id] = config;
          return acc;
        }, {});
        
        console.log("Loaded lootbox configurations:", lootboxConfigData);
        setLootboxConfigs(lootboxConfigData);
      } catch (err) {
        console.error('Error loading lootbox configurations:', err);
        setError('Failed to load lootbox configurations. Please try again later.');
      }
    };

    fetchLootboxConfigs();
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
    
    // Get potential rewards from the lootbox config
    if (lootbox.type && lootboxConfigs[lootbox.type]) {
      const config = lootboxConfigs[lootbox.type];
      const potentialItems: ItemInfo[] = [];
      
      // Gather all items from the drop table that have item info
      config.itemDropTable.forEach(entry => {
        if (itemsInfo[entry.itemId]) {
          potentialItems.push(itemsInfo[entry.itemId]);
        }
      });
      
      // Sort by rarity (legendary to common)
      const rarityOrder: Record<string, number> = {
        'legendary': 5,
        'epic': 4,
        'rare': 3,
        'uncommon': 2,
        'common': 1
      };
      
      potentialItems.sort((a, b) => {
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      });
      
      setPotentialRewards(potentialItems);
    } else {
      setPotentialRewards([]);
    }
  };

  // Handle opening the lootbox with predetermined animation
  const handleOpenLootbox = async () => {
    if (!selectedLootbox) return;
    
    try {
      // Play sound if available
      if (window.sounds) {
        window.sounds.click();
      }
      
      setOpeningLootbox(true);
      console.log('Opening lootbox with ID:', selectedLootbox.id);
      
      // STEP 1: Generate the predetermined animation strip FIRST using lootbox drop table
      const totalItems = 40;
      
      // Get items that can actually drop from this lootbox
      const lootboxConfig = lootboxConfigs[selectedLootbox.type];
      const possibleItems = [];
      
      if (lootboxConfig && lootboxConfig.itemDropTable) {
        // Build weighted array of possible items based on drop table
        lootboxConfig.itemDropTable.forEach(entry => {
          const item = itemsInfo[entry.itemId];
          if (item) {
            // Add multiple copies based on weight for realistic distribution
            const copies = Math.max(1, Math.floor(entry.weight / 5)); // Scale weight down
            for (let i = 0; i < copies; i++) {
              possibleItems.push(item);
            }
          }
        });
      }
      
      // Fallback to all items if no drop table found
      if (possibleItems.length === 0) {
        possibleItems.push(...Object.values(itemsInfo));
      }
      
      // CSS animation moves strip by -1070px, each item is 104px wide (96px + 8px margin)
      // Selection line is at center of container
      // Calculate which item will be under the selection line after animation
      const itemWidth = 104; // w-24 (96px) + mx-1 (8px total margin)
      const animationDistance = 1070; // From CSS animation
      const winnerIndex = Math.floor(animationDistance / itemWidth); // This should be index 10
      
      // Generate animation strip using only possible lootbox items
      const generatedItems = Array.from({ length: totalItems }, (_, i) => {
        const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        const quantity = lootboxConfig?.itemDropTable?.find(entry => entry.itemId === randomItem.id)?.maxQuantity || 1;
        
        return {
          id: randomItem.id,
          item: randomItem,
          isWinner: i === winnerIndex,
          quantity: Math.max(1, Math.floor(Math.random() * quantity) + 1) // Random quantity within range
        };
      });
      
      // The predetermined winner is whatever was randomly generated at the calculated position
      const predeterminedWinner = generatedItems[winnerIndex];
      
      console.log(`Lootbox type: ${selectedLootbox.type}`);
      console.log(`Possible items for animation (${possibleItems.length}):`, possibleItems.map(item => item.name));
      console.log(`Animation calculation: ${animationDistance}px ÷ ${itemWidth}px = winner at index ${winnerIndex}`);
      console.log(`Predetermined winner:`, predeterminedWinner);
      
      // Set the animation items immediately
      setSpinningItems(generatedItems);
      setCaseAnimation(true);
      
      // STEP 2: Send the predetermined winner to the backend
      const response = await axios.post(`/api/loot-boxes/${selectedLootbox.id}/open-predetermined`, {
        predeterminedReward: {
          type: 'item',
          id: predeterminedWinner.id,
          quantity: predeterminedWinner.quantity
        }
      });
      
      if (response.data.success) {
        // Set up the reward display to match what we predetermined
        setLootboxRewards([{
          type: 'item',
          id: predeterminedWinner.id,
          quantity: predeterminedWinner.quantity
        }]);
        
        setFinalReward({
          type: 'item',
          id: predeterminedWinner.id,
          quantity: predeterminedWinner.quantity,
          item: predeterminedWinner.item
        });
        
        // CS:GO style animation timing - 4 seconds
        setTimeout(() => {
          setCaseAnimation(false);
          setShowRewards(true);
          setOpeningLootbox(false);
          
          // Play reward sound if available
          if (window.sounds) {
            window.sounds.questComplete();
          }
          
          // Remove the opened lootbox from the list
          setLootboxes(lootboxes.filter(box => box.id !== selectedLootbox.id));
        }, 4000);
      } else {
        throw new Error(response.data.message || 'Failed to process predetermined reward');
      }
    } catch (err) {
      console.error('Error opening lootbox:', err);
      // Fallback to original method if new endpoint doesn't exist
      await handleOriginalLootboxOpen();
    }
  };

  // Fallback method using original backend logic
  const handleOriginalLootboxOpen = async () => {
    if (!selectedLootbox) return;
    
    try {
      const response = await axios.post(`/api/loot-boxes/${selectedLootbox.id}/open`);
      
      if (response.data.success) {
        const rewards = response.data.rewards || [];
        setLootboxRewards(rewards);
        
        if (rewards.length > 0) {
          const mainReward = rewards[0];
          const rewardItem = itemsInfo[mainReward.id];
          setFinalReward({
            ...mainReward,
            item: rewardItem
          });
        }
        
        setShowRewards(true);
        setOpeningLootbox(false);
        
        if (window.sounds) {
          window.sounds.questComplete();
        }
        
        setLootboxes(lootboxes.filter(box => box.id !== selectedLootbox.id));
      } else {
        setError(response.data.message || 'Failed to open lootbox');
        setOpeningLootbox(false);
        setCaseAnimation(false);
      }
    } catch (err) {
      console.error('Error with fallback lootbox opening:', err);
      setError('Failed to open the lootbox. Please try again.');
      setOpeningLootbox(false);
      setCaseAnimation(false);
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
      {/* Header with logo and close button */}
      <div className="bg-black/80 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={hacklockLogo} 
            alt="HackLock.exe" 
            className="h-12 object-contain" 
            style={{ imageRendering: 'pixelated' }}
          />
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
            {!selectedLootbox ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Package className="h-20 w-20 text-gray-600 mb-4" />
                <h2 className="text-xl font-medium text-gray-400 mb-2">No Lootbox Selected</h2>
                <p className="text-gray-500 text-center max-w-md">
                  Select a lootbox from the left to view its details and unlock its hidden treasures.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Top: Lootbox Image Display */}
                <div className="flex flex-col items-center justify-center mb-6">
                  {caseAnimation ? (
                    /* CS:GO Style Case Opening Animation */
                    <div className="relative w-full h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg mb-4 overflow-hidden border border-gray-600">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"></div>
                      
                      {/* Selection indicator */}
                      <div className="absolute left-1/2 top-4 bottom-4 w-0.5 bg-yellow-400 z-30 transform -translate-x-0.5"></div>
                      <div className="absolute left-1/2 top-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-yellow-400 z-30 transform -translate-x-1/2"></div>
                      
                      {/* Scrolling Items Container */}
                      <div className="relative h-full flex items-center">
                        <div className="flex items-center h-full animate-case-spin" style={{ width: 'max-content' }}>
                          {spinningItems.map((spinItem, i) => {
                            const displayItem = spinItem.item;
                            
                            return (
                              <div 
                                key={`spin-${i}`}
                                className={`flex-shrink-0 w-24 h-28 mx-1 rounded border flex flex-col items-center justify-center p-1
                                  ${spinItem.isWinner 
                                    ? 'border-yellow-400 bg-yellow-500/10 winner-item' 
                                    : displayItem?.rarity === 'legendary' ? 'border-orange-400 bg-orange-500/10'
                                    : displayItem?.rarity === 'epic' ? 'border-purple-400 bg-purple-500/10'
                                    : displayItem?.rarity === 'rare' ? 'border-blue-400 bg-blue-500/10'
                                    : 'border-gray-500 bg-gray-500/10'
                                  }`}
                              >
                                <div className="w-12 h-12 mb-1 bg-black/30 rounded flex items-center justify-center overflow-hidden">
                                  <img
                                    src={displayItem?.imagePath || lootCrateImg}
                                    alt={displayItem?.name || 'Item'}
                                    className="w-full h-full object-contain"
                                    style={{ imageRendering: 'pixelated' }}
                                  />
                                </div>
                                <span className="text-xs text-center text-white truncate w-full px-1">
                                  {displayItem?.name || 'Item'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Side fade effects */}
                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-900 to-transparent z-20"></div>
                      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-900 to-transparent z-20"></div>
                    </div>
                  ) : (
                    <div className={`relative w-48 h-48 bg-black/30 rounded-lg p-4 mb-4 overflow-hidden
                      ${animatingReward ? 'animate-pulse' : ''}`}
                    >
                      {openingLootbox ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="absolute inset-0 bg-blue-500/20 animate-pulse"></div>
                          <Sparkles className="h-20 w-20 text-yellow-400 animate-bounce" />
                        </div>
                      ) : (
                        <img
                          src={
                            // Use the image from the lootbox configuration if available
                            (selectedLootbox.type && lootboxConfigs[selectedLootbox.type]?.image) 
                              ? lootboxConfigs[selectedLootbox.type].image 
                              : lootCrateImg
                          }
                          alt={selectedLootbox.name || selectedLootbox.type}
                          className="w-full h-full object-contain pixelated"
                          style={{ 
                            imageRendering: 'pixelated',
                            filter: showRewards ? 'blur(10px) brightness(0.7)' : 'none',
                            transition: 'all 0.5s ease'
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
                  )}
                  
                  {/* Open Button */}
                  {!showRewards && !openingLootbox && !caseAnimation && (
                    <button
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center"
                      onClick={handleOpenLootbox}
                      disabled={openingLootbox || caseAnimation}
                      onMouseEnter={() => window.sounds?.hover()}
                    >
                      <Package className="h-5 w-5 mr-2" />
                      Open Lootbox
                    </button>
                  )}
                  
                  {/* Case Opening Status */}
                  {caseAnimation && (
                    <div className="text-center text-yellow-400 font-medium">
                      <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                      Opening case...
                    </div>
                  )}
                </div>

                {/* Bottom: Lootbox Details + Potential Rewards */}
                {!showRewards ? (
                  <div className="flex-1 bg-black/40 border border-gray-700 rounded-lg p-5 overflow-y-auto">
                    {/* Lootbox Details */}
                    <h2 className="text-2xl font-bold text-blue-300 mb-2">{selectedLootbox.name || selectedLootbox.type}</h2>
                    <div className="flex items-center space-x-3 mb-4">
                      {renderRarityBadge(selectedLootbox.rarity)}
                      <span className="text-sm text-gray-400">
                        Source: {selectedLootbox.source || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-6">
                      {selectedLootbox.description || `A mysterious ${selectedLootbox.type} with unknown treasures inside.`}
                    </p>
                    
                    {/* Potential Rewards Section */}
                    <h3 className="text-lg font-bold text-blue-300 mb-3">Potential Rewards:</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      This crate may contain the following items based on rarity.
                    </p>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {potentialRewards.map((item) => (
                        <div 
                          key={item.id} 
                          className="bg-black/40 border border-gray-700 rounded p-3 flex flex-col items-center"
                        >
                          <div className="w-24 h-24 bg-black/50 rounded-md flex items-center justify-center mb-2">
                            <img
                              src={item.imagePath}
                              alt={item.name}
                              className="w-20 h-20 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => {
                                // Fall back to a colored square based on rarity
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.style.backgroundColor = 
                                  item.rarity === 'legendary' ? '#f59e0b' :
                                  item.rarity === 'epic' ? '#8b5cf6' :
                                  item.rarity === 'rare' ? '#3b82f6' :
                                  item.rarity === 'uncommon' ? '#10b981' :
                                  '#6b7280';
                              }}
                            />
                          </div>
                          <span className="text-sm text-white font-medium text-center mb-1">
                            {item.name}
                          </span>
                          <div>
                            {renderRarityBadge(item.rarity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Rewards Display (after opening) */
                  <div className="flex-1 bg-black/50 border border-blue-500/50 rounded-lg p-4 animate-fadeIn">
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
                            <div className="w-24 h-24 bg-black/30 rounded-md flex items-center justify-center overflow-hidden">
                              <img
                                src={item?.imagePath}
                                alt={item?.name || reward.id}
                                className="w-20 h-20 object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  // Fall back to a colored square based on rarity
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.style.backgroundColor = 
                                    item?.rarity === 'legendary' ? '#f59e0b' :
                                    item?.rarity === 'epic' ? '#8b5cf6' :
                                    item?.rarity === 'rare' ? '#3b82f6' :
                                    item?.rarity === 'uncommon' ? '#10b981' :
                                    '#6b7280';
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
                          setCaseAnimation(false);
                          setFinalReward(null);
                          setSpinningItems([]);
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
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-black/80 border-t border-gray-800 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <span>HackLock.exe v1.0</span>
        <span>MemAllocRem: 8192 KB</span>
      </div>
    </div>
  );
};

export default FullscreenLockpickingApp;