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
  QuestComponent, InsertQuestComponent,
  ComponentKit, InsertComponentKit,
  KitComponent, InsertKitComponent,
  SystemSettings, InsertSystemSettings,
  LootBoxConfig, InsertLootBoxConfig,
  users, quests, userQuests, submissions, craftables, craftedItems,
  achievements, userAchievements, lootBoxes, inventoryHistory, craftingRecipes, items, lootBoxConfigs, characterEquipment,
  componentKits, kitComponents, questComponents, systemSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
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
  
  // Loot Box Config methods
  getLootBoxConfigs(): Promise<LootBoxConfig[]>;
  getLootBoxConfig(id: string): Promise<LootBoxConfig | undefined>;
  createLootBoxConfig(config: InsertLootBoxConfig): Promise<LootBoxConfig>;
  updateLootBoxConfig(id: string, configData: Partial<LootBoxConfig>): Promise<LootBoxConfig | undefined>;
  deleteLootBoxConfig(id: string): Promise<boolean>;
  
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
  
  // Component Kit methods
  getComponentKits(): Promise<ComponentKit[]>;
  getComponentKit(id: string): Promise<ComponentKit | undefined>;
  createComponentKit(kit: InsertComponentKit): Promise<ComponentKit>;
  updateComponentKit(id: string, kitData: Partial<ComponentKit>): Promise<ComponentKit | undefined>;
  deleteComponentKit(id: string): Promise<boolean>;
  
  // Kit Component methods
  getKitComponents(kitId: string): Promise<KitComponent[]>;
  getKitComponent(id: number): Promise<KitComponent | undefined>;
  createKitComponent(component: InsertKitComponent): Promise<KitComponent>;
  updateKitComponent(id: number, componentData: Partial<KitComponent>): Promise<KitComponent | undefined>;
  deleteKitComponent(id: number): Promise<boolean>;
  
  // Quest Component methods
  getQuestComponents(questId: number): Promise<QuestComponent[]>;
  getQuestComponentsWithDetails(questId: number): Promise<any[]>; // Returns an enriched component list with kit info
  createQuestComponent(component: InsertQuestComponent): Promise<QuestComponent>;
  updateQuestComponent(id: number, componentData: Partial<QuestComponent>): Promise<QuestComponent | undefined>;
  deleteQuestComponent(id: number): Promise<boolean>;
  deleteQuestComponentsByQuestId(questId: number): Promise<boolean>;
  
  // Statistics methods
  getUserCount(): Promise<number>;
  getItemCount(): Promise<number>;
  getCraftingRecipeCount(): Promise<number>;
  getQuestCount(): Promise<number>;
  
  // System Settings methods
  getSystemSettings(): Promise<SystemSettings[]>;
  getSystemSettingsByCategory(category: string): Promise<SystemSettings[]>;
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  createSystemSetting(setting: InsertSystemSettings): Promise<SystemSettings>;
  updateSystemSetting(key: string, value: any, category?: string): Promise<SystemSettings | undefined>;
  deleteSystemSetting(key: string): Promise<boolean>;
  
  // Database management methods
  resetDatabase(): Promise<void>;
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true
    });
  }
  
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

  async deleteUser(id: number): Promise<boolean> {
    try {
      // For proper foreign key constraints handling:
      // 1. Delete user submissions
      await db.delete(submissions).where(eq(submissions.userId, id));
      
      // 2. Delete user quests
      await db.delete(userQuests).where(eq(userQuests.userId, id));
      
      // 3. Delete user achievements
      await db.delete(userAchievements).where(eq(userAchievements.userId, id));
      
      // 4. Delete user loot boxes
      await db.delete(lootBoxes).where(eq(lootBoxes.userId, id));
      
      // 5. Delete user inventory history
      await db.delete(inventoryHistory).where(eq(inventoryHistory.userId, id));
      
      // 6. Delete user crafted items
      await db.delete(craftedItems).where(eq(craftedItems.userId, id));
      
      // 7. Delete character equipment
      await db.delete(characterEquipment).where(eq(characterEquipment.userId, id));
      
      // 8. Delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
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
  
  // Loot Box Config methods
  async getLootBoxConfigs(): Promise<LootBoxConfig[]> {
    return await db.select().from(lootBoxConfigs);
  }

  async getLootBoxConfig(id: string): Promise<LootBoxConfig | undefined> {
    const [config] = await db.select().from(lootBoxConfigs).where(eq(lootBoxConfigs.id, id));
    return config || undefined;
  }

  async createLootBoxConfig(insertConfig: InsertLootBoxConfig): Promise<LootBoxConfig> {
    // Add timestamps
    const now = new Date();
    const configWithTimestamps = {
      ...insertConfig,
      createdAt: now,
      updatedAt: now
    };
    
    const [config] = await db
      .insert(lootBoxConfigs)
      .values(configWithTimestamps)
      .returning();
    return config;
  }

  async updateLootBoxConfig(id: string, configData: Partial<LootBoxConfig>): Promise<LootBoxConfig | undefined> {
    // Always update the timestamp
    const dataWithTimestamp = {
      ...configData,
      updatedAt: new Date()
    };
    
    const [updatedConfig] = await db
      .update(lootBoxConfigs)
      .set(dataWithTimestamp)
      .where(eq(lootBoxConfigs.id, id))
      .returning();
    return updatedConfig || undefined;
  }

  async deleteLootBoxConfig(id: string): Promise<boolean> {
    try {
      await db
        .delete(lootBoxConfigs)
        .where(eq(lootBoxConfigs.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting loot box config:", error);
      return false;
    }
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

  async updateCraftingRecipe(id: number, recipeData: Partial<CraftingRecipe>): Promise<CraftingRecipe | undefined> {
    const [updatedRecipe] = await db
      .update(craftingRecipes)
      .set(recipeData)
      .where(eq(craftingRecipes.id, id))
      .returning();
    return updatedRecipe || undefined;
  }

  async deleteCraftingRecipe(id: number): Promise<boolean> {
    const result = await db.delete(craftingRecipes).where(eq(craftingRecipes.id, id));
    return !!result;
  }

  async getAvailableCraftingRecipes(userId: number): Promise<CraftingRecipe[]> {
    // Get all available crafting recipes
    const recipes = await this.getCraftingRecipes();
    // TODO: Filter based on user inventory
    return recipes;
  }
  
  // Character Equipment methods
  async getCharacterEquipment(userId: number): Promise<Record<string, any>> {
    const equipment = await db
      .select()
      .from(characterEquipment)
      .where(eq(characterEquipment.userId, userId));
    
    // Transform to slot -> item mapping
    const equipmentMap: Record<string, any> = {};
    for (const item of equipment) {
      equipmentMap[item.slot] = item;
    }
    
    return equipmentMap;
  }

  async equipItem(userId: number, itemId: string, slot: string): Promise<CharacterEquipment> {
    // First check if slot is already occupied
    const [existingItem] = await db
      .select()
      .from(characterEquipment)
      .where(and(
        eq(characterEquipment.userId, userId),
        eq(characterEquipment.slot, slot)
      ));
    
    if (existingItem) {
      // Update existing slot
      const [updatedItem] = await db
        .update(characterEquipment)
        .set({ itemId, equippedAt: new Date() })
        .where(eq(characterEquipment.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new equipment record
      const [newItem] = await db
        .insert(characterEquipment)
        .values({
          userId,
          itemId,
          slot,
          equippedAt: new Date()
        })
        .returning();
      return newItem;
    }
  }

  async unequipItem(userId: number, slot: string): Promise<boolean> {
    const result = await db
      .delete(characterEquipment)
      .where(and(
        eq(characterEquipment.userId, userId),
        eq(characterEquipment.slot, slot)
      ));
    
    return !!result;
  }
  
  // Component Kit methods
  async getComponentKits(): Promise<ComponentKit[]> {
    return await db.select().from(componentKits);
  }

  async getComponentKit(id: string): Promise<ComponentKit | undefined> {
    const [kit] = await db.select().from(componentKits).where(eq(componentKits.id, id));
    return kit || undefined;
  }

  async createComponentKit(insertKit: InsertComponentKit): Promise<ComponentKit> {
    const [kit] = await db
      .insert(componentKits)
      .values(insertKit)
      .returning();
    return kit;
  }

  async updateComponentKit(id: string, kitData: Partial<ComponentKit>): Promise<ComponentKit | undefined> {
    const [updatedKit] = await db
      .update(componentKits)
      .set(kitData)
      .where(eq(componentKits.id, id))
      .returning();
    return updatedKit || undefined;
  }

  async deleteComponentKit(id: string): Promise<boolean> {
    try {
      // First delete all kit components
      await db.delete(kitComponents).where(eq(kitComponents.kitId, id));
      // Then delete the kit
      await db.delete(componentKits).where(eq(componentKits.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting component kit:", error);
      return false;
    }
  }
  
  // Kit Component methods
  async getKitComponents(kitId: string): Promise<KitComponent[]> {
    return await db.select().from(kitComponents).where(eq(kitComponents.kitId, kitId));
  }

  async getKitComponent(id: number): Promise<KitComponent | undefined> {
    const [component] = await db.select().from(kitComponents).where(eq(kitComponents.id, id));
    return component || undefined;
  }

  async createKitComponent(insertComponent: InsertKitComponent): Promise<KitComponent> {
    const [component] = await db
      .insert(kitComponents)
      .values(insertComponent)
      .returning();
    return component;
  }

  async updateKitComponent(id: number, componentData: Partial<KitComponent>): Promise<KitComponent | undefined> {
    const [updatedComponent] = await db
      .update(kitComponents)
      .set(componentData)
      .where(eq(kitComponents.id, id))
      .returning();
    return updatedComponent || undefined;
  }

  async deleteKitComponent(id: number): Promise<boolean> {
    const result = await db.delete(kitComponents).where(eq(kitComponents.id, id));
    return !!result;
  }
  
  // Quest Component methods
  async getQuestComponents(questId: number): Promise<QuestComponent[]> {
    return await db
      .select()
      .from(questComponents)
      .where(eq(questComponents.questId, questId));
  }

  async getQuestComponentsWithDetails(questId: number): Promise<any[]> {
    try {
      // Get quest components
      const components = await db
        .select()
        .from(questComponents)
        .where(eq(questComponents.questId, questId));
      
      // If no components, return empty array
      if (!components.length) return [];
      
      // Get component details from kit components
      const formattedComponents = await Promise.all(components.map(async (component) => {
        if (!component.componentId) {
          return {
            id: component.id,
            name: "Custom Component",
            description: "No description available",
            imagePath: null,
            kitId: null,
            kitName: null,
            isRequired: component.isOptional === false,
            quantity: component.quantity || 1
          };
        }
        
        // Get kit component details
        const [kitComponent] = await db
          .select()
          .from(kitComponents)
          .where(eq(kitComponents.id, component.componentId));
        
        if (!kitComponent) {
          return {
            id: component.id,
            name: "Unknown Component",
            description: "Component not found",
            imagePath: null,
            kitId: null,
            kitName: null,
            isRequired: component.isOptional === false,
            quantity: component.quantity || 1
          };
        }
        
        // Get kit name
        const [kit] = await db
          .select()
          .from(componentKits)
          .where(eq(componentKits.id, kitComponent.kitId));
        
        return {
          id: component.id,
          name: kitComponent.name,
          description: kitComponent.description,
          imagePath: kitComponent.imagePath,
          kitId: kitComponent.kitId,
          kitName: kit ? kit.name : "Unknown Kit",
          isRequired: component.isOptional === false,
          quantity: component.quantity || 1,
          status: component.status || 'required'
        };
      }));
      
      return formattedComponents;
    } catch (error) {
      console.error("Error fetching quest components with details:", error);
      return [];
    }
  }

  async createQuestComponent(component: InsertQuestComponent): Promise<QuestComponent> {
    const [newComponent] = await db.insert(questComponents).values(component).returning();
    return newComponent;
  }

  async updateQuestComponent(id: number, componentData: Partial<QuestComponent>): Promise<QuestComponent | undefined> {
    const [updatedComponent] = await db
      .update(questComponents)
      .set(componentData)
      .where(eq(questComponents.id, id))
      .returning();
    return updatedComponent || undefined;
  }

  async deleteQuestComponent(id: number): Promise<boolean> {
    const result = await db.delete(questComponents).where(eq(questComponents.id, id));
    return true;
  }

  async deleteQuestComponentsByQuestId(questId: number): Promise<boolean> {
    const result = await db.delete(questComponents).where(eq(questComponents.questId, questId));
    return true;
  }
  
  // System Settings methods
  async getSystemSettings(): Promise<SystemSettings[]> {
    return await db.select().from(systemSettings);
  }
  
  async getSystemSettingsByCategory(category: string): Promise<SystemSettings[]> {
    return await db.select().from(systemSettings).where(eq(systemSettings.category, category));
  }
  
  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
    return setting;
  }
  
  async createSystemSetting(setting: InsertSystemSettings): Promise<SystemSettings> {
    const [newSetting] = await db.insert(systemSettings).values(setting).returning();
    return newSetting;
  }
  
  async updateSystemSetting(key: string, value: any, category?: string): Promise<SystemSettings | undefined> {
    const updateData: Partial<SystemSettings> = {
      value,
      updatedAt: new Date()
    };
    
    if (category) {
      updateData.category = category;
    }
    
    const [updatedSetting] = await db
      .update(systemSettings)
      .set(updateData)
      .where(eq(systemSettings.key, key))
      .returning();
      
    return updatedSetting;
  }
  
  async deleteSystemSetting(key: string): Promise<boolean> {
    const result = await db
      .delete(systemSettings)
      .where(eq(systemSettings.key, key));
      
    return true;
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
  
  // Additional methods required by the interface
  async addUserXP(userId: number, xpAmount: number): Promise<User> {
    // First get the user
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Calculate the current XP and level
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXP = currentXP + xpAmount;
    
    // Simple level calculation based on xpToNextLevel field
    let newLevel = currentLevel;
    let xpToNextLevel = user.xpToNextLevel || 300; // Default 300 XP for next level
    
    // Calculate if user levels up
    if (newXP >= xpToNextLevel) {
      newLevel = currentLevel + 1;
      // Each level requires more XP: base * level^1.5
      const nextLevelXP = Math.round(300 * Math.pow(newLevel, 1.5));
      
      // Update user with new XP and level
      const updatedUser = await this.updateUser(userId, {
        xp: newXP,
        level: newLevel,
        xpToNextLevel: nextLevelXP
      });
      
      if (!updatedUser) {
        throw new Error(`Failed to update user with ID ${userId}`);
      }
      
      return updatedUser;
    } else {
      // Just update XP, no level change
      const updatedUser = await this.updateUser(userId, {
        xp: newXP
      });
      
      if (!updatedUser) {
        throw new Error(`Failed to update user with ID ${userId}`);
      }
      
      return updatedUser;
    }
  }
  
  async getAvailableQuestsForUser(userId: number): Promise<Quest[]> {
    console.log(`Getting available quests for user ${userId}`);
    try {
      // For now, just return all active quests
      const availableQuests = await db.select().from(quests).where(eq(quests.active, true));
      console.log(`Found ${availableQuests.length} available quests:`, availableQuests.map(q => q.title));
      return availableQuests;
    } catch (error) {
      console.error('Error in getAvailableQuestsForUser:', error);
      return [];
    }
  }

  async getQuestsByAdventureLine(adventureLine: string): Promise<Quest[]> {
    return await db
      .select()
      .from(quests)
      .where(eq(quests.adventureLine, adventureLine))
      .orderBy(quests.orderInLine);
  }

  async resetDatabase(): Promise<void> {
    // This is a dangerous operation and should be used with caution
    console.warn("resetDatabase() called - This would reset the entire database");
    // Implementation would go here for development environments only
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();