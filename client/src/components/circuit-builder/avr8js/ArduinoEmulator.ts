/**
 * ArduinoEmulator.ts
 * 
 * A high-level Arduino emulator implementation using AVR8Core
 */

import { AVR8Core } from './AVR8Core';

export interface ArduinoEmulatorOptions {
  /**
   * CPU clock frequency in Hz (default: 16MHz)
   */
  clockFrequency?: number;
  
  /**
   * Callback for when digital pins change state
   */
  onPinChange?: (pin: number, isHigh: boolean) => void;
  
  /**
   * Callback for serial data output from the Arduino
   */
  onSerialData?: (data: string) => void;
  
  /**
   * Callback for simulation logs
   */
  onLog?: (message: string) => void;
}

/**
 * ArduinoEmulator class
 * 
 * This class provides high-level Arduino-specific APIs on top of the AVR8Core
 */
export class ArduinoEmulator {
  private core: AVR8Core;
  private running = false;
  private cyclesPerMillisecond: number;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private options: ArduinoEmulatorOptions;
  private pinStates: {[pin: number]: boolean} = {};
  
  constructor(options: ArduinoEmulatorOptions = {}) {
    this.options = options;
    
    // Create AVR8 core with specified clock frequency
    const clockFrequency = options.clockFrequency || 16000000; // 16MHz default
    this.core = new AVR8Core(clockFrequency);
    
    // Calculate cycles per millisecond for timing
    this.cyclesPerMillisecond = clockFrequency / 1000;
    
    // Initialize Arduino pin states
    for (let pin = 0; pin <= 19; pin++) {
      this.pinStates[pin] = false;
    }
    
    // Set up pin change handlers
    this.setupPinChangeHandlers();
    
    // Log initialization
    this.log('Arduino emulator initialized');
  }
  
  /**
   * Set up handlers to convert AVR pin changes to Arduino pins
   */
  private setupPinChangeHandlers(): void {
    // Register callbacks for all AVR pins
    ['B', 'C', 'D'].forEach(port => {
      for (let pin = 0; pin < 8; pin++) {
        this.core.onPinChange(port, pin, (isHigh) => {
          // Convert AVR port/pin to Arduino pin
          const arduinoPin = this.avrPinToArduino(port, pin);
          if (arduinoPin !== null) {
            // Only call the callback if the state actually changed
            if (this.pinStates[arduinoPin] !== isHigh) {
              this.pinStates[arduinoPin] = isHigh;
              
              // Log the pin change
              this.log(`Digital pin ${arduinoPin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
              
              // Call the pin change callback if provided
              if (this.options.onPinChange) {
                this.options.onPinChange(arduinoPin, isHigh);
              }
            }
          }
        });
      }
    });
  }
  
  /**
   * Convert AVR port/pin to Arduino pin number
   */
  private avrPinToArduino(port: string, pin: number): number | null {
    // Map from AVR port/pin to Arduino pin number
    if (port === 'B') {
      if (pin >= 0 && pin <= 5) return pin + 8; // PB0-PB5 -> 8-13
    } else if (port === 'C') {
      if (pin >= 0 && pin <= 5) return pin + 14; // PC0-PC5 -> A0-A5 (14-19)
    } else if (port === 'D') {
      if (pin >= 0 && pin <= 7) return pin; // PD0-PD7 -> 0-7
    }
    return null;
  }
  
  /**
   * Load an Arduino program (in compiled form)
   */
  public loadProgram(program: Uint16Array): void {
    this.core.loadProgram(program);
    this.log(`Program loaded (${program.length} words)`);
  }
  
  /**
   * Start the emulation
   */
  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastFrameTime = performance.now();
    this.log('Emulation started');
    
    // Start the emulation loop
    this.animationFrameId = requestAnimationFrame(this.emulationLoop.bind(this));
  }
  
  /**
   * The main emulation loop
   */
  private emulationLoop(time: number): void {
    if (!this.running) return;
    
    // Calculate elapsed time since last frame
    const elapsed = time - this.lastFrameTime;
    this.lastFrameTime = time;
    
    // Skip frame if too much time has passed (tab was inactive)
    if (elapsed < 100) {
      // Calculate how many CPU cycles to execute based on elapsed time
      const cyclesToExecute = Math.floor(elapsed * this.cyclesPerMillisecond);
      
      // Execute the cycles
      this.core.execute(cyclesToExecute);
    }
    
    // Schedule the next frame
    this.animationFrameId = requestAnimationFrame(this.emulationLoop.bind(this));
  }
  
  /**
   * Stop the emulation
   */
  public stop(): void {
    if (!this.running) return;
    
    this.running = false;
    
    // Cancel animation frame if active
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    this.log('Emulation stopped');
  }
  
  /**
   * Get the current state of a pin
   */
  public getPinState(pin: number): boolean {
    return this.pinStates[pin] || false;
  }
  
  /**
   * Log a message
   */
  private log(message: string): void {
    console.log(`[ArduinoEmulator] ${message}`);
    
    // Call the log callback if provided
    if (this.options.onLog) {
      this.options.onLog(message);
    }
  }
  
  /**
   * Check if the emulator is running
   */
  public isRunning(): boolean {
    return this.running;
  }
}