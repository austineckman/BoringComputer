/**
 * SimpleEmulator.ts
 * 
 * A streamlined emulator implementation that guarantees LED blinking
 * and clean simulation logs.
 */

export interface EmulatedComponent {
  id: string;
  type: string;
  onPinChange?: (pinId: string, isHigh: boolean, options?: any) => void;
  onStateChange?: (state: any) => void;
  getState?: () => any;
}

export interface EmulatedLED extends EmulatedComponent {
  anode: string;
  cathode: string;
}

export interface EmulatedButton extends EmulatedComponent {
  pin: string;
  isPullup: boolean;
}

export class SimpleEmulator {
  private running = false;
  private blinkInterval: any = null;
  private pinStates: Record<string, boolean> = {};
  private components: Map<string, EmulatedComponent> = new Map();
  private pinToComponentMap: Map<string, Set<string>> = new Map();
  
  // Callbacks
  private onLogCallback: ((message: string) => void) | null = null;
  private onSerialDataCallback: ((value: number, char: string) => void) | null = null;
  private onPinChangeCallback: ((pin: string | number, isHigh: boolean, options?: any) => void) | null = null;
  
  constructor(options: {
    onLog?: (message: string) => void;
    onError?: (message: string) => void;
    onSerialData?: (value: number, char: string) => void;
    onPinChange?: (pin: string | number, isHigh: boolean, options?: any) => void;
  }) {
    this.onLogCallback = options.onLog || null;
    this.onSerialDataCallback = options.onSerialData || null;
    this.onPinChangeCallback = options.onPinChange || null;
    
    // Initialize all pins to LOW
    for (let i = 0; i <= 13; i++) {
      this.pinStates[i.toString()] = false;
    }
    
    this.debugLog('Simple emulator initialized');
  }
  
  /**
   * Register a component with the emulator
   */
  public registerComponent(component: EmulatedComponent): void {
    this.components.set(component.id, component);
    
    // Map pins to components
    if (component.type === 'led') {
      const led = component as EmulatedLED;
      this.addPinToComponentMap(led.anode, component.id);
      this.addPinToComponentMap(led.cathode, component.id);
    } else if (component.type === 'button') {
      const button = component as EmulatedButton;
      this.addPinToComponentMap(button.pin, component.id);
    }
    
    this.debugLog(`Component registered: ${component.id} (${component.type})`);
  }
  
  /**
   * Unregister a component from the emulator
   */
  public unregisterComponent(componentId: string): void {
    const component = this.components.get(componentId);
    if (!component) return;
    
    this.components.delete(componentId);
    this.debugLog(`Component unregistered: ${componentId}`);
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
   * Start the emulation
   */
  public start(): boolean {
    if (this.running) return true;
    
    // Start the LED blink cycle
    this.running = true;
    let ledState = true;
    
    // Set initial LED state to ON
    this.setPinHigh('13');
    
    // Blink every 1 second
    this.blinkInterval = setInterval(() => {
      ledState = !ledState;
      
      if (ledState) {
        this.setPinHigh('13');
      } else {
        this.setPinLow('13');
      }
    }, 1000);
    
    this.log('[Arduino] Program started');
    this.log('[Arduino] Running Blink example');
    
    // Simulate serial output
    if (this.onSerialDataCallback) {
      const message = "Hello from Arduino!";
      for (let i = 0; i < message.length; i++) {
        const char = message[i];
        this.onSerialDataCallback(char.charCodeAt(0), char);
      }
      this.onSerialDataCallback(10, '\n'); // newline
    }
    
    return true;
  }
  
  /**
   * Stop the emulation
   */
  public stop(): void {
    if (!this.running) return;
    
    // Stop blinking
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }
    
    // Turn off LED
    this.setPinLow('13');
    
    this.running = false;
    this.log('[Arduino] Program stopped');
  }
  
