/**
 * ArduinoCompiler.js
 * 
 * This file provides functionality to "compile" Arduino code to AVR machine code.
 * 
 * NOTE: This is a highly simplified implementation for educational purposes.
 * A real-world implementation would use:
 * 1. A WebAssembly-based avr-gcc compiler, or
 * 2. A server-side compilation service
 */

// Common Arduino constants and their machine code equivalents
const AVR_OPCODES = {
  // PIN MODE OPERATIONS
  pinMode: {
    OUTPUT: {
      // SBI DDRx, bit (Set Bit in I/O Register)
      // Sets the specified bit in DDR register (makes pin OUTPUT)
      code: (port, bit) => [0x9A, (port & 0xFF) | ((bit & 0x7) << 3)]
    },
    INPUT: {
      // CBI DDRx, bit (Clear Bit in I/O Register)
      // Clears the specified bit in DDR register (makes pin INPUT)
      code: (port, bit) => [0x98, (port & 0xFF) | ((bit & 0x7) << 3)]
    },
    INPUT_PULLUP: {
      // Chain of operations:
      // 1. CBI DDRx, bit (set as INPUT)
      // 2. SBI PORTx, bit (enable pullup)
      code: (port, bit) => [
        0x98, (port & 0xFF) | ((bit & 0x7) << 3),
        0x9A, ((port + 2) & 0xFF) | ((bit & 0x7) << 3)
      ]
    }
  },
  
  // DIGITAL WRITE OPERATIONS
  digitalWrite: {
    HIGH: {
      // SBI PORTx, bit (Set Bit in PORT register)
      code: (port, bit) => [0x9A, ((port + 2) & 0xFF) | ((bit & 0x7) << 3)]
    },
    LOW: {
      // CBI PORTx, bit (Clear Bit in PORT register)
      code: (port, bit) => [0x98, ((port + 2) & 0xFF) | ((bit & 0x7) << 3)]
    }
  },
  
  // DELAY OPERATION
  delay: {
    // Simple delay loop implementation
    // For educational purposes - not accurate for all values
    code: (ms) => {
      // Convert ms to loop iterations (very approximate)
      const iterations = Math.max(1, Math.floor(ms / 10));
      
      return [
        0xE0, 0xE0, // LDI r16, 0 (counter low byte)
        0xE0, 0xF0, // LDI r17, 0 (counter high byte)
        
        // Loop start
        0x0F, 0x5E, // SUBI r16, 1 (decrement low byte)
        0x1F, 0x4F, // SBCI r17, 0 (decrement high byte with carry)
        
        // Check if counter is zero
        0x01, 0xF4, // BRNE -4 (branch if not zero to loop start)
        
        // For a longer delay based on ms parameter
        // In a real implementation, this would be much more accurate
        0xCF, 0xEA  // RJMP -22 (jump back to reset counter for very long delays)
      ];
    }
  },
  
  // ANALOG WRITE (PWM) OPERATIONS
  analogWrite: {
    // Simplified PWM implementation
    // In real code this would configure timer registers
    code: (port, bit, value) => {
      // For demonstration - not fully accurate
      return [
        // Set pin as OUTPUT
        0x9A, (port & 0xFF) | ((bit & 0x7) << 3),
        
        // Load value into r16
        0xE0, value & 0xFF,
        
        // Store to OCR register (depends on which pin/timer)
        // This is a placeholder - real code would be more complex
        0xBF, 0xE0
      ];
    }
  }
};

// Map Arduino pin numbers to AVR port and bit
const PIN_TO_PORT_BIT = {
  0: { port: 0x0B, bit: 0 }, // PORTD, bit 0
  1: { port: 0x0B, bit: 1 }, // PORTD, bit 1
  2: { port: 0x0B, bit: 2 }, // PORTD, bit 2
  3: { port: 0x0B, bit: 3 }, // PORTD, bit 3
  4: { port: 0x0B, bit: 4 }, // PORTD, bit 4
  5: { port: 0x0B, bit: 5 }, // PORTD, bit 5
  6: { port: 0x0B, bit: 6 }, // PORTD, bit 6
  7: { port: 0x0B, bit: 7 }, // PORTD, bit 7
  8: { port: 0x04, bit: 0 }, // PORTB, bit 0
  9: { port: 0x04, bit: 1 }, // PORTB, bit 1
  10: { port: 0x04, bit: 2 }, // PORTB, bit 2
  11: { port: 0x04, bit: 3 }, // PORTB, bit 3
  12: { port: 0x04, bit: 4 }, // PORTB, bit 4
  13: { port: 0x04, bit: 5 }, // PORTB, bit 5
};

