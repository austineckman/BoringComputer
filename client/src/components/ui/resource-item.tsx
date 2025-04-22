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

  const sizeClasses = {
    sm: {
      container: "p-1",
      icon: "w-4 h-4",
      iconContainer: "w-6 h-6 mb-1",
      quantity: "text-xs"
    },
    md: {
      container: "p-2",
      icon: "w-5 h-5",
      iconContainer: "w-10 h-10 mb-1",
      quantity: "text-base"
    },
    lg: {
      container: "p-3",
      icon: "w-6 h-6", 
      iconContainer: "w-12 h-12 mb-2",
      quantity: "text-2xl"
    }
  };

  const styles = sizeClasses[size];

  return (
    <div 
      className={cn(
        "resource-item bg-space-dark rounded flex flex-col items-center", 
        styles.container, 
        interactive && "hover:scale-105 transition-transform cursor-pointer", 
        className
      )}
      onClick={handleClick}
      onMouseEnter={handleHover}
    >
      <div 
        className={cn(
          "rounded-lg flex items-center justify-center overflow-hidden", 
          styles.iconContainer,
          interactive && "resource-icon-pulse"
        )}
        style={{ backgroundColor: 'transparent' }}
      >
        <img 
          src={imagePath || resourceImages[type] || '/placeholder.png'} 
          alt={resourceConfig.name} 
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold">{resourceConfig.name}</div>
        <div className={cn("font-bold", styles.quantity)} style={{ color: resourceConfig.color }}>
          {quantity}
        </div>
      </div>
    </div>
  );
};

export default ResourceItem;
