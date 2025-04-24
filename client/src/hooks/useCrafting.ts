import { useState, useEffect, useCallback, useMemo } from 'react';
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
  
  // Initialize grid from localStorage or create a new empty 3x3 grid
  const [grid, setGrid] = useState<string[][]>(() => {
    // Try to get grid from localStorage
    try {
      const savedGrid = localStorage.getItem('craftingGrid');
      if (savedGrid) {
        // Check if we're converting from 5x5 to 3x3
        const parsedGrid = JSON.parse(savedGrid);
        if (parsedGrid.length === 5) {
          // Extract the middle 3x3 from the 5x5 grid
          return [
            parsedGrid[1].slice(1, 4),
            parsedGrid[2].slice(1, 4),
            parsedGrid[3].slice(1, 4),
          ];
        }
        return parsedGrid;
      }
    } catch (error) {
      console.error('Error loading grid from localStorage:', error);
    }
    
    // Return empty grid if nothing in localStorage
    return Array(3).fill('').map(() => Array(3).fill(''));
  });
  
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
  const inventory = useMemo(() => {
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
      // Convert 3x3 grid to 5x5 grid format for the server
      const grid5x5 = Array(5).fill('').map(() => Array(5).fill(''));
      
      // Place the 3x3 grid in the center of the 5x5 grid
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          // Place in positions [1,1] to [3,3] of the 5x5 grid
          grid5x5[row + 1][col + 1] = grid[row][col];
        }
      }
      
      // Convert recipeId to a number since the server expects a number
      const recipeIdNum = parseInt(recipeId, 10);
      
      console.log('Sending crafting request:', {
        recipeId: recipeIdNum,
        gridPattern: grid5x5
      });
      
      const response = await fetch('/api/crafting/craft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recipeId: recipeIdNum, 
          gridPattern: grid5x5 
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Crafting error:', errorText);
        throw new Error(errorText || 'Failed to craft item');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear grid after successful crafting
      resetGrid();
      // Invalidate inventory to update counts
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      // Play success sound
      sounds.craftComplete();
    },
  });
  
  // Reset the crafting grid to empty
  const resetGrid = useCallback(() => {
    const emptyGrid = Array(3).fill('').map(() => Array(3).fill(''));
    setGrid(emptyGrid);
    // Also clear from localStorage
    try {
      localStorage.removeItem('craftingGrid');
    } catch (error) {
      console.error('Error clearing grid from localStorage:', error);
    }
  }, []);
  
  // Track used items in the grid
  const usedItems = useMemo(() => {
    const itemCounts: Record<string, number> = {};
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell) {
          itemCounts[cell] = (itemCounts[cell] || 0) + 1;
        }
      });
    });
    return itemCounts;
  }, [grid]);
  
  // Calculate remaining inventory after grid usage
  const remainingInventory = useMemo(() => {
    if (!inventory) return {};
    
    const result: Record<string, number> = {...inventory};
    
    // Subtract used items
    Object.entries(usedItems).forEach(([itemId, count]) => {
      const available = inventory[itemId] || 0;
      result[itemId] = Math.max(0, available - count);
    });
    
    return result;
  }, [inventory, usedItems]);
  
  // Handle dropping an item onto the grid
  const handleDropItem = useCallback((row: number, col: number, itemId: string) => {
    // Check if there's enough inventory left for this item
    const currentlyUsed = usedItems[itemId] || 0;
    const available = (inventory?.[itemId] || 0);
    
    // If there's not enough inventory, don't allow the drop
    if (currentlyUsed >= available) {
      sounds.error();
      return;
    }
    
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = itemId;
      return newGrid;
    });
  }, [inventory, usedItems, sounds]);
  
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
    
    // Convert 5x5 recipe pattern to 3x3 if needed
    const recipePattern = selectedRecipe.pattern;
    let pattern3x3: string[][];
    
    if (recipePattern.length === 5) {
      // Extract middle 3x3 from 5x5 pattern
      pattern3x3 = [
        recipePattern[1].slice(1, 4),
        recipePattern[2].slice(1, 4),
        recipePattern[3].slice(1, 4),
      ];
    } else if (recipePattern.length === 3) {
      pattern3x3 = recipePattern;
    } else {
      // Invalid pattern size
      patternMatches = false;
      pattern3x3 = Array(3).fill('').map(() => Array(3).fill(''));
    }
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const patternItem = pattern3x3[row][col];
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
    for (const [itemId, requiredAmount] of Object.entries(selectedRecipe.requiredItems || {})) {
      const usedAmount = usedMaterials[itemId] || 0;
      if (usedAmount < (requiredAmount as number)) {
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
  
  // Save grid to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('craftingGrid', JSON.stringify(grid));
    } catch (error) {
      console.error('Error saving grid to localStorage:', error);
    }
  }, [grid]);
  
  // Determine if any data is still loading
  const isLoading = isRecipesLoading || isInventoryLoading || craftMutation.isPending;
  
  return {
    grid,
    recipes,
    inventory,
    remainingInventory,
    usedItems,
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