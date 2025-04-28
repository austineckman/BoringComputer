import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

export interface GameItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  craftingUses: string[];
  imagePath: string;
  category?: string;
}

export const useItems = () => {
  const { 
    data: items, 
    isLoading: loading,
    error
  } = useQuery<GameItem[]>({
    queryKey: ['/api/items'],
    queryFn: getQueryFn(),
    retry: 1,
  });

  return {
    items,
    loading,
    error
  };
};