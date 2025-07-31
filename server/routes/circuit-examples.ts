import { Router } from 'express';
import { z } from 'zod';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db';
import { circuitProjects, insertCircuitProjectSchema } from '@shared/schema';
import { authenticate } from '../auth';

const router = Router();

// Validation schema for circuit examples
const circuitExampleSchema = insertCircuitProjectSchema.extend({
  isExample: z.boolean().default(true),
  isPublic: z.boolean().default(true)
});

// Get all published circuit examples
router.get('/', async (req, res) => {
  try {
    const examples = await db
      .select()
      .from(circuitProjects)
      .where(and(
        eq(circuitProjects.isExample, true),
        eq(circuitProjects.isPublic, true)
      ))
      .orderBy(desc(circuitProjects.updatedAt));

    res.json(examples);
  } catch (error) {
    console.error('Error fetching circuit examples:', error);
    res.status(500).json({ error: 'Failed to fetch circuit examples' });
  }
});

// Get examples by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const examples = await db
      .select()
      .from(circuitProjects)
      .where(and(
        eq(circuitProjects.isExample, true),
        eq(circuitProjects.isPublic, true),
        eq(circuitProjects.category, category)
      ))
      .orderBy(desc(circuitProjects.updatedAt));

    res.json(examples);
  } catch (error) {
    console.error('Error fetching circuit examples by category:', error);
    res.status(500).json({ error: 'Failed to fetch circuit examples' });
  }
});

// Get single example by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [example] = await db
      .select()
      .from(circuitProjects)
      .where(and(
        eq(circuitProjects.id, parseInt(id)),
        eq(circuitProjects.isExample, true),
        eq(circuitProjects.isPublic, true)
      ));

    if (!example) {
      return res.status(404).json({ error: 'Circuit example not found' });
    }

    res.json(example);
  } catch (error) {
    console.error('Error fetching circuit example:', error);
    res.status(500).json({ error: 'Failed to fetch circuit example' });
  }
});

// Check if user has founder privileges
const isFounder = (req: any) => {
  const user = req.user;
  return user?.roles?.includes('Founder') || user?.roles?.includes('admin');
};

// Create new circuit example (Founder only)
router.post('/', authenticate, async (req: any, res) => {
  try {
    if (!isFounder(req)) {
      return res.status(403).json({ error: 'Founder access required' });
    }

    const validatedData = circuitExampleSchema.parse({
      ...req.body,
      userId: req.user.id,
      isExample: true,
      isPublic: true
    });

    const [newExample] = await db
      .insert(circuitProjects)
      .values(validatedData)
      .returning();

    console.log(`Created circuit example: ${newExample.name} by user ${req.user.id}`);
    res.status(201).json(newExample);
  } catch (error) {
    console.error('Error creating circuit example:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create circuit example' });
  }
});

// Update circuit example (Founder only)
router.put('/:id', authenticate, async (req: any, res) => {
  try {
    if (!isFounder(req)) {
      return res.status(403).json({ error: 'Founder access required' });
    }

    const { id } = req.params;
    
    // Check if example exists and user owns it or is admin
    const [existing] = await db
      .select()
      .from(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)));

    if (!existing) {
      return res.status(404).json({ error: 'Circuit example not found' });
    }

    if (existing.userId !== req.user.id && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const validatedData = circuitExampleSchema.partial().parse(req.body);

    const [updatedExample] = await db
      .update(circuitProjects)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(circuitProjects.id, parseInt(id)))
      .returning();

    console.log(`Updated circuit example: ${updatedExample.name} by user ${req.user.id}`);
    res.json(updatedExample);
  } catch (error) {
    console.error('Error updating circuit example:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to update circuit example' });
  }
});

// Delete circuit example (Founder only)
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    if (!isFounder(req)) {
      return res.status(403).json({ error: 'Founder access required' });
    }

    const { id } = req.params;
    
    // Check if example exists and user owns it or is admin
    const [existing] = await db
      .select()
      .from(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)));

    if (!existing) {
      return res.status(404).json({ error: 'Circuit example not found' });
    }

    if (existing.userId !== req.user.id && !req.user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await db
      .delete(circuitProjects)
      .where(eq(circuitProjects.id, parseInt(id)));

    console.log(`Deleted circuit example: ${existing.name} by user ${req.user.id}`);
    res.json({ message: 'Circuit example deleted successfully' });
  } catch (error) {
    console.error('Error deleting circuit example:', error);
    res.status(500).json({ error: 'Failed to delete circuit example' });
  }
});

// Get examples created by current user (Founder only)
router.get('/my/examples', authenticate, async (req: any, res) => {
  try {
    if (!isFounder(req)) {
      return res.status(403).json({ error: 'Founder access required' });
    }

    const examples = await db
      .select()
      .from(circuitProjects)
      .where(and(
        eq(circuitProjects.userId, req.user.id),
        eq(circuitProjects.isExample, true)
      ))
      .orderBy(desc(circuitProjects.updatedAt));

    res.json(examples);
  } catch (error) {
    console.error('Error fetching user circuit examples:', error);
    res.status(500).json({ error: 'Failed to fetch user circuit examples' });
  }
});

export default router;