/**
 * OLED Display Command Parser
 * 
 * This module parses and executes OLED display commands from Arduino code.
 * It supports common libraries like U8g2lib and Adafruit_SSD1306.
 */

// Helper function to match a pattern in code and extract parameters
const extractParams = (code, methodName) => {
  const regex = new RegExp(`\\.${methodName}\\(([^;]*?)\\)`, 'g');
  const matches = [...code.matchAll(regex)];
  return matches.map(match => {
    // Clean up the parameter string
    const params = match[1].trim().split(',').map(p => p.trim());
    return {
      method: methodName,
      params: params
    };
  });
};

// Helper function to find the display object name from initialization
const findDisplayObjectName = (code) => {
  // Look for common OLED initialization patterns
  const patterns = [
    /(\w+)\s*=\s*new\s+Adafruit_SSD1306/,
    /(\w+)\s*=\s*new\s+U8G2_SSD1306/,
    /(\w+)\s+(\w+)\s*\(\s*U8G2_R0/,
    /U8G2_SSD1306[^(]*\([^)]*\)\s+(\w+)/,
    /Adafruit_SSD1306[^(]*\([^)]*\)\s+(\w+)/,
    /SSD1306[^(]*\([^)]*\)\s+(\w+)/
  ];
  
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match) {
      return match[1]; // Return the captured variable name
    }
  }
  
  // If no specific pattern matches, look for any reasonable display object
  const fallbackPattern = /(\w+)\.(begin|display|clear|drawPixel|drawLine|print|setCursor|drawCircle|fillCircle)/;
  const fallbackMatch = code.match(fallbackPattern);
  return fallbackMatch ? fallbackMatch[1] : 'display'; // Default to 'display' if nothing found
};

// Parse all OLED commands from code
export const parseOLEDCommands = (code) => {
  if (!code) return { commands: [], objectName: 'display' };
  
  // Find the display object name
  const objectName = findDisplayObjectName(code);
  
  // Create regular expressions for each OLED object
  const objectRegex = new RegExp(`${objectName}\\.`, 'g');
  
  // Extract commands based on the object name
  const commands = [];
  
  // Common OLED commands to extract
  const methodsToExtract = [
    // U8g2 methods
    'begin', 'firstPage', 'nextPage', 'drawStr', 'drawLine', 'drawBox', 
    'drawFrame', 'drawCircle', 'drawPixel', 'drawXBM', 'drawBitmap', 'setFont',
    // Adafruit methods
    'display', 'clearDisplay', 'drawPixel', 'drawLine', 'drawRect', 'fillRect',
    'drawCircle', 'fillCircle', 'drawTriangle', 'fillTriangle', 'drawRoundRect',
    'fillRoundRect', 'print', 'println', 'setCursor', 'setTextSize', 'setTextColor',
    'setTextWrap'
  ];
  
  // Extract all matching methods
  methodsToExtract.forEach(method => {
    const methodCommands = extractParams(code, method);
    commands.push(...methodCommands);
  });
  
  // Look for initialization pattern (u8g2.begin())
  const hasBeginMethod = code.includes(`${objectName}.begin`);
  
  // For U8g2 library, detect page loop pattern
  const hasPageLoop = code.includes(`${objectName}.firstPage`) && 
                      code.includes(`${objectName}.nextPage`);
  
  // Adafruit lib needs display() method
  const hasDisplayMethod = code.includes(`${objectName}.display(`);
  
  return {
    commands,
    objectName,
    hasBeginMethod,
    hasPageLoop,
    hasDisplayMethod
  };
};

