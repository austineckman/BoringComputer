import { db } from './db';
import { storage } from './storage';
import { lootBoxConfigs, lootBoxes, items, eq } from '@shared/schema';
import { getItemDetails } from './itemDatabase';

export interface RarityTier {
  name: string;
  chance: number; // Percentage chance (0-100)
  quantityRange: [number, number]; // [min, max] values for quantity
  itemWeights: Record<string, number>; // Item weights within this rarity tier
}

export type LootBoxType = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'welcome' | 'quest' | 'event';

export interface Reward {
  type: string;
  id: string;
  quantity: number;
}

/**
 * Generate a random number between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select a rarity tier based on the lootbox type and random chance
 */
function selectRarityTier(lootBoxType: LootBoxType): RarityTier {
  // Lootbox drop rates based on type
  const rarityTiers: Record<LootBoxType, RarityTier[]> = {
    common: [
      { name: 'common', chance: 80, quantityRange: [1, 2], itemWeights: { 'copper': 50, 'cloth': 30, 'techscrap': 20 } },
      { name: 'uncommon', chance: 18, quantityRange: [1, 1], itemWeights: { 'circuit': 60, 'crystal': 40 } },
      { name: 'rare', chance: 2, quantityRange: [1, 1], itemWeights: { 'emerald': 100 } },
      { name: 'epic', chance: 0, quantityRange: [0, 0], itemWeights: {} },
      { name: 'legendary', chance: 0, quantityRange: [0, 0], itemWeights: {} }
    ],
    uncommon: [
      { name: 'common', chance: 60, quantityRange: [1, 3], itemWeights: { 'copper': 40, 'cloth': 30, 'techscrap': 30 } },
      { name: 'uncommon', chance: 35, quantityRange: [1, 2], itemWeights: { 'circuit': 55, 'crystal': 45 } },
      { name: 'rare', chance: 5, quantityRange: [1, 1], itemWeights: { 'emerald': 80, 'ruby': 20 } },
      { name: 'epic', chance: 0, quantityRange: [0, 0], itemWeights: {} },
      { name: 'legendary', chance: 0, quantityRange: [0, 0], itemWeights: {} }
    ],
    rare: [
      { name: 'common', chance: 40, quantityRange: [2, 4], itemWeights: { 'copper': 30, 'cloth': 30, 'techscrap': 40 } },
      { name: 'uncommon', chance: 40, quantityRange: [1, 3], itemWeights: { 'circuit': 50, 'crystal': 50 } },
      { name: 'rare', chance: 18, quantityRange: [1, 1], itemWeights: { 'emerald': 60, 'ruby': 30, 'sapphire': 10 } },
      { name: 'epic', chance: 2, quantityRange: [1, 1], itemWeights: { 'diamond': 100 } },
      { name: 'legendary', chance: 0, quantityRange: [0, 0], itemWeights: {} }
    ],
    epic: [
      { name: 'common', chance: 20, quantityRange: [3, 5], itemWeights: { 'copper': 25, 'cloth': 25, 'techscrap': 50 } },
      { name: 'uncommon', chance: 50, quantityRange: [2, 3], itemWeights: { 'circuit': 50, 'crystal': 50 } },
      { name: 'rare', chance: 25, quantityRange: [1, 2], itemWeights: { 'emerald': 40, 'ruby': 30, 'sapphire': 30 } },
      { name: 'epic', chance: 5, quantityRange: [1, 1], itemWeights: { 'diamond': 90, 'obsidian': 10 } },
      { name: 'legendary', chance: 0.1, quantityRange: [1, 1], itemWeights: { 'artifact': 100 } }
    ],
    legendary: [
      { name: 'common', chance: 0, quantityRange: [5, 8], itemWeights: { 'copper': 20, 'cloth': 20, 'techscrap': 60 } },
      { name: 'uncommon', chance: 40, quantityRange: [3, 5], itemWeights: { 'circuit': 40, 'crystal': 60 } },
      { name: 'rare', chance: 40, quantityRange: [1, 3], itemWeights: { 'emerald': 30, 'ruby': 30, 'sapphire': 40 } },
      { name: 'epic', chance: 18, quantityRange: [1, 1], itemWeights: { 'diamond': 80, 'obsidian': 20 } },
      { name: 'legendary', chance: 2, quantityRange: [1, 1], itemWeights: { 'artifact': 70, 'cosmiccore': 30 } }
    ],
    welcome: [
      { name: 'common', chance: 70, quantityRange: [2, 3], itemWeights: { 'copper': 40, 'cloth': 40, 'techscrap': 20 } },
      { name: 'uncommon', chance: 30, quantityRange: [1, 1], itemWeights: { 'circuit': 70, 'crystal': 30 } },
      { name: 'rare', chance: 0, quantityRange: [0, 0], itemWeights: {} },
      { name: 'epic', chance: 0, quantityRange: [0, 0], itemWeights: {} },
      { name: 'legendary', chance: 0, quantityRange: [0, 0], itemWeights: {} }
    ],
    quest: [
      { name: 'common', chance: 50, quantityRange: [2, 4], itemWeights: { 'copper': 30, 'cloth': 30, 'techscrap': 40 } },
      { name: 'uncommon', chance: 35, quantityRange: [1, 2], itemWeights: { 'circuit': 60, 'crystal': 40 } },
      { name: 'rare', chance: 15, quantityRange: [1, 1], itemWeights: { 'emerald': 70, 'ruby': 30 } },
      { name: 'epic', chance: 0, quantityRange: [0, 0], itemWeights: {} },
      { name: 'legendary', chance: 0, quantityRange: [0, 0], itemWeights: {} }
    ],
    event: [
      { name: 'common', chance: 30, quantityRange: [3, 5], itemWeights: { 'copper': 25, 'cloth': 25, 'techscrap': 50 } },
      { name: 'uncommon', chance: 45, quantityRange: [2, 3], itemWeights: { 'circuit': 45, 'crystal': 55 } },
      { name: 'rare', chance: 20, quantityRange: [1, 2], itemWeights: { 'emerald': 50, 'ruby': 30, 'sapphire': 20 } },
      { name: 'epic', chance: 5, quantityRange: [1, 1], itemWeights: { 'diamond': 100 } },
      { name: 'legendary', chance: 0, quantityRange: [0, 0], itemWeights: {} }
    ]
  };

  const tiers = rarityTiers[lootBoxType];
  const randomValue = Math.random() * 100;
  
  let cumulativeChance = 0;
  for (const tier of tiers) {
    cumulativeChance += tier.chance;
    if (randomValue <= cumulativeChance) {
      return tier;
    }
  }
  
  // Fallback to common tier if no tier was selected
  return tiers[0];
}

