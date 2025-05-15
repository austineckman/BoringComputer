/**
 * RealAVR8Core.js
 * 
 * A proper implementation of the AVR8 emulator using the avr8js library.
 * This provides a true, cycle-accurate emulation of the ATmega328P microcontroller.
 */

import { 
  CPU, 
  AVRIOPort,
  AVRTimer,
  AVRUSART,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  usart0Config
} from 'avr8js';

// ATmega328P memory sizes
const FLASH_SIZE = 32 * 1024; // 32KB program memory
const SRAM_SIZE = 2 * 1024;   // 2KB SRAM
const EEPROM_SIZE = 1 * 1024; // 1KB EEPROM

// Map Arduino pins to ATmega328P ports and bits
const PIN_TO_PORT_BIT = {
  0: { port: 'D', bit: 0 }, // RX
  1: { port: 'D', bit: 1 }, // TX
  2: { port: 'D', bit: 2 }, // D2
  3: { port: 'D', bit: 3 }, // D3 (PWM)
  4: { port: 'D', bit: 4 }, // D4
  5: { port: 'D', bit: 5 }, // D5 (PWM)
  6: { port: 'D', bit: 6 }, // D6 (PWM)
  7: { port: 'D', bit: 7 }, // D7
  8: { port: 'B', bit: 0 }, // B0
  9: { port: 'B', bit: 1 }, // B1 (PWM)
  10: { port: 'B', bit: 2 }, // B2 (PWM)
  11: { port: 'B', bit: 3 }, // B3 (PWM)
  12: { port: 'B', bit: 4 }, // B4
  13: { port: 'B', bit: 5 }, // B5
  'A0': { port: 'C', bit: 0 }, // ADC0
  'A1': { port: 'C', bit: 1 }, // ADC1
  'A2': { port: 'C', bit: 2 }, // ADC2
  'A3': { port: 'C', bit: 3 }, // ADC3
  'A4': { port: 'C', bit: 4 }, // ADC4/SDA
  'A5': { port: 'C', bit: 5 }  // ADC5/SCL
};

// List of Arduino digital pins
const DIGITAL_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// List of Arduino PWM pins
const PWM_PINS = [3, 5, 6, 9, 10, 11];

// List of Arduino analog pins
const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

// Frequency of the ATmega328P (Arduino UNO) in Hz
const CPU_FREQUENCY = 16000000;

/**
 * The RealAVR8Core class provides a proper emulation of the ATmega328P microcontroller.
 */
export class RealAVR8Core {
  constructor(options = {}) {
    this.options = options;
    
    // Set up callbacks
    this.onPinChange = options.onPinChange || null;
    this.onSerialByte = options.onSerialByte || null;
    this.onError = options.onError || null;
    this.onLogMessage = options.onLogMessage || null;
    
    // Internal state
    this.running = false;
    this.cycleInterval = null;
    this.pinStates = {};
    this.analogValues = {};
    
    // Create memory buffers
    this.createMemory();
    
    // Initialize pin states
    this.initializePins();
    
    // Create CPU and peripherals
    this.initializePeripherals();
    
    // Track previous port values to detect changes
    this.prevPortB = 0;
    this.prevPortC = 0;
    this.prevPortD = 0;
    
    // Store pins used in the program for debugging
    this.pinsInUse = [];
    
    this.log('RealAVR8Core initialized - true cycle-accurate emulation');
  }
  
  /**
   * Create memory buffers for the microcontroller
   */
  createMemory() {
    // Program memory (Flash)
    this.progMem = new Uint16Array(FLASH_SIZE / 2); // 16-bit words
    
    // Data memory (SRAM)
    this.dataMem = new Uint8Array(SRAM_SIZE);
    
    // EEPROM memory
    this.eeprom = new Uint8Array(EEPROM_SIZE);
    
    this.log(`Memory initialized: Flash=${FLASH_SIZE}B, SRAM=${SRAM_SIZE}B, EEPROM=${EEPROM_SIZE}B`);
  }
  
