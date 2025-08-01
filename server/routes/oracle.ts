import express from 'express';
import { db } from '../db';
import { authenticate } from '../auth';
import * as schema from '@shared/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

// Oracle interface schema for updating various entities
const updateEntitySchema = z.object({
  tableName: z.string(),
  id: z.union([z.string(), z.number()]),
  data: z.record(z.any())
});

const createEntitySchema = z.object({
  tableName: z.string(),
  data: z.record(z.any())
});

const deleteEntitySchema = z.object({
  tableName: z.string(),
  id: z.union([z.string(), z.number()])
});

// Initialize router
const router = express.Router();

// Table map - maps friendly table names to schema tables
const tableMap: Record<string, any> = {
  'users': schema.users,
  'quests': schema.quests,
  'componentKits': schema.componentKits,
  'kitComponents': schema.kitComponents,
  'lootBoxes': schema.lootBoxes,
  'lootBoxConfigs': schema.lootBoxConfigs,
  'items': schema.items,
  'craftingRecipes': schema.craftingRecipes,
  'userQuests': schema.userQuests,
  'inventoryHistory': schema.inventoryHistory,
  'questComponents': schema.questComponents,
  'characterEquipment': schema.characterEquipment,
  'kitArtwork': schema.kitArtwork,
};

// Get all entities for a specific table
router.get('/entities/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    if (!tableMap[tableName]) {
      return res.status(400).json({ message: `Table ${tableName} does not exist` });
    }
    
    const entities = await db.select().from(tableMap[tableName]);
    return res.json(entities);
  } catch (error) {
    console.error(`Error fetching ${req.params.tableName}:`, error);
    return res.status(500).json({ message: `Failed to fetch ${req.params.tableName}` });
  }
});

// Get a single entity by ID
router.get('/entities/:tableName/:id', async (req, res) => {
  try {
    const { tableName, id } = req.params;
    
    if (!tableMap[tableName]) {
      return res.status(400).json({ message: `Table ${tableName} does not exist` });
    }
    
    const table = tableMap[tableName];
    const idField = table.id;
    
    const [entity] = await db
      .select()
      .from(table)
      .where(eq(idField, isNaN(Number(id)) ? id : Number(id)));
    
    if (!entity) {
      return res.status(404).json({ message: `${tableName} with ID ${id} not found` });
    }
    
    return res.json(entity);
  } catch (error) {
    console.error(`Error fetching ${req.params.tableName} with ID ${req.params.id}:`, error);
    return res.status(500).json({ message: `Failed to fetch ${req.params.tableName}` });
  }
});

