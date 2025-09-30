/**
 * AVR8Core.ts - Core AVR8 microcontroller emulation
 * 
 * This provides direct hardware emulation of an AVR microcontroller
 * using avr8js library.
 */

import {
  CPU,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  PinState,
  AVRTimer,
  timer0Config
} from 'avr8js';

export interface IAVR8Core {
  /**
   * Initialize the emulator with compiled program bytes
   */
  loadProgram(program: Uint16Array): void;
  
  /**
   * Run the AVR emulation for the specified number of cycles
   */
  execute(cycles: number): void;
  
  /**
   * Register a callback for when pin state changes
   */
  onPinChange(port: string, pin: number, callback: (state: boolean) => void): void;
  
  /**
   * Register a callback for when serial data is available
   */
  onSerialData(callback: (data: number) => void): void;
  
  /**
   * Get the current state of all pins
   */
  getPinStates(): {[portPin: string]: boolean};
  
  /**
   * Stop the emulation
   */
  stop(): void;
}

// 16 MHz clock frequency (16 million cycles per second)
const CLOCK_FREQUENCY = 16000000;

/**
 * Core AVR8 emulator implementation
 */
export class AVR8Core implements IAVR8Core {
  private cpu: CPU;
  private portB: AVRIOPort;
  private portC: AVRIOPort;
  private portD: AVRIOPort;
  private timer0: AVRTimer;
  private pinStateCallbacks: {[portPin: string]: ((state: boolean) => void)[]} = {};
  private serialCallback: ((data: number) => void) | null = null;
  private pinStates: {[portPin: string]: boolean} = {};
  private clockFrequency: number;
  
  constructor(clockFrequency: number = CLOCK_FREQUENCY) {
    this.clockFrequency = clockFrequency;
    
    // Create the CPU with empty program memory (will be loaded later)
    this.cpu = new CPU(new Uint16Array(0x8000));
    
    console.log('[AVR8Core] CPU created, PC:', this.cpu.pc, 'cycles:', this.cpu.cycles);
    
    // Create IO ports - these MUST be created before running the CPU
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    
    // Create timers
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    
    // Initialize pin states
    this.initializePinStates();
    
    // Set up pin change listeners for all ports
    this.setupPinChangeListeners();
  }
  
  /**
   * Initialize all pin states to LOW
   */
  private initializePinStates(): void {
    // Set all pins to LOW initially
    for (let port of ['B', 'C', 'D']) {
      for (let pin = 0; pin < 8; pin++) {
        const pinKey = `${port}${pin}`;
        this.pinStates[pinKey] = false;
      }
    }
  }
  
  /**
   * Set up pin change listeners for all ports
   */
  private setupPinChangeListeners(): void {
    // Monitor port B pins
    this.portB.addListener((pinValue, port) => {
      console.log(`[AVR8Core] Port B listener fired! Value: ${pinValue.toString(2).padStart(8, '0')}`);
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('B', pin, isHigh);
      }
    });
    
