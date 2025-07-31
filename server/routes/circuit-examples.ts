import { Router } from 'express';
import { db } from '../db';
import { circuitExamples } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticate } from '../auth';
import { hasOracleAccess } from '../middleware/auth';

const router = Router();

// Get all published circuit examples (public endpoint)
router.get('/', async (req, res) => {
  try {
    const examples = await db
      .select({
        id: circuitExamples.id,
        name: circuitExamples.name,
        description: circuitExamples.description,
        arduinoCode: circuitExamples.arduinoCode,
        circuitData: circuitExamples.circuitData,
        createdAt: circuitExamples.createdAt,
      })
      .from(circuitExamples)
      .where(eq(circuitExamples.isPublished, true))
      .orderBy(desc(circuitExamples.createdAt));
    
    res.json(examples);
  } catch (error) {
    console.error('Error fetching circuit examples:', error);
    res.status(500).json({ error: 'Failed to fetch circuit examples' });
  }
});

// Get all circuit examples (admin only)
router.get('/admin', authenticate, hasOracleAccess, async (req, res) => {
  try {
    const examples = await db
      .select()
      .from(circuitExamples)
      .orderBy(desc(circuitExamples.createdAt));
    
    res.json(examples);
  } catch (error) {
    console.error('Error fetching admin circuit examples:', error);
    res.status(500).json({ error: 'Failed to fetch circuit examples' });
  }
});

// Create new circuit example (admin only)
router.post('/', authenticate, hasOracleAccess, async (req, res) => {
  try {
    const { name, description, arduinoCode, circuitData, isPublished } = req.body;
    
    if (!name || !arduinoCode || !circuitData) {
      return res.status(400).json({ error: 'Name, Arduino code, and circuit data are required' });
    }

    const newExample = await db
      .insert(circuitExamples)
      .values({
        name,
        description: description || null,
        arduinoCode,
        circuitData,
        createdBy: req.user.id,
        isPublished: isPublished || false,
      })
      .returning();

    res.status(201).json(newExample[0]);
  } catch (error) {
    console.error('Error creating circuit example:', error);
    res.status(500).json({ error: 'Failed to create circuit example' });
  }
});

// Update circuit example (admin only)
router.put('/:id', authenticate, hasOracleAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, arduinoCode, circuitData, isPublished } = req.body;

    const updatedExample = await db
      .update(circuitExamples)
      .set({
        name,
        description,
        arduinoCode,
        circuitData,
        isPublished,
        updatedAt: new Date(),
      })
      .where(eq(circuitExamples.id, id))
      .returning();

    if (updatedExample.length === 0) {
      return res.status(404).json({ error: 'Circuit example not found' });
    }

    res.json(updatedExample[0]);
  } catch (error) {
    console.error('Error updating circuit example:', error);
    res.status(500).json({ error: 'Failed to update circuit example' });
  }
});

// Delete circuit example (admin only)
router.delete('/:id', authenticate, hasOracleAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExample = await db
      .delete(circuitExamples)
      .where(eq(circuitExamples.id, id))
      .returning();

    if (deletedExample.length === 0) {
      return res.status(404).json({ error: 'Circuit example not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting circuit example:', error);
    res.status(500).json({ error: 'Failed to delete circuit example' });
  }
});

export default router;