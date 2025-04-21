import React from "react";
import ResourceItem from "@/components/ui/resource-item";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InventoryItemProps {
  type: string;
  quantity: number;
  lastAcquired?: string;
}

const InventoryItem = ({ type, quantity, lastAcquired }: InventoryItemProps) => {
  // Format last acquired date if present
  const formattedDate = lastAcquired ? new Date(lastAcquired).toLocaleDateString() : undefined;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <ResourceItem type={type as any} quantity={quantity} size="lg" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-space-dark border border-brand-orange/30">
          <div className="px-2 py-1">
            <p className="font-semibold mb-1">Total Quantity: {quantity}</p>
            {formattedDate && (
              <p className="text-xs text-brand-light/70">Last Acquired: {formattedDate}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InventoryItem;