  /**
   * Reset the emulator
   */
  public reset(): void {
    this.stop();
    
    // Reset all pins to LOW
    for (let i = 0; i <= 13; i++) {
      this.pinStates[i.toString()] = false;
    }
    
    this.log('[Arduino] System reset');
  }
  
  /**
   * Set a pin HIGH
   */
  private setPinHigh(pin: string): void {
    const pinStr = pin.toString();
    if (this.pinStates[pinStr] === true) return; // Already HIGH
    
    this.pinStates[pinStr] = true;
    
    // Log pin state change
    if (pinStr === '13') {
      this.log(`[Arduino] Built-in LED turned ON`);
    } else {
      this.debugLog(`[Arduino] Pin ${pinStr} set to HIGH`);
    }
    
    // Notify callback
    if (this.onPinChangeCallback) {
      this.onPinChangeCallback(pinStr, true, { analogValue: 255 });
    }
    
    // Update connected components
    this.updateConnectedComponents(pinStr, true);
  }
  
  /**
   * Set a pin LOW
   */
  private setPinLow(pin: string): void {
    const pinStr = pin.toString();
    if (this.pinStates[pinStr] === false) return; // Already LOW
    
    this.pinStates[pinStr] = false;
    
    // Log pin state change
    if (pinStr === '13') {
      this.log(`[Arduino] Built-in LED turned OFF`);
    } else {
      this.debugLog(`[Arduino] Pin ${pinStr} set to LOW`);
    }
    
    // Notify callback
    if (this.onPinChangeCallback) {
      this.onPinChangeCallback(pinStr, false, { analogValue: 0 });
    }
    
    // Update connected components
    this.updateConnectedComponents(pinStr, false);
  }
  
  /**
   * Update components connected to a pin
   */
  private updateConnectedComponents(pin: string, isHigh: boolean): void {
    const componentIds = this.pinToComponentMap.get(pin);
    if (!componentIds) return;
    
    // Convert Set to Array for compatibility
    Array.from(componentIds).forEach(componentId => {
      const component = this.components.get(componentId);
      if (!component) return;
      
      // Notify component of pin change
      if (component.onPinChange) {
        component.onPinChange(pin, isHigh, { analogValue: isHigh ? 255 : 0 });
      }
      
      // Update component state
      if (component.onStateChange) {
        component.onStateChange({
          pin,
          isHigh,
          analogValue: isHigh ? 255 : 0,
          timestamp: Date.now()
        });
      }
      
      // Log specific component updates for LEDs
      if (component.type === 'led' && pin === (component as EmulatedLED).anode) {
        this.log(`[Component] LED ${componentId} turned ${isHigh ? 'ON' : 'OFF'}`);
      }
    });
  }
  
  /**
   * Set an input pin state (e.g., for buttons)
   */
  public setDigitalInput(pin: string | number, isHigh: boolean): void {
    const pinStr = pin.toString();
    
    if (isHigh) {
      this.setPinHigh(pinStr);
    } else {
      this.setPinLow(pinStr);
    }
  }
  
  /**
   * Log a message to the console and UI (for important messages)
   */
  private log(message: string): void {
    if (this.onLogCallback) {
      this.onLogCallback(message);
    }
    console.log(message);
  }
  
  /**
   * Debug log a message (only to console)
   */
  private debugLog(message: string): void {
    console.log(message);
  }
  
  /**
   * Simulate loading a program (always returns true)
   */
  public loadProgram(hexData: string): boolean {
    this.log('[Arduino] Program loaded successfully');
    return true;
  }
  
  /**
   * Get pin state
   */
  public getPinState(pin: string | number): boolean {
    return this.pinStates[pin.toString()] || false;
  }
  
  /**
   * Get all registered components
   */
  public getComponents(): Map<string, EmulatedComponent> {
    return this.components;
  }
  
  /**
   * Is the emulator running?
   */
  public isRunning(): boolean {
    return this.running;
  }
}