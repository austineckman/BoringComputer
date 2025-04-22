import { storage } from './storage';
import { LootBox, User } from '@shared/schema';

// Define rarity tiers with chance percentages and quantity ranges
export interface RarityTier {
  name: string;
  chance: number; // Percentage chance (0-100)
  quantityRange: [number, number]; // [min, max] values for quantity
  itemWeights: Record<string, number>; // Item weights within this rarity tier
}

// Define different loot box types
export type LootBoxType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'welcome' | 'quest' | 'event';

// Rarity tiers - chances should add up to 100 for each loot box type
const rarityTiers: Record<LootBoxType, RarityTier[]> = {
  common: [
    {
      name: 'common',
      chance: 75,
      quantityRange: [1, 3],
      itemWeights: {
        'cloth': 35,
        'metal': 35,
        'tech-scrap': 20,
        'circuit-board': 10,
        'sensor-crystal': 0,
        'alchemy-ink': 0
      }
    },
    {
      name: 'uncommon',
      chance: 20,
      quantityRange: [2, 4],
      itemWeights: {
        'cloth': 20,
        'metal': 20,
        'tech-scrap': 30,
        'circuit-board': 25,
        'sensor-crystal': 5,
        'alchemy-ink': 0
      }
    },
    {
      name: 'rare',
      chance: 5,
      quantityRange: [3, 5],
      itemWeights: {
        'cloth': 10,
        'metal': 10,
        'tech-scrap': 20,
        'circuit-board': 40,
        'sensor-crystal': 15,
        'alchemy-ink': 5
      }
    },
    {
      name: 'epic',
      chance: 0,
      quantityRange: [0, 0],
      itemWeights: {}
    },
    {
      name: 'legendary',
      chance: 0,
      quantityRange: [0, 0],
      itemWeights: {}
    }
  ],
  uncommon: [
    {
      name: 'common',
      chance: 55,
      quantityRange: [2, 4],
      itemWeights: {
        'cloth': 25,
        'metal': 25,
        'tech-scrap': 30,
        'circuit-board': 15,
        'sensor-crystal': 5,
        'alchemy-ink': 0
      }
    },
    {
      name: 'uncommon',
      chance: 35,
      quantityRange: [3, 5],
      itemWeights: {
        'cloth': 15,
        'metal': 15,
        'tech-scrap': 25,
        'circuit-board': 30,
        'sensor-crystal': 10,
        'alchemy-ink': 5
      }
    },
    {
      name: 'rare',
      chance: 10,
      quantityRange: [4, 6],
      itemWeights: {
        'cloth': 5,
        'metal': 5,
        'tech-scrap': 15,
        'circuit-board': 40,
        'sensor-crystal': 25,
        'alchemy-ink': 10
      }
    },
    {
      name: 'epic',
      chance: 0,
      quantityRange: [0, 0],
      itemWeights: {}
    },
    {
      name: 'legendary',
      chance: 0,
      quantityRange: [0, 0],
      itemWeights: {}
    }
  ],
  rare: [
    {
      name: 'common',
      chance: 30,
      quantityRange: [3, 5],
      itemWeights: {
        'cloth': 20,
        'metal': 20,
        'tech-scrap': 30,
        'circuit-board': 20,
        'sensor-crystal': 10,
        'alchemy-ink': 0
      }
    },
    {
      name: 'uncommon',
      chance: 45,
      quantityRange: [4, 6],
      itemWeights: {
        'cloth': 10,
        'metal': 10,
        'tech-scrap': 25,
        'circuit-board': 30,
        'sensor-crystal': 20,
        'alchemy-ink': 5
      }
    },
    {
      name: 'rare',
      chance: 20,
      quantityRange: [5, 7],
      itemWeights: {
        'cloth': 5,
        'metal': 5,
        'tech-scrap': 15,
        'circuit-board': 35,
        'sensor-crystal': 30,
        'alchemy-ink': 10
      }
    },
    {
      name: 'epic',
      chance: 5,
      quantityRange: [6, 8],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 5,
        'circuit-board': 20,
        'sensor-crystal': 45,
        'alchemy-ink': 30
      }
    },
    {
      name: 'legendary',
      chance: 0,
      quantityRange: [0, 0],
      itemWeights: {}
    }
  ],
  epic: [
    {
      name: 'common',
      chance: 10,
      quantityRange: [4, 6],
      itemWeights: {
        'cloth': 15,
        'metal': 15,
        'tech-scrap': 30,
        'circuit-board': 25,
        'sensor-crystal': 10,
        'alchemy-ink': 5
      }
    },
    {
      name: 'uncommon',
      chance: 25,
      quantityRange: [5, 7],
      itemWeights: {
        'cloth': 5,
        'metal': 5,
        'tech-scrap': 20,
        'circuit-board': 35,
        'sensor-crystal': 25,
        'alchemy-ink': 10
      }
    },
    {
      name: 'rare',
      chance: 40,
      quantityRange: [6, 8],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 10,
        'circuit-board': 30,
        'sensor-crystal': 40,
        'alchemy-ink': 20
      }
    },
    {
      name: 'epic',
      chance: 20,
      quantityRange: [7, 9],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 5,
        'circuit-board': 15,
        'sensor-crystal': 45,
        'alchemy-ink': 35
      }
    },
    {
      name: 'legendary',
      chance: 5,
      quantityRange: [8, 10],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 0,
        'circuit-board': 5,
        'sensor-crystal': 45,
        'alchemy-ink': 50
      }
    }
  ],
  legendary: [
    {
      name: 'common',
      chance: 0,
      quantityRange: [0, 0],
      itemWeights: {}
    },
    {
      name: 'uncommon',
      chance: 10,
      quantityRange: [6, 8],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 15,
        'circuit-board': 40,
        'sensor-crystal': 30,
        'alchemy-ink': 15
      }
    },
    {
      name: 'rare',
      chance: 30,
      quantityRange: [7, 9],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 5,
        'circuit-board': 25,
        'sensor-crystal': 40,
        'alchemy-ink': 30
      }
    },
    {
      name: 'epic',
      chance: 40,
      quantityRange: [8, 10],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 0,
        'circuit-board': 15,
        'sensor-crystal': 40,
        'alchemy-ink': 45
      }
    },
    {
      name: 'legendary',
      chance: 20,
      quantityRange: [10, 15],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 0,
        'circuit-board': 5,
        'sensor-crystal': 35,
        'alchemy-ink': 60
      }
    }
  ],
  welcome: [
    {
      name: 'uncommon',
      chance: 50,
      quantityRange: [3, 5],
      itemWeights: {
        'cloth': 20,
        'metal': 20,
        'tech-scrap': 30,
        'circuit-board': 20,
        'sensor-crystal': 8,
        'alchemy-ink': 2
      }
    },
    {
      name: 'rare',
      chance: 50,
      quantityRange: [3, 5],
      itemWeights: {
        'cloth': 10,
        'metal': 10,
        'tech-scrap': 25,
        'circuit-board': 30,
        'sensor-crystal': 15,
        'alchemy-ink': 10
      }
    }
  ],
  quest: [
    {
      name: 'common',
      chance: 40,
      quantityRange: [2, 4],
      itemWeights: {
        'cloth': 25,
        'metal': 25,
        'tech-scrap': 30,
        'circuit-board': 15,
        'sensor-crystal': 5,
        'alchemy-ink': 0
      }
    },
    {
      name: 'uncommon',
      chance: 35,
      quantityRange: [3, 5],
      itemWeights: {
        'cloth': 15,
        'metal': 15,
        'tech-scrap': 30,
        'circuit-board': 25,
        'sensor-crystal': 10,
        'alchemy-ink': 5
      }
    },
    {
      name: 'rare',
      chance: 20,
      quantityRange: [4, 6],
      itemWeights: {
        'cloth': 5,
        'metal': 5,
        'tech-scrap': 20,
        'circuit-board': 35,
        'sensor-crystal': 25,
        'alchemy-ink': 10
      }
    },
    {
      name: 'epic',
      chance: 5,
      quantityRange: [5, 7],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 10,
        'circuit-board': 30,
        'sensor-crystal': 35,
        'alchemy-ink': 25
      }
    }
  ],
  event: [
    {
      name: 'rare',
      chance: 40,
      quantityRange: [4, 6],
      itemWeights: {
        'cloth': 5,
        'metal': 5,
        'tech-scrap': 15,
        'circuit-board': 35,
        'sensor-crystal': 25,
        'alchemy-ink': 15
      }
    },
    {
      name: 'epic',
      chance: 40,
      quantityRange: [5, 8],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 5,
        'circuit-board': 25,
        'sensor-crystal': 40,
        'alchemy-ink': 30
      }
    },
    {
      name: 'legendary',
      chance: 20,
      quantityRange: [6, 10],
      itemWeights: {
        'cloth': 0,
        'metal': 0,
        'tech-scrap': 0,
        'circuit-board': 10,
        'sensor-crystal': 40,
        'alchemy-ink': 50
      }
    }
  ]
};

