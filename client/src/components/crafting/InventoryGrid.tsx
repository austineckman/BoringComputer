import React from 'react';
import InventoryItem from './InventoryItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InventoryGridProps {
  inventory: Record<string, number>;
  selectedRecipeRequirements?: Record<string, number>;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  selectedRecipeRequirements,
}) => {
  // Filter out zero quantity items
  const inventoryItems = Object.entries(inventory)
    .filter(([_, quantity]) => quantity > 0)
    .sort((a, b) => {
      // Sort by required items first
      const aRequired = selectedRecipeRequirements?.[a[0]] || 0;
      const bRequired = selectedRecipeRequirements?.[b[0]] || 0;
      
      if (aRequired && !bRequired) return -1;
      if (!aRequired && bRequired) return 1;
      
      // Then sort by quantity (highest first)
      return b[1] - a[1];
    });

  return (
    <Card className="w-full h-[300px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Resources</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[220px]">
          <div className="p-4">
            {inventoryItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {inventoryItems.map(([itemId, quantity]) => (
                  <InventoryItem
                    key={itemId}
                    itemId={itemId}
                    quantity={quantity}
                    requiredQuantity={selectedRecipeRequirements?.[itemId]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Your inventory is empty. Complete quests to collect resources.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;