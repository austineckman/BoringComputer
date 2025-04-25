import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath: string | null;
  category: string | null;
  difficulty: string | null;
}

export function useComponentKits() {
  const { data: kits, isLoading, error } = useQuery({
    queryKey: ['/api/kits'],
    queryFn: getQueryFn({ on401: 'throw' }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    kits: Array.isArray(kits) ? kits : [],
    loading: isLoading,
    error
  };
}