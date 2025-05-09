/**
 * AVR8Emulator.js
 * 
 * A wrapper around the avr8js library that provides a higher-level interface
 * for simulating an Arduino microcontroller with proper instruction execution.
 */

import { CPU, AVRIOPort, AVRTimer, AVRUSART } from 'avr8js';

// Constants for the ATmega328P used in Arduino Uno
const AVR_FREQUENCY = 16000000; // 16 MHz
const MEMORY_SIZE = 32 * 1024; // 32KB for program memory
const SRAM_SIZE = 2 * 1024; // 2KB for SRAM

// Pin mappings for Arduino Uno (ATmega328P)
export const PIN_MAPPINGS = {
  // Digital pins
  0: { port: 'D', bit: 0 }, // RXD
  1: { port: 'D', bit: 1 }, // TXD
  2: { port: 'D', bit: 2 }, // INT0
  3: { port: 'D', bit: 3 }, // INT1/PWM
  4: { port: 'D', bit: 4 }, // XCK/T0
  5: { port: 'D', bit: 5 }, // T1/PWM
  6: { port: 'D', bit: 6 }, // AIN0/PWM
  7: { port: 'D', bit: 7 }, // AIN1
  8: { port: 'B', bit: 0 }, // ICP1/CLKO
  9: { port: 'B', bit: 1 }, // OC1A/PWM
  10: { port: 'B', bit: 2 }, // SS/OC1B/PWM
  11: { port: 'B', bit: 3 }, // MOSI/OC2A/PWM
  12: { port: 'B', bit: 4 }, // MISO
  13: { port: 'B', bit: 5 }, // SCK/LED
  
  // Analog pins (A0-A5)
  14: { port: 'C', bit: 0 }, // A0
  15: { port: 'C', bit: 1 }, // A1
  16: { port: 'C', bit: 2 }, // A2
  17: { port: 'C', bit: 3 }, // A3
  18: { port: 'C', bit: 4 }, // A4/SDA
  19: { port: 'C', bit: 5 }, // A5/SCL
  
  // Aliases for analog pins
  'A0': { port: 'C', bit: 0 },
  'A1': { port: 'C', bit: 1 },
  'A2': { port: 'C', bit: 2 },
  'A3': { port: 'C', bit: 3 },
  'A4': { port: 'C', bit: 4 },
  'A5': { port: 'C', bit: 5 },
};

// Port addresses for ATmega328P
const PORT_ADDRESSES = {
  'B': { data: 0x25, ddr: 0x24, pin: 0x23 }, // PORTB, DDRB, PINB
  'C': { data: 0x28, ddr: 0x27, pin: 0x26 }, // PORTC, DDRC, PINC
  'D': { data: 0x2B, ddr: 0x2A, pin: 0x29 }, // PORTD, DDRD, PIND
};

/**
 * AVR8Emulator Class
 * Provides a complete emulation of an Arduino UNO microcontroller
 */
export class AVR8Emulator {
  constructor() {
    this.running = false;
    this.cpu = null;
    this.program = null;
    this.programSize = 0;
    this.ports = {};
    this.timers = [];
    this.usart = null;
    this.spi = null;
    this.eventHandlers = {
      pinChange: [],
      serialData: [],
      log: []
    };
    this.lastExecutionTime = 0;
    this.animationFrameId = null;
    this.pins = {};
    this.debug = false;
    
    // Pre-initialize pin states
    Object.keys(PIN_MAPPINGS).forEach(pin => {
      if (!isNaN(parseInt(pin, 10)) || pin.startsWith('A')) {
        this.pins[pin] = { value: false, mode: 'INPUT', analogValue: 0 };
      }
    });
  }
  
  /**
   * Load a compiled program into the emulator
   * @param {Uint16Array} program - The compiled AVR program
   * @returns {boolean} - Success status
   */
  loadProgram(program) {
    if (!program || !(program instanceof Uint16Array)) {
      this.log('Error: Invalid program format');
      return false;
    }
    
    this.log(`Loading program (${program.length} words)`);
    this.program = program;
    this.programSize = program.length * 2; // Size in bytes
    
    // Reset and initialize CPU with new program
    this.reset();
    return true;
  }
  
