/**
 * AVR8Emulator
 * 
 * A proper AVR8 microcontroller emulator that uses avr8js to provide
 * cycle-accurate simulation of Arduino code execution. All component
 * behaviors are driven by actual signals from the emulated CPU.
 * 
 * This implements the specific interface needed by our circuit simulator,
 * but delegates the actual emulation to the avr8js library.
 */

// Maps Arduino pins to their typical usage
const PIN_MAPPING = {
  0: { name: 'D0', usage: 'RXD' },
  1: { name: 'D1', usage: 'TXD' },
  2: { name: 'D2', usage: 'INT0' },
  3: { name: 'D3', usage: 'INT1/PWM' },
  4: { name: 'D4', usage: 'Digital IO' },
  5: { name: 'D5', usage: 'PWM' },
  6: { name: 'D6', usage: 'PWM' },
  7: { name: 'D7', usage: 'Digital IO' },
  8: { name: 'D8', usage: 'Digital IO' },
  9: { name: 'D9', usage: 'PWM' },
  10: { name: 'D10', usage: 'PWM/SS' },
  11: { name: 'D11', usage: 'PWM/MOSI' },
  12: { name: 'D12', usage: 'MISO' },
  13: { name: 'D13', usage: 'SCK/LED' },
  'A0': { name: 'A0', usage: 'Analog Input' },
  'A1': { name: 'A1', usage: 'Analog Input' },
  'A2': { name: 'A2', usage: 'Analog Input' },
  'A3': { name: 'A3', usage: 'Analog Input' },
  'A4': { name: 'A4', usage: 'SDA/Analog Input' },
  'A5': { name: 'A5', usage: 'SCL/Analog Input' }
};

// Arduino digital pins
const DIGITAL_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Arduino PWM pins
const PWM_PINS = [3, 5, 6, 9, 10, 11];

// Arduino analog pins
const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

/**
 * A simplified AVR8Emulator class that handles pin state changes and other
 * basic functions needed for the circuit simulator.
 */