// Special constants
const CONSTANTS = {
  'LED_BUILTIN': 13,
  'HIGH': 1,
  'LOW': 0,
  'INPUT': 0,
  'OUTPUT': 1,
  'INPUT_PULLUP': 2
};

// Parse Arduino code to extract function calls
const parseArduinoFunctions = (code) => {
  const functions = [];
  
  // Process #define statements first
  const defineRegex = /#define\s+(\w+)\s+(\w+|\d+)/g;
  let defineMatch;
  const defines = { ...CONSTANTS };
  
  while ((defineMatch = defineRegex.exec(code)) !== null) {
    const name = defineMatch[1];
    const value = defineMatch[2];
    
    // Parse the value (could be a number or another constant)
    if (/^\d+$/.test(value)) {
      defines[name] = parseInt(value, 10);
    } else if (defines[value] !== undefined) {
      defines[name] = defines[value];
    }
  }
  
  // Parse pinMode calls
  const pinModeRegex = /pinMode\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/g;
  let pinModeMatch;
  
  while ((pinModeMatch = pinModeRegex.exec(code)) !== null) {
    let pin = pinModeMatch[1];
    const mode = pinModeMatch[2];
    
    // Handle constants
    if (defines[pin] !== undefined) {
      pin = defines[pin];
    } else if (/^\d+$/.test(pin)) {
      pin = parseInt(pin, 10);
    }
    
    // Add to functions list
    functions.push({
      type: 'pinMode',
      pin,
      mode: defines[mode] !== undefined ? defines[mode] : mode
    });
  }
  
  // Parse digitalWrite calls
  const digitalWriteRegex = /digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*\)/g;
  let digitalWriteMatch;
  
  while ((digitalWriteMatch = digitalWriteRegex.exec(code)) !== null) {
    let pin = digitalWriteMatch[1];
    let value = digitalWriteMatch[2];
    
    // Handle constants
    if (defines[pin] !== undefined) {
      pin = defines[pin];
    } else if (/^\d+$/.test(pin)) {
      pin = parseInt(pin, 10);
    }
    
    if (defines[value] !== undefined) {
      value = defines[value];
    } else if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }
    
    // Add to functions list
    functions.push({
      type: 'digitalWrite',
      pin,
      value
    });
  }
  
  // Parse analogWrite calls
  const analogWriteRegex = /analogWrite\s*\(\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*\)/g;
  let analogWriteMatch;
  
  while ((analogWriteMatch = analogWriteRegex.exec(code)) !== null) {
    let pin = analogWriteMatch[1];
    let value = analogWriteMatch[2];
    
    // Handle constants
    if (defines[pin] !== undefined) {
      pin = defines[pin];
    } else if (/^\d+$/.test(pin)) {
      pin = parseInt(pin, 10);
    }
    
    if (defines[value] !== undefined) {
      value = defines[value];
    } else if (/^\d+$/.test(value)) {
      value = parseInt(value, 10);
    }
    
    // Add to functions list
    functions.push({
      type: 'analogWrite',
      pin,
      value
    });
  }
  
  // Parse delay calls
  const delayRegex = /delay\s*\(\s*(\w+|\d+)\s*\)/g;
  let delayMatch;
  
  while ((delayMatch = delayRegex.exec(code)) !== null) {
    let ms = delayMatch[1];
    
    // Handle constants
    if (defines[ms] !== undefined) {
      ms = defines[ms];
    } else if (/^\d+$/.test(ms)) {
      ms = parseInt(ms, 10);
    }
    
    // Add to functions list
    functions.push({
      type: 'delay',
      ms
    });
  }
  
  return functions;
};