// Define reward types and structure
export interface Reward {
  type: string;
  quantity: number;
}

/**
 * Generate a random number between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select a rarity tier based on the loot box type and random chance
 */
function selectRarityTier(lootBoxType: LootBoxType): RarityTier {
  const tiers = rarityTiers[lootBoxType];
  const randomNum = getRandomInt(1, 100);
  
  let cumulativeChance = 0;
  for (const tier of tiers) {
    cumulativeChance += tier.chance;
    if (randomNum <= cumulativeChance) {
      return tier;
    }
  }
  
  // Fallback to the first tier if something goes wrong
  return tiers[0];
}

/**
 * Select an item based on the weights defined in the rarity tier
 */
function selectItem(tier: RarityTier): string {
  const itemWeights = tier.itemWeights;
  const items = Object.keys(itemWeights);
  const weights = Object.values(itemWeights);
  
  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Random number between 0 and total weight
  const randomNum = getRandomInt(1, totalWeight);
  
  let cumulativeWeight = 0;
  for (let i = 0; i < items.length; i++) {
    cumulativeWeight += weights[i];
    if (randomNum <= cumulativeWeight) {
      return items[i];
    }
  }
  
  // Fallback to the first item if something goes wrong
  return items[0];
}

/**
 * Generate a quantity based on the rarity tier's range
 */
