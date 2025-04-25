import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';

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
  componentRequirements?: {
    id: number;
    name: string;
    description: string;
    imagePath: string | null;
    kitId: string | null;
    kitName: string | null;
    isRequired: boolean;
    quantity: number;
  }[];
}

export interface QuestsByLine {
  [adventureLine: string]: Quest[];
}

export function useQuests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/quests'],
    queryFn: getQueryFn({ on401: 'throw' }),
  });

  const questsByAdventureLine: QuestsByLine = data?.questsByAdventureLine || {};
  
  return {
    questsByAdventureLine,
    allQuests: Object.values(questsByAdventureLine).flat(),
    loading: isLoading,
    error
  };
}

export function useQuestDetail(questId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/quests', questId],
    queryFn: getQueryFn({ on401: 'throw' }),
    enabled: !!questId,
  });

  return {
    quest: data as Quest,
    loading: isLoading,
    error
  };
}