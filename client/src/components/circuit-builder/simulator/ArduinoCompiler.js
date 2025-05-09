// Define CPU performance levels for simulation
const CPUPerformance = {
  HighAccuracy: 'high',
  MediumAccuracy: 'medium',
  LowAccuracy: 'low'
};

/**
 * ArduinoCompiler.js
 * 
 * This file provides functions to parse and "compile" Arduino code
 * for simulation with avr8js. Since we're not actually compiling,
 * we're doing static analysis to extract information for simulation.
 */

// Simple parser for Arduino setup and loop functions
export function parseArduinoCode(code) {
  const result = {
    setup: '',
    loop: '',
    pinModes: {}, // { pin: 'OUTPUT' | 'INPUT' | 'INPUT_PULLUP' }
    analogValues: {}, // { pin: [value1, value2, ...] }
    errors: []
  };

  try {
    // Extract setup function
    const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*{([^}]*)}/s);
    if (setupMatch) {
      result.setup = setupMatch[1].trim();
    } else {
      result.errors.push({ line: 1, message: 'Missing setup() function' });
    }

    // Extract loop function
    const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*{([^}]*)}/s);
    if (loopMatch) {
      result.loop = loopMatch[1].trim();
    } else {
      result.errors.push({ line: 1, message: 'Missing loop() function' });
    }

    // Extract pinMode calls
    const pinModeRegex = /pinMode\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/g;
    let pinModeMatch;
    
    while ((pinModeMatch = pinModeRegex.exec(code)) !== null) {
      const pin = pinModeMatch[1];
      const mode = pinModeMatch[2];
      
      // Handle special case for LED_BUILTIN
      if (pin === 'LED_BUILTIN') {
        result.pinModes['13'] = mode;
      } else {
        result.pinModes[pin] = mode;
      }
    }

    // Check for common errors
    checkBasicSyntaxErrors(code, result.errors);

  } catch (error) {
    result.errors.push({ 
      line: 1, 
      message: `Error parsing Arduino code: ${error.message}` 
    });
  }

  return result;
}

