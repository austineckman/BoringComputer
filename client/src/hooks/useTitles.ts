import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface TitleData {
  titles: string[];
  activeTitle: string | null;
}

export function useTitles() {
  const { toast } = useToast();

  // Get titles
  const { data, isLoading, error } = useQuery<TitleData>({
    queryKey: ['/api/titles'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Set active title
  const setActiveTitleMutation = useMutation({
    mutationFn: async (title: string | null) => {
      const response = await apiRequest('PUT', '/api/titles/active', { title });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set active title');
      }
      return await response.json();
    },
    onSuccess: (data: TitleData) => {
      queryClient.setQueryData(['/api/titles'], data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Title updated',
        description: data.activeTitle 
          ? `You are now using the title "${data.activeTitle}"` 
          : 'Your title has been removed',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update title',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Unlock a new title
  const unlockTitleMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/titles/unlock', { title });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unlock title');
      }
      return await response.json();
    },
    onSuccess: (data: TitleData) => {
      queryClient.setQueryData(['/api/titles'], data);
      toast({
        title: 'New title unlocked!',
        description: 'You have unlocked a new title!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to unlock title',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    titles: data?.titles || [],
    activeTitle: data?.activeTitle,
    isLoading,
    error,
    setActiveTitle: (title: string | null) => setActiveTitleMutation.mutate(title),
    unlockTitle: (title: string) => unlockTitleMutation.mutate(title),
    isSetting: setActiveTitleMutation.isPending,
    isUnlocking: unlockTitleMutation.isPending,
  };
}