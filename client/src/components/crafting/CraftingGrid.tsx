import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CraftingCell from './CraftingCell';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useToast } from '@/hooks/use-toast';
import { CraftingRecipe } from '@shared/schema';

interface CraftingGridProps {
  selectedRecipe: CraftingRecipe | null;
  inventory: Record<string, number>;
  onCraft: (gridPattern: (string | null)[][], recipeId: number) => Promise<void>;
  isCrafting: boolean;
}

const GRID_SIZE = 5;

const CraftingGrid: React.FC<CraftingGridProps> = ({
  selectedRecipe,
  inventory,
  onCraft,
  isCrafting,
}) => {
  // Initialize a 5x5 grid with all null values
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );
  
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const { sounds } = useSoundEffects();
  const { toast } = useToast();
  
  // Reset the grid when a new recipe is selected
  useEffect(() => {
    setGrid(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)));
    setSelectedItems({});
  }, [selectedRecipe]);
  
  // Add item to the grid
  const handleCellDrop = useCallback((row: number, col: number, itemId: string) => {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return;
    }
    
    // Check if we have this item in our inventory
    const currentInventoryCount = inventory[itemId] || 0;
    const currentlyUsed = selectedItems[itemId] || 0;
    
    if (currentlyUsed >= currentInventoryCount) {
      toast({
        title: "Not enough items",
        description: `You don't have any more ${itemId} in your inventory.`,
        variant: "destructive",
      });
      sounds.error();
      return;
    }
    
    // Update the grid
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = itemId;
      return newGrid;
    });
    
    // Update selected item counts
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    
    sounds.hover();
  }, [inventory, selectedItems, sounds, toast]);
  
  // Remove item from the grid
  const handleCellRemove = useCallback((row: number, col: number) => {
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      return;
    }
    
    const itemId = grid[row][col];
    if (!itemId) return;
    
    // Update the grid
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = null;
      return newGrid;
    });
    
    // Update selected item counts
    setSelectedItems(prev => {
      const newSelectedItems = { ...prev };
      newSelectedItems[itemId] = Math.max(0, (newSelectedItems[itemId] || 0) - 1);
      if (newSelectedItems[itemId] === 0) {
        delete newSelectedItems[itemId];
      }
      return newSelectedItems;
    });
  }, [grid]);
  
  // Check if the current grid matches the selected recipe pattern
  const canCraftSelectedRecipe = useCallback(() => {
    if (!selectedRecipe) return false;
    
    const pattern = selectedRecipe.pattern as (string | null)[][];
    
    // Check if we have all the required items in our inventory
    for (const [itemId, quantity] of Object.entries(selectedRecipe.requiredItems)) {
      const available = inventory[itemId] || 0;
      if (available < quantity) return false;
    }
    
    // Check if pattern matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const recipeItem = pattern[row]?.[col] || null;
        const gridItem = grid[row][col];
        
        // If recipe expects an item but grid doesn't have it (or has wrong item)
        if (recipeItem && recipeItem !== gridItem) {
          return false;
        }
        
        // If recipe expects empty but grid has an item
        if (recipeItem === null && gridItem !== null) {
          return false;
        }
      }
    }
    
    return true;
  }, [selectedRecipe, grid, inventory]);
  
  // Craft the item
  const handleCraft = async () => {
    if (!selectedRecipe || !canCraftSelectedRecipe()) return;
    
    try {
      await onCraft(grid, selectedRecipe.id);
      sounds.craftSuccess();
      
      // Reset grid after successful crafting
      setGrid(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)));
      setSelectedItems({});
      
    } catch (error) {
      console.error('Failed to craft item:', error);
      toast({
        title: "Crafting failed",
        description: "Something went wrong while crafting. Please try again.",
        variant: "destructive",
      });
      sounds.error();
    }
  };
  
  // Clear the crafting grid
  const handleClear = () => {
    setGrid(Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)));
    setSelectedItems({});
    sounds.click();
  };
  
  // Determine which cells to highlight based on recipe pattern
  const getHighlightStatus = (row: number, col: number) => {
    if (!selectedRecipe) return false;
    
    const pattern = selectedRecipe.pattern as (string | null)[][];
    const recipeItem = pattern[row]?.[col];
    
    return recipeItem !== undefined && recipeItem !== null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Crafting Grid</span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isCrafting || !grid.some(row => row.some(cell => cell !== null))}
            >
              Clear
            </Button>
            <Button
              onClick={handleCraft}
              disabled={isCrafting || !canCraftSelectedRecipe()}
              size="sm"
            >
              {isCrafting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Crafting...
                </>
              ) : (
                'Craft Item'
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1 md:gap-2 mb-4">
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <CraftingCell 
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                item={cell}
                onDrop={handleCellDrop}
                onRemove={handleCellRemove}
                isHighlighted={getHighlightStatus(rowIndex, colIndex)}
              />
            ))
          ))}
        </div>
        
        {selectedRecipe && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {canCraftSelectedRecipe() 
              ? "✅ Pattern complete! Click 'Craft Item' to create your item." 
              : "Place the required items in the highlighted positions to craft this recipe."}
          </div>
        )}
        
        {!selectedRecipe && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Select a recipe from the list to start crafting.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CraftingGrid;