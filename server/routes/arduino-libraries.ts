import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();

// Configure multer for library uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'attached_assets', 'arduino-libraries');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp to prevent conflicts
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const timestamp = Date.now();
    cb(null, `${timestamp}_${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed'));
    }
  }
});

// Upload library endpoint
router.post('/upload', upload.single('library'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No library file uploaded'
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    
    // Extract library name from filename (remove .zip extension)
    const libraryName = path.basename(originalName, '.zip');
    
    // Store library metadata
    const libraryInfo = {
      name: libraryName,
      originalName: originalName,
      filename: req.file.filename,
      path: `/attached_assets/arduino-libraries/${req.file.filename}`,
      uploadedAt: new Date().toISOString(),
      size: req.file.size
    };

    // Save library registry (in a real app, this would go to a database)
    const registryPath = path.join(process.cwd(), 'attached_assets', 'arduino-libraries', 'registry.json');
    let registry: any[] = [];
    
    try {
      if (fs.existsSync(registryPath)) {
        const registryData = fs.readFileSync(registryPath, 'utf8');
        registry = JSON.parse(registryData);
      }
    } catch (error) {
      console.warn('Could not read library registry, starting fresh');
    }

    // Remove existing entry with same name
    registry = registry.filter(lib => lib.name !== libraryName);
    
    // Add new library
    registry.push(libraryInfo);
    
    // Save updated registry
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

    console.log(`✅ Arduino library uploaded: ${libraryName} (${req.file.size} bytes)`);

    res.json({
      success: true,
      message: 'Library uploaded successfully',
      libraryName: libraryName,
      library: libraryInfo
    });

  } catch (error) {
    console.error('Library upload error:', error);
    
    // Clean up file if upload failed
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up uploaded file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    });
  }
});

// Get available libraries
router.get('/', async (req, res) => {
  try {
    const registryPath = path.join(process.cwd(), 'attached_assets', 'arduino-libraries', 'registry.json');
    let registry: any[] = [];
    
    if (fs.existsSync(registryPath)) {
      const registryData = fs.readFileSync(registryPath, 'utf8');
      registry = JSON.parse(registryData);
    }

    res.json({
      success: true,
      libraries: registry
    });

  } catch (error) {
    console.error('Error fetching libraries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch libraries'
    });
  }
});

// Delete library
router.delete('/:libraryName', async (req, res) => {
  try {
    const { libraryName } = req.params;
    const registryPath = path.join(process.cwd(), 'attached_assets', 'arduino-libraries', 'registry.json');
    
    if (!fs.existsSync(registryPath)) {
      return res.status(404).json({
        success: false,
        message: 'Library not found'
      });
    }

    const registryData = fs.readFileSync(registryPath, 'utf8');
    let registry = JSON.parse(registryData);
    
    const libraryIndex = registry.findIndex((lib: any) => lib.name === libraryName);
    if (libraryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Library not found'
      });
    }

    const library = registry[libraryIndex];
    
    // Delete the physical file
    const fullPath = path.join(process.cwd(), 'attached_assets', 'arduino-libraries', library.filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Remove from registry
    registry.splice(libraryIndex, 1);
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

    console.log(`🗑️ Arduino library deleted: ${libraryName}`);

    res.json({
      success: true,
      message: 'Library deleted successfully'
    });

  } catch (error) {
    console.error('Library deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete library'
    });
  }
});

export default router;