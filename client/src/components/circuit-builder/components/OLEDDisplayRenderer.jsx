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
      // Use path from our properly served images directory
      const oledPath = '/images/oled-display.icon.png';
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
    
    // Clear canvas
    ctx.fillStyle = '#000000'; // Black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set pixel color (blue for SSD1306 OLED display)
    ctx.fillStyle = '#29B6F6'; // SSD1306 typical blue color
    
    // Draw pixels based on buffer
    const pixelSize = Math.min(
      canvas.width / displayWidth,
      canvas.height / displayHeight
    );
    
    // Draw active pixels
    for (let y = 0; y < displayHeight; y++) {
      for (let x = 0; x < displayWidth; x++) {
        if (displayBuffer[y][x]) {
          ctx.fillRect(
            x * pixelSize,
            y * pixelSize,
            pixelSize,
            pixelSize
          );
        }
      }
    }
  }, [displayBuffer]);
  
  // Update from simulator state when it changes
  useEffect(() => {
    if (displayState && displayState.buffer) {
      setDisplayBuffer(displayState.buffer);
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
  
  // Handle display updates based on simulation state
  useEffect(() => {
    if (!isRunning) return;
    
    // Always clear any existing animation when display state changes
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
      animationInterval.current = null;
    }
    
    // Check if the component state indicates we should display content
    const shouldDisplay = displayState && displayState.shouldDisplay;
    
    console.log("OLED Display State:", {
      shouldDisplay,
      hasRequiredLibraries: displayState?.hasRequiredLibraries,
      hasOLEDCode: displayState?.hasOLEDCode,
      isProperlyWired: displayState?.isProperlyWired
    });
    
    // Check if the OLED is properly configured
    if (!shouldDisplay) {
      // Create a completely blank buffer - the OLED should be OFF when not properly configured
      const blankBuffer = new Array(displayHeight).fill(0).map(() => 
        new Array(displayWidth).fill(0)
      );
      
      // Set the blank buffer - no pixels lit
      setDisplayBuffer(blankBuffer);
      
      // Log the appropriate error but don't show anything on screen
      // This is more realistic - an OLED with no power or no proper code would be blank
      if (displayState) {
        if (!displayState.hasRequiredLibraries) {
          console.error("OLED Error E01: Missing required libraries");
        } else if (!displayState.hasOLEDCode) {
          console.error("OLED Error E02: No display code detected");
        } else if (!displayState.isProperlyWired) {
          console.error("OLED Error E03: Display not properly wired");
          
          if (window.simulatorContext && window.simulatorContext.wires) {
            console.log("Current circuit wires:", window.simulatorContext.wires.length);
          }
        }
      }
      
      return;
    }
    
    // If we get here, we should display a demo animation
    // Create a bouncing ball animation to demonstrate OLED functionality
    let x = 44;
    let y = 24;
    let dx = 1;
    let dy = 1;
    let frameCount = 0;
    
    animationInterval.current = setInterval(() => {
      // Create new empty buffer
      const newBuffer = new Array(displayHeight).fill(0).map(() => 
        new Array(displayWidth).fill(0)
      );
      
      // Move the ball
      x += dx;
      y += dy;
      
      // Bounce off edges
      if (x <= 4 || x >= displayWidth - 4) dx = -dx;
      if (y <= 4 || y >= displayHeight - 4) dy = -dy;
      
      // Draw a circle (ball)
      for (let yy = -3; yy <= 3; yy++) {
        for (let xx = -3; xx <= 3; xx++) {
          if (xx*xx + yy*yy <= 9) { // Circle equation - smaller circle
            const drawX = Math.floor(x + xx);
            const drawY = Math.floor(y + yy);
            
            // Make sure we're within bounds
            if (drawX >= 0 && drawX < displayWidth && 
                drawY >= 0 && drawY < displayHeight) {
              newBuffer[drawY][drawX] = 1;
            }
          }
        }
      }
      
      // Draw text in corner
      const text = `OLED`;
      for (let i = 0; i < text.length; i++) {
        const charX = 3 + i * 6;
        const charY = 2;
        drawChar(newBuffer, text.charAt(i), charX, charY);
      }
      
      // Draw a frame count at the bottom
      const countText = `${frameCount++}`;
      for (let i = 0; i < countText.length; i++) {
        const charX = 5 + i * 6;
        const charY = 55;
        drawChar(newBuffer, countText.charAt(i), charX, charY);
      }
      
      // Update the display buffer
      setDisplayBuffer(newBuffer);
    }, 100); // Update every 100ms for smoother animation
    
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
    };
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
        top: '47px',     // 50px - 3px = 47px (moved up by another 3px)
        left: '19px',    // 22px - 3px = 19px (moved left by another 3px)
        width: '169.34px',  // 161.28px * 1.05 = 169.34px (increased by 5%)
        height: '84.67px',  // 80.64px * 1.05 = 84.67px (increased by 5%)
        backgroundColor: '#000',
        borderRadius: '2px',
        boxShadow: isDisplayActive ? '0 0 10px 2px rgba(0, 150, 255, 0.6)' : 'none',
        animation: isDisplayActive ? 'oled-glow 2s infinite ease-in-out' : 'none',
        overflow: 'hidden',
        zIndex: 10
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