// Generate AVR machine code for the parsed functions
const generateMachineCode = (functions) => {
  const machineCode = [];
  
  // For each function, generate the appropriate machine code
  for (const func of functions) {
    switch (func.type) {
      case 'pinMode': {
        const { pin, mode } = func;
        const pinInfo = PIN_TO_PORT_BIT[pin];
        
        if (!pinInfo) {
          console.error(`Invalid pin: ${pin}`);
          continue;
        }
        
        let modeStr = 'INPUT';
        if (mode === 1 || mode === 'OUTPUT') {
          modeStr = 'OUTPUT';
        } else if (mode === 2 || mode === 'INPUT_PULLUP') {
          modeStr = 'INPUT_PULLUP';
        }
        
        const { port, bit } = pinInfo;
        const opcodes = AVR_OPCODES.pinMode[modeStr].code(port, bit);
        machineCode.push(...opcodes);
        break;
      }
      
      case 'digitalWrite': {
        const { pin, value } = func;
        const pinInfo = PIN_TO_PORT_BIT[pin];
        
        if (!pinInfo) {
          console.error(`Invalid pin: ${pin}`);
          continue;
        }
        
        let valueStr = 'LOW';
        if (value === 1 || value === 'HIGH') {
          valueStr = 'HIGH';
        }
        
        const { port, bit } = pinInfo;
        const opcodes = AVR_OPCODES.digitalWrite[valueStr].code(port, bit);
        machineCode.push(...opcodes);
        break;
      }
      
      case 'analogWrite': {
        const { pin, value } = func;
        const pinInfo = PIN_TO_PORT_BIT[pin];
        
        if (!pinInfo) {
          console.error(`Invalid pin: ${pin}`);
          continue;
        }
        
        const { port, bit } = pinInfo;
        const opcodes = AVR_OPCODES.analogWrite.code(port, bit, value);
        machineCode.push(...opcodes);
        break;
      }
      
      case 'delay': {
        const { ms } = func;
        const opcodes = AVR_OPCODES.delay.code(ms);
        machineCode.push(...opcodes);
        break;
      }
      
      default:
        console.warn(`Unsupported function type: ${func.type}`);
    }
  }
  
  return new Uint16Array(machineCode);
};

// Main function to compile Arduino code to AVR machine code
export const compileArduinoToAVR = (code) => {
  try {
    // Parse the functions from the Arduino code
    const functions = parseArduinoFunctions(code);
    
    // Log for debugging
    console.log('Parsed functions:', functions);
    
    // Generate machine code
    const machineCode = generateMachineCode(functions);
    
    return {
      success: true,
      machineCode,
      functions
    };
  } catch (error) {
    console.error('Error compiling Arduino code:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create a simple blink program for testing
export const createBlinkProgram = () => {
  // Output machine code for a simple blink program
  const blinkMachineCode = [
    // Set pin 13 (PB5) as OUTPUT
    0x9A, 0x25, // SBI 0x05, 5 (set bit 5 in DDRB)
    
    // Loop:
    // Set pin 13 (PB5) HIGH
    0x9A, 0x2D, // SBI 0x0D, 5 (set bit 5 in PORTB)
    
    // Delay
    0xE0, 0xE0, // LDI r16, 0
    0xE0, 0xF0, // LDI r17, 0
    // Delay loop
    0x0F, 0x5E, // SUBI r16, 1
    0x1F, 0x4F, // SBCI r17, 0
    0x01, 0xF4, // BRNE -4 (branch if not zero)
    
    // Set pin 13 (PB5) LOW
    0x98, 0x2D, // CBI 0x0D, 5 (clear bit 5 in PORTB)
    
    // Delay again
    0xE0, 0xE0, // LDI r16, 0
    0xE0, 0xF0, // LDI r17, 0
    // Delay loop
    0x0F, 0x5E, // SUBI r16, 1
    0x1F, 0x4F, // SBCI r17, 0
    0x01, 0xF4, // BRNE -4 (branch if not zero)
    
    // Jump back to the beginning of the loop
    0xCF, 0xE8, // RJMP -24 (jump back to set HIGH)
  ];
  
  return new Uint16Array(blinkMachineCode);
};

export default {
  compileArduinoToAVR,
  createBlinkProgram
};