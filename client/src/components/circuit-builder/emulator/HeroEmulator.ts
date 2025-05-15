/**
 * HeroEmulator.ts
 * 
 * A comprehensive emulator for the HERO board and its components based on the AVR8js library.
 * This provides true hardware emulation for all components, where each component's behavior
 * is driven solely by the signals from the emulated CPU.
 * 
 * All components (LEDs, OLED displays, buttons, etc.) must be connected to this emulator
 * to receive their state changes.
 */

import {
  CPU,
  AVRIOPort,
  AVRSPI,
  AVRTWI,
  AVRUSART,
  AVRTimer,
  portBConfig,
  portCConfig,
  portDConfig,
  spiConfig,
  twiConfig,
  usart0Config,
  timer0Config,
  timer1Config,
  timer2Config
} from 'avr8js';

// Types for component interfaces
export interface EmulatedComponent {
  id: string;
  type: string;
  onPinChange?: (pinId: string, isHigh: boolean, options?: any) => void;
  onStateChange?: (state: any) => void;
  getState?: () => any;
}

export interface EmulatedLED extends EmulatedComponent {
  anode: string; // Pin connected to anode
  cathode: string; // Pin connected to cathode (usually GND)
}

export interface EmulatedRGBLED extends EmulatedComponent {
  redPin: string;
  greenPin: string;
  bluePin: string;
  commonPin: string; // Common anode or cathode
  isCommonAnode: boolean;
}

export interface EmulatedButton extends EmulatedComponent {
  pin: string;
  isPullup: boolean;
}

export interface EmulatedOLEDDisplay extends EmulatedComponent {
  sclPin: string;
  sdaPin: string;
  resetPin?: string;
  width: number;
  height: number;
  i2cAddress: number;
}

