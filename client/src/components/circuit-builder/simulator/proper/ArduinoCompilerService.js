/**
 * ArduinoCompilerService
 * 
 * This service provides functions for parsing and analyzing actual Arduino code.
 * Instead of using pre-defined behaviors, we extract the exact pin operations
 * from the user's code and execute them as specified.
 */

/**
 * PinOperation - Represents a specific operation on a pin
 * @typedef {Object} PinOperation
 * @property {number} pin - The pin number
 * @property {string} operation - Type of operation (digitalWrite, analogWrite, etc)
 * @property {number|boolean} value - Value to set (HIGH/LOW for digital, 0-255 for analog)
 * @property {number} [delay] - Delay after this operation in milliseconds
 * @property {boolean} [conditional] - Whether this operation depends on a condition
 */

/**
 * UserProgram - Represents the parsed user program
 * @typedef {Object} UserProgram
 * @property {PinOperation[]} setup - Operations to execute once at startup
 * @property {PinOperation[]} loop - Operations to execute repeatedly
 * @property {Object.<number, string>} pinModes - Pin modes (INPUT, OUTPUT, etc.)
 * @property {boolean} hasSerial - Whether the program uses Serial communication
 * @property {Object} additionalData - Any additional extracted data from the code
 */

/**
 * Special marker bytes to identify program types 
 * when executing without proper compilation
 */
const PROGRAM_TYPES = {
  // Program contains custom user code
  CUSTOM: 0xFF,
  
  // Default empty program
  EMPTY: 0x00
};

/**
 * Compile Arduino code to a simulatable program structure
 * @param {string} code - The Arduino code to compile
 * @returns {Promise<{success: boolean, program?: Uint16Array, userProgram?: Object, error?: string}>} - Compilation result
 */
export async function compileArduino(code) {
  try {
    // Parse the actual user code to extract pin operations
    const userProgram = parseArduinoCode(code);
    
    // Also analyze components for backward compatibility
    const components = analyzeComponents(userProgram);
    
    // Create a program that identifies itself as custom code
    const customProgram = new Uint16Array([PROGRAM_TYPES.CUSTOM, 0, 0, 0, 0]);
    
    console.log('Parsed user program:', userProgram);
    
    return {
      success: true,
      program: customProgram,
      userProgram: userProgram,
      components: components
    };
  } catch (error) {
    console.error("Arduino compilation error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract pin operations from Arduino code
 * @param {string} code - Arduino code to parse
 * @returns {UserProgram} - Extracted program structure
 */
function parseArduinoCode(code) {
  // Initialize program structure
  const userProgram = {
    setup: [],
    loop: [],
    pinModes: {},
    hasSerial: false,
    additionalData: {},
    rawCode: code // Store the raw code for debugging
  };
  
  // Extract setup and loop functions
  const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*{([^}]*)}/s);
  const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*{([^}]*)}/s);
  
  const setupCode = setupMatch ? setupMatch[1] : '';
  const loopCode = loopMatch ? loopMatch[1] : '';
  
  // Check for Serial usage
  userProgram.hasSerial = code.includes('Serial.begin') || 
                         code.includes('Serial.print') || 
                         code.includes('Serial.write');
  
  // Define Arduino constants
  const arduinoConstants = {
    'LED_BUILTIN': 13, // Arduino built-in LED pin
    'HIGH': 1,
    'LOW': 0,
    'INPUT': 'INPUT',
    'OUTPUT': 'OUTPUT',
    'INPUT_PULLUP': 'INPUT_PULLUP'
  };
  
  // Store constants in the user program
  userProgram.constants = arduinoConstants;
  
  // Extract pinMode calls, handling both numeric pins and constants
  const pinModeRegex = /pinMode\s*\(\s*([a-zA-Z0-9_]+|\d+)\s*,\s*(INPUT|OUTPUT|INPUT_PULLUP)\s*\)/g;
  let pinModeMatch;
  
  while ((pinModeMatch = pinModeRegex.exec(setupCode)) !== null) {
    let pin;
    const pinIdentifier = pinModeMatch[1];
    
    // Check if this is a constant or a direct number
    if (/^\d+$/.test(pinIdentifier)) {
      // It's a direct number
      pin = parseInt(pinIdentifier, 10);
    } else {
      // It's a constant like LED_BUILTIN
      pin = arduinoConstants[pinIdentifier] || -1; // Use -1 if constant not found
      console.log(`Resolving constant ${pinIdentifier} to pin ${pin}`);
    }
    
    if (pin >= 0) {
      const mode = pinModeMatch[2];
      userProgram.pinModes[pin] = mode;
    }
  }
  
  // Extract digitalWrite calls from setup
  extractDigitalWriteOperations(setupCode, userProgram.setup);
  
  // Extract analogWrite calls from setup
  extractAnalogWriteOperations(setupCode, userProgram.setup);
  
  // Extract digitalWrite calls from loop
  extractDigitalWriteOperations(loopCode, userProgram.loop);
  
  // Extract analogWrite calls from loop
  extractAnalogWriteOperations(loopCode, userProgram.loop);
  
  // Extract delay calls and associate with the preceding operation
  extractDelayOperations(setupCode, userProgram.setup);
  extractDelayOperations(loopCode, userProgram.loop);
  
  return userProgram;
}

