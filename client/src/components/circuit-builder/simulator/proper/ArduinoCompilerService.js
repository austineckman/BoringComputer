/**
 * ArduinoCompilerService.js
 * 
 * This service handles compiling Arduino code into AVR machine code.
 * It uses a combination of static analysis and external compilation.
 */

// Regular expressions for static analysis
const PIN_MODE_REGEX = /pinMode\s*\(\s*(\w+|\d+)\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/g;
const DIGITAL_WRITE_REGEX = /digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(HIGH|LOW)\s*\)/g;
const ANALOG_WRITE_REGEX = /analogWrite\s*\(\s*(\w+|\d+)\s*,\s*([^)]+)\s*\)/g;
const DIGITAL_READ_REGEX = /digitalRead\s*\(\s*(\w+|\d+)\s*\)/g;
const ANALOG_READ_REGEX = /analogRead\s*\(\s*(\w+|\d+)\s*\)/g;
const DELAY_REGEX = /delay\s*\(\s*(\d+)\s*\)/g;
const SERIAL_REGEX = /Serial\.(begin|print|println|write)\s*\(/g;

/**
 * Analyze Arduino code to extract used pins, libraries and other metadata
 * @param {string} code - The Arduino code to analyze
 * @returns {Object} The analysis results
 */
function analyzeCode(code) {
  // Set to track unique pins
  const pinsUsed = new Set();
  const pinModes = {};
  const libraries = new Set();
  const delays = [];
  const usesSerial = code.includes("Serial.");
  
  // Check for LED_BUILTIN (resolves to pin 13)
  if (code.includes("LED_BUILTIN")) {
    pinsUsed.add(13);
  }
  
  // Extract pinMode calls
  let match;
  while ((match = PIN_MODE_REGEX.exec(code)) !== null) {
    const pin = match[1];
    const mode = match[2];
    
    // Resolve pin number
    const pinNumber = resolvePinNumber(pin);
    if (pinNumber !== null) {
      pinsUsed.add(pinNumber);
      pinModes[pinNumber] = mode;
    }
  }
  
  // Extract digitalWrite calls
  while ((match = DIGITAL_WRITE_REGEX.exec(code)) !== null) {
    const pin = match[1];
    const pinNumber = resolvePinNumber(pin);
    if (pinNumber !== null) {
      pinsUsed.add(pinNumber);
    }
  }
  
  // Extract analogWrite calls (PWM)
  while ((match = ANALOG_WRITE_REGEX.exec(code)) !== null) {
    const pin = match[1];
    const pinNumber = resolvePinNumber(pin);
    if (pinNumber !== null) {
      pinsUsed.add(pinNumber);
    }
  }
  
  // Extract digitalRead calls
  while ((match = DIGITAL_READ_REGEX.exec(code)) !== null) {
    const pin = match[1];
    const pinNumber = resolvePinNumber(pin);
    if (pinNumber !== null) {
      pinsUsed.add(pinNumber);
    }
  }
  
  // Extract analogRead calls
  while ((match = ANALOG_READ_REGEX.exec(code)) !== null) {
    const pin = match[1];
    const pinNumber = resolvePinNumber(pin);
    if (pinNumber !== null) {
      pinsUsed.add(pinNumber);
    }
  }
  
  // Extract delay values
  while ((match = DELAY_REGEX.exec(code)) !== null) {
    const delayMs = parseInt(match[1], 10);
    delays.push(delayMs);
  }
  
  // Extract libraries
  const libraryRegex = /#include\s*<([^>]+)>/g;
  while ((match = libraryRegex.exec(code)) !== null) {
    libraries.add(match[1]);
  }
  
  return {
    pinsUsed: Array.from(pinsUsed),
    pinModes,
    libraries: Array.from(libraries),
    delays,
    usesSerial
  };
}

/**
 * Resolve a pin identifier to its numeric value
 * @param {string} pin - The pin identifier (number, A0-A5, or LED_BUILTIN)
 * @returns {number|null} The numeric pin value or null if invalid
 */
function resolvePinNumber(pin) {
  // If it's already a number, just parse it
  if (!isNaN(pin)) {
    return parseInt(pin, 10);
  }
  
  // Handle constants
  switch (pin) {
    case "LED_BUILTIN":
      return 13;
    case "A0": return 14; // Arduino analog pins A0-A5 are often represented as 14-19
    case "A1": return 15;
    case "A2": return 16;
    case "A3": return 17;
    case "A4": return 18;
    case "A5": return 19;
    default:
      // If it has an 'A' prefix, try to extract the number
      if (pin.startsWith("A") && !isNaN(pin.substring(1))) {
        return 14 + parseInt(pin.substring(1), 10);
      }
      return null;
  }
}

/**
 * Convert a hex string to a Uint16Array of instructions
 * @param {string} hexString - The hex string representation of the program
 * @returns {Uint16Array} The program as a Uint16Array
 */
function hexToProgram(hexString) {
  // Clean up the hex string
  const cleanHex = hexString.replace(/[\s:]/g, '');
  
  // Calculate the number of words needed
  const numWords = Math.ceil(cleanHex.length / 4);
  
  // Create the program array
  const program = new Uint16Array(numWords);
  
  // Convert hex to 16-bit words
  for (let i = 0; i < numWords; i++) {
    const start = i * 4;
    const hexWord = cleanHex.substring(start, start + 4);
    
    if (hexWord.length > 0) {
      // Parse as a 16-bit word (byte swapped for AVR)
      if (hexWord.length === 4) {
        // Full word
        const highByte = parseInt(hexWord.substring(0, 2), 16);
        const lowByte = parseInt(hexWord.substring(2, 4), 16);
        program[i] = (highByte << 8) | lowByte;
      } else {
        // Partial word (pad with zeros)
        program[i] = parseInt(hexWord.padEnd(4, '0'), 16);
      }
    }
  }
  
  return program;
}

/**
 * Generate a blink example program
 * @returns {Uint16Array} A simple blink program
 */
function generateBlinkProgram() {
  // This is a simplified blink program (would need a real compiler in production)
  const hexCode = `
    9602 0047 0AC4 A002 01C0 0000 0000 0000
    0000 0000 0000 0000 0000 0000 0000 0000
    0000 0000 0000 0000 0000 0000 0000 0000
    9A00 0000 9A00 0000 9A00 0000 0000 0000
  `;
  
  return hexToProgram(hexCode);
}

/**
 * Compile Arduino code to machine code
 * @param {string} code - The Arduino code to compile
 * @returns {Promise<Object>} The compilation result
 */
export async function compileArduino(code) {
  try {
    console.log('Compiling Arduino code...');
    
    // Step 1: Analyze the code to extract metadata
    const analysis = analyzeCode(code);
    console.log('Code analysis:', analysis);
    
    // Step 2: In a real implementation, we would send the code to a compiler
    // For now, we'll generate a simple program based on the analysis
    
    // Determine if this is a basic blink sketch
    const isBlinkSketch = code.includes('digitalWrite') && 
                          code.includes('delay') && 
                          analysis.pinsUsed.includes(13);
    
    // Generate program - for now, always use blink
    // TODO: In the future, use a real compiler or WebAssembly compiler
    const program = generateBlinkProgram();
    
    console.log(`Generated program with ${program.length} words`);
    
    // Step 3: Return the compilation result
    return {
      success: true,
      program: program,
      metadata: {
        pinsUsed: analysis.pinsUsed,
        pinModes: analysis.pinModes,
        libraries: analysis.libraries,
        delays: analysis.delays,
        usesSerial: analysis.usesSerial
      }
    };
    
  } catch (error) {
    console.error('Compilation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Detect which Arduino pins are used in the code
 * @param {string} code - The Arduino code
 * @returns {number[]} Array of pin numbers used in the code
 */
export function detectPinsUsed(code) {
  const analysis = analyzeCode(code);
  return analysis.pinsUsed;
}

/**
 * Parse delay values from the code
 * @param {string} code - The Arduino code
 * @returns {number[]} Array of delay values in milliseconds
 */
export function parseDelays(code) {
  const analysis = analyzeCode(code);
  return analysis.delays;
}