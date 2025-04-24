import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Recipe } from '@/../../shared/types';
import { queryClient } from '@/lib/queryClient';
import { useSoundEffects } from './useSoundEffects';
import { useToast } from '@/hooks/use-toast';

// Cell position interface
interface CellPos {
  row: number;
  col: number;
}

export function useCrafting() {
  const { sounds } = useSoundEffects();
  const { toast } = useToast();
  
  // Initialize grid from localStorage or create a new empty 3x3 grid
  const [grid, setGrid] = useState<string[][]>(() => {
    // Try to get grid from localStorage
    try {
      const savedGrid = localStorage.getItem('craftingGrid');
      if (savedGrid) {
        return JSON.parse(savedGrid);
      }
    } catch (error) {
      console.error('Error loading grid from localStorage:', error);
    }
    
    // Return empty 3x3 grid if nothing in localStorage
    return Array(3).fill('').map(() => Array(3).fill(''));
  });
  
  // User's inventory state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [highlightedCells, setHighlightedCells] = useState<CellPos[]>([]);
  const [canCraft, setCanCraft] = useState(false);
  
  // Fetch recipes from API with shorter stale time to refresh more frequently
  const { data: recipes = [], isLoading: isRecipesLoading } = useQuery<Recipe[]>({
    queryKey: ['/api/crafting/recipes'],
    staleTime: 10000, // 10 seconds (much shorter than default)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
      if (!selectedRecipe) {
        throw new Error('No recipe selected');
      }
      
      // Convert recipeId to a number since the server expects a number
      const recipeIdNum = parseInt(recipeId, 10);
      
      console.log('Sending crafting request:', {
        recipeId: recipeIdNum,
        gridPattern: grid
      });
      
      const response = await fetch('/api/crafting/craft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recipeId: recipeIdNum, 
          gridPattern: grid 
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Crafting error:', errorText);
        throw new Error(errorText || 'Failed to craft item');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Clear grid after successful crafting
      resetGrid();
      
      // Update inventory data immediately without requiring a refresh
      const currentInventoryData = queryClient.getQueryData<any[]>(['/api/inventory']);
      
      if (currentInventoryData) {
        console.log('Before inventory update:', currentInventoryData);
        
        // Find and update the crafted item in the inventory
        const updatedInventory = [...currentInventoryData];
        const resultItemId = String(data.resultItem);
        const resultQuantity = data.resultQuantity || 1;
        
        // Find the item in inventory or add it if it doesn't exist
        const existingItemIndex = updatedInventory.findIndex(item => item.type === resultItemId);
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedInventory[existingItemIndex] = {
            ...updatedInventory[existingItemIndex],
            quantity: updatedInventory[existingItemIndex].quantity + resultQuantity
          };
        } else {
          // Add new item to inventory
          updatedInventory.push({
            id: resultItemId,
            type: resultItemId,
            quantity: resultQuantity
          });
        }
        
        // Update materials quantities (decrease used materials)
        if (selectedRecipe && selectedRecipe.requiredItems) {
          for (const [itemId, quantity] of Object.entries(selectedRecipe.requiredItems)) {
            const materialIndex = updatedInventory.findIndex(item => item.type === itemId);
            if (materialIndex >= 0) {
              updatedInventory[materialIndex] = {
                ...updatedInventory[materialIndex],
                quantity: updatedInventory[materialIndex].quantity - quantity
              };
            }
          }
        }
        
        console.log('After inventory update:', updatedInventory);
        
        // Update the query cache with the new inventory
        queryClient.setQueryData(['/api/inventory'], updatedInventory);
      }
      
      // Also invalidate the query to refetch in the background
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Show a notification about the crafted item
      toast({
        title: "Item Crafted!",
        description: `You crafted ${data.resultQuantity} ${selectedRecipe?.name || 'item'}`,
        variant: "success",
      });
      
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
    
    // Ensure pattern is 3x3
    const recipePattern = selectedRecipe.pattern;
    if (!recipePattern || recipePattern.length !== 3) {
      console.error('Recipe pattern is not 3x3:', recipePattern);
      setHighlightedCells([]);
      setCanCraft(false);
      return;
    }
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const patternItem = recipePattern[row][col];
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