// Create or update an entity (upsert)
router.post('/entities', async (req, res) => {
  try {
    console.log('🔧 Oracle API POST request received:', {
      hasId: !!req.body.id,
      hasData: !!req.body.data,
      tableName: req.body.tableName,
      bodyKeys: Object.keys(req.body)
    });
    
    // Handle both create and update operations
    let parsedBody;
    
    if (req.body.id && req.body.data) {
      // Update operation format: {tableName, id, data}
      parsedBody = updateEntitySchema.parse(req.body);
    } else {
      // Create operation format: {tableName, data}
      parsedBody = createEntitySchema.parse(req.body);
    }
    
    const { tableName, id, data } = parsedBody;
    
    // Debug logging for quest operations
    if (tableName === 'quests') {
      console.log('🔧 Quest operation - Table:', tableName, 'ID:', id);
      console.log('🔧 Quest data keys:', Object.keys(data));
      console.log('🔧 componentRequirements in data:', data.componentRequirements ? 'YES' : 'NO');
      if (data.componentRequirements) {
        console.log('🔧 componentRequirements length:', data.componentRequirements.length);
      }
    }
    
    if (!tableMap[tableName]) {
      return res.status(400).json({ 
        message: `Table ${tableName} does not exist`,
        availableTables: Object.keys(tableMap),
        error: 'INVALID_TABLE'
      });
    }
    
    const table = tableMap[tableName];
    
    // Determine if this is an update operation by checking if entity exists
    let isUpdateOperation = false;
    if (id) {
      const idField = table.id;
      const [existingEntity] = await db
        .select()
        .from(table)
        .where(eq(idField, isNaN(Number(id)) ? id : Number(id)));
      
      isUpdateOperation = !!existingEntity;
    }
    
    // Validate data structure for specific tables
    if (tableName === 'quests') {
      // Validate quest-specific data
      if (!data.title || typeof data.title !== 'string') {
        return res.status(400).json({ 
          message: 'Quest title is required and must be a string',
          error: 'INVALID_QUEST_TITLE',
          receivedData: data
        });
      }
      
      if (!data.adventureLine || typeof data.adventureLine !== 'string') {
        return res.status(400).json({ 
          message: 'Quest adventure line is required and must be a string',
          error: 'INVALID_ADVENTURE_LINE',
          receivedData: data
        });
      }
      
      if (!data.description || typeof data.description !== 'string') {
        return res.status(400).json({ 
          message: 'Quest description is required and must be a string',
          error: 'INVALID_QUEST_DESCRIPTION',
          receivedData: data
        });
      }
      
      if (data.id && !Number.isInteger(Number(data.id))) {
        return res.status(400).json({ 
          message: 'Quest ID must be an integer',
          error: 'INVALID_QUEST_ID',
          receivedId: data.id,
          receivedType: typeof data.id
        });
      }
      
      if (data.id && Number(data.id) > Number.MAX_SAFE_INTEGER) {
        return res.status(400).json({ 
          message: 'Quest ID exceeds maximum safe integer',
          error: 'QUEST_ID_TOO_LARGE',
          receivedId: data.id,
          maxSafeInteger: Number.MAX_SAFE_INTEGER
        });
      }
      
      // Convert string ID to number for quests
      if (data.id && typeof data.id === 'string') {
        data.id = Number(data.id);
      }
    }
    
    // Handle both create and update operations
    let resultEntity;
    
    if (isUpdateOperation) {
      // Update existing entity
      const idField = table.id;
      const [updatedEntity] = await db
        .update(table)
        .set(data)
        .where(eq(idField, isNaN(Number(id)) ? id : Number(id)))
        .returning();
      
      if (!updatedEntity) {
        return res.status(404).json({ 
          message: `${tableName} with ID ${id} not found`,
          error: 'ENTITY_NOT_FOUND'
        });
      }
      
      resultEntity = updatedEntity;
    } else {
      // Handle quest creation with comprehensive field support
      if (tableName === 'quests') {
        const componentRequirements = data.componentRequirements;
        
        // Remove componentRequirements from quest data before saving (handled separately)
        const { componentRequirements: _, ...questData } = data;
        
        // Ensure all quest fields are properly handled for new quests
        const cleanQuestData = {
          ...questData,
          // Ensure core fields are present
          title: questData.title || 'Untitled Quest',
          description: questData.description || 'No description provided',
          adventureLine: questData.adventureLine || 'General',
          difficulty: questData.difficulty || 1,
          xpReward: questData.xpReward || 100,
          // Handle solution fields
          solutionCode: questData.solutionCode || null,
          wiringInstructions: questData.wiringInstructions || null,
          wiringDiagram: questData.wiringDiagram || null,
          solutionNotes: questData.solutionNotes || null,
          heroImage: questData.heroImage || null,
          status: questData.status || 'available',
          // Handle JSON fields safely
          rewards: questData.rewards || [],
          lootBoxRewards: questData.lootBoxRewards || [],
          content: questData.content || { videos: [], images: [], codeBlocks: [] },
          // Handle optional fields
          date: questData.date || null,
          missionBrief: questData.missionBrief || null,
          kitId: questData.kitId || null,
          orderInLine: questData.orderInLine || 0,
          active: questData.active !== undefined ? questData.active : true
        };
        
        // Insert new quest
        const [newQuest] = await db.insert(table).values(cleanQuestData).returning();
        resultEntity = newQuest;
        
        // Handle component requirements separately
        if (componentRequirements && componentRequirements.length > 0) {
          console.log('🔧 Processing component requirements for NEW quest:', newQuest.id);
          console.log('🔧 Component requirements received:', JSON.stringify(componentRequirements, null, 2));
          
          const questComponentsData = componentRequirements.map((comp: any) => ({
            questId: newQuest.id,
            componentId: parseInt(comp.id),
            quantity: comp.quantity || 1,
            isOptional: comp.isOptional || false
          }));
          
          console.log('🔧 Inserting quest components for NEW quest:', JSON.stringify(questComponentsData, null, 2));
          await db.insert(schema.questComponents).values(questComponentsData);
          console.log('🔧 Successfully inserted quest components for NEW quest');
        } else {
          console.log('🔧 No component requirements for NEW quest');
        }
      } else {
        // Insert new entity normally for non-quest tables
        const [newEntity] = await db.insert(table).values(data).returning();
        resultEntity = newEntity;
      }
    }
    
    return res.status(isUpdateOperation ? 200 : 201).json(resultEntity);
  } catch (error) {
    console.error('Error creating entity:', error);
    
    // More specific error handling
    if (error.code === '22003') {
      return res.status(400).json({ 
        message: 'Numeric value out of range',
        error: 'NUMERIC_VALUE_OUT_OF_RANGE',
        details: error.message,
        hint: 'The ID value is too large for the database column. Consider using a smaller numeric value.',
        requestData: req.body
      });
    }
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        message: 'Duplicate key value violates unique constraint',
        error: 'DUPLICATE_KEY_ERROR',
        details: error.detail,
        requestData: req.body
      });
    }
    
    if (error.code === '23502') {
      return res.status(400).json({ 
        message: 'Not null constraint violation',
        error: 'NULL_CONSTRAINT_VIOLATION',
        details: error.message,
        requestData: req.body
      });
    }
    
    if (error.code === '23503') {
      return res.status(400).json({ 
        message: 'Foreign key constraint violation',
        error: 'FOREIGN_KEY_CONSTRAINT_VIOLATION',
        details: error.detail,
        requestData: req.body
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to create entity',
      error: 'UNKNOWN_DATABASE_ERROR',
      details: error.message,
      code: error.code,
      requestData: req.body
    });
  }
});

