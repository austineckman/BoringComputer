import React from "react";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/themeConfig";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type ResourceType = "cloth" | "metal" | "tech-scrap" | "sensor-crystal" | "circuit-board" | "alchemy-ink" | "loot-crate";

interface ResourceItemProps {
  type: ResourceType;
  quantity: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const ResourceItem = ({ 
  type, 
  quantity, 
  size = "md", 
  className, 
  interactive = false, 
  onClick 
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
        case "metal":
          sounds.boostEngine();
          break;
        case "tech-scrap":
          sounds.powerUp();
          break;
        case "sensor-crystal":
          sounds.spaceDoor();
          break;
        case "circuit-board":
          sounds.craftSuccess();
          break;
        case "alchemy-ink":
          sounds.success();
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
          src={`/images/resources/${type}.png`} 
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
