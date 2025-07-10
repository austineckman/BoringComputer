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
import { getItemDetails, removeItem, addOrUpdateItem } from './itemDatabase';
import * as craftingRecipeRoutes from './routes/craftingRecipes';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import characterRoutes from './routes/character';
import adminUploadRoutes from './routes/admin/upload';
import adminKitsRoutes from './routes/admin-kits';
import adminRecipesRoutes from './routes/admin-recipes';
import adminQuestGeneratorRoutes from './routes/admin-quest-generator';
import adminQuestsSaveRoutes from './routes/admin-quests-save';
import adventureLinesRoutes from './routes/adventure-lines';
import oracleRoutes from './routes/oracle';
import lootboxesRoutes from './routes/lootboxes';
import lootboxRewardsRoutes from './routes/lootboxRewards';
import circuitProjectsRoutes from './routes/circuit-projects';
import arduinoComponentsRoutes from './routes/arduino-components';
import { authenticate, hashPassword } from './auth';
import { conditionalCsrfProtection, getCsrfToken, handleCsrfError } from './middleware/csrf';
import { addSecurityHeaders } from './middleware/security-headers';
import { componentKits, items } from '@shared/schema';
import { itemDatabase } from './itemDatabase';
import { eq } from 'drizzle-orm';

// Using Passport authentication instead of custom middleware

