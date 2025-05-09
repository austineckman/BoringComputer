/**
 * Analyzes an image to find the coordinates of a black rectangle (OLED display area)
 * @param {string} imageSrc - Path to the image
 * @returns {Promise<{x: number, y: number, width: number, height: number}>} - Rectangle coordinates
 */
export const findBlackRectangle = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Handle CORS if needed
    
    img.onload = () => {
      console.log("Image loaded, dimensions:", img.width, "x", img.height);
      
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
      
      // OLED image specific analysis:
      // For SSD1306 OLED images, we know the display is approximately
      // in the center of the component and is truly black (R,G,B all near 0)
      // while the surrounding blue has higher blue values
      
      // First pass: Find the center region of the image
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      
      // Use stricter threshold for true black (OLED display area)
      const blackThreshold = 20; // Very dark pixels (true black)
      // Use a different threshold for dark blue (component body)
      const blueThreshold = 50; // Blue component body
      
      // Start from the center and expand outward to find black rectangle edges
      let topEdge = 0;
      let bottomEdge = canvas.height;
      let leftEdge = 0;
      let rightEdge = canvas.width;
      
      // Find top edge (move from center upward until we exit the black area)
      for (let y = centerY; y >= 0; y--) {
        const idx = (y * canvas.width + centerX) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // If we find a pixel that's not black (likely blue housing)
        if (r > blackThreshold || g > blackThreshold || b > blueThreshold) {
          topEdge = y + 1; // The edge is actually the last black pixel
          break;
        }
      }
      
      // Find bottom edge (move from center downward)
      for (let y = centerY; y < canvas.height; y++) {
        const idx = (y * canvas.width + centerX) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (r > blackThreshold || g > blackThreshold || b > blueThreshold) {
          bottomEdge = y - 1;
          break;
        }
      }
      
      // Find left edge (move from center leftward)
      for (let x = centerX; x >= 0; x--) {
        const idx = (centerY * canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (r > blackThreshold || g > blackThreshold || b > blueThreshold) {
          leftEdge = x + 1;
          break;
        }
      }
      
      // Find right edge (move from center rightward)
      for (let x = centerX; x < canvas.width; x++) {
        const idx = (centerY * canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        if (r > blackThreshold || g > blackThreshold || b > blueThreshold) {
          rightEdge = x - 1;
          break;
        }
      }
      
      // Calculate dimensions
      const x = leftEdge;
      const y = topEdge;
      const width = rightEdge - leftEdge + 1;
      const height = bottomEdge - topEdge + 1;
      
      console.log("Edge detection results:", { 
        topEdge, bottomEdge, leftEdge, rightEdge,
        width, height
      });
      
      // Sanity check - if we found something too small or oddly proportioned,
      // use a more traditional pixel-by-pixel approach as backup
      if (width < 10 || height < 10 || width > canvas.width * 0.9 || height > canvas.height * 0.9) {
        console.log("Edge detection produced unexpected results, falling back to pixel scan");
        
        // Variables to track the black rectangle boundaries using standard method
        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = 0;
        let maxY = 0;
        let foundBlack = false;
        
        // Scan the entire image
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Check if pixel is truly black (all RGB values are very low)
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
          console.log("No black pixels found, falling back to default values");
          // Fallback to reasonable default values for OLED display
          resolve({
            x: Math.floor(canvas.width * 0.2),
            y: Math.floor(canvas.height * 0.3),
            width: Math.floor(canvas.width * 0.6),
            height: Math.floor(canvas.height * 0.4)
          });
          return;
        }
        
        // Calculate width and height from scan
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        
        console.log("Pixel scan results:", { 
          minX, minY, maxX, maxY,
          width, height
        });
        
        // Return rectangle coordinates from pixel scan
        resolve({
          x: minX,
          y: minY,
          width: width,
          height: height
        });
      } else {
        // Return rectangle coordinates from edge detection
        resolve({
          x,
          y,
          width,
          height
        });
      }
    };
    
    img.onerror = () => {
      console.error("Failed to load image:", imageSrc);
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