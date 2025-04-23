import {
  User, InsertUser,
  Quest, InsertQuest,
  UserQuest, InsertUserQuest,
  Submission, InsertSubmission,
  Craftable, InsertCraftable,
  CraftedItem, InsertCraftedItem,
  Achievement, InsertAchievement,
  UserAchievement, InsertUserAchievement,
  LootBox, InsertLootBox,
  InventoryHistory, InsertInventoryHistory,
  Item, InsertItem,
  CraftingRecipe, InsertCraftingRecipe,
  CharacterEquipment, InsertCharacterEquipment,
  users, quests, userQuests, submissions, craftables, craftedItems,
  achievements, userAchievements, lootBoxes, inventoryHistory, craftingRecipes, items, lootBoxConfigs, characterEquipment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Quest methods
  getQuests(): Promise<Quest[]>;
  getQuest(id: number): Promise<Quest | undefined>;
  getQuestByDate(date: string): Promise<Quest | undefined>;
  createQuest(quest: InsertQuest): Promise<Quest>;
  updateQuest(id: number, questData: Partial<Quest>): Promise<Quest | undefined>;
  
  // UserQuest methods
  getUserQuests(userId: number): Promise<UserQuest[]>;
  getUserQuest(userId: number, questId: number): Promise<UserQuest | undefined>;
  createUserQuest(userQuest: InsertUserQuest): Promise<UserQuest>;
  updateUserQuest(id: number, userQuestData: Partial<UserQuest>): Promise<UserQuest | undefined>;
  
  // Submission methods
  getSubmissions(userId: number): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  
  // Craftable methods
  getCraftables(): Promise<Craftable[]>;
  getCraftable(id: number): Promise<Craftable | undefined>;
  createCraftable(craftable: InsertCraftable): Promise<Craftable>;
  
  // CraftedItem methods
  getCraftedItems(userId: number): Promise<CraftedItem[]>;
  getCraftedItem(id: number): Promise<CraftedItem | undefined>;
  createCraftedItem(craftedItem: InsertCraftedItem): Promise<CraftedItem>;
  updateCraftedItem(id: number, craftedItemData: Partial<CraftedItem>): Promise<CraftedItem | undefined>;
  
  // Achievement methods
  getAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // UserAchievement methods
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined>;
  createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  updateUserAchievement(id: number, userAchievementData: Partial<UserAchievement>): Promise<UserAchievement | undefined>;
  
  // Loot Box methods
  getLootBoxes(userId: number): Promise<LootBox[]>;
  getLootBox(id: number): Promise<LootBox | undefined>;
  createLootBox(lootBox: InsertLootBox): Promise<LootBox>;
  updateLootBox(id: number, lootBoxData: Partial<LootBox>): Promise<LootBox | undefined>;
  
  // Inventory History methods
  getInventoryHistory(userId: number): Promise<InventoryHistory[]>;
  createInventoryHistory(inventoryHistory: InsertInventoryHistory): Promise<InventoryHistory>;
  
  // XP and Level methods
  addUserXP(userId: number, xpAmount: number): Promise<User>;
  getAvailableQuestsForUser(userId: number): Promise<Quest[]>;
  getQuestsByAdventureLine(adventureLine: string): Promise<Quest[]>;
  
  // Item methods
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, itemData: Partial<Item>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  
  // Crafting Recipe methods
  getCraftingRecipes(): Promise<CraftingRecipe[]>;
  getCraftingRecipe(id: number): Promise<CraftingRecipe | undefined>;
  createCraftingRecipe(recipe: InsertCraftingRecipe): Promise<CraftingRecipe>;
  updateCraftingRecipe(id: number, recipeData: Partial<CraftingRecipe>): Promise<CraftingRecipe | undefined>;
  deleteCraftingRecipe(id: number): Promise<boolean>;
  getAvailableCraftingRecipes(userId: number): Promise<CraftingRecipe[]>;
  
  // Character Equipment methods
  getCharacterEquipment(userId: number): Promise<Record<string, any>>;
  equipItem(userId: number, itemId: string, slot: string): Promise<CharacterEquipment>;
  unequipItem(userId: number, slot: string): Promise<boolean>;
  
  // Statistics methods
  getUserCount(): Promise<number>;
  getItemCount(): Promise<number>;
  getCraftingRecipeCount(): Promise<number>;
  getQuestCount(): Promise<number>;
  
  // Database management methods
  resetDatabase(): Promise<void>;
}

