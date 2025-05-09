/**
 * OLED Display Command Parser
 * 
 * This module parses and executes OLED display commands from Arduino code.
 * It supports common libraries like U8g2lib and Adafruit_SSD1306.
 */

// Helper function to match a pattern in code and extract parameters
const extractParams = (code, methodName) => {
  // More lenient regex that can handle various formatting styles and multiline calls
  const regex = new RegExp(`\\.${methodName}\\s*\\(([^;]*?)\\)`, 'g');
  const matches = [...code.matchAll(regex)];
  
  if (matches.length === 0) {
    // Try alternative format (without dot) for direct function calls
    const altRegex = new RegExp(`\\b${methodName}\\s*\\(([^;]*?)\\)`, 'g');
    const altMatches = [...code.matchAll(altRegex)];
    
    if (altMatches.length > 0) {
      console.log(`Found ${altMatches.length} alternative matches for ${methodName}`);
    }
    
    return altMatches.map(match => {
      // Clean up the parameter string
      const params = match[1].trim().split(',').map(p => p.trim());
      return {
        method: methodName,
        params: params
      };
    });
  }
  
  console.log(`Found ${matches.length} matches for ${methodName}`);
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
  console.log("Finding display object in code:", code ? code.substring(0, 100) + "..." : "no code");
  
  if (!code) {
    return 'display'; // Default if no code provided
  }
  
  // Look for common OLED initialization patterns
  const patterns = [
    // Adafruit style - declaration with assignment
    /(\w+)\s*=\s*new\s+Adafruit_SSD1306/,
    // Adafruit style - declaration with variable
    /Adafruit_SSD1306\s+(\w+)\(/,
    // U8G2 styles (multiple variants) with assignment
    /(\w+)\s*=\s*new\s+U8G2_SSD1306/,
    /(\w+)\s*=\s*new\s+U8G2_SH1106/,
    // U8G2 constructor followed by variable
    /U8G2_SSD1306[^(]*\([^)]*\)\s+(\w+)/,
    /U8G2_SH1106[^(]*\([^)]*\)\s+(\w+)/,
    // Constructor with variable declaration
    /(\w+)\s+(\w+)\s*\(\s*U8G2_R0/,
    // Other SSD1306 variants
    /Adafruit_SSD1306[^(]*\([^)]*\)\s+(\w+)/,
    /SSD1306[^(]*\([^)]*\)\s+(\w+)/,
    // Direct declaration format
    /U8G2_SSD1306[^;]*;\s*\/\/\s*(\w+)/,
    // Direct declaration without comment
    /U8G2_SSD1306[^;]*\s+(\w+);/,
    // Common variables people use
    /(display|oled|lcd|screen|ssd1306)\s*\./i
  ];
  
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match) {
      // Get the captured group (1 or 2, whichever has the name)
      const name = match[1] || match[2];
      console.log(`Found display object name: ${name} using pattern:`, pattern);
      return name; // Return the captured variable name
    }
  }
  
  // Check for some common display object names directly used with methods
  const commonNames = ["u8g2", "display", "oled", "lcd", "screen"];
  for (const name of commonNames) {
    if (code.includes(`${name}.begin`) || 
        code.includes(`${name}.drawStr`) || 
        code.includes(`${name}.drawBox`) ||
        code.includes(`${name}.clearDisplay`) ||
        code.includes(`${name}.display`)) {
      console.log(`Found display object by common name: ${name}`);
      return name;
    }
  }
  
  // If no specific pattern matches, look for any reasonable display object by method call
  const methods = [
    // Adafruit methods
    "begin", "display", "clearDisplay", "setTextSize", "setCursor", "print", "println",
    // U8g2 methods 
    "drawStr", "drawUTF8", "firstPage", "nextPage", "clearBuffer", "sendBuffer",
    // Common to both
    "drawPixel", "drawLine", "drawCircle", "fillCircle", "drawRect", "drawBox"
  ];
  
  for (const method of methods) {
    const methodPattern = new RegExp(`(\\w+)\\.${method}\\s*\\(`);
    const methodMatch = code.match(methodPattern);
    if (methodMatch) {
      console.log(`Found display object name: ${methodMatch[1]} via method call: ${method}`);
      return methodMatch[1];
    }
  }
  
  // Analyze which library style was detected to provide a sensible default
  if (code.includes("Adafruit") || code.includes("clearDisplay") || code.includes("setTextSize")) {
    console.log("No display object name found, but Adafruit style detected. Using default: 'display'");
    return 'display';
  } else if (code.includes("U8G2") || code.includes("u8g2") || code.includes("firstPage")) {
    console.log("No display object name found, but U8G2 style detected. Using default: 'u8g2'");
    return 'u8g2';
  }
  
  // Absolute fallback
  console.log("No display object name found, using generic default: 'display'");
  return 'display';
};

