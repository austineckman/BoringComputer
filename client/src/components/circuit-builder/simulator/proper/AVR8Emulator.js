/**
 * AVR8Emulator
 * 
 * A simplified emulator implementation that doesn't rely on avr8js yet.
 * This provides pin state simulation that allows components to visualize
 * their states correctly based on signals.
 */

// Maps Arduino pins to their typical usage
const PIN_MAPPING = {
  0: { name: 'D0', usage: 'RXD' },
  1: { name: 'D1', usage: 'TXD' },
  2: { name: 'D2', usage: 'INT0' },
  3: { name: 'D3', usage: 'INT1/PWM' },
  4: { name: 'D4', usage: 'Digital IO' },
  5: { name: 'D5', usage: 'PWM' },
  6: { name: 'D6', usage: 'PWM' },
  7: { name: 'D7', usage: 'Digital IO' },
  8: { name: 'D8', usage: 'Digital IO' },
  9: { name: 'D9', usage: 'PWM' },
  10: { name: 'D10', usage: 'PWM/SS' },
  11: { name: 'D11', usage: 'PWM/MOSI' },
  12: { name: 'D12', usage: 'MISO' },
  13: { name: 'D13', usage: 'SCK/LED' },
  'A0': { name: 'A0', usage: 'Analog Input' },
  'A1': { name: 'A1', usage: 'Analog Input' },
  'A2': { name: 'A2', usage: 'Analog Input' },
  'A3': { name: 'A3', usage: 'Analog Input' },
  'A4': { name: 'A4', usage: 'SDA/Analog Input' },
  'A5': { name: 'A5', usage: 'SCL/Analog Input' }
};

// Arduino digital pins
const DIGITAL_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Arduino PWM pins
const PWM_PINS = [3, 5, 6, 9, 10, 11];

// Arduino analog pins
const ANALOG_PINS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

/**
 * A simplified AVR8Emulator class that handles pin state changes and other
 * basic functions needed for the circuit simulator.
 */