// DatabaseStorage class that interacts with the database
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Quest methods
  async getQuests(): Promise<Quest[]> {
    return await db.select().from(quests);
  }

  async getQuest(id: number): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest || undefined;
  }

  async getQuestByDate(date: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.date, date));
    return quest || undefined;
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const [quest] = await db
      .insert(quests)
      .values(insertQuest)
      .returning();
    return quest;
  }

  async updateQuest(id: number, questData: Partial<Quest>): Promise<Quest | undefined> {
    const [updatedQuest] = await db
      .update(quests)
      .set(questData)
      .where(eq(quests.id, id))
      .returning();
    return updatedQuest || undefined;
  }
  
  // UserQuest methods
  async getUserQuests(userId: number): Promise<UserQuest[]> {
    return await db.select().from(userQuests).where(eq(userQuests.userId, userId));
  }

  async getUserQuest(userId: number, questId: number): Promise<UserQuest | undefined> {
    const [userQuest] = await db
      .select()
      .from(userQuests)
      .where(and(eq(userQuests.userId, userId), eq(userQuests.questId, questId)));
    return userQuest || undefined;
  }

  async createUserQuest(insertUserQuest: InsertUserQuest): Promise<UserQuest> {
    const [userQuest] = await db
      .insert(userQuests)
      .values(insertUserQuest)
      .returning();
    return userQuest;
  }

  async updateUserQuest(id: number, userQuestData: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const [updatedUserQuest] = await db
      .update(userQuests)
      .set(userQuestData)
      .where(eq(userQuests.id, id))
      .returning();
    return updatedUserQuest || undefined;
  }
  
  // Submission methods
  async getSubmissions(userId: number): Promise<Submission[]> {
    return await db.select().from(submissions).where(eq(submissions.userId, userId));
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }
  
  // Craftable methods
  async getCraftables(): Promise<Craftable[]> {
    return await db.select().from(craftables);
  }

  async getCraftable(id: number): Promise<Craftable | undefined> {
    const [craftable] = await db.select().from(craftables).where(eq(craftables.id, id));
    return craftable || undefined;
  }

  async createCraftable(insertCraftable: InsertCraftable): Promise<Craftable> {
    const [craftable] = await db
      .insert(craftables)
      .values(insertCraftable)
      .returning();
    return craftable;
  }

  // Implementing all the remaining methods systematically...
  
  // CraftedItem methods
  async getCraftedItems(userId: number): Promise<CraftedItem[]> {
    return await db.select().from(craftedItems).where(eq(craftedItems.userId, userId));
  }

  async getCraftedItem(id: number): Promise<CraftedItem | undefined> {
    const [craftedItem] = await db.select().from(craftedItems).where(eq(craftedItems.id, id));
    return craftedItem || undefined;
  }

  async createCraftedItem(insertCraftedItem: InsertCraftedItem): Promise<CraftedItem> {
    const [craftedItem] = await db
      .insert(craftedItems)
      .values(insertCraftedItem)
      .returning();
    return craftedItem;
  }

  async updateCraftedItem(id: number, craftedItemData: Partial<CraftedItem>): Promise<CraftedItem | undefined> {
    const [updatedCraftedItem] = await db
      .update(craftedItems)
      .set(craftedItemData)
      .where(eq(craftedItems.id, id))
      .returning();
    return updatedCraftedItem || undefined;
  }
  
  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }
  
  // UserAchievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
    return userAchievement || undefined;
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values(insertUserAchievement)
      .returning();
    return userAchievement;
  }

  async updateUserAchievement(id: number, userAchievementData: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const [updatedUserAchievement] = await db
      .update(userAchievements)
      .set(userAchievementData)
      .where(eq(userAchievements.id, id))
      .returning();
    return updatedUserAchievement || undefined;
  }
  
  // LootBox methods
  async getLootBoxes(userId: number): Promise<LootBox[]> {
    return await db.select().from(lootBoxes).where(eq(lootBoxes.userId, userId));
  }

  async getLootBox(id: number): Promise<LootBox | undefined> {
    const [lootBox] = await db.select().from(lootBoxes).where(eq(lootBoxes.id, id));
    return lootBox || undefined;
  }

  async createLootBox(insertLootBox: InsertLootBox): Promise<LootBox> {
    const [lootBox] = await db
      .insert(lootBoxes)
      .values(insertLootBox)
      .returning();
    return lootBox;
  }

  async updateLootBox(id: number, lootBoxData: Partial<LootBox>): Promise<LootBox | undefined> {
    const [updatedLootBox] = await db
      .update(lootBoxes)
      .set(lootBoxData)
      .where(eq(lootBoxes.id, id))
      .returning();
    return updatedLootBox || undefined;
  }
  
  // Inventory History methods
  async getInventoryHistory(userId: number): Promise<InventoryHistory[]> {
    return await db
      .select()
      .from(inventoryHistory)
      .where(eq(inventoryHistory.userId, userId))
      .orderBy(desc(inventoryHistory.createdAt));
  }

  async createInventoryHistory(insertInventoryHistory: InsertInventoryHistory): Promise<InventoryHistory> {
    const [historyItem] = await db
      .insert(inventoryHistory)
      .values(insertInventoryHistory)
      .returning();
    return historyItem;
  }
  
  // Item methods
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateItem(id: string, itemData: Partial<Item>): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set(itemData)
      .where(eq(items.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id));
    return !!result;
  }
  
  // Crafting Recipe methods
  async getCraftingRecipes(): Promise<CraftingRecipe[]> {
    return await db.select().from(craftingRecipes);
  }

  async getCraftingRecipe(id: number): Promise<CraftingRecipe | undefined> {
    const [craftingRecipe] = await db.select().from(craftingRecipes).where(eq(craftingRecipes.id, id));
    return craftingRecipe || undefined;
  }

  async createCraftingRecipe(insertCraftingRecipe: InsertCraftingRecipe): Promise<CraftingRecipe> {
    const [craftingRecipe] = await db
      .insert(craftingRecipes)
      .values(insertCraftingRecipe)
      .returning();
    return craftingRecipe;
  }

  async updateCraftingRecipe(id: number, craftingRecipeData: Partial<CraftingRecipe>): Promise<CraftingRecipe | undefined> {
    const [updatedCraftingRecipe] = await db
      .update(craftingRecipes)
      .set(craftingRecipeData)
      .where(eq(craftingRecipes.id, id))
      .returning();
    return updatedCraftingRecipe || undefined;
  }

  async deleteCraftingRecipe(id: number): Promise<boolean> {
    const result = await db.delete(craftingRecipes).where(eq(craftingRecipes.id, id));
    return !!result;
  }

  async getAvailableCraftingRecipes(userId: number): Promise<CraftingRecipe[]> {
    // Get all unlocked recipes
    return await db.select().from(craftingRecipes).where(eq(craftingRecipes.unlocked, true));
  }
  
  // Character Equipment methods
  async getCharacterEquipment(userId: number): Promise<Record<string, any>> {
    // Get all equipment for the user, organized by slot
    const equipmentItems = await db
      .select()
      .from(characterEquipment)
      .where(eq(characterEquipment.userId, userId));
    
    // Turn the list into a record with slot as key
    const result: Record<string, any> = {};
    
    for (const item of equipmentItems) {
      // For each equipped item, get the full item details
      const itemDetails = await this.getItem(item.itemId);
      if (itemDetails) {
        // Format the response to match what the UI expects
        result[item.slot] = {
          id: itemDetails.id,
          name: itemDetails.name,
          description: itemDetails.description,
          flavorText: itemDetails.flavorText,
          rarity: itemDetails.rarity,
          imagePath: itemDetails.imagePath || `/images/items/${itemDetails.id}.png`,
          equippedAt: item.equippedAt
        };
      }
    }
    
    return result;
  }

  async equipItem(userId: number, itemId: string, slot: string): Promise<CharacterEquipment> {
    // First, unequip any item in that slot
    await this.unequipItem(userId, slot);
    
    // Then equip the new item
    const [equipment] = await db
      .insert(characterEquipment)
      .values({
        userId,
        itemId,
        slot
      })
      .returning();
    
    return equipment;
  }

  async unequipItem(userId: number, slot: string): Promise<boolean> {
    const result = await db
      .delete(characterEquipment)
      .where(and(eq(characterEquipment.userId, userId), eq(characterEquipment.slot, slot)));
    
    return !!result;
  }
  
  // XP and Level methods
  async addUserXP(userId: number, xpAmount: number): Promise<User> {
    // Get the current user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Calculate new XP
    const newXP = user.xp + xpAmount;
    let newLevel = user.level;
    let newXPToNextLevel = user.xpToNextLevel;
    
    // Check if user levels up
    if (newXP >= user.xpToNextLevel) {
      newLevel += 1;
      // Formula for next level: current level requirement * 1.5
      newXPToNextLevel = Math.floor(user.xpToNextLevel * 1.5);
    }
    
    // Update the user
    const updatedUser = await this.updateUser(userId, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXPToNextLevel
    });
    
    if (!updatedUser) {
      throw new Error(`Failed to update user with ID ${userId}`);
    }
    
    return updatedUser;
  }
  
  async getAvailableQuestsForUser(userId: number): Promise<Quest[]> {
    // Get the user to check their completed quests
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Get all quests that are active
    let availableQuests = await db
      .select()
      .from(quests)
      .where(eq(quests.active, true));
    
    // Filter out completed quests
    availableQuests = availableQuests.filter(
      quest => !user.completedQuests.includes(quest.id)
    );
    
    return availableQuests;
  }
  
  async getQuestsByAdventureLine(adventureLine: string): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(eq(quests.adventureLine, adventureLine))
      .orderBy(quests.orderInLine);
  }
  
  // Statistics methods
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count;
  }
  
  async getItemCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(items);
    return result[0].count;
  }
  
  async getCraftingRecipeCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(craftingRecipes);
    return result[0].count;
  }
  
  async getQuestCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(quests);
    return result[0].count;
  }
  
  // Database management methods
  async resetDatabase(): Promise<void> {
    // This would require careful implementation in a production environment
    // For now, just a placeholder that does nothing
    console.log("Database reset is not implemented for safety reasons");
  }
  
  // Additional helper methods for specific game functionality
  async initializeItems(): Promise<void> {
    // This would be implemented to initialize the database with default items
    // Implementation will depend on game-specific requirements
  }
}