// Parse all OLED commands from code
export const parseOLEDCommands = (code) => {
  if (!code) {
    console.log("No code provided to parseOLEDCommands");
    return { commands: [], objectName: 'display' };
  }
  
  console.log("Parsing OLED commands from code:", code.length > 100 ? code.substring(0, 100) + "..." : code);
  
  // Find the display object name
  const objectName = findDisplayObjectName(code);
  console.log("Found OLED object name:", objectName);
  
  // Extract commands based on the object name
  const commands = [];
  
  // Detect the library type (Adafruit vs U8g2) using more comprehensive detection
  // Adafruit patterns
  const adafruitPatterns = [
    // Common class initialization patterns
    'Adafruit_SSD1306',
    'Adafruit_GFX',
    'SSD1306_SWITCHCAPVCC',
    // Common method patterns 
    'clearDisplay()',
    'clearDisplay();',
    'setTextSize(',
    'setTextColor(',
    'setCursor(',
    'display()',
    `${objectName}.display()`
  ];
  
  // U8g2 patterns
  const u8g2Patterns = [
    // Common class initialization patterns
    'U8G2_SSD1306',
    'U8G2_SH1106',
    'U8g2',
    'u8g2',
    // Common method patterns
    'firstPage()',
    'nextPage()',
    'clearBuffer()',
    'sendBuffer()',
    'drawStr(',
    'drawUTF8(',
    'drawBox(',
    'drawFrame(',
    `${objectName}.firstPage()`,
    `${objectName}.nextPage()`
  ];
  
  // Check each pattern against code
  const adafruitMatches = adafruitPatterns.filter(pattern => code.includes(pattern));
  const u8g2Matches = u8g2Patterns.filter(pattern => code.includes(pattern));
  
  // Determine library style based on matches
  const isAdafruitStyle = adafruitMatches.length > 0;
  const isU8g2Style = u8g2Matches.length > 0;
  
  // If both patterns match, log info for debugging
  if (isAdafruitStyle && isU8g2Style) {
    console.log("Both Adafruit and U8g2 styles detected:", { 
      adafruitMatches, 
      u8g2Matches 
    });
    // In case of conflict, prefer the one with more matches
    if (adafruitMatches.length > u8g2Matches.length) {
      console.log("Preferring Adafruit style due to more pattern matches");
    } else {
      console.log("Preferring U8g2 style due to more pattern matches");
    }
  }
  
  console.log("Detected library styles:", { isAdafruitStyle, isU8g2Style });
  
  // Common OLED commands to extract based on the detected library style
  let methodsToExtract = [];
  
  if (isAdafruitStyle) {
    methodsToExtract = [
      'begin', 'display', 'clearDisplay', 'drawPixel', 'drawLine', 'drawRect', 'fillRect',
      'drawCircle', 'fillCircle', 'drawTriangle', 'fillTriangle', 'drawRoundRect',
      'fillRoundRect', 'print', 'println', 'setCursor', 'setTextSize', 'setTextColor',
      'setTextWrap', 'write'
    ];
  } 
  else if (isU8g2Style) {
    methodsToExtract = [
      'begin', 'firstPage', 'nextPage', 'drawStr', 'drawLine', 'drawBox', 
      'drawFrame', 'drawCircle', 'drawPixel', 'drawXBM', 'drawBitmap', 'setFont',
      'drawUTF8', 'setFontMode', 'setDrawColor', 'sendBuffer', 'clearBuffer'
    ];
  }
  else {
    // Try both styles since we couldn't determine
    methodsToExtract = [
      // Adafruit methods
      'begin', 'display', 'clearDisplay', 'drawPixel', 'drawLine', 'drawRect', 'fillRect',
      'drawCircle', 'fillCircle', 'print', 'println', 'setCursor', 'setTextSize', 'setTextColor',
      // U8g2 methods
      'firstPage', 'nextPage', 'drawStr', 'drawBox', 'drawFrame', 'drawXBM', 
      'setFont', 'clearBuffer', 'sendBuffer',
      // Common methods
      'clear', 'draw', 'fill'
    ];
  }
  
  // Extract all matching methods, with detailed logs of what's found
  methodsToExtract.forEach(method => {
    const methodCommands = extractParams(code, method);
    if (methodCommands.length > 0) {
      console.log(`Found ${methodCommands.length} commands for method '${method}'`);
    }
    commands.push(...methodCommands);
  });
  
  // Look for initialization pattern (object.begin())
  const hasBeginMethod = code.includes(`${objectName}.begin`) ||
                         code.includes('begin(') ||
                         code.includes('begin (');
  
  // For U8g2 library, detect page loop pattern
  const hasPageLoop = (code.includes(`${objectName}.firstPage`) && 
                      code.includes(`${objectName}.nextPage`)) ||
                      (code.includes('firstPage') && code.includes('nextPage'));
  
  // For Adafruit lib, check for display() which is needed to update screen
  const hasDisplayMethod = code.includes(`${objectName}.display`) ||
                           code.includes('display(') ||
                           code.includes('display (');
  
  // For U8g2, check for clearBuffer/sendBuffer pattern
  const hasBufferMethod = (code.includes(`${objectName}.clearBuffer`) && 
                          code.includes(`${objectName}.sendBuffer`)) ||
                          (code.includes('clearBuffer') && code.includes('sendBuffer'));
  
  // For either library, check for drawing calls
  const hasDrawCall = code.includes('draw') || 
                      code.includes('fill') || 
                      code.includes('print') ||
                      code.includes('set');
  
  // Try to detect OLED initialization patterns
  const hasSSD1306Init = code.includes('SSD1306') || code.includes('ssd1306');
  const hasI2CInit = code.includes('0x3C') || code.includes('0x3D') || code.includes('&Wire');
  
  // Log detailed diagnostics
  console.log("OLED command diagnostics:", {
    objectName,
    commandsFound: commands.length,
    hasBeginMethod,
    hasPageLoop,
    hasDisplayMethod,
    hasBufferMethod,
    hasDrawCall,
    hasSSD1306Init,
    hasI2CInit
  });
  
  // Return comprehensive information about the commands found
  return {
    commands,
    objectName,
    isAdafruitStyle,
    isU8g2Style,
    hasBeginMethod,
    hasPageLoop,
    hasDisplayMethod,
    hasBufferMethod,
    hasDrawCall
  };
};

