/**
 * Utility functions for the Arduino simulator
 */

// Default Arduino sketch (Buzzer melody example)
export const defaultSketch = `// Arduino Buzzer Melody Example
// This example plays a simple melody on a buzzer connected to pin 8

int buzzerPin = 8;
int melody[] = {262, 294, 330, 349, 392, 440, 494, 523}; // C, D, E, F, G, A, B, C
int noteDurations[] = {4, 4, 4, 4, 4, 4, 4, 2}; // note durations: 4 = quarter note, 2 = half note

void setup() {
  pinMode(buzzerPin, OUTPUT);
  pinMode(13, OUTPUT); // Built-in LED for visual feedback
}

void loop() {
  // Play the melody
  for (int thisNote = 0; thisNote < 8; thisNote++) {
    // Calculate note duration
    int noteDuration = 1000 / noteDurations[thisNote];
    
    // Turn on LED while playing note
    digitalWrite(13, HIGH);
    
    // Play the note
    tone(buzzerPin, melody[thisNote], noteDuration);
    
    // Pause between notes (brief silence)
    int pauseBetweenNotes = noteDuration * 1.30;
    delay(pauseBetweenNotes);
    
    // Turn off LED
    digitalWrite(13, LOW);
    
    // Stop the tone
    noTone(buzzerPin);
  }
  
  // Wait 2 seconds before repeating
  delay(2000);
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

// Parse analogWrite calls to identify PWM pin values
export const parseAnalogWrites = (code) => {
  const analogWrites = {};
  
  // Define regex to match pin definitions
  const pinDefineRegex = /#define\s+(RED_PIN|GREEN_PIN|BLUE_PIN)\s+(\d+)/g;
  
  // Extract custom pin definitions if present
  const pinDefinitions = {
    'RED_PIN': '9',  // Default to standard pins
    'GREEN_PIN': '10',
    'BLUE_PIN': '11'
  };
  
  let defineMatch;
  while ((defineMatch = pinDefineRegex.exec(code)) !== null) {
    const pinName = defineMatch[1];
    const pinNumber = defineMatch[2];
    pinDefinitions[pinName] = pinNumber;
  }
  
  // Regular expression to match analogWrite calls
  const analogWriteRegex = /analogWrite\s*\(\s*(\d+|RED_PIN|GREEN_PIN|BLUE_PIN|LED_BUILTIN)\s*,\s*(\d+|[^,;)]+)\s*\)/g;
  
  // Extract analog writes
  let match;
  while ((match = analogWriteRegex.exec(code)) !== null) {
    let pin = match[1];
    
    // Handle pin definitions (like RED_PIN, BLUE_PIN etc.)
    if (pin === 'RED_PIN') pin = pinDefinitions['RED_PIN'];
    else if (pin === 'GREEN_PIN') pin = pinDefinitions['GREEN_PIN'];
    else if (pin === 'BLUE_PIN') pin = pinDefinitions['BLUE_PIN'];
    else if (pin === 'LED_BUILTIN') pin = '13';
    
    // Try to parse the value - handle constants or expressions by assuming non-zero value
    let value;
    if (/^\d+$/.test(match[2])) {
      value = parseInt(match[2], 10);
    } else {
      // For variables or constants, use a default value
      // Try to be smarter about the variable name - if it includes "red", "green", "blue"
      const variableName = match[2].toLowerCase();
      if (variableName.includes('red')) value = 255;
      else if (variableName.includes('green')) value = 255;
      else if (variableName.includes('blue')) value = 255;
      else value = 128; // Default mid-value for non-numeric expressions
    }
    
    // Log what we found for debugging
    console.log(`Found analogWrite: pin ${pin}, value ${value}`);
    
    // Store the pin and value
    if (!analogWrites[pin]) {
      analogWrites[pin] = [];
    }
    
    // Ensure value is in valid range
    if (value >= 0 && value <= 255) {
      analogWrites[pin].push(value);
    }
  }
  
  // If we found any values, log them
  if (Object.keys(analogWrites).length > 0) {
    console.log('Analog pin values detected:', analogWrites);
  }
  
  return analogWrites;
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
  parseAnalogWrites,
  parseDelays,
  parseLibraryImports,
  mapPinToComponent,
  traceConnection,
  calculateBlinkTiming,
  formatTimestamp,
  arePinsCompatible,
  getWireColor
};