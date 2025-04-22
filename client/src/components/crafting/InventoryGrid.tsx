import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import InventoryItem from './InventoryItem';
import { Recipe } from '@/../../shared/types';

interface InventoryGridProps {
  inventory: Record<string, number>;
  selectedRecipe: Recipe | null;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({ inventory, selectedRecipe }) => {
  // Get required materials for selected recipe
  const getRequiredAmount = (itemId: string): number => {
    if (!selectedRecipe) return 0;
    return selectedRecipe.materials[itemId] || 0;
  };
  
  // Check if an item is required for selected recipe
  const isItemRequired = (itemId: string): boolean => {
    if (!selectedRecipe) return false;
    return !!selectedRecipe.materials[itemId];
  };
  
  // Convert inventory object to array for rendering
  const inventoryItems = Object.entries(inventory)
    .filter(([_, quantity]) => quantity > 0) // Only show items with quantity > 0
    .map(([itemId, quantity]) => ({
      itemId,
      quantity,
      isRequired: isItemRequired(itemId),
      requiredAmount: getRequiredAmount(itemId),
    }));
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryItems.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground">
            Your inventory is empty
          </div>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {inventoryItems.map((item) => (
                <InventoryItem
                  key={item.itemId}
                  itemId={item.itemId}
                  quantity={item.quantity}
                  isRequired={item.isRequired}
                  requiredAmount={item.requiredAmount}
                />
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="text-xs text-muted-foreground mt-4">
          Drag items to the crafting grid above
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;