// Check for basic syntax errors in the Arduino code
function checkBasicSyntaxErrors(code, errors) {
  // Check for mismatched braces
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push({ 
      line: 1, 
      message: `Mismatched braces: ${openBraces} opening and ${closeBraces} closing` 
    });
  }
  
  // Preprocess the code to handle comments properly
  let inMultilineComment = false;
  const processedLines = code.split('\n').map((line, index) => {
    // Process the line to handle comments
    let processedLine = line;
    
    // If we're inside a multiline comment
    if (inMultilineComment) {
      const endCommentIndex = line.indexOf('*/');
      if (endCommentIndex !== -1) {
        // End of multiline comment found
        inMultilineComment = false;
        processedLine = line.substring(endCommentIndex + 2);
      } else {
        // Still inside multiline comment
        return { line: '', isCommentLine: true, lineNumber: index + 1 };
      }
    }
    
    // Check for start of multiline comment
    const startCommentIndex = processedLine.indexOf('/*');
    if (startCommentIndex !== -1) {
      const endCommentIndex = processedLine.indexOf('*/', startCommentIndex);
      if (endCommentIndex !== -1) {
        // Comment begins and ends on same line
        processedLine = 
          processedLine.substring(0, startCommentIndex) + 
          processedLine.substring(endCommentIndex + 2);
      } else {
        // Comment starts but doesn't end on this line
        inMultilineComment = true;
        processedLine = processedLine.substring(0, startCommentIndex);
      }
    }
    
    // Handle single-line comments
    const lineCommentIndex = processedLine.indexOf('//');
    if (lineCommentIndex !== -1) {
      processedLine = processedLine.substring(0, lineCommentIndex);
    }
    
    return { 
      line: processedLine.trim(), 
      isCommentLine: processedLine.trim() === '',
      lineNumber: index + 1 
    };
  });
  
  // Now check for missing semicolons in the processed lines
  processedLines.forEach(({ line, isCommentLine, lineNumber }) => {
    // Skip empty lines or lines that were completely comments
    if (!line || isCommentLine) return;
    
    // Skip lines that shouldn't end with semicolons
    if (line.endsWith('{')) return;
    if (line.endsWith('}')) return;
    if (line.endsWith(';')) return;
    if (line.endsWith(',')) return; // Handle comma-separated lists
    if (line.match(/^\s*#include/)) return; // Preprocessor directives
    if (line.match(/^\s*#define/)) return; // Preprocessor directives
    
    // Skip control structures that don't need semicolons
    if (line.match(/^\s*(if|for|while|switch|else)\s*\(/)) return;
    if (line.match(/^\s*else\s*$/)) return;
    
    // Skip class/function declarations
    if (line.match(/^\s*(class|struct|enum)\s+\w+/)) return;
    if (line.match(/^\s*(void|int|bool|char|float|double|unsigned|long|short|byte|String|size_t)\s+\w+\s*\(/)) return;
    
    // This is a much more robust check with fewer false positives
    errors.push({ 
      line: lineNumber, 
      message: 'Missing semicolon' 
    });
  });
  
  // Check for common Arduino-specific errors
  
  // Check for analogWrite on non-PWM pins
  const analogWriteRegex = /analogWrite\s*\(\s*(\d+)/g;
  let match;
  const pwmPins = [3, 5, 6, 9, 10, 11]; // Common Arduino PWM pins
  
  while ((match = analogWriteRegex.exec(code)) !== null) {
    const pin = parseInt(match[1], 10);
    if (!isNaN(pin) && !pwmPins.includes(pin)) {
      errors.push({
        line: getLineNumberForMatch(code, match.index),
        message: `Pin ${pin} does not support analogWrite (PWM). Use pins 3, 5, 6, 9, 10, or 11.`
      });
    }
  }
  
  // Check for missing initialization in digitalWrite
  const digitalWriteRegex = /digitalWrite\s*\(\s*(\d+|LED_BUILTIN)/g;
  const pinModeRegex = /pinMode\s*\(\s*(\d+|LED_BUILTIN)/g;
  
  // Get all pins used in digitalWrite
  const digitalWritePins = [];
  while ((match = digitalWriteRegex.exec(code)) !== null) {
    const pin = match[1];
    if (!digitalWritePins.includes(pin)) {
      digitalWritePins.push(pin);
    }
  }
  
  // Get all pins initialized with pinMode
  const initializedPins = [];
  while ((match = pinModeRegex.exec(code)) !== null) {
    const pin = match[1];
    if (!initializedPins.includes(pin)) {
      initializedPins.push(pin);
    }
  }
  
  // Check if any pin used in digitalWrite is not initialized
  digitalWritePins.forEach(pin => {
    if (!initializedPins.includes(pin)) {
      errors.push({
        line: 1, // Hard to determine exact line number
        message: `Pin ${pin} is used in digitalWrite() but not initialized with pinMode()`
      });
    }
  });
  
  // Check for digitalRead without INPUT mode
  const digitalReadRegex = /digitalRead\s*\(\s*(\d+|LED_BUILTIN)/g;
  const pinModeInputRegex = /pinMode\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(INPUT|INPUT_PULLUP)/g;
  
  // Get all pins used in digitalRead
  const digitalReadPins = [];
  while ((match = digitalReadRegex.exec(code)) !== null) {
    const pin = match[1];
    if (!digitalReadPins.includes(pin)) {
      digitalReadPins.push(pin);
    }
  }
  
  // Get all pins initialized as INPUT
  const inputPins = [];
  while ((match = pinModeInputRegex.exec(code)) !== null) {
    const pin = match[1];
    if (!inputPins.includes(pin)) {
      inputPins.push(pin);
    }
  }
  
  // Check if any pin used in digitalRead is not set as INPUT
  digitalReadPins.forEach(pin => {
    if (!inputPins.includes(pin)) {
      errors.push({
        line: 1, // Hard to determine exact line number
        message: `Pin ${pin} is used in digitalRead() but not set as INPUT or INPUT_PULLUP`
      });
    }
  });
}

// Configure the simulation CPU speed based on complexity
export function configureSimulationSpeed(code) {
  // Default to standard Arduino 16MHz
  let cpuFrequency = 16e6;
  let performance = CPUPerformance.LowAccuracy;
  
  // Adjust based on code complexity
  if (code.length > 10000) {
    // Very complex code, use lowest accuracy
    performance = CPUPerformance.LowAccuracy;
  } else if (code.length > 5000) {
    // Medium complexity
    performance = CPUPerformance.MediumAccuracy;
  } else {
    // Simple code, use higher accuracy
    performance = CPUPerformance.HighAccuracy;
  }
  
  return { cpuFrequency, performance };
}

// Extract the pins used in digital/analog read/write calls
export function extractUsedPins(code) {
  const usedPins = new Set();
  
  // Check for digitalWrite calls
  const digitalWriteRegex = /digitalWrite\s*\(\s*(\w+|\d+)\s*,/g;
  let match;
  
  while ((match = digitalWriteRegex.exec(code)) !== null) {
    const pin = match[1];
    if (pin === 'LED_BUILTIN') {
      usedPins.add('13');
    } else {
      usedPins.add(pin.replace(/[^0-9A-Za-z]/g, ''));
    }
  }
  
  // Check for digitalRead calls
  const digitalReadRegex = /digitalRead\s*\(\s*(\w+|\d+)\s*\)/g;
  while ((match = digitalReadRegex.exec(code)) !== null) {
    const pin = match[1];
    usedPins.add(pin.replace(/[^0-9A-Za-z]/g, ''));
  }
  
  // Check for analogWrite calls
  const analogWriteRegex = /analogWrite\s*\(\s*(\w+|\d+)\s*,/g;
  while ((match = analogWriteRegex.exec(code)) !== null) {
    const pin = match[1];
    usedPins.add(pin.replace(/[^0-9A-Za-z]/g, ''));
  }
  
  // Check for analogRead calls
  const analogReadRegex = /analogRead\s*\(\s*(\w+|\d+)\s*\)/g;
  while ((match = analogReadRegex.exec(code)) !== null) {
    const pin = match[1];
    usedPins.add(pin.replace(/[^0-9A-Za-z]/g, ''));
  }
  
  return Array.from(usedPins);
}

// Get pin mode from parsed code
export function getPinMode(parsedCode, pin) {
  // If explicitly set in pinMode, return that value
  if (parsedCode.pinModes[pin]) {
    return parsedCode.pinModes[pin];
  }
  
  // Otherwise make an educated guess based on usage
  const code = parsedCode.setup + parsedCode.loop;
  
  if (code.includes(`digitalWrite(${pin},`) || code.includes(`analogWrite(${pin},`)) {
    return 'OUTPUT';
  }
  
  if (code.includes(`digitalRead(${pin})`) || code.includes(`analogRead(${pin})`)) {
    return 'INPUT';
  }
  
  // Default to OUTPUT for any pin in the range 0-13 (digital pins)
  if (!isNaN(pin) && Number(pin) >= 0 && Number(pin) <= 13) {
    return 'OUTPUT';
  }
  
  // Default to INPUT for analog pins (A0-A5)
  if (pin.startsWith('A') && !isNaN(pin.substring(1))) {
    return 'INPUT';
  }
  
  return 'UNKNOWN';
}

// List of supported libraries in the system
const SUPPORTED_LIBRARIES = [
  'Wire',
  'SPI',
  'EEPROM',
  'SoftwareSerial',
  'Servo',
  'LiquidCrystal',
  'Stepper',
  'TM1637Display',
  'Adafruit_GFX',
  'Adafruit_SSD1306',
  'SSD1306',
  'U8g2lib',
  'U8glib',
  'BasicEncoder',
  'Keypad',
  'IRremote',
  'DHT',
  'Adafruit_Sensor',
  'FastLED',
  'NeoPixel',
  'OneWire',
  'DallasTemperature'
];

// Validate code and return any errors
export function validateArduinoCode(code) {
  const parsedCode = parseArduinoCode(code);
  const errors = [...parsedCode.errors];
  
  // Preprocess the code to filter out comments
  let inMultilineComment = false;
  let processedCode = '';
  const lines = code.split('\n');
  
  lines.forEach(line => {
    let processedLine = line;
    
    // If we're inside a multiline comment
    if (inMultilineComment) {
      const endCommentIndex = line.indexOf('*/');
      if (endCommentIndex !== -1) {
        // End of multiline comment found
        inMultilineComment = false;
        processedLine = line.substring(endCommentIndex + 2);
      } else {
        // Still inside multiline comment, skip this line
        return;
      }
    }
    
    // Check for start of multiline comment
    const startCommentIndex = processedLine.indexOf('/*');
    if (startCommentIndex !== -1) {
      const endCommentIndex = processedLine.indexOf('*/', startCommentIndex);
      if (endCommentIndex !== -1) {
        // Comment begins and ends on same line
        processedLine = 
          processedLine.substring(0, startCommentIndex) + 
          processedLine.substring(endCommentIndex + 2);
      } else {
        // Comment starts but doesn't end on this line
        inMultilineComment = true;
        processedLine = processedLine.substring(0, startCommentIndex);
      }
    }
    
    // Handle single-line comments
    const lineCommentIndex = processedLine.indexOf('//');
    if (lineCommentIndex !== -1) {
      processedLine = processedLine.substring(0, lineCommentIndex);
    }
    
    // Add the processed line to our code
    processedCode += processedLine + '\n';
  });
  
  // Now check for unsupported libraries in the processed code (excluding comments)
  const includeRegex = /#include\s*<([^>]+)>/g;
  let match;
  
  while ((match = includeRegex.exec(processedCode)) !== null) {
    const libraryName = match[1].replace('.h', '');
    if (!SUPPORTED_LIBRARIES.includes(libraryName)) {
      // Find the actual line number in the original code
      const matchPositionInProcessed = match.index;
      const lineNumber = getLineNumberForMatch(processedCode, matchPositionInProcessed);
      
      errors.push({
        line: lineNumber,
        message: `Library "${libraryName}" is not supported`
      });
    }
  }
  
  return errors;
}

// Helper function to get line number for a position in the code
function getLineNumberForMatch(code, index) {
  const lines = code.slice(0, index).split('\n');
  return lines.length;
}