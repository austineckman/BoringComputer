import React, { useState, useEffect } from "react";
import { X, Package, ChevronRight, AlertCircle, Sparkles, Loader2, Lock, Unlock } from "lucide-react";
import hacklockLogo from "@assets/Untitled design - 2025-04-28T131146.641.png";
import axios from "axios";

interface HacklockWindowProps {
  lootbox: Lootbox | null;
  onClose: () => void;
  onLootboxOpened: (lootboxId: number) => void;
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
  item?: ItemInfo;
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

const HacklockWindow: React.FC<HacklockWindowProps> = ({ lootbox, onClose, onLootboxOpened }) => {
  const [opening, setOpening] = useState(false);
  const [hackProgress, setHackProgress] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [itemsInfo, setItemsInfo] = useState<Record<string, ItemInfo>>({});
  const [error, setError] = useState<string | null>(null);
  const [hackingPhase, setHackingPhase] = useState<'scanning' | 'hacking' | 'unlocking' | 'complete'>('scanning');

  useEffect(() => {
    loadItemsInfo();
  }, []);

  const loadItemsInfo = async () => {
    try {
      const response = await axios.get('/api/items');
      const itemsArray = response.data;
      const itemsMap: Record<string, ItemInfo> = {};
      
      itemsArray.forEach((item: ItemInfo) => {
        itemsMap[item.id] = item;
      });
      
      setItemsInfo(itemsMap);
    } catch (err) {
      console.error('Error loading items info:', err);
    }
  };

  const handleHackLootbox = async () => {
    if (!lootbox) return;
    
    setOpening(true);
    setError(null);
    setHackProgress(0);
    setHackingPhase('scanning');

    // Simulate hacking progression
    const hackingSteps = [
      { phase: 'scanning', duration: 800, progress: 25, message: 'Scanning encryption...' },
      { phase: 'hacking', duration: 1200, progress: 60, message: 'Breaking cipher...' },
      { phase: 'unlocking', duration: 1000, progress: 90, message: 'Unlocking container...' },
      { phase: 'complete', duration: 500, progress: 100, message: 'Access granted!' }
    ];

    for (const step of hackingSteps) {
      setHackingPhase(step.phase as any);
      
      // Animate progress
      const startProgress = hackProgress;
      const targetProgress = step.progress;
      const progressStep = (targetProgress - startProgress) / (step.duration / 50);
      
      for (let i = 0; i < step.duration / 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setHackProgress(prev => Math.min(targetProgress, prev + progressStep));
      }
    }

    // Actually open the lootbox
    try {
      const response = await axios.post(`/api/lootbox-rewards/${lootbox.id}/open-with-rewards`);
      
      if (response.data.success) {
        const rewardData = response.data.rewards || [];
        const processedRewards = rewardData.map((reward: Reward) => ({
          ...reward,
          item: itemsInfo[reward.id]
        }));
        
        setRewards(processedRewards);
        setShowRewards(true);
        onLootboxOpened(lootbox.id);
        
        // Play success sound
        if (window.sounds) {
          window.sounds.reward();
        }
      } else {
        setError(response.data.message || 'Failed to hack lootbox');
      }
    } catch (err) {
      console.error('Error hacking lootbox:', err);
      setError('Hack failed. Security too strong.');
    } finally {
      setOpening(false);
    }
  };

  const getRarityClasses = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gray-600/30 border-gray-500';
      case 'uncommon': return 'bg-green-600/30 border-green-500';
      case 'rare': return 'bg-blue-600/30 border-blue-500';
      case 'epic': return 'bg-purple-600/30 border-purple-500';
      case 'legendary': return 'bg-orange-600/30 border-orange-500';
      default: return 'bg-gray-600/30 border-gray-500';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return '#d1d5db';
      case 'uncommon': return '#86efac';
      case 'rare': return '#93c5fd';
      case 'epic': return '#c4b5fd';
      case 'legendary': return '#fdba74';
      default: return '#d1d5db';
    }
  };

  const getHackingIcon = () => {
    switch (hackingPhase) {
      case 'scanning': return <AlertCircle className="w-6 h-6 text-yellow-400 animate-pulse" />;
      case 'hacking': return <Lock className="w-6 h-6 text-red-400 animate-bounce" />;
      case 'unlocking': return <Unlock className="w-6 h-6 text-blue-400 animate-spin" />;
      case 'complete': return <Sparkles className="w-6 h-6 text-green-400" />;
      default: return <Lock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPhaseMessage = () => {
    switch (hackingPhase) {
      case 'scanning': return 'Analyzing security protocols...';
      case 'hacking': return 'Bypassing encryption layers...';
      case 'unlocking': return 'Accessing container contents...';
      case 'complete': return 'Hack successful! Container unlocked.';
      default: return 'Ready to initiate hack sequence...';
    }
  };

  if (!lootbox) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/50 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 px-4 py-3 border-b border-green-500/30 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center">
            <img 
              src={hacklockLogo} 
              alt="HackLock.exe" 
              className="h-8 object-contain mr-3" 
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="text-green-400 font-mono text-sm">HackLock.exe</span>
          </div>
          <button 
            className="text-green-400 hover:text-green-300 transition-colors" 
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showRewards ? (
            <div className="space-y-4">
              {/* Target Information */}
              <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-green-400 font-mono text-sm mb-2">TARGET ANALYSIS</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-black/60 border border-green-500/40 rounded-lg flex items-center justify-center">
                    {lootbox.image ? (
                      <img 
                        src={lootbox.image} 
                        alt={lootbox.name || lootbox.type} 
                        className="w-full h-full object-contain p-1" 
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{lootbox.name || lootbox.type}</p>
                    <p className="text-gray-400 text-xs">{lootbox.description || 'Encrypted container'}</p>
                    <p className="text-green-400 text-xs font-mono">ID: {lootbox.id}</p>
                  </div>
                </div>
              </div>

              {/* Hacking Progress */}
              {opening && (
                <div className="bg-black/40 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-mono text-sm">HACK PROGRESS</span>
                    {getHackingIcon()}
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${hackProgress}%` }}
                    />
                  </div>
                  <p className="text-green-300 text-xs font-mono">{getPhaseMessage()}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleHackLootbox}
                disabled={opening}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 
                  disabled:from-gray-600 disabled:to-gray-500 text-white font-mono py-3 px-4 rounded-lg 
                  transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {opening ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>HACKING...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>INITIATE HACK</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Rewards Display */
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-green-400 mr-2" />
                  <h3 className="text-green-400 font-mono">HACK COMPLETE</h3>
                  <Sparkles className="w-6 h-6 text-green-400 ml-2" />
                </div>
                <p className="text-gray-300 text-sm">Container contents extracted:</p>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {rewards.map((reward, index) => (
                  <div key={index} className={`${getRarityClasses(reward.item?.rarity || 'common')} rounded-lg p-3 border`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black/40 rounded-lg flex items-center justify-center">
                        {reward.item?.imagePath ? (
                          <img 
                            src={reward.item.imagePath} 
                            alt={reward.item.name} 
                            className="w-full h-full object-contain p-1" 
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p 
                          className="font-semibold text-sm"
                          style={{ color: getRarityTextColor(reward.item?.rarity || 'common') }}
                        >
                          {reward.item?.name || reward.id}
                        </p>
                        <p className="text-gray-400 text-xs">Quantity: {reward.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 
                  text-white font-mono py-2 px-4 rounded-lg transition-all duration-200"
              >
                CLOSE HACK SESSION
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HacklockWindow;