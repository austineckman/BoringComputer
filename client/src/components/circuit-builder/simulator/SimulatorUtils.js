/**
 * SimulatorUtils.js
 * 
 * Utility functions for circuit simulation and Arduino code processing
 */

// Default Arduino sketch for new projects
export const defaultSketch = `// This example blinks an LED connected to pin 13 (or the built-in LED)
// This is a great first test for your Arduino setup!

void setup() {
  // Initialize digital pin LED_BUILTIN (usually pin 13) as an output
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Add more pin initializations here if needed
  // For example: pinMode(10, OUTPUT); // for another LED
}

void loop() {
  // Turn the LED on
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);  // Wait for 1 second (1000 milliseconds)
  
  // Turn the LED off
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);  // Wait for 1 second
  
  // The loop repeats indefinitely
}

/* 
  Common Arduino functions:
  
  - digitalWrite(pin, value): Sets a digital pin to HIGH or LOW
  - digitalRead(pin): Reads a digital pin, returns HIGH or LOW
  - analogWrite(pin, value): Sets an analog value (PWM) on a pin (0-255)
  - analogRead(pin): Reads an analog input, returns 0-1023
  - delay(ms): Pauses program execution for 'ms' milliseconds
  - millis(): Returns time since program started in milliseconds
*/`;

// Map of component types to their pin configurations
export const componentPinMap = {
  led: {
    A: { type: 'input', description: 'Anode (+)' },
    C: { type: 'output', description: 'Cathode (-)' }
  },
  rgbled: {
    A: { type: 'input', description: 'Common Anode (+)' },
    R: { type: 'output', description: 'Red Cathode (-)' },
    G: { type: 'output', description: 'Green Cathode (-)' },
    B: { type: 'output', description: 'Blue Cathode (-)' }
  },
  buzzer: {
    '+': { type: 'input', description: 'Positive (+)' },
    '-': { type: 'output', description: 'Negative (-)' }
  },
  button: {
    '1': { type: 'input', description: 'Terminal 1' },
    '2': { type: 'output', description: 'Terminal 2' }
  },
  resistor: {
    '1': { type: 'bidirectional', description: 'Terminal 1' },
    '2': { type: 'bidirectional', description: 'Terminal 2' }
  },
  potentiometer: {
    '1': { type: 'bidirectional', description: 'Terminal 1' },
    '2': { type: 'bidirectional', description: 'Wiper (Middle)' },
    '3': { type: 'bidirectional', description: 'Terminal 3' }
  },
  photoresistor: {
    'pin-915': { type: 'bidirectional', description: 'Terminal 1' },
    'pin-916': { type: 'bidirectional', description: 'Terminal 2' }
  },
  switch: {
    '1': { type: 'input', description: 'Terminal 1' },
    '2': { type: 'output', description: 'Terminal 2' }
  },
  servo: {
    '+': { type: 'input', description: 'Power (+)' },
    '-': { type: 'output', description: 'Ground (-)' },
    'S': { type: 'input', description: 'Signal' }
  },
  heroboard: {
    // Digital pins
    '0': { type: 'digital', description: 'Digital Pin 0 (RX)' },
    '1': { type: 'digital', description: 'Digital Pin 1 (TX)' },
    '2': { type: 'digital', description: 'Digital Pin 2' },
    '3': { type: 'digital', description: 'Digital Pin 3 (PWM)' },
    '4': { type: 'digital', description: 'Digital Pin 4' },
    '5': { type: 'digital', description: 'Digital Pin 5 (PWM)' },
    '6': { type: 'digital', description: 'Digital Pin 6 (PWM)' },
    '7': { type: 'digital', description: 'Digital Pin 7' },
    '8': { type: 'digital', description: 'Digital Pin 8' },
    '9': { type: 'digital', description: 'Digital Pin 9 (PWM)' },
    '10': { type: 'digital', description: 'Digital Pin 10 (PWM/SS)' },
    '11': { type: 'digital', description: 'Digital Pin 11 (PWM/MOSI)' },
    '12': { type: 'digital', description: 'Digital Pin 12 (MISO)' },
    '13': { type: 'digital', description: 'Digital Pin 13 (SCK/LED)' },
    // Analog pins
    'A0': { type: 'analog', description: 'Analog Pin 0' },
    'A1': { type: 'analog', description: 'Analog Pin 1' },
    'A2': { type: 'analog', description: 'Analog Pin 2' },
    'A3': { type: 'analog', description: 'Analog Pin 3' },
    'A4': { type: 'analog', description: 'Analog Pin 4 (SDA)' },
    'A5': { type: 'analog', description: 'Analog Pin 5 (SCL)' },
    // Power pins
    '5V': { type: 'power', description: '5V Power' },
    '3V3': { type: 'power', description: '3.3V Power' },
    'GND': { type: 'ground', description: 'Ground' },
    'AREF': { type: 'reference', description: 'Analog Reference' },
    'RESET': { type: 'reset', description: 'Reset' }
  }
};

