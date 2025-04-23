import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';
import { nanoid } from 'nanoid';

// Ensure item uploads directory exists
const itemUploadDir = path.resolve('public/uploads/items');
if (!fs.existsSync(itemUploadDir)) {
  fs.mkdirSync(itemUploadDir, { recursive: true });
}

// Ensure quest image uploads directory exists
const questImageUploadDir = path.resolve('public/uploads/quest-images');
if (!fs.existsSync(questImageUploadDir)) {
  fs.mkdirSync(questImageUploadDir, { recursive: true });
}

// Configure storage for item images
const itemStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, itemUploadDir);
  },
  filename: (req: Request, file, cb) => {
    const itemId = req.params.itemId || 'temp';
    // Generate a unique filename with timestamp to avoid overwriting
    const uniquePrefix = `${itemId}-${Date.now()}`;
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniquePrefix}${fileExt}`);
  }
});

// Configure storage for quest images
const questImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, questImageUploadDir);
  },
  filename: (_req: Request, file, cb) => {
    // Generate a unique filename
    const uniqueId = nanoid(8);
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${fileExt}`);
  }
});

// Configure file filter to only accept images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Create multer upload instance for item images
export const upload = multer({
  storage: itemStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Create multer upload instance for quest images
export const questImageUpload = multer({
  storage: questImageStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Helper function to get the public URL for an item image
export function getPublicImageUrl(filename: string): string {
  if (!filename) return '';
  return `/uploads/items/${filename}`;
}

// Helper function to get the public URL for a quest image
export function getPublicQuestImageUrl(filename: string): string {
  if (!filename) return '';
  return `/uploads/quest-images/${filename}`;
}

// Helper function to extract filename from full path
export function getFilenameFromPath(fullPath: string | null): string | null {
  if (!fullPath) return null;
  return path.basename(fullPath);
}