import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CraftingResult, PatternMatch, Recipe } from '@/../../shared/types';

/**
 * A hook that handles the crafting system logic
 */
export const useCrafting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Grid state - 5x5 grid of item IDs or empty strings
  const [grid, setGrid] = useState<string[][]>(Array(5).fill(0).map(() => Array(5).fill('')));
  
  // Currently selected recipe
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Highlighted cells that match the pattern
  const [highlightedCells, setHighlightedCells] = useState<{ row: number, col: number }[]>([]);
  
  // Check if we have enough materials for the selected recipe
  const [canCraft, setCanCraft] = useState(false);
  
  // Get all available recipes
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['/api/recipes'],
    staleTime: 30000, // 30 seconds
  });
  
  // Get user's inventory
  const { data: inventory = {} } = useQuery<Record<string, number>>({
    queryKey: ['/api/inventory'],
    staleTime: 5000, // 5 seconds
  });
  
  // Pattern matching result
  const [patternMatch, setPatternMatch] = useState<PatternMatch>({
    matches: false,
    recipeId: null,
    matchedCells: [],
  });
  
  // Drop an item into the grid
  const handleDropItem = useCallback((row: number, col: number, itemId: string) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid.map(r => [...r])];
      newGrid[row][col] = itemId;
      return newGrid;
    });
  }, []);
  
  // Remove an item from the grid
  const handleRemoveItem = useCallback((row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = [...prevGrid.map(r => [...r])];
      newGrid[row][col] = '';
      return newGrid;
    });
  }, []);
  
  // Reset the grid
  const handleResetGrid = useCallback(() => {
    setGrid(Array(5).fill(0).map(() => Array(5).fill('')));
  }, []);
  
  // Check if the grid matches a recipe pattern
  useEffect(() => {
    // Only check if we have a selected recipe
    if (!selectedRecipe) {
      setPatternMatch({
        matches: false,
        recipeId: null,
        matchedCells: [],
      });
      return;
    }
    
    // Check if the grid matches the selected recipe pattern
    const pattern = selectedRecipe.pattern;
    const matchedCells: { row: number, col: number }[] = [];
    
    // Find all cells that have the required items
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const required = pattern[row][col];
        
        // Skip empty cells in the pattern
        if (!required) continue;
        
        // Check if the grid cell matches the required item
        if (grid[row][col] === required) {
          matchedCells.push({ row, col });
        }
      }
    }
    
    // Check if we found all required items
    const requiredCellCount = pattern.flat().filter(Boolean).length;
    const matches = matchedCells.length === requiredCellCount;
    
    setPatternMatch({
      matches,
      recipeId: matches ? selectedRecipe.id : null,
      matchedCells,
    });
    
    // Also highlight the cells that match
    setHighlightedCells(matchedCells);
    
  }, [grid, selectedRecipe]);
  
  // Check if user has enough materials for the selected recipe
  useEffect(() => {
    if (!selectedRecipe || !inventory) {
      setCanCraft(false);
      return;
    }
    
    // Check if all required materials are available in sufficient quantity
    const hasEnoughMaterials = Object.entries(selectedRecipe.materials).every(
      ([itemId, requiredAmount]) => {
        const availableAmount = inventory[itemId] || 0;
        return availableAmount >= requiredAmount;
      }
    );
    
    // We can craft if the pattern matches and we have enough materials
    setCanCraft(patternMatch.matches && hasEnoughMaterials);
    
  }, [selectedRecipe, inventory, patternMatch]);
  
  // Mutation to perform crafting
  const craftMutation = useMutation({
    mutationFn: async (): Promise<CraftingResult> => {
      if (!selectedRecipe) {
        throw new Error('No recipe selected');
      }
      
      const response = await apiRequest('POST', '/api/craft', {
        recipeId: selectedRecipe.id,
        grid,
      });
      
      return await response.json();
    },
    onSuccess: (data: CraftingResult) => {
      // Show success toast
      toast({
        title: 'Crafting successful!',
        description: `You crafted ${data.recipe?.name}`,
        variant: 'default',
      });
      
      // Reset grid
      handleResetGrid();
      
      // Update inventory
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Update crafted items
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
    },
    onError: (error: Error) => {
      // Show error toast
      toast({
        title: 'Crafting failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle crafting
  const handleCraft = useCallback(() => {
    if (!selectedRecipe || !canCraft) return;
    craftMutation.mutate();
  }, [selectedRecipe, canCraft, craftMutation]);
  
  // Handle recipe selection
  const handleSelectRecipe = useCallback((recipe: Recipe | null) => {
    setSelectedRecipe(recipe);
    // Clear highlighted cells if deselecting
    if (!recipe) {
      setHighlightedCells([]);
    }
  }, []);
  
  return {
    grid,
    recipes,
    inventory,
    selectedRecipe,
    highlightedCells,
    canCraft,
    isLoading: craftMutation.isPending,
    onDropItem: handleDropItem,
    onRemoveItem: handleRemoveItem,
    onResetGrid: handleResetGrid,
    onSelectRecipe: handleSelectRecipe,
    onCraft: handleCraft,
  };
};