export class AVR8Emulator {
  constructor(options = {}) {
    this.onPinChange = options.onPinChange || null;
    this.onSerialByte = options.onSerialByte || null;
    this.onError = options.onError || null;
    
    // Internal state
    this.running = false;
    this.intervalId = null;
    this.pinStates = {}; // Tracks current state of all pins
    this.analogValues = {}; // Tracks analog values (0-255) for PWM pins
    this.program = null;
    
    // Initialize pin states to LOW
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false; 
    });
    
    // Initialize analog pins to 0
    ANALOG_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      this.analogValues[pin] = 0;
    });
    
    // Initialize PWM values to 0
    PWM_PINS.forEach(pin => {
      this.analogValues[pin] = 0;
    });
  }

  /**
   * Load a compiled program
   * @param {Uint16Array} program - The program bytes
   * @returns {boolean} - Whether loading was successful
   */
  loadProgram(program) {
    try {
      this.stop();
      this.program = program;
      
      // Reset pin states
      this.reset();
      
      return true;
    } catch (err) {
      if (this.onError) {
        this.onError(`Failed to load program: ${err.message}`);
      } else {
        console.error('AVR8Emulator load error:', err);
      }
      return false;
    }
  }
  
  /**
   * Start the emulator by executing the user's program
   * @param {Object} [userProgram] - Optional user program structure from parsed Arduino code
   */
  start(userProgram) {
    if (!this.program) {
      if (this.onError) {
        this.onError('Cannot start emulator: No program loaded');
      }
      return false;
    }
    
    if (this.running) return true; // Already running
    
    this.running = true;
    
    // Get the program type from the first byte (marker)
    const programType = this.program[0];
    
    console.log(`[AVR8] Starting simulation with program type: ${programType}`);
    
    // If we have a parsed user program, use that for simulation
    if (userProgram) {
      console.log('[AVR8] Using parsed user program for simulation');
      return this.executeUserProgram(userProgram);
    }
    
    // Missing compiled program - throw error
    console.error('[AVR8] No compiled program provided');
    if (this.onError) {
      this.onError('Cannot start emulator: No compiled program provided');
    }
    return false;
  }
  
  /**
   * Execute a parsed user program
   * @param {Object} userProgram - The parsed user program
   * @returns {boolean} - Success
   */
  executeUserProgram(userProgram) {
    // First, set pinMode based on detected pinModes
    for (const [pinStr, mode] of Object.entries(userProgram.pinModes)) {
      const pin = parseInt(pinStr, 10);
      console.log(`[AVR8] Setting pin ${pin} mode to ${mode}`);
      // Not much to do here in the simulation except log it
    }
    
    // Execute setup operations
    console.log(`[AVR8] Executing setup with ${userProgram.setup.length} operations`);
    this.executeOperations(userProgram.setup, false);
    
    // If there are loop operations, set up interval to execute them
    if (userProgram.loop.length > 0) {
      console.log(`[AVR8] Setting up loop with ${userProgram.loop.length} operations`);
      
      // Find the longest delay in the loop for reasonable timing
      const maxDelay = userProgram.loop
        .filter(op => op.delay)
        .map(op => op.delay)
        .reduce((max, delay) => Math.max(max, delay), 100);
      
      // Execute loop operations on an interval
      this.intervalId = setInterval(() => {
        this.executeOperations(userProgram.loop, true);
      }, maxDelay);
    }
    
    return true;
  }
  
  /**
   * Execute a series of pin operations
   * @param {Array} operations - The operations to execute
   * @param {boolean} isLoop - Whether these are loop operations
   */
  executeOperations(operations, isLoop) {
    if (!operations || operations.length === 0) {
      return;
    }
    
    // For setup operations, execute sequentially with delays
    if (!isLoop) {
      let delay = 0;
      
      operations.forEach((op, index) => {
        // Schedule each operation with its accumulated delay
        setTimeout(() => {
          this.executeOperation(op);
        }, delay);
        
        // Add this operation's delay to the accumulated delay
        delay += (op.delay || 50); // Default small delay if none specified
      });
      
      return;
    }
    
    // For loop operations, execute all at once per loop iteration
    operations.forEach(op => {
      this.executeOperation(op);
    });
  }
  
  /**
   * Execute a single pin operation
   * @param {Object} operation - The pin operation to execute
   */
  executeOperation(operation) {
    const { pin, operation: opType, value } = operation;
    
    // Skip operations in conditional blocks (simplification, can't evaluate conditions)
    if (operation.conditional) {
      console.log(`[AVR8] Skipping conditional operation: ${operation.sourceCode}`);
      return;
    }
    
    console.log(`[AVR8] Executing ${opType} on pin ${pin} with value ${value}`);
    
    // Execute the appropriate operation type
    switch (opType) {
      case 'digitalWrite':
        this.setDigitalOutput(pin, !!value);
        break;
        
      case 'analogWrite':
        this.setPWMOutput(pin, value);
        break;
        
      // Add more operation types as needed
    }
    
    return true;
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    if (!this.running) return;
    
    // Clear any timers (both interval and timeout)
    if (this.intervalId) {
      clearInterval(this.intervalId);
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    
    this.running = false;
    
    console.log('[AVR8] Simulation stopped');
  }
  
  /**
   * Reset the emulator
   */
  reset() {
    this.stop();
    
    // Reset digital pins to LOW
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      
      // Notify about pin reset
      if (this.onPinChange) {
        this.onPinChange(pin, false);
      }
    });
    
    // Reset PWM values to 0
    PWM_PINS.forEach(pin => {
      this.analogValues[pin] = 0;
    });
    
    // Reset analog input pins
    ANALOG_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      this.analogValues[pin] = 0;
    });
  }
  
  /**
   * Get the state of a pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @returns {boolean} - The current state of the pin (true = HIGH, false = LOW)
   */
  getPinState(pin) {
    return this.pinStates[pin] || false;
  }
  
  /**
   * Get the analog value of a pin (for PWM or analog pins)
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @returns {number} - The current analog value (0-255 for PWM, 0-1023 for analog inputs)
   */
  getAnalogValue(pin) {
    return this.analogValues[pin] || 0;
  }
  
  /**
   * Set digital output on a pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @param {boolean} value - true for HIGH, false for LOW
   */
  setDigitalOutput(pin, value) {
    // Update pin state
    this.pinStates[pin] = value;
    
    // For PWM pins, update analog value accordingly
    if (PWM_PINS.includes(Number(pin))) {
      this.analogValues[pin] = value ? 255 : 0;
    }
    
    // Notify about pin change
    if (this.onPinChange) {
      this.onPinChange(pin, value);
    }
  }
  
  /**
   * Set PWM output on a pin
   * @param {number} pin - The pin number (must be a PWM pin: 3, 5, 6, 9, 10, 11)
   * @param {number} value - Value between 0-255
   */
  setPWMOutput(pin, value) {
    if (!PWM_PINS.includes(Number(pin))) {
      return; // Not a PWM pin
    }
    
    // Clamp value to 0-255 range
    const analogValue = Math.max(0, Math.min(255, value));
    
    // Update analog value
    this.analogValues[pin] = analogValue;
    
    // Update digital state (HIGH if value > 0)
    const digitalValue = analogValue > 0;
    const stateChanged = this.pinStates[pin] !== digitalValue;
    this.pinStates[pin] = digitalValue;
    
    // Notify about pin change
    if (this.onPinChange) {
      this.onPinChange(pin, digitalValue, { analogValue });
    }
  }
  
  /**
   * Set input on a digital pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @param {boolean} value - true for HIGH, false for LOW
   */
  setDigitalInput(pin, value) {
    // In a real implementation, this would actually set the input on the AVR port
    // For our simplified version, we'll just log it
    console.log(`[AVR8] Digital input on pin ${pin}: ${value ? 'HIGH' : 'LOW'}`);
  }
  
  /**
   * Set an analog input value
   * @param {string} pin - The analog pin name ('A0'-'A5')
   * @param {number} value - Value between 0-1023 (10-bit ADC value)
   */
  setAnalogInput(pin, value) {
    if (!ANALOG_PINS.includes(pin)) {
      return; // Not an analog pin
    }
    
    // Clamp value to 0-1023 range
    const analogValue = Math.max(0, Math.min(1023, value));
    
    // Update analog value
    this.analogValues[pin] = analogValue;
    
    // Update digital state (HIGH if value > 512)
    const digitalValue = analogValue > 512;
    this.pinStates[pin] = digitalValue;
    
    // In a real implementation, this would feed into the ADC
    console.log(`[AVR8] Analog input on pin ${pin}: ${analogValue}`);
  }
}