// Execute parsed OLED commands on a virtual buffer
export const executeOLEDCommands = (commandData, width = 128, height = 64) => {
  // Create an empty display buffer
  const buffer = new Array(height).fill(0).map(() => new Array(width).fill(0));
  
  // If no valid command data, return empty buffer
  if (!commandData || !commandData.commands || commandData.commands.length === 0) {
    return buffer;
  }
  
  // Track current cursor position and text settings
  let cursorX = 0;
  let cursorY = 0;
  let textSize = 1;
  let fontScale = 1;
  
  // Process each command in order
  commandData.commands.forEach(cmd => {
    const { method, params } = cmd;
    
    // Basic methods with pixel coordinates
    switch (method) {
      case 'drawPixel':
        if (params.length >= 2) {
          const x = parseInt(params[0], 10);
          const y = parseInt(params[1], 10);
          if (x >= 0 && x < width && y >= 0 && y < height) {
            buffer[y][x] = 1;
          }
        }
        break;
        
      case 'drawLine':
        if (params.length >= 4) {
          const x0 = parseInt(params[0], 10);
          const y0 = parseInt(params[1], 10);
          const x1 = parseInt(params[2], 10);
          const y1 = parseInt(params[3], 10);
          drawLine(buffer, x0, y0, x1, y1);
        }
        break;
        
      case 'drawRect':
      case 'drawFrame':
      case 'drawBox':
        if (params.length >= 4) {
          const x = parseInt(params[0], 10);
          const y = parseInt(params[1], 10);
          const w = parseInt(params[2], 10);
          const h = parseInt(params[3], 10);
          drawRect(buffer, x, y, w, h, false);
        }
        break;
        
      case 'fillRect':
        if (params.length >= 4) {
          const x = parseInt(params[0], 10);
          const y = parseInt(params[1], 10);
          const w = parseInt(params[2], 10);
          const h = parseInt(params[3], 10);
          drawRect(buffer, x, y, w, h, true);
        }
        break;
        
      case 'drawCircle':
        if (params.length >= 3) {
          const x = parseInt(params[0], 10);
          const y = parseInt(params[1], 10);
          const r = parseInt(params[2], 10);
          drawCircle(buffer, x, y, r, false);
        }
        break;
        
      case 'fillCircle':
        if (params.length >= 3) {
          const x = parseInt(params[0], 10);
          const y = parseInt(params[1], 10);
          const r = parseInt(params[2], 10);
          drawCircle(buffer, x, y, r, true);
        }
        break;
        
      case 'drawStr':
        if (params.length >= 3) {
          const x = parseInt(params[0], 10);
          const y = parseInt(params[1], 10);
          // The text might be quoted, remove quotes if present
          let text = params[2];
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
          }
          drawText(buffer, text, x, y, fontScale);
        }
        break;
        
      case 'print':
      case 'println':
        if (params.length >= 1) {
          // Parse text parameter
          let text = params[0];
          if (text.startsWith('"') && text.endsWith('"')) {
            text = text.substring(1, text.length - 1);
          }
          
          // Draw at current cursor position
          drawText(buffer, text, cursorX, cursorY, textSize);
          
          // Move cursor for next print
          if (method === 'println') {
            cursorX = 0;
            cursorY += 8 * textSize; // Move to next line
          } else {
            cursorX += text.length * 6 * textSize; // Move to end of text
          }
        }
        break;
        
      case 'setCursor':
        if (params.length >= 2) {
          cursorX = parseInt(params[0], 10);
          cursorY = parseInt(params[1], 10);
        }
        break;
        
      case 'setTextSize':
        if (params.length >= 1) {
          textSize = parseInt(params[0], 10);
          if (textSize < 1) textSize = 1;
        }
        break;
        
      case 'setFont':
        // This would set different fonts, but we'll just adjust scale for simplicity
        fontScale = 1;
        break;
        
      default:
        // Other methods not implemented yet
        break;
    }
  });
  
  return buffer;
};

