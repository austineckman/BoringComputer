import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InventoryItem from './InventoryItem';
import { Recipe } from '@/../../shared/types';
import goldBagIcon from '../../assets/506_Gold_Bag_Leather_B.png';

interface InventoryGridProps {
  inventory: Record<string, number>;
  selectedRecipe: Recipe | null;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  selectedRecipe
}) => {
  // Get all required items for the selected recipe
  const getRequiredItems = () => {
    if (!selectedRecipe) return {};
    return selectedRecipe.requiredItems || {};
  };
  
  // Convert inventory to array of items
  const inventoryItems = Object.entries(inventory || {})
    .filter(([_, quantity]) => quantity > 0) // Only show items with quantity > 0
    .map(([itemId, quantity]) => {
      const requiredItems = getRequiredItems();
      const isRequired = selectedRecipe && Object.keys(requiredItems).includes(itemId);
      const requiredAmount = isRequired ? requiredItems[itemId] : 0;
      
      return {
        itemId,
        quantity,
        isRequired,
        requiredAmount
      };
    })
    .sort((a, b) => {
      // Sort by required for recipe first, then by quantity descending
      if (a.isRequired && !b.isRequired) return -1;
      if (!a.isRequired && b.isRequired) return 1;
      return b.quantity - a.quantity;
    });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <img 
            src={goldBagIcon} 
            alt="Inventory Bag" 
            className="w-20 h-20 mr-2 object-contain pixelated"
            style={{ imageRendering: 'pixelated' }}
          />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Your inventory is empty. Complete quests to get materials!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {inventoryItems.map(({ itemId, quantity, isRequired, requiredAmount }) => (
              <InventoryItem
                key={itemId}
                itemId={itemId}
                quantity={quantity}
                isRequired={isRequired}
                requiredAmount={requiredAmount}
              />
            ))}
          </div>
        )}
        
        {selectedRecipe && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-medium mb-2">Required for {selectedRecipe.name}:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.entries(getRequiredItems()).map(([itemId, amount]) => {
                const currentAmount = inventory[itemId] || 0;
                return (
                  <InventoryItem
                    key={`required-${itemId}`}
                    itemId={itemId}
                    quantity={currentAmount}
                    isRequired={true}
                    requiredAmount={amount}
                  />
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