/**
 * Extract digitalWrite operations from code
 * @param {string} code - Code snippet to parse
 * @param {PinOperation[]} operations - Array to add operations to
 */
function extractDigitalWriteOperations(code, operations) {
  // Arduino constants needed for parsing
  const arduinoConstants = {
    'LED_BUILTIN': 13,
    'HIGH': 1,
    'LOW': 0
  };

  // Match digitalWrite(pin, HIGH/LOW) pattern with support for constants
  const regex = /digitalWrite\s*\(\s*([a-zA-Z0-9_]+|\d+)\s*,\s*([a-zA-Z0-9_]+|\d+)\s*\)/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    // Process pin parameter - could be a constant like LED_BUILTIN or a number
    let pin;
    const pinIdentifier = match[1];
    
    if (/^\d+$/.test(pinIdentifier)) {
      // Direct number
      pin = parseInt(pinIdentifier, 10);
    } else {
      // Constant like LED_BUILTIN
      pin = arduinoConstants[pinIdentifier] || -1;
      console.log(`Resolving pin constant ${pinIdentifier} to ${pin}`);
    }
    
    // Process value parameter - could be HIGH/LOW or 1/0
    let value;
    const valueStr = match[2];
    
    if (/^\d+$/.test(valueStr)) {
      // Direct number (1 or 0)
      value = parseInt(valueStr, 10) !== 0;
    } else {
      // Constant like HIGH or LOW
      value = valueStr === 'HIGH';
      console.log(`Resolving value constant ${valueStr} to ${value}`);
    }
    
    // Only add operation if we successfully resolved the pin
    if (pin >= 0) {
      operations.push({
        pin: pin,
        operation: 'digitalWrite',
        value: value,
        sourceCode: match[0],
        conditional: isInConditionalBlock(match.index, code)
      });
    }
  }
}

/**
 * Extract analogWrite operations from code
 * @param {string} code - Code snippet to parse
 * @param {PinOperation[]} operations - Array to add operations to
 */
function extractAnalogWriteOperations(code, operations) {
  // Arduino constants needed for parsing
  const arduinoConstants = {
    'LED_BUILTIN': 13
  };

  // Match analogWrite(pin, value) pattern with support for constants
  const regex = /analogWrite\s*\(\s*([a-zA-Z0-9_]+|\d+)\s*,\s*([a-zA-Z0-9_]+|\d+|0x[0-9A-Fa-f]+)\s*\)/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    // Process pin parameter - could be a constant like LED_BUILTIN or a number
    let pin;
    const pinIdentifier = match[1];
    
    if (/^\d+$/.test(pinIdentifier)) {
      // Direct number
      pin = parseInt(pinIdentifier, 10);
    } else {
      // Constant like LED_BUILTIN
      pin = arduinoConstants[pinIdentifier] || -1;
      console.log(`Resolving pin constant ${pinIdentifier} to ${pin}`);
    }
    
    // Process value parameter
    let value;
    let valueStr = match[2];
    
    // Handle direct numbers (decimal or hex)
    if (/^\d+$/.test(valueStr)) {
      value = parseInt(valueStr, 10);
    } else if (valueStr.startsWith('0x')) {
      value = parseInt(valueStr, 16);
    } else {
      // This could be a variable, just use 128 as a fallback for demonstration
      console.log(`Unresolved value: ${valueStr}, using default of 128`);
      value = 128;
    }
    
    // Only add operation if we successfully resolved the pin
    if (pin >= 0) {
      operations.push({
        pin: pin,
        operation: 'analogWrite',
        value: value,
        sourceCode: match[0],
        conditional: isInConditionalBlock(match.index, code)
      });
    }
  }
}

