import { pgTable, text, serial, integer, timestamp, json, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email"),
  password: text("password"), // Added for regular login
  discordId: text("discord_id"),
  avatar: text("avatar_url"),
  roles: json("roles").$type<string[]>().default([]),
  level: integer("level").default(1),
  xp: integer("xp").default(0), // New field for XP tracking
  xpToNextLevel: integer("xp_to_next_level").default(300), // XP required for next level
  completedQuests: json("completed_quests").$type<number[]>().default([]), // Track completed quest IDs
  inventory: json("inventory").$type<Record<string, number>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow(),
});

// Quests table
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  title: text("title").notNull(),
  description: text("description").notNull(),
  adventureLine: text("adventure_line").notNull(), // Changed from kitRequired to adventureLine
  difficulty: integer("difficulty").notNull(),
  orderInLine: integer("order_in_line").notNull().default(0), // New field for sequential ordering
  xpReward: integer("xp_reward").notNull().default(100), // New field for XP rewards
  lootBoxRewards: json("loot_box_rewards").$type<{type: string, quantity: number}[]>().default([]),
  active: boolean("active").default(true), // Changed default to true
  // Quest page content
  content: json("content").$type<{
    videos: string[],
    images: string[],
    codeBlocks: {language: string, code: string}[]
  }>().default({videos: [], images: [], codeBlocks: []}),
});

// User Quests status table
export const userQuests = pgTable("user_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").notNull(),
  status: text("status").notNull(), // active, completed, available, upcoming, locked
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").notNull(),
  description: text("description").notNull(),
  code: text("code"),
  image: text("image"), // Base64 encoded
  createdAt: timestamp("created_at").defaultNow(),
});

// Craftable Items table
export const craftables = pgTable("craftables", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  recipe: json("recipe").$type<{type: string, quantity: number}[]>().notNull(),
  type: text("type").notNull(), // physical, digital
});

// Crafted Items table
export const craftedItems = pgTable("crafted_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  craftableId: integer("craftable_id").notNull(),
  name: text("name").notNull(),         // Copy of the craftable name at time of crafting
  description: text("description").notNull(), // Copy of the description at time of crafting
  image: text("image").notNull(),        // Copy of the image at time of crafting
  type: text("type").notNull(),         // physical, digital (copy from craftable)
  dateCrafted: timestamp("date_crafted").defaultNow(),
  status: text("status").default("pending"), // pending, shipped, delivered, unlocked, redeemed
  tracking: text("tracking"),
  address: text("address"),
  redemptionData: json("redemption_data").default({}), // Could store codes, download links, etc.
  redeemedAt: timestamp("redeemed_at"),
  shippingInfo: json("shipping_info").default({}), // Name, address, etc. for physical items
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tier: text("tier").notNull(), // apprentice, journeyman, master, archmage
  icon: text("icon").notNull(),
  requirementType: text("requirement_type").notNull(), // quests_completed, crafted_items, etc.
  requirementValue: integer("requirement_value").notNull(),
});

// User Achievements table
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlocked: boolean("unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  progress: integer("progress").default(0),
});

// Loot Boxes table
export const lootBoxes = pgTable("loot_boxes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // common, rare, epic, legendary
  opened: boolean("opened").default(false),
  acquiredAt: timestamp("acquired_at").defaultNow(),
  openedAt: timestamp("opened_at"),
  rewards: json("rewards").$type<{type: string, quantity: number}[]>().default([]),
  source: text("source").notNull(), // quest, achievement, etc.
  sourceId: integer("source_id"), // ID of the quest, achievement, etc.
});

