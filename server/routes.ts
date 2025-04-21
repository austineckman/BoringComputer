import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";

// Setup authentication middleware
const authenticate = async (req: Request, res: Response, next: Function) => {
  const sessionToken = req.cookies.sessionToken;
  
  if (!sessionToken) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    // In a real app, validate the session token against a database
    // For the demo, we'll check if it's a valid UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionToken)) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    // Get the userId from the session (simplified for demo)
    const userId = parseInt(sessionToken.split('-')[0], 16) % 1000; // Convert first hex part to userId
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // Set the user in request for subsequent use
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Admin-only middleware
const adminOnly = async (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  
  if (!user || !user.roles.includes('admin')) {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up sessions for users
  app.use((req, res, next) => {
    // Parse cookies for session management
    const cookies: Record<string, string> = {};
    if (req.headers.cookie) {
      req.headers.cookie.split(';').forEach(cookie => {
        const parts = cookie.split('=');
        cookies[parts[0].trim()] = parts[1].trim();
      });
    }
    (req as any).cookies = cookies;
    next();
  });
  
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
              'metal': 3,
              'tech-scrap': 2,
              'sensor-crystal': 1,
              'circuit-board': 0,
              'alchemy-ink': 0
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
              'metal': 100,
              'tech-scrap': 100,
              'sensor-crystal': 100,
              'circuit-board': 100,
              'alchemy-ink': 100
            }
          });
        }
      } else {
        // In a real app, this would check the database and verify password hashes
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate session token
      const sessionToken = `${user.id.toString(16).padStart(8, '0')}-${uuidv4().substring(9)}`;
      
      // Set session cookie with more permissive settings for development
      res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; Path=/; HttpOnly; SameSite=None; Secure=false`);
      
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
              'metal': 7,
              'tech-scrap': 4,
              'sensor-crystal': 3,
              'circuit-board': 2,
              'alchemy-ink': 3
            }
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
        
        // Set session cookie with more permissive settings for development
        res.setHeader('Set-Cookie', `sessionToken=${sessionToken}; Path=/; HttpOnly; SameSite=None; Secure=false`);
        
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
      const quests = await storage.getQuests();
      const userQuests = await storage.getUserQuests(user.id);
      
      // Map quests with status for the user
      const questsWithStatus = quests.map(quest => {
        const userQuest = userQuests.find(uq => uq.questId === quest.id);
        const status = userQuest ? userQuest.status : 'locked';
        
        return {
          id: quest.id.toString(),
          date: quest.date,
          title: quest.title,
          description: quest.description,
          kitRequired: quest.kitRequired,
          difficulty: quest.difficulty,
          adventureKit: quest.adventureKit,
          rewards: quest.rewards,
          status
        };
      });
      
      return res.json(questsWithStatus);
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
        kitRequired: quest.kitRequired,
        difficulty: quest.difficulty,
        adventureKit: quest.adventureKit,
        rewards: quest.rewards
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
      
      // Add rewards to user's inventory
      const inventory = { ...user.inventory };
      for (const reward of quest.rewards) {
        inventory[reward.type] = (inventory[reward.type] || 0) + reward.quantity;
        
        // Create inventory history
        await storage.createInventoryHistory({
          userId: user.id,
          type: reward.type,
          quantity: reward.quantity,
          action: 'gained',
          source: 'quest'
        });
      }
      
      // Update user's inventory
      await storage.updateUser(user.id, { inventory });
      
      // Check for unlockable achievements
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements(user.id);
      
      // Count completed quests
      const completedQuestsCount = userQuests.filter(uq => uq.status === 'completed').length;
      
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
      
      // Return rewards
      return res.json({ rewards: quest.rewards });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to complete quest" });
    }
  });
  
  // Inventory routes
  app.get('/api/inventory', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const inventory = user.inventory;
      
      // Get inventory history for last acquired info
      const history = await storage.getInventoryHistory(user.id);
      
      // Format the inventory with last acquired date
      const formattedInventory = Object.entries(inventory).map(([type, quantity]) => {
        const lastHistoryItem = history.find(h => h.type === type && h.action === 'gained');
        return {
          type,
          quantity,
          lastAcquired: lastHistoryItem ? lastHistoryItem.createdAt.toISOString() : null
        };
      });
      
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
      
      // Create crafted item
      const craftedItem = await storage.createCraftedItem({
        userId: user.id,
        craftableId,
        status: craftable.type === 'physical' ? 'pending' : 'unlocked',
        tracking: null,
        address: null
      });
      
      return res.json({
        id: craftedItem.id.toString(),
        itemId: craftable.id.toString(),
        name: craftable.name,
        type: craftable.type,
        status: craftedItem.status
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
      
      const formattedItems = await Promise.all(craftedItems.map(async item => {
        const craftable = await storage.getCraftable(item.craftableId);
        return {
          id: item.id.toString(),
          itemId: item.craftableId.toString(),
          name: craftable?.name || 'Unknown Item',
          image: craftable?.image || '',
          type: craftable?.type || 'unknown',
          dateCrafted: item.dateCrafted.toISOString(),
          status: item.status,
          tracking: item.tracking
        };
      }));
      
      return res.json(formattedItems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to fetch crafted items" });
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
  
  // Admin routes
  app.post('/api/admin/quests', authenticate, adminOnly, async (req, res) => {
    try {
      const questData = req.body;
      const schema = z.object({
        date: z.string(),
        title: z.string(),
        description: z.string(),
        kitRequired: z.string(),
        difficulty: z.number().min(1).max(5),
        adventureKit: z.string(),
        rewards: z.array(z.object({
          type: z.string(),
          quantity: z.number().positive()
        })),
        active: z.boolean().optional()
      });
      
      const validatedData = schema.parse(questData);
      const quest = await storage.createQuest(validatedData);
      
      // Add this quest to all users
      const users = Array.from((await storage.getQuests()).values());
      for (const user of users) {
        await storage.createUserQuest({
          userId: user.id,
          questId: quest.id,
          status: 'available'
        });
      }
      
      return res.json(quest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to create quest" });
    }
  });
  
  return httpServer;
}