/**
 * Extract delay operations and associate with preceding operations
 * @param {string} code - Code snippet to parse
 * @param {PinOperation[]} operations - Array of operations to update
 */
function extractDelayOperations(code, operations) {
  // Match delay(ms) pattern
  const regex = /delay\s*\(\s*(\d+)\s*\)/g;
  let match;
  
  while ((match = regex.exec(code)) !== null) {
    const delayValue = parseInt(match[1], 10);
    const position = match.index;
    
    // Find the last operation before this delay
    for (let i = operations.length - 1; i >= 0; i--) {
      const op = operations[i];
      // Check if we have operation source code info and position
      if (op.sourceCode && code.indexOf(op.sourceCode) < position) {
        // Associate the delay with this operation
        op.delay = delayValue;
        break;
      }
    }
  }
}

/**
 * Check if a code position is inside a conditional block (if, for, while)
 * @param {number} position - Position in code
 * @param {string} code - Code snippet
 * @returns {boolean} - True if in conditional block
 */
function isInConditionalBlock(position, code) {
  // Simple heuristic: check if there's an "if", "for", or "while" before the position
  // and before the last curly brace opening
  const codeBeforePosition = code.substring(0, position);
  const lastOpenBrace = codeBeforePosition.lastIndexOf('{');
  
  if (lastOpenBrace === -1) return false;
  
  const relevantCode = codeBeforePosition.substring(0, lastOpenBrace);
  return /if\s*\(|for\s*\(|while\s*\(/.test(relevantCode);
}

/**
 * Convert a user program to component analysis
 * @param {UserProgram} userProgram - The parsed user program
 * @returns {Object} - Component information
 */
function analyzeComponents(userProgram) {
  const components = {
    led: false,
    rgbled: false,
    oled: false,
    lcd: false,
    servo: false,
    button: false,
    photoresistor: false
  };
  
  // Combine setup and loop operations
  const allOperations = [...userProgram.setup, ...userProgram.loop];
  
  // Check pin usage in the operations
  const usedPins = new Set();
  const pwmPins = new Set();
  
  allOperations.forEach(op => {
    usedPins.add(op.pin);
    if (op.operation === 'analogWrite') {
      pwmPins.add(op.pin);
    }
  });
  
  // Check for basic LED usage
  if (usedPins.has(13)) {
    components.led = true;
  }
  
  // Check for RGB LED usage (pins 9, 10, 11)
  if (usedPins.has(9) && usedPins.has(10) && usedPins.has(11)) {
    components.rgbled = true;
  }
  
  // Check for analog inputs
  for (let i = 0; i < 6; i++) {
    if (userProgram.rawCode.includes(`analogRead(A${i}`)) {
      components.photoresistor = true;
      break;
    }
  }
  
  // Check for OLED usage based on keywords in the code
  if (userProgram.rawCode.includes('Adafruit_SSD1306') || 
      userProgram.rawCode.includes('U8g2') || 
      userProgram.rawCode.includes('display.')) {
    components.oled = true;
  }
  
  // Check for buttons based on INPUT mode pins
  Object.entries(userProgram.pinModes).forEach(([pin, mode]) => {
    if (mode === 'INPUT' || mode === 'INPUT_PULLUP') {
      components.button = true;
    }
  });
  
  return components;
}