import type { Express, Request, Response } from "express";
import express from 'express';
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { z } from "zod";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import { adminAuth } from "./middleware/adminAuth";
import path from 'path';
import { openLootBox, generateLootBoxRewards, LootBoxType } from './lootBoxSystem';
import { getItemDetails } from './itemDatabase';
import * as craftingRecipeRoutes from './routes/craftingRecipes';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import characterRoutes from './routes/character';
import adminUploadRoutes from './routes/admin/upload';
import adminKitsRoutes from './routes/admin-kits';
import { authenticate } from './auth';

// Legacy authentication middleware (now deprecated in favor of the one in auth.ts)
const legacyAuthenticate = async (req: Request, res: Response, next: Function) => {
  const sessionToken = req.cookies?.sessionToken;
  
  if (!sessionToken) {
    console.log('No session token found');
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    // For the demo, we'll use a simplified approach
    // Extract user ID from the first part of the token
    const userIdHex = sessionToken.split('-')[0];
    // If format is invalid, reject
    if (!userIdHex || !/^[0-9a-f]+$/i.test(userIdHex)) {
      console.log('Invalid token format:', sessionToken);
      return res.status(401).json({ message: "Invalid session token format" });
    }
    
    // Convert hex ID to number (limit to reasonable values)
    const userId = Math.min(parseInt(userIdHex, 16) % 1000, 100);  
    console.log('Authenticating user ID:', userId);
    
    // Get user from storage
    const user = await storage.getUser(userId);
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return res.status(401).json({ message: "User not found" });
    }
    
    // Set the user in request for subsequent use
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Admin-only middleware is now imported from ./middleware/adminAuth
// No need to redefine it here

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Serve static files from the public directory
  const publicPath = path.join(process.cwd(), 'public');
  app.use('/sounds', express.static(path.join(publicPath, 'sounds')));
  app.use('/uploads', express.static(path.join(publicPath, 'uploads')));
  
  // Set up sessions for users with improved cookie parsing
  app.use((req, res, next) => {
    try {
      // Parse cookies for session management
      const cookies: Record<string, string> = {};
      if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
          const parts = cookie.split('=');
          if (parts.length >= 2) {
            // Handle any malformed cookies
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            cookies[key] = value;
          }
        });
      }
      
      console.log('Parsed cookies:', JSON.stringify(cookies));
      (req as any).cookies = cookies;
      next();
    } catch (error) {
      console.error('Error parsing cookies:', error);
      (req as any).cookies = {};
      next();
    }
  });
  
  // Register the new auth routes
  app.use("/api/auth", authRoutes);
  
  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Demo accounts for testing
      let user;
      
      if (username === 'demo' && password === 'demo123') {
        // Demo user account
        user = await storage.getUserByUsername('demo');
        
        if (!user) {
          // Create demo user if it doesn't exist
          user = await storage.createUser({
            username: 'demo',
            email: 'demo@questgiver.com',
            password: 'demo123', // In a real app, this would be hashed
            roles: ['user'],
            level: 1,
            inventory: {
              'cloth': 5,
              'copper': 3,
              'techscrap': 2,
              'crystal': 1,
              'circuit-board': 0,
              'loot-crate': 3
            }
          });
        }
      } else if (username === 'admin' && password === 'admin123') {
        // Admin account
        user = await storage.getUserByUsername('admin');
        
        if (!user) {
          // Create admin user if it doesn't exist
          user = await storage.createUser({
            username: 'admin',
            email: 'admin@questgiver.com',
            password: 'admin123', // In a real app, this would be hashed
            roles: ['admin', 'user'],
            level: 10,
            inventory: {
              'cloth': 100,
              'copper': 100,
              'techscrap': 100,
              'crystal': 100,
              'circuit-board': 100,
              'loot-crate': 100
            }
          });
        }
      } else {
        // In a real app, this would check the database and verify password hashes
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate session token
      const sessionToken = `${user.id.toString(16).padStart(8, '0')}-${uuidv4().substring(9)}`;
      
      // Set session cookie with ultra-permissive settings for development
      res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; Path=/; Max-Age=86400`);
      
      // Return user data
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles,
        level: user.level,
        inventory: user.inventory
      });
      
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  });
  
  app.post('/api/auth/discord', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      // In a real app, we would exchange the token with Discord API
      // For demo purposes, we'll simulate this with mock data
      try {
        // This is where we would make a Discord API call
        // For demo, generate a mock Discord user
        const mockDiscordId = createHash('sha256').update(token).digest('hex').substring(0, 18);
        const username = `User_${mockDiscordId.substring(0, 6)}`;
        const mockDiscordResponse = {
          id: mockDiscordId,
          username,
          avatar: null,
          email: `${username}@example.com`,
        };
        
        // Check if user exists
        let user = await storage.getUserByDiscordId(mockDiscordResponse.id);
        
        if (!user) {
          // Create new user
          user = await storage.createUser({
            username: mockDiscordResponse.username,
            email: mockDiscordResponse.email,
            discordId: mockDiscordResponse.id,
            avatar: mockDiscordResponse.avatar ? `https://cdn.discordapp.com/avatars/${mockDiscordResponse.id}/${mockDiscordResponse.avatar}.png` : null,
            roles: ['user']
          });
          
          // Initialize sample inventory for new users
          await storage.updateUser(user.id, {
            inventory: {
              'cloth': 5,
              'copper': 7,
              'techscrap': 4,
              'crystal': 3,
              'circuit-board': 2,
              'loot-crate': 3
            }
          });
          
          // Add a welcome loot crate for Discord users
          await storage.createLootBox({
            userId: user.id,
            type: 'rare', // Give them a rare crate as a welcome gift
            opened: false,
            rewards: null, // Will be generated when opened
            source: 'Discord Account Link Bonus',
            sourceId: null
          });
          
          // Set up achievements for the user
          const achievements = await storage.getAchievements();
          for (const achievement of achievements) {
            await storage.createUserAchievement({
              userId: user.id,
              achievementId: achievement.id,
              unlocked: false,
              progress: 0
            });
          }
          
          // Set up user quests for the user
          const quests = await storage.getQuests();
          for (const quest of quests) {
            await storage.createUserQuest({
              userId: user.id,
              questId: quest.id,
              status: 'available'
            });
          }
        } else {
          // Update last login time
          user = await storage.updateUser(user.id, { lastLogin: new Date() });
        }
        
        // Generate session token
        const sessionToken = `${user.id.toString(16).padStart(8, '0')}-${uuidv4().substring(9)}`;
        
        // Set session cookie with ultra-permissive settings for development
        res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; Path=/; Max-Age=86400`);
        
        // Return user data
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          roles: user.roles,
          level: user.level,
          inventory: user.inventory
        });
      } catch (error) {
        console.error("Discord auth error:", error);
        return res.status(500).json({ message: "Failed to authenticate with Discord" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    // Clear the session cookie
    res.setHeader('Set-Cookie', 'sessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    return res.json({ success: true });
  });
  
  // Debug endpoint to reset database (development only)
  app.post('/api/debug/reset-database', async (req, res) => {
    try {
      // This will reset and reinitialize the database with the new starter loot boxes
      await storage.resetDatabase();
      return res.json({ success: true, message: "Database has been reset and reinitialized" });
    } catch (error) {
      console.error('Error resetting database:', error);
      return res.status(500).json({ message: "Failed to reset database" });
    }
  });
  
  app.get('/api/auth/me', authenticate, (req, res) => {
    const user = (req as any).user;
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      roles: user.roles,
      level: user.level,
      inventory: user.inventory
    });
  });
  
  // Quests routes
  app.get('/api/quests', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Get available quests based on user's progression
      const availableQuests = await storage.getAvailableQuestsForUser(user.id);
      const userQuests = await storage.getUserQuests(user.id);
      const allQuests = await storage.getQuests();
      
      // Group quests by adventure line to help with frontend organization
      const questsByAdventureLine: Record<string, any[]> = {};
      
      // Process all quests to determine their status
      allQuests.forEach(quest => {
        const adventureLine = quest.adventureLine;
        if (!questsByAdventureLine[adventureLine]) {
          questsByAdventureLine[adventureLine] = [];
        }
        
        // Find user's status for this quest
        const userQuest = userQuests.find(uq => uq.questId === quest.id);
        let status = 'locked';
        
        // If the quest is in available quests or has a user quest entry, determine status
        if (availableQuests.some(aq => aq.id === quest.id)) {
          status = 'available';
        }
        
        if (userQuest) {
          status = userQuest.status; // active or completed
        }
        
        // For completed quests, also check user's completedQuests array
        if (user.completedQuests && user.completedQuests.includes(quest.id)) {
          status = 'completed';
        }
        
        questsByAdventureLine[adventureLine].push({
          id: quest.id.toString(),
          date: quest.date,
          title: quest.title,
          description: quest.description,
          adventureLine: quest.adventureLine,
          difficulty: quest.difficulty,
          orderInLine: quest.orderInLine,
          xpReward: quest.xpReward,
          rewards: quest.rewards,
          content: quest.content,
          lootBoxRewards: quest.lootBoxRewards,
          kitId: quest.kitId,
          status
        });
      });
      
      // Sort each adventure line by orderInLine
      for (const adventureLine in questsByAdventureLine) {
        questsByAdventureLine[adventureLine].sort((a, b) => a.orderInLine - b.orderInLine);
      }
      
      return res.json({
        questsByAdventureLine,
        // Also include a flat list for backward compatibility
        allQuests: Object.values(questsByAdventureLine).flat()
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch quests" });
    }
  });
  
  app.get('/api/quests/active', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const userQuests = await storage.getUserQuests(user.id);
      const activeUserQuest = userQuests.find(uq => uq.status === 'active');
      
      if (!activeUserQuest) {
        return res.json(null);
      }
      
      const quest = await storage.getQuest(activeUserQuest.questId);
      
      if (!quest) {
        return res.json(null);
      }
      
      return res.json({
        id: quest.id.toString(),
        date: quest.date,
        title: quest.title,
        description: quest.description,
        adventureLine: quest.adventureLine,
        difficulty: quest.difficulty,
        orderInLine: quest.orderInLine,
        xpReward: quest.xpReward,
        rewards: quest.rewards,
        content: quest.content,
        lootBoxRewards: quest.lootBoxRewards,
        kitId: quest.kitId
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch active quest" });
    }
  });
  
  app.post('/api/quests/:questId/start', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const questId = parseInt(req.params.questId);
      
      // Verify the quest exists
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      // Check if the user already has an active quest
      const userQuests = await storage.getUserQuests(user.id);
      const activeQuest = userQuests.find(uq => uq.status === 'active');
      
      if (activeQuest) {
        // Set the previously active quest to available
        await storage.updateUserQuest(activeQuest.id, { status: 'available' });
      }
      
      // Set the new quest as active
      const userQuest = userQuests.find(uq => uq.questId === questId);
      
      if (userQuest) {
        await storage.updateUserQuest(userQuest.id, { status: 'active' });
      } else {
        await storage.createUserQuest({
          userId: user.id,
          questId,
          status: 'active'
        });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to start quest" });
    }
  });
  
  app.post('/api/quests/:questId/complete', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const questId = parseInt(req.params.questId);
      const { submission, image } = req.body;
      
      if (!submission) {
        return res.status(400).json({ message: "Submission text is required" });
      }
      
      // Verify the quest exists
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      // Check if the user has this quest as active
      const userQuests = await storage.getUserQuests(user.id);
      const activeQuest = userQuests.find(uq => uq.questId === questId && uq.status === 'active');
      
      if (!activeQuest) {
        return res.status(400).json({ message: "This quest is not currently active" });
      }
      
      // Create submission
      await storage.createSubmission({
        userId: user.id,
        questId,
        description: submission,
        code: null,
        image: image || null
      });
      
      // Mark quest as completed
      await storage.updateUserQuest(activeQuest.id, { status: 'completed' });
      
      // Add quest to user's completed quests array
      const completedQuests = user.completedQuests || [];
      if (!completedQuests.includes(questId)) {
        completedQuests.push(questId);
      }
      
      // Add rewards to user's inventory
      const inventory = { ...user.inventory };
      
      // Process new rewards format
      if (quest.rewards && quest.rewards.length > 0) {
        for (const reward of quest.rewards) {
          // For items and equipment, add directly to inventory
          if (reward.type === 'item' || reward.type === 'equipment') {
            inventory[reward.id] = (inventory[reward.id] || 0) + reward.quantity;
            
            // Create inventory history
            await storage.createInventoryHistory({
              userId: user.id,
              type: reward.id,
              quantity: reward.quantity,
              action: 'gained',
              source: 'quest'
            });
          } 
          // For lootboxes, create lootbox entries
          else if (reward.type === 'lootbox') {
            // Create loot boxes
            for (let i = 0; i < reward.quantity; i++) {
              await storage.createLootBox({
                userId: user.id,
                type: reward.id, // lootbox type (common, rare, etc.)
                opened: false,
                rewards: [],
                source: 'quest',
                sourceId: questId
              });
            }
            
            // Add entry to inventory history
            await storage.createInventoryHistory({
              userId: user.id,
              type: `lootbox-${reward.id}`,
              quantity: reward.quantity,
              action: 'gained',
              source: 'quest'
            });
          }
        }
      }
      
      // Process legacy lootbox rewards for backward compatibility
      if (quest.lootBoxRewards && quest.lootBoxRewards.length > 0) {
        for (const reward of quest.lootBoxRewards) {
          // Create loot boxes
          for (let i = 0; i < reward.quantity; i++) {
            await storage.createLootBox({
              userId: user.id,
              type: reward.type,
              opened: false,
              rewards: [],
              source: 'quest',
              sourceId: questId
            });
          }
          
          // Add entry to inventory history
          await storage.createInventoryHistory({
            userId: user.id,
            type: `lootbox-${reward.type}`,
            quantity: reward.quantity,
            action: 'gained',
            source: 'quest'
          });
        }
      }
      
      // Award XP for completing the quest
      const xpReward = quest.xpReward || 100;
      const updatedUser = await storage.addUserXP(user.id, xpReward);
      
      // Update user's inventory and completed quests
      await storage.updateUser(user.id, { 
        inventory,
        completedQuests
      });
      
      // Check for unlockable achievements
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(user.id);
      
      // Count completed quests
      const completedQuestsCount = completedQuests.length;
      
      // Update progress on quest-related achievements
      for (const achievement of achievements) {
        if (achievement.requirementType === 'quests_completed') {
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
          
          if (userAchievement) {
            // Update progress
            const updatedProgress = completedQuestsCount;
            let unlocked = userAchievement.unlocked;
            
            // Check if achievement should be unlocked
            if (!unlocked && updatedProgress >= achievement.requirementValue) {
              unlocked = true;
            }
            
            await storage.updateUserAchievement(userAchievement.id, { 
              progress: updatedProgress,
              unlocked
            });
          }
        }
      }
      
      // Check if we need to make next quest available
      await storage.getAvailableQuestsForUser(user.id);
      
      // Return rewards and XP info
      return res.json({ 
        rewards: quest.rewards || [],
        lootBoxRewards: quest.lootBoxRewards || [],
        xpGained: xpReward,
        newLevel: updatedUser.level,
        xp: updatedUser.xp,
        xpToNextLevel: updatedUser.xpToNextLevel
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to complete quest" });
    }
  });
  
  // Inventory routes
  app.get('/api/inventory', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get items from admin panel (items database)
      const adminItems = await storage.getItems();
      
      // Get the user's current inventory
      const userInventory = user.inventory || {};
      
      // Get inventory history for last acquired info
      const history = await storage.getInventoryHistory(user.id);
      
      // Format the inventory with complete item details
      const formattedInventory = [];
      
      // First, check if we need to initialize the admin items in the user's inventory
      const newInventory = { ...userInventory };
      let inventoryChanged = false;
      
      // ONLY include items that have been created in the admin panel
      for (const item of adminItems) {
        // If item doesn't exist in user inventory, initialize it with quantity 10
        if (newInventory[item.id] === undefined) {
          newInventory[item.id] = 10; // Default quantity for new items
          inventoryChanged = true;
          
          // Add to history to track when it was first added
          await storage.createInventoryHistory({
            userId: user.id,
            type: item.id,
            quantity: 10,
            action: 'gained',
            source: 'admin_initialization'
          });
        }
        
        // Get actual quantity from the user's inventory
        const quantity = newInventory[item.id] || 0;
        const lastHistoryItem = history.find(h => h.type === item.id && h.action === 'gained');
        
        formattedInventory.push({
          id: item.id,
          type: item.id,
          name: item.name,
          description: item.description || '',
          flavorText: item.flavorText || '',
          rarity: item.rarity,
          craftingUses: item.craftingUses || [],
          imagePath: item.imagePath || '',
          category: item.category || 'resource',
          quantity: quantity,
          lastAcquired: lastHistoryItem ? lastHistoryItem.createdAt.toISOString() : null
        });
      }
      
      // If inventory was updated, save it back to the user record
      if (inventoryChanged) {
        await storage.updateUser(user.id, { inventory: newInventory });
      }
      
      return res.json(formattedInventory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  
  app.get('/api/inventory/history', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const history = await storage.getInventoryHistory(user.id);
      
      const formattedHistory = history.map(h => ({
        id: h.id.toString(),
        type: h.type,
        quantity: h.quantity,
        action: h.action,
        source: h.source,
        date: h.createdAt.toISOString()
      }));
      
      return res.json(formattedHistory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch inventory history" });
    }
  });
  
  // Craftables routes
  app.get('/api/craftables', authenticate, async (req, res) => {
    try {
      const craftables = await storage.getCraftables();
      
      const formattedCraftables = craftables.map(c => ({
        id: c.id.toString(),
        name: c.name,
        description: c.description,
        image: c.image,
        recipe: c.recipe,
        type: c.type
      }));
      
      return res.json(formattedCraftables);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch craftables" });
    }
  });
  
  app.post('/api/craftables/:craftableId/craft', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const craftableId = parseInt(req.params.craftableId);
      
      // Verify the craftable exists
      const craftable = await storage.getCraftable(craftableId);
      if (!craftable) {
        return res.status(404).json({ message: "Craftable item not found" });
      }
      
      // Check if user has enough resources
      const inventory = { ...user.inventory };
      for (const ingredient of craftable.recipe) {
        const userQuantity = inventory[ingredient.type] || 0;
        
        if (userQuantity < ingredient.quantity) {
          return res.status(400).json({ 
            message: `Not enough ${ingredient.type}. Required: ${ingredient.quantity}, Available: ${userQuantity}` 
          });
        }
      }
      
      // Deduct resources from inventory
      for (const ingredient of craftable.recipe) {
        inventory[ingredient.type] -= ingredient.quantity;
        
        // Create inventory history
        await storage.createInventoryHistory({
          userId: user.id,
          type: ingredient.type,
          quantity: ingredient.quantity,
          action: 'used',
          source: 'crafting'
        });
      }
      
      // Update user's inventory
      await storage.updateUser(user.id, { inventory });
      
      // Create crafted item with copied data from craftable
      const craftedItem = await storage.createCraftedItem({
        userId: user.id,
        craftableId,
        name: craftable.name,
        description: craftable.description,
        image: craftable.image,
        type: craftable.type,
        status: craftable.type === 'physical' ? 'pending' : 'unlocked',
        tracking: null,
        address: null,
        redemptionData: {},
        redeemedAt: null,
        shippingInfo: {}
      });
      
      return res.json({
        id: craftedItem.id.toString(),
        itemId: craftable.id.toString(),
        name: craftedItem.name,
        description: craftedItem.description,
        image: craftedItem.image,
        type: craftedItem.type,
        status: craftedItem.status,
        dateCrafted: craftedItem.dateCrafted?.toISOString()
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to craft item" });
    }
  });
  
  app.get('/api/crafted-items', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const craftedItems = await storage.getCraftedItems(user.id);
      
      const formattedItems = craftedItems.map(item => {
        return {
          id: item.id.toString(),
          itemId: item.craftableId.toString(),
          name: item.name,
          description: item.description,
          image: item.image,
          type: item.type,
          dateCrafted: item.dateCrafted?.toISOString(),
          status: item.status,
          tracking: item.tracking,
          redemptionData: item.redemptionData,
          redeemedAt: item.redeemedAt?.toISOString(),
          shippingInfo: item.shippingInfo
        };
      });
      
      return res.json(formattedItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch crafted items" });
    }
  });
  
  // Redeem a digital crafted item
  app.post('/api/crafted-items/:id/redeem', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const craftedItemId = parseInt(req.params.id);
      
      // Get the crafted item
      const craftedItem = await storage.getCraftedItem(craftedItemId);
      
      if (!craftedItem) {
        return res.status(404).json({ message: "Crafted item not found" });
      }
      
      // Check if this item belongs to the user
      if (craftedItem.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to redeem this item" });
      }
      
      // Check if the item is digital
      if (craftedItem.type !== 'digital') {
        return res.status(400).json({ message: "Only digital items can be redeemed with this endpoint" });
      }
      
      // Check if the item is already redeemed
      if (craftedItem.status === 'redeemed') {
        return res.status(400).json({ message: "This item has already been redeemed" });
      }
      
      // Digital items should have status 'unlocked' before redemption 
      if (craftedItem.status !== 'unlocked') {
        return res.status(400).json({ message: "This item is not ready for redemption" });
      }
      
      // Generate redemption code or download link based on item
      // This is a placeholder - in a real application, you would have logic to generate 
      // actual redemption codes or create download links
      const redemptionCode = `CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Update the item
      const updatedItem = await storage.updateCraftedItem(craftedItemId, {
        status: 'redeemed',
        redeemedAt: new Date(),
        redemptionData: {
          code: redemptionCode,
          redeemedOn: new Date().toISOString()
        }
      });
      
      return res.json({
        success: true,
        message: "Item redeemed successfully",
        item: {
          id: updatedItem.id.toString(),
          name: updatedItem.name,
          status: updatedItem.status,
          redemptionData: updatedItem.redemptionData
        }
      });
    } catch (error) {
      console.error('Error redeeming item:', error);
      return res.status(500).json({ message: "Failed to redeem item" });
    }
  });
  
  // Submit shipping information for a physical crafted item
  app.post('/api/crafted-items/:id/ship', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const craftedItemId = parseInt(req.params.id);
      const { name, address, city, state, postalCode, country, email, phone } = req.body;
      
      // Validate shipping info
      if (!name || !address || !city || !state || !postalCode || !country) {
        return res.status(400).json({ message: "Missing required shipping information" });
      }
      
      // Get the crafted item
      const craftedItem = await storage.getCraftedItem(craftedItemId);
      
      if (!craftedItem) {
        return res.status(404).json({ message: "Crafted item not found" });
      }
      
      // Check if this item belongs to the user
      if (craftedItem.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to ship this item" });
      }
      
      // Check if the item is physical
      if (craftedItem.type !== 'physical') {
        return res.status(400).json({ message: "Only physical items can be shipped" });
      }
      
      // Check if the item status is pending
      if (craftedItem.status !== 'pending') {
        return res.status(400).json({ message: "This item is not in a shippable state" });
      }
      
      // Collect shipping information
      const shippingInfo = {
        name,
        address,
        city,
        state,
        postalCode,
        country,
        email: email || user.email,
        phone: phone || '',
        submittedAt: new Date().toISOString()
      };
      
      // Update the item
      const updatedItem = await storage.updateCraftedItem(craftedItemId, {
        status: 'shipping',
        shippingInfo
      });
      
      return res.json({
        success: true,
        message: "Shipping information submitted successfully",
        item: {
          id: updatedItem.id.toString(),
          name: updatedItem.name,
          status: updatedItem.status
        }
      });
    } catch (error) {
      console.error('Error processing shipping request:', error);
      return res.status(500).json({ message: "Failed to process shipping request" });
    }
  });
  
  // Admin endpoint to update crafted item status (e.g., mark as shipped, delivered)
  app.post('/api/admin/crafted-items/:id/status', authenticate, adminAuth, async (req, res) => {
    try {
      const craftedItemId = parseInt(req.params.id);
      const { status, tracking } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'shipping', 'shipped', 'delivered', 'unlocked', 'redeemed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get the crafted item
      const craftedItem = await storage.getCraftedItem(craftedItemId);
      
      if (!craftedItem) {
        return res.status(404).json({ message: "Crafted item not found" });
      }
      
      // Update the item
      const updateData: Partial<CraftedItem> = { status };
      
      // Add tracking number if provided
      if (tracking) {
        updateData.tracking = tracking;
      }
      
      const updatedItem = await storage.updateCraftedItem(craftedItemId, updateData);
      
      return res.json({
        success: true,
        message: `Item status updated to ${status}`,
        item: {
          id: updatedItem.id.toString(),
          name: updatedItem.name,
          status: updatedItem.status,
          tracking: updatedItem.tracking
        }
      });
    } catch (error) {
      console.error('Error updating item status:', error);
      return res.status(500).json({ message: "Failed to update item status" });
    }
  });
  
  // Loot Box Routes
  app.get('/api/loot-boxes', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get the user's loot boxes
      const lootBoxes = await storage.getLootBoxes(user.id);
      
      // Get all loot box configurations
      const lootBoxConfigs = await storage.getLootBoxConfigs();
      
      // Create a map of loot box configurations for quick lookup
      const configMap = lootBoxConfigs.reduce((map, config) => {
        map[config.id] = config;
        return map;
      }, {} as Record<string, any>);
      
      // Attach loot box configuration data to each loot box
      const lootBoxesWithConfig = lootBoxes.map(box => {
        const config = configMap[box.type];
        return {
          ...box,
          // Add configuration details if available
          config: config || null,
          // Add these for backward compatibility
          name: config?.name || box.type,
          description: config?.description || `A ${box.type} loot box`,
          image: config?.image || '/images/loot-crate.png',
          rarity: config?.rarity || 'common'
        };
      });
      
      res.json(lootBoxesWithConfig);
    } catch (error) {
      console.error('Error fetching loot boxes:', error);
      res.status(500).json({ message: "Failed to fetch loot boxes" });
    }
  });
  
  app.get('/api/loot-boxes/:id', authenticate, async (req, res) => {
    try {
      const lootBoxId = parseInt(req.params.id);
      const lootBox = await storage.getLootBox(lootBoxId);
      
      if (!lootBox) {
        return res.status(404).json({ message: "Loot box not found" });
      }
      
      // Check if the loot box belongs to the user
      if (lootBox.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to view this loot box" });
      }
      
      // Get the loot box configuration
      const config = await storage.getLootBoxConfig(lootBox.type);
      
      console.log('Loot box:', lootBox);
      console.log('Loot box config:', config);
      
      // Add configuration data to the loot box
      const lootBoxWithConfig = {
        ...lootBox,
        // Add configuration details if available
        config: config || null,
        // Add these for backward compatibility
        name: config?.name || lootBox.type,
        description: config?.description || `A ${lootBox.type} loot box`,
        image: config?.image || '/images/loot-crate.png',
        rarity: config?.rarity || 'common'
      };
      
      res.json(lootBoxWithConfig);
    } catch (error) {
      console.error('Error fetching loot box:', error);
      res.status(500).json({ message: "Failed to fetch loot box" });
    }
  });
  
  // This route was moved to use lootBoxId parameter
  
  // This section was removed as it was a duplicate of the inventory endpoint
  // defined earlier in the file at line ~574.
  
  // Get all loot box configs (for displaying in QuestCard and other components)
  app.get('/api/admin/lootboxes', authenticate, async (req, res) => {
    try {
      // Get all loot box configurations
      const lootBoxConfigs = await storage.getLootBoxConfigs();
      return res.json(lootBoxConfigs);
    } catch (error) {
      console.error("Error getting loot box configs:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Achievements routes
  app.get('/api/achievements', authenticate, async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      
      const formattedAchievements = achievements.map(a => ({
        id: a.id.toString(),
        name: a.name,
        description: a.description,
        tier: a.tier,
        icon: a.icon,
        requirement: {
          type: a.requirementType,
          value: a.requirementValue
        }
      }));
      
      return res.json(formattedAchievements);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  
  app.get('/api/user/achievements', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const userAchievements = await storage.getUserAchievements(user.id);
      
      const formattedAchievements = userAchievements.map(ua => ({
        id: ua.id.toString(),
        achievementId: ua.achievementId.toString(),
        unlocked: ua.unlocked,
        unlockedAt: ua.unlockedAt ? ua.unlockedAt.toISOString() : null,
        progress: ua.progress
      }));
      
      return res.json(formattedAchievements);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });
  
  // Admin route to create test loot boxes
  app.post('/api/admin/loot-boxes', authenticate, adminAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { type = 'common', count = 1, source = 'admin testing', targetUserId } = req.body;
      
      // Determine which user to add the loot boxes to
      const lootBoxUserId = targetUserId ? parseInt(targetUserId) : user.id;
      
      // If a targetUserId was specified, verify that user exists
      if (targetUserId) {
        const targetUser = await storage.getUser(lootBoxUserId);
        if (!targetUser) {
          return res.status(404).json({ message: "Target user not found" });
        }
      }
      
      // Validate type
      const validTypes = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Invalid loot box type" });
      }
      
      // Validate count
      const boxCount = Math.min(Math.max(1, count), 100); // Between 1 and 100
      
      // Create loot boxes
      const createdBoxes = [];
      for (let i = 0; i < boxCount; i++) {
        // Pre-generate rewards for each loot box
        const rewards = generateLootBoxRewards(type);
        
        const lootBox = await storage.createLootBox({
          userId: lootBoxUserId,
          type,
          opened: false,
          rewards,
          source,
          sourceId: null,
          acquiredAt: new Date(),
          openedAt: null
        });
        
        createdBoxes.push(lootBox);
      }
      
      return res.status(201).json({ 
        message: `Created ${boxCount} ${type} loot box(es)`, 
        lootBoxes: createdBoxes 
      });
    } catch (error) {
      console.error('Error creating test loot boxes:', error);
      return res.status(500).json({ message: "Failed to create test loot boxes" });
    }
  });

  // Admin routes
  app.post('/api/admin/quests', authenticate, adminAuth, async (req, res) => {
    try {
      const questData = req.body;
      const schema = z.object({
        date: z.string(),
        title: z.string(),
        description: z.string(),
        missionBrief: z.string().optional(), // Add missionBrief field
        adventureLine: z.string(),
        difficulty: z.number().min(1).max(5),
        orderInLine: z.number().min(0),
        xpReward: z.number().positive(),
        rewards: z.array(z.object({
          type: z.string(),
          id: z.string(),
          quantity: z.number().positive()
        })),
        active: z.boolean().optional(),
        components: z.array(z.object({
          id: z.number(),
          required: z.boolean(),
          quantity: z.number().positive().default(1)
        })).optional(),
        content: z.object({
          videos: z.array(z.string()).optional(),
          images: z.array(z.string()).optional(),
          codeBlocks: z.array(z.object({
            language: z.string(),
            code: z.string()
          })).optional()
        }).optional()
      });
      
      const validatedData = schema.parse(questData);
      
      // Create the quest first
      const quest = await storage.createQuest(validatedData);
      
      // Add components if provided
      if (questData.components && questData.components.length > 0) {
        console.log(`Adding ${questData.components.length} components to quest ${quest.id}`);
        
        for (const component of questData.components) {
          await storage.createQuestComponent({
            questId: quest.id,
            componentId: component.id,
            quantity: component.quantity || 1,
            isOptional: !component.required
          });
        }
      }
      
      // Get all users
      const users = Array.from(await storage.getUsers());
      
      // For each user, determine if this quest should be available based on position in adventure line
      for (const user of users) {
        // Get quests for this adventure line
        const adventureLineQuests = await storage.getQuestsByAdventureLine(quest.adventureLine);
        
        // Sort by order in line
        adventureLineQuests.sort((a, b) => a.orderInLine - b.orderInLine);
        
        // If it's the first quest in the adventure line, make it available
        let status = 'locked';
        if (quest.orderInLine === 0) {
          status = 'available';
        } else if (adventureLineQuests.length > 1) {
          // If it's not the first quest, check if previous quest is completed
          const previousQuest = adventureLineQuests.find(q => q.orderInLine === quest.orderInLine - 1);
          if (previousQuest && user.completedQuests && user.completedQuests.includes(previousQuest.id)) {
            status = 'available';
          }
        }
        
        // Create user quest relation
        await storage.createUserQuest({
          userId: user.id,
          questId: quest.id,
          status
        });
      }
      
      return res.json(quest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create quest" });
    }
  });
  
  // Update Quest route
  app.put('/api/admin/quests/:questId', authenticate, adminAuth, async (req, res) => {
    try {
      const questId = parseInt(req.params.questId);
      const questData = req.body;
      
      // Validate the incoming data
      const schema = z.object({
        date: z.string(),
        title: z.string(),
        description: z.string(),
        missionBrief: z.string().optional(), // Add missionBrief field
        adventureLine: z.string(),
        difficulty: z.number().min(1).max(5),
        orderInLine: z.number().min(0),
        xpReward: z.number().positive(),
        rewards: z.array(z.object({
          type: z.string(),
          id: z.string(),
          quantity: z.number().positive()
        })),
        active: z.boolean().optional(),
        components: z.array(z.object({
          id: z.number(),
          required: z.boolean(),
          quantity: z.number().positive().default(1)
        })).optional(),
        content: z.object({
          videos: z.array(z.string()).optional(),
          images: z.array(z.string()).optional(),
          codeBlocks: z.array(z.object({
            language: z.string(),
            code: z.string()
          })).optional()
        }).optional()
      });
      
      const validatedData = schema.parse(questData);
      
      // Update the quest
      const updatedQuest = await storage.updateQuest(questId, validatedData);
      
      // Handle component updates if provided
      if (questData.components && questData.components.length > 0) {
        console.log(`Updating components for quest ${questId}`);
        console.log(`Component data being sent:`, JSON.stringify(questData.components));
        
        // First, remove all existing component relationships for this quest
        await storage.deleteQuestComponentsByQuestId(questId);
        
        // Then add the new component relationships
        for (const component of questData.components) {
          console.log(`Processing component ${component.id}: required=${component.required}, isOptional=${!component.required}`);
          
          await storage.createQuestComponent({
            questId: questId,
            componentId: component.id,
            quantity: component.quantity || 1,
            isOptional: !component.required
          });
        }
      }
      
      return res.json(updatedQuest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update quest" });
    }
  });
  
  // Quest detail route
  app.get('/api/quests/:questId', authenticate, async (req, res) => {
    try {
      const questId = parseInt(req.params.questId);
      
      // Verify the quest exists
      const quest = await storage.getQuest(questId);
      if (!quest) {
        return res.status(404).json({ message: "Quest not found" });
      }
      
      // Get the user's status for this quest
      const user = (req as any).user;
      const userQuests = await storage.getUserQuests(user.id);
      const userQuest = userQuests.find(uq => uq.questId === questId);
      
      // Fetch any required components for this quest
      let components = [];
      try {
        // Use our storage interface to get real component data
        components = await storage.getQuestComponentsWithDetails(questId);
        
        // If no components are found, it means this quest has no component requirements
        if (!components || components.length === 0) {
          console.log(`No components found for quest ID ${questId}`);
        } else {
          console.log(`Found ${components.length} components for quest ID ${questId}`);
        }
      } catch (err) {
        console.error("Error fetching quest components:", err);
        // Continue even if component fetch fails
      }
      
      // Format response with additional content details
      const response = {
        id: quest.id.toString(),
        title: quest.title,
        description: quest.description,
        missionBrief: quest.missionBrief || null, // Include missionBrief in response
        adventureLine: quest.adventureLine,
        difficulty: quest.difficulty,
        orderInLine: quest.orderInLine,
        xpReward: quest.xpReward,
        rewards: quest.rewards,
        status: userQuest ? userQuest.status : 'locked',
        content: {
          videos: quest.content?.videos || [],
          images: quest.content?.images || [],
          codeBlocks: quest.content?.codeBlocks || []
        },
        lootBoxRewards: [
          { type: 'common', quantity: 1 },
          { type: quest.difficulty > 3 ? 'rare' : 'uncommon', quantity: 1 }
        ],
        // Add component requirements to the response
        componentRequirements: components
      };
      
      return res.json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch quest details" });
    }
  });
  
  // Loot box routes
  // Note: Main /api/loot-boxes route is defined earlier in the file
  

  
  // User endpoint to generate test loot crates for demo purposes
  app.post('/api/loot-boxes/generate-test', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "User not found" });
      
      // Get all loot box configs from the database
      const lootBoxConfigs = await storage.getLootBoxConfigs();
      if (lootBoxConfigs.length === 0) {
        return res.status(400).json({ 
          message: "No loot box configurations found. Create some in the admin panel first." 
        });
      }
      
      console.log(`Found ${lootBoxConfigs.length} loot box configurations`);
      
      const createdBoxes = [];
      
      // Create one of each loot box config type
      for (const config of lootBoxConfigs) {
        console.log(`Creating test loot box of type: ${config.id}`);
        
        // Create loot box without pre-generating rewards (they'll be generated when opened)
        const lootBox = await storage.createLootBox({
          userId: user.id,
          type: config.id,
          opened: false,
          rewards: null, // Will be generated when opened
          source: 'Test Crate Generator',
          sourceId: null
        });
        
        createdBoxes.push(lootBox);
      }
      
      return res.status(201).json({
        message: `Generated ${createdBoxes.length} test loot crates successfully`,
        lootBoxes: createdBoxes
      });
    } catch (error) {
      console.error('Error generating test loot crates:', error);
      return res.status(500).json({ message: "Failed to generate test loot crates" });
    }
  });
  
  // Admin route to reset inventory to exactly 1 of each item
  app.post('/api/admin/inventory/reset-to-one', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "User not found" });
      
      // Check if user has admin role (you can replace this with your own admin check)
      const isAdmin = user.roles?.includes('admin');
      if (!isAdmin) return res.status(403).json({ message: "Admin privileges required" });
      
      // Get all items from the database
      const adminItems = await storage.getItems();
      
      // Create a new inventory with exactly 1 of each item
      const newInventory: Record<string, number> = {};
      
      for (const item of adminItems) {
        newInventory[item.id] = 1;
        
        // Add to history to track reset
        await storage.createInventoryHistory({
          userId: user.id,
          type: item.id,
          quantity: 1, // Set to 1
          action: 'reset',
          source: 'admin_reset'
        });
      }
      
      // Update user's inventory
      await storage.updateUser(user.id, { inventory: newInventory });
      
      return res.json({ 
        message: `Reset inventory to exactly 1 of each item (${adminItems.length} items)`,
        inventory: newInventory
      });
    } catch (error) {
      console.error('Error resetting inventory:', error);
      return res.status(500).json({ message: "Failed to reset inventory" });
    }
  });
  
  // Admin route to clear loot crates from inventory
  app.post('/api/admin/inventory/clear-loot-crates', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "User not found" });
      
      // Check if user has admin role
      const isAdmin = user.roles?.includes('admin');
      if (!isAdmin) return res.status(403).json({ message: "Admin privileges required" });
      
      // Get current user's loot boxes
      const lootBoxes = await storage.getLootBoxes(user.id);
      
      // Delete each loot box
      for (const lootBox of lootBoxes) {
        // We don't need to update inventory since loot boxes aren't stored there
        // Just mark them as deleted in the database by setting opened=true
        await storage.updateLootBox(lootBox.id, { opened: true });
      }
      
      return res.json({ 
        message: `Cleared ${lootBoxes.length} loot crates from your inventory`,
        cleared: lootBoxes.length
      });
    } catch (error) {
      console.error('Error clearing loot crates:', error);
      return res.status(500).json({ message: "Failed to clear loot crates" });
    }
  });
  
  app.post('/api/loot-boxes/:lootBoxId/open', authenticate, async (req, res) => {
    try {
      const lootBoxId = parseInt(req.params.lootBoxId);
      const user = (req as any).user;
      
      console.log('Opening loot box with ID:', lootBoxId);
      
      // Use our new loot box system to handle opening
      const result = await openLootBox(lootBoxId, user.id);
      console.log('Loot box open response:', result);
      
      if (!result.success) {
        // If there was an error or issue, return the appropriate status code
        const statusCode = 
          result.message.includes("not found") ? 404 :
          result.message.includes("do not own") ? 403 :
          result.message.includes("already opened") ? 400 : 500;
        
        return res.status(statusCode).json({ 
          success: false,
          message: result.message,
          rewards: null
        });
      }
      
      // Return the rewards to the client
      return res.json(result);
    } catch (error) {
      console.error('Error opening loot box:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to open loot box", 
        rewards: null 
      });
    }
  });
  
  // Crafting Recipe routes
  app.get('/api/crafting/recipes', authenticate, craftingRecipeRoutes.getCraftingRecipes);
  app.get('/api/crafting/recipes/:id', authenticate, craftingRecipeRoutes.getCraftingRecipeById);
  app.post('/api/crafting/recipes', authenticate, adminAuth, craftingRecipeRoutes.createCraftingRecipe);
  app.put('/api/crafting/recipes/:id', authenticate, adminAuth, craftingRecipeRoutes.updateCraftingRecipe);
  app.delete('/api/crafting/recipes/:id', authenticate, adminAuth, craftingRecipeRoutes.deleteCraftingRecipe);
  app.post('/api/crafting/craft', authenticate, craftingRecipeRoutes.craftItem);
  
  // Character equipment routes
  app.use('/api/character', authenticate, characterRoutes);

  // Admin routes
  app.use('/api/admin', authenticate, adminRoutes);
  
  // Admin upload routes
  app.use('/api/admin/upload', authenticate, adminUploadRoutes);
  
  // Admin kits routes
  app.use('/api/admin', authenticate, adminKitsRoutes);
  
  // Routes for admin recipes and crafting were already registered above
  
  return httpServer;
}
