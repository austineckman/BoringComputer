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
  timer0Config,
  timer1Config,
  timer2Config
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
  private timer1: AVRTimer;
  private timer2: AVRTimer;
  private pinStateCallbacks: {[portPin: string]: ((state: boolean) => void)[]} = {};
  private serialCallback: ((data: number) => void) | null = null;
  private pinStates: {[portPin: string]: boolean} = {};
  private clockFrequency: number;
  
  constructor(clockFrequency: number = CLOCK_FREQUENCY) {
    this.clockFrequency = clockFrequency;
    // Create the CPU
    this.cpu = new CPU(new Uint16Array(0x8000));
    
    // Create IO ports
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    
    // Create all three timers for proper PWM support
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    
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
    this.portB.addListener((pinValue) => {
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('B', pin, isHigh);
      }
    });
    
    this.portC.addListener((pinValue) => {
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('C', pin, isHigh);
      }
    });
    
    this.portD.addListener((pinValue) => {
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
    
    if (this.pinStates[pinKey] !== isHigh) {
      this.pinStates[pinKey] = isHigh;
      
      if (this.pinStateCallbacks[pinKey]) {
        for (const callback of this.pinStateCallbacks[pinKey]) {
          callback(isHigh);
        }
      }
    }
  }
  
  /**
   * Load compiled program bytes into the emulator
   */
  public loadProgram(program: Uint16Array): void {
    this.cpu.reset();
    for (let i = 0; i < program.length; i++) {
      this.cpu.progMem[i] = program[i];
    }
  }
  
  /**
   * Execute a certain number of CPU cycles
   */
  public execute(cycles: number): void {
    // Run the CPU for the specified number of cycles
    for (let i = 0; i < cycles; i++) {
      this.cpu.tick();
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
