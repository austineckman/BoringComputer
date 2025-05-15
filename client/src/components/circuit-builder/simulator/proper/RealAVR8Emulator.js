/**
 * RealAVR8Emulator.js
 * 
 * This is the wrapper around our RealAVR8Core that provides the API needed
 * by the circuit simulator. It handles loading programs, pin changes, etc.
 */

import { RealAVR8Core } from './RealAVR8Core';
import { compileArduino, detectPinsUsed, parseDelays } from './ArduinoCompilerService';

// List of Arduino digital pins
const DIGITAL_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// List of Arduino PWM pins
const PWM_PINS = [3, 5, 6, 9, 10, 11];

// List of Arduino analog pins
const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

/**
 * The RealAVR8Emulator class provides the interface between the circuit simulator
 * and the AVR8 emulator core.
 */
export class RealAVR8Emulator {
  constructor(options = {}) {
    this.onPinChange = options.onPinChange || null;
    this.onSerialByte = options.onSerialByte || null;
    this.onError = options.onError || null;
    this.onLogMessage = options.onLogMessage || null;
    
    // Configure core emulator callbacks
    const coreOptions = {
      onPinChange: this.handlePinChange.bind(this),
      onSerialByte: this.handleSerialByte.bind(this),
      onError: this.handleError.bind(this),
      onLogMessage: this.handleLogMessage.bind(this)
    };
    
    // Create the core emulator
    this.core = new RealAVR8Core(coreOptions);
    
    // Internal state
    this.running = false;
    this.program = null;
    this.pinsInUse = [];
    this.pinStates = this.core.pinStates;
    this.analogValues = this.core.analogValues;
    
    this.log('RealAVR8Emulator initialized');
  }
  
  /**
   * Load Arduino code into the emulator
   * @param {string} code - The Arduino code
   */
  async loadCode(code) {
    try {
      this.log('Loading Arduino code...');
      
      // Stop any running emulation
      this.stop();
      
      // Compile the Arduino code
      const compileResult = await compileArduino(code);
      
      if (!compileResult.success) {
        throw new Error(`Compilation failed: ${compileResult.error}`);
      }
      
      // Extract pins used from the code
      this.pinsInUse = compileResult.metadata.pinsUsed;
      
      // Store the program
      this.program = compileResult.program;
      
      // Load the program into the core emulator
      const loadResult = this.core.loadProgram(this.program, this.pinsInUse);
      
      if (!loadResult) {
        throw new Error('Failed to load program into emulator core');
      }
      
      this.log(`Program loaded successfully (${this.program.length} words)`);
      this.log(`Detected pins: ${this.pinsInUse.join(', ')}`);
      
      return {
        success: true,
        pinsUsed: this.pinsInUse
      };
      
    } catch (error) {
      this.handleError(`Failed to load code: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Handle pin state changes from the core emulator
   * @param {number|string} pin - The pin number or name
   * @param {boolean} isHigh - Whether the pin is HIGH or LOW
   * @param {Object} options - Additional options (like analogValue)
   */
  handlePinChange(pin, isHigh, options = {}) {
    // Update our local state
    this.pinStates[pin] = isHigh;
    
    if (options.analogValue !== undefined) {
      this.analogValues[pin] = options.analogValue;
    }
    
    // Notify the circuit simulator
    if (this.onPinChange) {
      this.onPinChange(pin, isHigh, options);
    }
  }
  
  /**
   * Handle serial data from the emulator
   * @param {number} value - The byte value
   * @param {string} char - The character representation
   */
  handleSerialByte(value, char) {
    if (this.onSerialByte) {
      this.onSerialByte(value, char);
    }
  }
  
  /**
   * Handle errors from the emulator
   * @param {string} message - The error message
   */
  handleError(message) {
    console.error(`[RealAVR8] Error: ${message}`);
    
    if (this.onError) {
      this.onError(message);
    }
  }
  
  /**
   * Handle log messages from the emulator
   * @param {string} message - The log message
   */
  handleLogMessage(message) {
    this.log(message);
  }
  
  /**
   * Log a message
   * @param {string} message - The message to log
   */
  log(message) {
    console.log(`[RealAVR8] ${message}`);
    
    if (this.onLogMessage) {
      this.onLogMessage(message);
    }
  }
  
  /**
   * Start the emulator
   */
  start() {
    if (this.running) {
      this.log('Emulator already running');
      return;
    }
    
    if (!this.program) {
      this.handleError('No program loaded');
      return;
    }
    
    try {
      this.running = true;
      this.log('Starting emulation...');
      
      // Start the core emulator
      this.core.start();
      
      this.log('✅ Emulation started successfully');
    } catch (error) {
      this.handleError(`Failed to start emulator: ${error.message}`);
      this.running = false;
    }
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    if (!this.running) {
      return;
    }
    
    try {
      // Stop the core emulator
      this.core.stop();
      
      this.running = false;
      this.log('Emulation stopped');
    } catch (error) {
      this.handleError(`Failed to stop emulator: ${error.message}`);
    }
  }
  
  /**
   * Reset the emulator
   */
  reset() {
    try {
      // Stop if running
      if (this.running) {
        this.stop();
      }
      
      // Reset the core
      this.core.reset();
      
      this.log('Emulator reset complete');
    } catch (error) {
      this.handleError(`Failed to reset emulator: ${error.message}`);
    }
  }
  
  /**
   * Set a digital input pin state
   * @param {number|string} pin - The pin number
   * @param {boolean} isHigh - Whether to set the pin HIGH or LOW
   */
  setDigitalInput(pin, isHigh) {
    try {
      this.core.setDigitalInput(pin, isHigh);
      this.log(`Set digital input pin ${pin} to ${isHigh ? 'HIGH' : 'LOW'}`);
    } catch (error) {
      this.handleError(`Failed to set digital input: ${error.message}`);
    }
  }
  
  /**
   * Set an analog input value
   * @param {string} pin - The analog pin (A0-A5)
   * @param {number} value - The analog value (0-1023)
   */
  setAnalogInput(pin, value) {
    try {
      this.core.setAnalogInput(pin, value);
      this.log(`Set analog input ${pin} to ${value}`);
    } catch (error) {
      this.handleError(`Failed to set analog input: ${error.message}`);
    }
  }
  
  /**
   * Analyze Arduino code to detect used pins
   * @param {string} code - The Arduino code
   * @returns {number[]} The pins used in the code
   */
  static detectPinsUsed(code) {
    return detectPinsUsed(code);
  }
  
  /**
   * Parse delay values from Arduino code
   * @param {string} code - The Arduino code
   * @returns {number[]} The delay values in milliseconds
   */
  static parseDelays(code) {
    return parseDelays(code);
  }
}