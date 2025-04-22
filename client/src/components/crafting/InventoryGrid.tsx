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
  // Get the required materials for the selected recipe
  const requiredMaterials = selectedRecipe ? selectedRecipe.materials : {};
  
  // Filter inventory to only show items that are in the inventory
  const inventoryItems = Object.entries(inventory)
    .filter(([_, quantity]) => quantity > 0)
    .sort(([idA], [idB]) => {
      // If the item is required for the selected recipe, put it at the top
      const aIsRequired = selectedRecipe && requiredMaterials[idA] > 0;
      const bIsRequired = selectedRecipe && requiredMaterials[idB] > 0;
      
      if (aIsRequired && !bIsRequired) return -1;
      if (!aIsRequired && bIsRequired) return 1;
      
      // Otherwise sort alphabetically
      return idA.localeCompare(idB);
    });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Inventory</CardTitle>
        <CardDescription>
          Drag items to the crafting grid above
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {inventoryItems.map(([itemId, quantity]) => {
              // Check if this item is required for the selected recipe
              const isRequired = selectedRecipe && requiredMaterials[itemId] > 0;
              const requiredAmount = isRequired ? requiredMaterials[itemId] : 0;
              
              return (
                <InventoryItem
                  key={itemId}
                  itemId={itemId}
                  quantity={quantity}
                  isRequired={isRequired}
                  requiredAmount={requiredAmount}
                />
              );
            })}
            
            {inventoryItems.length === 0 && (
              <div className="col-span-full text-center py-6 text-muted-foreground">
                Your inventory is empty. Complete quests to earn resources!
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;