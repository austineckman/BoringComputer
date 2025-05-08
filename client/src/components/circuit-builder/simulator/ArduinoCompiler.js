/**
 * ArduinoCompiler.js
 * 
 * Handles Arduino code parsing, validation, and compilation for the circuit simulator
 */

// Enhanced Arduino syntax validation
export const validateArduinoSyntax = (code) => {
  const errors = [];
  const lines = code.split('\n');
  let inComment = false;
  let bracketCount = 0;
  
  // Simple parser to check for basic syntax errors
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (trimmedLine === '') return;
    
    // Track multi-line comments
    if (trimmedLine.includes("/*")) inComment = true;
    if (trimmedLine.includes("*/")) inComment = false;
    
    // Skip comment lines
    if (trimmedLine.startsWith("//") || inComment) return;
    
    // Check for unclosed quotes
    const quoteCount = (line.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      errors.push({
        line: lineNumber,
        message: "Unclosed double quotes"
      });
    }
    
    // Track bracket balance
    bracketCount += (line.match(/{/g) || []).length;
    bracketCount -= (line.match(/}/g) || []).length;
    
    // Check for missing semicolons at end of statements
    if (trimmedLine && 
        !trimmedLine.startsWith("//") && 
        !trimmedLine.startsWith("/*") && 
        !trimmedLine.endsWith("*/") &&
        !trimmedLine.endsWith("{") && 
        !trimmedLine.endsWith("}") && 
        !trimmedLine.endsWith(";") &&
        !trimmedLine.includes("void setup()") &&
        !trimmedLine.includes("void loop()")) {
      errors.push({
        line: lineNumber,
        message: "Missing semicolon at the end of statement"
      });
    }
    
    // Check for common Arduino errors
    
    // Incorrect pin mode
    if (trimmedLine.includes("pinMode")) {
      if (!trimmedLine.includes("OUTPUT") && 
          !trimmedLine.includes("INPUT") && 
          !trimmedLine.includes("INPUT_PULLUP")) {
        errors.push({
          line: lineNumber,
          message: "Invalid pinMode mode. Use OUTPUT, INPUT, or INPUT_PULLUP"
        });
      }
    }
    
    // digitalRead to constant
    if (trimmedLine.includes("digitalRead") && 
        (trimmedLine.includes("HIGH") || trimmedLine.includes("LOW") ||
         trimmedLine.includes("1") || trimmedLine.includes("0"))) {
      errors.push({
        line: lineNumber,
        message: "digitalRead cannot be compared directly to HIGH/LOW - use == or != operator"
      });
    }
    
    // Common typo: digital Write or analog Write with space
    if (trimmedLine.includes("digital Write") || trimmedLine.includes("analog Write")) {
      errors.push({
        line: lineNumber,
        message: "Function name error: Remove space in 'digital Write' or 'analog Write'"
      });
    }
  });
  
  // Check for unbalanced brackets at the end
  if (bracketCount !== 0) {
    errors.push({
      line: lines.length,
      message: bracketCount > 0 ? 
              "Missing closing brace(s): " + bracketCount + " unclosed '{'" :
              "Extra closing brace(s): " + Math.abs(bracketCount) + " too many '}'"
    });
  }
  
  return errors;
};

