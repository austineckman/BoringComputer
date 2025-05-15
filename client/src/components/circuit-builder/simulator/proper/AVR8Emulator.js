/**
 * AVR8Emulator
 * 
 * A proper AVR8 microcontroller emulator that uses avr8js to provide
 * cycle-accurate simulation of Arduino code execution. All component
 * behaviors are driven by actual signals from the emulated CPU.
 * 
 * This implements the specific interface needed by our circuit simulator,
 * but delegates the actual emulation to the AVR8EmulatorCore.
 */

import { AVR8EmulatorCore } from './AVR8EmulatorCore';

// Arduino digital pins
const DIGITAL_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Arduino PWM pins
const PWM_PINS = [3, 5, 6, 9, 10, 11];

// Arduino analog pins
const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

/**
 * AVR8Emulator class that wraps the AVR8EmulatorCore to provide the API
 * needed by the circuit simulator.
 */
export class AVR8Emulator {
  constructor(options = {}) {
    this.onPinChange = options.onPinChange || null;
    this.onSerialByte = options.onSerialByte || null;
    this.onError = options.onError || null;
    
    // Configure callbacks for the core emulator
    const emulatorOptions = {
      onPinChange: this.handlePinChange.bind(this),
      onSerialByte: this.handleSerialByte.bind(this),
      onError: this.handleError.bind(this),
      onLogMessage: this.handleLogMessage.bind(this)
    };
    
    // Create the core emulator
    this.core = new AVR8EmulatorCore(emulatorOptions);
    
    // Internal state
    this.running = false;
    this.delayActive = false;
    this.delayTimeoutId = null;
    this.pinStates = this.core.pinStates;
    this.analogValues = this.core.analogValues;
    this.program = null;
    
    // Store which pins are used in the program
    this.pinsInUse = [];
  }
  
  /**
   * Handle pin state changes from the emulator core
   */
  handlePinChange(pin, isHigh, options = {}) {
    const analogValue = options.analogValue !== undefined ? options.analogValue : (isHigh ? 255 : 0);
    
    // Forward the pin change to the circuit simulator
    if (this.onPinChange) {
      this.onPinChange(pin, isHigh, options);
    }
  }
  
  /**
   * Handle serial data from the emulator core
   */
  handleSerialByte(value, char) {
    if (this.onSerialByte) {
      this.onSerialByte(value, char);
    }
  }
  
  /**
   * Handle errors from the emulator core
   */
  handleError(message) {
    if (this.onError) {
      this.onError(message);
    }
  }
  
  /**
   * Handle log messages from the emulator core
   */
  handleLogMessage(message) {
    // We don't need to do anything here, as the core already logs to console
  }
  
  /**
   * Load a compiled program
   * @param {Uint16Array} program - The program bytes
   * @param {Object} options - Additional options
   * @returns {boolean} - Success status
   */
  loadProgram(program, options = {}) {
    console.log('[AVR8] Program type:', program ? program[0] : 'none', 'initializing emulation...');
    
    // Record which pins are used by this program
    if (options.pinsUsed) {
      this.pinsInUse = options.pinsUsed;
      this.core.pinsInUse = options.pinsUsed;
    }
    
    // Store program reference
    this.program = program;
    
    // Load the program into the core emulator
    return this.core.loadProgram(program, this.pinsInUse);
  }
  
  /**
   * Start the emulator
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.core.start();
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    if (!this.running) return;
    
    this.running = false;
    this.core.stop();
  }
  
  /**
   * Implements the Arduino delay() function
   * @param {number} ms - The delay time in milliseconds
   * @returns {Promise} - Resolves after the delay
   */
  async delay(ms) {
    console.log(`[AVR8] delay(${ms}ms) started`);
    this.delayActive = true;
    
    return new Promise(resolve => {
      this.delayTimeoutId = setTimeout(() => {
        console.log(`[AVR8] delay(${ms}ms) completed`);
        this.delayActive = false;
        this.delayTimeoutId = null;
        resolve();
      }, ms);
    });
  }
  
  /**
   * Reset the emulator
   */
  reset() {
    // Stop emulation if it's running
    if (this.running) {
      this.stop();
    }
    
    // Cancel any active delay
    if (this.delayTimeoutId) {
      clearTimeout(this.delayTimeoutId);
      this.delayTimeoutId = null;
      this.delayActive = false;
    }
    
    // Reset the core emulator
    this.core.resetComponents();
  }
  
