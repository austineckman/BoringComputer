import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Define allowed file extensions and max file size
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Make sure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a random filename with original extension to prevent path traversal
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    cb(null, `${randomName}${fileExt}`);
  }
});

// File filter to validate uploads
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return cb(new Error('File type not allowed'));
  }
  
  // Allow the file
  cb(null, true);
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

/**
 * Middleware to handle file upload errors
 */
export function handleUploadErrors(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Generic error during file upload
    return res.status(400).json({ error: err.message });
  }
  
  next();
}

/**
 * Middleware to scan uploaded files for potentially dangerous content
 * This is a basic implementation - in production, consider using a dedicated security scanning service
 */
export function scanUploadedFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return next();
  }
  
  const filePath = req.file.path;
  
  // Read the first few bytes of the file to perform basic validation
  fs.readFile(filePath, { encoding: null, flag: 'r' }, (err, data) => {
    if (err) {
      // If there's an error reading the file, delete it and return an error
      fs.unlink(filePath, () => {});
      return res.status(500).json({ error: 'Error processing upload' });
    }
    
    // Basic file type validation with magic numbers
    // This only validates common image formats
    const isValidImage = validateImageFile(data, path.extname(req.file!.originalname).toLowerCase());
    
    if (!isValidImage) {
      // If the file isn't actually the claimed type, delete it and return an error
      fs.unlink(filePath, () => {});
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Add the validated file path to the request
    (req as any).secureFilePath = `/uploads/${path.basename(filePath)}`;
    next();
  });
}

/**
 * Validate an image file by checking its magic numbers
 */
function validateImageFile(buffer: Buffer, extension: string): boolean {
  // Check file signature based on extension
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      // JPEG starts with FF D8 FF
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    
    case '.png':
      // PNG starts with 89 50 4E 47 0D 0A 1A 0A
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    
    case '.gif':
      // GIF starts with 47 49 46 38
      return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
    
    case '.webp':
      // WEBP starts with 52 49 46 46, followed by filesize, then 57 45 42 50
      return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
             buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    
    case '.svg':
      // For SVG, check if it starts with either '<?xml' or '<svg'
      const header = buffer.slice(0, 100).toString().trim();
      return header.startsWith('<?xml') || header.startsWith('<svg');
    
    default:
      return false;
  }
}