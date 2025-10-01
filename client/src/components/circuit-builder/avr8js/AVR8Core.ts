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
  private isInitialized: boolean = false;
  private isRunning: boolean = false; // Added to track if the CPU is running

  constructor(clockFrequency: number = CLOCK_FREQUENCY) {
    this.clockFrequency = clockFrequency;

    // Create the CPU with proper program memory size (32KB for ATmega328P)
    this.cpu = new CPU(new Uint16Array(0x4000)); // 16K words = 32KB

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

    this.isInitialized = true;
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

    // Clear all program memory first
    this.cpu.progMem.fill(0);

    // Copy program into CPU memory
    for (let i = 0; i < Math.min(program.length, this.cpu.progMem.length); i++) {
      this.cpu.progMem[i] = program[i];
    }

    // Properly reset the CPU
    this.resetCPU();

    console.log(`[AVR8Core] Program loaded (${program.length} words), CPU reset to PC=${this.cpu.pc}`);
    console.log(`[AVR8Core] Verification - progMem[0-2]: 0x${this.cpu.progMem[0]?.toString(16)}, 0x${this.cpu.progMem[1]?.toString(16)}, 0x${this.cpu.progMem[2]?.toString(16)}`);

    // Test execute one instruction to verify it's working
    this.testExecution();
  }

  /**
   * Properly reset the CPU to initial state
   */
  private resetCPU(): void {
    // Reset CPU using built-in method
    this.cpu.reset();

    // Force critical registers to known good state
    this.cpu.pc = 0;
    this.cpu.cycles = 0;

    // Clear data memory (SRAM + registers)
    this.cpu.data.fill(0);

    // Set up stack pointer properly for ATmega328P
    // SRAM ends at 0x8FF (2303), so stack starts at 0x8FF
    this.cpu.data[0x5D] = 0xFF; // SPL - Stack Pointer Low
    this.cpu.data[0x5E] = 0x08; // SPH - Stack Pointer High

    // Set up proper I/O register initialization
    // Initialize critical registers to their power-on reset values
    this.cpu.data[0x24] = 0x00; // DDRB (Data Direction Register B)
    this.cpu.data[0x25] = 0x00; // PORTB
    this.cpu.data[0x27] = 0x00; // DDRC
    this.cpu.data[0x28] = 0x00; // PORTC
    this.cpu.data[0x2A] = 0x00; // DDRD
    this.cpu.data[0x2B] = 0x00; // PORTD

    console.log(`[AVR8Core] CPU properly reset - PC: ${this.cpu.pc}, Cycles: ${this.cpu.cycles}`);
    console.log(`[AVR8Core] Stack pointer set to: 0x${((this.cpu.data[0x5E] << 8) | this.cpu.data[0x5D]).toString(16)}`);
  }

  /**
   * Test execution to verify the CPU is working
   */
  private testExecution(): void {
    try {
      const testPC = this.cpu.pc;
      const testCycles = this.cpu.cycles;
      const instruction = this.cpu.progMem[testPC];

      console.log(`[AVR8Core] Test execution: PC=${testPC}, instruction=0x${instruction?.toString(16)}, cycles=${testCycles}`);

      // Execute one instruction
      this.cpu.tick();

      const newPC = this.cpu.pc;
      const newCycles = this.cpu.cycles;

      console.log(`[AVR8Core] After test execution: PC=${testPC}→${newPC}, Cycles=${testCycles}→${newCycles}`);

      if (newPC !== testPC || newCycles !== testCycles) {
        console.log(`[AVR8Core] ✅ CPU execution is working! PC advanced or cycles incremented`);
      } else {
        console.error(`[AVR8Core] ❌ CPU execution appears stuck - PC and cycles unchanged`);
      }

      // Reset back to start for actual program execution
      this.cpu.pc = 0;
      this.cpu.cycles = 0;

    } catch (error) {
      console.error('[AVR8Core] Test execution failed:', error);
    }
  }

  /**
   * Execute a certain number of CPU cycles
   */
  public execute(cycles: number = 1000): void {
    if (!this.cpu || !this.isInitialized) {
      console.warn('[AVR8Core] CPU not initialized, skipping execution');
      return;
    }

    // Check if we have a valid program loaded
    if (!this.cpu.progMem || this.cpu.progMem.length === 0) {
      console.warn('[AVR8Core] No program memory available');
      return;
    }

    const initialPC = this.cpu.pc;
    const initialCycles = this.cpu.cycles;

    // Store previous port values to detect changes - read directly from memory
    let prevPortB = this.cpu.data[0x25] || 0;
    let prevPortC = this.cpu.data[0x28] || 0;
    let prevPortD = this.cpu.data[0x2B] || 0;

    // Execute cycles with proper limits to prevent browser lag
    let actualCyclesExecuted = 0;
    let instructionsExecuted = 0;
    const maxCycles = Math.min(cycles, 10000);
    const maxInstructions = Math.min(cycles / 2, 5000);
    let stuckCounter = 0;

    try {
      // Execute cycles with safety limits
      while (actualCyclesExecuted < maxCycles && instructionsExecuted < maxInstructions) {
        const beforePC = this.cpu.pc;
        const beforeCycles = this.cpu.cycles;

        // Check bounds
        if (this.cpu.pc >= this.cpu.progMem.length) {
          console.error(`[AVR8Core] PC out of bounds: ${this.cpu.pc}`);
          break;
        }

        // Execute one CPU tick
        this.cpu.tick();

        const afterPC = this.cpu.pc;
        const afterCycles = this.cpu.cycles;

        // Count actual cycles that were executed
        const cyclesDelta = afterCycles - beforeCycles;
        actualCyclesExecuted += Math.max(cyclesDelta, 1);
        instructionsExecuted++;

        // Check for port changes after EVERY instruction by reading memory directly
        const currentPortB = this.cpu.data[0x25] || 0;
        const currentPortC = this.cpu.data[0x28] || 0;
        const currentPortD = this.cpu.data[0x2B] || 0;

        // Check PORTB changes (includes Arduino pin 13 which is PB5)
        if (currentPortB !== prevPortB) {
          console.log(`[AVR8Core] PORTB changed: 0x${prevPortB.toString(16)} → 0x${currentPortB.toString(16)}`);
          for (let pin = 0; pin < 8; pin++) {
            const pinMask = 1 << pin;
            const wasHigh = (prevPortB & pinMask) !== 0;
            const isHigh = (currentPortB & pinMask) !== 0;
            if (wasHigh !== isHigh) {
              // Convert AVR pin to Arduino pin number for callbacks
              const arduinoPin = pin + 8; // PB0-PB5 = Arduino pins 8-13
              console.log(`[AVR8Core] 🔴 Arduino Pin ${arduinoPin} (PB${pin}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
              
              // Special handling for pin 13 (PB5)
              if (pin === 5) { // PB5 = Arduino Pin 13
                console.log(`[AVR8Core] 🔴🔴🔴 PIN 13 DETECTED CHANGE: ${isHigh ? 'HIGH' : 'LOW'}`);
                this.triggerArduinoPinCallback(13, isHigh);
              } else {
                this.triggerArduinoPinCallback(arduinoPin, isHigh);
              }
            }
          }
          prevPortB = currentPortB;
        }

        // Check PORTC changes (Arduino analog pins A0-A5)
        if (currentPortC !== prevPortC) {
          console.log(`[AVR8Core] PORTC changed: 0x${prevPortC.toString(16)} → 0x${currentPortC.toString(16)}`);
          for (let pin = 0; pin < 8; pin++) {
            const pinMask = 1 << pin;
            const wasHigh = (prevPortC & pinMask) !== 0;
            const isHigh = (currentPortC & pinMask) !== 0;
            if (wasHigh !== isHigh) {
              // Convert AVR pin to Arduino pin number
              const arduinoPin = pin + 14; // PC0-PC5 = Arduino pins A0-A5 (14-19)
              console.log(`[AVR8Core] Arduino Pin A${pin} (${arduinoPin}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
              this.triggerArduinoPinCallback(arduinoPin, isHigh);
            }
          }
          prevPortC = currentPortC;
        }

        // Check PORTD changes (Arduino digital pins 0-7)
        if (currentPortD !== prevPortD) {
          console.log(`[AVR8Core] PORTD changed: 0x${prevPortD.toString(16)} → 0x${currentPortD.toString(16)}`);
          for (let pin = 0; pin < 8; pin++) {
            const pinMask = 1 << pin;
            const wasHigh = (prevPortD & pinMask) !== 0;
            const isHigh = (currentPortD & pinMask) !== 0;
            if (wasHigh !== isHigh) {
              // PD0-PD7 = Arduino pins 0-7
              const arduinoPin = pin;
              console.log(`[AVR8Core] Arduino Pin ${arduinoPin} (PD${pin}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
              this.triggerArduinoPinCallback(arduinoPin, isHigh);
            }
          }
          prevPortD = currentPortD;
        }

        // Detect if CPU is stuck (PC not advancing)
        if (beforePC === afterPC) {
          stuckCounter++;
          if (stuckCounter > 1000) {
            console.warn(`[AVR8Core] CPU appears stuck at PC=${beforePC}, breaking execution`);
            break;
          }
        } else {
          stuckCounter = 0; // Reset stuck counter if PC advances
        }

        // Log progress occasionally for pin 13 specifically
        if (instructionsExecuted % 500 === 0) {
          const currentDDRB = this.cpu.data[0x24] || 0;
          const pin13Output = (currentDDRB & 0x20) !== 0; // PB5 = bit 5
          const pin13High = (currentPortB & 0x20) !== 0;
          console.log(`[AVR8Core] Pin 13 Status: DDRB[5]=${pin13Output ? 'OUTPUT' : 'INPUT'}, PORTB[5]=${pin13High ? 'HIGH' : 'LOW'}`);
        }

        // Yield control back to browser periodically
        if (instructionsExecuted % 2000 === 0) {
          break; // Allow other tasks to run
        }
      }

    } catch (error) {
      console.error('[AVR8Core] Execution error:', error);
      console.error('[AVR8Core] PC was at:', this.cpu.pc);
      console.error('[AVR8Core] Instruction:', this.cpu.progMem[this.cpu.pc]?.toString(16));
      return;
    }

    const finalPC = this.cpu.pc;
    const finalCycles = this.cpu.cycles;

    // Log execution summary only if something actually happened
    if (finalPC !== initialPC || finalCycles !== initialCycles) {
      console.log(`[AVR8Core] Executed ${actualCyclesExecuted} cycles: PC ${initialPC}→${finalPC}, Cycles ${initialCycles}→${finalCycles}`);
    }
  }

  /**
   * Manually check for port changes and trigger callbacks
   */
  private checkPortChanges(prevPortB: number, prevPortC: number, prevPortD: number): void {
    const currentPortB = this.cpu.data[0x25] || 0;
    const currentPortC = this.cpu.data[0x28] || 0;
    const currentPortD = this.cpu.data[0x2B] || 0;

    // Check PORTB changes (includes Arduino pin 13 which is PB5)
    if (currentPortB !== prevPortB) {
      console.log(`[AVR8Core] PORTB changed: 0x${prevPortB.toString(16)} → 0x${currentPortB.toString(16)}`);
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortB & pinMask) !== 0;
        const isHigh = (currentPortB & pinMask) !== 0;
        if (wasHigh !== isHigh) {
          // Convert AVR pin to Arduino pin number for callbacks
          const arduinoPin = pin + 8; // PB0-PB5 = Arduino pins 8-13
          console.log(`[AVR8Core] 🔴 Arduino Pin ${arduinoPin} (PB${pin}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
          
          // Call both the internal handler and direct Arduino pin callback
          this.handlePinChange('B', pin, isHigh);
          this.triggerArduinoPinCallback(arduinoPin, isHigh);
        }
      }
    }

    // Check PORTC changes (Arduino analog pins A0-A5)
    if (currentPortC !== prevPortC) {
      console.log(`[AVR8Core] PORTC changed: 0x${prevPortC.toString(16)} → 0x${currentPortC.toString(16)}`);
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortC & pinMask) !== 0;
        const isHigh = (currentPortC & pinMask) !== 0;
        if (wasHigh !== isHigh) {
          // Convert AVR pin to Arduino pin number
          const arduinoPin = pin + 14; // PC0-PC5 = Arduino pins A0-A5 (14-19)
          console.log(`[AVR8Core] Arduino Pin A${pin} (${arduinoPin}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
          
          this.handlePinChange('C', pin, isHigh);
          this.triggerArduinoPinCallback(arduinoPin, isHigh);
        }
      }
    }

    // Check PORTD changes (Arduino digital pins 0-7)
    if (currentPortD !== prevPortD) {
      console.log(`[AVR8Core] PORTD changed: 0x${prevPortD.toString(16)} → 0x${currentPortD.toString(16)}`);
      for (let pin = 0; pin < 8; pin++) {
        const pinMask = 1 << pin;
        const wasHigh = (prevPortD & pinMask) !== 0;
        const isHigh = (currentPortD & pinMask) !== 0;
        if (wasHigh !== isHigh) {
          // PD0-PD7 = Arduino pins 0-7
          const arduinoPin = pin;
          console.log(`[AVR8Core] Arduino Pin ${arduinoPin} (PD${pin}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);
          
          this.handlePinChange('D', pin, isHigh);
          this.triggerArduinoPinCallback(arduinoPin, isHigh);
        }
      }
    }
  }

  /**
   * Trigger Arduino pin callbacks using the standard pin numbering
   */
  private triggerArduinoPinCallback(arduinoPin: number, isHigh: boolean): void {
    // Create a callback key for Arduino pin numbering
    const pinKey = `arduino-${arduinoPin}`;
    
    if (this.pinStateCallbacks[pinKey]) {
      console.log(`[AVR8Core] Calling ${this.pinStateCallbacks[pinKey].length} Arduino pin callbacks for pin ${arduinoPin}`);
      for (const callback of this.pinStateCallbacks[pinKey]) {
        try {
          callback(isHigh);
        } catch (error) {
          console.error(`[AVR8Core] Error in Arduino pin ${arduinoPin} callback:`, error);
        }
      }
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
    console.log(`[AVR8Core] Registered callback for pin ${pinKey}, total callbacks: ${this.pinStateCallbacks[pinKey].length}`);
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
    this.isRunning = false; // Set running flag to false
    // Clear our pin state callbacks
    this.pinStateCallbacks = {};
    this.serialCallback = null;
    console.log('[AVR8Core] Emulation stopped, callbacks cleared');
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