import React from "react";
import { cn } from "@/lib/utils";
import { themeConfig } from "@/lib/themeConfig";

type ResourceType = "cloth" | "metal" | "tech-scrap" | "sensor-crystal" | "circuit-board" | "alchemy-ink";

interface ResourceItemProps {
  type: ResourceType;
  quantity: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ResourceItem = ({ type, quantity, size = "md", className }: ResourceItemProps) => {
  // Get resource configuration
  const resourceConfig = themeConfig.resourceTypes.find(r => r.id === type);
  
  if (!resourceConfig) {
    return null;
  }

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
    <div className={cn("resource-item bg-space-dark rounded flex flex-col items-center", styles.container, className)}>
      <div 
        className={cn("rounded-lg flex items-center justify-center", styles.iconContainer)}
        style={{ backgroundColor: resourceConfig.color }}
      >
        <i className={`fas fa-${resourceConfig.icon} text-white ${styles.icon}`}></i>
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
