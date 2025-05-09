/**
 * AVR8Emulator
 * 
 * This is the core emulator that uses avr8js to create a cycle-accurate
 * simulation of an Arduino board.
 */

import { 
  CPU, 
  AVRIOPort, 
  portBConfig, 
  portCConfig, 
  portDConfig,
  AVRSPI,
  AVRUSART,
  AVRTimer,
  timer0Config,
  timer1Config,
  timer2Config 
} from 'avr8js';

// Maps Arduino pins to AVR ports and bits
const PIN_MAPPING = {
  0: { port: 'D', bit: 0 },  // RXD
  1: { port: 'D', bit: 1 },  // TXD
  2: { port: 'D', bit: 2 },  // INT0
  3: { port: 'D', bit: 3 },  // INT1/OC2B (PWM)
  4: { port: 'D', bit: 4 },
  5: { port: 'D', bit: 5 },  // OC0B (PWM)
  6: { port: 'D', bit: 6 },  // OC0A (PWM)
  7: { port: 'D', bit: 7 },
  8: { port: 'B', bit: 0 },
  9: { port: 'B', bit: 1 },  // OC1A (PWM)
  10: { port: 'B', bit: 2 }, // SS/OC1B (PWM)
  11: { port: 'B', bit: 3 }, // MOSI/OC2A (PWM)
  12: { port: 'B', bit: 4 }, // MISO
  13: { port: 'B', bit: 5 }, // SCK - Also connected to the built-in LED
  'A0': { port: 'C', bit: 0 },
  'A1': { port: 'C', bit: 1 },
  'A2': { port: 'C', bit: 2 },
  'A3': { port: 'C', bit: 3 },
  'A4': { port: 'C', bit: 4 }, // SDA
  'A5': { port: 'C', bit: 5 }  // SCL
};

// Port register addresses in the AVR microcontroller
const PORT_ADDR = {
  'B': portBConfig,
  'C': portCConfig,
  'D': portDConfig
};

// Arduino clock speed (16 MHz)
const CLOCK_SPEED = 16e6;

/**
 * The AVR8Emulator class provides a clean interface to the avr8js library,
 * abstracting the details of the AVR microcontroller and providing
 * Arduino-compatible pin access.
 */
export class AVR8Emulator {
  constructor(options = {}) {
    this.onPinChange = options.onPinChange || null;
    this.onSerialByte = options.onSerialByte || null;
    this.onError = options.onError || null;

    // References to AVR components
    this.cpu = null;
    this.program = null;
    this.ports = {};
    this.timers = [];
    this.usart = null;
    this.spi = null;
    
    // Internal state
    this.running = false;
    this.animationFrameId = null;
    this.lastTime = 0;
    this.pinStates = {}; // Tracks current state of all pins
    
    // Performance tuning
    this.batchSize = options.batchSize || 500000; // Instructions per batch
  }

