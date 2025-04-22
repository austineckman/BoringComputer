import React, { useState, useEffect } from 'react';
import CraftingCell from './CraftingCell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import ResourceItem from '@/components/ui/resource-item';
import { Separator } from '@/components/ui/separator';
import { CraftingRecipe } from '@/shared/schema';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface CraftingGridProps {
  gridSize?: number;
  selectedRecipe: CraftingRecipe | null;
  inventory: Record<string, number>;
  onCraft: (recipe: CraftingRecipe, grid: (string | null)[][]) => void;
}

const CraftingGrid: React.FC<CraftingGridProps> = ({
  gridSize = 5,
  selectedRecipe,
  inventory,
  onCraft
}) => {
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
  );
  const [isPatternCorrect, setIsPatternCorrect] = useState(false);
  const [hasEnoughResources, setHasEnoughResources] = useState(false);
  const { sounds } = useSoundEffects();

  // Reset grid when selected recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      // Start with a clean grid of the right size
      const newGrid = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(null));
      setGrid(newGrid);
      setIsPatternCorrect(false);
    }
  }, [selectedRecipe, gridSize]);

  // Check if pattern is correct and if player has enough resources
  useEffect(() => {
    if (!selectedRecipe) {
      setIsPatternCorrect(false);
      setHasEnoughResources(false);
      return;
    }

    // Check pattern correctness
    let patternMatches = true;
    const recipePattern = selectedRecipe.pattern;
    
    // For each position in the recipe pattern, check if grid has matching item
    for (let row = 0; row < recipePattern.length; row++) {
      for (let col = 0; col < recipePattern[row].length; col++) {
        const expectedItem = recipePattern[row][col];
        const actualItem = grid[row][col];
        
        // If recipe expects an item but grid doesn't have it (or has wrong item)
        if (expectedItem && expectedItem !== actualItem) {
          patternMatches = false;
          break;
        }
        
        // If recipe expects empty but grid has an item
        if (expectedItem === null && actualItem !== null) {
          patternMatches = false;
          break;
        }
      }
      if (!patternMatches) break;
    }
    
    setIsPatternCorrect(patternMatches);
    
    // Check if player has all required resources
    if (patternMatches) {
      const requiredItems = selectedRecipe.requiredItems;
      let hasAll = true;
      
      // Count items already placed in grid
      const placedItems: Record<string, number> = {};
      for (const row of grid) {
        for (const cell of row) {
          if (cell) {
            placedItems[cell] = (placedItems[cell] || 0) + 1;
          }
        }
      }
      
      // Check each required item
      for (const [itemId, quantity] of Object.entries(requiredItems)) {
        const availableInInventory = inventory[itemId] || 0;
        const alreadyPlaced = placedItems[itemId] || 0;
        
        if (availableInInventory < quantity - alreadyPlaced) {
          hasAll = false;
          break;
        }
      }
      
      setHasEnoughResources(hasAll);
    } else {
      setHasEnoughResources(false);
    }
  }, [grid, selectedRecipe, inventory]);

  const handleItemDrop = (itemId: string, rowIndex: number, colIndex: number) => {
    const newGrid = [...grid.map(row => [...row])];
    newGrid[rowIndex][colIndex] = itemId;
    setGrid(newGrid);
  };

  const handleCellClear = (rowIndex: number, colIndex: number) => {
    const newGrid = [...grid.map(row => [...row])];
    newGrid[rowIndex][colIndex] = null;
    setGrid(newGrid);
  };

  const handleCraftClick = () => {
    if (!selectedRecipe || !isPatternCorrect || !hasEnoughResources) return;
    
    sounds.craftSuccess();
    onCraft(selectedRecipe, grid);
    
    // Reset grid after crafting
    setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
  };

  const handleClearGrid = () => {
    sounds.click();
    setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
  };

  return (
    <div className="crafting-table-container bg-gray-200 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex flex-col items-center">
        <div className="crafting-title mb-4 flex items-center">
          <h3 className="text-xl font-bold mr-3">Crafting Table</h3>
          {selectedRecipe ? (
            <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900">
              {selectedRecipe.name}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700">
              Select a Recipe
            </Badge>
          )}
        </div>
        
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="crafting-grid grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <CraftingCell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  item={cell}
                  isHighlighted={selectedRecipe?.pattern[rowIndex]?.[colIndex] !== undefined}
                  onDrop={handleItemDrop}
                  onClear={handleCellClear}
                  disabled={!selectedRecipe}
                />
              ))
            ))}
          </div>

          {selectedRecipe && (
            <div className="flex flex-col items-center mx-4">
              <ArrowRight className="h-8 w-8 text-gray-400 mb-2" />
              <motion.div 
                className="result-container w-16 h-16 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  borderColor: isPatternCorrect && hasEnoughResources ? ['#10b981', '#34d399', '#10b981'] : undefined
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ResourceItem
                  type={selectedRecipe.resultItem as any}
                  quantity={selectedRecipe.resultQuantity}
                  size="md"
                  interactive={false}
                />
              </motion.div>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="crafting-actions flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleClearGrid}
            disabled={!selectedRecipe}
          >
            Clear Grid
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleCraftClick}
            disabled={!selectedRecipe || !isPatternCorrect || !hasEnoughResources}
            className={!selectedRecipe || !isPatternCorrect || !hasEnoughResources ? 'opacity-50' : 'bg-green-600 hover:bg-green-700'}
          >
            Craft Item
          </Button>
        </div>
        
        {selectedRecipe && !isPatternCorrect && (
          <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
            Pattern doesn't match the recipe. Arrange items according to the recipe guide.
          </p>
        )}
        
        {selectedRecipe && isPatternCorrect && !hasEnoughResources && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
            Not enough resources in your inventory to craft this item.
          </p>
        )}
      </div>
    </div>
  );
};

export default CraftingGrid;