// Keeping the MemStorage for now until DatabaseStorage is fully implemented
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quests: Map<number, Quest>;
  private userQuests: Map<number, UserQuest>;
  private submissions: Map<number, Submission>;
  private craftables: Map<number, Craftable>;
  private craftedItems: Map<number, CraftedItem>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private lootBoxes: Map<number, LootBox>;
  private inventoryHistory: Map<number, InventoryHistory>;
  private items: Map<string, Item>;
  
  private userIdCounter: number;
  private questIdCounter: number;
  private userQuestIdCounter: number;
  private submissionIdCounter: number;
  private craftableIdCounter: number;
  private craftedItemIdCounter: number;
  private achievementIdCounter: number;
  private userAchievementIdCounter: number;
  private lootBoxIdCounter: number;
  private inventoryHistoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.quests = new Map();
    this.userQuests = new Map();
    this.submissions = new Map();
    this.craftables = new Map();
    this.craftedItems = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.lootBoxes = new Map();
    this.inventoryHistory = new Map();
    this.items = new Map();
    
    this.userIdCounter = 1;
    this.questIdCounter = 1;
    this.userQuestIdCounter = 1;
    this.submissionIdCounter = 1;
    this.craftableIdCounter = 1;
    this.craftedItemIdCounter = 1;
    this.achievementIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.lootBoxIdCounter = 1;
    this.inventoryHistoryIdCounter = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Initialize items from itemDatabase.ts
    this.initializeItems();
    
    // Create default users
    // Demo user
    const demoUser = this.createUser({
      username: 'demo',
      email: 'demo@questgiver.com',
      password: 'demo123', // In a real app, this would be hashed
      roles: ['admin', 'user'],
      level: 1,
      inventory: {
        'cloth': 5,
        'metal': 3,
        'tech-scrap': 2,
        'sensor-crystal': 1,
        'circuit-board': 0,
        'alchemy-ink': 0
      }
    });
    
    // Add a welcome loot crate for demo user
    this.createLootBox({
      userId: demoUser.id,
      type: 'rare',
      opened: false,
      rewards: null, // Will be generated when opened
      source: 'New Account Welcome Gift',
      sourceId: null
    });
    
    // Admin user
    const adminUser = this.createUser({
      username: 'admin',
      email: 'admin@questgiver.com',
      password: 'admin123', // In a real app, this would be hashed
      roles: ['admin', 'user'],
      level: 10,
      inventory: {
        'cloth': 100,
        'metal': 100,
        'tech-scrap': 100,
        'sensor-crystal': 100,
        'circuit-board': 100,
        'alchemy-ink': 100
      }
    });
    
    // Add a welcome loot crate for admin user
    this.createLootBox({
      userId: adminUser.id,
      type: 'legendary',
      opened: false,
      rewards: null, // Will be generated when opened
      source: 'Admin Account Welcome Gift',
      sourceId: null
    });
    
    // Initialize with adventure kits and sample quests
    const adventureKits = [
      { id: 'lost-in-space', name: '30 Days Lost in Space' },
      { id: 'cogsworth-city', name: 'Cogsworth City' },
      { id: 'pandoras-box', name: 'Pandora\'s Box' },
      { id: 'neon-realm', name: 'Neon Realm' },
      { id: 'nebula-raiders', name: 'Nebula Raiders' }
    ];
    
    // Sample quests - Lost in Space adventure line
    this.createQuest({
      date: '2023-06-01',
      title: 'Incoming Broadcast from InventrCorp',
      description: 'Establish communication with InventrCorp headquarters to receive your mission details.',
      adventureLine: 'lost-in-space',
      difficulty: 1,
      orderInLine: 0,
      xpReward: 100,
      rewards: [{ type: 'metal', quantity: 2 }, { type: 'cloth', quantity: 1 }],
      active: true
    });
    
    this.createQuest({
      date: '2023-06-02',
      title: 'It\'s Really Dark In Here',
      description: 'Set up your first circuit to get some light in your spacecraft.',
      adventureLine: 'lost-in-space',
      difficulty: 1,
      orderInLine: 1,
      xpReward: 120,
      rewards: [{ type: 'tech-scrap', quantity: 1 }, { type: 'metal', quantity: 1 }],
      active: true
    });
    
    this.createQuest({
      date: '2023-06-03',
      title: 'H_jyfwapj_tlzzhnl',
      description: 'Decrypt the mysterious message received from HQ using the cipher provided.',
      adventureLine: 'lost-in-space',
      difficulty: 3,
      orderInLine: 2,
      xpReward: 150,
      rewards: [{ type: 'tech-scrap', quantity: 2 }, { type: 'sensor-crystal', quantity: 1 }, { type: 'circuit-board', quantity: 1 }],
      active: true
    });
    
    // Cogsworth City adventure line
    this.createQuest({
      date: '2023-06-04',
      title: 'The Clockwork Conundrum',
      description: 'Fix the central timing mechanism in Cogsworth Square to restore power to the city\'s main district.',
      adventureLine: 'cogsworth-city',
      difficulty: 2,
      orderInLine: 0,
      xpReward: 100,
      rewards: [{ type: 'metal', quantity: 2 }, { type: 'cloth', quantity: 1 }],
      active: true
    });
    
    // Sample craftables
    this.createCraftable({
      name: 'Quest Giver T-Shirt',
      description: 'A limited edition t-shirt featuring the Quest Giver logo.',
      image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYyMjg0NjU4Mg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300',
      recipe: [{ type: 'cloth', quantity: 5 }, { type: 'metal', quantity: 2 }],
      type: 'physical'
    });
    
    this.createCraftable({
      name: 'Mystery Sensor Pack',
      description: 'A random selection of 3 sensors to expand your HERO board capabilities.',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYyMjg0NjYzMg&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300',
      recipe: [{ type: 'tech-scrap', quantity: 3 }, { type: 'sensor-crystal', quantity: 2 }],
      type: 'physical'
    });
    
    this.createCraftable({
      name: 'Neon Realm Patch',
      description: 'An embroidered patch from the Neon Realm adventure series.',
      image: 'https://images.unsplash.com/photo-1623275563389-0ba1af35002c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYyMjg0NjY1NQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300',
      recipe: [{ type: 'cloth', quantity: 3 }, { type: 'alchemy-ink', quantity: 2 }],
      type: 'physical'
    });
    
    this.createCraftable({
      name: 'HERO Board Pro Upgrade',
      description: 'Digital upgrade unlocking advanced features for your HERO board.',
      image: 'https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTYyMjg0NjY3Mw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=300',
      recipe: [{ type: 'tech-scrap', quantity: 4 }, { type: 'circuit-board', quantity: 2 }, { type: 'sensor-crystal', quantity: 3 }],
      type: 'digital'
    });
    
    // Sample achievements
    this.createAchievement({
      name: 'First Contact',
      description: 'Completed your first quest',
      tier: 'apprentice',
      icon: 'rocket',
      requirementType: 'quests_completed',
      requirementValue: 1
    });
    
    this.createAchievement({
      name: 'Let There Be Light',
      description: 'Mastered the LED circuit',
      tier: 'apprentice',
      icon: 'lightbulb',
      requirementType: 'quests_completed',
      requirementValue: 2
    });
    
    this.createAchievement({
      name: 'Power Restored',
      description: 'Fixed your ship\'s battery',
      tier: 'journeyman',
      icon: 'battery-three-quarters',
      requirementType: 'quests_completed',
      requirementValue: 5
    });
    
    this.createAchievement({
      name: 'Color Wizard',
      description: 'Mastered RGB LED controls',
      tier: 'journeyman',
      icon: 'tint',
      requirementType: 'quests_completed',
      requirementValue: 8
    });
    
    this.createAchievement({
      name: 'Sound the Alarm',
      description: 'Master the buzzer module',
      tier: 'master',
      icon: 'volume-up',
      requirementType: 'quests_completed',
      requirementValue: 12
    });
    
    this.createAchievement({
      name: 'Display Master',
      description: 'Program all display modules',
      tier: 'archmage',
      icon: 'desktop',
      requirementType: 'quests_completed',
      requirementValue: 20
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const lastLogin = new Date();
    const level = insertUser.level || 1;
    const xp = insertUser.xp || 0;
    const xpToNextLevel = insertUser.xpToNextLevel || 300;
    const completedQuests = insertUser.completedQuests || [];
    const inventory = insertUser.inventory || {};
    
    const user: User = {
      id,
      ...insertUser,
      level,
      xp,
      xpToNextLevel,
      completedQuests,
      inventory,
      createdAt,
      lastLogin
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Quest methods
  async getQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  async getQuest(id: number): Promise<Quest | undefined> {
    return this.quests.get(id);
  }

  async getQuestByDate(date: string): Promise<Quest | undefined> {
    return Array.from(this.quests.values()).find(
      (quest) => quest.date === date
    );
  }

  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const id = this.questIdCounter++;
    
    const quest: Quest = {
      id,
      ...insertQuest
    };
    
    this.quests.set(id, quest);
    return quest;
  }

  async updateQuest(id: number, questData: Partial<Quest>): Promise<Quest | undefined> {
    const quest = this.quests.get(id);
    if (!quest) return undefined;
    
    const updatedQuest = { ...quest, ...questData };
    this.quests.set(id, updatedQuest);
    return updatedQuest;
  }

  // UserQuest methods
  async getUserQuests(userId: number): Promise<UserQuest[]> {
    return Array.from(this.userQuests.values()).filter(
      (userQuest) => userQuest.userId === userId
    );
  }

  async getUserQuest(userId: number, questId: number): Promise<UserQuest | undefined> {
    return Array.from(this.userQuests.values()).find(
      (userQuest) => userQuest.userId === userId && userQuest.questId === questId
    );
  }

  async createUserQuest(insertUserQuest: InsertUserQuest): Promise<UserQuest> {
    const id = this.userQuestIdCounter++;
    const startedAt = insertUserQuest.status === 'active' ? new Date() : undefined;
    const completedAt = insertUserQuest.status === 'completed' ? new Date() : undefined;
    
    const userQuest: UserQuest = {
      id,
      ...insertUserQuest,
      startedAt,
      completedAt
    };
    
    this.userQuests.set(id, userQuest);
    return userQuest;
  }

  async updateUserQuest(id: number, userQuestData: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const userQuest = this.userQuests.get(id);
    if (!userQuest) return undefined;
    
    // If status changes to active, set startedAt
    if (userQuestData.status === 'active' && userQuest.status !== 'active') {
      userQuestData.startedAt = new Date();
    }
    
    // If status changes to completed, set completedAt
    if (userQuestData.status === 'completed' && userQuest.status !== 'completed') {
      userQuestData.completedAt = new Date();
    }
    
    const updatedUserQuest = { ...userQuest, ...userQuestData };
    this.userQuests.set(id, updatedUserQuest);
    return updatedUserQuest;
  }

  // Submission methods
  async getSubmissions(userId: number): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      (submission) => submission.userId === userId
    );
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.submissionIdCounter++;
    const createdAt = new Date();
    
    const submission: Submission = {
      id,
      ...insertSubmission,
      createdAt
    };
    
    this.submissions.set(id, submission);
    return submission;
  }

  // Craftable methods
  async getCraftables(): Promise<Craftable[]> {
    return Array.from(this.craftables.values());
  }

  async getCraftable(id: number): Promise<Craftable | undefined> {
    return this.craftables.get(id);
  }

  async createCraftable(insertCraftable: InsertCraftable): Promise<Craftable> {
    const id = this.craftableIdCounter++;
    
    const craftable: Craftable = {
      id,
      ...insertCraftable
    };
    
    this.craftables.set(id, craftable);
    return craftable;
  }

  // CraftedItem methods
  async getCraftedItems(userId: number): Promise<CraftedItem[]> {
    return Array.from(this.craftedItems.values()).filter(
      (craftedItem) => craftedItem.userId === userId
    );
  }

  async getCraftedItem(id: number): Promise<CraftedItem | undefined> {
    return this.craftedItems.get(id);
  }

  async createCraftedItem(insertCraftedItem: InsertCraftedItem): Promise<CraftedItem> {
    const id = this.craftedItemIdCounter++;
    const dateCrafted = new Date();
    
    const craftedItem: CraftedItem = {
      id,
      ...insertCraftedItem,
      dateCrafted
    };
    
    this.craftedItems.set(id, craftedItem);
    return craftedItem;
  }

  async updateCraftedItem(id: number, craftedItemData: Partial<CraftedItem>): Promise<CraftedItem | undefined> {
    const craftedItem = this.craftedItems.get(id);
    if (!craftedItem) return undefined;
    
    const updatedCraftedItem = { ...craftedItem, ...craftedItemData };
    this.craftedItems.set(id, updatedCraftedItem);
    return updatedCraftedItem;
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementIdCounter++;
    
    const achievement: Achievement = {
      id,
      ...insertAchievement
    };
    
    this.achievements.set(id, achievement);
    return achievement;
  }
  
  // Loot Box methods
  async getLootBoxes(userId: number): Promise<LootBox[]> {
    return Array.from(this.lootBoxes.values()).filter(
      (lootBox) => lootBox.userId === userId
    );
  }

  async getLootBox(id: number): Promise<LootBox | undefined> {
    return this.lootBoxes.get(id);
  }

  async createLootBox(insertLootBox: InsertLootBox): Promise<LootBox> {
    const id = this.lootBoxIdCounter++;
    const createdAt = new Date();
    
    const lootBox: LootBox = {
      id,
      ...insertLootBox,
      createdAt
    };
    
    this.lootBoxes.set(id, lootBox);
    return lootBox;
  }

  async updateLootBox(id: number, lootBoxData: Partial<LootBox>): Promise<LootBox | undefined> {
    const lootBox = this.lootBoxes.get(id);
    if (!lootBox) return undefined;
    
    const updatedLootBox = { ...lootBox, ...lootBoxData };
    this.lootBoxes.set(id, updatedLootBox);
    return updatedLootBox;
  }

  // UserAchievement methods
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values()).filter(
      (userAchievement) => userAchievement.userId === userId
    );
  }

  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    return Array.from(this.userAchievements.values()).find(
      (userAchievement) => userAchievement.userId === userId && userAchievement.achievementId === achievementId
    );
  }

  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const id = this.userAchievementIdCounter++;
    const unlockedAt = insertUserAchievement.unlocked ? new Date() : undefined;
    
    const userAchievement: UserAchievement = {
      id,
      ...insertUserAchievement,
      unlockedAt
    };
    
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  async updateUserAchievement(id: number, userAchievementData: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const userAchievement = this.userAchievements.get(id);
    if (!userAchievement) return undefined;
    
    // If now unlocked, set unlockedAt
    if (userAchievementData.unlocked && !userAchievement.unlocked) {
      userAchievementData.unlockedAt = new Date();
    }
    
    const updatedUserAchievement = { ...userAchievement, ...userAchievementData };
    this.userAchievements.set(id, updatedUserAchievement);
    return updatedUserAchievement;
  }

  // Inventory History methods
  async getInventoryHistory(userId: number): Promise<InventoryHistory[]> {
    return Array.from(this.inventoryHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createInventoryHistory(insertInventoryHistory: InsertInventoryHistory): Promise<InventoryHistory> {
    const id = this.inventoryHistoryIdCounter++;
    const createdAt = new Date();
    
    const inventoryHistory: InventoryHistory = {
      id,
      ...insertInventoryHistory,
      createdAt
    };
    
    this.inventoryHistory.set(id, inventoryHistory);
    return inventoryHistory;
  }
  
  // XP and Level methods
  async addUserXP(userId: number, xpAmount: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Add XP to user
    let newXP = (user.xp || 0) + xpAmount;
    let newLevel = user.level || 1;
    let newXpToNextLevel = user.xpToNextLevel || 300;
    
    // Check if user leveled up
    while (newXP >= newXpToNextLevel) {
      // Level up!
      newXP -= newXpToNextLevel;
      newLevel++;
      
      // Calculate new XP requirement for next level (increases with each level)
      newXpToNextLevel = Math.floor(newXpToNextLevel * 1.2);
    }
    
    // Update user with new XP and level
    const updatedUser = await this.updateUser(userId, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel
    });
    
    if (!updatedUser) {
      throw new Error(`Failed to update user ${userId} with new XP`);
    }
    
    return updatedUser;
  }
  
  async getQuestsByAdventureLine(adventureLine: string): Promise<Quest[]> {
    // Get all quests for this adventure line, sorted by their order
    return Array.from(this.quests.values())
      .filter(quest => quest.adventureLine === adventureLine && quest.active)
      .sort((a, b) => (a.orderInLine || 0) - (b.orderInLine || 0));
  }
  
  async getAvailableQuestsForUser(userId: number): Promise<Quest[]> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const completedQuestIds = user.completedQuests || [];
    const userQuests = await this.getUserQuests(userId);
    
    // Get all active quests
    const allQuests = Array.from(this.quests.values())
      .filter(quest => quest.active);
    
    // Group quests by adventure line
    const questsByAdventure: Record<string, Quest[]> = {};
    
    for (const quest of allQuests) {
      const adventureLine = quest.adventureLine;
      if (!questsByAdventure[adventureLine]) {
        questsByAdventure[adventureLine] = [];
      }
      questsByAdventure[adventureLine].push(quest);
    }
    
    // For each adventure line, determine available quests
    const availableQuests: Quest[] = [];
    
    for (const adventureLine in questsByAdventure) {
      // Sort quests by order in line
      const adventureQuests = questsByAdventure[adventureLine].sort(
        (a, b) => (a.orderInLine || 0) - (b.orderInLine || 0)
      );
      
      // First quest in each adventure line is always available
      if (adventureQuests.length > 0) {
        const firstQuest = adventureQuests[0];
        
        // Check if user already has this quest in their userQuests
        const existingUserQuest = userQuests.find(uq => uq.questId === firstQuest.id);
        
        if (!existingUserQuest) {
          // Create user quest entry if it doesn't exist
          await this.createUserQuest({
            userId,
            questId: firstQuest.id,
            status: 'available'
          });
        } else if (existingUserQuest.status === 'locked') {
          // Update status to available if it's currently locked
          await this.updateUserQuest(existingUserQuest.id, { status: 'available' });
        }
        
        // Add first quest to available quests if not completed
        if (!completedQuestIds.includes(firstQuest.id)) {
          availableQuests.push(firstQuest);
        }
        
        // Check subsequent quests
        for (let i = 1; i < adventureQuests.length; i++) {
          const quest = adventureQuests[i];
          const previousQuest = adventureQuests[i - 1];
          
          // If previous quest is completed, this quest becomes available
          if (completedQuestIds.includes(previousQuest.id)) {
            // Check if user already has this quest in their userQuests
            const existingUserQuest = userQuests.find(uq => uq.questId === quest.id);
            
            if (!existingUserQuest) {
              // Create user quest entry
              await this.createUserQuest({
                userId,
                questId: quest.id,
                status: 'available'
              });
            } else if (existingUserQuest.status === 'locked') {
              // Update status to available
              await this.updateUserQuest(existingUserQuest.id, { status: 'available' });
            }
            
            // Add to available quests if not already completed
            if (!completedQuestIds.includes(quest.id)) {
              availableQuests.push(quest);
            }
          }
        }
      }
    }
    
    return availableQuests;
  }
  
  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const now = new Date();
    const createdAt = now;
    const updatedAt = now;
    
    const item: Item = {
      ...insertItem,
      createdAt,
      updatedAt
    };
    
    this.items.set(item.id, item);
    return item;
  }

  async updateItem(id: string, itemData: Partial<Item>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;
    
    const updatedItem = { 
      ...item, 
      ...itemData,
      updatedAt: new Date() // Always update the updatedAt timestamp
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    if (!this.items.has(id)) return false;
    
    this.items.delete(id);
    return true;
  }
  
  // Import default items from itemDatabase.ts
  private initializeItems() {
    // Import the itemDatabase module
    import('./itemDatabase').then(({ itemDatabase }) => {
      // Convert itemDatabase entries to database Item records
      for (const [id, details] of Object.entries(itemDatabase)) {
        this.createItem({
          id: details.id,
          name: details.name,
          description: details.description,
          flavorText: details.flavorText,
          rarity: details.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
          craftingUses: details.craftingUses,
          imagePath: details.imagePath,
          category: details.category || 'resource'
        });
      }
    }).catch(err => {
      console.error('Failed to initialize items from itemDatabase:', err);
    });
  }

  // Statistics methods
  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async getItemCount(): Promise<number> {
    return this.items.size;
  }

  async getCraftingRecipeCount(): Promise<number> {
    // Just return 0 for now as this would be implemented with proper crafting recipes
    return 0;
  }

  async getQuestCount(): Promise<number> {
    return this.quests.size;
  }

  async resetDatabase(): Promise<void> {
    // Clear all data
    this.users = new Map();
    this.quests = new Map();
    this.userQuests = new Map();
    this.submissions = new Map();
    this.craftables = new Map();
    this.craftedItems = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.lootBoxes = new Map();
    this.inventoryHistory = new Map();
    this.items = new Map();
    
    // Reset ID counters
    this.userIdCounter = 1;
    this.questIdCounter = 1;
    this.userQuestIdCounter = 1;
    this.submissionIdCounter = 1;
    this.craftableIdCounter = 1;
    this.craftedItemIdCounter = 1;
    this.achievementIdCounter = 1;
    this.userAchievementIdCounter = 1;
    this.lootBoxIdCounter = 1;
    this.inventoryHistoryIdCounter = 1;
    
    // Re-initialize with sample data
    this.initializeData();
  }
}

