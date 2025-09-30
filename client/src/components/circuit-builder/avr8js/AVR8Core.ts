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
    // Store previous port values for change detection
    let prevPortB = 0;
    let prevPortC = 0;
    let prevPortD = 0;

    // Monitor port B pins - listen to PORT register changes
    this.portB.addListener((pinValue) => {
      console.log(`[AVR8Core] Port B listener fired! Value: 0x${pinValue.toString(16)} (binary: ${pinValue.toString(2).padStart(8, '0')})`);
      
      // Check each pin for changes
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortB & pinMask) !== 0;
        const isHigh = (pinValue & pinMask) !== 0;
        
        if (wasHigh !== isHigh) {
          console.log(`[AVR8Core] Port B Pin ${pin} changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
          this.handlePinChange('B', pin, isHigh);
        }
      }
      
      prevPortB = pinValue;
    });

    // Monitor port C pins
    this.portC.addListener((pinValue) => {
      console.log(`[AVR8Core] Port C listener fired! Value: 0x${pinValue.toString(16)}`);
      
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortC & pinMask) !== 0;
        const isHigh = (pinValue & pinMask) !== 0;
        
        if (wasHigh !== isHigh) {
          this.handlePinChange('C', pin, isHigh);
        }
      }
      
      prevPortC = pinValue;
    });

    // Monitor port D pins
    this.portD.addListener((pinValue) => {
      console.log(`[AVR8Core] Port D listener fired! Value: 0x${pinValue.toString(16)}`);
      
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortD & pinMask) !== 0;
        const isHigh = (pinValue & pinMask) !== 0;
        
        if (wasHigh !== isHigh) {
          this.handlePinChange('D', pin, isHigh);
        }
      }
      
      prevPortD = pinValue;
    });

    console.log('[AVR8Core] Port listeners set up successfully');
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
    if (!program || program.length === 0) {
      console.error('[AVR8Core] Cannot load empty program');
      return;
    }

    console.log(`[AVR8Core] Loading program: ${program.length} words`);
    console.log(`[AVR8Core] First few instructions: 0x${program[0]?.toString(16)}, 0x${program[1]?.toString(16)}, 0x${program[2]?.toString(16)}`);

    // Ensure the CPU has enough program memory
    if (program.length > this.cpu.progMem.length) {
      console.warn(`[AVR8Core] Program too large: ${program.length} > ${this.cpu.progMem.length}`);
    }

    // Copy program into CPU memory
    for (let i = 0; i < Math.min(program.length, this.cpu.progMem.length); i++) {
      this.cpu.progMem[i] = program[i];
    }

    // Clear any remaining program memory
    for (let i = program.length; i < this.cpu.progMem.length; i++) {
      this.cpu.progMem[i] = 0;
    }

    // Reset the CPU to start execution from address 0
    this.cpu.reset();

    console.log(`[AVR8Core] Program loaded (${program.length} words), CPU reset to PC=${this.cpu.pc}`);
    console.log(`[AVR8Core] Verification - progMem[0-2]: 0x${this.cpu.progMem[0]?.toString(16)}, 0x${this.cpu.progMem[1]?.toString(16)}, 0x${this.cpu.progMem[2]?.toString(16)}`);
  }

  /**
   * Execute a certain number of CPU cycles
   */
  public execute(cycles: number): void {
    if (!this.cpu || this.cpu.progMem.length === 0) {
      console.warn('[AVR8Core] No program loaded, skipping execution');
      return;
    }

    const initialPC = this.cpu.pc;
    const initialCycles = this.cpu.cycles;

    // Store previous port values to detect changes
    const prevPortB = this.cpu.data[0x25] || 0;
    const prevPortC = this.cpu.data[0x28] || 0;
    const prevPortD = this.cpu.data[0x2B] || 0;

    // Run the CPU for the specified number of cycles
    // Use a more efficient execution approach
    const startTime = performance.now();
    let cyclesExecuted = 0;
    
    try {
      while (cyclesExecuted < cycles) {
        // Check if we're stuck in an infinite loop (PC not advancing)
        const beforePC = this.cpu.pc;
        
        // Execute one instruction
        this.cpu.tick();
        cyclesExecuted++;
        
        // Safety check: if PC hasn't changed after many cycles, we might be stuck
        if (cyclesExecuted % 1000 === 0) {
          const currentTime = performance.now();
          if (currentTime - startTime > 10) { // Don't spend more than 10ms per execution
            console.log(`[AVR8Core] Breaking execution after ${cyclesExecuted} cycles (time limit)`);
            break;
          }
          
          // Check if program counter is advancing
          if (beforePC === this.cpu.pc && cyclesExecuted > 100) {
            // PC stuck, might be in a tight loop - this is actually normal for delay loops
            // Don't break, just continue
          }
        }
      }
    } catch (error) {
      console.error('[AVR8Core] Execution error:', error);
      return;
    }

    const finalPC = this.cpu.pc;
    const finalCycles = this.cpu.cycles;

    // Check for port changes after execution and manually trigger callbacks
    const currentPortB = this.cpu.data[0x25] || 0;
    const currentPortC = this.cpu.data[0x28] || 0;
    const currentPortD = this.cpu.data[0x2B] || 0;

    // Check PORTB changes
    if (currentPortB !== prevPortB) {
      console.log(`[AVR8Core] PORTB changed from 0x${prevPortB.toString(16)} to 0x${currentPortB.toString(16)}`);

      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortB & pinMask) !== 0;
        const isHigh = (currentPortB & pinMask) !== 0;

        if (wasHigh !== isHigh) {
          console.log(`[AVR8Core] Pin B${pin} changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
          this.handlePinChange('B', pin, isHigh);
        }
      }
    }

    // Check PORTC changes
    if (currentPortC !== prevPortC) {
      console.log(`[AVR8Core] PORTC changed from 0x${prevPortC.toString(16)} to 0x${currentPortC.toString(16)}`);

      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortC & pinMask) !== 0;
        const isHigh = (currentPortC & pinMask) !== 0;

        if (wasHigh !== isHigh) {
          this.handlePinChange('C', pin, isHigh);
        }
      }
    }

    // Check PORTD changes
    if (currentPortD !== prevPortD) {
      console.log(`[AVR8Core] PORTD changed from 0x${prevPortD.toString(16)} to 0x${currentPortD.toString(16)}`);

      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortD & pinMask) !== 0;
        const isHigh = (currentPortD & pinMask) !== 0;

        if (wasHigh !== isHigh) {
          this.handlePinChange('D', pin, isHigh);
        }
      }
    }

    // Debug every 1000 cycles instead of every second
    if (cyclesExecuted >= 1000 && finalCycles % 16000 < 1000) {
      console.log(`[AVR8Core] Executed ${cyclesExecuted}/${cycles} cycles`);
      console.log(`[AVR8Core] PC: ${initialPC}→${finalPC}, Cycles: ${initialCycles}→${finalCycles}`);
      console.log(`[AVR8Core] progMem[${finalPC}]: 0x${this.cpu.progMem[finalPC]?.toString(16) || '??'}`);
      console.log(`[AVR8Core] PORTB=0x${currentPortB.toString(16)} DDRB=0x${this.cpu.data[0x24]?.toString(16)} (Pin 13 = B5)`);
      
      // Check if pin 13 (Port B pin 5) should be on
      const pin13State = (currentPortB & 0x20) !== 0; // Bit 5 of PORTB
      const pin13Direction = (this.cpu.data[0x24] & 0x20) !== 0; // Bit 5 of DDRB
      console.log(`[AVR8Core] Pin 13: DIR=${pin13Direction ? 'OUT' : 'IN'}, STATE=${pin13State ? 'HIGH' : 'LOW'}`);
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