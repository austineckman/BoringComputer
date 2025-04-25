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

// Sample dummy data for development
const dummyQuests: Quest[] = [
  {
    id: '1',
    title: 'Introduction to Electronics',
    description: 'Begin your journey into electronics with this simple LED circuit project.',
    missionBrief: 'Create a basic LED circuit and make it light up.',
    adventureLine: 'Arduino',
    difficulty: 1,
    orderInLine: 1,
    xpReward: 100,
    status: 'available',
    lootBoxRewards: [{ type: 'common', quantity: 1 }],
    content: {
      videos: [],
      images: [],
      codeBlocks: []
    },
    componentRequirements: [
      {
        id: 1,
        name: 'Arduino Uno',
        description: 'Microcontroller board based on the ATmega328P',
        imagePath: null,
        kitId: 'arduino',
        kitName: 'Arduino Kit',
        isRequired: true,
        quantity: 1
      },
      {
        id: 2,
        name: 'LED',
        description: 'Light-emitting diode',
        imagePath: null,
        kitId: 'arduino',
        kitName: 'Arduino Kit',
        isRequired: true,
        quantity: 1
      }
    ]
  },
  {
    id: '2',
    title: 'Sensing Temperature',
    description: 'Learn how to read temperature using a sensor and Arduino.',
    missionBrief: 'Connect a temperature sensor to Arduino and display readings.',
    adventureLine: 'Arduino',
    difficulty: 2,
    orderInLine: 2,
    xpReward: 150,
    status: 'locked',
    lootBoxRewards: [{ type: 'common', quantity: 1 }],
    content: {
      videos: [],
      images: [],
      codeBlocks: []
    },
    componentRequirements: [
      {
        id: 1,
        name: 'Arduino Uno',
        description: 'Microcontroller board based on the ATmega328P',
        imagePath: null,
        kitId: 'arduino',
        kitName: 'Arduino Kit',
        isRequired: true,
        quantity: 1
      },
      {
        id: 3,
        name: 'Temperature Sensor',
        description: 'DHT11 or similar sensor',
        imagePath: null,
        kitId: 'arduino',
        kitName: 'Arduino Kit',
        isRequired: true,
        quantity: 1
      }
    ]
  },
  {
    id: '3',
    title: 'Hello Raspberry Pi',
    description: 'Get started with Raspberry Pi programming.',
    missionBrief: 'Set up your Raspberry Pi and write your first Python script.',
    adventureLine: 'Raspberry Pi',
    difficulty: 1,
    orderInLine: 1,
    xpReward: 120,
    status: 'available',
    lootBoxRewards: [{ type: 'common', quantity: 1 }],
    content: {
      videos: [],
      images: [],
      codeBlocks: []
    },
    componentRequirements: [
      {
        id: 4,
        name: 'Raspberry Pi',
        description: 'Single-board computer',
        imagePath: null,
        kitId: 'raspi',
        kitName: 'Raspberry Pi Kit',
        isRequired: true,
        quantity: 1
      }
    ]
  }
];

// Group sample quests by adventure line
const groupQuestsByLine = (quests: Quest[]): QuestsByLine => {
  return quests.reduce((acc, quest) => {
    const line = quest.adventureLine;
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

  if (data) {
    if (data.questsByAdventureLine && data.allQuests) {
      // If API returns data in the expected format
      questsByAdventureLine = data.questsByAdventureLine;
      allQuests = data.allQuests;
    } else if (Array.isArray(data)) {
      // If API returns an array of quests
      allQuests = data;
      questsByAdventureLine = groupQuestsByLine(data);
    } else if (typeof data === 'object') {
      // If API returns some other object format, try to extract quests
      if (data.quests && Array.isArray(data.quests)) {
        allQuests = data.quests;
        questsByAdventureLine = groupQuestsByLine(data.quests);
      }
    }
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