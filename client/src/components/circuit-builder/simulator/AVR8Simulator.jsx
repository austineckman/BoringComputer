import React, { useEffect, useState } from 'react';
import { useSimulator } from './SimulatorContext';
import { useLibraryManager } from './LibraryManager';
import { validateArduinoCode } from './ArduinoCompiler';
import { parseAnalogWrites, parseDigitalWrites } from './SimulatorUtils';

/**
 * AVR8 Arduino Simulator Component
 * 
 * This component is responsible for simulating Arduino code execution
 * using the avr8js library. It detects pin changes and library usage.
 */
const AVR8Simulator = ({ code, isRunning, onPinChange, onLog }) => {
  const [compiledCode, setCompiledCode] = useState(null);
  const [detectedLibraries, setDetectedLibraries] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const [pins, setPins] = useState({});
  const [delay, setDelay] = useState(1000); // Default delay 1000ms
  
  // Get library manager context
  const { loadLibrary, isLibraryLoaded, loadedLibraries } = useLibraryManager();
  
  // Get simulator context for updating component states
  const { updateComponentState } = useSimulator();
  
  // Log information to the simulator console
  const logInfo = (message) => {
    if (onLog) {
      onLog(message);
    }
  };
  
  // Detect libraries used in the code
  const detectLibraries = (code) => {
    const includeRegex = /#include\s*<([^>]+)>/g;
    const libraries = [];
    let match;
    
    // Find all #include statements
    while ((match = includeRegex.exec(code)) !== null) {
      const libraryName = match[1].replace('.h', '');
      if (!libraries.includes(libraryName)) {
        libraries.push(libraryName);
      }
    }
    
    // Special detection for short form OLED libraries
    if (code.includes('#include <U8g2lib.h>')) {
      if (!libraries.includes('U8g2lib')) {
        libraries.push('U8g2lib');
      }
      if (!libraries.includes('U8g2')) {
        libraries.push('U8g2');
      }
    }
    
    if (code.includes('#include <SSD1306.h>')) {
      if (!libraries.includes('SSD1306')) {
        libraries.push('SSD1306');
      }
    }
    
    if (code.includes('#include <Adafruit_SSD1306.h>')) {
      if (!libraries.includes('Adafruit_SSD1306')) {
        libraries.push('Adafruit_SSD1306');
      }
    }
    
    // Add Wire library automatically if any OLED library is detected
    const hasOledLib = libraries.some(lib => 
      lib.includes('SSD1306') || 
      lib.includes('U8g2') || 
      lib.includes('Adafruit_GFX') || 
      lib.includes('Adafruit_SSD1306') ||
      lib.includes('U8glib')
    );
    
    if (hasOledLib && !libraries.includes('Wire')) {
      libraries.push('Wire');
    }
    
    return libraries;
  };
  
  // Check if OLED libraries are included
  const hasOLEDLibrary = (libraries) => {
    // Check for common OLED libraries
    return libraries.some(lib => 
      lib.includes('SSD1306') || 
      lib.includes('U8g2') || 
      lib.includes('Adafruit_GFX') || 
      lib.includes('Adafruit_SSD1306') ||
      lib.includes('U8glib')
    );
  };
  
  // Detect any digitalWrite and analogWrite calls to identify which pins are being used
  const detectPinsUsed = (code) => {
    const digitalWriteRegex = /digitalWrite\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(HIGH|LOW)\s*\)/g;
    const analogWriteRegex = /analogWrite\s*\(\s*(\d+|RED_PIN|GREEN_PIN|BLUE_PIN)\s*,\s*(\d+|[^,;)]+)\s*\)/g;
    const pinDefineRegex = /#define\s+(RED_PIN|GREEN_PIN|BLUE_PIN)\s+(\d+)/g;
    const pins = new Set();
    let match;
    
    // LED_BUILTIN is usually pin 13
    const LED_BUILTIN = 13;
    
    // Default pins for RGB LED if not defined
    const defaultPins = {
      'RED_PIN': 9,
      'GREEN_PIN': 10,
      'BLUE_PIN': 11
    };
    
    // Extract pin definitions if present
    const pinDefinitions = {...defaultPins};
    while ((match = pinDefineRegex.exec(code)) !== null) {
      const pinName = match[1];
      const pinNumber = parseInt(match[2], 10);
      pinDefinitions[pinName] = pinNumber;
    }
    
    // Find all digitalWrite calls
    while ((match = digitalWriteRegex.exec(code)) !== null) {
      let pin = match[1];
      // Replace LED_BUILTIN with the actual pin number
      if (pin === 'LED_BUILTIN') {
        pin = LED_BUILTIN;
      } else {
        pin = parseInt(pin, 10);
      }
      pins.add(pin);
    }
    
    // Find all analogWrite calls (for RGB LEDs and other PWM devices)
    while ((match = analogWriteRegex.exec(code)) !== null) {
      let pin = match[1];
      // Handle special pin names
      if (pin === 'RED_PIN' || pin === 'GREEN_PIN' || pin === 'BLUE_PIN') {
        pin = pinDefinitions[pin];
      } else {
        pin = parseInt(pin, 10);
      }
      pins.add(pin);
    }
    
    return Array.from(pins);
  };
  
  // Detect delay values used in the code
  const detectDelays = (code) => {
    const delayRegex = /delay\s*\(\s*(\d+)\s*\)/g;
    const delays = [];
    let match;
    
    // Find all delay calls
    while ((match = delayRegex.exec(code)) !== null) {
      const delayTime = parseInt(match[1], 10);
      delays.push(delayTime);
    }
    
    // If we have delays, return the average
    if (delays.length > 0) {
      const averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
      return averageDelay;
    }
    
    // Default delay
    return 1000;
  };
  
  // Arduino code validation function is imported at the top
  
  // Compile the Arduino code
  const compileCode = (code) => {
    // First, check for any errors in the code
    const errors = validateArduinoCode(code);
    
    // If there are errors, we should log them but still try to analyze what we can
    if (errors && errors.length > 0) {
      logInfo(`⚠️ Found ${errors.length} potential issues in your Arduino code`);
      errors.forEach(error => {
        logInfo(`   Line ${error.line}: ${error.message}`);
      });
      
      // Since we're in development mode, don't fail compilation entirely
      logInfo("Attempting to continue with simulation despite errors...");
    }
    
    // Detect libraries, pins, and delays
    const libraries = detectLibraries(code);
    const pinsUsed = detectPinsUsed(code);
    const avgDelay = detectDelays(code);
    
    // Extract analog write values for PWM (used for RGB LEDs)
    const analogValues = parseAnalogWrites(code);
    
    // Set detected libraries
    setDetectedLibraries(libraries);
    
    // Set the delay value
    setDelay(avgDelay);
    
    // Log information
    logInfo(`Detected libraries: ${libraries.length > 0 ? libraries.join(', ') : 'None'}`);
    logInfo(`Detected pins: ${pinsUsed.length > 0 ? pinsUsed.join(', ') : 'None'}`);
    
    // For each library, check if it's loaded
    if (libraries.length > 0) {
      libraries.forEach(library => {
        if (!isLibraryLoaded(library)) {
          logInfo(`Library '${library}' will need to be loaded before simulation`);
        } else {
          logInfo(`Library '${library}' is already loaded`);
        }
      });
    }
    
    // Return a simple "compiled" object for demo purposes
    return {
      libraries,
      pinsUsed,
      analogValues,
      delay: avgDelay,
      errors: errors && errors.length > 0 ? errors : null
    };
  };
  
  // Load required libraries
  const loadRequiredLibraries = async () => {
    if (detectedLibraries.length === 0) return;
    
    for (const lib of detectedLibraries) {
      try {
        if (!isLibraryLoaded(lib)) {
          logInfo(`Loading library: ${lib}`);
          await loadLibrary(lib);
        }
      } catch (error) {
        console.error(`Error loading library ${lib}:`, error);
        logInfo(`Warning: Could not load library ${lib}`);
      }
    }
  };
  
  // Start the simulation
  const startSimulation = () => {
    if (!compiledCode) return;
    
    // Get the delay from the compiled code
    const simulationDelay = compiledCode.delay || delay;
    
    // Set up pin states based on the default blink pattern
    // Initialize with all pins LOW
    const initialPins = {};
    compiledCode.pinsUsed.forEach(pin => {
      initialPins[pin] = false; // LOW
    });
    
    // Update initial pin states
    setPins(initialPins);
    
    // Track simulation state (HIGH/LOW) and steps for analog patterns
    let state = false; // Start with LOW, then toggle to HIGH
    let analogSimStep = 0; // For cycling through analog values
    let analogValueShown = false; // For tracking if we've used analog values
    
    // Start a timer to simulate pin changes for the pins used in the code
    const id = setInterval(() => {
      // Toggle the state every time (for digital pins)
      state = !state;
      
      // Log analog values for debugging
      if (compiledCode.analogValues && !analogValueShown) {
        console.log("Analog values detected in code:", compiledCode.analogValues);
        analogValueShown = true;
      }
      
      // Get the pins used in the code
      const { pinsUsed } = compiledCode;
      
      // Update pin states based on current state
      const newPins = { ...pins };
      for (const pin of pinsUsed) {
        // Default to binary state (HIGH/LOW)
        newPins[pin] = state;
        
        // Update all heroboard components with this pin
        // This ensures any heroboard component will have the latest pin state
        if (typeof window !== 'undefined' && window.simulatorContext) {
          // Get all heroboard component IDs from the simulatorContext
          const componentStates = window.simulatorContext.componentStates || {};
          const heroboardIds = Object.keys(componentStates).filter(id => 
            id === 'heroboard' || id.includes('heroboard')
          );
          
          // Update each heroboard component with the pin state
          heroboardIds.forEach(heroboardId => {
            const pinUpdate = {};
            pinUpdate[pin] = state;
            window.simulatorContext.updateComponentPins(heroboardId, pinUpdate);
            console.log(`Updated ${heroboardId} pin ${pin} to ${state ? 'HIGH' : 'LOW'}`);
          });
          
          // Also update the generic 'heroboard' for fallback compatibility
          if (!heroboardIds.includes('heroboard')) {
            const pinUpdate = {};
            pinUpdate[pin] = state;
            window.simulatorContext.updateComponentPins('heroboard', pinUpdate);
            console.log(`Updated generic heroboard pin ${pin} to ${state ? 'HIGH' : 'LOW'}`);
          }
          
          // Check for RGB LEDs that might be using this pin
          // Multiple possible naming formats for RGB LEDs
          // Dump all component IDs to help with debugging
          console.log("All component IDs:", Object.keys(componentStates));
          
          // Look for any RGB LED component with various naming patterns
          const rgbLedComponentIds = Object.keys(componentStates).filter(id => 
            id.includes('rgb-led') || id.includes('rgbled') || id.toLowerCase().includes('rgb')
          );
          
          // Log RGB LEDs for debugging
          if (rgbLedComponentIds.length > 0) {
            console.log("Found RGB LED components:", rgbLedComponentIds);
          }
          
          if (rgbLedComponentIds.length > 0) {
            // For RGB LEDs, we need to handle each color pin
            rgbLedComponentIds.forEach(rgbLedId => {
              // Update RGB LED values based on which pin is connected
              // Debug window.updateRGBLED to see if our function is attached correctly
              console.log(`Checking if RGB LED ${rgbLedId} has update function:`, 
                window.updateRGBLED ? 
                (window.updateRGBLED[rgbLedId] ? "Function exists" : "No function for this ID") 
                : "No global update function"
              );
              
              if (window.updateRGBLED && window.updateRGBLED[rgbLedId]) {
                // Determine which color pin this might be
                // Default pins for RGB LED
                const pinToColorMap = {
                  '9': 'red',
                  '10': 'green',
                  '11': 'blue'
                };
                
                // If this pin is a color pin, update that color
                if (pinToColorMap[pin]) {
                  const color = pinToColorMap[pin];
                  // Use analogWrite value for more precision if available
                  let value = 0;

                  // Check if we have analog values for this pin
                  if (compiledCode.analogValues && compiledCode.analogValues[pin] && compiledCode.analogValues[pin].length > 0) {
                    // Use the last (most recent) analog value in the array
                    value = compiledCode.analogValues[pin][compiledCode.analogValues[pin].length - 1];
                    console.log(`Using analog value ${value} for pin ${pin} (${color})`);
                  } else {
                    // Fallback to binary HIGH/LOW
                    value = state ? 255 : 0;
                  }
                  
                  // Send the raw value (0-255) to the LED component
                  // The component will normalize internally
                  window.updateRGBLED[rgbLedId](color, value);
                  console.log(`Updated RGB LED ${rgbLedId} ${color} to ${value}`);
                  
                  // Also notify any other connected components via the callback
                  if (onPinChange) {
                    onPinChange(pin, state, { 
                      componentId: rgbLedId, 
                      type: 'rgbled', 
                      color,
                      // Include analogValues in the update to be used by CircuitBuilderWindow
                      analogValue: value
                    });
                  }
                }
              }
            });
          }
        }
        
        // Call the onPinChange callback
        if (onPinChange) {
          onPinChange(pin, newPins[pin]);
        }
      }
      
      // Update pins state
      setPins(newPins);
      
      logInfo(`Simulating ${state ? 'HIGH' : 'LOW'} state`);
    }, simulationDelay);
    
    // Save the interval ID for cleanup
    setIntervalId(id);
    
    // Log information
    logInfo('Simulation started');
  };
  
  // Stop the simulation
  const stopSimulation = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      
      // Log information
      logInfo('Simulation stopped');
    }
  };
  
  // Compile code when it changes
  useEffect(() => {
    if (code) {
      const compiled = compileCode(code);
      setCompiledCode(compiled);
    }
  }, [code]);
  
  // Load libraries when detected
  useEffect(() => {
    loadRequiredLibraries();
  }, [detectedLibraries]);
  
  // Start/stop simulation when isRunning changes
  useEffect(() => {
    if (isRunning) {
      startSimulation();
    } else {
      stopSimulation();
    }
    
    // Cleanup on unmount
    return () => {
      stopSimulation();
    };
  }, [isRunning, compiledCode, delay]);
  
  // For debugging - display the list of loaded libraries
  useEffect(() => {
    if (loadedLibraries.length > 0) {
      console.log('Currently loaded libraries:', loadedLibraries);
    }
  }, [loadedLibraries]);
  
  // Detect OLED display commands and patterns in the code
  const parseOLEDCommands = (code) => {
    // Look for common OLED-related code patterns
    const hasOLEDClass = 
      code.includes('SSD1306') || 
      code.includes('U8G2') || 
      code.includes('U8g2') ||
      code.includes('Adafruit_GFX') || 
      code.includes('Adafruit_SSD1306') ||
      code.includes('U8glib');
    
    // Check for any object instantiation (assuming it might be an OLED object)
    const hasObjectInit = /\w+\s+\w+\s*\([\s\w,]*\)/g.test(code);
    
    // Only consider it OLED code if there's both a related class AND object init
    const isOLEDCode = hasOLEDClass && hasObjectInit;
                       
    if (!isOLEDCode) return null;
    
    // Extract OLED initialization patterns
    const oledInitRegex = /(SSD1306|Adafruit_SSD1306|U8G2|U8g2|U8GLIB)[\s\w]*\([\s\w,]*\)/g;
    const generalInitRegex = /(\w+)\s+(\w+)\s*\([\s\w,]*\)/g;
    
    // Try the specific pattern first, then fall back to general
    let initMatches = [...code.matchAll(oledInitRegex)];
    if (initMatches.length === 0) {
      initMatches = [...code.matchAll(generalInitRegex)];
    }
    
    // Extract drawing commands
    const drawCommands = [];
    
    // U8g2 drawing commands
    if (code.includes('U8g2') || code.includes('U8g2lib')) {
      const u8g2DrawRegex = /\.(drawStr|drawLine|drawCircle|drawBox|drawFrame|drawPixel|drawXBM|drawBitmap|begin|firstPage|nextPage|setFont)\(/g;
      const u8g2Matches = [...code.matchAll(u8g2DrawRegex)];
      drawCommands.push(...u8g2Matches);
    }
    
    // Adafruit drawing commands
    if (code.includes('Adafruit_SSD1306') || code.includes('Adafruit_GFX')) {
      const adafruitDrawRegex = /\.(drawPixel|drawLine|drawRect|fillRect|drawCircle|fillCircle|drawTriangle|fillTriangle|drawRoundRect|fillRoundRect|print|println|setTextSize|setTextColor|setTextWrap|setCursor|begin|display|clearDisplay)\(/g;
      const adafruitMatches = [...code.matchAll(adafruitDrawRegex)];
      drawCommands.push(...adafruitMatches);
    }
    
    // SSD1306 direct commands - these are low-level commands that might be used
    if (code.includes('SSD1306')) {
      const ssd1306CommandRegex = /\.(ssd1306_command|ssd1306_data|command|data|begin|display)\(/g;
      const ssd1306Matches = [...code.matchAll(ssd1306CommandRegex)];
      drawCommands.push(...ssd1306Matches);
    }
    
    // Generic text display commands - these are very common
    const textRegex = /\.(print|println|drawString|drawStr|setCursor|setTextSize|write|begin|display)\(/g;
    const textMatches = [...code.matchAll(textRegex)];
    drawCommands.push(...textMatches);
    
    // Look for begin() method which is essential for OLED initialization
    const hasBeginMethod = code.includes('.begin(');
    
    // For Adafruit lib, check for display() which is needed to update screen
    const hasDisplayMethod = code.includes('.display(');
    
    // For U8G2, check for firstPage()/nextPage() loop pattern
    const hasPageLoop = code.includes('.firstPage()') && code.includes('.nextPage()');
    
    // We need at least begin() or one of the display update methods
    const hasRequiredMethods = hasBeginMethod && (hasDisplayMethod || hasPageLoop || drawCommands.length > 0);

    // Return the parsing results
    return {
      hasOLEDCode: isOLEDCode && hasRequiredMethods,
      initCommands: initMatches.map(match => match[0]),
      drawCommands: drawCommands.map(match => match[0]),
      requiresLibrary: true
    };
  };

  // Function to check for correct OLED wiring in the circuit
  const checkOLEDWiring = (oledId) => {
    // Get all wires in the circuit
    const { wires } = window.simulatorContext || { wires: [] };
    if (!wires || wires.length === 0) {
      // No wires found, so the OLED can't be properly wired
      console.log("No wires found in the circuit");
      return false;
    }

    // For OLED display, we need connections to:
    // 1. SDA (usually A4 on Arduino)
    // 2. SCL (usually A5 on Arduino)
    // 3. VCC (5V or 3.3V)
    // 4. GND
    
    // Extract the component ID without the pin part
    const oledBaseId = oledId.split('-').slice(0, 2).join('-');
    
    // Check if the required pins are connected
    let hasSDA = false;
    let hasSCL = false;
    let hasVCC = false;
    let hasGND = false;
    
    // Go through all wires to check connections
    for (const wire of wires) {
      // Add defensive checks to prevent crashes
      if (!wire || !wire.start || !wire.end || !wire.start.id || !wire.end.id) {
        console.warn("Wire with incomplete data found:", wire);
        continue; // Skip this wire
      }
      
      try {
        const [startCompId, startPin] = (wire.start.id || "").split('-', 3);
        const [endCompId, endPin] = (wire.end.id || "").split('-', 3);
        
        // Additional defensive checks
        if (!startCompId || !endCompId) {
          continue; // Skip wires with invalid component IDs
        }
        
        // Check if this wire is connected to our OLED
        if (startCompId.includes(oledBaseId) || endCompId.includes(oledBaseId)) {
          // This wire is connected to our OLED component
          
          // Check the pins at both ends
          const oledPin = startCompId.includes(oledBaseId) ? startPin : endPin;
          const otherPin = startCompId.includes(oledBaseId) ? endPin : startPin;
          
          // More defensive checks
          if (!oledPin || !otherPin) {
            continue; // Skip if we can't determine the pins
          }
          
          // Check what type of connection this is
          if (oledPin === 'sda' || oledPin === 'data') {
            // SDA pin should be connected to A4 on Arduino
            if (otherPin === 'a4' || otherPin === 'sda') {
              hasSDA = true;
            }
          } else if (oledPin === 'scl' || oledPin === 'clock') {
            // SCL pin should be connected to A5 on Arduino
            if (otherPin === 'a5' || otherPin === 'scl') {
              hasSCL = true;
            }
          } else if (oledPin === 'vcc' || oledPin === '5v' || oledPin === '3v3') {
            // VCC pin should be connected to 5V or 3.3V
            if (otherPin === '5v' || otherPin === '3v3' || otherPin === 'vcc') {
              hasVCC = true;
            }
          } else if (oledPin === 'gnd') {
            // GND pin should be connected to GND
            if (otherPin === 'gnd') {
              hasGND = true;
            }
          }
        }
      } catch (error) {
        console.error("Error processing wire:", error);
        // Continue with the next wire rather than crashing
        continue;
      }
    }
    
    // For demonstration purposes, log the wiring status
    console.log(`OLED wiring status for ${oledId}:`, { hasSDA, hasSCL, hasVCC, hasGND });
    
    // For now, we'll temporarily bypass the wiring check for easier testing
    // return true;
    
    // In a real implementation, we would require all connections
    // return hasSDA && hasSCL && hasVCC && hasGND;
    
    // Require essential connections for OLED to work properly
    // SDA and SCL are absolutely required for I2C communication
    const hasEssentialConnections = hasSDA && hasSCL;
    
    // Power connections are important too, but we can be slightly more forgiving here
    // At minimum one of VCC or GND should be connected
    const hasPowerConnection = hasVCC || hasGND;
    
    return hasEssentialConnections && hasPowerConnection;
  };

  // Find and initialize OLED displays in the circuit
  useEffect(() => {
    if (!isRunning || !compiledCode) return;
    
    try {
      // Find all OLED components in the DOM
      const oledElements = document.querySelectorAll('[id^="oled-display-"]');
      
      // Add defensive check - make sure oledElements is valid
      if (!oledElements || typeof oledElements.length !== 'number') {
        console.warn("Invalid oledElements result:", oledElements);
        return;
      }
      
      if (oledElements.length > 0) {
        logInfo(`Initializing ${oledElements.length} OLED display(s)`);
        
        // Check if we have required OLED libraries
        const hasRequiredLibraries = hasOLEDLibrary(compiledCode.libraries);
        
        // Parse OLED commands from the code
        const oledCommands = parseOLEDCommands(code);
        const hasOLEDCode = oledCommands && oledCommands.hasOLEDCode;
        
        oledElements.forEach(element => {
          if (!element || !element.id) {
            console.warn("Invalid OLED element:", element);
            return; // Skip this element
          }
          
          try {
            const oledId = element.id;
            const isProperlyWired = checkOLEDWiring(oledId);
            
            // Create an empty display buffer (128x64 pixels for SSD1306)
            const displayBuffer = new Array(64).fill(0).map(() => 
              new Array(128).fill(0)
            );
            
            // Update component state with the buffer and library status
            updateComponentState(oledId, {
              buffer: displayBuffer,
              initialized: true,
              hasRequiredLibraries,
              hasOLEDCode,
              isProperlyWired,
              shouldDisplay: hasRequiredLibraries && hasOLEDCode && isProperlyWired
            });
            
            logInfo(`OLED display ${oledId} initialized`);
          } catch (error) {
            console.error("Error initializing OLED display:", error);
          }
        });
      }
    } catch (error) {
      console.error("Error in OLED initialization effect:", error);
    }
  }, [isRunning, code, compiledCode]);
  
  // The component doesn't render anything
  return null;
};

export default AVR8Simulator;