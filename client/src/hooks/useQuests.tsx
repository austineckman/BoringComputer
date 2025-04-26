import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '../lib/queryClient';

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
  status?: 'locked' | 'available' | 'completed' | 'in-progress';
  // This field in the database directly links quests to kits
  kitId?: string | null;
  lootBoxRewards?: {
    type: string;
    quantity: number;
  }[];
  content?: {
    videos: string[];
    images: string[];
    codeBlocks: {
      language: string;
      code: string;
    }[];
  };
  // Component requirements with typing from IStorage interface
  componentRequirements?: QuestComponent[];
}

export interface QuestsByLine {
  [adventureLine: string]: Quest[];
}

// Group quests by adventure line
const groupQuestsByLine = (quests: Quest[]): QuestsByLine => {
  return quests.reduce((acc, quest) => {
    const line = quest.adventureLine || 'Uncategorized';
    if (!acc[line]) {
      acc[line] = [];
    }
    acc[line].push(quest);
    return acc;
  }, {} as QuestsByLine);
};

export function useQuests() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/quests'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Process the data from the API
  let questsByAdventureLine: QuestsByLine = {};
  let allQuests: Quest[] = [];

  // Log the raw data for debugging
  console.log('Raw quest data from API:', data);
  
  // More detailed debugging for quests with component requirements or kitId
  if (data && data.allQuests && Array.isArray(data.allQuests)) {
    const questsWithKitId = data.allQuests.filter(q => q.kitId);
    const questsWithComponents = data.allQuests.filter(q => q.componentRequirements && q.componentRequirements.length > 0);
    
    if (questsWithKitId.length > 0) {
      console.log('Quests with direct kitId:', questsWithKitId.map(q => ({
        id: q.id,
        title: q.title,
        kitId: q.kitId
      })));
    } else {
      console.warn('No quests found with direct kitId');
    }
    
    if (questsWithComponents.length > 0) {
      console.log('Quests with component requirements:', questsWithComponents.map(q => ({
        id: q.id,
        title: q.title,
        componentCount: q.componentRequirements?.length || 0,
        components: q.componentRequirements?.map(c => ({
          id: c.id,
          name: c.name,
          kitId: c.kitId
        }))
      })));
    } else {
      console.warn('No quests found with component requirements');
    }
  }

  if (data) {
    // Process data based on its structure
    if (data.questsByAdventureLine && data.allQuests) {
      // If API returns data in the expected format with both grouped and all quests
      questsByAdventureLine = data.questsByAdventureLine;
      allQuests = data.allQuests;
      console.log('Using data in expected format:',
        `Adventure lines: ${Object.keys(questsByAdventureLine).length}`,
        `Total quests: ${allQuests.length}`);
    } else if (Array.isArray(data)) {
      // If API returns a simple array of quests
      allQuests = data.map(quest => ({
        ...quest,
        // Ensure componentRequirements exists even if not provided
        componentRequirements: quest.componentRequirements || []
      }));
      questsByAdventureLine = groupQuestsByLine(allQuests);
      console.log('Using data as array:', `Total quests: ${allQuests.length}`);
    } else if (typeof data === 'object') {
      // If API returns some other object format, try to extract quests
      if (data.quests && Array.isArray(data.quests)) {
        allQuests = data.quests.map(quest => ({
          ...quest,
          componentRequirements: quest.componentRequirements || []
        }));
        questsByAdventureLine = groupQuestsByLine(allQuests);
        console.log('Using data.quests:', `Total quests: ${allQuests.length}`);
      } else {
        console.warn('Unexpected data format from API:', data);
        // Try to extract any array that might contain quests
        const potentialQuestArrays = Object.values(data).filter(
          value => Array.isArray(value) && value.length > 0 && 
            typeof value[0] === 'object' && value[0] !== null && 'title' in value[0]
        ) as Array<any[]>;
        
        if (potentialQuestArrays.length > 0) {
          // Use the largest array that looks like it contains quests
          const largestArray = potentialQuestArrays.reduce<any[]>((a, b) => 
            a.length > b.length ? a : b, []);
          
          allQuests = largestArray.map(quest => ({
            ...quest,
            componentRequirements: quest.componentRequirements || []
          }));
          questsByAdventureLine = groupQuestsByLine(allQuests);
          console.log('Using extracted quest array:', `Total quests: ${allQuests.length}`);
        }
      }
    } else {
      console.warn('Unexpected data type from API:', typeof data);
    }
  } else {
    console.warn('No data received from API');
  }
  
  // Log the processed data
  console.log('Processed quest data:', { 
    quests: allQuests.length, 
    adventureLines: Object.keys(questsByAdventureLine)
  });
  
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