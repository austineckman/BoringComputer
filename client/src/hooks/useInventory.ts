import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface InventoryItem {
  type: string;
  quantity: number;
  lastAcquired?: string;
}

export interface InventoryHistory {
  type: string;
  quantity: number;
  action: "gained" | "used";
  source: string;
  date: string;
}

export const useInventory = () => {
  const { toast } = useToast();

  // Get user's inventory
  const { data: inventory = [], isLoading: loadingInventory } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    retry: false
  });

  // Get inventory history
  const { data: history = [], isLoading: loadingHistory } = useQuery<InventoryHistory[]>({
    queryKey: ['/api/inventory/history'],
    retry: false
  });

  // Check if user has enough resources for a recipe
  const hasEnoughResources = (requirements: { type: string, quantity: number }[]) => {
    const inventoryMap = inventory.reduce((acc, item) => {
      acc[item.type] = item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return requirements.every(req => (inventoryMap[req.type] || 0) >= req.quantity);
  };

  return {
    inventory,
    history,
    loading: loadingInventory || loadingHistory,
    hasEnoughResources,
    totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0)
  };
};
