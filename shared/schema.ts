import { pgTable, text, serial, integer, bigint, timestamp, json, boolean, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  titles: json("titles").$type<string[]>().default([]), // List of unlocked titles
  activeTitle: text("active_title"), // Currently displayed title
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow(),
});

// Quests table
export const quests = pgTable("quests", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  date: text("date"), // YYYY-MM-DD format (optional)
  title: text("title").notNull(),
  description: text("description").notNull(),  // Will be used as flavor text
  missionBrief: text("mission_brief"),         // Direct mission instructions
  adventureLine: text("adventure_line").notNull(), // Changed from kitRequired to adventureLine
  difficulty: integer("difficulty").notNull(),
  orderInLine: integer("order_in_line").notNull().default(0), // New field for sequential ordering
  xpReward: integer("xp_reward").notNull().default(100), // New field for XP rewards
  // Updated rewards structure to support different types of rewards
  rewards: json("rewards").$type<{
    type: 'lootbox' | 'item' | 'equipment', // Type of reward
    id: string,                            // ID of the item or lootbox
    quantity: number                       // Quantity to give
  }[]>().default([]),
  // Keep backward compatibility
  lootBoxRewards: json("loot_box_rewards").$type<{type: string, quantity: number}[]>().default([]),
  active: boolean("active").default(true), // Changed default to true
  // Quest page content
  content: json("content").$type<{
    videos: string[],
    images: string[],
    codeBlocks: {language: string, code: string}[]
  }>().default({videos: [], images: [], codeBlocks: []}),
  // Reference to a component kit (if this quest requires physical components)
  kitId: text("kit_id").references(() => componentKits.id, { onDelete: 'set null' }),
});

// User Quests status table
export const userQuests = pgTable("user_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: bigint("quest_id", { mode: "number" }).notNull(),
  status: text("status").notNull(), // active, completed, available, upcoming, locked
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questId: bigint("quest_id", { mode: "number" }).notNull(),
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
  rewards: json("rewards").$type<{type: string, id: string, quantity: number}[]>().default([]),
  source: text("source").notNull(), // quest, achievement, etc.
  sourceId: text("source_id"), // ID of the quest, achievement, etc.
  name: text("name"), // User-friendly name
  description: text("description"), // Description text
  rarity: text("rarity", { enum: ["common", "uncommon", "rare", "epic", "legendary"] }), // Rarity level
  image: text("image"), // Image path
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
  heroImage: text("hero_image"),
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
  isEquippable: boolean("is_equippable").default(false),
  equipSlot: text("equip_slot", { enum: ["head", "torso", "legs", "accessory", "hands"] }),
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

// Character equipment table
export const characterEquipment = pgTable("character_equipment", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemId: text("item_id").notNull(),
  slot: text("slot", { enum: ["head", "torso", "legs", "accessory", "hands"] }).notNull(),
  equippedAt: timestamp("equipped_at").defaultNow(),
});

// System Settings table
export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  category: text("category").notNull().default("general"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mission Comments table - for maker community interaction
export const missionComments = pgTable("mission_comments", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => quests.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"), // For replies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Discord integration
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),
  // Moderation
  isHidden: boolean("is_hidden").default(false),
  hiddenReason: text("hidden_reason"),
});

