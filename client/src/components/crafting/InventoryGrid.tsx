import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import InventoryItem from './InventoryItem';
import { Recipe } from '@/../../shared/types';

interface InventoryGridProps {
  inventory: Record<string, number>;
  selectedRecipe: Recipe | null;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  selectedRecipe
}) => {
  // Transform inventory object into an array for rendering
  const inventoryItems = Object.entries(inventory || {}).map(([itemId, quantity]) => ({
    itemId,
    quantity: typeof quantity === 'number' ? quantity : 0
  }));
  
  // Check if an item is required for the selected recipe
  const isItemRequired = (itemId: string): boolean => {
    if (!selectedRecipe) return false;
    return Object.keys(selectedRecipe.materials).includes(itemId);
  };
  
  // Get the required amount for an item in the selected recipe
  const getRequiredAmount = (itemId: string): number => {
    if (!selectedRecipe) return 0;
    return selectedRecipe.materials[itemId] || 0;
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          Inventory
        </CardTitle>
        <CardDescription>
          Drag items to the crafting grid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Your inventory is empty
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {inventoryItems.map((item) => (
                <InventoryItem
                  key={item.itemId}
                  itemId={item.itemId}
                  quantity={item.quantity}
                  isRequired={isItemRequired(item.itemId)}
                  requiredAmount={getRequiredAmount(item.itemId)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;