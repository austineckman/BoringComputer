import { BaseRepository } from './base-repository';
import * as schema from '@shared/schema';
import { db } from '../db';
import { and, eq, inArray, lt, lte, gte, desc, asc } from 'drizzle-orm';

/**
 * Repository for quest-related operations
 */
export class QuestRepository extends BaseRepository<
  typeof schema.quests,
  typeof schema.quests.$inferInsert,
  typeof schema.quests.$inferSelect
> {
  constructor() {
    super('quests');
  }
  
  /**
   * Get all quests with their component requirements
   */
  async getAllQuestsWithComponents() {
    const quests = await this.findAll();
    const questsWithComponents = [];
    
    for (const quest of quests) {
      const componentRequirements = await this.getQuestComponentRequirements(quest.id);
      
      questsWithComponents.push({
        ...quest,
        componentRequirements
      });
    }
    
    return questsWithComponents;
  }
  
  /**
   * Get the component requirements for a specific quest
   */
  async getQuestComponentRequirements(questId: number) {
    return await db
      .select({
        id: schema.questComponents.id,
        questId: schema.questComponents.questId,
        componentId: schema.questComponents.componentId,
        name: schema.kitComponents.name,
        description: schema.kitComponents.description,
        image: schema.kitComponents.imagePath,
        kitId: schema.kitComponents.kitId,
        quantity: schema.questComponents.quantity
      })
      .from(schema.questComponents)
      .leftJoin(
        schema.kitComponents,
        eq(schema.questComponents.componentId, schema.kitComponents.id)
      )
      .where(eq(schema.questComponents.questId, questId));
  }
  
  /**
   * Get quests for a specific component kit
   */
  async getQuestsByKitId(kitId: string) {
    const quests = await db
      .select()
      .from(schema.quests)
      .where(eq(schema.quests.kitId, kitId));
      
    return quests;
  }
  
  /**
   * Get user quests (tracking user progress)
   */
  async getUserQuests(userId: number) {
    return await db
      .select()
      .from(schema.userQuests)
      .where(eq(schema.userQuests.userId, userId));
  }
  
  /**
   * Get quests that are available for a user based on their progression
   */
  async getAvailableQuestsForUser(userId: number) {
    // Get user quests
    const userQuests = await this.getUserQuests(userId);
    
    // Get completed quest IDs
    const completedQuestIds = userQuests
      .filter(uq => uq.status === 'completed')
      .map(uq => uq.questId);
    
    // Get user from users table to check completedQuests array
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    // Combine completedQuestIds with user.completedQuests
    let allCompletedQuestIds = [...completedQuestIds];
    if (user && user.completedQuests) {
      allCompletedQuestIds = [...allCompletedQuestIds, ...user.completedQuests];
    }
    
    // Get all quests
    const allQuests = await this.findAll();
    
    // Group quests by adventure line
    const questsByAdventureLine: Record<string, typeof schema.quests.$inferSelect[]> = {};
    allQuests.forEach(quest => {
      if (!questsByAdventureLine[quest.adventureLine]) {
        questsByAdventureLine[quest.adventureLine] = [];
      }
      questsByAdventureLine[quest.adventureLine].push(quest);
    });
    
    // Sort each adventure line by orderInLine
    for (const adventureLine in questsByAdventureLine) {
      questsByAdventureLine[adventureLine].sort((a, b) => a.orderInLine - b.orderInLine);
    }
    
    // For each adventure line, determine available quests
    const availableQuests: typeof schema.quests.$inferSelect[] = [];
    
    for (const adventureLine in questsByAdventureLine) {
      const questsInLine = questsByAdventureLine[adventureLine];
      
      // The first quest in each line is always available
      if (questsInLine.length > 0) {
        const firstQuest = questsInLine[0];
        
        // Check if it's not already completed
        if (!allCompletedQuestIds.includes(firstQuest.id)) {
          availableQuests.push(firstQuest);
        }
      }
      
      // If one quest is completed, the next one becomes available
      for (let i = 0; i < questsInLine.length - 1; i++) {
        const currentQuest = questsInLine[i];
        const nextQuest = questsInLine[i + 1];
        
        if (
          allCompletedQuestIds.includes(currentQuest.id) &&
          !allCompletedQuestIds.includes(nextQuest.id)
        ) {
          availableQuests.push(nextQuest);
        }
      }
    }
    
    return availableQuests;
  }
  
  /**
   * Start a quest for a user
   */
  async startQuest(userId: number, questId: number) {
    // Check if the user already has this quest
    const userQuests = await this.getUserQuests(userId);
    const existingUserQuest = userQuests.find(uq => uq.questId === questId);
    
    if (existingUserQuest) {
      // Update the existing user quest
      return await db
        .update(schema.userQuests)
        .set({ status: 'active' })
        .where(eq(schema.userQuests.id, existingUserQuest.id))
        .returning();
    } else {
      // Create a new user quest
      return await db
        .insert(schema.userQuests)
        .values({
          userId,
          questId,
          status: 'active',
          progress: 0,
          startedAt: new Date()
        })
        .returning();
    }
  }
  
  /**
   * Complete a quest for a user
   */
  async completeQuest(userId: number, questId: number) {
    // Check if the user has this quest
    const userQuests = await this.getUserQuests(userId);
    const existingUserQuest = userQuests.find(uq => uq.questId === questId);
    
    if (existingUserQuest) {
      // Update the existing user quest
      const [updatedUserQuest] = await db
        .update(schema.userQuests)
        .set({ 
          status: 'completed',
          progress: 100,
          completedAt: new Date()
        })
        .where(eq(schema.userQuests.id, existingUserQuest.id))
        .returning();
      
      // Also update the user's completedQuests array
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
      
      if (user) {
        const completedQuests = user.completedQuests || [];
        if (!completedQuests.includes(questId)) {
          await db
            .update(schema.users)
            .set({ 
              completedQuests: [...completedQuests, questId]
            })
            .where(eq(schema.users.id, userId));
        }
      }
      
      return updatedUserQuest;
    } else {
      // Create a new completed user quest
      const [newUserQuest] = await db
        .insert(schema.userQuests)
        .values({
          userId,
          questId,
          status: 'completed',
          progress: 100,
          startedAt: new Date(),
          completedAt: new Date()
        })
        .returning();
      
      // Also update the user's completedQuests array
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId));
      
      if (user) {
        const completedQuests = user.completedQuests || [];
        if (!completedQuests.includes(questId)) {
          await db
            .update(schema.users)
            .set({ 
              completedQuests: [...completedQuests, questId]
            })
            .where(eq(schema.users.id, userId));
        }
      }
      
      return newUserQuest;
    }
  }
}