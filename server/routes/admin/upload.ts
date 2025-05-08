import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { adminAuth } from '../../middleware/adminAuth';
import { upload, handleUploadErrors, scanUploadedFile } from '../../middleware/secure-uploads';

const router = Router();

// Create quest images uploads directory if it doesn't exist
const questUploadDir = path.join(process.cwd(), 'public', 'uploads', 'quest-images');
if (!fs.existsSync(questUploadDir)) {
  fs.mkdirSync(questUploadDir, { recursive: true });
}

// Create recipe hero images uploads directory if it doesn't exist
const recipeHeroUploadDir = path.join(process.cwd(), 'public', 'uploads', 'recipe-heroes');
if (!fs.existsSync(recipeHeroUploadDir)) {
  fs.mkdirSync(recipeHeroUploadDir, { recursive: true });
}

// Configure multer for quest image uploads
const questImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, questUploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueId = nanoid(8);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${extension}`);
  }
});

// Configure multer for recipe hero image uploads
const recipeHeroStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, recipeHeroUploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const uniqueId = nanoid(8);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `recipe-hero-${uniqueId}${extension}`);
  }
});

// Filter to only allow image files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const questImageUpload = multer({
  storage: questImageStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

const recipeHeroUpload = multer({
  storage: recipeHeroStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Quest image upload endpoint with enhanced security
router.post(
  '/upload-image', 
  adminAuth, 
  upload.single('image'), 
  handleUploadErrors,
  scanUploadedFile,
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Use the secureFilePath that was validated by scanUploadedFile
      const securePath = (req as any).secureFilePath || `/uploads/${path.basename(req.file.path)}`;
      
      // Move the file to the quest-images directory
      const sourceFile = req.file.path;
      const targetDir = path.join(process.cwd(), 'public', 'uploads', 'quest-images');
      const targetFile = path.join(targetDir, path.basename(sourceFile));
      
      // Ensure the directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(sourceFile, targetFile);
      
      // Return the path to the uploaded file
      const relativePath = `/uploads/quest-images/${path.basename(targetFile)}`;
      return res.status(200).json({ url: relativePath });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// Recipe hero image upload endpoint with enhanced security
router.post(
  '/upload-recipe-hero', 
  adminAuth, 
  upload.single('heroImage'), 
  handleUploadErrors,
  scanUploadedFile,
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Use the secureFilePath that was validated by scanUploadedFile
      const securePath = (req as any).secureFilePath || `/uploads/${path.basename(req.file.path)}`;
      
      // Move the file to the recipe-heroes directory
      const sourceFile = req.file.path;
      const targetDir = path.join(process.cwd(), 'public', 'uploads', 'recipe-heroes');
      const targetFile = path.join(targetDir, `recipe-hero-${path.basename(sourceFile)}`);
      
      // Ensure the directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Move the file
      fs.renameSync(sourceFile, targetFile);
      
      // Return the path to the uploaded file
      const relativePath = `/uploads/recipe-heroes/${path.basename(targetFile)}`;
      return res.status(200).json({ url: relativePath });
    } catch (error) {
      console.error('Error uploading recipe hero image:', error);
      return res.status(500).json({ error: 'Failed to upload recipe hero image' });
    }
  }
);

export default router;