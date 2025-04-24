import React from "react";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/themeConfig";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Import resource images
import clothImage from "@assets/cloth.png";
import copperImage from "@assets/copper.png";
import techscrapImage from "@assets/techscrap.png";
import crystalImage from "@assets/crystal.png";
import circuitBoardImage from "@assets/circuit board.png";
import lootCrateImage from "@assets/loot crate.png";

type ResourceType = "cloth" | "copper" | "techscrap" | "crystal" | "circuit-board" | "loot-crate";

// Resource image mapping
const resourceImages: Record<ResourceType, string> = {
  "cloth": clothImage,
  "copper": copperImage,
  "techscrap": techscrapImage,
  "crystal": crystalImage,
  "circuit-board": circuitBoardImage,
  "loot-crate": lootCrateImage
};

interface ResourceItemProps {
  type: ResourceType;
  quantity: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  imagePath?: string; // Optional custom image path from the database
}

const ResourceItem = ({ 
  type, 
  quantity, 
  size = "md", 
  className, 
  interactive = false, 
  onClick,
  imagePath
}: ResourceItemProps) => {
  const { sounds } = useSoundEffects();
  
  // Get resource configuration
  const resourceConfig = themeConfig.resourceTypes.find(r => r.id === type);
  
  if (!resourceConfig) {
    return null;
  }

  // Play resource-specific sound when interacted with
  const handleClick = () => {
    if (interactive) {
      // Map resource types to specific sounds
      switch(type) {
        case "copper":
          sounds.success();
          break;
        case "techscrap":
          sounds.questComplete();
          break;
        case "crystal":
          sounds.achievement();
          break;
        case "circuit-board":
          sounds.craftSuccess();
          break;
        case "loot-crate":
          sounds.boxOpen();
          break;
        default:
          sounds.click();
      }
      
      // Execute any additional click handler passed as prop
      if (onClick) onClick();
    }
  };
  
  const handleHover = () => {
    if (interactive) {
      sounds.hover();
    }
  };

  // Pixel art optimized size classes based on exact 32px scaling
  const sizeClasses = {
    sm: {
      container: "p-1",
      spriteSize: "w-[32px] h-[32px]",
      scaleMultiplier: 1,
      containerClass: "pixel-scale-1",
      quantityClass: "text-xs",
      nameVisible: false
    },
    md: {
      container: "p-2",
      spriteSize: "w-[32px] h-[32px]",
      scaleMultiplier: 2,
      containerClass: "pixel-scale-2",
      quantityClass: "text-sm",
      nameVisible: true
    },
    lg: {
      container: "p-2",
      spriteSize: "w-[32px] h-[32px]",
      scaleMultiplier: 3,
      containerClass: "pixel-scale-3",
      quantityClass: "text-base",
      nameVisible: true
    }
  };

  const styles = sizeClasses[size];

  // Get the item rarity from the item database if it exists
  const itemDetails = getItemDetails(type);
  const rarity = itemDetails?.rarity || 'common';

  return (
    <div 
      className={cn(
        "resource-item rounded flex flex-col items-center", 
        `rarity-${rarity}`,
        "pixel-item-container",
        styles.container, 
        interactive && "hover:scale-105 transition-transform cursor-pointer", 
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      {/* Item container */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        <div className={cn(
          "relative flex items-center justify-center", 
          styles.containerClass
        )}>
          {/* Pixel art sprite with exact scaling */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img 
              src={imagePath || resourceImages[type] || '/placeholder.png'} 
              alt={resourceConfig.name || type} 
              className={cn(
                styles.spriteSize,
                "pixelated"
              )}
              style={{ 
                imageRendering: 'pixelated',
                transform: `scale(${styles.scaleMultiplier})`,
                transformOrigin: 'center',
              }}
              onError={(e) => {
                // If the image fails to load, fall back to type-based image or placeholder
                const target = e.target as HTMLImageElement;
                if (target.src !== resourceImages[type] && resourceImages[type]) {
                  target.src = resourceImages[type];
                } else if (target.src !== '/placeholder.png') {
                  target.src = '/placeholder.png';
                }
              }}
            />
          </div>
          
          {/* Quantity badge */}
          <div className="absolute bottom-0 right-0 pixel-quantity-badge">
            {quantity}
          </div>
        </div>
      </div>
      
      {/* Item name - only shown for medium and large sizes */}
      {styles.nameVisible && (
        <div className="text-center mt-1 w-full truncate px-1">
          <div className="text-xs font-semibold truncate">{resourceConfig?.name || type}</div>
        </div>
      )}
    </div>
  );
};

export default ResourceItem;