// Check if a pin is an input pin for a component
export const isPinInput = (componentType, pinName) => {
  if (!componentPinMap[componentType] || !componentPinMap[componentType][pinName]) {
    return false;
  }
  return componentPinMap[componentType][pinName].type === 'input' || 
         componentPinMap[componentType][pinName].type === 'bidirectional';
};

// Check if a pin is an output pin for a component
export const isPinOutput = (componentType, pinName) => {
  if (!componentPinMap[componentType] || !componentPinMap[componentType][pinName]) {
    return false;
  }
  return componentPinMap[componentType][pinName].type === 'output' || 
         componentPinMap[componentType][pinName].type === 'bidirectional';
};

// Map Arduino pin numbers to pin names on the HeroBoard
export const arduinoPinMap = {
  // Digital pins
  '0': 'D0',
  '1': 'D1',
  '2': 'D2',
  '3': 'D3',
  '4': 'D4',
  '5': 'D5',
  '6': 'D6',
  '7': 'D7',
  '8': 'D8',
  '9': 'D9',
  '10': 'D10',
  '11': 'D11',
  '12': 'D12',
  '13': 'D13',
  // Analog pins
  'A0': 'A0',
  'A1': 'A1',
  'A2': 'A2',
  'A3': 'A3',
  'A4': 'A4',
  'A5': 'A5',
  // Special pins
  'LED_BUILTIN': 'D13'
};

// Get the signal level for a pin based on digital state
export const getPinSignalLevel = (pin, digitalState) => {
  // If the pin is a digit, assume it's a digital pin
  if (/^\d+$/.test(pin)) {
    return digitalState[`D${pin}`] ? 'HIGH' : 'LOW';
  }
  
  // If the pin starts with A, it's an analog pin
  if (pin.startsWith('A')) {
    return digitalState[pin] !== undefined ? digitalState[pin] : 0;
  }
  
  // Handle special pins
  if (pin === 'LED_BUILTIN') {
    return digitalState['D13'] ? 'HIGH' : 'LOW';
  }
  
  // Default to LOW if not found
  return 'LOW';
};

// Log pin states for debugging
export const logPinStates = (pinStates) => {
  console.log('Current pin states:');
  Object.entries(pinStates).forEach(([pin, state]) => {
    console.log(`  ${pin}: ${state ? 'HIGH' : 'LOW'}`);
  });
};

// Calculate the circuit state based on connections and pin states
export const calculateCircuitState = (components, connections, microcontrollerPins = {}) => {
  // Results object
  const result = {
    componentStates: {},
    pinStates: { ...microcontrollerPins }  // Start with the current microcontroller pin states
  };
  
  // Helper to get a component by ID
  const getComponentById = (id) => {
    return components.find(c => c.id === id);
  };
  
  // First pass: propagate power from HERO board
  Object.entries(connections).forEach(([pinId, connectedPins]) => {
    // Only process pins that have a defined state
    if (microcontrollerPins[`D${pinId}`] !== undefined) {
      const isHigh = microcontrollerPins[`D${pinId}`];
      
      // For each connected pin, propagate the signal
      connectedPins.forEach(connectedPin => {
        const [componentType, pinName] = connectedPin.split(':');
        
        // Update component states based on what's connected
        if (componentType === 'led') {
          // LED lights up when anode (A) is HIGH and cathode (C) is connected to ground
          // For simplicity, we'll say it's lit if the pin it's connected to is HIGH
          if (pinName === 'A') {
            result.componentStates[`led-${componentType}`] = { 
              isLit: isHigh 
            };
          }
        } else if (componentType === 'rgbled') {
          // RGB LED has different pins for different colors
          const rgbLedState = result.componentStates[`rgbled-${componentType}`] || {
            redValue: 0,
            greenValue: 0,
            blueValue: 0
          };
          
          if (pinName === 'R') {
            rgbLedState.redValue = isHigh ? 1 : 0;
          } else if (pinName === 'G') {
            rgbLedState.greenValue = isHigh ? 1 : 0;
          } else if (pinName === 'B') {
            rgbLedState.blueValue = isHigh ? 1 : 0;
          }
          
          result.componentStates[`rgbled-${componentType}`] = rgbLedState;
        } else if (componentType === 'buzzer') {
          // Buzzer makes sound when there's a voltage across its terminals
          if (pinName === '+') {
            result.componentStates[`buzzer-${componentType}`] = { 
              hasSignal: isHigh 
            };
          }
        }
        // Add more component types as needed
      });
    }
  });
  
  return result;
};