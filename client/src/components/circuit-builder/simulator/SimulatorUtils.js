/**
 * Utility functions for the Arduino simulator
 */

// Default Arduino sketch for blinking the built-in LED
export const defaultSketch = `
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
`;

// Parse Arduino code to extract pin configurations
export const parsePinConfig = (code) => {
  const pinModes = {};
  
  // Regular expression to match pinMode calls
  const pinModeRegex = /pinMode\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/g;
  
  // Extract pin modes
  let match;
  while ((match = pinModeRegex.exec(code)) !== null) {
    const pin = match[1] === 'LED_BUILTIN' ? '13' : match[1];
    const mode = match[2];
    pinModes[pin] = mode;
  }
  
  return pinModes;
};

// Parse digitalWrite calls to identify pin states
export const parseDigitalWrites = (code) => {
  const pinWrites = {};
  
  // Regular expression to match digitalWrite calls
  const digitalWriteRegex = /digitalWrite\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(HIGH|LOW)\s*\)/g;
  
  // Extract pin writes
  let match;
  while ((match = digitalWriteRegex.exec(code)) !== null) {
    const pin = match[1] === 'LED_BUILTIN' ? '13' : match[1];
    const state = match[2] === 'HIGH';
    
    if (!pinWrites[pin]) {
      pinWrites[pin] = [];
    }
    
    pinWrites[pin].push(state);
  }
  
  return pinWrites;
};

// Parse delay calls to extract timing information
export const parseDelays = (code) => {
  const delays = [];
  
  // Regular expression to match delay calls
  const delayRegex = /delay\s*\(\s*(\d+)\s*\)/g;
  
  // Extract delays
  let match;
  while ((match = delayRegex.exec(code)) !== null) {
    const delayMs = parseInt(match[1], 10);
    delays.push(delayMs);
  }
  
  return delays;
};

// Parse Arduino code to identify library imports
export const parseLibraryImports = (code) => {
  const imports = [];
  
  // Regular expression to match include statements
  const includeRegex = /#include\s*<([^>]+)>/g;
  
  // Extract imports
  let match;
  while ((match = includeRegex.exec(code)) !== null) {
    const library = match[1];
    imports.push(library);
  }
  
  return imports;
};

// Map Arduino pin numbers to component pins
export const mapPinToComponent = (pinNumber, components) => {
  // This function would identify which components are connected to a specific pin
  // For now, we'll return a simple mapping
  return components.filter(component => {
    // Check if the component has pins data
    if (!component.pins) return false;
    
    // Check if the component has this pin
    return component.pins.some(pin => pin.arduinoPin === pinNumber);
  });
};

// Trace the wire connections to find connected components
export const traceConnection = (pinId, wires) => {
  // Find all wires connected to this pin
  const connectedWires = wires.filter(wire => 
    wire.startPin.id === pinId || wire.endPin.id === pinId
  );
  
  // Get the other end of each wire
  return connectedWires.map(wire => 
    wire.startPin.id === pinId ? wire.endPin.id : wire.startPin.id
  );
};

// Calculate timing for LED blinking based on delays in the code
export const calculateBlinkTiming = (code) => {
  const delays = parseDelays(code);
  
  if (delays.length === 0) {
    return { highDuration: 1000, lowDuration: 1000 }; // Default timing
  }
  
  if (delays.length === 1) {
    return { highDuration: delays[0], lowDuration: delays[0] };
  }
  
  // If there are multiple delays, we assume they alternate
  // between HIGH and LOW states
  return {
    highDuration: delays[0],
    lowDuration: delays[1] || delays[0] // If only one delay value, use it for both
  };
};

// Format a timestamp for logging
export const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  });
};

// Check if two circuit pins are compatible for connection
export const arePinsCompatible = (pin1Type, pin2Type) => {
  // Simple compatibility rules
  if (pin1Type === 'power' && pin2Type === 'power') return false;
  if (pin1Type === 'ground' && pin2Type === 'ground') return false;
  
  return true;
};

// Get color for wire based on pin types
export const getWireColor = (startPinType, endPinType) => {
  if (startPinType === 'power' || endPinType === 'power') {
    return '#ff0000'; // Red for power
  }
  
  if (startPinType === 'ground' || endPinType === 'ground') {
    return '#000000'; // Black for ground
  }
  
  if (startPinType === 'analog' || endPinType === 'analog') {
    return '#ffaa00'; // Orange for analog
  }
  
  if (startPinType === 'digital' || endPinType === 'digital') {
    return '#0000ff'; // Blue for digital
  }
  
  return '#888888'; // Default gray
};

export default {
  defaultSketch,
  parsePinConfig,
  parseDigitalWrites,
  parseDelays,
  parseLibraryImports,
  mapPinToComponent,
  traceConnection,
  calculateBlinkTiming,
  formatTimestamp,
  arePinsCompatible,
  getWireColor
};