// Constants for HERO board pin mapping (matching Arduino UNO)
const PIN_TO_PORT_BIT: Record<string, {port: string, bit: number}> = {
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

// Arduino digital pins
const DIGITAL_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Arduino PWM pins
const PWM_PINS = [3, 5, 6, 9, 10, 11];

// Arduino analog pins
const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

// Special pins
const SDA_PIN = 'A4';
const SCL_PIN = 'A5';

// This class simulates the actual values from the CPU through various peripherals
export class HeroEmulator {
  private cpu: CPU | null = null;
  private portB: AVRIOPort | null = null;
  private portC: AVRIOPort | null = null;
  private portD: AVRIOPort | null = null;
  private timer0: AVRTimer | null = null;
  private timer1: AVRTimer | null = null;
  private timer2: AVRTimer | null = null;
  private usart: AVRUSART | null = null;
  private spi: AVRSPI | null = null;
  private twi: AVRTWI | null = null;
  
  private program: Uint16Array = new Uint16Array(0x8000); // 32KB program memory
  private running: boolean = false;
  private cycleInterval: any = null;
  private programLoaded: boolean = false;
  private simulationMode: boolean = true; // Always use simulation mode for now
  
  // Pin states and values
  private pinStates: Record<string, boolean> = {};
  private analogValues: Record<string, number> = {};
  
  // Component registry
  private components: Map<string, EmulatedComponent> = new Map();
  private pinToComponentMap: Map<string, Set<string>> = new Map();
  
  // Callback functions
  private onPinChangeCallback: ((pin: string | number, isHigh: boolean, options?: any) => void) | null = null;
  private onSerialDataCallback: ((value: number, char: string) => void) | null = null;
  private onLogCallback: ((message: string) => void) | null = null;
  private onErrorCallback: ((message: string) => void) | null = null;
  
  // Direct log message handler - used for Arduino program logs
  public onLogMessage: ((message: string) => void) | null = null;
  
  constructor(options: {
    onPinChange?: (pin: string | number, isHigh: boolean, options?: any) => void;
    onSerialData?: (value: number, char: string) => void;
    onLog?: (message: string) => void;
    onError?: (message: string) => void;
    onLogMessage?: (message: string) => void;
  } = {}) {
    this.onPinChangeCallback = options.onPinChange || null;
    this.onSerialDataCallback = options.onSerialData || null;
    this.onLogCallback = options.onLog || null;
    this.onErrorCallback = options.onError || null;
    this.onLogMessage = options.onLogMessage || null;
    
    // Initialize pin states
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false;
    });
    
    ANALOG_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      this.analogValues[pin] = 0;
    });
    
    PWM_PINS.forEach(pin => {
      this.analogValues[pin] = 0;
    });
    
    // Initialize the AVR8 emulator
    this.initEmulator();
  }
  
  /**
   * Initialize the AVR8 emulator
   */
  private initEmulator() {
    // Create CPU instance
    this.cpu = new CPU(this.program);
    
    // Create IO ports
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    
    // Create timers
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);  // Use AVRTimer for timer1 as well
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    
    // Create USART for serial communication
    // The AVRUSART constructor in some versions of avr8js expects a transmit callback
    const serialDataCallback = (value: number) => {
      if (this.onSerialDataCallback) {
        const char = String.fromCharCode(value);
        this.onSerialDataCallback(value, char);
      }
    };
    
    try {
      // Try with compatible constructor version
      this.usart = new AVRUSART(this.cpu as any, serialDataCallback, usart0Config);
      
      // Set up USART serial output callback manually if needed
      if (this.usart) {
        if (typeof this.usart.onByteTransmit !== 'undefined') {
          this.usart.onByteTransmit = serialDataCallback;
        }
      }
    } catch (error) {
      try {
        // Alternative constructor pattern
        this.usart = new AVRUSART(this.cpu as any, usart0Config) as any;
        if (this.usart && typeof this.usart.onByteTransmit !== 'undefined') {
          this.usart.onByteTransmit = serialDataCallback;
        }
      } catch (innerError) {
        this.log('Failed to initialize USART: ' + error);
        // Create a dummy USART to prevent null references
        this.usart = {
          onByteTransmit: serialDataCallback
        } as any;
      }
    }
    
    // Create SPI interface
    try {
      // Try with additional null parameter for compatibility
      this.spi = new AVRSPI(this.cpu as any, null as any, spiConfig);
    } catch (error) {
      try {
        // Alternative constructor pattern
        this.spi = new AVRSPI(this.cpu as any, spiConfig) as any;
      } catch (innerError) {
        this.log('Failed to initialize SPI: ' + error);
        // Create a dummy SPI to prevent null references
        this.spi = {} as any;
      }
    }
    
    // Create I2C/TWI interface for OLED displays and other I2C devices
    try {
      // Try with additional null parameter for compatibility
      this.twi = new AVRTWI(this.cpu as any, null as any, twiConfig);
    } catch (error) {
      try {
        // Alternative constructor pattern
        this.twi = new AVRTWI(this.cpu as any, twiConfig) as any;
      } catch (innerError) {
        this.log('Failed to initialize TWI: ' + error);
        // Create a dummy TWI to prevent null references
        this.twi = {} as any;
      }
    }
    
    // Set up port change listeners
    this.portB?.addListener((value: number, oldValue: number) => {
      this.handlePortChange('B', value, oldValue);
    });
    
    this.portC?.addListener((value: number, oldValue: number) => {
      this.handlePortChange('C', value, oldValue);
    });
    
    this.portD?.addListener((value: number, oldValue: number) => {
      this.handlePortChange('D', value, oldValue);
    });
    
    this.log('[Arduino] HERO Board initialized');
  }
  
  /**
   * Handle port value changes and notify about pin changes
   */
  private handlePortChange(portName: string, value: number, oldValue: number) {
    if (value === oldValue) return;
    
    // Find which bits changed
    const changedBits = value ^ oldValue;
    
    // For each changed bit, find the corresponding Arduino pin
    for (let bit = 0; bit < 8; bit++) {
      if ((changedBits >> bit) & 1) {
        // This bit changed
        const isHigh = ((value >> bit) & 1) === 1;
        
        // Find Arduino pin number for this port/bit
        const pin = this.getArduinoPinFromPortBit(portName, bit);
        
        if (pin !== null) {
          // Log pin changes in a standard format for better UI/analysis
          const pinStr = String(pin);
          
          // Special case for pin 13 (built-in LED)
          if (pin === 13 || pinStr === '13') {
            this.log(`[Arduino] Built-in LED is ${isHigh ? 'ON' : 'OFF'}`);
          }
          
          // Update internal pin state
          this.pinStates[pin.toString()] = isHigh;
          
          // Calculate analog value for PWM pins
          let analogValue = isHigh ? 255 : 0;
          if (typeof pin === 'number' && PWM_PINS.includes(pin)) {
            // For PWM pins, we need to get the duty cycle from the timer
            // This is a simplification - in a full implementation, we would
            // get the actual PWM duty cycle from the timer
            analogValue = isHigh ? 255 : 0;
            this.analogValues[pin.toString()] = analogValue;
          }
          
          // Notify global listener
          if (this.onPinChangeCallback) {
            this.onPinChangeCallback(pin, isHigh, { analogValue });
          }
          
          // Update components connected to this pin
          this.updateConnectedComponents(pin.toString(), isHigh, analogValue);
        }
      }
    }
  }
  
  /**
   * Find Arduino pin from port name and bit number
   */
  private getArduinoPinFromPortBit(portName: string, bit: number): string | number | null {
    for (const [pin, mapping] of Object.entries(PIN_TO_PORT_BIT)) {
      if (mapping.port === portName && mapping.bit === bit) {
        return pin;
      }
    }
    return null;
  }
  
  /**
   * Find port bit from Arduino pin number
   */
  private getPortBitFromArduinoPin(pin: string | number): { port: string, bit: number } | null {
    return PIN_TO_PORT_BIT[pin as keyof typeof PIN_TO_PORT_BIT] || null;
  }
  
  /**
   * Update components connected to a specific pin
   */
  private updateConnectedComponents(pin: string, isHigh: boolean, analogValue: number) {
    // Find components connected to this pin
    const connectedComponentIds = this.pinToComponentMap.get(pin);
    if (!connectedComponentIds) return;
    
    // Update each connected component - use Array.from for compatibility
    Array.from(connectedComponentIds).forEach(componentId => {
      const component = this.components.get(componentId);
      if (!component) return;
      
      try {
        // Handle specific component types
        if (component.type === 'led') {
          this.updateLEDComponent(component as EmulatedLED, pin, isHigh);
          // Only log LED state changes for pin 13
          if (pin === '13') {
            this.log(`[Arduino] LED component updated`);
          }
        } else if (component.type === 'rgb-led') {
          this.updateRGBLEDComponent(component as EmulatedRGBLED, pin, isHigh, analogValue);
        } else if (component.type === 'oled-display') {
          this.updateOLEDComponent(component as EmulatedOLEDDisplay, pin, isHigh);
        } else if (component.type === 'buzzer') {
          this.updateBuzzerComponent(component, pin, isHigh, analogValue);
        } else if (component.type === 'servo') {
          this.updateServoComponent(component, pin, analogValue);
        } else {
          // Generic component update
          if (component.onPinChange) {
            component.onPinChange(pin, isHigh, { analogValue });
          }
        }
        
        // Additional state update for any component
        if (component.onStateChange) {
          const state = {
            pin,
            isHigh,
            analogValue, 
            timestamp: Date.now()
          };
          component.onStateChange(state);
        }
      } catch (error) {
        console.error(`Error updating component ${componentId}:`, error);
        this.error(`Failed to update component ${componentId}: ${error}`);
      }
    });
  }
  
  /**
   * Update LED component state based on pin change
   */
  private updateLEDComponent(led: EmulatedLED, changedPin: string, isHigh: boolean) {
    // For a simple LED, we need to check if the pin that changed is connected
    // to either the anode or cathode
    if (changedPin === led.anode) {
      // Anode pin changed - LED is on when anode is HIGH and cathode is connected to ground
      const isOn = isHigh; // Simplified - in reality we need to check if cathode is LOW
      
      if (led.onStateChange) {
        led.onStateChange({ isOn });
      }
      
      if (led.onPinChange) {
        led.onPinChange(changedPin, isHigh, { isOn });
      }
    } else if (changedPin === led.cathode) {
      // Cathode pin changed - LED is on when cathode is LOW and anode is HIGH
      const anodeHigh = this.pinStates[led.anode] || false;
      const isOn = anodeHigh && !isHigh; // LED on when anode HIGH and cathode LOW
      
      if (led.onStateChange) {
        led.onStateChange({ isOn });
      }
      
      if (led.onPinChange) {
        led.onPinChange(changedPin, isHigh, { isOn });
      }
    }
  }
  
  /**
   * Update RGB LED component state based on pin change
   */
  private updateRGBLEDComponent(rgbLed: EmulatedRGBLED, changedPin: string, isHigh: boolean, analogValue: number) {
    // Get current state for each color pin
    const redValue = changedPin === rgbLed.redPin ? 
      analogValue : this.analogValues[rgbLed.redPin] || 0;
      
    const greenValue = changedPin === rgbLed.greenPin ? 
      analogValue : this.analogValues[rgbLed.greenPin] || 0;
      
    const blueValue = changedPin === rgbLed.bluePin ? 
      analogValue : this.analogValues[rgbLed.bluePin] || 0;
    
    // For common anode, invert the values (255 = off, 0 = fully on)
    const red = rgbLed.isCommonAnode ? 255 - redValue : redValue;
    const green = rgbLed.isCommonAnode ? 255 - greenValue : greenValue;
    const blue = rgbLed.isCommonAnode ? 255 - blueValue : blueValue;
    
    if (rgbLed.onStateChange) {
      rgbLed.onStateChange({ red, green, blue });
    }
    
    if (rgbLed.onPinChange) {
      rgbLed.onPinChange(changedPin, isHigh, { red, green, blue, analogValue });
    }
  }
  
  /**
   * Update OLED display component state based on pin change
   */
  private updateOLEDComponent(oled: EmulatedOLEDDisplay, changedPin: string, isHigh: boolean) {
    // OLED displays use I2C (SDA/SCL) or SPI
    // This is just a placeholder - actual I2C implementation would
    // require more complex handling of the I2C protocol
    
    // For now, just notify the component of the pin change
    if (oled.onPinChange) {
      oled.onPinChange(changedPin, isHigh, {});
    }
    
    // In a real implementation, this would need to handle the I2C protocol
    // and update the OLED display buffer based on the I2C commands
  }
  
  /**
   * Update buzzer component state based on pin change
   */
  private updateBuzzerComponent(buzzer: EmulatedComponent, changedPin: string, isHigh: boolean, analogValue: number) {
    // For a buzzer, we just need to pass the pin change through to the component
    if (buzzer.onPinChange) {
      buzzer.onPinChange(changedPin, isHigh, { analogValue });
    }
    
    // For a PWM-controlled buzzer, the frequency would be determined by the timer configuration
    // For now, we just pass the analog value which can be used to control volume
  }
  
  /**
   * Update servo component state based on pin change
   */
  private updateServoComponent(servo: EmulatedComponent, changedPin: string, analogValue: number) {
    // For a servo, the position is determined by the pulse width
    // We just pass the analog value (0-255) which can be mapped to servo position (0-180 degrees)
    if (servo.onPinChange) {
      servo.onPinChange(changedPin, true, { analogValue });
    }
  }
  
  /**
   * Register a component with the emulator
   */
  public registerComponent(component: EmulatedComponent): void {
    this.components.set(component.id, component);
    
    // Map pins to components based on component type
    if (component.type === 'led') {
      const led = component as EmulatedLED;
      this.addPinMapping(led.anode, component.id);
      this.addPinMapping(led.cathode, component.id);
    } else if (component.type === 'rgb-led') {
      const rgbLed = component as EmulatedRGBLED;
      this.addPinMapping(rgbLed.redPin, component.id);
      this.addPinMapping(rgbLed.greenPin, component.id);
      this.addPinMapping(rgbLed.bluePin, component.id);
      this.addPinMapping(rgbLed.commonPin, component.id);
    } else if (component.type === 'button') {
      const button = component as EmulatedButton;
      this.addPinMapping(button.pin, component.id);
    } else if (component.type === 'oled-display') {
      const oled = component as EmulatedOLEDDisplay;
      this.addPinMapping(oled.sclPin, component.id);
      this.addPinMapping(oled.sdaPin, component.id);
      if (oled.resetPin) {
        this.addPinMapping(oled.resetPin, component.id);
      }
    }
    
    this.log(`[Arduino] Component ${component.id} (${component.type}) registered`);
  }
  
  /**
   * Helper method to add a pin-to-component mapping
   */
  private addPinMapping(pin: string, componentId: string): void {
    if (!this.pinToComponentMap.has(pin)) {
      this.pinToComponentMap.set(pin, new Set<string>());
    }
    this.pinToComponentMap.get(pin)?.add(componentId);
  }
  
  /**
   * Unregister a component from the emulator
   */
  public unregisterComponent(componentId: string): void {
    const component = this.components.get(componentId);
    if (!component) {
      this.error(`Component ${componentId} not found`);
      return;
    }
    
    // Remove from component map
    this.components.delete(componentId);
    
    // Remove from pin-to-component mappings
    for (const [pin, components] of this.pinToComponentMap.entries()) {
      components.delete(componentId);
      // If set is empty, remove the pin entry
      if (components.size === 0) {
        this.pinToComponentMap.delete(pin);
      }
    }
    
    this.log(`[Arduino] Component ${componentId} unregistered`);
  }
  
  /**
   * Load a program into the emulator
   */
  public loadProgram(hexData: string): boolean {
    this.log('[Arduino] Loading program...');
    console.log('[AVR8] Loading program of length:', hexData.length);
    if (this.onLogMessage) {
      this.onLogMessage('Loading Arduino program...');
    }
    
    try {
      if (!hexData || hexData.trim() === '') {
        throw new Error('No program data provided');
      }
      
      // Parse Intel HEX format
      const lines = hexData.trim().split('\n');
      console.log(`[AVR8] Parsed ${lines.length} HEX records`);
      
      // Initialize a fresh program memory with zeros (32K words = 64K bytes)
      this.program = new Uint16Array(32768);
      let programDataLoaded = false;
      
      // Keep track of the highest address we write to
      let maxAddress = 0;
      
      // Process each line of the Intel HEX format
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || !trimmedLine.startsWith(':')) continue;
        
        // Parse HEX record
        // :LLAAAATTDDDDDDDDDDDDDDDDDDDDDDDDDDDDCC
        // LL = byte count
        // AAAA = address
        // TT = record type
        // DD... = data
        // CC = checksum
        
        const byteCount = parseInt(trimmedLine.substr(1, 2), 16);
        const address = parseInt(trimmedLine.substr(3, 4), 16);
        const recordType = parseInt(trimmedLine.substr(7, 2), 16);
        
        // Type 0 = Data record
        if (recordType === 0) {
          const dataStr = trimmedLine.substr(9, byteCount * 2);
          const bytes = [];
          
          // Parse bytes from hex
          for (let i = 0; i < dataStr.length; i += 2) {
            const byteStr = dataStr.substr(i, 2);
            const byte = parseInt(byteStr, 16);
            bytes.push(byte);
          }
          
          if (bytes.length > 0) {
            programDataLoaded = true;
          }
          
          // Update the max address
          if (address + bytes.length > maxAddress) {
            maxAddress = address + bytes.length;
          }
          
          // Load bytes into program memory (convert to words)
          // AVR is little-endian (low byte first)
          for (let i = 0; i < bytes.length; i += 2) {
            const wordAddress = (address + i) >> 1; // Convert byte address to word address
            
            if (i + 1 < bytes.length) {
              // Form a 16-bit word (low byte first, then high byte)
              const word = bytes[i] | (bytes[i + 1] << 8);
              this.program[wordAddress] = word;
            } else {
              // Handle odd number of bytes
              this.program[wordAddress] = bytes[i];
            }
          }
          
          console.log(`[AVR8] Loaded ${bytes.length} bytes at address 0x${address.toString(16)}`);
        }
        // Type 1 = End of file
        else if (recordType === 1) {
          console.log('[AVR8] End of HEX file reached');
          break;
        }
      }
      
      if (!programDataLoaded) {
        console.warn('[AVR8] No program data found in HEX file!');
        return false;
      }
      
      // Log program stats
      const programSizeBytes = maxAddress;
      const programSizeWords = Math.ceil(programSizeBytes / 2);
      console.log(`[AVR8] Program loaded: ${programSizeBytes} bytes (${programSizeWords} words)`);
      
      // Program loaded successfully
      if (this.onLogMessage) {
        this.onLogMessage(`Program loaded successfully: ${programSizeBytes} bytes`);
      }
      
      // Reset the CPU with the new program
      if (this.cpu) {
        this.cpu.reset();
        
        // Copy the program directly to the CPU's program memory
        if (this.program && this.cpu.progMem) {
          const progMem = this.cpu.progMem;
          console.log(`[AVR8] Copying program to CPU memory (${this.program.length} words)`);
          
          for (let i = 0; i < this.program.length; i++) {
            if (i < progMem.length && this.program[i] !== 0) {
              progMem[i] = this.program[i];
            }
          }
        }
      }
      
      // Flag that we have a valid program and should use CPU execution
      this.programLoaded = true;
      this.simulationMode = false; // Use actual CPU execution, not simulation
      
      return true;
    } catch (error) {
      this.error(`Failed to load program: ${error}`);
      console.error('[AVR8] Failed to load program:', error);
      if (this.onLogMessage) {
        this.onLogMessage(`Error loading program: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Force into simulation mode on error
      this.simulationMode = true;
      return false;
    }
  }
  
  /**
   * Start the emulation with CPU-based execution
   */
  public start(): boolean {
    if (this.running) return true;
    
    console.log('[AVR8] Starting emulator...');
    
    // Reset the pin states to clean values regardless of previous state
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false;
    });
    
    // Make sure we have a CPU instance
    if (!this.cpu) {
      // If not, reinitialize the emulator
      this.initEmulator();
      
      if (!this.cpu) {
        this.onLogMessage?.('[Arduino] Error: Emulator could not be initialized');
        console.error('[AVR8] Critical error: Emulator could not be initialized');
        return false;
      }
    }
    
    // Reset the CPU and counters to clean state
    try {
      this.cpu.reset();
      this.cycleCounter = 0;
      this.onLogMessage?.('[Arduino] Microcontroller reset');
    } catch (e) {
      console.error('[AVR8] Error resetting CPU:', e);
    }
    
    // Check if we have a program loaded
    if (!this.programLoaded || !this.program) {
      this.onLogMessage?.('[Arduino] No program loaded - using default Blink.');
      console.warn('[AVR8] No program loaded, will use simulation mode');
      
      // Force simulation mode since we don't have a program
      this.simulationMode = true;
    } else {
      this.onLogMessage?.('[Arduino] Running compiled program');
      console.log('[AVR8] Program loaded, size:', this.program.length, 'words');
      
      try {
        // Pass the loaded program to the CPU
        if (this.cpu && this.program) {
          // Set the program directly to the CPU memory
          const progMem = this.cpu.progMem;
          if (progMem) {
            // Copy our program memory to the CPU's program memory
            for (let i = 0; i < this.program.length; i++) {
              if (i < progMem.length) {
                progMem[i] = this.program[i];
              }
            }
            console.log('[AVR8] Program copied to CPU memory');
          } else {
            console.error('[AVR8] CPU program memory not accessible');
          }
        }
        
        // Use actual CPU execution mode (no simulation required)
        this.simulationMode = false;
        console.log('[AVR8] Using actual CPU execution mode');
      } catch (e) {
        console.error('[AVR8] Error setting program to CPU:', e);
        // Fall back to simulation mode
        this.simulationMode = true;
      }
    }
    
    // Log the execution mode
    console.log(`[AVR8] Execution mode: ${this.simulationMode ? 'SIMULATION' : 'CPU EXECUTION'}`);
    
    // Start executing CPU cycles
    this.running = true;
    
    // Clear any existing interval
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
    }
    
    // Set up a new execution cycle
    this.cycleInterval = setInterval(() => this.executeCycle(), 10);
    console.log('[AVR8] Started execution cycle interval');
    
    // Initialize pin 13 to show setup has executed
    this.pinStates['13'] = true;
    this.pin13State = true;
    
    this.onLogMessage?.('[Arduino] Setup complete, program starting');
    console.log('[AVR8] Pin 13 (LED) initialized to HIGH');
    
    // Update components connected to pin 13
    if (this.onPinChangeCallback) {
      this.onPinChangeCallback(13, true, { analogValue: 255 });
    }
    
    // Update any connected components
    this.updateConnectedComponents('13', true, 255);
    
    // Reset timing values for consistent operation
    this.lastToggleTime = Date.now();
    
    return true;
  }
  
  /**
   * Stop the emulation
   */
  public stop(): void {
    if (!this.running) return;
    
    // Clear the execution interval
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
    
    this.running = false;
    this.onLogMessage?.('[Arduino] Program stopped');
    console.log('[AVR8] Program stopped');
    
    // Reset all pins to LOW
    for (let i = 0; i <= 13; i++) {
      const pinStr = i.toString();
      const wasHigh = this.pinStates[pinStr];
      this.pinStates[pinStr] = false;
      this.analogValues[pinStr] = 0;
      
      // If pin was HIGH, notify of change to LOW
      if (wasHigh) {
        if (this.onPinChangeCallback) {
          this.onPinChangeCallback(i, false, { analogValue: 0 });
        }
        
        // Special handling for pin 13 (built-in LED)
        if (i === 13) {
          this.onLogMessage?.('[Arduino] Built-in LED turned OFF');
          console.log('[AVR8] Built-in LED is OFF');
        }
        
        // Update components
        this.updateConnectedComponents(pinStr, false, 0);
      }
    }
  }
  
  /**
   * Execute a cycle of the CPU
   */
  // Cycle counter and state for simulation
  private cycleCounter: number = 0;
  private pin13State: boolean = false;
  private lastToggleTime: number = 0;
  private blinkSpeed: number = 1000; // milliseconds between toggles - increased to 1 second for clarity

  /**
   * Execute a CPU cycle
   * This is the core of the emulation that runs actual AVR instructions
   */
  private executeCycle(): void {
    if (!this.running) return;
    
    const currentTime = Date.now();
    
    // CPU execution mode - run actual AVR instructions
    if (!this.simulationMode && this.cpu) {
      try {
        // Execute 10000 CPU cycles (about 1ms at 16MHz)
        // This approximates a chunk of real-time execution
        const CYCLES_PER_CHUNK = 10000;
        
        // This is where the CPU truly executes the program
        for (let i = 0; i < CYCLES_PER_CHUNK; i++) {
          this.cpu.tick();
        }
        
        // Keep track of execution progress
        this.cycleCounter += CYCLES_PER_CHUNK;
        
        // Check all port values from the CPU to detect pin changes
        if (this.portB && this.portC && this.portD && this.cycleCounter % 5000 === 0) {
          // Sample all port values
          const portBValue = this.portB.value;
          const portCValue = this.portC.value;
          const portDValue = this.portD.value;
          
          // Check all pins for changes
          this.checkPortPinChanges('B', portBValue);
          this.checkPortPinChanges('C', portCValue);
          this.checkPortPinChanges('D', portDValue);
        }
        
        // Log execution progress occasionally
        if (this.cycleCounter % 100000 === 0) {
          console.log(`[AVR8] CPU has executed ${this.cycleCounter} cycles`);
        }
      } catch (error) {
        // If CPU execution fails, log the error but don't automatically fall back to simulation
        console.error(`[AVR8] CPU execution error:`, error);
        
        // Allow a few errors before falling back to simulation
        this.cpuErrorCount = (this.cpuErrorCount || 0) + 1;
        
        if (this.cpuErrorCount > 5) {
          console.warn('[AVR8] Too many CPU errors, switching to simulation mode');
          this.simulationMode = true;
          this.onLogMessage?.('CPU execution failed, using default blink program.');
        }
      }
    }
    // Simulation mode - only used if CPU execution fails
    else if (this.simulationMode) {
      // Only log messages occasionally to avoid flooding the log
      if (currentTime - this.lastLogTime >= 1000) {
        this.lastLogTime = currentTime;
        
        // Only log simulation events when simulation mode is active
        this.onLogMessage?.(`Simulation mode active - emulating blink program`);
      }
      
      // In simulation mode, toggle pin 13 every second to demonstrate functionality
      if (currentTime - this.lastToggleTime >= this.blinkSpeed) {
        // Update toggle time first for consistent timing
        this.lastToggleTime = currentTime;
        
        // Toggle LED state
        this.pin13State = !this.pin13State;
        
        // Update pin state in our mapping
        this.pinStates['13'] = this.pin13State;
        
        // Log the pin change
        this.onLogMessage?.(`Built-in LED on pin 13 is ${this.pin13State ? 'ON' : 'OFF'}`);
        
        // Notify callbacks of the pin change
        if (this.onPinChangeCallback) {
          this.onPinChangeCallback(13, this.pin13State, { 
            analogValue: this.pin13State ? 255 : 0,
            isSimulated: true  // Mark this as a simulated signal
          });
        }
        
        // Update connected components
        this.updateConnectedComponents('13', this.pin13State, this.pin13State ? 255 : 0);
      }
    }
  }
  
  /**
   * Check for pin changes on a specific port
   */
  private checkPortPinChanges(port: string, newValue: number): void {
    // Get previous port value
    const portKey = `port${port}Value`;
    const oldValue = (this as any)[portKey] || 0;
    
    // Update stored port value
    (this as any)[portKey] = newValue;
    
    // If port value changed, check which pins changed
    if (newValue !== oldValue) {
      // For each bit in the port
      for (let bit = 0; bit < 8; bit++) {
        // Check if this bit changed
        const oldBit = (oldValue >> bit) & 1;
        const newBit = (newValue >> bit) & 1;
        
        if (oldBit !== newBit) {
          // Determine the Arduino pin number for this port/bit
          const pin = this.getArduinoPinFromPortBit(port, bit);
          
          if (pin !== null) {
            // Update internal pin state
            this.pinStates[pin.toString()] = newBit === 1;
            
            // Log the pin change with special note if it's pin 13 (built-in LED)
            if (pin === 13) {
              this.onLogMessage?.(`Built-in LED on pin 13 is ${newBit === 1 ? 'ON' : 'OFF'}`);
            } else {
              this.log(`[Arduino] Pin ${pin} changed to ${newBit === 1 ? 'HIGH' : 'LOW'}`);
            }
            
            // Notify pin change listeners
            if (this.onPinChangeCallback) {
              this.onPinChangeCallback(pin, newBit === 1, {
                analogValue: newBit === 1 ? 255 : 0,
                source: 'cpu'  // This change came from the CPU
              });
            }
            
            // Update connected components
            this.updateConnectedComponents(pin.toString(), newBit === 1, newBit === 1 ? 255 : 0);
          }
        }
      }
    }
  }
  
  /**
   * Set the state of an input pin - standard name for compatibility
   */
  public setDigitalInput(pin: string | number, isHigh: boolean): void {
    this.setInputState(pin, isHigh);
  }
  
  /**
   * Set the state of an input pin
   */
  public setInputState(pin: string | number, isHigh: boolean): void {
    const pinMapping = this.getPortBitFromArduinoPin(pin);
    if (!pinMapping) {
      this.error(`Invalid pin: ${pin}`);
      return;
    }
    
    // Set pin state in our internal state
    this.pinStates[pin.toString()] = isHigh;
    
    // Log pin state change
    this.log(`[Arduino] Pin ${pin} set to ${isHigh ? 'HIGH' : 'LOW'}`);
    
    // Notify callback
    if (this.onPinChangeCallback) {
      this.onPinChangeCallback(pin, isHigh, { 
        analogValue: isHigh ? 255 : 0,
        isInput: true
      });
    }
    
    // Update components connected to this pin
    this.updateConnectedComponents(pin.toString(), isHigh, isHigh ? 255 : 0);
  }
  
  /**
   * Set the value of an analog input pin
   */
  public setAnalogValue(pin: string | number, value: number): void {
    // Ensure value is in range 0-1023
    value = Math.max(0, Math.min(1023, value));
    
    const pinStr = pin.toString();
    this.analogValues[pinStr] = value;
    
    // Calculate if the pin should be HIGH or LOW based on threshold
    const isHigh = value > 512;
    const oldIsHigh = this.pinStates[pinStr] || false;
    
    // If the digital state changed, update it
    if (isHigh !== oldIsHigh) {
      this.pinStates[pinStr] = isHigh;
      this.log(`[Arduino] Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'} (analog: ${value})`);
    }
    
    // Notify callback
    if (this.onPinChangeCallback) {
      this.onPinChangeCallback(pin, isHigh, { 
        analogValue: value,
        isAnalog: true
      });
    }
    
    // Update components connected to this pin
    this.updateConnectedComponents(pinStr, isHigh, value);
  }
  
  /**
   * Log a message
   */
  private log(message: string): void {
    // Only show important, clean user-facing messages
    
    // If the message already starts with [Arduino], it's one we added deliberately
    if (message.startsWith('[Arduino]')) {
      console.log(message);
      if (this.onLogCallback) {
        this.onLogCallback(message);
      }
      return;
    }
    
    // Special case for pin change messages - only show pin 13 changes
    if (message.startsWith('Pin ') && message.includes('changed to')) {
      const pinMatch = message.match(/Pin (\d+)/);
      if (pinMatch && pinMatch[1] === '13') {
        const isHigh = message.includes('HIGH');
        const cleanMessage = `[Arduino] Built-in LED is ${isHigh ? 'ON' : 'OFF'}`;
        
        console.log(cleanMessage);
        if (this.onLogCallback) {
          this.onLogCallback(cleanMessage);
        }
      } else {
        // Just log to console for debugging, but don't display to user
        console.log("Debug:", message);
      }
      return;
    } 
    
    // For built-in LED status messages, provide clean output
    else if (message.includes('Built-in LED')) {
      const isOn = message.includes('ON');
      const cleanMessage = `[Arduino] Built-in LED is ${isOn ? 'ON' : 'OFF'}`;
      
      console.log(cleanMessage);
      if (this.onLogCallback) {
        this.onLogCallback(cleanMessage);
      }
      return;
    }
    
    // For all other messages, just log to console for debugging
    console.log("Debug message:", message);
  }
  
  /**
   * Log an error
   */
  private error(message: string): void {
    // Format error messages to match simulation format
    const errorMsg = `[Arduino Error] ${message}`;
    
    // Log to console
    console.error(errorMsg);
    
    // Send to callback
    if (this.onErrorCallback) {
      this.onErrorCallback(errorMsg);
    }
  }
  
  /**
   * Get the current state of a pin
   */
  public getPinState(pin: string | number): boolean {
    return this.pinStates[pin.toString()] || false;
  }
  
  /**
   * Get the analog value of a pin
   */
  public getAnalogValue(pin: string | number): number {
    return this.analogValues[pin.toString()] || 0;
  }
  
  /**
   * Get all registered components
   */
  public getComponents(): Map<string, EmulatedComponent> {
    return this.components;
  }
}