    // Monitor port C pins
    this.portC.addListener((pinValue, port) => {
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('C', pin, isHigh);
      }
    });
    
    // Monitor port D pins
    this.portD.addListener((pinValue, port) => {
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('D', pin, isHigh);
      }
    });
  }
  
  /**
   * Handle a pin state change
   */
  private handlePinChange(port: string, pin: number, isHigh: boolean): void {
    const pinKey = `${port}${pin}`;
    
    // Only proceed if the state has actually changed
    if (this.pinStates[pinKey] !== isHigh) {
      // Update our stored pin state
      this.pinStates[pinKey] = isHigh;
      
      // Log pin change (especially for port B pin 5 which is Arduino pin 13)
      if (port === 'B' && pin === 5) {
        console.log(`[AVR8Core] 🔴 PIN 13 (B5) changed to ${isHigh ? 'HIGH' : 'LOW'}`);
      } else {
        console.log(`[AVR8Core] Pin ${port}${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
      }
      
      // Call any registered callbacks for this pin
      if (this.pinStateCallbacks[pinKey]) {
        console.log(`[AVR8Core] Calling ${this.pinStateCallbacks[pinKey].length} callbacks for ${pinKey}`);
        for (const callback of this.pinStateCallbacks[pinKey]) {
          callback(isHigh);
        }
      } else {
        console.log(`[AVR8Core] No callbacks registered for ${pinKey}`);
      }
    }
  }
  
  /**
   * Load compiled program bytes into the emulator
   */
  public loadProgram(program: Uint16Array): void {
    // Copy program into CPU memory FIRST
    for (let i = 0; i < program.length; i++) {
      this.cpu.progMem[i] = program[i];
    }
    
    // THEN reset the CPU to start execution from address 0
    this.cpu.reset();
    
    console.log(`[AVR8Core] Program loaded (${program.length} words), CPU reset to PC=0`);
  }
  
  /**
   * Execute a certain number of CPU cycles
   */
  public execute(cycles: number): void {
    const initialPC = this.cpu.pc;
    const initialCycles = this.cpu.cycles;
    
    // Run the CPU for the specified number of cycles
    for (let i = 0; i < cycles; i++) {
      this.cpu.tick();
    }
    
    // Debug: Log every 16000 cycles (once per ms)
    if (cycles === 16000) {
      const finalPC = this.cpu.pc;
      const finalCycles = this.cpu.cycles;
      
      console.log(`[AVR8Core] CPU - PC: ${initialPC} → ${finalPC}, Cycles: ${initialCycles} → ${finalCycles}`);
      
      // Check the first instruction in program memory
      const firstInstruction = this.cpu.progMem[0];
      console.log(`[AVR8Core] First instruction at PC=0: 0x${firstInstruction?.toString(16).padStart(4, '0')}`);
      
      // Also check Port B PORTB register directly
      const portBValue = this.cpu.data[0x25]; // PORTB is at address 0x25
      const portBDir = this.cpu.data[0x24];   // DDRB is at address 0x24
      console.log(`[AVR8Core] PORTB=0x${portBValue?.toString(16).padStart(2, '0')} DDRB=0x${portBDir?.toString(16).padStart(2, '0')}`);
    }
  }
  
  /**
   * Register a callback for pin state changes
   */
  public onPinChange(port: string, pin: number, callback: (state: boolean) => void): void {
    const pinKey = `${port}${pin}`;
    
    // Initialize the array if it doesn't exist
    if (!this.pinStateCallbacks[pinKey]) {
      this.pinStateCallbacks[pinKey] = [];
    }
    
    // Add the callback
    this.pinStateCallbacks[pinKey].push(callback);
  }
  
  /**
   * Register a callback for serial data
   */
  public onSerialData(callback: (data: number) => void): void {
    this.serialCallback = callback;
  }
  
  /**
   * Get the current state of all pins
   */
  public getPinStates(): {[portPin: string]: boolean} {
    return { ...this.pinStates };
  }
  
  /**
   * Stop the emulation
   */
  public stop(): void {
    // Clear our pin state callbacks
    this.pinStateCallbacks = {};
    this.serialCallback = null;
  }
  
  /**
   * Map Arduino pin number to AVR port and pin
   */
  public static mapArduinoPin(pin: number): { port: string, pin: number } | null {
    // Map Arduino pin numbers to ATmega328P ports and pins
    const pinMap: {[pin: number]: { port: string, pin: number }} = {
      0: { port: 'D', pin: 0 },  // RXD
      1: { port: 'D', pin: 1 },  // TXD
      2: { port: 'D', pin: 2 },  // INT0
      3: { port: 'D', pin: 3 },  // INT1/PWM
      4: { port: 'D', pin: 4 },
      5: { port: 'D', pin: 5 },  // PWM
      6: { port: 'D', pin: 6 },  // PWM
      7: { port: 'D', pin: 7 },
      8: { port: 'B', pin: 0 },
      9: { port: 'B', pin: 1 },  // PWM
      10: { port: 'B', pin: 2 }, // PWM/SS
      11: { port: 'B', pin: 3 }, // PWM/MOSI
      12: { port: 'B', pin: 4 }, // MISO
      13: { port: 'B', pin: 5 }, // SCK/LED
      14: { port: 'C', pin: 0 }, // A0
      15: { port: 'C', pin: 1 }, // A1
      16: { port: 'C', pin: 2 }, // A2
      17: { port: 'C', pin: 3 }, // A3
      18: { port: 'C', pin: 4 }, // A4/SDA
      19: { port: 'C', pin: 5 }, // A5/SCL
    };
    
    return pinMap[pin] || null;
  }
}