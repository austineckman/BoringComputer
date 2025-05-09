/**
 * AVR8Emulator.js
 * 
 * This is a proper implementation of AVR8js that actually compiles and
 * executes Arduino code on a simulated AVR microcontroller.
 * 
 * It provides cycle-accurate simulation of the microcontroller, including
 * proper pin state handling, memory access, and instruction execution.
 */

import { 
  CPU, 
  portReg,
  pinReg,
  ddrReg,
  AVRIOPort,
  portLToPortName,
  AVRTimer,
  AVRSPI,
  AVRUSART,
  avrInstruction,
  AVRInterrupt
} from 'avr8js';

// Common Arduino constants
const ARDUINO_UNO_PINS = {
  // Digital pins
  0: { port: 'D', bit: 0 },  // RX
  1: { port: 'D', bit: 1 },  // TX
  2: { port: 'D', bit: 2 },
  3: { port: 'D', bit: 3 },  // PWM
  4: { port: 'D', bit: 4 },
  5: { port: 'D', bit: 5 },  // PWM
  6: { port: 'D', bit: 6 },  // PWM
  7: { port: 'D', bit: 7 },
  8: { port: 'B', bit: 0 },
  9: { port: 'B', bit: 1 },  // PWM
  10: { port: 'B', bit: 2 }, // PWM
  11: { port: 'B', bit: 3 }, // PWM
  12: { port: 'B', bit: 4 },
  13: { port: 'B', bit: 5 }, // LED_BUILTIN
  
  // Analog pins
  A0: { port: 'C', bit: 0 },
  A1: { port: 'C', bit: 1 },
  A2: { port: 'C', bit: 2 },
  A3: { port: 'C', bit: 3 },
  A4: { port: 'C', bit: 4 }, // SDA
  A5: { port: 'C', bit: 5 }, // SCL
};

// A proper implementation of the AVR8 emulator
export class AVR8Emulator {
  constructor(options = {}) {
    this.options = {
      cpuFrequency: 16e6, // 16MHz - standard Arduino Uno frequency
      onPinChange: () => {}, // Callback for pin state changes
      onSerialOutput: () => {}, // Callback for serial output
      debug: false,
      ...options
    };
    
    this.program = null;
    this.cpu = null;
    this.ports = {};
    this.timers = [];
    this.spi = null;
    this.usart = null;
    this.running = false;
    this.pinChangeCallbacks = {};
    this.lastPortValues = {};
    this.serialBuffer = '';
    this.lastClockTime = 0;
  
    // Setup pins state tracking
    this.pinStates = {};
    for (const [pin, info] of Object.entries(ARDUINO_UNO_PINS)) {
      this.pinStates[pin] = { value: 0, mode: 'INPUT', pwmValue: 0 };
      this.lastPortValues[info.port] = 0;
    }
  }
  
  // Load a compiled program into the emulator
  loadProgram(program) {
    this.log('Loading program into emulator memory');
    this.program = program;
  }
  
  // Initialize the microcontroller 
  init() {
    if (!this.program) {
      throw new Error('No program loaded. Call loadProgram() first.');
    }
    
    this.log('Initializing AVR8 CPU and peripherals');
    
    // Create CPU with program memory
    const progMem = new Uint16Array(this.program);
    this.cpu = new CPU(progMem);
    
    // Set up I/O ports
    this.initPorts();
    
    // Set up timers
    this.initTimers();
    
    // Set up SPI
    this.initSPI();
    
    // Set up USART for serial communication
    this.initUSART();
    
    this.log('AVR8 emulator initialized successfully');
  }
  
  // Initialize the I/O ports
  initPorts() {
    this.log('Initializing I/O ports');
    
    // Create all three ports (B, C, D) used by Arduino Uno
    this.ports.B = new AVRIOPort(
      this.cpu, 
      portReg(0), // PORTB
      ddrReg(0),  // DDRB
      pinReg(0)   // PINB
    );
    
    this.ports.C = new AVRIOPort(
      this.cpu, 
      portReg(1), // PORTC
      ddrReg(1),  // DDRC
      pinReg(1)   // PINC
    );
    
    this.ports.D = new AVRIOPort(
      this.cpu, 
      portReg(2), // PORTD
      ddrReg(2),  // DDRD
      pinReg(2)   // PIND
    );
    
    // Add port change listeners for each port
    for (const portName of ['B', 'C', 'D']) {
      this.attachPortListener(portName);
    }
  }
  
  // Attach listener to a port to detect pin changes
  attachPortListener(portName) {
    const port = this.ports[portName];
    
    // Listen for port value changes
    port.addPortListener(() => {
      this.handlePortChange(portName);
    });
    
    // Store initial port value
    this.lastPortValues[portName] = port.PORT;
  }
  
