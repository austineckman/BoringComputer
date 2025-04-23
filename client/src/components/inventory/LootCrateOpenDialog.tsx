import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getLootCrateImage } from '@/lib/assetUtils';
import { LootBox } from '@/pages/unified-inventory';

interface LootCrateOpenDialogProps {
  lootBox: LootBox | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LootCrateOpenDialog({
  lootBox,
  isOpen,
  onClose,
  onConfirm
}: LootCrateOpenDialogProps) {
  // Determine the rarity for styling
  const rarity = lootBox?.type || 'common';
  
  // Set up classes based on rarity
  const rarityClasses = {
    'legendary': 'border-amber-500 bg-amber-500/10 animate-pulse-slow',
    'epic': 'border-purple-500 bg-purple-500/10 animate-pulse-slow',
    'rare': 'border-blue-500 bg-blue-500/10 animate-pulse-slow',
    'uncommon': 'border-green-500 bg-green-500/10',
    'common': 'border-gray-400 bg-gray-500/10',
    'welcome': 'border-brand-orange bg-brand-orange/10',
    'quest': 'border-brand-orange bg-brand-orange/10',
    'event': 'border-cyan-500 bg-cyan-500/10 animate-pulse-slow',
  };
  
  // Set glow effect based on rarity
  const glowStyle = {
    boxShadow: `0 0 20px 5px ${
      rarity === 'legendary' ? 'rgba(245, 158, 11, 0.4)' :
      rarity === 'epic' ? 'rgba(168, 85, 247, 0.4)' :
      rarity === 'rare' ? 'rgba(59, 130, 246, 0.4)' :
      rarity === 'event' ? 'rgba(6, 182, 212, 0.4)' :
      rarity === 'welcome' || rarity === 'quest' ? 'rgba(249, 115, 22, 0.4)' :
      'rgba(156, 163, 175, 0.2)'
    }`
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-space-mid border-2 border-space-light/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center text-brand-orange">
            Open {rarity.charAt(0).toUpperCase() + rarity.slice(1)} Loot Crate?
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div 
            className={`w-32 h-32 rounded-lg border-2 ${rarityClasses[rarity as keyof typeof rarityClasses]} p-2 flex items-center justify-center relative`}
            style={glowStyle}
          >
            <img 
              src="/images/loot-crate.png" 
              alt="Loot Crate"
              className="w-full h-full object-contain pixelated" 
            />
            
            {/* Ping effect animation for higher rarity crates */}
            {(rarity === 'legendary' || rarity === 'epic' || rarity === 'event') && (
              <span className="absolute w-full h-full rounded-lg animate-ping opacity-20 bg-white"></span>
            )}
          </div>
          
          <p className="mt-4 text-sm text-center text-brand-light/80">
            {lootBox?.type === 'welcome' ? (
              "Welcome to your adventure! Open this crate to get your starter items."
            ) : lootBox?.type === 'quest' ? (
              "Quest reward earned! Open this crate to claim your rewards."
            ) : lootBox?.type === 'event' ? (
              "Special event loot! This crate contains limited-time items."
            ) : (
              `Opening this ${rarity} crate will give you random items based on its rarity.`
            )}
          </p>
          
          <p className="mt-2 text-xs text-center text-brand-light/60">
            Source: {lootBox?.source || 'Unknown'}
          </p>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between gap-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="default" 
            onClick={onConfirm}
            className={`flex-1 ${
              rarity === 'legendary' ? 'bg-amber-500 hover:bg-amber-600' :
              rarity === 'epic' ? 'bg-purple-500 hover:bg-purple-600' :
              rarity === 'rare' ? 'bg-blue-500 hover:bg-blue-600' :
              rarity === 'event' ? 'bg-cyan-500 hover:bg-cyan-600' :
              rarity === 'welcome' || rarity === 'quest' ? 'bg-brand-orange hover:bg-brand-orange/80' :
              'bg-brand-orange hover:bg-brand-orange/80'
            }`}
          >
            Open Crate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}