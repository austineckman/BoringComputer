import { useQuery } from '@tanstack/react-query';

export interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  category: string;
  difficulty: string;
}

export function useComponentKits() {
  const { data: kits, isLoading, error } = useQuery({
    queryKey: ['/api/kits'],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    kits: Array.isArray(kits) ? kits : [],
    loading: isLoading,
    error
  };
}