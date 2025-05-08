/**
 * SimulatorUtils.js
 * 
 * Utility functions for the Arduino simulator
 */

// Default Arduino sketch - used when creating a new project
export const defaultSketch = `// This example blinks an LED connected to pin 13 (or the built-in LED)
// This is a great first test for your Arduino setup!

void setup() {
  // Initialize digital pin LED_BUILTIN (usually pin 13) as an output
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Turn the LED on
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);  // Wait for 1 second
  
  // Turn the LED off
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);  // Wait for 1 second
}`;

// Map pin names to their numbers and functions
export const PIN_MAPPING = {
  // Digital pins
  D0: { number: 0, function: 'DIGITAL' },
  D1: { number: 1, function: 'DIGITAL' },
  D2: { number: 2, function: 'DIGITAL' },
  D3: { number: 3, function: 'DIGITAL' },
  D4: { number: 4, function: 'DIGITAL' },
  D5: { number: 5, function: 'DIGITAL' },
  D6: { number: 6, function: 'DIGITAL' },
  D7: { number: 7, function: 'DIGITAL' },
  D8: { number: 8, function: 'DIGITAL' },
  D9: { number: 9, function: 'DIGITAL' },
  D10: { number: 10, function: 'DIGITAL' },
  D11: { number: 11, function: 'DIGITAL' },
  D12: { number: 12, function: 'DIGITAL' },
  D13: { number: 13, function: 'DIGITAL' },
  
  // Analog pins
  A0: { number: 14, function: 'ANALOG' },
  A1: { number: 15, function: 'ANALOG' },
  A2: { number: 16, function: 'ANALOG' },
  A3: { number: 17, function: 'ANALOG' },
  A4: { number: 18, function: 'ANALOG' },
  A5: { number: 19, function: 'ANALOG' },
  
  // Power pins
  '5V': { number: -1, function: 'POWER' },
  '3V3': { number: -2, function: 'POWER' },
  'GND': { number: -3, function: 'GROUND' },
};

// Map component types to pin configurations
export const COMPONENT_PIN_CONFIGS = {
  'led': {
    anode: { type: 'positive', defaultSide: 'left' },
    cathode: { type: 'negative', defaultSide: 'right' },
    // LEDs typically need current limiting resistors
    resistorNeeded: true
  },
  'resistor': {
    pin1: { type: 'passive', defaultSide: 'left' },
    pin2: { type: 'passive', defaultSide: 'right' }
  },
  'button': {
    pin1: { type: 'passive', defaultSide: 'left' },
    pin2: { type: 'passive', defaultSide: 'right' },
    // Buttons typically need pull-up or pull-down resistors
    resistorNeeded: true
  },
  'potentiometer': {
    power: { type: 'positive', defaultSide: 'left' },
    ground: { type: 'negative', defaultSide: 'right' },
    wiper: { type: 'output', defaultSide: 'middle' }
  },
  'rgb-led': {
    commonCathode: { type: 'negative', defaultSide: 'bottom' },
    redPin: { type: 'positive', defaultSide: 'left' },
    greenPin: { type: 'positive', defaultSide: 'top' },
    bluePin: { type: 'positive', defaultSide: 'right' }
  },
  'servo': {
    power: { type: 'positive', defaultSide: 'top' },
    ground: { type: 'negative', defaultSide: 'bottom' },
    signal: { type: 'input', defaultSide: 'middle' }
  },
  'buzzer': {
    positive: { type: 'positive', defaultSide: 'left' },
    negative: { type: 'negative', defaultSide: 'right' }
  },
  // Add more components as needed
};

// Check if a pin can be connected to another pin
export function canConnectPins(pin1Type, pin2Type) {
  // Simple rules - expand as needed for more complex components
  if (pin1Type === 'positive' && pin2Type === 'negative') return true;
  if (pin1Type === 'negative' && pin2Type === 'positive') return true;
  if (pin1Type === 'output' && pin2Type === 'input') return true;
  if (pin1Type === 'input' && pin2Type === 'output') return true;
  if (pin1Type === 'passive' && pin2Type !== 'passive') return true;
  if (pin2Type === 'passive' && pin1Type !== 'passive') return true;
  
  return false;
}

// Format a time value in milliseconds for display
export function formatTimeElapsed(milliseconds) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

// Extract meaningful pin names from component pin IDs
export function extractPinInfo(componentId, pinId) {
  const parts = pinId.split('-');
  // The first part is the component ID, the rest represent the pin name
  if (parts.length >= 2) {
    const pinName = parts.slice(1).join('-');
    return {
      componentId,
      pinName,
      pinType: getPinType(componentId, pinName)
    };
  }
  return null;
}

// Get the type of a pin based on the component type and pin name
function getPinType(componentId, pinName) {
  const componentType = componentId.split('-')[0]; // Assuming format like "led-123"
  
  const config = COMPONENT_PIN_CONFIGS[componentType];
  if (config && config[pinName]) {
    return config[pinName].type;
  }
  
  // Default type if not found
  return 'unknown';
}

// Convert Arduino pin notation to internal pin ID
export function arduinoPinToInternal(arduinoPin) {
  // Handle special case for LED_BUILTIN
  if (arduinoPin === 'LED_BUILTIN') return 'D13';
  
  // Handle standard digital pins
  if (!isNaN(arduinoPin) && arduinoPin >= 0 && arduinoPin <= 13) {
    return `D${arduinoPin}`;
  }
  
  // Handle analog pins
  if (typeof arduinoPin === 'string' && arduinoPin.startsWith('A')) {
    const num = arduinoPin.substring(1);
    if (!isNaN(num) && num >= 0 && num <= 5) {
      return arduinoPin;
    }
  }
  
  return null;
}