  /**
   * Initialize pin states
   */
  initializePins() {
    // Initialize digital pins
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false;
    });
    
    // Initialize analog pins
    ANALOG_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      this.analogValues[pin] = 0;
    });
    
    // Initialize PWM values
    PWM_PINS.forEach(pin => {
      this.analogValues[pin] = 0;
    });
    
    this.log('All pins initialized to default state');
  }
  
  /**
   * Initialize CPU and peripheral components
   */
  initializePeripherals() {
    try {
      // Create CPU with program memory
      this.cpu = new CPU(this.progMem);
      
      // Create I/O ports
      this.portB = new AVRIOPort(this.cpu, portBConfig);
      this.portC = new AVRIOPort(this.cpu, portCConfig);
      this.portD = new AVRIOPort(this.cpu, portDConfig);
      
      // Create timers
      this.timer0 = new AVRTimer(this.cpu, timer0Config);
      this.timer1 = new AVRTimer(this.cpu, timer1Config);
      this.timer2 = new AVRTimer(this.cpu, timer2Config);
      
      // Create USART for serial communication
      this.usart = new AVRUSART(this.cpu, usart0Config, this.handleSerialByte.bind(this));
      
      // Set up port change listeners
      this.setupPortListeners();
      
      this.log('CPU and peripherals initialized successfully');
    } catch (error) {
      this.handleError(`Failed to initialize CPU and peripherals: ${error.message}`);
    }
  }
  
  /**
   * Set up listeners for port changes
   */
  setupPortListeners() {
    try {
      // Check which listener API is available in avr8js
      if (typeof this.portB.addEventListener === 'function') {
        // New API style
        this.portB.addEventListener('portRegisterChange', this.handlePortBChange.bind(this));
        this.portC.addEventListener('portRegisterChange', this.handlePortCChange.bind(this));
        this.portD.addEventListener('portRegisterChange', this.handlePortDChange.bind(this));
        this.log('Using addEventListener API for port monitoring');
      } else if (typeof this.portB.addPortListener === 'function') {
        // Alternative API style
        this.portB.addPortListener(this.handlePortBChange.bind(this));
        this.portC.addPortListener(this.handlePortCChange.bind(this));
        this.portD.addPortListener(this.handlePortDChange.bind(this));
        this.log('Using addPortListener API for port monitoring');
      } else {
        // Manual polling as fallback
        this.log('Using manual polling for port monitoring - could not detect listener API');
      }
    } catch (error) {
      this.handleError(`Failed to set up port listeners: ${error.message}`);
      this.log('Falling back to manual port monitoring');
    }
  }
  
  /**
   * Load a compiled program into the microcontroller
   * @param {Uint16Array} program - The compiled program as 16-bit words
   * @param {number[]} pinsUsed - List of pins used in the program
   * @returns {boolean} Whether the program was loaded successfully
   */
  loadProgram(program, pinsUsed = []) {
    try {
      // Store pins used for debugging
      this.pinsInUse = pinsUsed || [];
      
      // Reset the CPU and peripherals before loading new program
      this.reset();
      
      // Check if program is valid
      if (!program || program.length === 0) {
        this.log('Warning: Empty program provided');
        return false;
      }
      
      // Check if program fits in flash
      if (program.length > this.progMem.length) {
        throw new Error(`Program too large (${program.length} words > ${this.progMem.length} words)`);
      }
      
      // Copy program to flash memory
      for (let i = 0; i < program.length; i++) {
        this.progMem[i] = program[i];
      }
      
      this.log(`✅ Program loaded: ${program.length} words (${program.length * 2} bytes)`);
      
      // Report pins used in the program
      if (this.pinsInUse.length > 0) {
        this.log(`Detected pins used in program: ${this.pinsInUse.join(', ')}`);
      }
      
      return true;
    } catch (error) {
      this.handleError(`Failed to load program: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Reset the CPU and all peripherals
   */
  reset() {
    // Stop if running
    if (this.running) {
      this.stop();
    }
    
    // Reset CPU
    if (this.cpu) {
      this.cpu.reset();
    }
    
    // Reset all pin states
    this.initializePins();
    
    // Reset port tracking
    this.prevPortB = 0;
    this.prevPortC = 0;
    this.prevPortD = 0;
    
    this.log('CPU and peripherals reset complete');
  }
  
  /**
   * Start the emulator
   */
  start() {
    if (this.running) {
      this.log('Emulator is already running');
      return;
    }
    
    try {
      this.running = true;
      
      // Frequency of updates (aim for 60 FPS for UI updates)
      const targetFPS = 60;
      const cyclesPerFrame = Math.floor(CPU_FREQUENCY / targetFPS);
      
      this.log(`🚀 Starting CPU emulation at ${CPU_FREQUENCY / 1000000}MHz`);
      this.log(`Executing ${cyclesPerFrame} CPU cycles per frame (${targetFPS}Hz refresh rate)`);
      
      // Start execution cycle
      this.executeCycles(cyclesPerFrame);
      
    } catch (error) {
      this.handleError(`Failed to start emulator: ${error.message}`);
      this.running = false;
    }
  }
  
  /**
   * Execute a batch of CPU cycles and schedule the next batch
   * @param {number} cyclesPerFrame - Number of cycles to execute per animation frame
   */
  executeCycles(cyclesPerFrame) {
    if (!this.running) return;
    
    try {
      // Execute a batch of CPU cycles
      for (let i = 0; i < cyclesPerFrame; i++) {
        this.cpu.tick();
      }
      
      // Check for port changes to update pin states
      this.checkPortChanges();
      
      // Schedule next batch of cycles
      this.cycleInterval = requestAnimationFrame(() => this.executeCycles(cyclesPerFrame));
      
    } catch (error) {
      this.handleError(`CPU execution error: ${error.message}`);
      this.stop();
    }
  }
  
  /**
   * Check for changes in port registers and update pin states
   */
  checkPortChanges() {
    // Check Port B (digital pins 8-13)
    const portBValue = this.portB.PORT;
    if (portBValue !== this.prevPortB) {
      this.processPinChanges('B', portBValue, this.prevPortB);
      this.prevPortB = portBValue;
    }
    
    // Check Port C (analog pins A0-A5)
    const portCValue = this.portC.PORT;
    if (portCValue !== this.prevPortC) {
      this.processPinChanges('C', portCValue, this.prevPortC);
      this.prevPortC = portCValue;
    }
    
    // Check Port D (digital pins 0-7)
    const portDValue = this.portD.PORT;
    if (portDValue !== this.prevPortD) {
      this.processPinChanges('D', portDValue, this.prevPortD);
      this.prevPortD = portDValue;
    }
  }
  
  /**
   * Process pin changes for a specific port
   * @param {string} portName - The port name (B, C, or D)
   * @param {number} newValue - The new port value
   * @param {number} oldValue - The previous port value
   */
  processPinChanges(portName, newValue, oldValue) {
    // Find which pins changed
    const changedBits = newValue ^ oldValue;
    
    // Process each changed bit
    for (let bit = 0; bit < 8; bit++) {
      const bitMask = 1 << bit;
      
      if (changedBits & bitMask) {
        const pinState = !!(newValue & bitMask);
        
        // Find the Arduino pin number for this port/bit
        let arduinoPin = this.findArduinoPinForPortBit(portName, bit);
        
        if (arduinoPin !== null) {
          // Update internal pin state
          this.pinStates[arduinoPin] = pinState;
          
          // For PWM pins, update analog value if it's a digital change
          if (PWM_PINS.includes(arduinoPin)) {
            const analogValue = pinState ? 255 : 0;
            this.analogValues[arduinoPin] = analogValue;
            
            // Notify with analog value
            this.notifyPinChange(arduinoPin, pinState, { analogValue });
          } else {
            // Notify digital change
            this.notifyPinChange(arduinoPin, pinState);
          }
          
          this.log(`Pin ${arduinoPin} changed to ${pinState ? 'HIGH' : 'LOW'} (Port ${portName}${bit})`);
        }
      }
    }
  }
  
  /**
   * Find the Arduino pin number for a specific port and bit
   * @param {string} portName - The port name (B, C, or D)
   * @param {number} bit - The bit number (0-7)
   * @returns {number|string|null} The Arduino pin number, or null if not found
   */
  findArduinoPinForPortBit(portName, bit) {
    // Search PIN_TO_PORT_BIT map for matching port and bit
    for (const [pin, mapping] of Object.entries(PIN_TO_PORT_BIT)) {
      if (mapping.port === portName && mapping.bit === bit) {
        return pin;
      }
    }
    return null;
  }
  
  /**
   * Notify about a pin change
   * @param {number|string} pin - The Arduino pin number
   * @param {boolean} isHigh - Whether the pin is HIGH
   * @param {Object} options - Additional options (like analogValue)
   */
  notifyPinChange(pin, isHigh, options = {}) {
    // Internal callback
    if (this.onPinChange) {
      this.onPinChange(pin, isHigh, options);
    }
    
    // External callback through options
    if (this.options && this.options.onPinChange) {
      this.options.onPinChange(pin, isHigh, options);
    }
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    if (!this.running) {
      return;
    }
    
    // Cancel the execution cycle
    if (this.cycleInterval !== null) {
      cancelAnimationFrame(this.cycleInterval);
      this.cycleInterval = null;
    }
    
    this.running = false;
    this.log('CPU emulation stopped');
  }
  
  /**
   * Set a digital input pin state
   * @param {number|string} pin - The Arduino pin number
   * @param {boolean} isHigh - Whether to set the pin HIGH or LOW
   */
  setDigitalInput(pin, isHigh) {
    const pinInfo = PIN_TO_PORT_BIT[pin];
    
    if (!pinInfo) {
      this.log(`Warning: Invalid pin ${pin} for digital input`);
      return;
    }
    
    try {
      // Get the corresponding port
      let port;
      switch (pinInfo.port) {
        case 'B': port = this.portB; break;
        case 'C': port = this.portC; break;
        case 'D': port = this.portD; break;
        default: throw new Error(`Unknown port: ${pinInfo.port}`);
      }
      
      // Calculate bit mask
      const bitMask = 1 << pinInfo.bit;
      
      // Read current value of PIN register
      let pinValue = port.PIN;
      
      // Update PIN register (simulating external input)
      if (isHigh) {
        pinValue |= bitMask; // Set bit
      } else {
        pinValue &= ~bitMask; // Clear bit
      }
      
      // Write back to PIN register
      port.PIN = pinValue;
      
      // Update our tracked pin state
      this.pinStates[pin] = isHigh;
      
      this.log(`Set digital input pin ${pin} to ${isHigh ? 'HIGH' : 'LOW'}`);
      
    } catch (error) {
      this.handleError(`Failed to set digital input on pin ${pin}: ${error.message}`);
    }
  }
  
  /**
   * Set an analog input value
   * @param {string} pin - The analog pin name (A0-A5)
   * @param {number} value - The analog value (0-1023)
   */
  setAnalogInput(pin, value) {
    if (!ANALOG_PINS.includes(pin)) {
      this.log(`Warning: Invalid analog pin ${pin}`);
      return;
    }
    
    try {
      // Clamp value to valid range
      const clampedValue = Math.max(0, Math.min(1023, value));
      
      // Store the analog value
      this.analogValues[pin] = clampedValue;
      
      // Determine digital state (threshold at half of max value)
      const isHigh = clampedValue > 512;
      this.pinStates[pin] = isHigh;
      
      // TODO: Set actual ADC register in avr8js when properly implemented
      
      this.log(`Set analog input ${pin} to ${clampedValue} (${isHigh ? 'HIGH' : 'LOW'})`);
      
      // Notify about pin change
      this.notifyPinChange(pin, isHigh, { analogValue: clampedValue });
      
    } catch (error) {
      this.handleError(`Failed to set analog input on pin ${pin}: ${error.message}`);
    }
  }
  
  /**
   * Handle port B changes from the AVR8js emulator
   * @param {Object} event - The port change event
   */
  handlePortBChange(event) {
    // For new API, event is an object, for old API it's a single value
    const portValue = typeof event === 'object' ? event.value : event;
    
    if (portValue !== this.prevPortB) {
      this.processPinChanges('B', portValue, this.prevPortB);
      this.prevPortB = portValue;
    }
  }
  
  /**
   * Handle port C changes from the AVR8js emulator
   * @param {Object} event - The port change event
   */
  handlePortCChange(event) {
    // For new API, event is an object, for old API it's a single value
    const portValue = typeof event === 'object' ? event.value : event;
    
    if (portValue !== this.prevPortC) {
      this.processPinChanges('C', portValue, this.prevPortC);
      this.prevPortC = portValue;
    }
  }
  
  /**
   * Handle port D changes from the AVR8js emulator
   * @param {Object} event - The port change event
   */
  handlePortDChange(event) {
    // For new API, event is an object, for old API it's a single value
    const portValue = typeof event === 'object' ? event.value : event;
    
    if (portValue !== this.prevPortD) {
      this.processPinChanges('D', portValue, this.prevPortD);
      this.prevPortD = portValue;
    }
  }
  
  /**
   * Handle serial byte output from the USART
   * @param {number} value - The byte value (0-255)
   */
  handleSerialByte(value) {
    const char = String.fromCharCode(value);
    
    this.log(`Serial output: ${value} (${char})`);
    
    // Internal callback
    if (this.onSerialByte) {
      this.onSerialByte(value, char);
    }
    
    // External callback
    if (this.options && this.options.onSerialByte) {
      this.options.onSerialByte(value, char);
    }
  }
  
  /**
   * Handle errors in the emulator
   * @param {string} message - The error message
   */
  handleError(message) {
    console.error(`[RealAVR8] Error: ${message}`);
    
    // Internal callback
    if (this.onError) {
      this.onError(message);
    }
    
    // External callback
    if (this.options && this.options.onError) {
      this.options.onError(message);
    }
  }
  
  /**
   * Log a message from the emulator
   * @param {string} message - The log message
   */
  log(message) {
    console.log(`[RealAVR8] ${message}`);
    
    // Internal callback
    if (this.onLogMessage) {
      this.onLogMessage(message);
    }
    
    // External callback
    if (this.options && this.options.onLogMessage) {
      this.options.onLogMessage(message);
    }
  }
}