import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LootBox {
  id: number;
  userId: number;
  type: string;
  opened: boolean | null;
  rewards: {type: string, quantity: number}[] | null;
  source: string;
  sourceId: number | null;
  acquiredAt: Date | null;
  openedAt: Date | null;
  createdAt?: string; // Optional for backward compatibility
}

interface LootBoxProps {
  lootBox: LootBox;
  onOpen: (lootBox: LootBox, rewards: {type: string, quantity: number}[]) => void;
}

// Define color schemes for different loot box types (CSGO-style crates)
const lootBoxColors = {
  common: {
    bg: 'bg-gray-700',
    border: 'border-gray-500',
    text: 'text-gray-200',
    glow: '0 0 8px rgba(180, 180, 180, 0.8)',
    gradient: 'from-gray-600 to-gray-800'
  },
  uncommon: {
    bg: 'bg-green-800',
    border: 'border-green-600',
    text: 'text-green-200',
    glow: '0 0 10px rgba(72, 187, 120, 0.8)',
    gradient: 'from-green-700 to-green-900'
  },
  rare: {
    bg: 'bg-blue-800',
    border: 'border-blue-600',
    text: 'text-blue-200',
    glow: '0 0 12px rgba(66, 153, 225, 0.9)',
    gradient: 'from-blue-700 to-blue-900'
  },
  epic: {
    bg: 'bg-purple-800',
    border: 'border-purple-600',
    text: 'text-purple-200',
    glow: '0 0 14px rgba(159, 122, 234, 0.9)',
    gradient: 'from-purple-700 to-purple-900'
  },
  legendary: {
    bg: 'bg-amber-700',
    border: 'border-yellow-600',
    text: 'text-yellow-200',
    glow: '0 0 16px rgba(236, 201, 75, 1)',
    gradient: 'from-amber-600 to-amber-800'
  }
};