// Update an entity
router.put('/entities', authenticate, async (req, res) => {
  try {
    const { tableName, id, data } = updateEntitySchema.parse(req.body);
    
    if (!tableMap[tableName]) {
      return res.status(400).json({ message: `Table ${tableName} does not exist` });
    }
    
    const table = tableMap[tableName];
    const idField = table.id;
    
    // Handle quest updates with comprehensive field support
    if (tableName === 'quests') {
      const questId = isNaN(Number(id)) ? id : Number(id);
      const componentRequirements = data.componentRequirements;
      
      // Remove componentRequirements from quest data before saving (handled separately)
      const { componentRequirements: _, ...questData } = data;
      
      // Ensure all quest fields are properly handled
      const cleanQuestData = {
        ...questData,
        // Ensure core fields are present
        title: questData.title || 'Untitled Quest',
        description: questData.description || 'No description provided',
        adventureLine: questData.adventureLine || 'General',
        difficulty: questData.difficulty || 1,
        xpReward: questData.xpReward || 100,
        // Handle solution fields
        solutionCode: questData.solutionCode || null,
        wiringInstructions: questData.wiringInstructions || null,
        wiringDiagram: questData.wiringDiagram || null,
        solutionNotes: questData.solutionNotes || null,
        heroImage: questData.heroImage || null,
        status: questData.status || 'available',
        // Handle JSON fields safely
        rewards: questData.rewards || [],
        lootBoxRewards: questData.lootBoxRewards || [],
        content: questData.content || { videos: [], images: [], codeBlocks: [] },
        // Handle optional fields
        date: questData.date || null,
        missionBrief: questData.missionBrief || null,
        kitId: questData.kitId || null,
        orderInLine: questData.orderInLine || 0,
        active: questData.active !== undefined ? questData.active : true
      };
      
      // Update the quest first
      const [updatedQuest] = await db
        .update(table)
        .set(cleanQuestData)
        .where(eq(idField, questId))
        .returning();
      
      if (!updatedQuest) {
        return res.status(404).json({ message: `Quest with ID ${id} not found` });
      }
      
      // Handle component requirements separately
      if (componentRequirements !== undefined) {
        console.log('🔧 Processing component requirements for quest:', questId);
        console.log('🔧 Component requirements received:', JSON.stringify(componentRequirements, null, 2));
        
        // Delete existing quest components
        await db
          .delete(schema.questComponents)
          .where(eq(schema.questComponents.questId, questId));
        console.log('🔧 Deleted existing quest components');
        
        // Insert new quest components
        if (componentRequirements && componentRequirements.length > 0) {
          const questComponentsData = componentRequirements.map((comp: any) => ({
            questId: questId,
            componentId: parseInt(comp.id),
            quantity: comp.quantity || 1,
            isOptional: comp.isOptional || false
          }));
          
          console.log('🔧 Inserting quest components:', JSON.stringify(questComponentsData, null, 2));
          await db.insert(schema.questComponents).values(questComponentsData);
          console.log('🔧 Successfully inserted quest components');
        } else {
          console.log('🔧 No component requirements to insert');
        }
      } else {
        console.log('🔧 Component requirements not provided in request');
      }
      
      return res.json(updatedQuest);
    }
    
    // Update entity normally for non-quest tables
    const [updatedEntity] = await db
      .update(table)
      .set(data)
      .where(eq(idField, isNaN(Number(id)) ? id : Number(id)))
      .returning();
    
    if (!updatedEntity) {
      return res.status(404).json({ message: `${tableName} with ID ${id} not found` });
    }
    
    return res.json(updatedEntity);
  } catch (error) {
    console.error('Error updating entity:', error);
    return res.status(500).json({ message: 'Failed to update entity' });
  }
});

