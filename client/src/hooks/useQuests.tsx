import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

export interface QuestComponent {
  id: number;
  name: string;
  description: string;
  imagePath: string | null;
  kitId: string | null;
  kitName: string | null;
  isRequired: boolean;
  quantity: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  missionBrief?: string | null;
  adventureLine: string;
  difficulty: number;
  orderInLine: number;
  xpReward: number;
  status: 'locked' | 'available' | 'completed' | 'in-progress';
  lootBoxRewards: {
    type: string;
    quantity: number;
  }[];
  content: {
    videos: string[];
    images: string[];
    codeBlocks: {
      language: string;
      code: string;
    }[];
  };
  componentRequirements?: QuestComponent[];
}

export interface QuestsByLine {
  [adventureLine: string]: Quest[];
}

export function useQuests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/quests'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // If the data is in the expected format, use it; otherwise, provide fallbacks
  const questsByAdventureLine: QuestsByLine = data?.questsByAdventureLine || {};
  const allQuests: Quest[] = data?.allQuests || Object.values(questsByAdventureLine).flat() || [];
  
  return {
    questsByAdventureLine,
    allQuests,
    loading: isLoading,
    error
  };
}

export function useQuestDetail(questId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/quests', questId],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!questId,
  });

  return {
    quest: data as Quest | null,
    loading: isLoading,
    error
  };
}