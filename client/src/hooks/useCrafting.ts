import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useCrafting() {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all crafting recipes
  const {
    data: recipes = [],
    isLoading: isLoadingRecipes,
    error: recipesError,
  } = useQuery({
    queryKey: ['/api/crafting/recipes'],
    refetchOnWindowFocus: false,
  });

  // Fetch a specific recipe
  const {
    data: selectedRecipe,
    isLoading: isLoadingRecipe,
  } = useQuery({
    queryKey: ['/api/crafting/recipes', selectedRecipeId],
    enabled: selectedRecipeId !== null,
    refetchOnWindowFocus: false,
  });

  // Craft an item
  const craftMutation = useMutation({
    mutationFn: async ({ 
      gridPattern, 
      recipeId 
    }: { 
      gridPattern: (string | null)[][], 
      recipeId: number 
    }) => {
      const res = await apiRequest('POST', '/api/crafting/craft', {
        gridPattern,
        recipeId,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      // Show a success toast
      toast({
        title: "Item Crafted!",
        description: `You have successfully crafted ${data.craftedItem.quantity}x ${data.craftedItem.type}`,
        variant: "success",
      });
      
      // Update the inventory cache
      queryClient.setQueryData(['/api/inventory'], data.updatedInventory);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/history'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Crafting Failed",
        description: error.message || "There was a problem crafting your item.",
        variant: "destructive",
      });
    },
  });

  // Handle recipe selection
  const selectRecipe = (recipeId: number | null) => {
    setSelectedRecipeId(recipeId);
  };

  // Handle crafting
  const craftItem = async (gridPattern: (string | null)[][], recipeId: number) => {
    return craftMutation.mutateAsync({ gridPattern, recipeId });
  };

  return {
    recipes,
    selectedRecipe,
    isLoadingRecipes,
    isLoadingRecipe,
    recipesError,
    selectRecipe,
    craftItem,
    isCrafting: craftMutation.isPending,
  };
}