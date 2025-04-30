/**
 * Utility functions for circuit simulation
 */

// Default Arduino sketch (blink example)
export const defaultSketch = `// Arduino sketch for circuit simulation

void setup() {
  // Initialize digital pin LED_BUILTIN as an output
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);  // Turn the LED on
  delay(1000);             // Wait for a second
  digitalWrite(13, LOW);   // Turn the LED off
  delay(1000);             // Wait for a second
}`;

// Map component types to pin configurations
export const componentPinMap = {
  'led': {
    pins: ['anode', 'cathode'],
    inputs: ['anode'],
    outputs: ['cathode'],
    updateState: (component, pinStates) => {
      // LED lights up when anode is HIGH and cathode is LOW (or connected to GND)
      const anodeHigh = pinStates.anode === true;
      const cathodeLow = pinStates.cathode === false;
      
      return {
        ...component,
        isLit: anodeHigh && cathodeLow,
        value: anodeHigh && cathodeLow ? 1 : 0
      };
    }
  },
  'rgb-led': {
    pins: ['r', 'g', 'b', 'common'],
    inputs: ['r', 'g', 'b'],
    outputs: ['common'],
    updateState: (component, pinStates) => {
      // RGB LED has separate pins for each color
      const isCommonAnode = component.commonPin === 'anode';
      
      // For common anode: pins need to be LOW to light up
      // For common cathode: pins need to be HIGH to light up
      const redOn = isCommonAnode ? !pinStates.r : pinStates.r;
      const greenOn = isCommonAnode ? !pinStates.g : pinStates.g;
      const blueOn = isCommonAnode ? !pinStates.b : pinStates.b;
      
      return {
        ...component,
        redValue: redOn ? 1 : 0,
        greenValue: greenOn ? 1 : 0,
        blueValue: blueOn ? 1 : 0
      };
    }
  },
  'buzzer': {
    pins: ['positive', 'negative'],
    inputs: ['positive'],
    outputs: ['negative'],
    updateState: (component, pinStates) => {
      // Buzzer sounds when positive is HIGH and negative is LOW
      const positiveHigh = pinStates.positive === true;
      const negativeLow = pinStates.negative === false;
      
      return {
        ...component,
        hasSignal: positiveHigh && negativeLow
      };
    }
  },
  'photoresistor': {
    pins: ['positive', 'negative'],
    outputs: ['positive'],
    inputs: ['negative'],
    // Photoresistor provides variable resistance based on light level
    // In simulation, we'll just use this as a sensor that can be manually adjusted
  },
  'resistor': {
    pins: ['terminal1', 'terminal2'],
    passthrough: true, // Resistors pass signals through
    updateState: (component, pinStates) => {
      // Resistors don't change visually, they just affect circuit characteristics
      return component;
    }
  },
};

// Helper to determine if a pin is an input or output
export const isPinInput = (componentType, pinName) => {
  const config = componentPinMap[componentType];
  if (!config) return false;
  
  return config.inputs && config.inputs.includes(pinName);
};

// Helper to determine if a pin is an output
export const isPinOutput = (componentType, pinName) => {
  const config = componentPinMap[componentType];
  if (!config) return false;
  
  return config.outputs && config.outputs.includes(pinName);
};

// Map Arduino pins to hardware pins
export const arduinoPinMap = {
  0: { port: 'D', pin: 0 },   // RX
  1: { port: 'D', pin: 1 },   // TX
  2: { port: 'D', pin: 2 },   // Digital pin 2
  3: { port: 'D', pin: 3 },   // Digital pin 3 (PWM)
  4: { port: 'D', pin: 4 },   // Digital pin 4
  5: { port: 'D', pin: 5 },   // Digital pin 5 (PWM)
  6: { port: 'D', pin: 6 },   // Digital pin 6 (PWM)
  7: { port: 'D', pin: 7 },   // Digital pin 7
  8: { port: 'B', pin: 0 },   // Digital pin 8
  9: { port: 'B', pin: 1 },   // Digital pin 9 (PWM)
  10: { port: 'B', pin: 2 },  // Digital pin 10 (PWM, SS)
  11: { port: 'B', pin: 3 },  // Digital pin 11 (PWM, MOSI)
  12: { port: 'B', pin: 4 },  // Digital pin 12 (MISO)
  13: { port: 'B', pin: 5 },  // Digital pin 13 (SCK, LED_BUILTIN)
  A0: { port: 'C', pin: 0 },  // Analog pin 0
  A1: { port: 'C', pin: 1 },  // Analog pin 1
  A2: { port: 'C', pin: 2 },  // Analog pin 2
  A3: { port: 'C', pin: 3 },  // Analog pin 3
  A4: { port: 'C', pin: 4 },  // Analog pin 4 (SDA)
  A5: { port: 'C', pin: 5 },  // Analog pin 5 (SCL)
};

// Helper function to get the pin signal level (HIGH or LOW)
export const getPinSignalLevel = (pin, digitalState) => {
  // digitalState is the state object from the simulator
  // with HIGH (true) or LOW (false) values for each pin
  
  if (digitalState[pin] === undefined) {
    return false; // Default to LOW if pin state is unknown
  }
  
  return digitalState[pin];
};

// Debug helper to print the state of all pins
export const logPinStates = (pinStates) => {
  console.log('=== Pin States ===');
  Object.entries(pinStates).forEach(([pin, state]) => {
    console.log(`Pin ${pin}: ${state ? 'HIGH' : 'LOW'}`);
  });
  console.log('=================');
};

// Calculate the electrical state of a connected circuit
// This is a simplified simulation that propagates signals through connections
export const calculateCircuitState = (components, connections) => {
  // Start with all pins at default state (LOW)
  const pinStates = {};
  
  // Set known signal sources (e.g. from microcontroller outputs)
  // Iterate through connections to propagate signals
  
  // Return the calculated state of all pins
  return pinStates;
};

// Extract digitalWrite commands from code
export const extractDigitalWrites = (code) => {
  const results = [];
  const regex = /digitalWrite\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(HIGH|LOW)\s*\)/g;
  
  let match;
  while ((match = regex.exec(code)) !== null) {
    const pin = match[1] === 'LED_BUILTIN' ? 13 : parseInt(match[1]);
    const state = match[2] === 'HIGH';
    
    results.push({ pin, state });
  }
  
  return results;
};

// Extract function body from a function definition
export const extractFunctionBody = (code, functionName) => {
  // Look for the function definition
  const regex = new RegExp(`void\\s+${functionName}\\s*\\(\\s*\\)\\s*{([\\s\\S]*?)}`);
  const match = regex.exec(code);
  
  // Return the function body or empty string if not found
  return match ? match[1].trim() : '';
};

// Basic validation of Arduino syntax
export const validateArduinoSyntax = (code) => {
  const errors = [];
  const lines = code.split('\n');
  
  // Check for required functions
  if (!code.includes('void setup()')) {
    errors.push({ line: 1, message: 'Missing setup() function' });
  }
  
  if (!code.includes('void loop()')) {
    errors.push({ line: 1, message: 'Missing loop() function' });
  }
  
  // Very basic bracket matching
  let openBrackets = 0;
  lines.forEach((line, index) => {
    for (const char of line) {
      if (char === '{') openBrackets++;
      if (char === '}') openBrackets--;
      
      if (openBrackets < 0) {
        errors.push({ line: index + 1, message: 'Unexpected closing bracket' });
        openBrackets = 0; // Reset to avoid multiple errors
      }
    }
  });
  
  if (openBrackets > 0) {
    errors.push({ line: lines.length, message: 'Missing closing bracket' });
  }
  
  return errors;
};