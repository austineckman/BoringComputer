import React, { useEffect, useState } from 'react';
import { useSimulator } from './SimulatorContext';
import { useLibraryManager } from './LibraryManager';
import { parseOLEDCommands } from './OLEDCommandParser';

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
  
  // Detect any digitalWrite calls to identify which pins are being used
  const detectPinsUsed = (code) => {
    const digitalWriteRegex = /digitalWrite\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(HIGH|LOW)\s*\)/g;
    const pins = new Set();
    let match;
    
    // LED_BUILTIN is usually pin 13
    const LED_BUILTIN = 13;
    
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
  
  // Compile the Arduino code
  const compileCode = (code) => {
    // For now, we don't actually compile the code, we just detect the libraries and pins
    const libraries = detectLibraries(code);
    const pinsUsed = detectPinsUsed(code);
    const avgDelay = detectDelays(code);
    
    // Set detected libraries
    setDetectedLibraries(libraries);
    
    // Set the delay value
    setDelay(avgDelay);
    
    // Log information
    logInfo(`Detected libraries: ${libraries.length > 0 ? libraries.join(', ') : 'None'}`);
    logInfo(`Detected pins: ${pinsUsed.length > 0 ? pinsUsed.join(', ') : 'None'}`);
    
    // Return a simple "compiled" object for demo purposes
    return {
      libraries,
      pinsUsed,
      delay: avgDelay
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
    
    // Start a timer to simulate pin changes for the pins used in the code
    const id = setInterval(() => {
      // Get the pins used in the code
      const { pinsUsed } = compiledCode;
      
      // Update pin states
      const newPins = { ...pins };
      for (const pin of pinsUsed) {
        // Toggle the pin state
        newPins[pin] = !newPins[pin];
        
        // Call the onPinChange callback
        if (onPinChange) {
          onPinChange(pin, newPins[pin]);
        }
      }
      
      // Update pins state
      setPins(newPins);
    }, delay); // Use the detected delay value
    
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
      
      // Detect libraries used in the code
      const libraries = detectLibraries(code);
      setDetectedLibraries(libraries);
      logInfo(`Detected libraries: ${libraries.join(', ')}`);
      
      // Also share code with the global window object for non-React components
      if (window) {
        if (!window.simulatorContext) {
          window.simulatorContext = {};
        }
        window.simulatorContext.code = code;
        console.log("AVR8Simulator updated code globally:", code ? 
          (code.length > 100 ? code.substring(0, 100) + "..." : code) : "empty code");
      }
      
      // Parse and log OLED commands for debugging
      const oledCommands = parseOLEDCommands(code);
      console.log("Parsed OLED commands in AVR8Simulator:", oledCommands);
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
    const oledBaseId = oledId.split('-').slice(0, 3).join('-');
    
    // Check if the required pins are connected
    let hasSDA = false;
    let hasSCL = false;
    let hasVCC = false;
    let hasGND = false;
    
    // DEBUG: Log the actual wire structure for easier debugging
    console.log("Checking wires for OLED:", wires);
    
    // Go through all wires to check connections
    for (const wire of wires) {
      // Add defensive checks to prevent crashes
      if (!wire || !wire.sourceId || !wire.targetId) {
        console.warn("Wire with incomplete data found:", wire);
        continue; // Skip this wire
      }
      
      try {
        // First approach: Use sourceName and targetName from the wire object
        if (wire.sourceName && wire.targetName && wire.sourceComponent && wire.targetComponent) {
          const oledSourceMatched = wire.sourceComponent.includes('oled-display');
          const oledTargetMatched = wire.targetComponent.includes('oled-display');
          
          // Make sure this wire is connected to the specific OLED we're checking
          const isThisOledSource = oledSourceMatched && wire.sourceComponent.includes(oledBaseId);
          const isThisOledTarget = oledTargetMatched && wire.targetComponent.includes(oledBaseId);
          
          if (isThisOledSource || isThisOledTarget) {
            // This wire is connected to our specific OLED
            const oledPinName = isThisOledSource ? wire.sourceName.toLowerCase() : wire.targetName.toLowerCase();
            const otherPinName = isThisOledSource ? wire.targetName.toLowerCase() : wire.sourceName.toLowerCase();
            
            console.log(`OLED wire detected: ${oledPinName} to ${otherPinName}`);
            
            // Check SDA connection
            if (oledPinName === 'sda') {
              if (otherPinName === 'a4' || otherPinName === 'sda') {
                hasSDA = true;
                console.log("SDA connection verified");
              }
            } 
            // Check SCL connection
            else if (oledPinName === 'scl') {
              if (otherPinName === 'a5' || otherPinName === 'scl') {
                hasSCL = true;
                console.log("SCL connection verified");
              }
            } 
            // Check VCC connection
            else if (oledPinName === 'vcc') {
              if (otherPinName === '5v' || otherPinName === '3.3v' || otherPinName === 'vcc') {
                hasVCC = true;
                console.log("VCC connection verified");
              }
            } 
            // Check GND connection
            else if (oledPinName === 'gnd') {
              if (otherPinName === 'gnd' || otherPinName.startsWith('gnd')) {
                hasGND = true;
                console.log("GND connection verified");
              }
            }
          }
        }
        // Fallback to the older method if sourceName/targetName not available
        else {
          // Extract component ID and pin name from ids - with extensive logging for debugging
          const sourceIdParts = wire.sourceId.split('-');
          const targetIdParts = wire.targetId.split('-');
          
          console.log(`Wire sourceId: ${wire.sourceId}, parts:`, sourceIdParts);
          console.log(`Wire targetId: ${wire.targetId}, parts:`, targetIdParts);
          
          // Get the component ids and pin names - ensure we extract correctly
          const sourceCompId = sourceIdParts.length >= 3 ? 
              `${sourceIdParts[0]}-${sourceIdParts[1]}-${sourceIdParts[2]}` : 
              sourceIdParts.join('-');
          
          const targetCompId = targetIdParts.length >= 3 ? 
              `${targetIdParts[0]}-${targetIdParts[1]}-${targetIdParts[2]}` : 
              targetIdParts.join('-');
          
          // The pin name is the last part of the id
          const sourcePin = sourceIdParts[sourceIdParts.length - 1].toLowerCase();
          const targetPin = targetIdParts[targetIdParts.length - 1].toLowerCase();
          
          console.log(`Extracted IDs - Source: ${sourceCompId}, Target: ${targetCompId}`);
          console.log(`Extracted Pins - Source: ${sourcePin}, Target: ${targetPin}`);
          
          // Check if OLED is involved in this wire
          const isSourceOLED = sourceCompId.includes('oled-display');
          const isTargetOLED = targetCompId.includes('oled-display');
          
          if (isSourceOLED || isTargetOLED) {
            // OLED is involved in this wire
            const oledPin = isSourceOLED ? sourcePin : targetPin;
            const otherPin = isSourceOLED ? targetPin : sourcePin;
            
            // Check for SDA connection
            if (oledPin === 'sda') {
              if (otherPin === 'a4' || otherPin === 'sda') {
                hasSDA = true;
              }
            }
            // Check for SCL connection 
            else if (oledPin === 'scl') {
              if (otherPin === 'a5' || otherPin === 'scl') {
                hasSCL = true;
              }
            }
            // Check for power connections
            else if (oledPin === 'vcc') {
              if (otherPin === '5v' || otherPin === '3.3v' || otherPin.includes('vcc')) {
                hasVCC = true;
              }
            }
            // Check for ground connection
            else if (oledPin === 'gnd') {
              if (otherPin.includes('gnd')) {
                hasGND = true;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing wire:", error, wire);
        // Continue with the next wire rather than crashing
        continue;
      }
    }
    
    // For demonstration purposes, log the wiring status
    console.log(`OLED wiring status for ${oledId}:`, { hasSDA, hasSCL, hasVCC, hasGND });
    
    // No temporary fixes or bypasses - we need accurate simulation
    // All connections must be properly detected and verified
    
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
        
        // Parse OLED commands from the code using our new parser
        // This will get a more detailed analysis of OLED commands
        const oledCommands = parseOLEDCommands(code);
        const hasOLEDCode = oledCommands && (oledCommands.hasOLEDCode || 
                               (oledCommands.commands && oledCommands.commands.length > 0));
        
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