export class AVR8Emulator {
  constructor(options = {}) {
    this.onPinChange = options.onPinChange || null;
    this.onSerialByte = options.onSerialByte || null;
    this.onError = options.onError || null;
    
    // Internal state
    this.running = false;
    this.intervalId = null;
    this.pinStates = {}; // Tracks current state of all pins
    this.analogValues = {}; // Tracks analog values (0-255) for PWM pins
    this.program = null;
    
    // Initialize pin states to LOW
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false; 
    });
    
    // Initialize analog pins to 0
    ANALOG_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      this.analogValues[pin] = 0;
    });
    
    // Initialize PWM values to 0
    PWM_PINS.forEach(pin => {
      this.analogValues[pin] = 0;
    });
  }

  /**
   * Load a compiled program
   * @param {Uint16Array} program - The program bytes
   * @returns {boolean} - Whether loading was successful
   */
  loadProgram(program) {
    try {
      this.stop();
      this.program = program;
      
      // Reset pin states
      this.reset();
      
      return true;
    } catch (err) {
      if (this.onError) {
        this.onError(`Failed to load program: ${err.message}`);
      } else {
        console.error('AVR8Emulator load error:', err);
      }
      return false;
    }
  }
  
  /**
   * Start the emulator with a basic simulation
   */
  start() {
    if (!this.program) {
      if (this.onError) {
        this.onError('Cannot start emulator: No program loaded');
      }
      return false;
    }
    
    if (this.running) return true; // Already running
    
    this.running = true;
    
    // Get the program type from the first byte (marker)
    const programType = this.program[0] || 1; // Default to blink (type 1)
    
    // Set behavior based on program type
    console.log(`[AVR8] Program type detected: ${programType}`);
    
    // Different delay times based on program complexity
    let delay = 1000; // Default delay
    
    // Execute specific program behaviors based on the type
    switch (programType) {
      case 1: // BLINK - Standard LED blink program
        console.log('[AVR8] Running blink program');
        this.intervalId = setInterval(() => {
          // Toggle pin 13 (built-in LED)
          this.setDigitalOutput(13, !this.pinStates[13]);
        }, delay);
        break;
        
      case 2: // LED_ON - LED stays on
        console.log('[AVR8] Running LED on program');
        // Turn on pin 13 and keep it on
        this.setDigitalOutput(13, true);
        break;
        
      case 3: // RGB_LED - RGB LED animation
        console.log('[AVR8] Running RGB LED program');
        delay = 200; // Faster for RGB
        this.intervalId = setInterval(() => {
          // For RGB LED, vary pin 9, 10, 11 values
          const r = Math.floor(Math.sin(Date.now() / 1000) * 127 + 128);
          const g = Math.floor(Math.sin(Date.now() / 1000 + 2) * 127 + 128);
          const b = Math.floor(Math.sin(Date.now() / 1000 + 4) * 127 + 128);
          
          this.setPWMOutput(9, r);
          this.setPWMOutput(10, g);
          this.setPWMOutput(11, b);
          
          // Also blink the built-in LED for visibility
          this.setDigitalOutput(13, !this.pinStates[13]);
        }, delay);
        break;
        
      case 4: // OLED - OLED display program
        console.log('[AVR8] Running OLED display program');
        // OLED displays typically use pins 4 (data) and 5 (clock) for I2C
        // and may also have other digital pins for control
        delay = 500;
        this.intervalId = setInterval(() => {
          // Toggle data and clock pins to simulate I2C
          this.setDigitalOutput(4, !this.pinStates[4]);
          this.setDigitalOutput(5, !this.pinStates[5]);
          
          // Also blink the built-in LED for visibility
          this.setDigitalOutput(13, !this.pinStates[13]);
        }, delay);
        break;
        
      case 5: // BUZZER - Buzzer program
        console.log('[AVR8] Running buzzer program');
        // Buzzer typically on pin 8
        delay = 300;
        this.intervalId = setInterval(() => {
          // Toggle buzzer pin to simulate tone
          this.setDigitalOutput(8, !this.pinStates[8]);
          
          // Also blink the built-in LED for visibility
          this.setDigitalOutput(13, !this.pinStates[13]);
        }, delay);
        break;
        
      default:
        // Default to simple blink behavior
        console.log('[AVR8] Running default program');
        this.intervalId = setInterval(() => {
          // Toggle pin 13 (built-in LED)
          this.setDigitalOutput(13, !this.pinStates[13]);
        }, delay);
        break;
    }
    
    return true;
  }
  
  /**
   * Stop the emulator
   */
  stop() {
    if (!this.running) return;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.running = false;
  }
  
  /**
   * Reset the emulator
   */
  reset() {
    this.stop();
    
    // Reset digital pins to LOW
    DIGITAL_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      
      // Notify about pin reset
      if (this.onPinChange) {
        this.onPinChange(pin, false);
      }
    });
    
    // Reset PWM values to 0
    PWM_PINS.forEach(pin => {
      this.analogValues[pin] = 0;
    });
    
    // Reset analog input pins
    ANALOG_PINS.forEach(pin => {
      this.pinStates[pin] = false;
      this.analogValues[pin] = 0;
    });
  }
  
  /**
   * Get the state of a pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @returns {boolean} - The current state of the pin (true = HIGH, false = LOW)
   */
  getPinState(pin) {
    return this.pinStates[pin] || false;
  }
  
  /**
   * Get the analog value of a pin (for PWM or analog pins)
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @returns {number} - The current analog value (0-255 for PWM, 0-1023 for analog inputs)
   */
  getAnalogValue(pin) {
    return this.analogValues[pin] || 0;
  }
  
  /**
   * Set digital output on a pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @param {boolean} value - true for HIGH, false for LOW
   */
  setDigitalOutput(pin, value) {
    // Update pin state
    this.pinStates[pin] = value;
    
    // For PWM pins, update analog value accordingly
    if (PWM_PINS.includes(Number(pin))) {
      this.analogValues[pin] = value ? 255 : 0;
    }
    
    // Notify about pin change
    if (this.onPinChange) {
      this.onPinChange(pin, value);
    }
  }
  
  /**
   * Set PWM output on a pin
   * @param {number} pin - The pin number (must be a PWM pin: 3, 5, 6, 9, 10, 11)
   * @param {number} value - Value between 0-255
   */
  setPWMOutput(pin, value) {
    if (!PWM_PINS.includes(Number(pin))) {
      return; // Not a PWM pin
    }
    
    // Clamp value to 0-255 range
    const analogValue = Math.max(0, Math.min(255, value));
    
    // Update analog value
    this.analogValues[pin] = analogValue;
    
    // Update digital state (HIGH if value > 0)
    const digitalValue = analogValue > 0;
    const stateChanged = this.pinStates[pin] !== digitalValue;
    this.pinStates[pin] = digitalValue;
    
    // Notify about pin change
    if (this.onPinChange) {
      this.onPinChange(pin, digitalValue, { analogValue });
    }
  }
  
  /**
   * Set input on a digital pin
   * @param {number|string} pin - The pin number (0-13) or analog pin name ('A0'-'A5')
   * @param {boolean} value - true for HIGH, false for LOW
   */
  setDigitalInput(pin, value) {
    // In a real implementation, this would actually set the input on the AVR port
    // For our simplified version, we'll just log it
    console.log(`[AVR8] Digital input on pin ${pin}: ${value ? 'HIGH' : 'LOW'}`);
  }
  
  /**
   * Set an analog input value
   * @param {string} pin - The analog pin name ('A0'-'A5')
   * @param {number} value - Value between 0-1023 (10-bit ADC value)
   */
  setAnalogInput(pin, value) {
    if (!ANALOG_PINS.includes(pin)) {
      return; // Not an analog pin
    }
    
    // Clamp value to 0-1023 range
    const analogValue = Math.max(0, Math.min(1023, value));
    
    // Update analog value
    this.analogValues[pin] = analogValue;
    
    // Update digital state (HIGH if value > 512)
    const digitalValue = analogValue > 512;
    this.pinStates[pin] = digitalValue;
    
    // In a real implementation, this would feed into the ADC
    console.log(`[AVR8] Analog input on pin ${pin}: ${analogValue}`);
  }
}