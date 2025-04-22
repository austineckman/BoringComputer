import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import InventoryItem from './InventoryItem';
import { itemDatabase, ItemDetails } from '@/lib/itemDatabase';

interface InventoryGridProps {
  inventory: Record<string, number>;
  selectedRecipeRequirements?: Record<string, number>;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  selectedRecipeRequirements = {},
}) => {
  // Get items that player has in inventory
  const inventoryItems = Object.entries(inventory).filter(([_, quantity]) => quantity > 0);

  // Sort by required items first, then alphabetically
  const sortedItems = [...inventoryItems].sort((a, b) => {
    // If a is required and b is not, a comes first
    if (selectedRecipeRequirements[a[0]] && !selectedRecipeRequirements[b[0]]) return -1;
    // If b is required and a is not, b comes first
    if (!selectedRecipeRequirements[a[0]] && selectedRecipeRequirements[b[0]]) return 1;
    // Otherwise, sort alphabetically
    return a[0].localeCompare(b[0]);
  });

  // Get item details from the database (or use a placeholder if not found)
  const getItemDetails = (itemId: string): { name: string; imagePath: string } => {
    try {
      // Try to fetch from your actual item database
      const details = itemDatabase[itemId];
      if (details) {
        return {
          name: details.name,
          imagePath: details.imagePath
        };
      }
    } catch (e) {
      console.error(`Failed to get item details for ${itemId}:`, e);
    }

    // Fallback
    return {
      name: itemId.charAt(0).toUpperCase() + itemId.slice(1),
      imagePath: `/items/${itemId}.png` // Assume conventional naming
    };
  };

  // Check if an item is required for the selected recipe
  const isItemRequired = (itemId: string): boolean => {
    return Boolean(selectedRecipeRequirements[itemId]);
  };

  // Get the amount required for a specific item
  const getRequiredAmount = (itemId: string): number => {
    return selectedRecipeRequirements[itemId] || 0;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Inventory</span>
          <Badge variant="outline">{inventoryItems.length} Item Types</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Your inventory is empty. Complete quests to earn resources!
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {sortedItems.map(([itemId, quantity]) => {
                const itemDetails = getItemDetails(itemId);
                const required = getRequiredAmount(itemId);
                
                return (
                  <InventoryItem
                    key={itemId}
                    itemId={itemId}
                    name={itemDetails.name}
                    imagePath={itemDetails.imagePath}
                    quantity={quantity}
                    isRequired={isItemRequired(itemId)}
                    requiredAmount={required}
                    hasSufficientAmount={quantity >= required}
                  />
                );
              })}
            </div>
          </ScrollArea>
        )}

        {Object.keys(selectedRecipeRequirements).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium mb-2">Required Resources:</h3>
            <div className="flex flex-wrap gap-1">
              {Object.entries(selectedRecipeRequirements).map(([itemId, quantity]) => {
                const available = inventory[itemId] || 0;
                const isSufficient = available >= quantity;
                
                return (
                  <Badge
                    key={itemId}
                    variant="outline"
                    className={isSufficient ? 'text-green-600' : 'text-red-600'}
                  >
                    {itemId}: {available}/{quantity}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;