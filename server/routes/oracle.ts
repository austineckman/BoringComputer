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
router.get('/entities/:tableName', authenticate, async (req, res) => {
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
router.get('/entities/:tableName/:id', authenticate, async (req, res) => {
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

// Create a new entity
router.post('/entities', authenticate, async (req, res) => {
  try {
    const { tableName, data } = createEntitySchema.parse(req.body);
    
    if (!tableMap[tableName]) {
      return res.status(400).json({ message: `Table ${tableName} does not exist` });
    }
    
    const table = tableMap[tableName];
    
    // Insert new entity
    const [newEntity] = await db.insert(table).values(data).returning();
    
    return res.status(201).json(newEntity);
  } catch (error) {
    console.error('Error creating entity:', error);
    return res.status(500).json({ message: 'Failed to create entity' });
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
    
    // Update entity
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
router.delete('/entities', authenticate, async (req, res) => {
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
router.get('/kits-with-components', authenticate, async (req, res) => {
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
router.get('/quests-with-components', authenticate, async (req, res) => {
  try {
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
router.get('/users-with-quests/:userId', authenticate, async (req, res) => {
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

export default router;