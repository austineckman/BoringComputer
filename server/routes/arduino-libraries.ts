import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

/**
 * Get all available Arduino libraries with their metadata
 */
router.get('/', async (req, res) => {
  try {
    const librariesDir = path.join(process.cwd(), 'server', 'arduino-libraries');
    
    // Check if libraries directory exists
    try {
      await fs.access(librariesDir);
    } catch {
      return res.json({ success: true, libraries: [] });
    }

    const libraryDirs = await fs.readdir(librariesDir, { withFileTypes: true });
    const libraries = [];

    for (const dir of libraryDirs) {
      if (dir.isDirectory() && dir.name !== '.DS_Store') {
        try {
          // Read library metadata
          const libraryJsonPath = path.join(librariesDir, dir.name, 'library.json');
          const libraryJsonContent = await fs.readFile(libraryJsonPath, 'utf-8');
          const libraryMetadata = JSON.parse(libraryJsonContent);

          // Read source files
          const libraryDir = path.join(librariesDir, dir.name);
          const files = await fs.readdir(libraryDir);
          
          const sourceFiles = [];
          let keywords = null;
          
          for (const file of files) {
            if (file.endsWith('.h') || file.endsWith('.cpp')) {
              const filePath = path.join(libraryDir, file);
              const content = await fs.readFile(filePath, 'utf-8');
              sourceFiles.push({
                name: file,
                content,
                type: file.endsWith('.h') ? 'header' : 'source'
              });
            } else if (file === 'keywords.txt') {
              try {
                const keywordsPath = path.join(libraryDir, file);
                keywords = await fs.readFile(keywordsPath, 'utf-8');
              } catch (error) {
                console.warn(`Could not read keywords.txt for ${dir.name}:`, error);
              }
            }
          }

          libraries.push({
            ...libraryMetadata,
            files: sourceFiles,
            keywords,
            directory: dir.name
          });
        } catch (error) {
          console.error(`Error reading library ${dir.name}:`, error);
          // Skip libraries that can't be read
        }
      }
    }

    res.json({ success: true, libraries });
  } catch (error) {
    console.error('Error fetching Arduino libraries:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch libraries' });
  }
});

/**
 * Get a specific library by name
 */
router.get('/:libraryName', async (req, res) => {
  try {
    const { libraryName } = req.params;
    const librariesDir = path.join(process.cwd(), 'server', 'arduino-libraries');
    const libraryDir = path.join(librariesDir, libraryName);

    // Check if library exists
    try {
      await fs.access(libraryDir);
    } catch {
      return res.status(404).json({ success: false, error: 'Library not found' });
    }

    // Read library metadata
    const libraryJsonPath = path.join(libraryDir, 'library.json');
    const libraryJsonContent = await fs.readFile(libraryJsonPath, 'utf-8');
    const libraryMetadata = JSON.parse(libraryJsonContent);

    // Read source files
    const files = await fs.readdir(libraryDir);
    const sourceFiles = [];
    let keywords = null;
    
    for (const file of files) {
      if (file.endsWith('.h') || file.endsWith('.cpp')) {
        const filePath = path.join(libraryDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        sourceFiles.push({
          name: file,
          content,
          type: file.endsWith('.h') ? 'header' : 'source'
        });
      } else if (file === 'keywords.txt') {
        try {
          const keywordsPath = path.join(libraryDir, file);
          keywords = await fs.readFile(keywordsPath, 'utf-8');
        } catch (error) {
          console.warn(`Could not read keywords.txt for ${libraryName}:`, error);
        }
      }
    }

    res.json({
      success: true,
      library: {
        ...libraryMetadata,
        files: sourceFiles,
        keywords,
        directory: libraryName
      }
    });
  } catch (error) {
    console.error(`Error fetching library ${req.params.libraryName}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch library' });
  }
});

/**
 * Get library functions/documentation for autocomplete
 */
router.get('/:libraryName/functions', async (req, res) => {
  try {
    const { libraryName } = req.params;
    const librariesDir = path.join(process.cwd(), 'server', 'arduino-libraries');
    const libraryJsonPath = path.join(librariesDir, libraryName, 'library.json');

    const libraryJsonContent = await fs.readFile(libraryJsonPath, 'utf-8');
    const libraryMetadata = JSON.parse(libraryJsonContent);

    res.json({
      success: true,
      functions: libraryMetadata.functions || [],
      constants: libraryMetadata.constants || [],
      examples: libraryMetadata.examples || []
    });
  } catch (error) {
    console.error(`Error fetching functions for library ${req.params.libraryName}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch library functions' });
  }
});

export default router;