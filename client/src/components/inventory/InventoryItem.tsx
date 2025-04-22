import React from "react";
import ResourceItem from "@/components/ui/resource-item";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InventoryItem as InventoryItemType } from "@/hooks/useInventory";
import { Badge } from "@/components/ui/badge";

interface InventoryItemProps {
  item: InventoryItemType;
  onClick?: (item: InventoryItemType) => void;
}

const rarityColors = {
  common: "bg-gray-500/20 text-gray-300",
  uncommon: "bg-green-500/20 text-green-300",
  rare: "bg-blue-500/20 text-blue-300",
  epic: "bg-purple-500/20 text-purple-300",
  legendary: "bg-orange-500/20 text-brand-orange"
};

const InventoryItem = ({ item, onClick }: InventoryItemProps) => {
  // Format last acquired date if present
  const formattedDate = item.lastAcquired ? new Date(item.lastAcquired).toLocaleDateString() : undefined;
  
  // Extract properties from item
  const { type, quantity, name, description, flavorText, rarity, imagePath } = item;
  
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`cursor-${onClick ? 'pointer' : 'help'}`} 
            onClick={handleClick}
          >
            <ResourceItem 
              type={type as any} 
              quantity={quantity} 
              size="lg" 
              imagePath={imagePath}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-space-dark border border-brand-orange/30 w-64">
          <div className="px-2 py-1">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold">{name || type}</p>
              <Badge variant="outline" className={rarityColors[rarity] || rarityColors.common}>
                {rarity}
              </Badge>
            </div>
            {description && (
              <p className="text-sm text-brand-light mb-1">{description}</p>
            )}
            {flavorText && (
              <p className="text-xs italic text-brand-light/70 mb-2">{flavorText}</p>
            )}
            <div className="flex justify-between text-xs">
              <p className="font-semibold">Quantity: {quantity}</p>
              {formattedDate && (
                <p className="text-brand-light/70">Acquired: {formattedDate}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItem;