// Inventory History table
export const inventoryHistory = pgTable("inventory_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  action: text("action").notNull(), // gained, used
  source: text("source").notNull(), // quest, crafting, loot_box, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Crafting Recipes for Minecraft-style 5x5 grid
export const craftingRecipes = pgTable("crafting_recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  flavorText: text("flavor_text"),
  resultItem: text("result_item").notNull(),
  resultQuantity: integer("result_quantity").notNull().default(1),
  gridSize: integer("grid_size").notNull().default(5),
  // Pattern is a 2D array representing required items in each position (e.g., [["cloth", null, "cloth"], [null, "metal", null]])
  pattern: jsonb("pattern").$type<(string | null)[][]>().notNull(),
  // Dictionary of items required with quantities (e.g., { "cloth": 2, "metal": 1 })
  requiredItems: jsonb("required_items").$type<Record<string, number>>().notNull(),
  difficulty: text("difficulty").notNull().default("easy"), // easy, medium, hard
  category: text("category").notNull().default("general"), // general, electronics, mechanical, etc.
  unlocked: boolean("unlocked").notNull().default(true),
  image: text("image").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Items database table for centralized item management
export const items = pgTable("items", {
  id: text("id").primaryKey(), // e.g., "copper", "crystal"
  name: text("name").notNull(),
  description: text("description").notNull(),
  flavorText: text("flavor_text"), // Made optional
  rarity: text("rarity", { enum: ["common", "uncommon", "rare", "epic", "legendary"] }).notNull(),
  craftingUses: jsonb("crafting_uses").$type<string[]>().default([]), // Made optional with default empty array
  imagePath: text("image_path"), // Made optional
  category: text("category").default("resource"), // Made optional with default value - resource, component, tool, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Loot box configuration table
export const lootBoxConfigs = pgTable("loot_box_configs", {
  id: text("id").primaryKey(), // e.g., "common", "rare", "legendary", "quest"
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity", { enum: ["common", "uncommon", "rare", "epic", "legendary"] }).notNull(),
  // Array of {itemId: string, weight: number, minQuantity: number, maxQuantity: number}
  itemDropTable: jsonb("item_drop_table").$type<{itemId: string, weight: number, minQuantity: number, maxQuantity: number}[]>().notNull(),
  minRewards: integer("min_rewards").notNull().default(1),
  maxRewards: integer("max_rewards").notNull().default(3),
  image: text("image").notNull().default("/images/loot-crate.png"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  discordId: true,
  avatar: true,
  roles: true,
  inventory: true,
  level: true,
  xp: true,
  xpToNextLevel: true,
  completedQuests: true,
});

export const insertQuestSchema = createInsertSchema(quests).pick({
  date: true,
  title: true,
  description: true,
  adventureLine: true,
  difficulty: true,
  orderInLine: true,
  xpReward: true,
  lootBoxRewards: true,
  content: true,
  active: true,
});

export const insertUserQuestSchema = createInsertSchema(userQuests).pick({
  userId: true,
  questId: true,
  status: true,
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  userId: true,
  questId: true,
  description: true,
  code: true,
  image: true,
});

export const insertCraftableSchema = createInsertSchema(craftables).pick({
  name: true,
  description: true,
  image: true,
  recipe: true,
  type: true,
});

export const insertCraftedItemSchema = createInsertSchema(craftedItems).pick({
  userId: true,
  craftableId: true,
  name: true,
  description: true,
  image: true,
  type: true,
  status: true,
  tracking: true,
  address: true,
  redemptionData: true,
  redeemedAt: true,
  shippingInfo: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  tier: true,
  icon: true,
  requirementType: true,
  requirementValue: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).pick({
  userId: true,
  achievementId: true,
  unlocked: true,
  progress: true,
});

export const insertLootBoxSchema = createInsertSchema(lootBoxes).pick({
  userId: true,
  type: true,
  opened: true,
  rewards: true,
  source: true,
  sourceId: true,
  acquiredAt: true,
  openedAt: true,
});

export const insertInventoryHistorySchema = createInsertSchema(inventoryHistory).pick({
  userId: true,
  type: true,
  quantity: true,
  action: true,
  source: true,
});

export const insertCraftingRecipeSchema = createInsertSchema(craftingRecipes).pick({
  name: true,
  description: true,
  flavorText: true,
  resultItem: true,
  resultQuantity: true,
  gridSize: true,
  pattern: true,
  requiredItems: true,
  difficulty: true,
  category: true,
  unlocked: true,
  image: true
});

export const insertItemSchema = createInsertSchema(items).pick({
  id: true,
  name: true,
  description: true,
  flavorText: true,
  rarity: true,
  craftingUses: true,
  imagePath: true,
  category: true
});

export const insertLootBoxConfigSchema = createInsertSchema(lootBoxConfigs).pick({
  id: true,
  name: true,
  description: true,
  rarity: true,
  itemDropTable: true,
  minRewards: true,
  maxRewards: true,
  image: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;

export type UserQuest = typeof userQuests.$inferSelect;
export type InsertUserQuest = z.infer<typeof insertUserQuestSchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Craftable = typeof craftables.$inferSelect;
export type InsertCraftable = z.infer<typeof insertCraftableSchema>;

export type CraftedItem = typeof craftedItems.$inferSelect;
export type InsertCraftedItem = z.infer<typeof insertCraftedItemSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type LootBox = typeof lootBoxes.$inferSelect;
export type InsertLootBox = z.infer<typeof insertLootBoxSchema>;

export type InventoryHistory = typeof inventoryHistory.$inferSelect;
export type InsertInventoryHistory = z.infer<typeof insertInventoryHistorySchema>;

export type CraftingRecipe = typeof craftingRecipes.$inferSelect;
export type InsertCraftingRecipe = z.infer<typeof insertCraftingRecipeSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type LootBoxConfig = typeof lootBoxConfigs.$inferSelect;
export type InsertLootBoxConfig = z.infer<typeof insertLootBoxConfigSchema>;