// Mission Diagrams table - for cheatsheet diagrams
export const missionDiagrams = pgTable("mission_diagrams", {
  id: serial("id").primaryKey(),
  questId: integer("quest_id").notNull().references(() => quests.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(), // Main diagram image
  cheatsheetImageUrl: text("cheatsheet_image_url"), // Revealed cheatsheet overlay
  cheatsheetCode: text("cheatsheet_code"), // Code snippet for cheatsheet
  order: integer("order").notNull().default(0), // Display order
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Arduino Circuit Projects table - for saving user-created circuit designs
export const circuitProjects = pgTable("circuit_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  // The actual circuit design, stored as a serialized JSON object
  circuit: jsonb("circuit").notNull(),
  // The Arduino code associated with this circuit
  code: text("code").notNull(),
  thumbnail: text("thumbnail"), // Optional image representation
  isPublic: boolean("is_public").default(false),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auction Listings table - for BMAH (Black Market Auction House)
export const auctionListings = pgTable("auction_listings", {
  id: text("id").primaryKey().default('gen_random_uuid()'), 
  itemId: text("item_id").notNull(),
  itemName: text("item_name").notNull(),
  itemDescription: text("item_description"),
  itemImagePath: text("item_image_path"),
  itemRarity: text("item_rarity", { enum: ["common", "uncommon", "rare", "epic", "legendary"] }).notNull(),
  startingBid: integer("starting_bid").notNull(),
  currentBid: integer("current_bid").notNull(),
  bidIncrement: integer("bid_increment").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  status: text("status", { enum: ["active", "ended", "cancelled"] }).notNull().default("active"),
  highestBidder: text("highest_bidder"), // User ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Arduino Components table - for metadata about available components
export const arduinoComponents = pgTable("arduino_components", {
  id: text("id").primaryKey(), // e.g., "led", "button", "resistor"
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "input", "output", "passive"
  iconPath: text("icon_path").notNull(),
  pins: json("pins").$type<{
    name: string,
    type: 'input' | 'output' | 'power' | 'ground',
    description: string
  }[]>().notNull(),
  properties: jsonb("properties").$type<Record<string, any>>().default({}),
  exampleCode: text("example_code"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Settings for Arduino Simulator
export const userSimulatorSettings = pgTable("user_simulator_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preferences: jsonb("preferences").$type<{
    theme: string,
    fontSize: number,
    autosave: boolean,
    livePreview: boolean,
    highlightSyntax: boolean
  }>().default({
    theme: "default",
    fontSize: 14,
    autosave: true,
    livePreview: true,
    highlightSyntax: true
  }),
  recentProjects: json("recent_projects").$type<number[]>().default([]),
  savedTemplates: jsonb("saved_templates").$type<{
    name: string,
    circuit: any,
    code: string
  }[]>().default([]),
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
  titles: true,
  activeTitle: true,
});

export const insertQuestSchema = createInsertSchema(quests).pick({
  date: true,
  title: true,
  description: true,      // Now used as flavor text
  missionBrief: true,     // Direct mission instructions
  adventureLine: true,
  difficulty: true,
  orderInLine: true,
  xpReward: true,
  rewards: true,          // New field for item-linked rewards
  lootBoxRewards: true,   // Keep for backward compatibility
  content: true,
  active: true,
  kitId: true,            // Reference to component kit
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
  name: true,
  description: true,
  rarity: true,
  image: true,
});

export const insertInventoryHistorySchema = createInsertSchema(inventoryHistory).pick({
  userId: true,
  type: true,
  quantity: true,
  action: true,
  source: true,
});

// Mission comments and diagrams schema
export const insertMissionCommentSchema = createInsertSchema(missionComments).pick({
  questId: true,
  userId: true,
  content: true,
  parentCommentId: true,
  discordUsername: true,
  discordAvatar: true,
});

export const insertMissionDiagramSchema = createInsertSchema(missionDiagrams).pick({
  questId: true,
  title: true,
  description: true,
  imageUrl: true,
  cheatsheetImageUrl: true,
  cheatsheetCode: true,
  order: true,
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
  image: true,
  heroImage: true
});

export const insertItemSchema = createInsertSchema(items).pick({
  id: true,
  name: true,
  description: true,
  flavorText: true,
  rarity: true,
  craftingUses: true,
  imagePath: true,
  category: true,
  isEquippable: true,
  equipSlot: true
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

export const insertCharacterEquipmentSchema = createInsertSchema(characterEquipment).pick({
  userId: true,
  itemId: true,
  slot: true
});

// Insert schemas for Arduino tables
export const insertCircuitProjectSchema = createInsertSchema(circuitProjects).pick({
  userId: true,
  name: true,
  description: true,
  circuit: true,
  code: true,
  thumbnail: true,
  isPublic: true,
  tags: true
});

export const insertArduinoComponentSchema = createInsertSchema(arduinoComponents).pick({
  id: true,
  name: true,
  description: true,
  category: true,
  iconPath: true,
  pins: true,
  properties: true,
  exampleCode: true
});

export const insertUserSimulatorSettingsSchema = createInsertSchema(userSimulatorSettings).pick({
  userId: true,
  preferences: true,
  recentProjects: true,
  savedTemplates: true
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

export type CharacterEquipment = typeof characterEquipment.$inferSelect;
export type InsertCharacterEquipment = z.infer<typeof insertCharacterEquipmentSchema>;

// Arduino table types
export type CircuitProject = typeof circuitProjects.$inferSelect;
export type InsertCircuitProject = z.infer<typeof insertCircuitProjectSchema>;

export type ArduinoComponent = typeof arduinoComponents.$inferSelect;
export type InsertArduinoComponent = z.infer<typeof insertArduinoComponentSchema>;

export type UserSimulatorSettings = typeof userSimulatorSettings.$inferSelect;
export type InsertUserSimulatorSettings = z.infer<typeof insertUserSimulatorSettingsSchema>;

export type MissionComment = typeof missionComments.$inferSelect;
export type InsertMissionComment = z.infer<typeof insertMissionCommentSchema>;

export type MissionDiagram = typeof missionDiagrams.$inferSelect;
export type InsertMissionDiagram = z.infer<typeof insertMissionDiagramSchema>;

// Component Kits table - for educational kits (Arduino, Raspberry Pi, etc.)
export const componentKits = pgTable("component_kits", {
  id: text("id").primaryKey(), // e.g., "arduino", "raspberry-pi"
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"),
  category: text("category").default("electronics"), // electronics, robotics, etc.
  difficulty: text("difficulty", { enum: ["beginner", "intermediate", "advanced"] }).default("beginner"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Kit Artwork table for storing reference images for AI generation
export const kitArtwork = pgTable("kit_artwork", {
  id: serial("id").primaryKey(),
  kitId: text("kit_id").notNull().references(() => componentKits.id, { onDelete: 'cascade' }),
  imagePath: text("image_path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Kit Components table - components within each kit
export const kitComponents = pgTable("kit_components", {
  id: serial("id").primaryKey(),
  kitId: text("kit_id").notNull().references(() => componentKits.id), // References the component_kits table
  name: text("name").notNull(),
  description: text("description").notNull(),
  imagePath: text("image_path"),
  partNumber: text("part_number"), // Manufacturer part number if applicable
  isRequired: boolean("is_required").default(true), // Whether component is essential
  quantity: integer("quantity").default(1), // How many of this component come in the kit
  category: text("category").default("hardware"), // hardware, sensor, actuator, connector, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quest Components table - tracks which components are required for each quest
export const questComponents = pgTable("quest_components", {
  id: serial("id").primaryKey(),
  questId: bigint("quest_id", { mode: "number" }).notNull(),
  componentId: integer("component_id").notNull(), // References the kit_components table
  quantity: integer("quantity").default(1), // How many of this component are needed
  isOptional: boolean("is_optional").default(false), // Whether this component is optional for quest completion
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas for new tables
export const insertComponentKitSchema = createInsertSchema(componentKits).pick({
  id: true,
  name: true,
  description: true,
  imagePath: true,
  category: true,
  difficulty: true,
});

// Create a base schema that will be modified to handle type conversions
const baseKitComponentSchema = createInsertSchema(kitComponents).pick({
  kitId: true,
  name: true,
  description: true,
  imagePath: true,
  partNumber: true,
  isRequired: true,
  quantity: true,
  category: true,
});

// Enhanced schema with type coercion
export const insertKitComponentSchema = baseKitComponentSchema.extend({
  isRequired: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true')
  ]),
  quantity: z.union([
    z.number(),
    z.string().transform(val => parseInt(val, 10))
  ]),
  partNumber: z.union([z.string(), z.null()]).optional(),
  imagePath: z.string().optional(),
  category: z.string().default('hardware'),
});

export const insertQuestComponentSchema = createInsertSchema(questComponents).pick({
  questId: true,
  componentId: true,
  quantity: true,
  isOptional: true,
});

// Insert schema for kit artwork
export const insertKitArtworkSchema = createInsertSchema(kitArtwork).pick({
  kitId: true,
  imagePath: true,
});

// Types for new tables
export type ComponentKit = typeof componentKits.$inferSelect;
export type InsertComponentKit = z.infer<typeof insertComponentKitSchema>;

export type KitArtwork = typeof kitArtwork.$inferSelect;
export type InsertKitArtwork = z.infer<typeof insertKitArtworkSchema>;

export type KitComponent = typeof kitComponents.$inferSelect;
export type InsertKitComponent = z.infer<typeof insertKitComponentSchema>;

export type QuestComponent = typeof questComponents.$inferSelect;
export type InsertQuestComponent = z.infer<typeof insertQuestComponentSchema>;

// Insert schema for system settings
export const insertSystemSettingsSchema = createInsertSchema(systemSettings).pick({
  key: true,
  value: true,
  category: true,
});

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

// Define relations between tables
export const componentKitsRelations = relations(componentKits, ({ many }) => ({
  components: many(kitComponents),
}));

export const kitComponentsRelations = relations(kitComponents, ({ one }) => ({
  kit: one(componentKits, {
    fields: [kitComponents.kitId],
    references: [componentKits.id],
  }),
}));

// Define circuit project relations
export const circuitProjectsRelations = relations(circuitProjects, ({ one }) => ({
  user: one(users, {
    fields: [circuitProjects.userId],
    references: [users.id],
  }),
}));

// Define user simulator settings relations
export const userSimulatorSettingsRelations = relations(userSimulatorSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSimulatorSettings.userId],
    references: [users.id],
  }),
}));

// Define lootbox relations
export const lootBoxesRelations = relations(lootBoxes, ({ one }) => ({
  user: one(users, {
    fields: [lootBoxes.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  lootBoxes: many(lootBoxes),
  circuitProjects: many(circuitProjects),
  simulatorSettings: many(userSimulatorSettings),
}));
