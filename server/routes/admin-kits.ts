import { Request, Response, Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { componentKits, kitComponents, insertComponentKitSchema, insertKitComponentSchema } from '@shared/schema';
import { isAdmin } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'public', 'uploads', 'kits');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const extension = path.extname(file.originalname);
    const filename = `${path.basename(file.originalname, extension)}-${uuidv4().slice(0, 10)}${extension}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

// GET all component kits
router.get('/kits', isAdmin, async (req: Request, res: Response) => {
  try {
    const allKits = await db.select().from(componentKits);
    res.json(allKits);
  } catch (error) {
    console.error('Error fetching component kits:', error);
    res.status(500).json({ message: 'Failed to fetch component kits' });
  }
});

// GET a specific component kit by ID
router.get('/kits/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [kit] = await db.select().from(componentKits).where(eq(componentKits.id, id));
    
    if (!kit) {
      return res.status(404).json({ message: 'Component kit not found' });
    }
    
    // Also get all components for this kit
    const components = await db.select().from(kitComponents).where(eq(kitComponents.kitId, id));
    
    res.json({ kit, components });
  } catch (error) {
    console.error('Error fetching component kit:', error);
    res.status(500).json({ message: 'Failed to fetch component kit' });
  }
});

// POST create a new component kit
router.post('/kits', isAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const kitData = req.body;
    
    // Add image path if an image was uploaded
    if (req.file) {
      kitData.imagePath = `/uploads/kits/${req.file.filename}`;
    }
    
    // Validate kit data
    const validatedData = insertComponentKitSchema.parse(kitData);
    
    // Insert kit into database
    const [newKit] = await db.insert(componentKits).values(validatedData).returning();
    
    res.status(201).json(newKit);
  } catch (error) {
    console.error('Error creating component kit:', error);
    res.status(500).json({ message: 'Failed to create component kit', error: String(error) });
  }
});

// PUT update a component kit
router.put('/kits/:id', isAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const kitData = req.body;
    
    // Add image path if an image was uploaded
    if (req.file) {
      kitData.imagePath = `/uploads/kits/${req.file.filename}`;
    }
    
    // Check if kit exists
    const [existingKit] = await db.select().from(componentKits).where(eq(componentKits.id, id));
    if (!existingKit) {
      return res.status(404).json({ message: 'Component kit not found' });
    }
    
    // Only update fields that were provided
    const updateData: any = {};
    if (kitData.name) updateData.name = kitData.name;
    if (kitData.description) updateData.description = kitData.description;
    if (kitData.imagePath) updateData.imagePath = kitData.imagePath;
    if (kitData.category) updateData.category = kitData.category;
    if (kitData.difficulty) updateData.difficulty = kitData.difficulty;
    updateData.updatedAt = new Date();
    
    // Update kit in database
    const [updatedKit] = await db
      .update(componentKits)
      .set(updateData)
      .where(eq(componentKits.id, id))
      .returning();
    
    res.json(updatedKit);
  } catch (error) {
    console.error('Error updating component kit:', error);
    res.status(500).json({ message: 'Failed to update component kit', error: String(error) });
  }
});

// DELETE a component kit
router.delete('/kits/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete all components first (cascade delete)
    await db.delete(kitComponents).where(eq(kitComponents.kitId, id));
    
    // Then delete the kit
    const deletedKit = await db.delete(componentKits).where(eq(componentKits.id, id)).returning();
    
    if (deletedKit.length === 0) {
      return res.status(404).json({ message: 'Component kit not found' });
    }
    
    res.json({ message: 'Component kit deleted successfully' });
  } catch (error) {
    console.error('Error deleting component kit:', error);
    res.status(500).json({ message: 'Failed to delete component kit' });
  }
});

// GET all components for a specific kit
router.get('/kits/:kitId/components', isAdmin, async (req: Request, res: Response) => {
  try {
    const { kitId } = req.params;
    const components = await db.select().from(kitComponents).where(eq(kitComponents.kitId, kitId));
    res.json(components);
  } catch (error) {
    console.error('Error fetching kit components:', error);
    res.status(500).json({ message: 'Failed to fetch kit components' });
  }
});

// POST create a new component for a kit
router.post('/kits/:kitId/components', isAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { kitId } = req.params;
    const componentData = { ...req.body, kitId };
    
    // Add image path if an image was uploaded
    if (req.file) {
      componentData.imagePath = `/uploads/kits/${req.file.filename}`;
    }
    
    // Check if kit exists
    const [kit] = await db.select().from(componentKits).where(eq(componentKits.id, kitId));
    if (!kit) {
      return res.status(404).json({ message: 'Component kit not found' });
    }
    
    // Validate component data
    const validatedData = insertKitComponentSchema.parse(componentData);
    
    // Insert component into database
    const [newComponent] = await db.insert(kitComponents).values(validatedData).returning();
    
    res.status(201).json(newComponent);
  } catch (error) {
    console.error('Error creating kit component:', error);
    res.status(500).json({ message: 'Failed to create kit component', error: String(error) });
  }
});

// PUT update a component
router.put('/components/:id', isAdmin, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const componentData = req.body;
    
    // Add image path if an image was uploaded
    if (req.file) {
      componentData.imagePath = `/uploads/kits/${req.file.filename}`;
    }
    
    // Check if component exists
    const [existingComponent] = await db.select().from(kitComponents).where(eq(kitComponents.id, parseInt(id)));
    if (!existingComponent) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    // Only update fields that were provided
    const updateData: any = {};
    if (componentData.name) updateData.name = componentData.name;
    if (componentData.description) updateData.description = componentData.description;
    if (componentData.imagePath) updateData.imagePath = componentData.imagePath;
    if (componentData.partNumber) updateData.partNumber = componentData.partNumber;
    if (componentData.isRequired !== undefined) updateData.isRequired = componentData.isRequired;
    if (componentData.quantity) updateData.quantity = componentData.quantity;
    if (componentData.category) updateData.category = componentData.category;
    updateData.updatedAt = new Date();
    
    // Update component in database
    const [updatedComponent] = await db
      .update(kitComponents)
      .set(updateData)
      .where(eq(kitComponents.id, parseInt(id)))
      .returning();
    
    res.json(updatedComponent);
  } catch (error) {
    console.error('Error updating component:', error);
    res.status(500).json({ message: 'Failed to update component', error: String(error) });
  }
});

// DELETE a component
router.delete('/components/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedComponent = await db
      .delete(kitComponents)
      .where(eq(kitComponents.id, parseInt(id)))
      .returning();
    
    if (deletedComponent.length === 0) {
      return res.status(404).json({ message: 'Component not found' });
    }
    
    res.json({ message: 'Component deleted successfully' });
  } catch (error) {
    console.error('Error deleting component:', error);
    res.status(500).json({ message: 'Failed to delete component' });
  }
});

export default router;