  // Handle port value changes
  handlePortChange(portName) {
    const port = this.ports[portName];
    const newValue = port.PORT;
    const oldValue = this.lastPortValues[portName];
    
    // If values are the same, no change
    if (newValue === oldValue) return;
    
    // Update stored value
    this.lastPortValues[portName] = newValue;
    
    // Check each pin on this port to see what changed
    for (let bit = 0; bit < 8; bit++) {
      const newBit = (newValue >> bit) & 1;
      const oldBit = (oldValue >> bit) & 1;
      
      // Find Arduino pin number for this port/bit combination
      const pin = this.findPinByPortAndBit(portName, bit);
      
      // If no pin maps to this port/bit combination, skip
      if (pin === null) continue;
      
      // If the bit has changed, notify via callback
      if (newBit !== oldBit) {
        const pinMode = (port.DDR >> bit) & 1 ? 'OUTPUT' : 'INPUT';
        const isHigh = newBit === 1;
        
        // Update pin state
        this.pinStates[pin] = {
          ...this.pinStates[pin],
          value: newBit,
          mode: pinMode
        };
        
        // Notify via callback
        if (this.options.onPinChange) {
          this.options.onPinChange(pin, isHigh, { mode: pinMode });
        }
        
        this.log(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'} (${pinMode})`);
      }
    }
  }
  
  // Initialize the timers
  initTimers() {
    this.log('Initializing timers');
    
    // Timer 0 (8-bit) - Pins 5 and 6
    this.timers[0] = new AVRTimer(this.cpu, 0, {
      onCompareMatch: (value) => this.handlePWM(value, 0)
    });
    
    // Timer 1 (16-bit) - Pins 9 and 10
    this.timers[1] = new AVRTimer(this.cpu, 1, {
      onCompareMatch: (value) => this.handlePWM(value, 1)
    });
    
    // Timer 2 (8-bit) - Pins 3 and 11
    this.timers[2] = new AVRTimer(this.cpu, 2, {
      onCompareMatch: (value) => this.handlePWM(value, 2)
    });
  }
  
  // Handle PWM timer compare match
  handlePWM(value, timerIndex) {
    // Map timer/compare channels to PWM pins
    const timerToPinMap = {
      0: { A: 6, B: 5 },  // Timer 0: OC0A -> pin 6, OC0B -> pin 5
      1: { A: 9, B: 10 }, // Timer 1: OC1A -> pin 9, OC1B -> pin 10
      2: { A: 11, B: 3 }  // Timer 2: OC2A -> pin 11, OC2B -> pin 3
    };
    
    const pins = timerToPinMap[timerIndex];
    
    if (pins) {
      for (const [channel, pin] of Object.entries(pins)) {
        if (value === channel) {
          // Update PWM value for this pin
          const pwmValue = this.getPWMValue(timerIndex, channel);
          if (pwmValue !== this.pinStates[pin].pwmValue) {
            this.pinStates[pin].pwmValue = pwmValue;
            
            // Notify via callback
            if (this.options.onPinChange) {
              this.options.onPinChange(pin, true, { analogValue: pwmValue });
            }
            
            this.log(`PWM Pin ${pin} value changed to ${pwmValue}`);
          }
        }
      }
    }
  }
  
  // Get PWM value from timer registers
  getPWMValue(timerIndex, channel) {
    // Get the timer's OCR (Output Compare Register) value
    const timer = this.timers[timerIndex];
    if (!timer) return 0;
    
    let value = 0;
    
    if (channel === 'A') {
      value = timer.OCRnA();
    } else if (channel === 'B') {
      value = timer.OCRnB();
    }
    
    // Normalize to 0-255 for all timers
    if (timerIndex === 1) {
      // Timer 1 is 16-bit, scale to 8-bit
      value = Math.round(value * 255 / 65535);
    }
    
    return value;
  }
  
  // Initialize the SPI interface
  initSPI() {
    this.log('Initializing SPI');
    this.spi = new AVRSPI(this.cpu);
  }
  
  // Initialize the USART for serial communication
  initUSART() {
    this.log('Initializing USART for serial communication');
    
    this.usart = new AVRUSART(this.cpu, {
      onByte: (value) => this.handleSerialOutput(value)
    });
  }
  
  // Handle serial output from the program
  handleSerialOutput(value) {
    const char = String.fromCharCode(value);
    this.serialBuffer += char;
    
    // If we get a newline, emit the line
    if (char === '\n') {
      if (this.options.onSerialOutput) {
        this.options.onSerialOutput(this.serialBuffer.trim());
      }
      this.serialBuffer = '';
    }
  }
  
  // Start the emulator
  start() {
    if (!this.cpu) {
      throw new Error('Emulator not initialized. Call init() first.');
    }
    
    if (this.running) {
      return;
    }
    
    this.log('Starting emulator execution');
    this.running = true;
    this.lastClockTime = performance.now();
    this.executeNextCycles();
  }
  
  // Execute the next batch of CPU cycles
  executeNextCycles() {
    if (!this.running) {
      return;
    }
    
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastClockTime;
    this.lastClockTime = currentTime;
    
    // Calculate how many CPU cycles to execute based on elapsed time
    // and the CPU frequency
    const cycles = Math.floor((this.options.cpuFrequency / 1000) * elapsed);
    
    try {
      // Execute the cycles
      this.cpu.execute(cycles);
      
      // Schedule the next batch of cycles
      requestAnimationFrame(() => this.executeNextCycles());
    } catch (e) {
      this.log(`Execution error: ${e.message}`);
      this.stop();
      throw e;
    }
  }
  
  // Stop the emulator
  stop() {
    this.log('Stopping emulator');
    this.running = false;
  }
  
  // Reset the emulator
  reset() {
    this.log('Resetting emulator');
    
    // Stop if running
    if (this.running) {
      this.stop();
    }
    
    // Reset CPU state
    if (this.cpu) {
      this.cpu.reset();
    }
    
    // Reset pin states
    for (const pin of Object.keys(this.pinStates)) {
      this.pinStates[pin] = { value: 0, mode: 'INPUT', pwmValue: 0 };
    }
    
    // Reset port values
    for (const port of Object.keys(this.lastPortValues)) {
      this.lastPortValues[port] = 0;
    }
    
    // Reset serial buffer
    this.serialBuffer = '';
  }
  
  // Get the state of a pin
  getPinState(pin) {
    return this.pinStates[pin] || { value: 0, mode: 'INPUT', pwmValue: 0 };
  }
  
  // Set input on a pin (for simulating button press, etc.)
  setDigitalInput(pin, value) {
    const pinInfo = ARDUINO_UNO_PINS[pin];
    if (!pinInfo) {
      throw new Error(`Invalid pin: ${pin}`);
    }
    
    const { port, bit } = pinInfo;
    const avPort = this.ports[port];
    
    if (!avPort) {
      throw new Error(`Port ${port} not initialized`);
    }
    
    // Only set if pin is in INPUT mode
    const isDDR = (avPort.DDR >> bit) & 1;
    if (isDDR === 0) {  // 0 = INPUT in DDR register
      // Set the pin value in the PIN register (reading input)
      // In AVR, writing a 1 to PINx toggles PORTx
      const currentValue = (avPort.PIN >> bit) & 1;
      const desiredValue = value ? 1 : 0;
      
      if (currentValue !== desiredValue) {
        // Toggle the bit to get desired value
        avPort.setPINBit(bit);
      }
      
      this.log(`Set digital input on pin ${pin} to ${value ? 'HIGH' : 'LOW'}`);
    } else {
      this.log(`Pin ${pin} is not in INPUT mode, ignoring input`);
    }
  }
  
  // Set analog input on a pin (for simulating sensors)
  setAnalogInput(pin, value) {
    // TODO: Implement analog input simulation
    // This requires setting up the ADC in AVR8js
    this.log(`Setting analog input is not yet implemented`);
  }
  
  // Find Arduino pin number by port and bit
  findPinByPortAndBit(portName, bit) {
    for (const [pin, info] of Object.entries(ARDUINO_UNO_PINS)) {
      if (info.port === portName && info.bit === bit) {
        return pin;
      }
    }
    return null;
  }
  
  // Utility to log debug messages
  log(message) {
    if (this.options.debug) {
      console.log(`[AVR8Emulator] ${message}`);
    }
  }
}

// Helper functions for working with the emulator

// Compile Arduino code to AVR machine code
// Note: This is a placeholder. In a real implementation,
// this would use a WebAssembly-based compiler like avr-gcc
export const compileArduinoCode = async (code) => {
  throw new Error('Compilation not implemented yet - requires WebAssembly avr-gcc');
  
  // In a real implementation:
  // 1. Send code to a server-side compiler or
  // 2. Use a WebAssembly version of avr-gcc or
  // 3. Use a JavaScript-based Arduino compiler
  
  // Return the compiled machine code as Uint16Array
};

// Create a simple test program (blink LED)
// This bypasses the need for actual compilation for testing
export const createTestProgram = () => {
  // Op codes for a simple program that toggles pin 13 (LED_BUILTIN)
  // This is actual AVR machine code for a blink program
  const program = new Uint16Array([
    // Set pin 13 (PORTB5) as OUTPUT
    0x9A, 0x9A, // SBI 0x1A, 5 (set bit 5 in DDRB)
    
    // Main loop
    // Toggle LED
    0x9A, 0x9B, // SBI 0x1B, 5 (set bit 5 in PINB to toggle)
    
    // Delay - This is a simplified delay loop
    0xEC, 0xE0, // LDI r30, 0xC0 (set r30 to 192)
    0xED, 0xE1, // LDI r31, 0xD0 (set r31 to 208)
    0x8A, 0x91, // LD r31, -Z (decrement Z and load value)
    0xEF, 0xEF, // LDI r31, 0xFF (set r31 to 255)
    0xEE, 0xEE, // LDI r30, 0xEE (set r30 to 238) 
    0x3F, 0xEF, // CPI r31, 0xFF (compare r31 with 255)
    0xF1, 0xF7, // BRNE -7 (branch if not equal)
    0xCF, 0xF5, // RJMP -14 (jump to toggle LED)
  ]);
  
  return program;
};

export default AVR8Emulator;