  /**
   * Initialize the microcontroller with the loaded program
   * @returns {boolean} - Success status
   */
  initialize() {
    if (!this.program) {
      this.log('Error: No program loaded');
      return false;
    }
    
    try {
      this.log('Initializing AVR microcontroller');
      
      // Create memory for the CPU
      const progMem = new Uint16Array(MEMORY_SIZE / 2);
      
      // Copy the program into program memory
      progMem.set(this.program);
      
      // Create CPU
      this.cpu = new CPU(progMem);
      
      // Initialize I/O ports (B, C, D)
      this.initPorts();
      
      // Initialize timers
      this.initTimers();
      
      // Initialize serial port
      this.initSerial();
      
      this.log('AVR microcontroller initialized successfully');
      return true;
    } catch (error) {
      this.log(`Error initializing emulator: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Initialize the microcontroller I/O ports
   */
  initPorts() {
    this.ports = {};
    
    // Create ports for ATmega328P (B, C, D)
    Object.entries(PORT_ADDRESSES).forEach(([portName, addr]) => {
      // Create the port
      const port = new AVRIOPort(this.cpu, addr.data, addr.ddr, addr.pin);
      this.ports[portName] = port;
      
      // Add a listener for port changes
      port.addPortListener(() => this.handlePortChange(portName));
    });
  }
  
  /**
   * Initialize timers for PWM capability
   */
  initTimers() {
    this.timers = [];
    
    // Timer 0 (8-bit) - Controls pins 5 & 6
    this.timers[0] = new AVRTimer(this.cpu, 0);
    
    // Timer 1 (16-bit) - Controls pins 9 & 10
    this.timers[1] = new AVRTimer(this.cpu, 1);
    
    // Timer 2 (8-bit) - Controls pins 3 & 11
    this.timers[2] = new AVRTimer(this.cpu, 2);
  }
  
  /**
   * Initialize USART for serial communication
   */
  initSerial() {
    this.usart = new AVRUSART(this.cpu, {
      onByte: this.handleSerialByte.bind(this)
    });
  }
  
  /**
   * Handle serial data from the emulator
   * @param {number} value - The byte received from serial
   */
  handleSerialByte(value) {
    const char = String.fromCharCode(value);
    
    // Notify all serial data event handlers
    this.eventHandlers.serialData.forEach(handler => {
      handler(value, char);
    });
  }
  
  /**
   * Handle changes in port values
   * @param {string} portName - The port that changed (B, C, D)
   */
  handlePortChange(portName) {
    const port = this.ports[portName];
    if (!port) return;
    
    // Get port values
    const portValue = port.PORT; // Output register
    const ddrValue = port.DDR;   // Data Direction Register (1=output, 0=input)
    
    // Find Arduino pins associated with this port
    Object.entries(PIN_MAPPINGS).forEach(([pin, mapping]) => {
      if (mapping.port === portName) {
        const { bit } = mapping;
        const mask = 1 << bit;
        
        // Check if pin is configured as OUTPUT
        const isOutput = (ddrValue & mask) !== 0;
        
        if (isOutput) {
          // Get the pin value (HIGH or LOW)
          const isHigh = (portValue & mask) !== 0;
          
          // Update our pin state cache
          const pinKey = pin;
          const prevValue = this.pins[pinKey]?.value;
          
          // Only notify if value changed
          if (prevValue !== isHigh) {
            this.pins[pinKey] = {
              ...this.pins[pinKey],
              value: isHigh,
              mode: 'OUTPUT'
            };
            
            // Notify all pin change event handlers
            this.eventHandlers.pinChange.forEach(handler => {
              handler(pin, isHigh);
            });
            
            if (this.debug) {
              this.log(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            }
          }
        }
      }
    });
  }
  
  /**
   * Start the emulator
   * @returns {boolean} - Success status
   */
  start() {
    if (this.running) return true;
    
    if (!this.cpu) {
      const initialized = this.initialize();
      if (!initialized) return false;
    }
    
    this.log('Starting AVR emulator');
    this.running = true;
    this.lastExecutionTime = performance.now();
    
    // Start the execution loop
    this.executionLoop();
    return true;
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    this.log('Stopping AVR emulator');
    this.running = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Reset the emulator to initial state
   */
  reset() {
    this.log('Resetting AVR emulator');
    
    // Stop first if running
    if (this.running) {
      this.stop();
    }
    
    // Clear CPU and peripherals
    this.cpu = null;
    this.ports = {};
    this.timers = [];
    this.usart = null;
    this.spi = null;
    
    // Reset pin states
    Object.keys(this.pins).forEach(pin => {
      this.pins[pin] = { value: false, mode: 'INPUT', analogValue: 0 };
    });
    
    // Initialize again with the current program
    this.initialize();
  }
  
  /**
   * Main execution loop for the CPU
   */
  executionLoop() {
    if (!this.running || !this.cpu) return;
    
    const currentTime = performance.now();
    const elapsedTime = currentTime - this.lastExecutionTime;
    this.lastExecutionTime = currentTime;
    
    // Calculate cycles to execute based on elapsed time and CPU frequency
    const cycles = Math.floor((AVR_FREQUENCY * elapsedTime) / 1000);
    
    // Execute in smaller batches to prevent blocking the UI
    const batchSize = 10000; // Instructions per batch
    let remainingCycles = cycles;
    
    try {
      while (remainingCycles > 0 && this.running) {
        const cyclesToExecute = Math.min(remainingCycles, batchSize);
        this.cpu.execute(cyclesToExecute);
        remainingCycles -= cyclesToExecute;
        
        // Allow UI updates between batches if we have a lot to process
        if (remainingCycles > 0) {
          setTimeout(() => this.executionLoop(), 0);
          return;
        }
      }
      
      // Schedule next frame if still running
      if (this.running) {
        this.animationFrameId = requestAnimationFrame(() => this.executionLoop());
      }
    } catch (error) {
      this.log(`CPU execution error: ${error.message}`);
      this.stop();
    }
  }
  
  /**
   * Set an input pin value (for buttons, sensors, etc.)
   * @param {string|number} pin - The pin number or name (e.g., 'A0')
   * @param {boolean|number} value - The value to set (digital or analog)
   * @param {boolean} isAnalog - Whether this is an analog value
   */
  setInputPinValue(pin, value, isAnalog = false) {
    const pinInfo = PIN_MAPPINGS[pin];
    if (!pinInfo) {
      this.log(`Error: Invalid pin ${pin}`);
      return false;
    }
    
    // Get the port and bit
    const { port: portName, bit } = pinInfo;
    const port = this.ports[portName];
    
    if (!port) {
      this.log(`Error: Port ${portName} not initialized`);
      return false;
    }
    
    if (isAnalog) {
      // For analog input (future implementation)
      // TODO: Implement ADC simulation
      this.pins[pin] = {
        ...this.pins[pin],
        analogValue: value,
        mode: 'INPUT'
      };
      
      this.log(`Set analog pin ${pin} to ${value}`);
    } else {
      // For digital input
      const mask = 1 << bit;
      
      // First make sure the pin is set as INPUT in the DDR
      // This is just a safety check - the Arduino code should set this
      if ((port.DDR & mask) !== 0) {
        this.log(`Warning: Pin ${pin} is configured as OUTPUT but trying to use as INPUT`);
      }
      
      // Set the PIN register value - this simulates an external signal
      if (value) {
        // Set the bit (HIGH)
        port.PIN = port.PIN | mask;
      } else {
        // Clear the bit (LOW)
        port.PIN = port.PIN & ~mask;
      }
      
      // Update our pin state cache
      this.pins[pin] = {
        ...this.pins[pin],
        value: !!value,
        mode: 'INPUT'
      };
      
      this.log(`Set digital pin ${pin} to ${value ? 'HIGH' : 'LOW'}`);
    }
    
    return true;
  }
  
  /**
   * Get the current value of a pin
   * @param {string|number} pin - The pin number or name
   * @returns {object} - The pin state object
   */
  getPinValue(pin) {
    return this.pins[pin] || { value: false, mode: 'UNKNOWN', analogValue: 0 };
  }
  
  /**
   * Register an event handler for pin changes
   * @param {function} handler - The event handler function
   */
  onPinChange(handler) {
    if (typeof handler === 'function') {
      this.eventHandlers.pinChange.push(handler);
    }
  }
  
  /**
   * Register an event handler for serial data
   * @param {function} handler - The event handler function
   */
  onSerialData(handler) {
    if (typeof handler === 'function') {
      this.eventHandlers.serialData.push(handler);
    }
  }
  
  /**
   * Register an event handler for log messages
   * @param {function} handler - The event handler function
   */
  onLog(handler) {
    if (typeof handler === 'function') {
      this.eventHandlers.log.push(handler);
    }
  }
  
  /**
   * Log a message from the emulator
   * @param {string} message - The message to log
   */
  log(message) {
    console.log(`[AVR8] ${message}`);
    
    // Notify all log event handlers
    this.eventHandlers.log.forEach(handler => {
      handler(message);
    });
  }
  
  /**
   * Clean up resources used by the emulator
   */
  cleanup() {
    this.stop();
    this.cpu = null;
    this.program = null;
    this.ports = {};
    this.timers = [];
    this.usart = null;
    this.eventHandlers = {
      pinChange: [],
      serialData: [],
      log: []
    };
  }
}

export default AVR8Emulator;