// Removed duplicate DatabaseStorage class definition
// The proper implementation is at the top of the file
/* REMOVED duplicate class definition - export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async getQuests(): Promise<Quest[]> {
    return await db.select().from(quests);
  }
  
  async getQuest(id: number): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.id, id));
    return quest;
  }
  
  async getQuestByDate(date: string): Promise<Quest | undefined> {
    const [quest] = await db.select().from(quests).where(eq(quests.date, date));
    return quest;
  }
  
  async createQuest(insertQuest: InsertQuest): Promise<Quest> {
    const [quest] = await db.insert(quests).values(insertQuest).returning();
    return quest;
  }
  
  async updateQuest(id: number, questData: Partial<Quest>): Promise<Quest | undefined> {
    const [updatedQuest] = await db
      .update(quests)
      .set(questData)
      .where(eq(quests.id, id))
      .returning();
    return updatedQuest;
  }
  
  async getUserQuests(userId: number): Promise<UserQuest[]> {
    return await db
      .select()
      .from(userQuests)
      .where(eq(userQuests.userId, userId));
  }
  
  async getUserQuest(userId: number, questId: number): Promise<UserQuest | undefined> {
    const [userQuest] = await db
      .select()
      .from(userQuests)
      .where(and(eq(userQuests.userId, userId), eq(userQuests.questId, questId)));
    return userQuest;
  }
  
  async createUserQuest(insertUserQuest: InsertUserQuest): Promise<UserQuest> {
    const [userQuest] = await db
      .insert(userQuests)
      .values(insertUserQuest)
      .returning();
    return userQuest;
  }
  
  async updateUserQuest(id: number, userQuestData: Partial<UserQuest>): Promise<UserQuest | undefined> {
    const [updatedUserQuest] = await db
      .update(userQuests)
      .set(userQuestData)
      .where(eq(userQuests.id, id))
      .returning();
    return updatedUserQuest;
  }
  
  async getSubmissions(userId: number): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.userId, userId));
  }
  
  async getSubmission(id: number): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    return submission;
  }
  
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }
  
  async getCraftables(): Promise<Craftable[]> {
    return await db.select().from(craftables);
  }
  
  async getCraftable(id: number): Promise<Craftable | undefined> {
    const [craftable] = await db
      .select()
      .from(craftables)
      .where(eq(craftables.id, id));
    return craftable;
  }
  
  async createCraftable(insertCraftable: InsertCraftable): Promise<Craftable> {
    const [craftable] = await db
      .insert(craftables)
      .values(insertCraftable)
      .returning();
    return craftable;
  }
  
  async getCraftedItems(userId: number): Promise<CraftedItem[]> {
    return await db
      .select()
      .from(craftedItems)
      .where(eq(craftedItems.userId, userId));
  }
  
  async getCraftedItem(id: number): Promise<CraftedItem | undefined> {
    const [craftedItem] = await db
      .select()
      .from(craftedItems)
      .where(eq(craftedItems.id, id));
    return craftedItem;
  }
  
  async createCraftedItem(insertCraftedItem: InsertCraftedItem): Promise<CraftedItem> {
    const [craftedItem] = await db
      .insert(craftedItems)
      .values(insertCraftedItem)
      .returning();
    return craftedItem;
  }
  
  async updateCraftedItem(id: number, craftedItemData: Partial<CraftedItem>): Promise<CraftedItem | undefined> {
    const [updatedCraftedItem] = await db
      .update(craftedItems)
      .set(craftedItemData)
      .where(eq(craftedItems.id, id))
      .returning();
    return updatedCraftedItem;
  }
  
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }
  
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }
  
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }
  
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));
  }
  
  async getUserAchievement(userId: number, achievementId: number): Promise<UserAchievement | undefined> {
    const [userAchievement] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievementId)
        )
      );
    return userAchievement;
  }
  
  async createUserAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values(insertUserAchievement)
      .returning();
    return userAchievement;
  }
  
  async updateUserAchievement(id: number, userAchievementData: Partial<UserAchievement>): Promise<UserAchievement | undefined> {
    const [updatedUserAchievement] = await db
      .update(userAchievements)
      .set(userAchievementData)
      .where(eq(userAchievements.id, id))
      .returning();
    return updatedUserAchievement;
  }
  
  async getLootBoxes(userId: number): Promise<LootBox[]> {
    return await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.userId, userId));
  }
  
  async getLootBox(id: number): Promise<LootBox | undefined> {
    const [lootBox] = await db
      .select()
      .from(lootBoxes)
      .where(eq(lootBoxes.id, id));
    return lootBox;
  }
  
  async createLootBox(insertLootBox: InsertLootBox): Promise<LootBox> {
    const [lootBox] = await db
      .insert(lootBoxes)
      .values(insertLootBox)
      .returning();
    return lootBox;
  }
  
  async updateLootBox(id: number, lootBoxData: Partial<LootBox>): Promise<LootBox | undefined> {
    const [updatedLootBox] = await db
      .update(lootBoxes)
      .set(lootBoxData)
      .where(eq(lootBoxes.id, id))
      .returning();
    return updatedLootBox;
  }
  
  async getInventoryHistory(userId: number): Promise<InventoryHistory[]> {
    return await db
      .select()
      .from(inventoryHistory)
      .where(eq(inventoryHistory.userId, userId))
      .orderBy(desc(inventoryHistory.createdAt));
  }
  
  async createInventoryHistory(insertInventoryHistory: InsertInventoryHistory): Promise<InventoryHistory> {
    const [history] = await db
      .insert(inventoryHistory)
      .values(insertInventoryHistory)
      .returning();
    return history;
  }
  
  async addUserXP(userId: number, xpAmount: number): Promise<User> {
    // Get the current user to calculate new XP and level
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Calculate the new XP value
    const newXP = user.xp + xpAmount;
    
    // Check if user levels up
    let newLevel = user.level;
    let newXPToNextLevel = user.xpToNextLevel;
    
    while (newXP >= newXPToNextLevel) {
      newLevel += 1;
      // New XP threshold is 10% higher than the previous one
      newXPToNextLevel = Math.floor(newXPToNextLevel * 1.1);
    }
    
    // Update the user
    const updatedUser = await this.updateUser(userId, {
      xp: newXP,
      level: newLevel,
      xpToNextLevel: newXPToNextLevel
    });
    
    if (!updatedUser) {
      throw new Error(`Failed to update user with ID ${userId}`);
    }
    
    return updatedUser;
  }
  
  async getQuestsByAdventureLine(adventureLine: string): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(eq(quests.adventureLine, adventureLine))
      .orderBy(quests.orderInLine);
  }
  
  async getAvailableQuestsForUser(userId: number): Promise<Quest[]> {
    // Get the user to check their completed quests
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Get all quests
    const allQuests = await this.getQuests();
    
    // Filter quests based on completion status
    const completedQuestIds = user.completedQuests || [];
    const availableQuests = allQuests.filter(
      (quest) => !completedQuestIds.includes(quest.id) && quest.active
    );
    
    return availableQuests;
  }
  
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }
  
  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));
    return item;
  }
  
  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(insertItem)
      .returning();
    return item;
  }
  
  async updateItem(id: string, itemData: Partial<Item>): Promise<Item | undefined> {
    const [updatedItem] = await db
      .update(items)
      .set({
        ...itemData,
        updatedAt: new Date()
      })
      .where(eq(items.id, id))
      .returning();
    return updatedItem;
  }
  
  async deleteItem(id: string): Promise<boolean> {
    const result = await db
      .delete(items)
      .where(eq(items.id, id));
    return true; // PostgreSQL doesn't return deleted rows count directly in drizzle
  }

  // Crafting Recipe methods
  async getCraftingRecipes(): Promise<CraftingRecipe[]> {
    return await db.select().from(craftingRecipes);
  }

  async getCraftingRecipe(id: number): Promise<CraftingRecipe | undefined> {
    const [recipe] = await db
      .select()
      .from(craftingRecipes)
      .where(eq(craftingRecipes.id, id));
    return recipe;
  }

  async createCraftingRecipe(insertRecipe: InsertCraftingRecipe): Promise<CraftingRecipe> {
    const [recipe] = await db
      .insert(craftingRecipes)
      .values(insertRecipe)
      .returning();
    return recipe;
  }

  async updateCraftingRecipe(id: number, recipeData: Partial<CraftingRecipe>): Promise<CraftingRecipe | undefined> {
    const [updatedRecipe] = await db
      .update(craftingRecipes)
      .set({
        ...recipeData,
        updatedAt: new Date()
      })
      .where(eq(craftingRecipes.id, id))
      .returning();
    return updatedRecipe;
  }

  async deleteCraftingRecipe(id: number): Promise<boolean> {
    const result = await db
      .delete(craftingRecipes)
      .where(eq(craftingRecipes.id, id));
    return true; // PostgreSQL doesn't return deleted rows count directly in drizzle
  }

  async getAvailableCraftingRecipes(userId: number): Promise<CraftingRecipe[]> {
    // Get the user to check their level
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }
    
    // For now, just return all unlocked recipes
    // In the future, this could filter based on player level or other criteria
    return await db
      .select()
      .from(craftingRecipes)
      .where(eq(craftingRecipes.unlocked, true));
  }

  // Statistics methods
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0].count || 0;
  }

  async getItemCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(items);
    return result[0].count || 0;
  }

  async getCraftingRecipeCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(craftingRecipes);
    return result[0].count || 0;
  }

  async getQuestCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(quests);
    return result[0].count || 0;
  }
  
  async resetDatabase(): Promise<void> {
    // In a production environment, this method would have additional safeguards
    // For development, we'll provide a basic implementation
    
    // Delete data from all tables - order matters for foreign key constraints
    await db.delete(inventoryHistory);
    await db.delete(userAchievements);
    await db.delete(lootBoxes);
    await db.delete(craftedItems);
    await db.delete(submissions);
    await db.delete(userQuests);
    await db.delete(users);
    await db.delete(craftables);
    await db.delete(achievements);
    await db.delete(quests);
    await db.delete(items);
    await db.delete(lootBoxConfigs);
    await db.delete(craftingRecipes);
    
    // You could add initialization of default data here if needed
    console.log("Database reset completed");
  }
}

// Switch to using the DatabaseStorage implementation
// Close comment
*/

export const storage = new DatabaseStorage();