// Helper function to draw a line (Bresenham's algorithm)
const drawLine = (buffer, x0, y0, x1, y1) => {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  
  while (true) {
    if (x0 >= 0 && x0 < buffer[0].length && y0 >= 0 && y0 < buffer.length) {
      buffer[y0][x0] = 1;
    }
    
    if (x0 === x1 && y0 === y1) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

// Helper function to draw a rectangle
const drawRect = (buffer, x, y, w, h, fill) => {
  // Clamp dimensions to buffer size
  const startX = Math.max(0, x);
  const startY = Math.max(0, y);
  const endX = Math.min(buffer[0].length - 1, x + w - 1);
  const endY = Math.min(buffer.length - 1, y + h - 1);
  
  if (fill) {
    // Filled rectangle
    for (let iy = startY; iy <= endY; iy++) {
      for (let ix = startX; ix <= endX; ix++) {
        buffer[iy][ix] = 1;
      }
    }
  } else {
    // Outline only
    // Draw horizontal lines
    for (let ix = startX; ix <= endX; ix++) {
      if (startY >= 0 && startY < buffer.length) buffer[startY][ix] = 1;
      if (endY >= 0 && endY < buffer.length) buffer[endY][ix] = 1;
    }
    // Draw vertical lines
    for (let iy = startY; iy <= endY; iy++) {
      if (startX >= 0 && startX < buffer[0].length) buffer[iy][startX] = 1;
      if (endX >= 0 && endX < buffer[0].length) buffer[iy][endX] = 1;
    }
  }
};

// Helper function to draw a circle
const drawCircle = (buffer, x0, y0, radius, fill) => {
  // Mid-point circle algorithm
  let x = radius;
  let y = 0;
  let err = 0;
  
  while (x >= y) {
    if (fill) {
      // For filled circles, draw horizontal lines between the points
      for (let ix = -x; ix <= x; ix++) {
        setPixelSafe(buffer, x0 + ix, y0 + y);
        setPixelSafe(buffer, x0 + ix, y0 - y);
      }
      for (let ix = -y; ix <= y; ix++) {
        setPixelSafe(buffer, x0 + ix, y0 + x);
        setPixelSafe(buffer, x0 + ix, y0 - x);
      }
    } else {
      // For outline circles, just draw the 8 points
      setPixelSafe(buffer, x0 + x, y0 + y);
      setPixelSafe(buffer, x0 + y, y0 + x);
      setPixelSafe(buffer, x0 - y, y0 + x);
      setPixelSafe(buffer, x0 - x, y0 + y);
      setPixelSafe(buffer, x0 - x, y0 - y);
      setPixelSafe(buffer, x0 - y, y0 - x);
      setPixelSafe(buffer, x0 + y, y0 - x);
      setPixelSafe(buffer, x0 + x, y0 - y);
    }
    
    y++;
    if (err <= 0) {
      err += 2 * y + 1;
    }
    if (err > 0) {
      x--;
      err -= 2 * x + 1;
    }
  }
};

// Helper to set a pixel safely (checking bounds)
const setPixelSafe = (buffer, x, y) => {
  if (x >= 0 && x < buffer[0].length && y >= 0 && y < buffer.length) {
    buffer[y][x] = 1;
  }
};

// Simple font data for 5x7 characters
const fontData = {
  ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '!': [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0]],
  '"': [[0,1,0,1,0],[0,1,0,1,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '#': [[0,1,0,1,0],[0,1,0,1,0],[1,1,1,1,1],[0,1,0,1,0],[1,1,1,1,1],[0,1,0,1,0],[0,0,0,0,0]],
  '$': [[0,0,1,0,0],[0,1,1,1,1],[1,0,1,0,0],[0,1,1,1,0],[0,0,1,0,1],[1,1,1,1,0],[0,0,1,0,0]],
  '%': [[1,1,0,0,1],[1,1,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,1,1],[1,0,0,1,1]],
  '&': [[0,1,1,0,0],[1,0,0,1,0],[1,0,1,0,0],[0,1,0,0,0],[1,0,1,0,1],[1,0,0,1,0],[0,1,1,0,1]],
  '\'': [[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '(': [[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0]],
  ')': [[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
  '*': [[0,0,0,0,0],[0,1,0,1,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,1,0,1,0],[0,0,0,0,0]],
  '+': [[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0]],
  ',': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,0,0,0]],
  '-': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '.': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0]],
  '/': [[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '0': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,1,1],[1,0,1,0,1],[1,1,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  '2': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  '3': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '4': [[0,0,0,1,0],[0,0,1,1,0],[0,1,0,1,0],[1,0,0,1,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0]],
  '5': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '6': [[0,0,1,1,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '7': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
  '8': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  '9': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,1,1,0,0]],
  ':': [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  ';': [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,0,0,0]],
  '<': [[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0]],
  '=': [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0]],
  '>': [[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0]],
  '?': [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  '@': [[0,1,1,1,0],[1,0,0,0,1],[1,0,1,1,1],[1,0,1,0,1],[1,0,1,1,1],[1,0,0,0,0],[0,1,1,1,0]],
  'A': [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  'B': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'C': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'D': [[1,1,1,0,0],[1,0,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,0],[1,1,1,0,0]],
  'E': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'F': [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  'G': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[0,1,1,1,0]],
  'H': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'J': [[0,0,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  'K': [[1,0,0,0,1],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'L': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'P': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[0,1,1,1,1]],
  'R': [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  'S': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'V': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  'W': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  'X': [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1]],
  'Y': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  'Z': [[1,1,1,1,1],[0,0,0,0,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  '[': [[0,1,1,1,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,1,1,0]],
  '\\': [[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0]],
  ']': [[0,1,1,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,1,0],[0,1,1,1,0]],
  '^': [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  '_': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1]],
  '`': [[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
  'a': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,1,1,1,1],[1,0,0,0,1],[0,1,1,1,1]],
  'b': [[1,0,0,0,0],[1,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  'c': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  'd': [[0,0,0,0,1],[0,0,0,0,1],[0,1,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1]],
  'e': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,0],[0,1,1,1,1]],
  'f': [[0,0,1,1,0],[0,1,0,0,1],[0,1,0,0,0],[1,1,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,0]],
  'g': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,1,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
  'h': [[1,0,0,0,0],[1,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'i': [[0,0,1,0,0],[0,0,0,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'j': [[0,0,0,1,0],[0,0,0,0,0],[0,0,1,1,0],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
  'k': [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0]],
  'l': [[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
  'm': [[0,0,0,0,0],[0,0,0,0,0],[1,1,0,1,0],[1,0,1,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'n': [[0,0,0,0,0],[0,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  'o': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  'p': [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0]],
  'q': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,0,1],[1,0,0,1,1],[0,1,1,1,1],[0,0,0,0,1],[0,0,0,0,1]],
  'r': [[0,0,0,0,0],[0,0,0,0,0],[1,0,1,1,0],[1,1,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  's': [[0,0,0,0,0],[0,0,0,0,0],[0,1,1,1,1],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[1,1,1,1,0]],
  't': [[0,1,0,0,0],[0,1,0,0,0],[1,1,1,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,1,0,0,1],[0,0,1,1,0]],
  'u': [[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,1,1],[0,1,1,0,1]],
  'v': [[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
  'w': [[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[0,1,0,1,0]],
  'x': [[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
  'y': [[0,0,0,0,0],[0,0,0,0,0],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,1],[0,0,0,0,1],[0,1,1,1,0]],
  'z': [[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[0,0,0,1,0],[0,0,1,0,0],[0,1,0,0,0],[1,1,1,1,1]],
  '{': [[0,0,1,1,0],[0,1,0,0,0],[0,1,0,0,0],[1,0,0,0,0],[0,1,0,0,0],[0,1,0,0,0],[0,0,1,1,0]],
  '|': [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  '}': [[0,1,1,0,0],[0,0,0,1,0],[0,0,0,1,0],[0,0,0,0,1],[0,0,0,1,0],[0,0,0,1,0],[0,1,1,0,0]],
  '~': [[0,0,0,0,0],[0,0,0,0,0],[0,1,0,0,1],[1,0,1,0,1],[1,0,0,1,0],[0,0,0,0,0],[0,0,0,0,0]]
};

// Helper function to draw text using our simple font
const drawText = (buffer, text, x, y, scale = 1) => {
  // Scale should be at least 1
  scale = Math.max(1, scale);
  
  let cursorX = x;
  // Draw each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charData = fontData[char] || fontData[' ']; // Default to space if char not found
    
    // Draw the character pixel by pixel with scaling
    for (let cy = 0; cy < charData.length; cy++) {
      for (let cx = 0; cx < charData[cy].length; cx++) {
        if (charData[cy][cx]) {
          // Apply scaling by drawing multiple pixels
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = cursorX + (cx * scale) + sx;
              const py = y + (cy * scale) + sy;
              setPixelSafe(buffer, px, py);
            }
          }
        }
      }
    }
    
    // Move cursor to the next character position
    cursorX += (6 * scale); // Each character is 5 pixels wide + 1 pixel space
  }
};