/**
 * Execute parsed OLED commands on a virtual buffer
 * This simulates how an Adafruit SSD1306 or U8g2 display actually works
 * with a framebuffer and drawing operations
 */
export const executeOLEDCommands = (commandData, width = 128, height = 64) => {
  console.log("Executing OLED commands:", commandData);
  
  // Create an empty display buffer (1 bit per pixel, 0=off, 1=on)
  const buffer = new Array(height).fill(0).map(() => new Array(width).fill(0));
  
  // If no valid command data, return empty buffer
  if (!commandData || !commandData.commands || commandData.commands.length === 0) {
    console.log("No valid OLED commands found, returning empty buffer");
    return buffer;
  }
  
  // Track display state (these values persist between commands)
  const displayState = {
    // Text cursor position
    cursorX: 0,
    cursorY: 0,
    // Text properties
    textSize: 1,
    textColor: 1, // 1=on, 0=off
    textWrap: true,
    // U8g2-specific
    fontScale: 1,
    // Whether display is inverted (black on white vs white on black)
    inverted: false,
    // Current drawing color (for U8g2)
    drawColor: 1,
    // Font metrics
    fontWidth: 6,
    fontHeight: 8,
    // For Adafruit GFX
    rotation: 0
  };
  
  try {
    // Process each command based on the library style
    if (commandData.isAdafruitStyle) {
      processAdafruitCommands(commandData.commands, buffer, displayState, width, height);
    } 
    else if (commandData.isU8g2Style) {
      processU8g2Commands(commandData.commands, buffer, displayState, width, height);
    }
    else {
      // Try both approaches
      console.log("Library style not determined, trying both Adafruit and U8g2 command styles");
      processAdafruitCommands(commandData.commands, buffer, displayState, width, height);
      processU8g2Commands(commandData.commands, buffer, displayState, width, height);
    }
  } catch (error) {
    console.error("Error executing OLED commands:", error);
    
    // Add error message to the buffer
    const errorMsg = `ERR: ${error.message.substring(0, 16)}`;
    drawText(buffer, errorMsg, 5, 20, 1);
  }
  
  return buffer;
};

