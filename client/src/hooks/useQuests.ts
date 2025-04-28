import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export interface QuestReward {
  type: string;
  quantity: number;
}

export interface Quest {
  id: string;
  date: string;
  title: string;
  description: string;
  adventureLine: string; // Changed from kitRequired
  difficulty: number;
  orderInLine: number; // New field
  xpReward: number; // New field
  rewards: QuestReward[];
  content?: {
    videos: string[];
    images: string[];
    codeBlocks: { language: string; code: string }[];
  };
}

export interface UserQuest extends Quest {
  status: "active" | "available" | "completed" | "upcoming" | "locked";
}

interface QuestResponse {
  questsByAdventureLine: Record<string, UserQuest[]>;
  allQuests: UserQuest[];
}

export const useQuests = () => {
  const { toast } = useToast();
  const { playSound } = useSoundEffects();

  // Get all quests
  const { 
    data: questData, 
    isLoading: loadingQuests,
    error: questsError
  } = useQuery<QuestResponse>({
    queryKey: ['/api/quests'],
    queryFn: getQueryFn(),
    retry: 2,
    // Add error handling
    onError: (error) => {
      console.error('Failed to fetch quests:', error);
    }
  });
  
  // Extract questsByAdventureLine from API response or create empty object
  const questsByAdventureLine = questData?.questsByAdventureLine || {};
  
  // Extract all quests or use empty array as fallback
  const allQuests = questData?.allQuests || [];

  // Get active quest
  const { 
    data: activeQuest, 
    isLoading: loadingActiveQuest 
  } = useQuery<Quest | null>({
    queryKey: ['/api/quests/active'],
    queryFn: getQueryFn(),
    retry: 1,
    initialData: null
  });

  // Start a quest
  const startQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const response = await apiRequest('POST', `/api/quests/${questId}/start`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests/active'] });
      playSound("questStart");
      toast({
        title: "Quest Started",
        description: "You've begun a new quest!",
      });
    },
    onError: (error) => {
      playSound("error");
      toast({
        title: "Failed to Start Quest",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Complete a quest
  const completeQuestMutation = useMutation({
    mutationFn: async (data: { questId: string, submission: string, image?: string }) => {
      const response = await apiRequest('POST', `/api/quests/${data.questId}/complete`, {
        submission: data.submission,
        image: data.image
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quests/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      
      // Play completion sound and then reward sound with a slight delay
      playSound("questComplete");
      setTimeout(() => playSound("reward"), 700);
      
      // Format reward message
      const rewardText = data.rewards?.length 
        ? data.rewards.map((r: { type: string; quantity: number }) => `${r.quantity}x ${r.type}`).join(', ')
        : 'experience points';
        
      toast({
        title: "Quest Completed!",
        description: `You've earned rewards: ${rewardText}`,
      });
    },
    onError: (error) => {
      playSound("error");
      toast({
        title: "Failed to Complete Quest",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    quests: allQuests,
    allQuests,
    questsByAdventureLine,
    activeQuest,
    loading: loadingQuests || loadingActiveQuest,
    startQuest: startQuestMutation.mutate,
    completeQuest: completeQuestMutation.mutate,
    isStarting: startQuestMutation.isPending,
    isCompleting: completeQuestMutation.isPending,
    error: questsError
  };
};