export function LootBoxItem({ lootBox, onOpen }: LootBoxProps) {
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  const [isOpening, setIsOpening] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [rewards, setRewards] = useState<{type: string, quantity: number}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Get color scheme based on loot box type
  const colorScheme = lootBoxColors[lootBox.type as keyof typeof lootBoxColors] || lootBoxColors.common;

  const handleClick = () => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    
    if (lootBox.opened) {
      // Just show the rewards if already opened
      onOpen(lootBox, lootBox.rewards || []);
    } else {
      // Show opening animation
      setShowOpenModal(true);
    }
  };

  // Prepare randomized resource items for the CS:GO style animation
  const resourceTypes = ['cloth', 'metal', 'tech-scrap', 'circuit-board', 'sensor-crystal', 'alchemy-ink'];
  const [spinningItems, setSpinningItems] = useState<string[]>([]);
  const [spinningComplete, setSpinningComplete] = useState(false);
  
  // Generate a mix of random items for the spinning animation
  const generateSpinningItems = () => {
    // Create a larger set of random resources (30-40 items)
    const items: string[] = [];
    const count = 30 + Math.floor(Math.random() * 10);
    
    // Generate mostly random items
    for (let i = 0; i < count; i++) {
      const randomType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      items.push(randomType);
    }
    
    return items;
  };
  
  const handleOpenLootBox = async () => {
    setIsOpening(true);
    setSpinningComplete(false);
    
    // Generate spinning items first
    const spinItems = generateSpinningItems();
    setSpinningItems(spinItems);
    
    try {
      sounds.open?.();
    } catch (e) {
      console.warn('Could not play open sound', e);
    }
    
    try {
      const res = await apiRequest('POST', `/api/loot-boxes/${lootBox.id}/open`);
      const data = await res.json();
      
      if (!data.rewards || data.rewards.length === 0) {
        toast({
          title: 'Error',
          description: 'No rewards found in this loot box',
          variant: 'destructive'
        });
        setIsOpening(false);
        setShowOpenModal(false);
        return;
      }
      
      // Store the real rewards to be revealed later
      setRewards(data.rewards || []);
      
      // Start the spinning animation first
      // The reveal sequence will be triggered by useEffect after spinning completes
      setTimeout(() => {
        setSpinningComplete(true);
        
        try {
          sounds.reward?.();
        } catch (e) {
          console.warn('Could not play reward sound', e);
        }
        
        // Start animation sequence for actual rewards
        setCurrentIndex(0);
        setAnimationComplete(false);
      }, 3000); // Spin for 3 seconds
      
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: 'Error',
        description: 'Failed to open loot box',
        variant: 'destructive'
      });
      setIsOpening(false);
      setShowOpenModal(false);
      
      try {
        sounds.error?.();
      } catch (e) {
        console.warn('Could not play error sound', e);
      }
    }
  };

  // Animation effect
  useEffect(() => {
    if (rewards.length > 0 && currentIndex < rewards.length) {
      const timer = setTimeout(() => {
        try {
          sounds.reward();
        } catch (e) {
          console.warn('Could not play reward sound', e);
        }
        setCurrentIndex(curr => curr + 1);
      }, 1000); // 1 second between each reward reveal
      
      return () => clearTimeout(timer);
    } else if (rewards.length > 0 && currentIndex >= rewards.length && !animationComplete) {
      // All rewards revealed
      setAnimationComplete(true);
      const timer = setTimeout(() => {
        // Finish animation
        setIsOpening(false);
        setShowOpenModal(false);
        // Call the onOpen callback
        onOpen(lootBox, rewards);
      }, 2000); // Wait 2 seconds before closing
      
      return () => clearTimeout(timer);
    }
  }, [rewards, currentIndex, animationComplete, lootBox, onOpen, sounds]);

  return (
    <>
      <Card 
        className={`p-0 border-2 cursor-pointer hover:scale-105 transition-all overflow-hidden ${colorScheme.border}`}
        style={{ boxShadow: lootBox.opened ? 'none' : colorScheme.glow }}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {/* CSGO-style Weapon Crate */}
          <div className={`w-full aspect-square flex items-center justify-center relative overflow-hidden rounded-t-sm bg-gradient-to-br ${colorScheme.gradient}`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent"></div>
            
            {/* Crate Lock */}
            <div className="absolute top-2 left-0 right-0 flex justify-center">
              <div className="px-2 py-0.5 bg-black/40 rounded-sm text-[10px] uppercase font-bold tracking-wider">
                {lootBox.opened ? 'Opened' : 'Sealed'}
              </div>
            </div>
            
            {/* Crate Content */}
            <div className="flex flex-col items-center space-y-1 z-10">
              <span className="text-3xl mb-1 drop-shadow-md">📦</span>
              <span className={`uppercase font-bold text-xs tracking-wide ${colorScheme.text} drop-shadow-md`}>
                {lootBox.type}
              </span>
            </div>
            
            {/* Quality Stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-[5px]" 
              style={{ 
                background: `linear-gradient(to right, transparent 0%, ${
                  lootBox.type === 'common' ? '#9ca3af' :
                  lootBox.type === 'uncommon' ? '#10b981' :
                  lootBox.type === 'rare' ? '#3b82f6' :
                  lootBox.type === 'epic' ? '#8b5cf6' :
                  '#f59e0b'
                } 50%, transparent 100%)` 
              }}>
            </div>
          </div>
          
          {/* Crate Info */}
          <div className="w-full p-2 bg-space-dark">
            <h3 className={`capitalize font-bold text-center text-sm ${colorScheme.text}`}>
              {lootBox.type} Crate
            </h3>
            <p className="text-[10px] text-brand-light/60 text-center mt-1">
              {lootBox.opened ? 'Previously opened' : 'Free to open'}
            </p>
          </div>
        </div>
      </Card>

      {/* Opening Animation Modal */}
      <Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
        <DialogContent className="sm:max-w-md border-2 border-space-light/20 bg-space-dark p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-space-darkest to-space-dark">
            <DialogHeader className="pt-6 px-6">
              <DialogTitle className="capitalize text-center text-2xl mb-1 text-brand-orange">
                {isOpening ? "OPENING" : "READY TO OPEN"}
              </DialogTitle>
              <div className="text-center text-sm text-brand-light/70 uppercase tracking-wide">
                {lootBox.type} Weapon Crate
              </div>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center p-6">
              {isOpening && (rewards.length === 0 || !spinningComplete) ? (
                // CS:GO style spinning animation (like a slot machine or weapon case)
                <div className="py-6">
                  <div className="relative">
                    {/* Title banner for the animation */}
                    <div className="text-center mb-4">
                      <h3 className={`text-xl font-bold uppercase ${
                        lootBox.type === 'common' ? 'text-gray-300' :
                        lootBox.type === 'uncommon' ? 'text-green-400' : 
                        lootBox.type === 'rare' ? 'text-blue-400' :
                        lootBox.type === 'epic' ? 'text-purple-400' :
                        'text-amber-400'
                      }`}>
                        {rewards.length === 0 ? 'Unlocking...' : 'Opening...'}
                      </h3>
                    </div>

                    {/* CS:GO style spinning container */}
                    <div className="relative w-full h-24 overflow-hidden rounded-md border-2 border-space-light/20 bg-space-darkest">
                      {/* Highlight marker in center - doesn't move */}
                      <div className="absolute inset-y-0 left-1/2 w-0.5 bg-brand-orange z-30 shadow-[0_0_10px_2px_rgba(255,150,0,0.7)]"></div>
                      
                      {/* Overlay gradient to fade out sides */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-20 pointer-events-none"></div>
                      
                      {/* Spinning items container */}
                      <motion.div 
                        className="flex items-center absolute top-0 bottom-0 z-10"
                        initial={{ x: '100%' }}
                        animate={{ 
                          x: spinningComplete ? '-125%' : ['-5000%', '-100%'] 
                        }}
                        transition={{
                          duration: spinningComplete ? 0.5 : 3, 
                          ease: spinningComplete ? 'easeOut' : [0.2, 0.3, 0.2, 0.2],
                        }}
                      >
                        {/* Generate random spinning resources */}
                        {spinningItems.map((itemType, idx) => (
                          <div 
                            key={`spin-${idx}`}
                            className={`flex-shrink-0 mx-1 p-3 w-20 h-20 rounded flex flex-col items-center justify-center
                              ${
                                idx === spinningItems.length - 3 && spinningComplete 
                                  ? `bg-${lootBox.type}-pulse border-2` : 'bg-space-dark/60'
                              }
                              ${
                                idx === spinningItems.length - 3 && spinningComplete
                                  ? lootBox.type === 'common' ? 'border-gray-400' :
                                    lootBox.type === 'uncommon' ? 'border-green-500' :
                                    lootBox.type === 'rare' ? 'border-blue-500' :
                                    lootBox.type === 'epic' ? 'border-purple-500' :
                                    'border-amber-400'
                                  : ''
                              }
                            `}
                          >
                            <span className="text-2xl mb-1">
                              {itemType === 'cloth' ? '🧵' :
                               itemType === 'metal' ? '🔗' :
                               itemType === 'tech-scrap' ? '🔌' :
                               itemType === 'circuit-board' ? '🖥️' :
                               itemType === 'sensor-crystal' ? '💎' :
                               itemType === 'alchemy-ink' ? '🧪' : '🔮'}
                            </span>
                            <span className="text-xs capitalize">
                              {itemType.replace('-', ' ')}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                    
                    {/* Glow effect around spinner */}
                    <motion.div 
                      className="absolute -inset-1 rounded-xl blur-md z-0 opacity-40"
                      style={{ 
                        background: lootBox.type === 'common' ? 'linear-gradient(to right, transparent 15%, rgba(156, 163, 175, 0.5) 50%, transparent 85%)' :
                                   lootBox.type === 'uncommon' ? 'linear-gradient(to right, transparent 15%, rgba(16, 185, 129, 0.5) 50%, transparent 85%)' :
                                   lootBox.type === 'rare' ? 'linear-gradient(to right, transparent 15%, rgba(59, 130, 246, 0.5) 50%, transparent 85%)' :
                                   lootBox.type === 'epic' ? 'linear-gradient(to right, transparent 15%, rgba(139, 92, 246, 0.5) 50%, transparent 85%)' :
                                   'linear-gradient(to right, transparent 15%, rgba(245, 158, 11, 0.5) 50%, transparent 85%)'
                      }}
                    />
                  </div>
                  
                  {/* Loading bar and status message */}
                  <div className="mt-6 text-center flex flex-col items-center">
                    <div className={`uppercase tracking-wide text-sm mb-3 ${
                      lootBox.type === 'common' ? 'text-gray-400' :
                      lootBox.type === 'uncommon' ? 'text-green-400' : 
                      lootBox.type === 'rare' ? 'text-blue-400' :
                      lootBox.type === 'epic' ? 'text-purple-400' :
                      'text-amber-300'
                    }`}>
                      {rewards.length === 0 ? 'Contacting server...' : spinningComplete ? 'Selection complete!' : 'Selecting items...'}
                    </div>
                    
                    {!spinningComplete && (
                      <motion.div
                        className="w-40 h-1.5 bg-brand-light/20 rounded-full overflow-hidden relative"
                      >
                        <motion.div
                          className={`absolute top-0 left-0 h-full rounded-full ${
                            lootBox.type === 'common' ? 'bg-gray-400' :
                            lootBox.type === 'uncommon' ? 'bg-green-500' :
                            lootBox.type === 'rare' ? 'bg-blue-500' :
                            lootBox.type === 'epic' ? 'bg-purple-500' :
                            'bg-amber-500'
                          }`}
                          animate={{ width: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: rewards.length === 0 ? Infinity : 0 }}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : isOpening && rewards.length > 0 ? (
                // CS:GO style reward reveal animation
                <div className="py-8 flex flex-col items-center w-full">
                  <div className="w-full relative">
                    {rewards.map((reward, index) => (
                      <motion.div
                        key={`${reward.type}-${index}`}
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={index < currentIndex ? { 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          filter: 'brightness(1)'
                        } : { opacity: 0, y: 50, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                        className={`my-3 p-4 border-2 rounded-md w-full text-center relative overflow-hidden 
                          ${
                            reward.quantity > 5 ? 'border-amber-500 bg-amber-950/30' :
                            reward.quantity > 3 ? 'border-purple-500 bg-purple-950/30' :
                            reward.quantity > 1 ? 'border-blue-500 bg-blue-950/30' :
                            'border-gray-500 bg-gray-950/30'
                          }
                        `}
                      >
                        {/* Shine effect on reveal */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                          initial={{ x: "-100%" }}
                          animate={index < currentIndex ? { x: "100%" } : { x: "-100%" }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ opacity: 0.3 }}
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-md bg-space-darkest">
                              <span className="text-xl">
                                {reward.type === 'cloth' ? '🧵' :
                                 reward.type === 'metal' ? '🔗' :
                                 reward.type === 'tech-scrap' ? '🔌' :
                                 reward.type === 'circuit-board' ? '🖥️' :
                                 reward.type === 'crystal-core' ? '💎' :
                                 reward.type === 'energy-cell' ? '🔋' : '🔮'}
                              </span>
                            </div>
                            <p className="font-bold text-md capitalize text-left">
                              {reward.type.replace('-', ' ')}
                            </p>
                          </div>
                          <div className={`text-lg font-bold ${
                            reward.quantity > 5 ? 'text-amber-300' :
                            reward.quantity > 3 ? 'text-purple-300' :
                            reward.quantity > 1 ? 'text-blue-300' :
                            'text-gray-300'
                          }`}>
                            +{reward.quantity}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {animationComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="mt-8 text-xl font-bold text-brand-orange flex items-center"
                    >
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      All items collected!
                    </motion.div>
                  )}
                </div>
              ) : (
                // Initial state before opening
                <div className="py-8 text-center">
                  <div className="relative">
                    <div className={`w-40 h-40 mx-auto flex items-center justify-center rounded-md bg-gradient-to-br ${colorScheme.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/10 to-transparent"></div>
                      
                      {/* Crate Lock */}
                      <div className="absolute top-3 left-0 right-0 flex justify-center">
                        <div className="px-3 py-1 bg-black/60 rounded-sm text-[10px] uppercase font-bold tracking-wider border border-space-light/30">
                          Sealed
                        </div>
                      </div>
                      
                      <span className="text-6xl">📦</span>
                      
                      {/* Quality Stripe */}
                      <div className="absolute bottom-0 left-0 right-0 h-2" 
                        style={{ 
                          background: `linear-gradient(to right, transparent 0%, ${
                            lootBox.type === 'common' ? '#9ca3af' :
                            lootBox.type === 'uncommon' ? '#10b981' :
                            lootBox.type === 'rare' ? '#3b82f6' :
                            lootBox.type === 'epic' ? '#8b5cf6' :
                            '#f59e0b'
                          } 50%, transparent 100%)` 
                        }}>
                      </div>
                    </div>
                    
                    {/* Subtle glow effect under the crate */}
                    <div 
                      className="absolute -inset-4 rounded-full blur-xl opacity-30"
                      style={{ 
                        background: lootBox.type === 'common' ? 'radial-gradient(#9ca3af, transparent 70%)' :
                                   lootBox.type === 'uncommon' ? 'radial-gradient(#10b981, transparent 70%)' :
                                   lootBox.type === 'rare' ? 'radial-gradient(#3b82f6, transparent 70%)' :
                                   lootBox.type === 'epic' ? 'radial-gradient(#8b5cf6, transparent 70%)' :
                                   'radial-gradient(#f59e0b, transparent 70%)'
                      }}
                    />
                  </div>
                  
                  <p className="mt-8 text-brand-light/90">
                    Ready to open this {lootBox.type} crate?
                  </p>
                  
                  <div className="mt-3 text-xs text-brand-light/60">
                    Contains materials for Gizbo's Forge
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="bg-space-darkest border-t border-space-light/10 p-4">
              {!isOpening ? (
                <Button 
                  onClick={handleOpenLootBox}
                  className={`w-full font-bold uppercase tracking-wide ${
                    lootBox.type === 'common' ? 'bg-gray-600 hover:bg-gray-500' :
                    lootBox.type === 'uncommon' ? 'bg-green-700 hover:bg-green-600' :
                    lootBox.type === 'rare' ? 'bg-blue-700 hover:bg-blue-600' :
                    lootBox.type === 'epic' ? 'bg-purple-700 hover:bg-purple-600' :
                    'bg-amber-600 hover:bg-amber-500'
                  } text-white`}
                >
                  Open Crate
                </Button>
              ) : (
                <Button disabled className="w-full uppercase tracking-wide">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening...
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface LootBoxRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {type: string, quantity: number}[];
}

export function LootBoxRewardModal({ isOpen, onClose, rewards }: LootBoxRewardModalProps) {
  const { sounds } = useSoundEffects();
  
  const handleClose = () => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play click sound', e);
    }
    onClose();
  };
  
  // Calculate reward rarity class
  const getRewardClass = (quantity: number) => {
    if (quantity >= 5) return { 
      border: 'border-amber-500', 
      bg: 'bg-amber-950/30',
      text: 'text-amber-300',
      glow: '0 0 10px rgba(245, 158, 11, 0.5)'
    };
    if (quantity >= 3) return { 
      border: 'border-purple-500', 
      bg: 'bg-purple-950/30',
      text: 'text-purple-300',
      glow: '0 0 10px rgba(139, 92, 246, 0.5)'
    };
    if (quantity >= 2) return { 
      border: 'border-blue-500', 
      bg: 'bg-blue-950/30',
      text: 'text-blue-300',
      glow: '0 0 10px rgba(59, 130, 246, 0.5)'
    };
    return { 
      border: 'border-gray-500', 
      bg: 'bg-gray-950/30',
      text: 'text-gray-300',
      glow: 'none'
    };
  };

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch(type) {
      case 'cloth': return '🧵';
      case 'metal': return '🔗';
      case 'tech-scrap': return '🔌';
      case 'circuit-board': return '🖥️';
      case 'crystal-core': return '💎';
      case 'energy-cell': return '🔋';
      default: return '🔮';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border border-space-light/20 bg-space-dark p-0 overflow-hidden">
        <div className="bg-gradient-to-b from-space-darkest to-space-dark">
          <DialogHeader className="pt-6 px-6">
            <DialogTitle className="text-center text-2xl mb-1 text-brand-orange">
              CRATE CONTENTS
            </DialogTitle>
            <div className="text-center text-sm text-brand-light/70">
              {rewards.length} items collected
            </div>
          </DialogHeader>
          
          <div className="p-6">
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {rewards.map((reward, index) => {
                const rewardClass = getRewardClass(reward.quantity);
                return (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center p-4 border-2 rounded-md ${rewardClass.border} ${rewardClass.bg} relative overflow-hidden`}
                    style={{ boxShadow: rewardClass.glow }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-space-darkest border border-space-light/20">
                        <span className="text-xl">{getResourceIcon(reward.type)}</span>
                      </div>
                      <div>
                        <div className="capitalize font-medium">{reward.type.replace('-', ' ')}</div>
                        <div className="text-xs text-brand-light/60">Crafting Material</div>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${rewardClass.text}`}>
                      +{reward.quantity}
                    </div>
                    
                    {/* Quality indicator */}
                    {reward.quantity >= 3 && (
                      <div className="absolute top-0 right-0">
                        <div className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                          reward.quantity >= 5 ? 'bg-amber-500/20' : 
                          reward.quantity >= 3 ? 'bg-purple-500/20' : 'bg-blue-500/20'
                        }`}>
                          {reward.quantity >= 5 ? 'Rare' : 
                           reward.quantity >= 3 ? 'Uncommon' : 'Common'}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {rewards.length === 0 && (
                <div className="text-center py-8 text-brand-light/50">
                  <p>No rewards found.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-xs text-center text-brand-light/60">
              These materials have been added to your inventory
            </div>
          </div>
          
          <DialogFooter className="bg-space-darkest border-t border-space-light/10 p-4">
            <Button 
              onClick={handleClose} 
              className="w-full bg-brand-orange hover:bg-brand-yellow text-space-darkest font-medium"
            >
              Return to Inventory
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}