/**
 * Process commands for Adafruit SSD1306 style
 * 
 * Adafruit_SSD1306 library typically follows this pattern:
 * - display.begin() for initialization
 * - display.clearDisplay() to clear the buffer
 * - display.setTextSize(), display.setTextColor(), display.setCursor() for text settings
 * - display.print() or display.println() for text
 * - drawing functions like display.drawPixel(), display.drawLine(), etc.
 * - display.display() to actually update the physical display
 */
function processAdafruitCommands(commands, buffer, state, width, height) {
  console.log("Processing Adafruit-style commands:", commands.length);
  
  // Track whether a clearDisplay has occurred to properly simulate Adafruit behavior
  let hasCleared = false;
  
  // Process commands in order
  for (const cmd of commands) {
    const { method, params } = cmd;
    
    try {
      // Basic methods with pixel coordinates
      switch (method) {
        case 'clearDisplay':
          // Clear the entire buffer
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              buffer[y][x] = 0;
            }
          }
          // Reset cursor position
          state.cursorX = 0;
          state.cursorY = 0;
          break;
          
        case 'display':
          // In real hardware this would send the buffer to display
          // For our simulator this is a no-op as we're constantly rendering the buffer
          console.log("display() called - buffer would be sent to hardware");
          break;
          
        case 'drawPixel':
          if (params.length >= 3) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const color = parseInt(params[2], 10);
            if (x >= 0 && x < width && y >= 0 && y < height) {
              buffer[y][x] = color ? 1 : 0;
            }
          } else if (params.length >= 2) {
            // Default to white if color not specified
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
            // Optional color parameter
            const color = params.length >= 5 ? parseInt(params[4], 10) : 1;
            drawLine(buffer, x0, y0, x1, y1, color);
          }
          break;
          
        case 'drawRect':
          if (params.length >= 4) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const w = parseInt(params[2], 10);
            const h = parseInt(params[3], 10);
            // Optional color parameter
            const color = params.length >= 5 ? parseInt(params[4], 10) : 1;
            drawRect(buffer, x, y, w, h, false, color);
          }
          break;
          
        case 'fillRect':
          if (params.length >= 4) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const w = parseInt(params[2], 10);
            const h = parseInt(params[3], 10);
            // Optional color parameter
            const color = params.length >= 5 ? parseInt(params[4], 10) : 1;
            drawRect(buffer, x, y, w, h, true, color);
          }
          break;
          
        case 'drawCircle':
          if (params.length >= 3) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const r = parseInt(params[2], 10);
            // Optional color parameter
            const color = params.length >= 4 ? parseInt(params[3], 10) : 1;
            drawCircle(buffer, x, y, r, false, color);
          }
          break;
          
        case 'fillCircle':
          if (params.length >= 3) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const r = parseInt(params[2], 10);
            // Optional color parameter
            const color = params.length >= 4 ? parseInt(params[3], 10) : 1;
            drawCircle(buffer, x, y, r, true, color);
          }
          break;
          
        case 'print':
        case 'println':
          if (params.length >= 1) {
            // Parse text parameter (might be in quotes)
            let text = params[0];
            if (text.startsWith('"') && text.endsWith('"')) {
              text = text.substring(1, text.length - 1);
            }
            
            // Try to parse number if it's not a string
            if (!text.startsWith('"') && !isNaN(text)) {
              text = text.toString();
            }
            
            // For println, automatically add a newline character
            if (method === 'println') {
              text += '\n';
            }
            
            // Draw at current cursor position using our enhanced drawText function
            const newPosition = drawText(buffer, text, state.cursorX, state.cursorY, state.textSize, state.textColor);
            
            // Update cursor position based on text drawn
            if (method === 'println') {
              // For println, move cursor to start of next line
              state.cursorX = 0;
              state.cursorY = newPosition.y; // Use the y position returned by drawText
            } else {
              // For regular print, handle multi-line text
              const lines = text.split('\n');
              
              if (lines.length > 1) {
                // If there are newlines in the text, position at the last line
                const lastLine = lines[lines.length - 1];
                state.cursorX = lastLine.length * state.fontWidth * state.textSize;
                state.cursorY = newPosition.y;
              } else {
                // Single line case - just move cursor forward
                state.cursorX += text.length * state.fontWidth * state.textSize;
                
                // Handle text wrapping if needed
                if (state.textWrap && state.cursorX > width - state.fontWidth * state.textSize) {
                  state.cursorX = 0;
                  state.cursorY += state.fontHeight * state.textSize;
                }
              }
            }
          }
          break;
          
        case 'setCursor':
          if (params.length >= 2) {
            state.cursorX = parseInt(params[0], 10);
            state.cursorY = parseInt(params[1], 10);
          }
          break;
          
        case 'setTextSize':
          if (params.length >= 1) {
            state.textSize = parseInt(params[0], 10);
            if (state.textSize < 1) state.textSize = 1;
          }
          break;
          
        case 'setTextColor':
          if (params.length >= 1) {
            state.textColor = parseInt(params[0], 10) ? 1 : 0;
          }
          break;
          
        case 'setTextWrap':
          if (params.length >= 1) {
            state.textWrap = params[0] === 'true' || parseInt(params[0], 10) === 1;
          }
          break;
          
        case 'setRotation':
          if (params.length >= 1) {
            state.rotation = parseInt(params[0], 10) % 4;
          }
          break;
          
        case 'drawRoundRect':
        case 'fillRoundRect':
          if (params.length >= 5) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const w = parseInt(params[2], 10);
            const h = parseInt(params[3], 10);
            const r = parseInt(params[4], 10);
            const color = params.length >= 6 ? parseInt(params[5], 10) : 1;
            drawRoundRect(buffer, x, y, w, h, r, method === 'fillRoundRect', color);
          }
          break;
          
        case 'invertDisplay':
          if (params.length >= 1) {
            state.inverted = params[0] === 'true' || parseInt(params[0], 10) === 1;
            // Actually invert every pixel
            if (state.inverted) {
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  buffer[y][x] = buffer[y][x] ? 0 : 1;
                }
              }
            }
          }
          break;
      }
    }
    catch (error) {
      console.error(`Error executing Adafruit command '${method}':`, error);
    }
  }
}

