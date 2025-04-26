import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';

// Types
export interface QuestRequirement {
  id: number;
  questId: number;
  componentId: number;
  quantity: number;
  component: {
    id: number;
    name: string;
    description: string;
    imagePath: string | null;
    kitId: string;
  };
}

export interface Quest {
  id: string;
  title: string; 
  description: string;
  missionBrief: string | null;
  adventureLine: string;
  difficulty: number;
  orderInLine: number;
  xpReward: number;
  status?: 'locked' | 'available' | 'completed' | 'in-progress';
  kitId: string | null;
  componentRequirements: QuestRequirement[];
  kit?: {
    id: string;
    name: string;
    description: string;
    imagePath: string | null;
    category: string;
    difficulty: string;
  } | null;
}

export interface QuestData {
  questsByAdventureLine: Record<string, Quest[]>;
  allQuests: Quest[];
}

// Hook to fetch all quests
export const useQuests = () => {
  const result = useQuery<QuestData>({
    queryKey: ['/api/quests'],
  });
  
  return {
    ...result,
    questsByAdventureLine: result.data?.questsByAdventureLine || {},
    allQuests: result.data?.allQuests || [],
    loading: result.isLoading
  };
};

// Hook to fetch a specific quest
export const useQuest = (questId: string) => {
  return useQuery<{ quest: Quest }>({
    queryKey: ['/api/quests', questId],
    enabled: !!questId,
  });
};

// Hook to fetch active quest
export const useActiveQuest = () => {
  return useQuery<Quest>({
    queryKey: ['/api/quests/active'],
  });
};

// Hook to start a quest
export const useStartQuest = () => {
  const mutation = useMutation({
    mutationFn: async ({ questId }: { questId: string }) => {
      const response = await fetch(`/api/quests/${questId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to start quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests/active'] });
    },
  });
  
  return mutation;
};

// Hook to complete a quest
export const useCompleteQuest = () => {
  const mutation = useMutation({
    mutationFn: async ({ questId, submission, image }: { questId: string, submission: string, image?: string }) => {
      const response = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submission, image }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests/active'] });
    },
  });
  
  return mutation;
};

// For admin functionalities
export const useAdminQuests = () => {
  return useQuery<Quest[]>({
    queryKey: ['/api/admin/quests'],
  });
};

// Create a new quest (admin)
export const useCreateQuest = () => {
  const mutation = useMutation({
    mutationFn: async (questData: Omit<Quest, 'id'>) => {
      const response = await fetch('/api/admin/quests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
  });
  
  return mutation;
};

// Update an existing quest (admin)
export const useUpdateQuest = () => {
  const mutation = useMutation({
    mutationFn: async ({ questId, questData }: { questId: string, questData: Partial<Quest> }) => {
      const response = await fetch(`/api/admin/quests/${questId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
  });
  
  return mutation;
};

// Delete a quest (admin)
export const useDeleteQuest = () => {
  const mutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await fetch(`/api/admin/quests/${questId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete quest');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/admin/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
    },
  });
  
  return mutation;
};