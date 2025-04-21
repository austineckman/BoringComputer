import { pgTable, text, serial, integer, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email"),
  discordId: text("discord_id"),
  avatar: text("avatar_url"),
  roles: json("roles").$type<string[]>().default([]),
  level: integer("level").default(1),
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
  kitRequired: text("kit_required").notNull(),
  difficulty: integer("difficulty").notNull(),
  adventureKit: text("adventure_kit").notNull(),
  rewards: json("rewards").$type<{type: string, quantity: number}[]>().notNull(),
  active: boolean("active").default(false),
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
  dateCrafted: timestamp("date_crafted").defaultNow(),
  status: text("status").default("pending"), // pending, shipped, delivered, unlocked
  tracking: text("tracking"),
  address: text("address"),
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

// Inventory History table
export const inventoryHistory = pgTable("inventory_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  action: text("action").notNull(), // gained, used
  source: text("source").notNull(), // quest, crafting, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  discordId: true,
  avatar: true,
  roles: true,
});

export const insertQuestSchema = createInsertSchema(quests).pick({
  date: true,
  title: true,
  description: true,
  kitRequired: true,
  difficulty: true,
  adventureKit: true,
  rewards: true,
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
  status: true,
  tracking: true,
  address: true,
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

export const insertInventoryHistorySchema = createInsertSchema(inventoryHistory).pick({
  userId: true,
  type: true,
  quantity: true,
  action: true,
  source: true,
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

export type InventoryHistory = typeof inventoryHistory.$inferSelect;
export type InsertInventoryHistory = z.infer<typeof insertInventoryHistorySchema>;