// Extract the body of a function from Arduino code
export const extractFunctionBody = (code, functionName) => {
  const regex = new RegExp(`void\\s+${functionName}\\s*\\(\\)\\s*\\{([\\s\\S]*?)\\}`, 'i');
  const match = code.match(regex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return '';
};

// Extract pinMode declarations from setup function
export const extractPinModes = (setupCode) => {
  const pinModes = [];
  const lines = setupCode.split('\n');
  
  // Regular expression to match pinMode(pin, mode)
  const pinModeRegex = /pinMode\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/;
  
  lines.forEach(line => {
    const match = line.match(pinModeRegex);
    if (match) {
      const pin = match[1];
      const mode = match[2];
      
      // Convert pin names to numbers if needed
      const pinNumber = pin === 'LED_BUILTIN' ? 13 : parseInt(pin, 10);
      
      pinModes.push({
        pin: isNaN(pinNumber) ? pin : pinNumber,
        mode
      });
    }
  });
  
  return pinModes;
};

// Extract digitalWrite commands from loop function
export const extractDigitalWrites = (loopCode) => {
  const digitalWrites = [];
  const lines = loopCode.split('\n');
  
  // Regular expression to match digitalWrite(pin, state)
  const digitalWriteRegex = /digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/;
  
  lines.forEach(line => {
    const match = line.match(digitalWriteRegex);
    if (match) {
      const pin = match[1];
      const state = match[2];
      
      // Convert pin names to numbers if needed
      const pinNumber = pin === 'LED_BUILTIN' ? 13 : parseInt(pin, 10);
      const stateValue = state === 'HIGH' ? true : (state === 'LOW' ? false : parseInt(state, 10) > 0);
      
      digitalWrites.push({
        pin: isNaN(pinNumber) ? pin : pinNumber,
        state: stateValue
      });
    }
  });
  
  return digitalWrites;
};

// Extract analogWrite commands from loop function
export const extractAnalogWrites = (loopCode) => {
  const analogWrites = [];
  const lines = loopCode.split('\n');
  
  // Regular expression to match analogWrite(pin, value)
  const analogWriteRegex = /analogWrite\s*\(\s*(\w+)\s*,\s*(\w+|\d+)\s*\)/;
  
  lines.forEach(line => {
    const match = line.match(analogWriteRegex);
    if (match) {
      const pin = match[1];
      const value = match[2];
      
      // Convert pin names to numbers if needed
      const pinNumber = parseInt(pin, 10);
      const analogValue = parseInt(value, 10);
      
      if (!isNaN(analogValue)) {
        analogWrites.push({
          pin: isNaN(pinNumber) ? pin : pinNumber,
          value: analogValue
        });
      }
    }
  });
  
  return analogWrites;
};

// Extract delay calls from loop function
export const extractDelays = (loopCode) => {
  const delays = [];
  const lines = loopCode.split('\n');
  
  // Regular expression to match delay(ms)
  const delayRegex = /delay\s*\(\s*(\d+)\s*\)/;
  
  lines.forEach(line => {
    const match = line.match(delayRegex);
    if (match) {
      const ms = parseInt(match[1], 10);
      
      if (!isNaN(ms)) {
        delays.push({ ms });
      }
    }
  });
  
  return delays;
};

// Validate that the circuit matches the Arduino code requirements
export const validateCircuitForCode = (code, connections) => {
  const setupCode = extractFunctionBody(code, "setup");
  const loopCode = extractFunctionBody(code, "loop");
  
  // Extract pin configurations and operations
  const pinModes = extractPinModes(setupCode);
  const digitalWrites = extractDigitalWrites(loopCode);
  const analogWrites = extractAnalogWrites(loopCode);
  
  // Collect all pins used in the code
  const usedPins = new Set([
    ...pinModes.map(pm => pm.pin.toString()),
    ...digitalWrites.map(dw => dw.pin.toString()),
    ...analogWrites.map(aw => aw.pin.toString())
  ]);
  
  // Check for missing connections
  const missingConnections = [];
  const warnings = [];
  
  usedPins.forEach(pin => {
    // For each pin used in code, check if it has connections in the circuit
    const pinKey = `D${pin}`;
    const analogKey = `A${pin}`;
    
    // A pin is properly connected if either the digital or analog designation has connections
    if ((!connections[pinKey] || connections[pinKey].length === 0) && 
        (!connections[analogKey] || connections[analogKey].length === 0)) {
      missingConnections.push(pin);
    }
  });
  
  // Check for mode/operation inconsistencies
  const pinModeMap = {};
  pinModes.forEach(pm => {
    pinModeMap[pm.pin] = pm.mode;
  });
  
  // Validate digital writes
  digitalWrites.forEach(dw => {
    if (!pinModeMap[dw.pin]) {
      warnings.push(`Pin ${dw.pin} is written to but not configured with pinMode()`);
    } else if (pinModeMap[dw.pin] !== 'OUTPUT') {
      warnings.push(`Pin ${dw.pin} is written to but configured as ${pinModeMap[dw.pin]} instead of OUTPUT`);
    }
  });
  
  // Validate analog writes
  analogWrites.forEach(aw => {
    if (!pinModeMap[aw.pin]) {
      warnings.push(`Pin ${aw.pin} is analog-written to but not configured with pinMode()`);
    } else if (pinModeMap[aw.pin] !== 'OUTPUT') {
      warnings.push(`Pin ${aw.pin} is analog-written to but configured as ${pinModeMap[aw.pin]} instead of OUTPUT`);
    }
  });
  
  return {
    valid: missingConnections.length === 0 && warnings.length === 0,
    missingConnections,
    warnings,
    usedPins: Array.from(usedPins),
    pinModes,
    digitalWrites,
    analogWrites
  };
};

// Analyze the code for pin usage patterns
export const analyzeCodePinUsage = (code) => {
  const setupCode = extractFunctionBody(code, "setup");
  const loopCode = extractFunctionBody(code, "loop");
  
  // Extract pin configurations and operations
  const pinModes = extractPinModes(setupCode);
  const digitalWrites = extractDigitalWrites(loopCode);
  const analogWrites = extractAnalogWrites(loopCode);
  const delays = extractDelays(loopCode);
  
  // Identify blinking patterns (digital writes with delays between them)
  const blinkDetection = findBlinkPatterns(digitalWrites, delays, loopCode);
  
  // Identify PWM patterns (analog writes that might represent fading)
  const fadeDetection = findFadePatterns(analogWrites, loopCode);
  
  return {
    pinModes,
    digitalWrites,
    analogWrites,
    delays,
    patterns: {
      blink: blinkDetection,
      fade: fadeDetection
    }
  };
};

// Find potential blinking patterns in the code
const findBlinkPatterns = (digitalWrites, delays, loopCode) => {
  // This is a simplified pattern detector
  // In a real implementation, we'd parse the AST to find state changes
  
  // If we have at least two digital writes to the same pin with different states
  // and there are delays in between, it's likely a blink pattern
  const pins = new Set(digitalWrites.map(dw => dw.pin));
  const blinkPatterns = [];
  
  pins.forEach(pin => {
    const pinWrites = digitalWrites.filter(dw => dw.pin === pin);
    
    // Check if the pin is written to with different states
    const hasHighState = pinWrites.some(pw => pw.state === true);
    const hasLowState = pinWrites.some(pw => pw.state === false);
    
    if (hasHighState && hasLowState && delays.length > 0) {
      // Calculate total delay in the loop (simplified)
      const totalDelay = delays.reduce((sum, d) => sum + d.ms, 0);
      
      blinkPatterns.push({
        pin,
        period: totalDelay, // Simplified - in ms
        dutyCycle: 0.5 // Simplified - assume 50% duty cycle
      });
    }
  });
  
  return blinkPatterns;
};

// Find potential fading patterns in the code
const findFadePatterns = (analogWrites, loopCode) => {
  // This detection is more complex and would require proper AST parsing
  // For now, we'll use simplified heuristics
  
  // If we have analog writes to a pin with varying values, it might be fading
  const fadePatterns = [];
  
  return fadePatterns;
};

// Compile Arduino code for the simulator (mock implementation)
export const compileArduinoCode = (code) => {
  // In a real implementation, we'd compile the code to a binary
  // For our simulator, we'll return the analysis results
  
  // Validate the code
  const syntaxErrors = validateArduinoSyntax(code);
  if (syntaxErrors.length > 0) {
    return {
      success: false,
      errors: syntaxErrors
    };
  }
  
  // Extract function bodies
  const setupCode = extractFunctionBody(code, "setup");
  const loopCode = extractFunctionBody(code, "loop");
  
  // Analyze the code
  const pinModes = extractPinModes(setupCode);
  const digitalWrites = extractDigitalWrites(loopCode);
  const analogWrites = extractAnalogWrites(loopCode);
  const delays = extractDelays(loopCode);
  
  // Check if the basic structure is valid
  if (!setupCode || !loopCode) {
    return {
      success: false,
      errors: [
        { line: 1, message: !setupCode ? "Missing or empty setup() function" : "Missing or empty loop() function" }
      ]
    };
  }
  
  // Analyze patterns
  const patterns = {
    blink: findBlinkPatterns(digitalWrites, delays, loopCode),
    fade: findFadePatterns(analogWrites, loopCode)
  };
  
  return {
    success: true,
    analysis: {
      pinModes,
      digitalWrites,
      analogWrites,
      delays,
      patterns
    },
    // In a real compiler this would be the binary
    hexProgram: "SIMULATED_HEX_DATA"
  };
};