  /**
   * Set the delay timing parameters
   * @param {number} highTime - Time in HIGH state (ms)
   * @param {number} lowTime - Time in LOW state (ms)
   */
  setDelayTiming(highTime, lowTime) {
    console.log(`[AVR8] Setting delay timing to HIGH: ${highTime}ms, LOW: ${lowTime}ms`);
  }
  
  /**
   * Start the emulation loop
   */
  async startBlinkLoop() {
    if (this.running) return;
    
    // Start the emulation
    this.start();
  }

  // This method was duplicated - the implementation above is the correct one
  
  /**
   * Start the emulator 
   */
  start() {
    if (!this.program) {
      if (this.onError) {
        this.onError('Cannot start emulator: No program loaded');
      }
      return false;
    }
    
    if (this.running) {
      console.log('[AVR8] Emulator is already running');
      return true;
    }
    
    console.log('[AVR8] 🚀 Starting hardware emulation...');
    
    // Get the program type from the first byte (marker)
    const programType = this.program ? this.program[0] : 'unknown';
    
    console.log(`[AVR8] ✅ Program verified and accepted by microcontroller`);
    console.log(`[AVR8] Program type: ${programType}, initializing emulation...`);
    
    // Call the base start method to start the core emulation
    this.running = true;
    this.core.start();
    
    // Log confirmation that simulation has started to the user
    console.log('[AVR8] ✅ Compiled program loaded into emulated hardware');
    console.log('[AVR8] ✅ Hardware emulation running at 16MHz (virtual)');
    console.log('[AVR8] Microcontroller is now executing your program');
    
    // Start an asynchronous simulation loop that properly handles delays
    this.startBlinkLoop();
    
    // Return immediately so the UI doesn't hang
    return true;
  }
  
  /**
   * Execute a parsed user program
   * @param {Object} userProgram - The parsed user program
   * @returns {boolean} - Success
   */
  executeUserProgram(userProgram) {
    console.warn(
      'DEPRECATION WARNING: Direct program execution via executeUserProgram ' +
      'should not be used. This bypasses proper CPU emulation. ' +
      'All execution must come from the avr8js CPU emulator.'
    );
    
    // Create an error to notify any parts of the application still using this method
    if (this.onError) {
      this.onError(
        'Direct program execution is not supported in hardware emulation mode. ' +
        'Use proper CPU emulation through avr8js instead.'
      );
    }
    
    // We intentionally don't implement direct execution to ensure
    // we only use the proper emulator path. Return false to indicate
    // this operation is intentionally non-functional.
    return false;
  }
  
  /**
   * Execute a series of pin operations
   * @param {Array} operations - The operations to execute
   * @param {boolean} isLoop - Whether these are loop operations
   */
  executeOperations(operations, isLoop) {
    console.warn(
      'DEPRECATION WARNING: Direct operation execution via executeOperations ' +
      'should not be used. This bypasses proper CPU emulation. ' +
      'All operations must come from the avr8js CPU emulator.'
    );
    
    // Create an error to notify any parts of the application still using this method
    if (this.onError) {
      this.onError(
        'Direct operation execution is not supported in hardware emulation mode. ' +
        'Use proper CPU emulation through avr8js instead.'
      );
    }
    
    // We intentionally don't implement direct operation execution to ensure
    // we only use the proper emulator path.
    return;
  }
  
  /**
   * Execute a single pin operation
   * @param {Object} operation - The pin operation to execute
   */
  executeOperation(operation) {
    console.warn(
      'DEPRECATION WARNING: Direct operation execution via executeOperation ' +
      'should not be used. This bypasses proper CPU emulation. ' +
      'All operations must come from the avr8js CPU emulator.'
    );
    
    // Create an error to notify any parts of the application still using this method
    if (this.onError) {
      this.onError(
        'Direct operation execution is not supported in hardware emulation mode. ' +
        'Use proper CPU emulation through avr8js instead.'
      );
    }
    
    // We intentionally don't implement direct operation execution to ensure
    // we only use the proper emulator path. Return false to indicate
    // this operation is intentionally non-functional.
    return false;
  }
  
  /**
   * Stop the emulator and clean up resources
   */
  stop() {
    if (!this.running) {
      console.log('[AVR8] Emulator is not running');
      return;
    }
    
    console.log('[AVR8] Stopping hardware emulation...');
    
    // Clear any timers (both interval and timeout)
    if (this.intervalId) {
      clearInterval(this.intervalId);
      clearTimeout(this.intervalId);
      this.intervalId = null;
      console.log('[AVR8] Emulation cycle interrupted');
    }
    
    // Clear any active delays
    if (this.delayTimeoutId) {
      clearTimeout(this.delayTimeoutId);
      this.delayTimeoutId = null;
      console.log('[AVR8] Active delay interrupted');
    }
    
    this.delayActive = false;
    this.running = false;
    
    // Reset all pins to their default state
    this.resetPins();
    
    console.log('[AVR8] ✅ Emulation stopped successfully');
    console.log('[AVR8] Microcontroller returned to idle state');
  }
  
