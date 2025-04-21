import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useInventory } from "@/hooks/useInventory";

export interface CraftableItem {
  id: string;
  name: string;
  description: string;
  image: string;
  recipe: {
    type: string;
    quantity: number;
  }[];
  type: "physical" | "digital";
}

export interface CraftedItem {
  id: string;
  itemId: string;
  dateCrafted: string;
  status: "pending" | "shipped" | "delivered" | "unlocked";
  tracking?: string;
  address?: string;
}

export const useCrafting = () => {
  const { toast } = useToast();
  const { playSound } = useSoundEffects();
  const { hasEnoughResources } = useInventory();

  // Get all craftable items
  const { data: craftableItems = [], isLoading: loadingCraftableItems } = useQuery<CraftableItem[]>({
    queryKey: ['/api/craftables'],
    retry: false
  });

  // Get user's crafted items
  const { data: craftedItems = [], isLoading: loadingCraftedItems } = useQuery<CraftedItem[]>({
    queryKey: ['/api/crafted-items'],
    retry: false
  });

  // Craft an item
  const craftItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('POST', `/api/craftables/${itemId}/craft`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
      
      playSound("craft");
      toast({
        title: "Item Crafted!",
        description: data.type === "physical"
          ? "Your item will be shipped to you soon!"
          : "Digital unlock is now available in your account!",
      });
    },
    onError: (error) => {
      playSound("error");
      toast({
        title: "Failed to Craft Item",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    craftableItems,
    craftedItems,
    loading: loadingCraftableItems || loadingCraftedItems,
    craftItem: craftItemMutation.mutate,
    isCrafting: craftItemMutation.isPending,
    canCraftItem: (itemId: string) => {
      const item = craftableItems.find(i => i.id === itemId);
      return item ? hasEnoughResources(item.recipe) : false;
    }
  };
};
