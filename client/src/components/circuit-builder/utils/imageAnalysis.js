/**
 * Analyzes an image to find the coordinates of a black rectangle
 * @param {string} imageSrc - Path to the image
 * @returns {Promise<{x: number, y: number, width: number, height: number}>} - Rectangle coordinates
 */
export const findBlackRectangle = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS if needed
    
    img.onload = () => {
      // Create an off-screen canvas to analyze the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image to the canvas
      ctx.drawImage(img, 0, 0);
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Variables to track the black rectangle boundaries
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      let foundBlack = false;
      
      // Threshold for "blackness" - may need tuning
      const blackThreshold = 30; // RGB values below this are considered black
      
      // Scan the entire image
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          
          // Check if pixel is black (all RGB values are low)
          if (r < blackThreshold && g < blackThreshold && b < blackThreshold) {
            // Update boundaries
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            foundBlack = true;
          }
        }
      }
      
      if (!foundBlack) {
        reject(new Error("No black rectangle found in the image"));
        return;
      }
      
      // Calculate width and height
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;
      
      // Return rectangle coordinates
      resolve({
        x: minX,
        y: minY,
        width: width,
        height: height
      });
    };
    
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    
    img.src = imageSrc;
  });
};

// Cache for analyzed images
const imageRectCache = new Map();

/**
 * Finds a black rectangle in an image with caching
 * @param {string} imageSrc - Path to the image
 * @returns {Promise<{x: number, y: number, width: number, height: number}>} - Rectangle coordinates
 */
export const findRectangleWithCache = async (imageSrc) => {
  // Check if we already analyzed this image
  if (imageRectCache.has(imageSrc)) {
    return imageRectCache.get(imageSrc);
  }
  
  try {
    const rect = await findBlackRectangle(imageSrc);
    // Store in cache
    imageRectCache.set(imageSrc, rect);
    return rect;
  } catch (err) {
    console.error("Error finding black rectangle:", err);
    // Default fallback values - reasonable defaults for OLED display
    const fallbackRect = {
      x: 20,
      y: 25,
      width: 90, 
      height: 40
    };
    // Cache the fallback as well to avoid repeated failed attempts
    imageRectCache.set(imageSrc, fallbackRect);
    return fallbackRect;
  }
};