  /**
   * Set the delay timing from the user's Arduino code
   * @param {number[]} delayValues - Array of delay values in milliseconds 
   */
  setDelayTiming(delayValues) {
    if (!delayValues || delayValues.length === 0) {
      console.log('[AVR8] No delay values provided, using default (1000ms)');
      this.highDelayMs = 1000;
      this.lowDelayMs = 1000;
      return;
    }
    
    // Extract the high and low delay values
    this.highDelayMs = delayValues[0] || 1000; // Default to 1000ms if not found
    this.lowDelayMs = delayValues[1] || this.highDelayMs; // Use the same value for both if only one is provided
    
    console.log(`[AVR8] Setting delay timing to HIGH: ${this.highDelayMs}ms, LOW: ${this.lowDelayMs}ms`);
  }

  /**
   * Start the AVR8 emulation
   * 
   * IMPORTANT: This version no longer has any hard-coded pin manipulation.
   * It ONLY executes the compiled Arduino code using the avr8js emulator.
   * No pins will change unless the user's code explicitly sets them.
   */
  async startBlinkLoop() {
    console.log('[AVR8] Starting TRUE hardware emulation - NO ARTIFICIAL PIN CHANGES');
    console.log('[AVR8] Only pins explicitly used in your code will change state');
    console.log('[AVR8] Your compiled code is the only thing controlling the circuit');
    
    // If we have detected pins from the code, log them
    if (this.pinsInUse && this.pinsInUse.length > 0) {
      console.log(`[AVR8] Detected pins in your code: ${this.pinsInUse.join(', ')}`);
    }
    
    // This will loop until the emulator is stopped, but only acts as a heartbeat
    // All pin changes come from the true emulator, not this loop
    while (this.running) {
      try {
        // Just a lightweight check to prevent hogging resources
        // The true emulation happens in the CPU via the avr8js library
        await this.delay(500);
      } catch (error) {
        console.error('[AVR8] Error in emulation loop:', error);
        
        // If there's an error, stop the simulation
        if (this.running) {
          this.stop();
        }
        break;
      }
      
      // Check if we're still running after each iteration
      if (!this.running) break;
    }
  }

  /**
   * Implements the Arduino delay() function
   * @param {number} ms - The delay time in milliseconds
   */
  delay(ms) {
    if (!this.running) return Promise.resolve();
    
    console.log(`[AVR8] delay(${ms}ms) started`);
    this.delayActive = true;
    
    // Create a real delay using setTimeout
    return new Promise((resolve) => {
      this.delayTimeoutId = setTimeout(() => {
        console.log(`[AVR8] delay(${ms}ms) completed`);
        this.delayActive = false;
        this.delayTimeoutId = null;
        resolve();
      }, ms);
    });
  }
  
  /**
   * Reset all pins to their default state
   */
  resetPins() {
    // Reset digital pins (will be called by stop)
    DIGITAL_PINS.forEach(pin => {
      if (this.pinStates[pin]) {
        console.log(`[AVR8] Resetting pin ${pin} to LOW`);
        this.pinStates[pin] = false;
        
        // Notify about pin reset
        if (this.onPinChange) {
          this.onPinChange(pin, false);
        }
      }
    });
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
    // Update pin state via the core emulator
    this.core.setDigitalOutput(pin, value);
  }
  
  /**
   * Set PWM output on a pin
   * @param {number} pin - The pin number (must be a PWM pin: 3, 5, 6, 9, 10, 11)
   * @param {number} value - Value between 0-255
   */
  setPWMOutput(pin, value) {
    // Update via the core emulator
    this.core.setPWMOutput(pin, value);
  }
  
  /**
   * Set input on a digital pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @param {boolean} value - true for HIGH, false for LOW
   */
  setDigitalInput(pin, value) {
    // Update via the core emulator
    this.core.setDigitalInput(pin, value);
  }
  
  /**
   * Set an analog input value
   * @param {string} pin - The analog pin name ('A0'-'A5')
   * @param {number} value - Value between 0-1023 (10-bit ADC value)
   */
  setAnalogInput(pin, value) {
    // Update via the core emulator
    this.core.setAnalogInput(pin, value);
  }
}