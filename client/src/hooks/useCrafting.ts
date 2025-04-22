import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Recipe, CraftingGridPattern } from '@/../../shared/types';
import { apiRequest } from '@/lib/queryClient';

// Define the grid size for crafting
export const GRID_SIZE = 5;

// Initialize an empty crafting grid
const createEmptyGrid = (): CraftingGridPattern => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
};

// Custom hook to manage the crafting system
export function useCrafting(
  recipes: Recipe[],
  inventory: Record<string, number>
) {
  const [grid, setGrid] = useState<CraftingGridPattern>(createEmptyGrid());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [canCraft, setCanCraft] = useState<boolean>(false);
  const { sounds } = useSoundEffects();
  const queryClient = useQueryClient();

  // Effect to check if the current grid matches the selected recipe pattern
  useEffect(() => {
    if (!selectedRecipe) {
      setCanCraft(false);
      return;
    }

    // Check if pattern matches
    const patternMatches = checkPatternMatch(grid, selectedRecipe.pattern);
    
    // Check if user has enough materials
    const hasEnoughMaterials = Object.entries(selectedRecipe.materials).every(([itemId, requiredAmount]) => {
      const available = inventory[itemId] || 0;
      return available >= requiredAmount;
    });
    
    setCanCraft(patternMatches && hasEnoughMaterials);
  }, [grid, selectedRecipe, inventory]);

  // Handle placing an item in the crafting grid
  const handleDropItem = (row: number, col: number, itemId: string) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = itemId;
      return newGrid;
    });
  };

  // Handle removing an item from the crafting grid
  const handleRemoveItem = (row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = '';
      return newGrid;
    });
  };

  // Handle selecting a recipe
  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    
    // Clear the grid when a new recipe is selected
    setGrid(createEmptyGrid());
  };

  // Mutation for crafting an item
  const craftMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRecipe || !canCraft) return null;
      
      const response = await apiRequest('POST', '/api/crafting/craft', {
        recipeId: selectedRecipe.id,
        grid: grid
      });
      
      return await response.json();
    },
    onSuccess: () => {
      sounds.craftSuccess();
      toast({
        title: 'Item Crafted!',
        description: `You successfully crafted ${selectedRecipe?.name}`,
        variant: 'success'
      });
      
      // Reset the crafting grid and clear selected recipe
      setGrid(createEmptyGrid());
      setSelectedRecipe(null);
      
      // Invalidate queries that need to be updated
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
    },
    onError: (error) => {
      sounds.craftFail();
      toast({
        title: 'Crafting Failed',
        description: error.message || 'Failed to craft the item. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Function to handle the craft button click
  const handleCraft = () => {
    if (!selectedRecipe) return;
    
    // Double check we have enough materials
    const missingMaterials = Object.entries(selectedRecipe.materials)
      .filter(([itemId, requiredAmount]) => {
        const available = inventory[itemId] || 0;
        return available < requiredAmount;
      })
      .map(([itemId, requiredAmount]) => {
        const available = inventory[itemId] || 0;
        return `${itemId}: ${available}/${requiredAmount}`;
      });
    
    if (missingMaterials.length > 0) {
      sounds.craftFail();
      toast({
        title: 'Missing Materials',
        description: `You don't have enough materials to craft this item: ${missingMaterials.join(', ')}`,
        variant: 'destructive'
      });
      return;
    }
    
    // If all checks pass, execute the craft mutation
    craftMutation.mutate();
  };

  // Check if current grid matches a pattern
  const checkPatternMatch = (
    currentGrid: CraftingGridPattern,
    pattern: CraftingGridPattern
  ): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (pattern[row][col] && currentGrid[row][col] !== pattern[row][col]) {
          return false;
        }
      }
    }
    return true;
  };

  return {
    grid,
    selectedRecipe,
    canCraft,
    isCrafting: craftMutation.isPending,
    onDropItem: handleDropItem,
    onRemoveItem: handleRemoveItem,
    onSelectRecipe: handleSelectRecipe,
    onCraft: handleCraft,
  };
}

export default useCrafting;