/**
 * Process commands for U8g2 style
 * 
 * U8g2 library typically follows these patterns:
 * Pattern 1 (Page-based):
 * - u8g2.begin() for initialization
 * - u8g2.firstPage() to start the drawing loop
 * - u8g2.nextPage() to continue the drawing loop
 * - Drawing happens between firstPage and nextPage in a do-while loop
 * 
 * Pattern 2 (Buffer-based):
 * - u8g2.begin() for initialization
 * - u8g2.clearBuffer() to clear the internal buffer
 * - Drawing functions between clearBuffer and sendBuffer
 * - u8g2.sendBuffer() to update the display
 */
function processU8g2Commands(commands, buffer, state, width, height) {
  console.log("Processing U8g2-style commands:", commands.length);
  
  // Track if we're in a page loop mode or buffer mode
  let isPageMode = false;
  let isBufferMode = false;
  
  // Process commands in order
  for (const cmd of commands) {
    const { method, params } = cmd;
    
    try {
      switch (method) {
        case 'begin':
          // Initialize the display
          console.log("U8g2 begin() called - initializing display");
          break;
          
        case 'firstPage':
          // Start the page loop (in the actual library, this prepares for drawing)
          isPageMode = true;
          console.log("U8g2 firstPage() called - starting page loop");
          // In real U8g2, firstPage clears the display buffer, so we'll do the same
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              buffer[y][x] = 0;
            }
          }
          break;
          
        case 'nextPage':
          // Continue the page loop (in the actual library, this would advance pages)
          console.log("U8g2 nextPage() called - continuing page loop");
          // In the actual library, nextPage would refresh the display with the current buffer
          // Since we're constantly rendering the buffer, this is mostly a no-op for us
          break;
        
        case 'clearBuffer':
          // Clear the entire buffer - this is used in the full buffer mode of U8g2
          isBufferMode = true;
          console.log("U8g2 clearBuffer() called - using buffer mode");
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              buffer[y][x] = 0;
            }
          }
          break;
          
        case 'sendBuffer':
          // In real hardware this would send the buffer to display
          isBufferMode = true;
          console.log("U8g2 sendBuffer() called - buffer would be sent to hardware");
          break;
          
        case 'drawStr':
        case 'drawUTF8':
          if (params.length >= 3) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            // The text might be quoted, remove quotes if present
            let text = params[2];
            if (text.startsWith('"') && text.endsWith('"')) {
              text = text.substring(1, text.length - 1);
            }
            
            // Try to parse number if it's not a string
            if (!text.startsWith('"') && !isNaN(text)) {
              text = text.toString();
            }
            
            // Use our enhanced drawText function that returns positioning info
            const newPosition = drawText(buffer, text, x, y, state.fontScale, state.drawColor);
            
            // In U8g2, these drawing functions return the width of the string
            // We simulate this by tracking the width for potential return value usage
            // This is important if code chains function calls: u8g2.drawStr(5, 10, "Hello").drawStr(5, 20, "World");
            const returnWidth = text.length * state.fontWidth * state.fontScale;
            return returnWidth;
          }
          break;
          
        case 'drawBox':
        case 'drawFrame':
          if (params.length >= 4) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const w = parseInt(params[2], 10);
            const h = parseInt(params[3], 10);
            const fill = method === 'drawBox';
            drawRect(buffer, x, y, w, h, fill, state.drawColor);
          }
          break;
          
        case 'drawLine':
          if (params.length >= 4) {
            const x0 = parseInt(params[0], 10);
            const y0 = parseInt(params[1], 10);
            const x1 = parseInt(params[2], 10);
            const y1 = parseInt(params[3], 10);
            drawLine(buffer, x0, y0, x1, y1, state.drawColor);
          }
          break;
          
        case 'drawPixel':
          if (params.length >= 2) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            if (x >= 0 && x < width && y >= 0 && y < height) {
              buffer[y][x] = state.drawColor;
            }
          }
          break;
          
        case 'drawCircle':
          if (params.length >= 3) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const r = parseInt(params[2], 10);
            drawCircle(buffer, x, y, r, false, state.drawColor);
          }
          break;
          
        case 'drawDisc':
          if (params.length >= 3) {
            const x = parseInt(params[0], 10);
            const y = parseInt(params[1], 10);
            const r = parseInt(params[2], 10);
            drawCircle(buffer, x, y, r, true, state.drawColor);
          }
          break;
          
        case 'setFont':
          // This would set different fonts, but we'll just adjust scale for simplicity
          if (params.length >= 1) {
            // Try to detect font size from font name (e.g., u8g2_font_6x10_tr)
            const fontName = params[0].toString();
            if (fontName.includes('6x10')) {
              state.fontWidth = 6;
              state.fontHeight = 10;
            } else if (fontName.includes('10x20')) {
              state.fontWidth = 10;
              state.fontHeight = 20;
            } else if (fontName.includes('7x13')) {
              state.fontWidth = 7;
              state.fontHeight = 13;
            } else {
              // Default
              state.fontWidth = 6;
              state.fontHeight = 8;
            }
          }
          break;
          
        case 'setDrawColor':
          if (params.length >= 1) {
            state.drawColor = parseInt(params[0], 10) ? 1 : 0;
          }
          break;
          
        case 'setFontMode':
          // This controls transparent vs. opaque background
          // We're not implementing this for simplicity
          break;
      }
    }
    catch (error) {
      console.error(`Error executing U8g2 command '${method}':`, error);
    }
  }
}