function generateQuantity(tier: RarityTier): number {
  return getRandomInt(tier.quantityRange[0], tier.quantityRange[1]);
}

/**
 * Generate rewards for a loot box
 * @param lootBoxType The type of loot box
 * @returns Array of rewards
 */
export function generateLootBoxRewards(lootBoxType: LootBoxType): Reward[] {
  const rewards: Reward[] = [];
  
  // Different box types have different number of items
  const numItems = lootBoxType === 'legendary' ? 3 :
                  lootBoxType === 'epic' ? 2 :
                  lootBoxType === 'event' ? 2 : 1;
  
  for (let i = 0; i < numItems; i++) {
    const tier = selectRarityTier(lootBoxType);
    const itemType = selectItem(tier);
    const quantity = generateQuantity(tier);
    
    rewards.push({
      type: itemType,
      quantity
    });
  }
  
  return rewards;
}

/**
 * Opens a loot box and adds the rewards to the user's inventory
 * @param lootBoxId The ID of the loot box to open
 * @param userId The ID of the user opening the box
 * @returns The rewards given to the user
 */
export async function openLootBox(lootBoxId: number, userId: number): Promise<{ success: boolean, message: string, rewards: Reward[] | null }> {
  try {
    // Get the loot box from storage
    const lootBox = await storage.getLootBox(lootBoxId);
    
    if (!lootBox) {
      return { success: false, message: "Loot box not found", rewards: null };
    }
    
    if (lootBox.userId !== userId) {
      return { success: false, message: "You do not own this loot box", rewards: null };
    }
    
    if (lootBox.opened) {
      return { success: false, message: "Loot box already opened", rewards: null };
    }
    
    // Generate rewards based on the loot box type
    const rewards = generateLootBoxRewards(lootBox.type as LootBoxType);
    
    // Update the loot box to mark it as opened
    await storage.updateLootBox(lootBoxId, {
      opened: true,
      openedAt: new Date()
    });
    
    // Add the rewards to the user's inventory
    for (const reward of rewards) {
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        console.error(`User with ID ${userId} not found`);
        continue;
      }
      
      // Update the user's inventory
      const currentInventory = user.inventory || {};
      const currentAmount = currentInventory[reward.type] || 0;
      
      // Update user inventory
      await storage.updateUser(userId, {
        inventory: {
          ...currentInventory,
          [reward.type]: currentAmount + reward.quantity
        }
      });
      
      // Add entry to inventory history
      await storage.createInventoryHistory({
        userId,
        type: reward.type,
        quantity: reward.quantity,
        action: 'gained',
        source: `${lootBox.type} Loot Crate`
      });
    }
    
    return { success: true, message: "Loot box opened successfully", rewards };
  } catch (error) {
    console.error("Error opening loot box:", error);
    return { success: false, message: "Error opening loot box", rewards: null };
  }
}

// Export also individual selectors for testing or custom implementations
export const lootBoxSelectors = {
  selectRarityTier,
  selectItem,
  generateQuantity
};