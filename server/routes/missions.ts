import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { authenticate } from '../auth';
import { missionComments, missionDiagrams, users } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';

const router = Router();

// Get mission comments with user info
router.get('/:questId/comments', async (req, res) => {
  try {
    const questId = parseInt(req.params.questId);
    
    // Get all comments for this quest with user information
    const comments = await db
      .select({
        id: missionComments.id,
        questId: missionComments.questId,
        userId: missionComments.userId,
        content: missionComments.content,
        parentCommentId: missionComments.parentCommentId,
        createdAt: missionComments.createdAt,
        updatedAt: missionComments.updatedAt,
        discordUsername: missionComments.discordUsername,
        discordAvatar: missionComments.discordAvatar,
        isHidden: missionComments.isHidden,
        // Include user info as fallback (using proper column reference)
        username: users.username,
        avatar: users.avatar,
      })
      .from(missionComments)
      .leftJoin(users, eq(missionComments.userId, users.id))
      .where(and(
        eq(missionComments.questId, questId),
        eq(missionComments.isHidden, false)
      ))
      .orderBy(desc(missionComments.createdAt));

    // Organize comments with replies
    const topLevelComments = comments.filter(c => !c.parentCommentId);
    const commentsWithReplies = topLevelComments.map(comment => ({
      ...comment,
      replies: comments.filter(c => c.parentCommentId === comment.id)
    }));

    res.json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching mission comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add mission comment
router.post('/:questId/comments', authenticate, async (req, res) => {
  try {
    const questId = parseInt(req.params.questId);
    const userId = req.user.id;
    
    const schema = z.object({
      content: z.string().min(1).max(2000),
      parentCommentId: z.number().optional(),
    });

    const { content, parentCommentId } = schema.parse(req.body);

    // Get user's Discord info if available
    const user = await storage.getUser(userId);
    
    // Create comment with Discord username and avatar if available
    const [newComment] = await db
      .insert(missionComments)
      .values({
        questId,
        userId,
        content,
        parentCommentId,
        discordUsername: user?.username,
        discordAvatar: user?.avatar,
      })
      .returning();

    res.json(newComment);
  } catch (error) {
    console.error('Error creating mission comment:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid comment data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }
});

// Get mission diagrams
router.get('/:questId/diagrams', async (req, res) => {
  try {
    const questId = parseInt(req.params.questId);
    
    const diagrams = await db
      .select()
      .from(missionDiagrams)
      .where(eq(missionDiagrams.questId, questId))
      .orderBy(missionDiagrams.order, missionDiagrams.createdAt);

    res.json(diagrams);
  } catch (error) {
    console.error('Error fetching mission diagrams:', error);
    res.status(500).json({ error: 'Failed to fetch diagrams' });
  }
});

// Complete mission
router.post('/:questId/complete', authenticate, async (req, res) => {
  try {
    const questId = parseInt(req.params.questId);
    const userId = req.user.id;

    // Get the quest details
    const quest = await storage.getQuest(questId);
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Check if user already completed this quest
    const user = await storage.getUser(userId);
    if (user?.completedQuests?.includes(questId)) {
      return res.status(400).json({ error: 'Quest already completed' });
    }

    // Update user quest status
    await storage.updateUserQuestStatus(userId, questId, 'completed');

    // Add quest to completed quests list
    const updatedCompletedQuests = [...(user?.completedQuests || []), questId];
    await storage.updateUser(userId, {
      completedQuests: updatedCompletedQuests,
      xp: (user?.xp || 0) + quest.xpReward,
    });

    // Award quest rewards (loot boxes, items, etc.)
    const rewards = [];
    
    // Process loot box rewards
    if (quest.lootBoxRewards && quest.lootBoxRewards.length > 0) {
      for (const reward of quest.lootBoxRewards) {
        const lootBox = await storage.createLootBox({
          userId,
          type: reward.type,
          source: 'quest',
          sourceId: questId.toString(),
          name: `${quest.title} Reward`,
          description: `Reward for completing "${quest.title}"`,
          rarity: reward.type as any,
        });
        rewards.push({ type: 'lootbox', item: lootBox });
      }
    }

    // Process item rewards
    if (quest.rewards && quest.rewards.length > 0) {
      for (const reward of quest.rewards) {
        // Add items directly to inventory
        const currentInventory = user?.inventory || {};
        const currentQuantity = currentInventory[reward.id] || 0;
        const newInventory = {
          ...currentInventory,
          [reward.id]: currentQuantity + reward.quantity
        };
        
        await storage.updateUser(userId, { inventory: newInventory });
        
        // Log inventory change
        await storage.createInventoryHistory({
          userId,
          type: reward.id,
          quantity: reward.quantity,
          action: 'gained',
          source: 'quest_completion',
        });
        
        rewards.push({ type: 'item', item: { id: reward.id, quantity: reward.quantity } });
      }
    }

    res.json({
      success: true,
      message: 'Mission completed successfully!',
      xpGained: quest.xpReward,
      rewards,
    });

  } catch (error) {
    console.error('Error completing mission:', error);
    res.status(500).json({ error: 'Failed to complete mission' });
  }
});

export default router;