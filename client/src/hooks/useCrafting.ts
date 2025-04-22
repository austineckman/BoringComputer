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
  name: string;
  description: string;
  image: string;
  type: "physical" | "digital";
  dateCrafted: string;
  status: "pending" | "shipping" | "shipped" | "delivered" | "unlocked" | "redeemed";
  tracking?: string;
  address?: string;
  redemptionData?: {
    code?: string;
    redeemedOn?: string;
    [key: string]: any;
  };
  redeemedAt?: string;
  shippingInfo?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    [key: string]: any;
  };
}

export const useCrafting = () => {
  const { toast } = useToast();
  const { sounds } = useSoundEffects();
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
      
      sounds.success?.();
      toast({
        title: "Item Crafted!",
        description: data.type === "physical"
          ? "Your item will be shipped to you soon!"
          : "Digital unlock is now available in your account!",
      });
    },
    onError: (error) => {
      sounds.error?.();
      toast({
        title: "Failed to Craft Item",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Function to manually refetch crafted items
  const fetchCraftedItems = () => {
    return queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
  };

  // Redeem a digital item
  const redeemItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await apiRequest('POST', `/api/crafted-items/${itemId}/redeem`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
      sounds.success?.();
    },
    onError: (error) => {
      sounds.error?.();
      toast({
        title: "Failed to Redeem Item",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Submit shipping information for a physical item
  const submitShippingMutation = useMutation({
    mutationFn: async ({ itemId, shippingInfo }: { itemId: string, shippingInfo: any }) => {
      const response = await apiRequest('POST', `/api/crafted-items/${itemId}/ship`, shippingInfo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crafted-items'] });
      sounds.success?.();
      toast({
        title: "Shipping Information Submitted",
        description: "Your item will be shipped soon!",
        variant: "default",
      });
    },
    onError: (error) => {
      sounds.error?.();
      toast({
        title: "Failed to Submit Shipping Information",
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
    redeemItem: redeemItemMutation.mutate,
    submitShipping: submitShippingMutation.mutate,
    isRedeeming: redeemItemMutation.isPending,
    isSubmittingShipping: submitShippingMutation.isPending,
    isCrafting: craftItemMutation.isPending,
    fetchCraftedItems,
    canCraftItem: (itemId: string) => {
      const item = craftableItems.find(i => i.id === itemId);
      return item ? hasEnoughResources(item.recipe) : false;
    }
  };
};