// Admin-only middleware is now imported from ./middleware/adminAuth
// No need to redefine it here

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Add security headers to all responses
  app.use(addSecurityHeaders);
  
  // Serve static files from the public directory
  const publicPath = path.join(process.cwd(), 'public');
  app.use('/sounds', express.static(path.join(publicPath, 'sounds')));
  app.use('/uploads', express.static(path.join(publicPath, 'uploads')));
  
  // Set up sessions for users with optimized cookie parsing
  app.use((req, res, next) => {
    try {
      // Parse cookies for session management only if needed
      // Skip this processing for static assets and development files
      if (req.path.includes('.') || 
          req.path.includes('/assets/') || 
          req.path.includes('/@') || 
          req.path.includes('/_')) {
        // Skip cookie processing for static assets completely
        next();
        return;
      }
      
      // Default to empty cookies object
      const cookies: Record<string, string> = {};
      
      // Only parse cookies for API routes and only when a cookie header exists
      if (req.path.startsWith('/api') && req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
          const parts = cookie.split('=');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            cookies[key] = value;
          }
        });
        
        // Remove ALL logging to reduce noise
        // We will only log authentication issues in the auth routes themselves
      }
      
      // Always attach the cookies object, even if empty
      (req as any).cookies = cookies;
      next();
    } catch (error) {
      console.error('Error parsing cookies:', error);
      (req as any).cookies = {};
      next();
    }
  });
  
  // Apply CSRF protection to API routes that modify data
  app.use(conditionalCsrfProtection);
  
  // Add CSRF error handler
  app.use(handleCsrfError);
  
  // Endpoint to get CSRF token
  app.get('/api/csrf-token', getCsrfToken);
  
  // Register the auth routes
  app.use("/api/auth", authRoutes);
  
  // Register circuit projects routes
  app.use("/api/circuit-projects", circuitProjectsRoutes);
  
  // Register Arduino components routes
  app.use("/api/arduino-components", arduinoComponentsRoutes);
  
  // Auth routes have been moved to separate files
  // Using passport authentication with proper session handling
  // See routes/auth.ts for the implementation
  
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
      inventory: user.inventory,
      titles: user.titles || [],
      activeTitle: user.activeTitle
    });
  });

  // Debug endpoint to show Discord roles
  app.get('/api/debug/discord-roles', authenticate, async (req, res) => {
    const user = (req as any).user;
    return res.json({
      username: user.username,
      currentRoles: user.roles,
      message: "These are your current roles in the application. Log out and log back in to refresh Discord roles."
    });
  });

  // List all roles in the CraftingTable Discord server
  app.get('/api/debug/server-roles', authenticate, async (req, res) => {
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!guildId) {
      return res.status(400).json({ error: "Discord Guild ID not configured" });
    }

    if (!botToken) {
      return res.status(400).json({ error: "Discord Bot Token not configured" });
    }

    try {
      const rolesResponse = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/roles`,
        {
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!rolesResponse.ok) {
        const errorText = await rolesResponse.text();
        return res.status(500).json({ 
          error: "Could not fetch Discord server roles",
          details: `HTTP ${rolesResponse.status}: ${rolesResponse.statusText}`,
          response: errorText,
          troubleshooting: {
            "404 Not Found": "Bot is not in the Discord server",
            "403 Forbidden": "Bot lacks 'View Server Members' permission", 
            "401 Unauthorized": "Invalid bot token",
            solution: "Invite bot to server with 'View Server Members' permission"
          }
        });
      }

      const roles = await rolesResponse.json();
      
      // Filter out @everyone and organize by position
      const serverRoles = roles
        .filter((role: any) => role.name !== '@everyone')
        .sort((a: any, b: any) => b.position - a.position)
        .map((role: any) => ({
          id: role.id,
          name: role.name,
          color: role.color,
          position: role.position,
          permissions: role.permissions,
          mentionable: role.mentionable,
          hoist: role.hoist
        }));

      return res.json({
        guildId,
        serverName: "CraftingTable Discord",
        totalRoles: serverRoles.length,
        roles: serverRoles,
        currentUserRoles: ((req as any).user).roles
      });

    } catch (error) {
      console.error('Error fetching Discord server roles:', error);
      return res.status(500).json({ 
        error: "Failed to fetch Discord server roles",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user's Discord roles
  app.get('/api/user/discord-roles', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      console.log('Fetching Discord roles for user:', user?.username, 'Discord ID:', user?.discordId);
      
      const guildId = process.env.DISCORD_GUILD_ID;
      const botToken = process.env.DISCORD_BOT_TOKEN;
      
      if (!guildId || !botToken) {
        console.error('Discord configuration missing:', { guildId: !!guildId, botToken: !!botToken });
        return res.status(500).json({ error: 'Discord configuration missing' });
      }

      if (!user?.discordId) {
        console.error('User missing Discord ID:', user);
        return res.status(400).json({ error: 'User not linked to Discord account' });
      }

      // Get all server roles first
      const rolesResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!rolesResponse.ok) {
        console.error('Failed to fetch server roles:', rolesResponse.status, rolesResponse.statusText);
        return res.status(500).json({ error: 'Failed to fetch server roles' });
      }

      const allRoles = await rolesResponse.json();

      // Get user's guild member info using bot token
      const memberResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${user.discordId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!memberResponse.ok) {
        const errorText = await memberResponse.text();
        console.error('Failed to fetch member info:', {
          status: memberResponse.status,
          statusText: memberResponse.statusText,
          error: errorText,
          discordId: user.discordId,
          guildId
        });
        return res.status(404).json({ 
          error: 'User not found in Discord server',
          details: 'Make sure you are a member of the CraftingTable Discord server',
          debug: {
            discordId: user.discordId,
            guildId,
            httpStatus: memberResponse.status
          }
        });
      }

      const memberData = await memberResponse.json();
      const userRoleIds = memberData.roles || [];

      // Filter roles to only include user's roles
      const userRoles = allRoles
        .filter((role: any) => userRoleIds.includes(role.id) && role.name !== '@everyone')
        .map((role: any) => ({
          id: role.id,
          name: role.name,
          color: role.color,
          permissions: role.permissions,
          position: role.position
        }))
        .sort((a: any, b: any) => b.position - a.position); // Sort by position (highest first)

      res.json({
        guildId,
        serverName: 'CraftingTable',
        userId: user.discordId,
        username: user.username,
        roles: userRoles
      });
    } catch (error) {
      console.error('Error fetching user Discord roles:', error);
      res.status(500).json({ error: 'Failed to fetch user roles' });
    }
  });
  
  // Quests routes
  app.get('/api/quests', authenticate, async (req, res) => {
    try {
      console.log('GET /api/quests - Request received');
      const user = (req as any).user;
      console.log('User ID:', user.id, 'Username:', user.username);
      
      // Get available quests based on user's progression
      console.log('Fetching available quests');
      const availableQuests = await storage.getAvailableQuestsForUser(user.id);
      console.log('Fetching user quests');
      const userQuests = await storage.getUserQuests(user.id);
      console.log('Fetching all quests');
      const allQuests = await storage.getQuests();
      console.log(`Found ${allQuests.length} total quests in database`);
      
      // Fetch component requirements for all quests
      console.log('Fetching component requirements for all quests');
      const questsWithComponents = [];
      for (const quest of allQuests) {
        try {
          const components = await storage.getQuestComponentsWithDetails(quest.id);
          console.log(`Quest ${quest.id} (${quest.title}) has ${components.length} components`);
          
          // Add component requirements to quest object
          const questWithComponents = {
            ...quest,
            componentRequirements: components
          };
          questsWithComponents.push(questWithComponents);
        } catch (err) {
          console.error(`Error fetching components for quest ${quest.id}:`, err);
          questsWithComponents.push(quest); // Add quest without components
        }
      }
      
      // Group quests by adventure line to help with frontend organization
      const questsByAdventureLine: Record<string, any[]> = {};
      
      // Process all quests to determine their status
      questsWithComponents.forEach(quest => {
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
        
        console.log(`Processing quest: ${quest.id} - ${quest.title} with status ${status}`);
        
        questsByAdventureLine[adventureLine].push({
          id: quest.id.toString(),
          date: quest.date,
          title: quest.title,
          description: quest.description,
          missionBrief: quest.missionBrief, // Make sure to include missionBrief
          adventureLine: quest.adventureLine,
          difficulty: quest.difficulty,
          orderInLine: quest.orderInLine,
          xpReward: quest.xpReward,
          rewards: quest.rewards,
          content: quest.content,
          lootBoxRewards: quest.lootBoxRewards,
          kitId: quest.kitId,
          componentRequirements: quest.componentRequirements || [], // Include component requirements
          status
        });
      });
      
      // Sort each adventure line by orderInLine
      for (const adventureLine in questsByAdventureLine) {
        questsByAdventureLine[adventureLine].sort((a, b) => a.orderInLine - b.orderInLine);
        console.log(`Adventure line ${adventureLine} has ${questsByAdventureLine[adventureLine].length} quests`);
      }
      
      const responseData = {
        questsByAdventureLine,
        // Also include a flat list for backward compatibility
        allQuests: Object.values(questsByAdventureLine).flat()
      };
      
      console.log(`Sending response with ${responseData.allQuests.length} total quests in ${Object.keys(responseData.questsByAdventureLine).length} adventure lines`);
      
      return res.json(responseData);
    } catch (error) {
      console.error('Error in /api/quests endpoint:', error);
      return res.status(500).json({ message: "Failed to fetch quests", error: error.message });
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
      console.log('DEBUG - User inventory from /api/inventory endpoint:', userInventory);
      
      // Get inventory history for last acquired info
      const history = await storage.getInventoryHistory(user.id);
      
      // Format the inventory with complete item details
      const formattedInventory = [];
      
      // Use the user's inventory as is, don't initialize with default values
      const newInventory = { ...userInventory };
      let inventoryChanged = false;
      
      // ONLY include items that have been created in the admin panel
      for (const item of adminItems) {
        // Don't automatically add items to inventory anymore
        // This allows new users to start with empty inventories
        
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
          sourceId: null,
          name: config.name,
          description: config.description,
          rarity: config.rarity,
          image: config.image
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
      
      console.log('DEBUG - Reset inventory requested by user:', user.id, user.username);
      console.log('DEBUG - Current user inventory before reset:', user.inventory);
      
      // Check if user has admin role (you can replace this with your own admin check)
      const isAdmin = user.roles?.includes('admin');
      if (!isAdmin) return res.status(403).json({ message: "Admin privileges required" });
      
      // Get all items from the database
      const adminItems = await storage.getItems();
      console.log(`DEBUG - Found ${adminItems.length} items in database to reset inventory with`);
      
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
      
      console.log('DEBUG - New inventory after reset:', newInventory);
      
      // Special case for mock user (ID 999)
      if (user.id === 999) {
        // For the mock user, just update the in-memory object directly
        user.inventory = newInventory;
        console.log('DEBUG - Development mode: Updated mock user inventory directly:', newInventory);
      } else {
        // Update user's inventory in the database
        await storage.updateUser(user.id, { inventory: newInventory });
        console.log('DEBUG - User inventory updated in database');
      }
      
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
  
  // Title management routes
  // This route is now defined below
  
  app.post('/api/titles/unlock', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      // Get current titles
      const titles = [...(user.titles || [])];
      
      // Check if title is already unlocked
      if (titles.includes(title)) {
        return res.status(400).json({ message: 'Title is already unlocked' });
      }
      
      // Add the new title
      titles.push(title);
      
      // Special case for mock user (ID 999)
      if (user.id === 999) {
        // For the mock user, just update the in-memory object
        user.titles = titles;
        console.log('Development mode: Updated mock user titles:', titles);
        return res.json({
          titles: titles,
          activeTitle: user.activeTitle || null
        });
      }
      
      // Update user in database
      const updatedUser = await storage.updateUser(user.id, { titles });
      
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to update user' });
      }
      
      return res.json({
        titles: updatedUser.titles || [],
        activeTitle: updatedUser.activeTitle || null
      });
    } catch (error) {
      console.error('Error unlocking title:', error);
      return res.status(500).json({ message: 'Failed to unlock title' });
    }
  });
  
  // Special endpoint for recycle bin titles - returns alreadyUnlocked flag instead of error
  app.post('/api/titles/recycle-bin', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      // Get current titles
      const titles = [...(user.titles || [])];
      
      // Check if title is already unlocked - but don't return error
      const alreadyUnlocked = titles.includes(title);
      
      if (!alreadyUnlocked) {
        // Add the new title if not already unlocked
        titles.push(title);
      }
      
      // Special case for mock user (ID 999)
      if (user.id === 999) {
        // For the mock user, just update the in-memory object
        user.titles = titles;
        console.log('Development mode: Updated mock user titles from recycle bin:', titles);
        return res.json({
          alreadyUnlocked,
          titles: titles,
          activeTitle: user.activeTitle || null
        });
      }
      
      // Only update database if we added a new title
      let updatedUser = user;
      if (!alreadyUnlocked) {
        updatedUser = await storage.updateUser(user.id, { titles });
        
        if (!updatedUser) {
          return res.status(500).json({ message: 'Failed to update user' });
        }
      }
      
      return res.json({
        alreadyUnlocked,
        titles: updatedUser.titles || [],
        activeTitle: updatedUser.activeTitle || null
      });
    } catch (error) {
      console.error('Error unlocking title from recycle bin:', error);
      return res.status(500).json({ message: 'Failed to unlock title' });
    }
  });
  
  // Get user's titles
  app.get('/api/titles', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      
      return res.json({
        titles: user.titles || [],
        activeTitle: user.activeTitle || null
      });
    } catch (error) {
      console.error('Error fetching titles:', error);
      return res.status(500).json({ message: 'Failed to fetch titles' });
    }
  });
  
  app.put('/api/titles/active', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { title } = req.body;
      
      // Special case for mock user (ID 999)
      if (user.id === 999) {
        // For the mock user, just update the in-memory object
        user.activeTitle = title;
        console.log('Development mode: Updated mock user active title:', title);
        return res.json({
          titles: user.titles || [],
          activeTitle: title
        });
      }
      
      // If title is null, unequip the current title
      if (title === null) {
        const updatedUser = await storage.updateUser(user.id, { activeTitle: null });
        
        if (!updatedUser) {
          return res.status(500).json({ message: 'Failed to update user' });
        }
        
        return res.json({
          titles: updatedUser.titles || [],
          activeTitle: null
        });
      }
      
      // Check if the user has this title
      const titles = user.titles || [];
      if (!titles.includes(title)) {
        return res.status(400).json({ message: 'You do not have this title' });
      }
      
      // Update user's active title
      const updatedUser = await storage.updateUser(user.id, { activeTitle: title });
      
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to update user' });
      }
      
      return res.json({
        titles: updatedUser.titles || [],
        activeTitle: updatedUser.activeTitle || null
      });
    } catch (error) {
      console.error('Error setting active title:', error);
      return res.status(500).json({ message: 'Failed to set active title' });
    }
  });
  
  // Public component kits endpoint - available to all users without authentication
  app.get('/api/kits', async (req, res) => {
    try {
      const allKits = await db.select().from(componentKits);
      res.json(allKits);
    } catch (error) {
      console.error('Error fetching component kits:', error);
      res.status(500).json({ message: 'Failed to fetch component kits' });
    }
  });
  
  // Public items endpoint - available to all users without authentication
  app.get('/api/items', async (req, res) => {
    try {
      // Get the basic items from the item database
      const allItems = Object.values(itemDatabase);
      
      // Add custom items from the database if available
      try {
        const adminItems = await db.select().from(items);
        if (adminItems && adminItems.length > 0) {
          allItems.push(...adminItems);
        }
      } catch (dbError) {
        console.error('Could not fetch admin items:', dbError);
        // Continue with basic items only
      }
      
      res.json(allItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ message: 'Failed to fetch items' });
    }
  });
  
  // DELETE an item by ID (for Oracle and Admin interfaces)
  // Update an existing item
  app.put('/api/items/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      const itemData = req.body;
      console.log(`Attempting to update item with ID: ${itemId}`);
      
      // Ensure the ID in the body matches the URL path
      if (itemData.id !== itemId) {
        itemData.id = itemId;
      }
      
      // Update the item
      const updatedItem = await addOrUpdateItem(itemData);
      console.log(`Item updated: ${updatedItem.id}`);
      
      return res.json(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      return res.status(500).json({
        message: 'Failed to update item',
        error: (error as Error).message
      });
    }
  });

  app.delete('/api/items/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      console.log(`Attempting to delete item with ID: ${itemId}`);
      
      // First attempt to delete from the itemDatabase
      const itemRemoved = removeItem(itemId);
      console.log(`Item removed from itemDatabase: ${itemRemoved}`);
      
      // Also try to delete from the database if it exists there
      try {
        const deletedItems = await db
          .delete(items)
          .where(eq(items.id, itemId))
          .returning();
        
        console.log(`Items deleted from database: ${deletedItems.length}`);
        
        // Return success if either operation was successful
        if (itemRemoved || deletedItems.length > 0) {
          return res.json({ 
            success: true, 
            message: 'Item deleted successfully'
          });
        }
      } catch (dbError) {
        console.error('Error deleting item from database:', dbError);
        // If we deleted from itemDatabase but failed with the DB, still return success
        if (itemRemoved) {
          return res.json({ 
            success: true, 
            message: 'Item deleted from memory but encountered database error',
            error: dbError.message
          });
        }
      }
      
      // If we reached here, both operations failed or found no items
      res.status(404).json({ 
        success: false, 
        message: 'Item not found'
      });
    } catch (error) {
      console.error('Error in item deletion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete item', 
        error: error.message 
      });
    }
  });

  // Admin routes
  app.use('/api/admin', authenticate, adminRoutes);
  
  // Admin upload routes
  app.use('/api/admin/upload', authenticate, adminUploadRoutes);
  
  // Admin kits routes
  app.use('/api/admin', authenticate, adminKitsRoutes);
  
  // Admin recipes routes - ensure we also apply admin authorization
  app.use('/api/admin/recipes', authenticate, adminAuth, adminRecipesRoutes);
  
  // Register the admin routes for quest generator with specific path prefix
  app.use('/api/admin/quest-generator', authenticate, adminAuth, adminQuestGeneratorRoutes);
  
  // Register the admin routes for saving quests with specific path prefix
  app.use('/api/admin/quest-save', authenticate, adminAuth, adminQuestsSaveRoutes);
  
  // Register adventure lines routes with specific path prefix
  app.use('/api/adventure-lines', adventureLinesRoutes);
  
  // Register Oracle routes (with full CRUD access to database)
  app.use('/api/oracle', authenticate, oracleRoutes);
  
  // Lootboxes routes
  app.use('/api/lootboxes', authenticate, lootboxesRoutes);
  app.use('/api/lootbox-rewards', authenticate, lootboxRewardsRoutes);
  
  // Routes for admin recipes and crafting were already registered above
  
  return httpServer;
}