  /**
   * Load a compiled program (array of bytes) into the emulator
   * @param {Uint16Array} program - The compiled AVR program
   * @returns {boolean} - Whether loading was successful
   */
  loadProgram(program) {
    try {
      this.stop();
      this.program = program;
      
      // Initialize a new CPU with the program
      this.cpu = new CPU(this.program);
      
      // Initialize I/O ports
      this._initPorts();
      
      // Initialize peripherals
      this._initTimers();
      this._initUSART();
      this._initSPI();
      
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
   * Start the emulator
   */
  start() {
    if (!this.cpu || !this.program) {
      if (this.onError) {
        this.onError('Cannot start emulator: No program loaded');
      }
      return false;
    }
    
    if (this.running) return true; // Already running
    
    this.running = true;
    this.lastTime = performance.now();
    this._runCycle();
    return true;
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    if (!this.running) return;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.running = false;
  }
  
  /**
   * Reset the CPU and peripherals
   */
  reset() {
    if (!this.cpu) return;
    
    // Stop if running
    this.stop();
    
    // Reset CPU to initial state
    this.cpu.reset();
    
    // Reset pin states
    this.pinStates = {};
    
    // Reset peripherals
    if (this.usart) {
      // USART reset logic would go here if needed
    }
    
    // Re-initialize ports (to ensure correct pin states)
    this._initPorts();
    
    // Re-initialize timers
    this._initTimers();
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
   * Set input on a digital pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @param {boolean} value - true for HIGH, false for LOW
   */
  setDigitalInput(pin, value) {
    const mapping = PIN_MAPPING[pin];
    if (!mapping || !this.ports[mapping.port]) return;
    
    const port = this.ports[mapping.port];
    const bit = mapping.bit;
    
    // Set pin to input mode 
    // (clear the corresponding bit in DDR register)
    port.setDDRBit(bit, false);
    
    // Set the pin value in the PIN register
    // Note: Writing a 1 to PINx toggles the bit
    const currentValue = (port.PIN >> bit) & 1;
    if (currentValue !== (value ? 1 : 0)) {
      port.setPINBit(bit, true); // Toggle
    }
  }
  
  /**
   * Set an analog input value (for analog pins A0-A5)
   * Note: This would connect to the ADC in a complete implementation
   * @param {string} pin - The analog pin name ('A0'-'A5')
   * @param {number} value - Value between 0-1023 (10-bit ADC value)
   */
  setAnalogInput(pin, value) {
    // For now, we just map this to digital HIGH/LOW
    // A full implementation would connect to the AVR's ADC
    if (pin.startsWith('A') && PIN_MAPPING[pin]) {
      this.setDigitalInput(pin, value > 512);
    }
  }
  
  // PRIVATE METHODS
  
  /**
   * Initialize the I/O ports
   * @private
   */
  _initPorts() {
    // Create ports B, C, and D
    ['B', 'C', 'D'].forEach(portName => {
      const config = PORT_ADDR[portName];
      const port = new AVRIOPort(this.cpu, config);
      
      // Add listener for port changes
      port.addListener(() => {
        this._handlePortChange(portName, port);
      });
      
      this.ports[portName] = port;
    });
  }
  
  /**
   * Initialize timers
   * @private
   */
  _initTimers() {
    this.timers = [];
    // Timer 0 (8-bit) - Controls PWM on pins 5 & 6
    this.timers[0] = new AVRTimer(this.cpu, timer0Config);
    // Timer 1 (16-bit) - Controls PWM on pins 9 & 10
    this.timers[1] = new AVRTimer(this.cpu, timer1Config);
    // Timer 2 (8-bit) - Controls PWM on pins 3 & 11
    this.timers[2] = new AVRTimer(this.cpu, timer2Config);
  }
  
  /**
   * Initialize USART for serial communication
   * @private
   */
  _initUSART() {
    this.usart = new AVRUSART(this.cpu, {
      onByteTransmit: (value) => {
        // Convert byte to character
        const char = String.fromCharCode(value);
        
        // Call the serial byte callback if provided
        if (this.onSerialByte) {
          this.onSerialByte(value, char);
        }
      }
    });
  }
  
  /**
   * Initialize SPI
   * @private
   */
  _initSPI() {
    this.spi = new AVRSPI(this.cpu);
  }
  
  /**
   * Handle changes to port values (pin states)
   * @private
   */
  _handlePortChange(portName, port) {
    // Get the PORT value (output pins)
    const portValue = port.PORT;
    // Get the DDR value (data direction register - 1 for output, 0 for input)
    const ddrValue = port.DDR;
    
    // Check each pin that maps to this port
    Object.entries(PIN_MAPPING).forEach(([pin, mapping]) => {
      if (mapping.port === portName) {
        const { bit } = mapping;
        const mask = 1 << bit;
        
        // Check if this pin is configured as OUTPUT
        const isOutput = (ddrValue & mask) !== 0;
        
        // If it's an output pin, get its value
        if (isOutput) {
          const isHigh = (portValue & mask) !== 0;
          
          // If state has changed, notify
          if (this.pinStates[pin] !== isHigh) {
            // Update our cached state
            this.pinStates[pin] = isHigh;
            
            // Notify about pin change
            if (this.onPinChange) {
              this.onPinChange(pin, isHigh);
            }
          }
        }
      }
    });
  }
  
  /**
   * Run a cycle of the CPU emulation
   * @private
   */
  _runCycle() {
    if (!this.running || !this.cpu) return;
  
    try {
      // Get elapsed time
      const now = performance.now();
      const elapsed = now - this.lastTime;
      this.lastTime = now;
      
      // Calculate cycles based on clock speed and elapsed time
      // CLOCK_SPEED is in Hz, elapsed is in ms
      const cyclesPerMs = CLOCK_SPEED / 1000;
      const cycles = Math.floor(cyclesPerMs * elapsed);
      
      // Execute CPU cycles in batches to avoid blocking UI
      const batchSize = Math.min(cycles, this.batchSize);
      if (batchSize > 0) {
        this.cpu.execute(batchSize);
      }
      
      // Schedule next execution
      this.animationFrameId = requestAnimationFrame(() => this._runCycle());
    } catch (err) {
      this.stop();
      if (this.onError) {
        this.onError(`CPU execution error: ${err.message}`);
      } else {
        console.error('AVR8Emulator execution error:', err);
      }
    }
  }
}