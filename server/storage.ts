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
  InventoryHistory, InsertInventoryHistory
} from "@shared/schema";

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
  
  // Database management methods
  resetDatabase(): Promise<void>;
}

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
    // Create default users
    // Demo user
    const demoUser = this.createUser({
      username: 'demo',
      email: 'demo@questgiver.com',
      password: 'demo123', // In a real app, this would be hashed
      roles: ['user'],
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
      sourceId: null,
      acquiredAt: new Date(),
      openedAt: null
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
      sourceId: null,
      acquiredAt: new Date(),
      openedAt: null
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

export const storage = new MemStorage();
