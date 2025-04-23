import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Sparkles } from 'lucide-react';
import { getLootCrateImage } from '@/lib/assetUtils';

interface LootCrateOpenDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lootBoxType: string;
  onConfirm: () => void;
}

export default function LootCrateOpenDialog({ 
  isOpen, 
  onOpenChange, 
  lootBoxType, 
  onConfirm 
}: LootCrateOpenDialogProps) {
  const { sounds } = useSoundEffects();
  const [isHovered, setIsHovered] = useState(false);
  
  const handleConfirm = () => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    onConfirm();
  };
  
  const handleCancel = () => {
    try {
      sounds.click();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
    onOpenChange(false);
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    try {
      sounds.hover();
    } catch (e) {
      console.warn('Could not play sound', e);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  // Get the appropriate border color based on loot box type
  const getBorderColorClass = () => {
    switch (lootBoxType) {
      case 'legendary':
        return 'border-amber-500 bg-amber-500/10';
      case 'epic':
        return 'border-purple-500 bg-purple-500/10';
      case 'rare':
        return 'border-blue-500 bg-blue-500/10';
      case 'uncommon':
        return 'border-green-500 bg-green-500/10';
      case 'common':
      default:
        return 'border-gray-400 bg-gray-400/10';
    }
  };
  
  // Get animation class based on loot box type
  const getAnimationClass = () => {
    switch (lootBoxType) {
      case 'legendary':
        return 'bg-legendary-pulse';
      case 'epic':
        return 'bg-epic-pulse';
      case 'rare':
        return 'bg-rare-pulse';
      case 'uncommon':
        return 'bg-uncommon-pulse';
      case 'common':
      default:
        return 'bg-common-pulse';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-space-dark border-0 overflow-hidden">
        <div className={`absolute inset-0 -z-10 opacity-50 ${getAnimationClass()}`}></div>
        
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-brand-orange text-center font-pixel">
            OPEN LOOT CRATE
          </DialogTitle>
          <DialogDescription className="text-center text-brand-light/80">
            Are you sure you want to open this {lootBoxType} loot crate?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center mb-4">
          <div className={`w-32 h-32 ${getBorderColorClass()} border-2 rounded-lg p-4 flex items-center justify-center animate-ping-slow`}>
            <img 
              src={getLootCrateImage().src} 
              alt={getLootCrateImage().alt}
              className="w-full h-full object-contain pixelated" 
            />
          </div>
          
          <div className="mt-6 text-center">
            <h3 className={`text-xl font-bold capitalize ${
              lootBoxType === 'legendary' ? 'text-amber-400' :
              lootBoxType === 'epic' ? 'text-purple-400' :
              lootBoxType === 'rare' ? 'text-blue-400' :
              lootBoxType === 'uncommon' ? 'text-green-400' :
              'text-gray-300'
            }`}>
              {lootBoxType} Loot Crate
            </h3>
            <p className="text-sm text-brand-light/70 mt-1">
              This crate contains items of {lootBoxType} rarity or below
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-space-light/30 hover:bg-space-light/10"
          >
            Cancel
          </Button>
          
          <Button 
            className={`relative overflow-hidden bg-brand-orange hover:bg-brand-orange/80 text-white
                      ${isHovered ? 'button-glow' : ''}`}
            onClick={handleConfirm}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Open Crate
            <span className="sr-only">Open loot crate</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}