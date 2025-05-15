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
  
  constructor(options: {
    onPinChange?: (pin: string | number, isHigh: boolean, options?: any) => void;
    onSerialData?: (value: number, char: string) => void;
    onLog?: (message: string) => void;
    onError?: (message: string) => void;
  } = {}) {
    this.onPinChangeCallback = options.onPinChange || null;
    this.onSerialDataCallback = options.onSerialData || null;
    this.onLogCallback = options.onLog || null;
    this.onErrorCallback = options.onError || null;
    
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
    this.usart = new AVRUSART(this.cpu, usart0Config);
    
    // Set up USART serial output callback
    if (this.usart) {
      this.usart.onByteTransmit = (value: number) => {
        if (this.onSerialDataCallback) {
          const char = String.fromCharCode(value);
          this.onSerialDataCallback(value, char);
        }
      };
    }
    
    // Create SPI interface
    this.spi = new AVRSPI(this.cpu, spiConfig, this.portB as AVRIOPort);
    
    // Create I2C/TWI interface for OLED displays and other I2C devices
    this.twi = new AVRTWI(this.cpu, twiConfig, this.portC as AVRIOPort);
    
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
    
    this.log('HERO Board emulator initialized');
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
          // Update internal pin state
          this.pinStates[pin] = isHigh;
          
          // Calculate analog value for PWM pins
          let analogValue = isHigh ? 255 : 0;
          if (PWM_PINS.includes(Number(pin))) {
            // For PWM pins, we need to get the duty cycle from the timer
            // This is a simplification - in a full implementation, we would
            // get the actual PWM duty cycle from the timer
            analogValue = isHigh ? 255 : 0;
            this.analogValues[pin] = analogValue;
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
    // Get all components connected to this pin
    const connectedComponentIds = this.pinToComponentMap.get(pin);
    if (!connectedComponentIds) return;
    
    // Update each connected component
    connectedComponentIds.forEach(componentId => {
      const component = this.components.get(componentId);
      if (!component) return;
      
      // Handle specific component types
      if (component.type === 'led') {
        this.updateLEDComponent(component as EmulatedLED, pin, isHigh);
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
    }
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
    // A buzzer's tone changes based on PWM frequency
    if (buzzer.onStateChange) {
      buzzer.onStateChange({ isOn: isHigh, intensity: analogValue });
    }
    
    if (buzzer.onPinChange) {
      buzzer.onPinChange(changedPin, isHigh, { analogValue });
    }
  }
  
  /**
   * Update servo component state based on pin change
   */
  private updateServoComponent(servo: EmulatedComponent, changedPin: string, analogValue: number) {
    // Servos use PWM to control position
    // The angle is proportional to the duty cycle
    
    // Map analogValue (0-255) to angle (0-180)
    const angle = Math.round(analogValue / 255 * 180);
    
    if (servo.onStateChange) {
      servo.onStateChange({ angle });
    }
    
    if (servo.onPinChange) {
      servo.onPinChange(changedPin, true, { angle, analogValue });
    }
  }
  
  /**
   * Register a component with the emulator
   */
  public registerComponent(component: EmulatedComponent): void {
    this.components.set(component.id, component);
    
    // Map pins to components for efficient lookup
    if (component.type === 'led') {
      const led = component as EmulatedLED;
      this.addPinToComponentMap(led.anode, component.id);
      this.addPinToComponentMap(led.cathode, component.id);
    } else if (component.type === 'rgb-led') {
      const rgbLed = component as EmulatedRGBLED;
      this.addPinToComponentMap(rgbLed.redPin, component.id);
      this.addPinToComponentMap(rgbLed.greenPin, component.id);
      this.addPinToComponentMap(rgbLed.bluePin, component.id);
      this.addPinToComponentMap(rgbLed.commonPin, component.id);
    } else if (component.type === 'button') {
      const button = component as EmulatedButton;
      this.addPinToComponentMap(button.pin, component.id);
    } else if (component.type === 'oled-display') {
      const oled = component as EmulatedOLEDDisplay;
      this.addPinToComponentMap(oled.sclPin, component.id);
      this.addPinToComponentMap(oled.sdaPin, component.id);
      if (oled.resetPin) {
        this.addPinToComponentMap(oled.resetPin, component.id);
      }
    }
    
    this.log(`Registered component: ${component.id} (${component.type})`);
  }
  
  /**
   * Unregister a component from the emulator
   */
  public unregisterComponent(componentId: string): void {
    const component = this.components.get(componentId);
    if (!component) return;
    
    // Remove from components map
    this.components.delete(componentId);
    
    // Remove from pin-to-component map
    Array.from(this.pinToComponentMap.entries()).forEach(([pin, componentIds]) => {
      componentIds.delete(componentId);
      if (componentIds.size === 0) {
        this.pinToComponentMap.delete(pin);
      }
    });
    
    this.log(`Unregistered component: ${componentId}`);
  }
  
  /**
   * Helper method to add a pin-to-component mapping
   */
  private addPinToComponentMap(pin: string, componentId: string): void {
    if (!this.pinToComponentMap.has(pin)) {
      this.pinToComponentMap.set(pin, new Set<string>());
    }
    this.pinToComponentMap.get(pin)?.add(componentId);
  }
  
  /**
   * Set input for a button or other input device
   */
  public setDigitalInput(pin: string | number, isHigh: boolean): void {
    const mapping = this.getPortBitFromArduinoPin(pin);
    if (!mapping || !this.cpu) return;
    
    // Get the appropriate port
    let port: AVRIOPort | null = null;
    if (mapping.port === 'B') port = this.portB;
    else if (mapping.port === 'C') port = this.portC;
    else if (mapping.port === 'D') port = this.portD;
    
    if (!port) return;
    
    // Set the pin value in the hardware emulator
    // Note: These method calls may depend on the specific version of avr8js library
    // If your version has different methods, use those instead
    try {
      if (isHigh) {
        port.setPin(mapping.bit, true);
      } else {
        port.setPin(mapping.bit, false);
      }
    } catch (e) {
      this.error(`Failed to set digital input on pin ${pin}: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    this.log(`Set digital input on pin ${pin}: ${isHigh ? 'HIGH' : 'LOW'}`);
  }
  
  /**
   * Set analog input for a sensor or other analog device
   */
  public setAnalogInput(pin: string, value: number): void {
    if (!ANALOG_PINS.includes(pin)) {
      this.error(`Invalid analog pin: ${pin}`);
      return;
    }
    
    // Clamp value to 0-1023 range (10-bit ADC)
    const analogValue = Math.max(0, Math.min(1023, value));
    
    // Update internal state
    this.analogValues[pin] = analogValue;
    
    // In a real implementation, this would update the ADC register
    // For now, just log the change
    this.log(`Set analog input on pin ${pin}: ${analogValue}`);
    
    // Notify connected components
    const isHigh = analogValue > 512; // Simple digital threshold
    this.updateConnectedComponents(pin, isHigh, analogValue);
  }
  
  /**
   * Load compiled program into the emulator
   */
  public loadProgram(hexData: string): boolean {
    try {
      // Stop the emulator if it's running
      this.stop();
      
      // Clear the program memory
      this.program = new Uint16Array(0x8000);
      
      // Parse the hex file and load it into program memory
      const success = this.loadHexFile(hexData);
      
      if (success) {
        this.log('Program loaded successfully');
      } else {
        this.error('Failed to load program');
      }
      
      return success;
    } catch (error) {
      this.error(`Error loading program: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  /**
   * Parse a hex file and load it into program memory
   */
  private loadHexFile(hexData: string): boolean {
    try {
      const lines = hexData.split('\n');
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.startsWith(':')) {
          const byteCount = parseInt(line.substr(1, 2), 16);
          const address = parseInt(line.substr(3, 4), 16);
          const recordType = parseInt(line.substr(7, 2), 16);
          
          if (recordType === 0) {
            // Data record
            for (let i = 0; i < byteCount; i += 2) {
              const byteIndex = 9 + i * 2;
              const byte1 = parseInt(line.substr(byteIndex, 2), 16);
              const byte2 = i + 1 < byteCount ? parseInt(line.substr(byteIndex + 2, 2), 16) : 0;
              
              const wordValue = byte1 | (byte2 << 8);
              const wordAddress = (address + i) / 2;
              
              if (wordAddress < this.program.length) {
                this.program[wordAddress] = wordValue;
              } else {
                this.error(`Program address out of range: ${wordAddress}`);
              }
            }
          }
        } else {
          this.error(`Invalid hex file line: ${line}`);
        }
      }
      
      return true;
    } catch (error) {
      this.error(`Error parsing hex file: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  /**
   * Start the emulation
   */
  public start(): boolean {
    if (this.running) return true;
    if (!this.cpu) {
      this.error('Emulator not initialized');
      return false;
    }
    
    // Reset the CPU
    this.cpu.reset();
    
    // Start executing CPU cycles
    this.running = true;
    this.cycleInterval = setInterval(() => this.executeCycle(), 10);
    
    this.log('Emulation started');
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
    this.log('Emulation stopped');
  }
  
  /**
   * Reset the emulator
   */
  public reset(): void {
    // Stop execution
    this.stop();
    
    // Reset all pin states
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
    
    // Reset CPU and peripherals
    if (this.cpu) {
      this.cpu.reset();
    }
    
    this.log('Emulator reset');
  }
  
  /**
   * Execute a cycle of the CPU
   */
  private executeCycle(): void {
    if (!this.cpu || !this.running) return;
    
    // Execute 10000 CPU cycles (about 1ms at 16MHz)
    for (let i = 0; i < 10000; i++) {
      this.cpu.tick();
    }
  }
  
  /**
   * Log a message
   */
  private log(message: string): void {
    if (this.onLogCallback) {
      this.onLogCallback(`[HERO Emulator] ${message}`);
    }
    console.log(`[HERO Emulator] ${message}`);
  }
  
  /**
   * Log an error
   */
  private error(message: string): void {
    if (this.onErrorCallback) {
      this.onErrorCallback(`[HERO Emulator Error] ${message}`);
    }
    console.error(`[HERO Emulator Error] ${message}`);
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