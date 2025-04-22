import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { LootBox } from '@shared/schema';

const RARITY_COLORS = {
  common: 'bg-slate-600',
  uncommon: 'bg-green-600',
  rare: 'bg-blue-600',
  epic: 'bg-purple-600',
  legendary: 'bg-amber-600'
};

interface LootBoxProps {
  lootBox: LootBox;
  onOpen: (lootBox: LootBox, rewards: {type: string, quantity: number}[]) => void;
}

export function LootBoxItem({ lootBox, onOpen }: LootBoxProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { sounds } = useSoundEffects();
  
  const handleOpen = async () => {
    if (isAnimating || lootBox.opened) return;
    
    try {
      setIsAnimating(true);
      sounds.craftSuccess();
      
      // API call to open the loot box
      const res = await apiRequest('POST', `/api/loot-boxes/${lootBox.id}/open`);
      const data = await res.json();
      
      // Invalidate inventory queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/loot-boxes'] });
      
      // Call the callback with rewards
      onOpen(lootBox, data.rewards);
      
      // Reset animation state after completed
      setTimeout(() => setIsAnimating(false), 2000);
    } catch (error) {
      setIsAnimating(false);
      sounds.error();
      toast({
        title: "Failed to open loot box",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Determine color based on rarity
  const rarityColor = RARITY_COLORS[lootBox.type as keyof typeof RARITY_COLORS] || 'bg-slate-600';
  
  return (
    <Card className={`p-4 border-2 ${lootBox.opened ? 'opacity-60' : ''}`}>
      <div className="flex flex-col items-center">
        <div 
          className={`${rarityColor} w-24 h-24 mb-3 rounded-lg flex items-center justify-center relative overflow-hidden`}
        >
          {isAnimating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <div className="text-white text-4xl">?</div>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-1 capitalize">{lootBox.type} Box</h3>
        <p className="text-xs text-muted-foreground mb-3">
          {lootBox.opened ? 'Opened' : 'Unopened'}
        </p>
        
        <Button 
          size="sm"
          variant={lootBox.opened ? "outline" : "default"}
          disabled={lootBox.opened || isAnimating}
          onClick={handleOpen}
          onMouseEnter={sounds.hover}
          className="w-full"
        >
          {lootBox.opened ? 'Opened' : 'Open Box'}
        </Button>
      </div>
    </Card>
  );
}

interface LootBoxRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: {type: string, quantity: number}[];
}

export function LootBoxRewardModal({ isOpen, onClose, rewards }: LootBoxRewardModalProps) {
  const { sounds } = useSoundEffects();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className="bg-card rounded-lg shadow-xl p-6 max-w-md w-full border-2 border-primary"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Rewards Received!</h2>
              <p className="text-muted-foreground">Here's what you found in the loot box:</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {rewards.map((reward, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-muted p-3 rounded-lg text-center border border-border"
                >
                  <div className="text-lg font-medium capitalize mb-1">{reward.type}</div>
                  <div className="text-2xl font-bold text-primary">+{reward.quantity}</div>
                </motion.div>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                onClick={onClose}
                onMouseEnter={sounds.hover}
                size="lg"
              >
                Awesome!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}