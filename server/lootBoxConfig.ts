import { LootBoxType } from './lootBoxSystem';

// Define the loot box configuration interface
export interface LootBoxConfig {
  id: LootBoxType;
  name: string;
  description: string;
  image: string;
  rarity: string;
  weight: number; // For random selection
}

// Loot box configurations with proper images
export const lootBoxConfigs: LootBoxConfig[] = [
  {
    id: 'common',
    name: 'Common Loot Bag',
    description: 'A basic loot bag containing common materials and items.',
    image: '/images/lootboxes/common_lootbox.png',
    rarity: 'common',
    weight: 60
  },
  {
    id: 'uncommon',
    name: 'Uncommon Loot Bag',
    description: 'A loot bag containing uncommon materials and components.',
    image: '/images/lootboxes/uncommon_lootbox.png',
    rarity: 'uncommon',
    weight: 25
  },
  {
    id: 'rare',
    name: 'Rare Loot Bag',
    description: 'A loot bag containing rare materials and valuable components.',
    image: '/images/lootboxes/rare_lootbox.png',
    rarity: 'rare',
    weight: 10
  },
  {
    id: 'epic',
    name: 'Epic Loot Bag',
    description: 'A loot bag containing epic materials and rare components.',
    image: '/images/lootboxes/epic_lootbox.png',
    rarity: 'epic',
    weight: 4
  },
  {
    id: 'legendary',
    name: 'Legendary Loot Bag',
    description: 'A legendary loot bag containing the most valuable items and materials.',
    image: '/images/lootboxes/legendary_lootbox.png',
    rarity: 'legendary',
    weight: 1
  },
  {
    id: 'welcome',
    name: 'Welcome Kit',
    description: 'A special welcome package for new adventurers.',
    image: '/images/lootboxes/common_lootbox.png',
    rarity: 'common',
    weight: 0 // Not randomly awarded
  },
  {
    id: 'quest',
    name: 'Quest Reward Chest',
    description: 'A special reward chest for completing quest objectives.',
    image: '/images/lootboxes/quest_lootbox.png',
    rarity: 'quest',
    weight: 0 // Not randomly awarded
  },
  {
    id: 'event',
    name: 'Event Mystery Box',
    description: 'A special mystery box containing event-exclusive items.',
    image: '/images/lootboxes/event_lootbox.png',
    rarity: 'event',
    weight: 0 // Not randomly awarded
  }
];

// Helper function to get a loot box config by ID
export function getLootBoxConfig(id: LootBoxType): LootBoxConfig | undefined {
  return lootBoxConfigs.find(config => config.id === id);
}

// Helper function to get all loot box configs
export function getAllLootBoxConfigs(): LootBoxConfig[] {
  return lootBoxConfigs;
}