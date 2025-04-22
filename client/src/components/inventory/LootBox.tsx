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

// Define color schemes for different loot box types
const lootBoxColors = {
  common: {
    bg: 'bg-gray-500',
    border: 'border-gray-400',
    text: 'text-gray-100',
    glow: '0 0 8px rgba(211, 211, 211, 0.8)'
  },
  uncommon: {
    bg: 'bg-green-600',
    border: 'border-green-400',
    text: 'text-green-100',
    glow: '0 0 10px rgba(72, 187, 120, 0.8)'
  },
  rare: {
    bg: 'bg-blue-600',
    border: 'border-blue-400',
    text: 'text-blue-100',
    glow: '0 0 12px rgba(66, 153, 225, 0.9)'
  },
  epic: {
    bg: 'bg-purple-600',
    border: 'border-purple-400',
    text: 'text-purple-100',
    glow: '0 0 14px rgba(159, 122, 234, 0.9)'
  },
  legendary: {
    bg: 'bg-amber-500',
    border: 'border-yellow-400',
    text: 'text-yellow-100',
    glow: '0 0 16px rgba(236, 201, 75, 1)'
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
    sounds.click();
    if (lootBox.opened) {
      // Just show the rewards if already opened
      onOpen(lootBox, lootBox.rewards || []);
    } else {
      // Show opening animation
      setShowOpenModal(true);
    }
  };

  const handleOpenLootBox = async () => {
    setIsOpening(true);
    sounds.open();
    
    try {
      const res = await apiRequest('POST', `/api/loot-boxes/${lootBox.id}/open`);
      const data = await res.json();
      
      setRewards(data.rewards);
      
      // Start animation sequence
      setCurrentIndex(0);
      setAnimationComplete(false);
      
      // Animation will be handled by useEffect
    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: 'Error',
        description: 'Failed to open loot box',
        variant: 'destructive'
      });
      setIsOpening(false);
      setShowOpenModal(false);
    }
  };

  // Animation effect
  useEffect(() => {
    if (rewards.length > 0 && currentIndex < rewards.length) {
      const timer = setTimeout(() => {
        sounds.reward();
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
        className={`p-3 border-2 cursor-pointer hover:scale-105 transition-all overflow-hidden ${colorScheme.border}`}
        style={{ boxShadow: lootBox.opened ? 'none' : colorScheme.glow }}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className={`w-full aspect-square flex items-center justify-center rounded-lg ${colorScheme.bg} mb-3`}>
            <span className="text-3xl">🎁</span>
          </div>
          <h3 className={`capitalize font-bold text-center ${colorScheme.text}`}>
            {lootBox.type} {lootBox.opened ? '(Opened)' : 'Loot Box'}
          </h3>
          <p className="text-xs text-muted-foreground text-center mt-1">
            From: {lootBox.source}
          </p>
        </div>
      </Card>

      {/* Opening Animation Modal */}
      <Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize text-center text-2xl mb-4">
              Opening {lootBox.type} Loot Box
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-6">
            {isOpening && rewards.length === 0 ? (
              // Opening animation before rewards are fetched
              <div className="py-10">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1, 1.2, 1],
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-32 h-32 flex items-center justify-center rounded-lg ${colorScheme.bg} border-4 ${colorScheme.border}`}
                >
                  <span className="text-6xl">🎁</span>
                </motion.div>
                <p className="mt-6 text-center text-lg">
                  Opening your treasure...
                </p>
              </div>
            ) : isOpening && rewards.length > 0 ? (
              // Reward reveal animation
              <div className="py-8 flex flex-col items-center">
                {rewards.map((reward, index) => (
                  <motion.div
                    key={`${reward.type}-${index}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={index < currentIndex ? { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1 
                    } : { opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                    className="my-2 p-4 border rounded-lg w-full text-center"
                  >
                    <p className="font-bold text-lg capitalize">
                      +{reward.quantity} {reward.type.replace('-', ' ')}
                    </p>
                  </motion.div>
                ))}
                
                {animationComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-6 text-xl font-bold text-primary"
                  >
                    All items collected!
                  </motion.div>
                )}
              </div>
            ) : (
              // Initial state before opening
              <div className="py-8 text-center">
                <div className={`w-32 h-32 mx-auto flex items-center justify-center rounded-lg ${colorScheme.bg} border-4 ${colorScheme.border}`}>
                  <span className="text-6xl">🎁</span>
                </div>
                <p className="mt-6">
                  Are you ready to open this {lootBox.type} loot box?
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-center">
            {!isOpening ? (
              <Button 
                onClick={handleOpenLootBox}
                className="w-full sm:w-auto"
              >
                Open Loot Box
              </Button>
            ) : (
              <Button disabled className="w-full sm:w-auto">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening...
              </Button>
            )}
          </DialogFooter>
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl mb-4">
            Loot Box Rewards
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="capitalize font-medium">{reward.type.replace('-', ' ')}</span>
                <span className="text-lg font-bold text-primary">+{reward.quantity}</span>
              </div>
            ))}
          </div>
          
          {rewards.length === 0 && (
            <p className="text-center text-muted-foreground">No rewards found.</p>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}