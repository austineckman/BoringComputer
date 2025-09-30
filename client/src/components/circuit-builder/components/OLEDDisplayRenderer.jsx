import React, { useEffect, useRef, useState } from 'react';
import { useSimulator } from '../simulator/SimulatorContext';
import { findRectangleWithCache } from '../utils/imageAnalysis';

/**
 * Component for rendering OLED display content based on simulator state
 * This is specifically for simulating an SSD1306 128x64 OLED display
 */
const OLEDDisplayRenderer = ({ id, componentId }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { componentStates, isRunning } = useSimulator();
  const [displayBuffer, setDisplayBuffer] = useState(null);
  const [displayRect, setDisplayRect] = useState(null);

  // Handle either id or componentId being passed (defensive programming)
  const displayId = id || componentId;

  // Canvas dimensions to match SSD1306 OLED dimensions (128x64 pixels)
  const displayWidth = 128;
  const displayHeight = 64;

  // Get the current state of this specific OLED display
  const displayState = displayId ? componentStates[displayId] : null;

  // Log for debugging
  useEffect(() => {
    if (!displayId) {
      console.warn("OLEDDisplayRenderer: No valid ID provided (id or componentId)");
    }
  }, [displayId]);

  // Initialize display buffer on mount
  useEffect(() => {
    // Create empty buffer (all pixels off)
    const emptyBuffer = new Array(displayHeight).fill(0).map(() => 
      new Array(displayWidth).fill(0)
    );
    setDisplayBuffer(emptyBuffer);
  }, []);

  // Find the black rectangle in the component image
  useEffect(() => {
    // Function to find the component image
    const findComponentImage = () => {
      // First try to find the parent component with the image
      let currentElement = canvasRef.current;
      if (!currentElement) return null;

      // Walk up the DOM to find the component container
      let parent = currentElement.parentElement;
      while (parent) {
        // Check for component container classes or data attributes
        if (parent.classList.contains('circuit-component') || 
            parent.dataset.componentId ||
            parent.id === displayId) {

          // Look for the image within the component
          const img = parent.querySelector('img');
          if (img && img.src) {
            console.log("Found component image:", img.src);
            return img.src;
          }
          break;
        }
        parent = parent.parentElement;
      }

      // If we couldn't find it directly, try a more general approach
      // This handles cases where the component structure might differ
      const oledComponents = document.querySelectorAll('img[src*="oled-display"]');
      if (oledComponents.length > 0) {
        console.log("Found OLED image via selector:", oledComponents[0].src);
        return oledComponents[0].src;
      }

      // Direct fallback to a known OLED image path
      console.log("Using fallback image path for OLED display");
      // Use the original image from the sandbox
      const oledPath = '/attached_assets/oled-display.icon.png';
      return oledPath;
    };

    // Analyze the component image to find the black rectangle
    const analyzeComponentImage = async () => {
      try {
        const imageSrc = findComponentImage();
        if (imageSrc) {
          console.log("Analyzing OLED image:", imageSrc);
          const rect = await findRectangleWithCache(imageSrc);
          console.log("Found black rectangle in OLED:", rect);

          // Verify that the detected rectangle is reasonable
          // Avoid results that are too large (whole component) or too small
          if (rect.width < 15 || rect.height < 15) {
            console.warn("Detected rectangle is too small, using manual values");
            // For OLED display, the black rectangle is typically in the center
            // and takes up about 60-70% of the width, positioned about 1/3 down from the top
            setDisplayRect({
              x: 20,
              y: 35,
              width: 88,
              height: 30
            });
          } else if (rect.width > 110 || rect.height > 110) {
            console.warn("Detected rectangle is too large, using manual values");
            setDisplayRect({
              x: 20,
              y: 35,
              width: 88,
              height: 30
            });
          } else {
            // Use detected values
            setDisplayRect(rect);
          }
        } else {
          console.error("Could not find OLED component image");
          // Use hardcoded values based on known OLED component structure
          setDisplayRect({
            x: 20,
            y: 35,
            width: 88,
            height: 30
          });
        }
      } catch (error) {
        console.error("Error in OLED image analysis:", error);
        // Use hardcoded values
        setDisplayRect({
          x: 20,
          y: 35,
          width: 88,
          height: 30
        });
      }
    };

    // Wait for the canvas to be mounted before running the analysis
    if (canvasRef.current) {
      // Give a slight delay to ensure component is fully rendered
      setTimeout(analyzeComponentImage, 200);
    }
  }, [displayId]); // Only run when displayId changes

  // Update canvas when display buffer changes
  useEffect(() => {
    if (!canvasRef.current || !displayBuffer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas with black background (OLED style)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels from buffer
    ctx.fillStyle = '#00ff41'; // Green for OLED pixels (more realistic)

    for (let y = 0; y < displayHeight; y++) {
      for (let x = 0; x < displayWidth; x++) {
        if (displayBuffer[y] && displayBuffer[y][x]) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Also handle display state elements if they exist (for advanced users)
    if (displayState && displayState.display && displayState.display.elements && displayState.display.elements.length > 0) {
      ctx.fillStyle = '#00ff41'; // Green for OLED pixels
      ctx.strokeStyle = '#00ff41';
      ctx.lineWidth = 1;

      displayState.display.elements.forEach((element) => {
        switch (element.type) {
          case 'text':
            ctx.font = '8px monospace';
            ctx.fillText(element.text, element.x, element.y);
            break;

          case 'frame':
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            break;

          case 'filledRect':
            ctx.fillRect(element.x, element.y, element.width, element.height);
            break;

          case 'circle':
            ctx.beginPath();
            ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;

          case 'filledCircle':
            ctx.beginPath();
            ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
            ctx.fill();
            break;

          case 'line':
            ctx.beginPath();
            ctx.moveTo(element.x1, element.y1);
            ctx.lineTo(element.x2, element.y2);
            ctx.stroke();
            break;

          case 'pixel':
            ctx.fillRect(element.x, element.y, 1, 1);
            break;
        }
      });
    }
  }, [displayBuffer, displayState, displayId]);

  // Update from simulator state when it changes
  useEffect(() => {
    if (displayState && displayState.display && displayState.display.buffer) {
      setDisplayBuffer(displayState.display.buffer);
    }
  }, [displayState]);

  // Clean up any animation intervals when the component unmounts or simulation stops
  useEffect(() => {
    // Only set up cleanup when simulation is running
    if (isRunning) {
      // No setup needed here, setup happens in the other useEffect

      // Return cleanup function
      return () => {
        if (animationInterval.current) {
          console.log("Cleaning up OLED animation interval");
          clearInterval(animationInterval.current);
          animationInterval.current = null;
        }
      };
    } else {
      // If simulation is not running, immediately clean up any existing intervals
      if (animationInterval.current) {
        console.log("Cleaning up OLED animation interval (simulation stopped)");
        clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
    }
  }, [isRunning]);

  // Reference to store animation interval
  const animationInterval = useRef(null);

  // Render display content based on simulator state
  useEffect(() => {
    if (!isRunning || !displayId) {
      // Clear display when simulation stops
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      }
      return;
    }

    console.log("OLED Display State:", displayState);

    // ONLY show OLED content if we have actual display elements from Arduino code
    if (displayState && displayState.display && displayState.display.elements && displayState.display.elements.length > 0) {
      console.log(`[OLED Debug] Rendering ${displayState.display.elements.length} display elements`);

      // Render the actual OLED commands from Arduino code
      const newBuffer = new Array(displayHeight).fill(0).map(() => 
        new Array(displayWidth).fill(0)
      );

      // Process each display element
      displayState.display.elements.forEach(element => {
        switch (element.type) {
          case 'text':
            drawText(newBuffer, element.text, element.x, element.y);
            break;
          case 'frame':
            drawFrame(newBuffer, element.x, element.y, element.width, element.height);
            break;
          case 'filledRect':
            drawFilledRect(newBuffer, element.x, element.y, element.width, element.height);
            break;
          case 'circle':
            drawCircle(newBuffer, element.x, element.y, element.radius);
            break;
          case 'filledCircle':
            drawFilledCircle(newBuffer, element.x, element.y, element.radius);
            break;
        }
      });

      setDisplayBuffer(newBuffer);
    } else {
      console.log(`[OLED Debug] No display elements found - keeping display blank`);
      // Keep display blank if no Arduino OLED commands received
      const emptyBuffer = new Array(displayHeight).fill(0).map(() => 
        new Array(displayWidth).fill(0)
      );
      setDisplayBuffer(emptyBuffer);
    }
  }, [isRunning, displayState]);

  // Helper function to draw a character (simple 5x7 font)
  const drawChar = (buffer, char, x, y) => {
    // Simple 5x7 font for digits and basic characters
    const fontData = {
      '0': [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      '1': [
        [0,0,1,0],
        [0,1,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,0,1,0],
        [0,1,1,1]
      ],
      '2': [
        [0,1,1,0],
        [1,0,0,1],
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0],
        [1,0,0,0],
        [1,1,1,1]
      ],
      '3': [
        [0,1,1,0],
        [1,0,0,1],
        [0,0,0,1],
        [0,1,1,0],
        [0,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      '4': [
        [0,0,1,1],
        [0,1,0,1],
        [1,0,0,1],
        [1,1,1,1],
        [0,0,0,1],
        [0,0,0,1],
        [0,0,0,1]
      ],
      '5': [
        [1,1,1,1],
        [1,0,0,0],
        [1,1,1,0],
        [0,0,0,1],
        [0,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      '6': [
        [0,1,1,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      '7': [
        [1,1,1,1],
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
      ],
      '8': [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      '9': [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,1],
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0]
      ],
      'F': [
        [1,1,1,1],
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0]
      ],
      'r': [
        [0,0,0,0],
        [0,0,0,0],
        [1,0,1,0],
        [1,1,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0]
      ],
      'a': [
        [0,0,0,0],
        [0,0,0,0],
        [0,1,1,0],
        [0,0,0,1],
        [0,1,1,1],
        [1,0,0,1],
        [0,1,1,1]
      ],
      'm': [
        [0,0,0,0],
        [0,0,0,0],
        [1,0,1,0],
        [1,1,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1]
      ],
      'e': [
        [0,0,0,0],
        [0,0,0,0],
        [0,1,1,0],
        [1,0,0,1],
        [1,1,1,1],
        [1,0,0,0],
        [0,1,1,1]
      ],
      ':': [
        [0,0,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,0,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,0,0,0]
      ],
      ' ': [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
      ],
      // Additional characters for error messages
      'E': [
        [1,1,1,1],
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,1]
      ],
      'L': [
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,1]
      ],
      'I': [
        [1,1,1,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [1,1,1,0]
      ],
      'B': [
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,1,1,0]
      ],
      'W': [
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,1,1],
        [0,1,0,0]
      ],
      'R': [
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,1,1,0],
        [1,0,1,0],
        [1,0,0,1],
        [1,0,0,1]
      ],
      'C': [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,1],
        [0,1,1,0]
      ],
      'D': [
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,1,1,0]
      ],
      'O': [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      'G': [
        [0,1,1,0],
        [1,0,0,1],
        [1,0,0,0],
        [1,0,1,1],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0]
      ],
      'N': [
        [1,0,0,1],
        [1,1,0,1],
        [1,0,1,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1]
      ],
      'h': [
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1]
      ],
      'k': [
        [1,0,0,0],
        [1,0,0,0],
        [1,0,1,0],
        [1,1,0,0],
        [1,1,0,0],
        [1,0,1,0],
        [1,0,0,1]
      ],
      'd': [
        [0,0,0,1],
        [0,0,0,1],
        [0,1,1,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,1]
      ],
      'w': [
        [0,0,0,0],
        [0,0,0,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,1,1],
        [0,1,0,1]
      ],
      'l': [
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [1,0,0,0],
        [0,1,1,0]
      ],
      'i': [
        [0,1,0,0],
        [0,0,0,0],
        [1,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [1,1,1,0]
      ],
      'p': [
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,0],
        [1,0,0,1],
        [1,1,1,0],
        [1,0,0,0],
        [1,0,0,0]
      ],
      'u': [
        [0,0,0,0],
        [0,0,0,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,1]
      ],
      'b': [
        [1,0,0,0],
        [1,0,0,0],
        [1,1,1,0],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,1,1,0]
      ],
      'y': [
        [0,0,0,0],
        [0,0,0,0],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,1],
        [0,0,0,1],
        [1,1,1,0]
      ],
      '-': [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
      ],
      '<': [
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0],
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1]
      ],
      '>': [
        [1,0,0,0],
        [0,1,0,0],
        [0,0,1,0],
        [0,0,0,1],
        [0,0,1,0],
        [0,1,0,0],
        [1,0,0,0]
      ],
      '/': [
        [0,0,0,1],
        [0,0,1,0],
        [0,0,1,0],
        [0,1,0,0],
        [0,1,0,0],
        [1,0,0,0],
        [1,0,0,0]
      ],
      '#': [
        [0,1,0,1],
        [0,1,0,1],
        [1,1,1,1],
        [0,1,0,1],
        [1,1,1,1],
        [0,1,0,1],
        [0,1,0,1]
      ],
      'V': [
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [1,0,0,1],
        [0,1,1,0],
        [0,0,0,0]
      ]
    };

    // Get font data for this char (default to space if not found)
    const charData = fontData[char] || fontData[' '];

    // Draw the character pixel by pixel
    for (let row = 0; row < charData.length; row++) {
      for (let col = 0; col < charData[row].length; col++) {
        if (charData[row][col]) {
          // Make sure we're within bounds
          if (y + row >= 0 && y + row < displayHeight && 
              x + col >= 0 && x + col < displayWidth) {
            buffer[y + row][x + col] = 1;
          }
        }
      }
    }
  };

  // Helper function to draw text
  const drawText = (buffer, text, x, y) => {
    for (let i = 0; i < text.length; i++) {
      drawChar(buffer, text.charAt(i), x + i * 6, y);
    }
  };

  // Helper function to draw a rectangle frame
  const drawFrame = (buffer, x, y, width, height) => {
    for (let i = 0; i < width; i++) {
      buffer[y][x + i] = 1; // Top
      buffer[y + height - 1][x + i] = 1; // Bottom
    }
    for (let i = 0; i < height; i++) {
      buffer[y + i][x] = 1; // Left
      buffer[y + i][x + width - 1] = 1; // Right
    }
  };

  // Helper function to draw a filled rectangle
  const drawFilledRect = (buffer, x, y, width, height) => {
    for (let yy = 0; yy < height; yy++) {
      for (let xx = 0; xx < width; xx++) {
        const drawX = Math.floor(x + xx);
        const drawY = Math.floor(y + yy);
        if (drawX >= 0 && drawX < displayWidth && drawY >= 0 && drawY < displayHeight) {
          buffer[drawY][drawX] = 1;
        }
      }
    }
  };

  // Helper function to draw a circle
  const drawCircle = (buffer, x, y, radius) => {
    for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
      const xx = radius * Math.cos(angle);
      const yy = radius * Math.sin(angle);
      const drawX = Math.floor(x + xx);
      const drawY = Math.floor(y + yy);
      if (drawX >= 0 && drawX < displayWidth && drawY >= 0 && drawY < displayHeight) {
        buffer[drawY][drawX] = 1;
      }
    }
  };

  // Helper function to draw a filled circle
  const drawFilledCircle = (buffer, x, y, radius) => {
    for (let yy = -radius; yy <= radius; yy++) {
      for (let xx = -radius; xx <= radius; xx++) {
        if (xx*xx + yy*yy <= radius*radius) {
          const drawX = Math.floor(x + xx);
          const drawY = Math.floor(y + yy);
          if (drawX >= 0 && drawX < displayWidth && drawY >= 0 && drawY < displayHeight) {
            buffer[drawY][drawX] = 1;
          }
        }
      }
    }
  };

  // Per user request, use specific manual positioning instead of image analysis
  // Double the size and adjust position (lower 10px, right 3px)
  // Check if the OLED is properly configured (for visuals)
  // Added extra defensive checks 
  const isDisplayActive = displayState && displayState.shouldDisplay === true;

  return (
    <div
      ref={containerRef}
      className={isDisplayActive ? "oled-display-glow" : ""}
      style={{
        position: 'absolute',
        top: '39.1px',   // Adjusted to keep center (41.6 - (100.8*0.03)/2 = 39.1)
        left: '5.8px',   // Adjusted to keep center (8.6 - (184.8*0.03)/2 = 5.8)
        width: '190.3px', // 184.8px * 1.03 = 190.3px (3% larger)
        height: '103.8px', // 100.8px * 1.03 = 103.8px (3% larger)
        backgroundColor: '#000',
        border: '2px solid #ffffff',
        borderRadius: '2px',
        boxShadow: isDisplayActive ? '0 0 10px 2px rgba(0, 150, 255, 0.6)' : 'none',
        animation: isDisplayActive ? 'oled-glow 2s infinite ease-in-out' : 'none',
        overflow: 'hidden',
        zIndex: 1000
      }}
    >
      <canvas
        ref={canvasRef}
        className="oled-display-canvas"
        width={displayWidth}
        height={displayHeight}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default OLEDDisplayRenderer;