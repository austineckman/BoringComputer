import { useState, useCallback, useMemo } from 'react';
import { Recipe, CraftingGridPattern } from '@/../../shared/types';
import { useSoundEffects } from './useSoundEffects';
import { useToast } from './use-toast';

// Create a 5x5 empty grid 
const createEmptyGrid = (): string[][] => {
  return Array(5).fill(null).map(() => Array(5).fill(''));
};

// Interface for the hook's return value
interface UseCraftingReturn {
  grid: string[][];
  selectedRecipe: Recipe | null;
  selectRecipe: (recipe: Recipe | null) => void;
  addItemToGrid: (row: number, col: number, itemId: string) => void;
  removeItemFromGrid: (row: number, col: number) => void;
  resetGrid: () => void;
  highlightedCells: [number, number][];
  canCraft: boolean;
  craft: () => void;
  craftedResults: null | {
    recipe: Recipe;
    usedItems: Record<string, number>;
  };
  clearCraftedResults: () => void;
}

export function useCrafting(
  inventory: Record<string, number>,
  recipes: Recipe[],
  onCraftComplete?: (recipe: Recipe, usedItems: Record<string, number>) => void
): UseCraftingReturn {
  // State for the crafting grid, selected recipe, and highlighted cells
  const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<[number, number][]>([]);
  const [craftedResults, setCraftedResults] = useState<null | {
    recipe: Recipe;
    usedItems: Record<string, number>;
  }>(null);
  
  const { sounds } = useSoundEffects();
  const { toast } = useToast();

  // Update the grid with an item
  const addItemToGrid = useCallback((row: number, col: number, itemId: string) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid.map(r => [...r])];
      newGrid[row][col] = itemId;
      return newGrid;
    });
  }, []);

  // Remove an item from the grid
  const removeItemFromGrid = useCallback((row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid.map(r => [...r])];
      newGrid[row][col] = '';
      return newGrid;
    });
  }, []);

  // Reset the grid to empty
  const resetGrid = useCallback(() => {
    setGrid(createEmptyGrid());
  }, []);

  // Select a recipe and highlight cells if pattern matching
  const selectRecipe = useCallback((recipe: Recipe | null) => {
    setSelectedRecipe(recipe);
  }, []);

  // Check if the current grid matches the selected recipe pattern
  const patternMatches = useMemo(() => {
    if (!selectedRecipe) return false;
    
    const pattern = selectedRecipe.pattern;
    const patternHeight = pattern.length;
    const patternWidth = pattern[0].length;
    
    // Try all possible positions to place the pattern in the grid
    for (let offsetRow = 0; offsetRow <= 5 - patternHeight; offsetRow++) {
      for (let offsetCol = 0; offsetCol <= 5 - patternWidth; offsetCol++) {
        let matches = true;
        const matchedCells: [number, number][] = [];
        
        // Check if pattern matches at this position
        for (let r = 0; r < patternHeight; r++) {
          for (let c = 0; c < patternWidth; c++) {
            const gridRow = offsetRow + r;
            const gridCol = offsetCol + c;
            const patternItem = pattern[r][c];
            
            // If pattern has an item at this position
            if (patternItem) {
              // If grid doesn't match pattern at this position
              if (grid[gridRow][gridCol] !== patternItem) {
                matches = false;
                break;
              }
              matchedCells.push([gridRow, gridCol]);
            }
          }
          if (!matches) break;
        }
        
        if (matches) {
          // Update highlighted cells
          setHighlightedCells(matchedCells);
          return true;
        }
      }
    }
    
    // No match found
    setHighlightedCells([]);
    return false;
  }, [grid, selectedRecipe]);

  // Calculate if user has required materials for selected recipe
  const hasRequiredMaterials = useMemo(() => {
    if (!selectedRecipe) return false;
    
    return Object.entries(selectedRecipe.materials).every(([itemId, amount]) => {
      const available = inventory[itemId] || 0;
      return available >= amount;
    });
  }, [inventory, selectedRecipe]);
  
  // Determine if crafting is possible
  const canCraft = useMemo(() => {
    return Boolean(selectedRecipe && patternMatches && hasRequiredMaterials);
  }, [selectedRecipe, patternMatches, hasRequiredMaterials]);
  
  // Perform crafting
  const craft = useCallback(() => {
    if (!canCraft || !selectedRecipe) {
      sounds.craftFail();
      toast({
        title: "Crafting Failed",
        description: "The pattern or materials are incorrect.",
        variant: "destructive",
      });
      return;
    }
    
    // Play success sound
    sounds.craftSuccess();
    
    // Calculate items used
    const usedItems: Record<string, number> = {};
    Object.entries(selectedRecipe.materials).forEach(([itemId, amount]) => {
      usedItems[itemId] = amount;
    });
    
    // Set crafted results
    setCraftedResults({
      recipe: selectedRecipe,
      usedItems
    });
    
    // Show success message
    toast({
      title: "Crafting Successful!",
      description: `You crafted: ${selectedRecipe.name}`,
      variant: "success", 
    });
    
    // Reset grid after successful craft
    resetGrid();
    
    // Call the callback if provided
    if (onCraftComplete) {
      onCraftComplete(selectedRecipe, usedItems);
    }
  }, [canCraft, selectedRecipe, sounds, toast, resetGrid, onCraftComplete]);
  
  // Clear crafted results
  const clearCraftedResults = useCallback(() => {
    setCraftedResults(null);
  }, []);
  
  return {
    grid,
    selectedRecipe,
    selectRecipe,
    addItemToGrid,
    removeItemFromGrid,
    resetGrid,
    highlightedCells,
    canCraft,
    craft,
    craftedResults,
    clearCraftedResults
  };
}