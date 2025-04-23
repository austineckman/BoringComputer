import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = path.resolve('public/uploads/items');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    const itemId = req.params.itemId || 'temp';
    // Generate a unique filename with timestamp to avoid overwriting
    const uniquePrefix = `${itemId}-${Date.now()}`;
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniquePrefix}${fileExt}`);
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

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Helper function to get the public URL for an uploaded file
export function getPublicImageUrl(filename: string): string {
  if (!filename) return '';
  return `/uploads/items/${filename}`;
}

// Helper function to extract filename from full path
export function getFilenameFromPath(fullPath: string | null): string | null {
  if (!fullPath) return null;
  return path.basename(fullPath);
}