// Delete an entity
router.delete('/entities', async (req, res) => {
  try {
    const { tableName, id } = deleteEntitySchema.parse(req.body);
    
    if (!tableMap[tableName]) {
      return res.status(400).json({ message: `Table ${tableName} does not exist` });
    }
    
    const table = tableMap[tableName];
    const idField = table.id;
    
    // Delete entity
    const [deletedEntity] = await db
      .delete(table)
      .where(eq(idField, isNaN(Number(id)) ? id : Number(id)))
      .returning();
    
    if (!deletedEntity) {
      return res.status(404).json({ message: `${tableName} with ID ${id} not found` });
    }
    
    return res.json({ message: `${tableName} with ID ${id} successfully deleted`, entity: deletedEntity });
  } catch (error) {
    console.error('Error deleting entity:', error);
    return res.status(500).json({ message: 'Failed to delete entity' });
  }
});

// Complex queries - Get all kits with their components
router.get('/kits-with-components', async (req, res) => {
  try {
    const kits = await db.select().from(schema.componentKits);
    
    const kitsWithComponents = await Promise.all(
      kits.map(async (kit) => {
        const components = await db
          .select()
          .from(schema.kitComponents)
          .where(eq(schema.kitComponents.kitId, kit.id));
        
        return {
          ...kit,
          components
        };
      })
    );
    
    return res.json(kitsWithComponents);
  } catch (error) {
    console.error('Error fetching kits with components:', error);
    return res.status(500).json({ message: 'Failed to fetch kits with components' });
  }
});

// Get all quests with their component requirements
router.get('/quests-with-components', async (req, res) => {
  try {
    console.log('⚠️ Development mode: Bypassing authentication for Oracle quest access');
    const quests = await db.select().from(schema.quests);
    
    const questsWithComponents = await Promise.all(
      quests.map(async (quest) => {
        if (!quest.id) return quest;
        
        const questComponentRelations = await db
          .select()
          .from(schema.questComponents)
          .where(eq(schema.questComponents.questId, quest.id));
        
        const componentDetails = await Promise.all(
          questComponentRelations.map(async (relation) => {
            const [component] = await db
              .select()
              .from(schema.kitComponents)
              .where(eq(schema.kitComponents.id, relation.componentId));
            
            return {
              ...component,
              quantity: relation.quantity,
              isOptional: relation.isOptional
            };
          })
        );
        
        return {
          ...quest,
          componentRequirements: componentDetails
        };
      })
    );
    
    return res.json(questsWithComponents);
  } catch (error) {
    console.error('Error fetching quests with components:', error);
    return res.status(500).json({ message: 'Failed to fetch quests with components' });
  }
});

// Get user info with their quests
router.get('/users-with-quests/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: `User with ID ${userId} not found` });
    }
    
    const userQuests = await db
      .select()
      .from(schema.userQuests)
      .where(eq(schema.userQuests.userId, userId));
    
    const questDetails = await Promise.all(
      userQuests.map(async (uq) => {
        const [quest] = await db
          .select()
          .from(schema.quests)
          .where(eq(schema.quests.id, uq.questId));
        
        return {
          ...uq,
          quest
        };
      })
    );
    
    const userWithQuests = {
      ...user,
      quests: questDetails
    };
    
    return res.json(userWithQuests);
  } catch (error) {
    console.error(`Error fetching user with ID ${req.params.userId} and their quests:`, error);
    return res.status(500).json({ message: 'Failed to fetch user with quests' });
  }
});

// Dedicated endpoint for updating quest rewards
router.put('/quests/:questId/rewards', async (req, res) => {
  try {
    const questId = parseInt(req.params.questId);
    const { rewards } = req.body;
    
    // Validate the quest exists
    const [quest] = await db
      .select()
      .from(schema.quests)
      .where(eq(schema.quests.id, questId));
      
    if (!quest) {
      return res.status(404).json({ message: "Quest not found" });
    }
    
    // Validate the rewards structure
    const rewardsSchema = z.array(z.object({
      type: z.string(),
      id: z.string(),
      quantity: z.number().positive()
    }));
    
    try {
      rewardsSchema.parse(rewards);
    } catch (validationError) {
      return res.status(400).json({ 
        message: "Invalid rewards format", 
        error: validationError 
      });
    }
    
    // Update only the rewards
    const [updatedQuest] = await db
      .update(schema.quests)
      .set({ 
        ...quest,
        rewards: rewards
      })
      .where(eq(schema.quests.id, questId))
      .returning();
    
    console.log(`Updated rewards for quest ${questId}`);
    return res.json({
      success: true,
      quest: updatedQuest
    });
  } catch (error) {
    console.error("Error updating quest rewards:", error);
    return res.status(500).json({ 
      message: "Failed to update quest rewards", 
      error: error.message 
    });
  }
});

export default router;