/**
 * Draw a round rectangle
 */
function drawRoundRect(buffer, x, y, w, h, radius, fill, color = 1) {
  // Draw straight parts
  drawRect(buffer, x + radius, y, w - 2 * radius, h, fill, color);
  drawRect(buffer, x, y + radius, w, h - 2 * radius, fill, color);
  
  // Draw four corners
  drawCircle(buffer, x + radius, y + radius, radius, fill, color);
  drawCircle(buffer, x + w - radius - 1, y + radius, radius, fill, color);
  drawCircle(buffer, x + radius, y + h - radius - 1, radius, fill, color);
  drawCircle(buffer, x + w - radius - 1, y + h - radius - 1, radius, fill, color);
}

// Removed duplicate drawLine function as it's defined further down
// with the color parameter

// Helper function to draw a rectangle
const drawRect = (buffer, x, y, w, h, fill, color = 1) => {
  // Clamp dimensions to buffer size
  const startX = Math.max(0, x);
  const startY = Math.max(0, y);
  const endX = Math.min(buffer[0].length - 1, x + w - 1);
  const endY = Math.min(buffer.length - 1, y + h - 1);
  
  if (fill) {
    // Filled rectangle
    for (let iy = startY; iy <= endY; iy++) {
      for (let ix = startX; ix <= endX; ix++) {
        buffer[iy][ix] = color;
      }
    }
  } else {
    // Outline only
    // Draw horizontal lines
    for (let ix = startX; ix <= endX; ix++) {
      if (startY >= 0 && startY < buffer.length) buffer[startY][ix] = color;
      if (endY >= 0 && endY < buffer.length) buffer[endY][ix] = color;
    }
    // Draw vertical lines
    for (let iy = startY; iy <= endY; iy++) {
      if (startX >= 0 && startX < buffer[0].length) buffer[iy][startX] = color;
      if (endX >= 0 && endX < buffer[0].length) buffer[iy][endX] = color;
    }
  }
};

