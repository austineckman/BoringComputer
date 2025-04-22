import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface InventoryItem {
  // Core fields (backwards compatible)
  id: string;
  type: string;
  quantity: number;
  lastAcquired?: string;
  
  // Enhanced item details (matching storage interface and database)
  name: string;
  description: string;
  flavorText: string;
  rarity: ItemRarity;
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

export interface InventoryHistory {
  id?: string;
  type: string;
  quantity: number;
  action: "gained" | "used";
  source: string;
  date: string;
}

export const useInventory = () => {
  const { toast } = useToast();

  // Get user's inventory with enhanced item details
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

  // Get an item by its type
  const getItemByType = (type: string) => {
    return inventory.find(item => item.type === type);
  };

  // Get an item by its id
  const getItemById = (id: string) => {
    return inventory.find(item => item.id === id);
  };

  return {
    inventory,
    history,
    loading: loadingInventory || loadingHistory,
    hasEnoughResources,
    totalItems: inventory.reduce((sum, item) => sum + item.quantity, 0),
    getItemByType,
    getItemById
  };
};
