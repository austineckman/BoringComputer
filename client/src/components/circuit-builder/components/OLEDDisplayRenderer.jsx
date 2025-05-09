import React, { useEffect, useRef, useState } from 'react';
import { useSimulator } from '../simulator/SimulatorContext';

/**
 * Component for rendering OLED display content based on simulator state
 * This is specifically for simulating an SSD1306 128x64 OLED display
 */
const OLEDDisplayRenderer = ({ componentId }) => {
  const canvasRef = useRef(null);
  const { componentStates, isRunning } = useSimulator();
  const [displayBuffer, setDisplayBuffer] = useState(null);
  
  // Canvas dimensions to match SSD1306 OLED dimensions (128x64 pixels)
  const displayWidth = 128;
  const displayHeight = 64;
  
  // Get the current state of this specific OLED display
  const displayState = componentStates[componentId];
  
  // Create an empty display buffer initially
  useEffect(() => {
    // Create empty buffer (all pixels off)
    const emptyBuffer = new Array(displayHeight).fill(0).map(() => 
      new Array(displayWidth).fill(0)
    );
    setDisplayBuffer(emptyBuffer);
  }, []);
  
  // Update canvas when display buffer changes
  useEffect(() => {
    if (!canvasRef.current || !displayBuffer) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#000000'; // Black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set pixel color (blue for SSD1306 OLED display)
    ctx.fillStyle = '#64B5F6'; // SSD1306 typical blue color
    
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
  
  // Mock data for demonstration - this will create a bouncing ball animation
  useEffect(() => {
    if (!isRunning) return;
    
    // Create a bouncing ball animation to demonstrate OLED functionality
    let x = 44;
    let y = 24;
    let dx = 1;
    let dy = 1;
    let frameCount = 0;
    
    const animationInterval = setInterval(() => {
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
      clearInterval(animationInterval);
    };
  }, [isRunning]);
  
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
  
  return (
    <canvas
      ref={canvasRef}
      className="oled-display-canvas"
      width={displayWidth}
      height={displayHeight}
      style={{
        border: 'none',
        position: 'absolute',
        top: '35px',
        left: '31px',
        width: '88px',  // Exact size of the display area
        height: '48px', // Exact size of the display area
        backgroundColor: '#000',
        zIndex: 10,
        borderRadius: '1px'
      }}
    />
  );
};

export default OLEDDisplayRenderer;