/**
 * Select an item based on the weights defined in the rarity tier
 */
function selectItem(tier: RarityTier): string {
  const weights = tier.itemWeights;
  const items = Object.keys(weights);
  
  if (items.length === 0) {
    throw new Error(`No items defined for rarity tier ${tier.name}`);
  }
  
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const randomValue = Math.random() * totalWeight;
  
  let cumulativeWeight = 0;
  for (const item of items) {
    cumulativeWeight += weights[item];
    if (randomValue <= cumulativeWeight) {
      return item;
    }
  }
  
  // Fallback to first item
  return items[0];
}

/**
 * Generate a quantity based on the rarity tier's range
 */
function generateQuantity(tier: RarityTier): number {
  const [min, max] = tier.quantityRange;
  return getRandomInt(min, max);
}

/**
 * Generate rewards for a lootbox based on configurations in database
 * @param lootBoxType The type of lootbox
 * @returns Array of rewards
 */
export async function generateLootBoxRewards(lootBoxType: LootBoxType): Promise<Reward[]> {
  try {
    // Check if this lootbox type has a database config
    const [config] = await db
      .select()
      .from(lootBoxConfigs)
      .where(eq(lootBoxConfigs.id, lootBoxType));
    
    // If we have a database config, use it instead of the hardcoded logic
    if (config) {
      return generateConfiguredLootBoxRewards(config);
    }
    
    // Otherwise fall back to the hardcoded logic
    const numberOfRewards = getRandomInt(1, 3); // Generate 1-3 rewards
    const rewards: Reward[] = [];
    
    for (let i = 0; i < numberOfRewards; i++) {
      const tier = selectRarityTier(lootBoxType);
      const itemId = selectItem(tier);
      const quantity = generateQuantity(tier);
      
      // Skip if quantity is 0
      if (quantity === 0) continue;
      
      rewards.push({
        type: 'item',
        id: itemId,
        quantity
      });
    }
    
    return rewards;
  } catch (error) {
    console.error('Error generating lootbox rewards:', error);
    // Return a default reward if there's an error
    return [{ type: 'item', id: 'copper', quantity: 1 }];
  }
}

/**
 * Opens a lootbox and adds the rewards to the user's inventory
 * @param lootBoxId The ID of the lootbox to open
 * @param userId The ID of the user opening the box
 * @returns The rewards given to the user
 */
