import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import InventoryItem from './InventoryItem';
import { Recipe } from '../../../shared/types';

interface InventoryGridProps {
  inventory: Record<string, number>;
  selectedRecipe: Recipe | null;
  onUseItem?: (itemId: string) => void;
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  selectedRecipe,
  onUseItem
}) => {
  // Calculate if an item is required for the selected recipe and how many are needed
  const getRequiredAmount = (itemId: string): number => {
    if (!selectedRecipe) return 0;
    return selectedRecipe.materials[itemId] || 0;
  };
  
  // Sort inventory items - required items first, then by quantity (most first)
  const sortedInventory = Object.entries(inventory).sort((a, b) => {
    const [itemIdA, quantityA] = a;
    const [itemIdB, quantityB] = b;
    
    // If there's a selected recipe, show required items first
    if (selectedRecipe) {
      const requiredA = getRequiredAmount(itemIdA);
      const requiredB = getRequiredAmount(itemIdB);
      
      // Both required or both not required - sort by quantity
      if ((requiredA > 0 && requiredB > 0) || (requiredA === 0 && requiredB === 0)) {
        return quantityB - quantityA;
      }
      
      // One is required, one is not
      return requiredB - requiredA;
    }
    
    // No recipe selected, just sort by quantity
    return quantityB - quantityA;
  });
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Inventory</span>
          <span className="text-sm font-normal text-gray-500">
            {Object.keys(inventory).length} items
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px] pr-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-4">
            {sortedInventory.map(([itemId, quantity]) => {
              const requiredAmount = getRequiredAmount(itemId);
              const isRequired = requiredAmount > 0;
              
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
            
            {/* Empty state */}
            {sortedInventory.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12 mb-2 text-gray-400 dark:text-gray-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
                <h3 className="font-medium mb-1">No Items Yet</h3>
                <p className="text-sm">Complete quests to earn loot crates and gather resources!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InventoryGrid;