import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getItemDetails } from '@/lib/itemDatabase';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const itemDetails = getItemDetails(lootBoxType);
  const crateImage = getLootCrateImage();
  
  // Reset animation state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Determine styles based on rarity
  const getBorderColor = () => {
    switch(itemDetails.rarity) {
      case 'legendary': return 'border-amber-500';
      case 'epic': return 'border-purple-500';
      case 'rare': return 'border-blue-500';
      case 'uncommon': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };
  
  const getGlowColor = () => {
    switch(itemDetails.rarity) {
      case 'legendary': return 'amber';
      case 'epic': return 'purple';
      case 'rare': return 'blue';
      case 'uncommon': return 'green';
      default: return 'gray';
    }
  };
  
  const getAnimationClass = () => {
    switch(itemDetails.rarity) {
      case 'legendary': return 'animate-pulse-legendary';
      case 'epic': return 'animate-pulse-epic';
      case 'rare': return 'animate-pulse-rare';
      case 'uncommon': return 'animate-pulse-uncommon';
      default: return 'animate-pulse-slow';
    }
  };
  
  const getTextColor = () => {
    switch(itemDetails.rarity) {
      case 'legendary': return 'text-amber-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      case 'uncommon': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-space-dark ${getBorderColor()} max-w-md w-[95%] overflow-visible p-0`}>
        <div className="relative">
          {/* Outer glow effect */}
          <div className={`absolute -inset-1 rounded-lg opacity-75 ${getAnimationClass()}`} 
               style={{
                 boxShadow: `0 0 15px 2px rgba(var(--${getGlowColor()}-rgb), 0.5)`,
                 zIndex: -1
               }}></div>
               
          <div className="bg-space-dark rounded-lg p-6">
            <DialogHeader className="text-center mb-6">
              <DialogTitle className={`text-2xl font-bold ${getTextColor()} uppercase tracking-wider`}>
                {itemDetails.rarity} Loot Crate
              </DialogTitle>
              <DialogDescription className="text-brand-light/80 mt-2">
                Do you want to open this {itemDetails.rarity} loot crate?
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center my-4">
              {/* Animated crate image */}
              <div className={`w-32 h-32 relative ${isAnimating ? 'animate-float' : ''}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={crateImage.src} 
                    alt={crateImage.alt} 
                    className="w-full h-full object-contain transform transition-transform hover:scale-110" 
                  />
                </div>
                
                {/* Particle effects */}
                {isAnimating && (
                  <>
                    <div className="absolute inset-0 scale-110 animate-ping-slow opacity-30 rounded-full" 
                      style={{
                        background: `radial-gradient(circle, rgba(var(--${getGlowColor()}-rgb), 0.8) 0%, transparent 70%)`
                      }}></div>
                    <div className="absolute inset-0 scale-125 animate-ping-slow opacity-20 rounded-full" 
                      style={{
                        background: `radial-gradient(circle, rgba(var(--${getGlowColor()}-rgb), 0.6) 0%, transparent 70%)`,
                        animationDelay: '0.3s'
                      }}></div>
                  </>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-lg font-medium text-brand-light">{itemDetails.name}</p>
                <p className="text-sm text-brand-light/70 mt-1">{itemDetails.flavorText}</p>
                
                {/* Rarity badge */}
                <div className="mt-3 inline-block px-3 py-1.5 rounded-md text-sm font-bold uppercase"
                     style={{
                       backgroundColor: `rgba(var(--${getGlowColor()}-rgb), 0.15)`,
                       border: `1px solid rgba(var(--${getGlowColor()}-rgb), 0.3)`,
                       color: `rgb(var(--${getGlowColor()}-rgb))`
                     }}>
                  {itemDetails.rarity}
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6 flex gap-3 flex-col sm:flex-row">
              <Button 
                variant="outline" 
                className="w-full border-brand-light/20 text-brand-light/90 hover:bg-brand-light/5 hover:text-brand-light"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                className={`w-full ${isAnimating ? 'animate-pulse-slow' : ''}`}
                style={{
                  backgroundColor: `rgba(var(--${getGlowColor()}-rgb), 0.3)`,
                  borderColor: `rgba(var(--${getGlowColor()}-rgb), 0.5)`,
                  color: `rgb(var(--${getGlowColor()}-rgb))`,
                }}
                onClick={onConfirm}
              >
                Open Crate
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}