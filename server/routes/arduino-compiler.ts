import { Router } from 'express';
import axios from 'axios';

const router = Router();

const COMPILER_URL = 'https://compiler.craftingtable.com/compile';

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
    console.log('[Arduino Compiler Proxy] Code length:', code.length);

    // Forward the request to the DigitalOcean compiler server
    const response = await axios.post(COMPILER_URL, { code }, {
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