// Helper function to draw a circle
const drawCircle = (buffer, x0, y0, radius, fill, color = 1) => {
  // Mid-point circle algorithm
  let x = radius;
  let y = 0;
  let err = 0;
  
  while (x >= y) {
    if (fill) {
      // For filled circles, draw horizontal lines between the points
      for (let ix = -x; ix <= x; ix++) {
        setPixelSafe(buffer, x0 + ix, y0 + y, color);
        setPixelSafe(buffer, x0 + ix, y0 - y, color);
      }
      for (let ix = -y; ix <= y; ix++) {
        setPixelSafe(buffer, x0 + ix, y0 + x, color);
        setPixelSafe(buffer, x0 + ix, y0 - x, color);
      }
    } else {
      // For outline circles, just draw the 8 points
      setPixelSafe(buffer, x0 + x, y0 + y, color);
      setPixelSafe(buffer, x0 + y, y0 + x, color);
      setPixelSafe(buffer, x0 - y, y0 + x, color);
      setPixelSafe(buffer, x0 - x, y0 + y, color);
      setPixelSafe(buffer, x0 - x, y0 - y, color);
      setPixelSafe(buffer, x0 - y, y0 - x, color);
      setPixelSafe(buffer, x0 + y, y0 - x, color);
      setPixelSafe(buffer, x0 + x, y0 - y, color);
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

// Helper function to draw a line with color parameter
const drawLine = (buffer, x0, y0, x1, y1, color = 1) => {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  
  while (true) {
    if (x0 >= 0 && x0 < buffer[0].length && y0 >= 0 && y0 < buffer.length) {
      buffer[y0][x0] = color;
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

// Helper to set a pixel safely (checking bounds)
const setPixelSafe = (buffer, x, y, color = 1) => {
  // Convert coordinates to integers to handle string parameters
  const px = Math.floor(Number(x));
  const py = Math.floor(Number(y));
  
  // Apply color (ensure it's numeric)
  const pixelColor = Number(color) ? 1 : 0;
  
  // Safety check to avoid out-of-bounds errors
  if (px >= 0 && px < buffer[0].length && py >= 0 && py < buffer.length) {
    buffer[py][px] = pixelColor;
  } else {
    // Don't log every out-of-bounds pixel to avoid console spam
    // but track the issue for debugging
    if (window.simulatorContext?.debugMode) {
      console.log(`Pixel out of bounds: (${px}, ${py})`);
    }
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
// Enhanced to support both Adafruit and U8g2 libraries
const drawText = (buffer, text, x, y, scale = 1, color = 1) => {
  // Scale should be at least 1
  scale = Math.max(1, scale);
  
  let cursorX = x;
  
  // Special case handling for newlines in text
  const lines = text.split('\n');
  
  // Process each line
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    // Reset cursorX for each line
    let lineX = cursorX;
    
    // Draw each character in the line
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const charData = fontData[char] || fontData[' ']; // Default to space if char not found
      
      // Draw the character pixel by pixel with scaling
      for (let cy = 0; cy < charData.length; cy++) {
        for (let cx = 0; cx < charData[cy].length; cx++) {
          if (charData[cy][cx]) {
            // Apply scaling by drawing multiple pixels
            for (let sy = 0; sy < scale; sy++) {
              for (let sx = 0; sx < scale; sx++) {
                const px = lineX + (cx * scale) + sx;
                const py = y + (cy * scale) + sy + (lineIndex * 8 * scale); // Move down 8 pixels (scaled) per line
                
                // Use our safe pixel setting function
                setPixelSafe(buffer, px, py, color);
              }
            }
          }
        }
      }
      
      // Move cursor to the next character position
      lineX += (6 * scale); // Each character is 5 pixels wide + 1 pixel space
    }
  }
  
  // Return the final cursor position - useful for U8g2 style APIs that return cursor position
  // This mimics the behavior of libraries like U8g2 where drawing functions return updated positions
  return { 
    x: cursorX, 
    y: y + (lines.length * 8 * scale) 
  };
};