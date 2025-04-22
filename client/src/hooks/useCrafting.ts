import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { getItemDetails } from '@/lib/itemDatabase';
import { Recipe } from '../../shared/types';

// Define the grid size for the crafting interface
export const GRID_SIZE = 5;

// Create a type for our crafting grid pattern
export type CraftingGridPattern = (string | null)[][];

interface UseCraftingOptions {
  inventory: Record<string, number>;
  recipes: Recipe[];
  onCraftSuccess?: (recipeId: number, resultItem: string, quantity: number) => void;
}

export function useCrafting({ inventory, recipes, onCraftSuccess }: UseCraftingOptions) {
  // Initialize the state for our crafting grid
  const [grid, setGrid] = useState<CraftingGridPattern>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  
  // State for the currently selected recipe
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  
  // Get the currently selected recipe
  const selectedRecipe = recipes.find(recipe => recipe.id === selectedRecipeId) || null;
  
  // Some utilities for the UI
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
  
  // Function to check if we can craft the selected recipe
  const canCraft = useCallback(() => {
    // Must have a selected recipe
    if (!selectedRecipe) return false;
    
    // Check if we have all required materials
    const { materials } = selectedRecipe;
    
    // If the recipe requires a specific pattern, check if our grid matches that pattern
    if (selectedRecipe.pattern) {
      // Check if the grid matches the pattern
      return doGridPatternsMatch(grid, selectedRecipe.pattern);
    } else {
      // Otherwise, just check if we have all the materials in our inventory
      return Object.entries(materials).every(([itemId, requiredAmount]) => {
        return (inventory[itemId] || 0) >= requiredAmount;
      });
    }
  }, [selectedRecipe, grid, inventory]);
  
  // Handle placing an item in the grid
  const placeItemInGrid = useCallback((row: number, col: number, itemId: string) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = itemId;
      return newGrid;
    });
  }, []);
  
  // Handle removing an item from the grid
  const removeItemFromGrid = useCallback((row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = null;
      return newGrid;
    });
  }, []);
  
  // Handle attempting to craft the selected recipe
  const craft = useCallback(async () => {
    if (!selectedRecipe) {
      toast({
        title: "No Recipe Selected",
        description: "Please select a recipe first.",
        variant: "destructive"
      });
      sounds.error();
      return;
    }
    
    if (!canCraft()) {
      toast({
        title: "Can't Craft",
        description: "You don't have all the required materials.",
        variant: "destructive"
      });
      sounds.craftFail();
      return;
    }
    
    // Craft the item
    const { resultItem, resultQuantity, name } = selectedRecipe;
    
    // Play craft success sound
    sounds.craftSuccess();
    
    // Show success toast
    toast({
      title: "Item Crafted!",
      description: `Successfully crafted ${resultQuantity}x ${getItemDetails(resultItem).name}`,
      variant: "success"
    });
    
    // Clear the grid if using a pattern
    if (selectedRecipe.pattern) {
      setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    }
    
    // Call the success callback if provided
    if (onCraftSuccess) {
      onCraftSuccess(selectedRecipeId!, resultItem, resultQuantity);
    }
  }, [selectedRecipe, canCraft, sounds, toast, onCraftSuccess, selectedRecipeId]);
  
  // Helper function to check if two grid patterns match
  const doGridPatternsMatch = (
    currentGrid: CraftingGridPattern,
    recipePattern: CraftingGridPattern
  ): boolean => {
    // Ensure both grids are the same size
    if (currentGrid.length !== recipePattern.length) return false;
    
    for (let row = 0; row < recipePattern.length; row++) {
      if (currentGrid[row].length !== recipePattern[row].length) return false;
      
      for (let col = 0; col < recipePattern[row].length; col++) {
        const recipeCell = recipePattern[row][col];
        const currentCell = currentGrid[row][col];
        
        // If recipe doesn't care about this cell (null), skip it
        if (recipeCell === null) continue;
        
        // If recipe requires an item here but grid doesn't have it, fail
        if (recipeCell && currentCell !== recipeCell) return false;
      }
    }
    
    return true;
  };
  
  // Calculate what recipe materials are still needed
  const getMissingMaterials = useCallback(() => {
    if (!selectedRecipe) return {};
    
    const { materials } = selectedRecipe;
    const missing: Record<string, number> = {};
    
    Object.entries(materials).forEach(([itemId, requiredAmount]) => {
      const availableAmount = inventory[itemId] || 0;
      if (availableAmount < requiredAmount) {
        missing[itemId] = requiredAmount - availableAmount;
      }
    });
    
    return missing;
  }, [selectedRecipe, inventory]);
  
  return {
    grid,
    setGrid,
    selectedRecipeId,
    setSelectedRecipeId,
    selectedRecipe,
    placeItemInGrid,
    removeItemFromGrid,
    canCraft: canCraft(),
    craft,
    getMissingMaterials
  };
}