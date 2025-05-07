import { useQuery } from "@tanstack/react-query";

export interface LootBoxConfig {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'welcome' | 'quest' | 'event';
  itemDropTable: Array<{
    itemId: string;
    weight: number;
    minQuantity: number;
    maxQuantity: number;
  }>;
  minRewards: number;
  maxRewards: number;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useLootBoxConfigs() {
  const { data, isLoading, error } = useQuery<LootBoxConfig[]>({
    queryKey: ['/api/lootboxes/configs'],
    // Use a fallback if the API call fails
    enabled: true,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("Lootbox configs loaded:", data);

  // Convert the array to a record for easier lookup
  const lootBoxConfigsMap = data?.reduce<Record<string, LootBoxConfig>>((acc, config) => {
    acc[config.id] = config;
    return acc;
  }, {}) || {};

  return {
    lootBoxConfigs: data || [],
    lootBoxConfigsMap,
    isLoading,
    error
  };
}

// Helper function to get a lootbox config by ID
export function getLootBoxConfigById(configs: Record<string, LootBoxConfig>, id: string): LootBoxConfig | undefined {
  return configs[id];
}

// Helper function to get appropriate rarity color class
export function getRarityColorClass(rarity?: string): string {
  switch (rarity?.toLowerCase()) {
    case 'common':
      return 'bg-gray-600/50 text-gray-200';
    case 'uncommon':
      return 'bg-green-600/50 text-green-200';
    case 'rare':
      return 'bg-blue-600/50 text-blue-200';
    case 'epic':
      return 'bg-purple-600/50 text-purple-200';
    case 'legendary':
      return 'bg-yellow-600/50 text-yellow-200';
    case 'welcome':
      return 'bg-teal-600/50 text-teal-200';
    case 'quest':
      return 'bg-brand-orange/50 text-orange-200';
    case 'event':
      return 'bg-pink-600/50 text-pink-200';
    default:
      return 'bg-gray-600/50 text-gray-200';
  }
}