export async function openLootBox(lootBoxId: number, userId: number): Promise<{ success: boolean, message: string, rewards: Reward[] | null }> {
  try {
    // Fetch the lootbox
    const [lootbox] = await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.id, lootBoxId))
      .where(eq(lootBoxes.userId, userId));
    
    if (!lootbox) {
      return { success: false, message: 'Lootbox not found', rewards: null };
    }
    
    if (lootbox.opened) {
      return { success: false, message: 'Lootbox has already been opened', rewards: null };
    }
    
    // Get the user's data
    const user = await storage.getUser(userId);
    if (!user) {
      return { success: false, message: 'User not found', rewards: null };
    }
    
    // Generate rewards for this lootbox
    let rewards: Reward[];
    
    // If the lootbox already has rewards (from a saved state), use those
    if (lootbox.rewards && lootbox.rewards.length > 0) {
      rewards = lootbox.rewards as Reward[];
    } else {
      // Otherwise, generate new rewards
      rewards = await generateLootBoxRewards(lootbox.type as LootBoxType);
    }
    
    // Add the rewards to the user's inventory
    const inventory = { ...user.inventory };
    
    for (const reward of rewards) {
      // For items and equipment, add directly to inventory
      if (reward.type === 'item' || reward.type === 'equipment') {
        inventory[reward.id] = (inventory[reward.id] || 0) + reward.quantity;
        
        // Create inventory history entry
        await storage.createInventoryHistory({
          userId,
          type: reward.id,
          quantity: reward.quantity,
          action: 'gained',
          source: 'lootbox'
        });
      }
    }
    
    // Mark the lootbox as opened and store the rewards
    await db
      .update(lootBoxes)
      .set({
        opened: true,
        openedAt: new Date(),
        rewards
      })
      .where(eq(lootBoxes.id, lootBoxId));
    
    // Update the user's inventory
    await storage.updateUser(userId, { inventory });
    
    return { success: true, message: 'Lootbox opened successfully', rewards };
  } catch (error) {
    console.error('Error opening lootbox:', error);
    return { success: false, message: 'An error occurred while opening the lootbox', rewards: null };
  }
}

/**
 * Generate rewards from a lootbox configuration
 * @param config The lootbox configuration object
 * @returns Array of rewards
 */
async function generateConfiguredLootBoxRewards(config: any): Promise<Reward[]> {
  const numRewards = getRandomInt(config.minRewards, config.maxRewards);
  const rewards: Reward[] = [];
  
  // Get all items from the database for validation
  const allItems = await db.select().from(items);
  const allItemIds = allItems.map(item => item.id);
  
  // Generate rewards based on the item drop table
  for (let i = 0; i < numRewards; i++) {
    // Calculate total weight
    const totalWeight = config.itemDropTable.reduce((sum: number, item: any) => sum + item.weight, 0);
    
    // Select an item based on weight
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    
    for (const itemEntry of config.itemDropTable) {
      cumulativeWeight += itemEntry.weight;
      
      if (randomValue <= cumulativeWeight) {
        // Make sure the item exists
        if (allItemIds.includes(itemEntry.itemId)) {
          // Generate a random quantity
          const quantity = getRandomInt(itemEntry.minQuantity, itemEntry.maxQuantity);
          
          rewards.push({
            type: 'item',
            id: itemEntry.itemId,
            quantity
          });
        }
        break;
      }
    }
  }
  
  // If we somehow ended up with no rewards, add a default item
  if (rewards.length === 0) {
    rewards.push({
      type: 'item',
      id: 'copper',
      quantity: 1
    });
  }
  
  return rewards;
}

// Helper function to get predefined lootbox config selectors
export const lootBoxSelectors = {
  // Returns selectors for dropdown menus in the admin panel
  getSelectors() {
    return {
      types: [
        { label: 'Common Crate', value: 'common' },
        { label: 'Uncommon Crate', value: 'uncommon' },
        { label: 'Rare Crate', value: 'rare' },
        { label: 'Epic Crate', value: 'epic' },
        { label: 'Legendary Crate', value: 'legendary' },
        { label: 'Welcome Package', value: 'welcome' },
        { label: 'Quest Reward', value: 'quest' },
        { label: 'Event Prize', value: 'event' }
      ],
      rarities: [
        { label: 'Common', value: 'common' },
        { label: 'Uncommon', value: 'uncommon' },
        { label: 'Rare', value: 'rare' },
        { label: 'Epic', value: 'epic' },
        { label: 'Legendary', value: 'legendary' }
      ]
    };
  }
};