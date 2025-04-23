import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Recipe } from '@/../../shared/types';
import { queryClient } from '@/lib/queryClient';
import { useSoundEffects } from './useSoundEffects';

// Cell position interface
interface CellPos {
  row: number;
  col: number;
}

export function useCrafting() {
  const { sounds } = useSoundEffects();
  
  // Initialize grid (5x5 empty grid)
  const [grid, setGrid] = useState<string[][]>(
    Array(5).fill('').map(() => Array(5).fill(''))
  );
  
  // User's inventory state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<CellPos[]>([]);
  const [canCraft, setCanCraft] = useState(false);
  
  // Fetch recipes from API
  const { data: recipes = [], isLoading: isRecipesLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/crafting/recipes'],
  });
  
  // Fetch user's inventory from API
  const { data: inventoryItems = [], isLoading: isInventoryLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });
  
  // Convert array of inventory items to Record<itemId, quantity> format for crafting
  const inventory = React.useMemo(() => {
    const inventoryMap: Record<string, number> = {};
    if (Array.isArray(inventoryItems)) {
      inventoryItems.forEach(item => {
        if (item && item.id) {
          inventoryMap[item.id] = item.quantity || 0;
        }
      });
    }
    return inventoryMap;
  }, [inventoryItems]);
  
  // Mutation for crafting an item
  const craftMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await fetch('/api/crafting/craft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId, gridPattern: grid }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to craft item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear grid after successful crafting
      resetGrid();
      // Invalidate inventory to update counts
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
  });
  
  // Reset the crafting grid to empty
  const resetGrid = useCallback(() => {
    setGrid(Array(5).fill('').map(() => Array(5).fill('')));
  }, []);
  
  // Handle dropping an item onto the grid
  const handleDropItem = useCallback((row: number, col: number, itemId: string) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = itemId;
      return newGrid;
    });
  }, []);
  
  // Handle removing an item from the grid
  const handleRemoveItem = useCallback((row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = '';
      return newGrid;
    });
  }, []);
  
  // Handle selecting a recipe
  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe);
  }, []);
  
  // Handle crafting an item
  const handleCraft = useCallback(() => {
    if (selectedRecipe && canCraft) {
      craftMutation.mutate(selectedRecipe.id);
    }
  }, [selectedRecipe, canCraft, craftMutation]);
  
  // Determine if the grid matches the selected recipe pattern
  const checkGridPattern = useCallback(() => {
    if (!selectedRecipe) {
      setHighlightedCells([]);
      setCanCraft(false);
      return;
    }
    
    // Keep track of materials used in the crafting grid
    const usedMaterials: Record<string, number> = {};
    
    // Track which cells match the pattern
    const matchedCells: CellPos[] = [];
    
    // Check if grid matches the pattern
    let patternMatches = true;
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const patternItem = selectedRecipe.pattern[row][col];
        const gridItem = grid[row][col];
        
        if (patternItem && patternItem !== '') {
          // Pattern requires an item here
          if (gridItem === patternItem) {
            // Item matches the pattern
            matchedCells.push({ row, col });
            usedMaterials[gridItem] = (usedMaterials[gridItem] || 0) + 1;
          } else {
            // Pattern doesn't match
            patternMatches = false;
          }
        } else if (gridItem !== '') {
          // Extra item that's not in the pattern
          patternMatches = false;
        }
      }
    }
    
    // Check if user has enough materials
    let hasMaterials = true;
    for (const [itemId, requiredAmount] of Object.entries(selectedRecipe.materials)) {
      const usedAmount = usedMaterials[itemId] || 0;
      if (usedAmount < requiredAmount) {
        hasMaterials = false;
        break;
      }
    }
    
    setHighlightedCells(patternMatches ? matchedCells : []);
    setCanCraft(patternMatches && hasMaterials);
  }, [selectedRecipe, grid]);
  
  // Check grid pattern when dependencies change
  useEffect(() => {
    checkGridPattern();
  }, [grid, selectedRecipe, checkGridPattern]);
  
  // Determine if any data is still loading
  const isLoading = isRecipesLoading || isInventoryLoading || craftMutation.isPending;
  
  return {
    grid,
    recipes,
    inventory,
    selectedRecipe,
    highlightedCells,
    canCraft,
    isLoading,
    onDropItem: handleDropItem,
    onRemoveItem: handleRemoveItem,
    onResetGrid: resetGrid,
    onSelectRecipe: handleSelectRecipe,
    onCraft: handleCraft,
  };
}