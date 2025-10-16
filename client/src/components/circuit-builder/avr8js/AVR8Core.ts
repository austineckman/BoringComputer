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
  timer2Config,
  avrInstruction,
  AVRTWI,
  twiConfig,
  AVRUSART,
  usart0Config
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
   * Register a callback for I2C/TWI data transmission
   */
  onI2CData(callback: (address: number, data: number) => void): void;
  
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
  private twi: AVRTWI;
  private usart: AVRUSART;
  private pinStateCallbacks: {[portPin: string]: ((state: boolean) => void)[]} = {};
  private serialCallback: ((data: number) => void) | null = null;
  private i2cCallback: ((address: number, data: number) => void) | null = null;
  private i2cStartCallback: ((address: number, write: boolean) => void) | null = null;
  private i2cStopCallback: (() => void) | null = null;
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
    
    // Create TWI (I2C) interface
    this.twi = new AVRTWI(this.cpu, twiConfig, this.clockFrequency);
    
    // Create USART (Serial) interface
    this.usart = new AVRUSART(this.cpu, usart0Config, this.clockFrequency);
    
    // Initialize pin states
    this.initializePinStates();
    
    // Set up pin change listeners for all ports
    this.setupPinChangeListeners();
    
    // Set up I2C/TWI listeners
    this.setupI2CListeners();
    
    // Set up USART/Serial listeners
    this.setupSerialListeners();
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
      console.log('[AVR8Core] Port B changed:', pinValue.toString(2).padStart(8, '0'));
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('B', pin, isHigh);
      }
    });
    
    this.portC.addListener((pinValue) => {
      console.log('[AVR8Core] Port C changed:', pinValue.toString(2).padStart(8, '0'));
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const isHigh = (pinValue & pinMask) !== 0;
        this.handlePinChange('C', pin, isHigh);
      }
    });
    
    this.portD.addListener((pinValue) => {
      console.log('[AVR8Core] Port D changed:', pinValue.toString(2).padStart(8, '0'));
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
      avrInstruction(this.cpu);
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
   * Register a callback for I2C/TWI data
   */
  public onI2CData(callback: (address: number, data: number) => void): void {
    this.i2cCallback = callback;
  }
  
  /**
   * Register a callback for I2C START condition
   */
  public onI2CStart(callback: (address: number, write: boolean) => void): void {
    this.i2cStartCallback = callback;
  }
  
  /**
   * Register a callback for I2C STOP condition
   */
  public onI2CStop(callback: () => void): void {
    this.i2cStopCallback = callback;
  }
  
  /**
   * Set up I2C/TWI listeners
   */
  private setupI2CListeners(): void {
    // Track current I2C address
    let currentAddress = 0;
    let isWriteMode = false;
    
    // Create a custom event handler
    const self = this;
    this.twi.eventHandler = {
      start(repeated: boolean) {
        console.log(`[AVR8Core] I2C ${repeated ? 'Repeated ' : ''}Start`);
        self.twi.completeStart();
      },
      
      stop() {
        console.log('[AVR8Core] I2C Stop');
        
        if (self.i2cStopCallback) {
          self.i2cStopCallback();
        }
        
        self.twi.completeStop();
      },
      
      connectToSlave(addr: number, write: boolean) {
        currentAddress = addr;
        isWriteMode = write;
        console.log(`[AVR8Core] I2C Connect - Address: 0x${addr.toString(16)}, ${write ? 'Write' : 'Read'}`);
        
        if (self.i2cStartCallback) {
          self.i2cStartCallback(addr, write);
        }
        
        // ACK the connection for OLED displays (typically at 0x3C or 0x3D)
        self.twi.completeConnect(true);
      },
      
      writeByte(value: number) {
        console.log(`[AVR8Core] I2C Write - Address: 0x${currentAddress.toString(16)}, Data: 0x${value.toString(16)}`);
        
        if (self.i2cCallback) {
          self.i2cCallback(currentAddress, value);
        }
        
        // ACK the byte
        self.twi.completeWrite(true);
      },
      
      readByte(ack: boolean) {
        console.log(`[AVR8Core] I2C Read - ACK: ${ack}`);
        // Return dummy data for reads
        self.twi.completeRead(0xFF);
      }
    };
  }
  
  /**
   * Set up USART/Serial listeners
   */
  private setupSerialListeners(): void {
    // Listen for serial data transmission
    this.usart.onByteTransmit = (value: number) => {
      console.log(`[AVR8Core] Serial TX: ${value} (${String.fromCharCode(value)})`);
      
      if (this.serialCallback) {
        this.serialCallback(value);
      }
    };
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
