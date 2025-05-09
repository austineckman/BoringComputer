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
    
    // Set pixel color (white or blue depending on display type)
    ctx.fillStyle = '#AACCFF'; // Light blue for OLED pixels
    
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
    let x = 64;
    let y = 32;
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
      if (x <= 5 || x >= displayWidth - 5) dx = -dx;
      if (y <= 5 || y >= displayHeight - 5) dy = -dy;
      
      // Draw a circle (ball)
      for (let yy = -4; yy <= 4; yy++) {
        for (let xx = -4; xx <= 4; xx++) {
          if (xx*xx + yy*yy <= 16) { // Circle equation
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
      
      // Draw a border
      for (let i = 0; i < displayWidth; i++) {
        newBuffer[0][i] = 1;
        newBuffer[displayHeight-1][i] = 1;
      }
      for (let i = 0; i < displayHeight; i++) {
        newBuffer[i][0] = 1;
        newBuffer[i][displayWidth-1] = 1;
      }
      
      // Draw text (frame count)
      const text = `Frame: ${frameCount++}`;
      for (let i = 0; i < text.length; i++) {
        const charX = 5 + i * 6;
        const charY = 5;
        drawChar(newBuffer, text.charAt(i), charX, charY);
      }
      
      // Update the display buffer
      setDisplayBuffer(newBuffer);
    }, 50); // Update every 50ms
    
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
        border: '1px solid #444',
        position: 'absolute',
        top: '22px',
        left: '22px',
        width: '128px',
        height: '64px',
        backgroundColor: '#000'
      }}
    />
  );
};

export default OLEDDisplayRenderer;