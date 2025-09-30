import { Router } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = Router();

const COMPILER_URL = 'https://compiler.craftingtable.com/compile';
const LIBRARIES_PATH = path.join(__dirname, '../arduino-libraries');

// Map of library include names to their directory names
const LIBRARY_MAP: {[key: string]: string} = {
  'U8g2lib.h': 'u8g2',
  'U8g2.h': 'u8g2',
  'TM1637Display.h': 'tm1637',
  'Keypad.h': 'keypad',
  'BasicEncoder.h': 'basic-encoder'
};

// Function to inline local libraries into the code
function inlineLibraries(code: string): string {
  let processedCode = code;
  const includedLibraries = new Set<string>();
  
  // Find all #include statements for our local libraries
  const includeRegex = /#include\s+[<"]([^>"]+)[>"]/g;
  let match;
  
  while ((match = includeRegex.exec(code)) !== null) {
    const headerFile = match[1];
    const libraryDir = LIBRARY_MAP[headerFile];
    
    if (libraryDir && !includedLibraries.has(libraryDir)) {
      includedLibraries.add(libraryDir);
      
      try {
        // Read header file
        const headerPath = path.join(LIBRARIES_PATH, libraryDir, headerFile);
        let headerContent = '';
        
        if (fs.existsSync(headerPath)) {
          headerContent = fs.readFileSync(headerPath, 'utf8');
          console.log(`[Library Inliner] Found ${headerFile} in ${libraryDir}`);
        }
        
        // Read implementation file (if exists)
        const cppFile = headerFile.replace('.h', '.cpp');
        const cppPath = path.join(LIBRARIES_PATH, libraryDir, cppFile);
        let cppContent = '';
        
        if (fs.existsSync(cppPath)) {
          cppContent = fs.readFileSync(cppPath, 'utf8');
          // Remove #include statements from cpp that reference the header
          cppContent = cppContent.replace(new RegExp(`#include\\s+["<]${headerFile}[">]`, 'g'), '');
          console.log(`[Library Inliner] Found ${cppFile} in ${libraryDir}`);
        }
        
        // Replace the include statement with the actual library code
        if (headerContent || cppContent) {
          const libraryCode = `
// ========== BEGIN LIBRARY: ${headerFile} ==========
${headerContent}

${cppContent}
// ========== END LIBRARY: ${headerFile} ==========
`;
          // Replace the specific include line
          processedCode = processedCode.replace(match[0], libraryCode);
          console.log(`[Library Inliner] Inlined ${headerFile}`);
        }
      } catch (error) {
        console.error(`[Library Inliner] Error reading library ${libraryDir}:`, error);
      }
    }
  }
  
  return processedCode;
}

// Proxy endpoint for Arduino compilation
router.post('/compile', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        errors: ['No Arduino code provided']
      });
    }

    console.log('[Arduino Compiler Proxy] Forwarding compilation request to DigitalOcean server...');
    console.log('[Arduino Compiler Proxy] Original code length:', code.length);

    // Inline local libraries before sending to compiler
    const processedCode = inlineLibraries(code);
    console.log('[Arduino Compiler Proxy] Processed code length:', processedCode.length);

    // Forward the request to the DigitalOcean compiler server
    const response = await axios.post(COMPILER_URL, { code: processedCode }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('[Arduino Compiler Proxy] Received response:', response.data.success ? 'SUCCESS' : 'FAILURE');
    
    // Log full error details for debugging
    if (!response.data.success) {
      console.log('[Arduino Compiler Proxy] Error details:', JSON.stringify(response.data, null, 2));
    }

    // Forward the response back to the client
    res.json(response.data);

  } catch (error) {
    console.error('[Arduino Compiler Proxy] Error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          success: false,
          errors: ['Compiler server is unavailable. Please try again later.']
        });
      }
      
      if (error.response) {
        // Forward the error response from the compiler server
        return res.status(error.response.status).json(error.response.data);
      }
    }

    res.status(500).json({
      success: false,
      errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    });
  }
});

export default router;
