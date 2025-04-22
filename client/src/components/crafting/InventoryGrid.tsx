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
  // Convert inventory object to sorted array
  const inventoryItems = React.useMemo(() => {
    // Get all inventory items as array with id and quantity
    const items = Object.entries(inventory).map(([id, quantity]) => ({
      id,
      quantity
    }));

    // If there's a selected recipe, sort items so that required materials appear first
    if (selectedRecipe) {
      return items.sort((a, b) => {
        const aIsRequired = selectedRecipe.materials[a.id] ? 1 : 0;
        const bIsRequired = selectedRecipe.materials[b.id] ? 1 : 0;
        
        // First sort by whether it's required for the recipe
        if (aIsRequired !== bIsRequired) {
          return bIsRequired - aIsRequired; // Required items first
        }
        
        // Then sort by quantity (descending)
        return b.quantity - a.quantity;
      });
    }
    
    // Default sort by quantity (descending)
    return items.sort((a, b) => b.quantity - a.quantity);
  }, [inventory, selectedRecipe]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          Inventory
        </CardTitle>
        <CardDescription>
          {selectedRecipe 
            ? 'Materials needed for selected recipe are highlighted' 
            : 'Drag items from here to the crafting grid'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[295px] pr-4">
          <div className="grid grid-cols-3 gap-2">
            {inventoryItems.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No items in inventory
              </div>
            ) : (
              inventoryItems.map(({ id, quantity }) => {
                // Check if this item is required for the selected recipe
                const isRequired = Boolean(selectedRecipe?.materials[id]);
                const requiredAmount = selectedRecipe?.materials[id] || 0;
                
                return (
                  <InventoryItem
                    key={id}
                    itemId={id}
                    quantity={quantity}
                    isRequired={isRequired}
                    requiredAmount={requiredAmount}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;