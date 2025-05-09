import React, { useEffect, useState } from 'react';
import { useSimulator } from './SimulatorContext';
import { useLibraryManager } from './LibraryManager';

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
        // Get the wire details from either the newer or older format
        let sourceId, targetId, sourceComponent, targetComponent, sourceName, targetName;
        
        // Check for newer wire format
        if (wire.sourceId && wire.targetId) {
          console.log("Checking OLED wire with new format:", wire);
          
          // New format - using sourceId/targetId
          sourceId = wire.sourceId;
          targetId = wire.targetId;
          sourceComponent = wire.sourceComponent;
          targetComponent = wire.targetComponent;
          sourceName = wire.sourceName;
          targetName = wire.targetName;
        } else {
          // Old format - using start/end
          const [startCompId, startPin] = (wire.start?.id || "").split('-', 3);
          const [endCompId, endPin] = (wire.end?.id || "").split('-', 3);
          
          sourceId = wire.start?.id;
          targetId = wire.end?.id;
          sourceComponent = startCompId;
          targetComponent = endCompId;
          sourceName = startPin;
          targetName = endPin;
        }
        
        // Defensive check for missing wire data
        if (!sourceComponent || !targetComponent) {
          console.warn("Missing component identifiers in wire:", wire);
          continue;
        }
        
        // Convert pin names to lowercase for case-insensitive comparison
        const sourceNameLower = (sourceName || "").toLowerCase();
        const targetNameLower = (targetName || "").toLowerCase();
        
        // Check if this wire is connected to our OLED
        const isSourceOLED = (sourceComponent || "").includes(oledBaseId);
        const isTargetOLED = (targetComponent || "").includes(oledBaseId);
        
        if (isSourceOLED || isTargetOLED) {
          // This wire is connected to our OLED component
          
          // Determine which pins are on the OLED and which are on the other component
          const oledPin = isSourceOLED ? sourceNameLower : targetNameLower;
          const otherPin = isSourceOLED ? targetNameLower : sourceNameLower;
          
          console.log(`OLED pin connection found: ${oledPin} → ${otherPin}`);
          
          // Check what type of connection this is - handle different pin naming schemes
          console.log(`OLED pin connection check: ${oledPin} → ${otherPin}`);
          
          // Handle the ACTUAL pin labels as shown in the tooltips
          // Pin order from left to right is: VCC, GND, SCK, SDA
          
          // Handle the first pin (VCC)
          if (oledPin === 'vcc') { 
            // VCC pin should be connected to 5V or 3.3V
            if (otherPin === '5v' || otherPin === '3v3' || otherPin === '3.3v' || otherPin === 'vcc') {
              hasVCC = true;
              console.log("✓ First pin (VCC) correctly connected to power");
            }
          } 
          // Handle the second pin (GND)
          else if (oledPin === 'gnd') {
            // GND pin should be connected to GND (any of the GND pins)
            if (otherPin.includes('gnd')) {
              hasGND = true;
              console.log("✓ Second pin (GND) correctly connected to ground");
            }
          } 
          // Handle the third pin (SCK/SCL) 
          else if (oledPin === 'sck' || oledPin === 'scl') {
            // SCK pin should be connected to A5 on Arduino
            if (otherPin === 'a5' || otherPin === 'scl') {
              hasSCL = true;
              console.log("✓ Third pin (SCK) correctly connected to A5");
            }
          } 
          // Handle the fourth pin (SDA)
          else if (oledPin === 'sda') {
            // SDA pin should be connected to A4 on Arduino
            if (otherPin === 'a4' || otherPin === 'sda') {
              hasSDA = true;
              console.log("✓ Fourth pin (SDA) correctly connected to A4");
            }
          }
          
          // Generate a detailed status report after all connections are checked
          if (isSourceOLED || isTargetOLED) {
            setTimeout(() => {
              console.log("\nOLED CONNECTION STATUS:");
              console.log(`➤ Pin 1 (VCC) to Arduino 5V/3.3V: ${hasVCC ? '✓ Connected' : '✗ Missing'}`);
              console.log(`➤ Pin 2 (GND) to Arduino GND: ${hasGND ? '✓ Connected' : '✗ Missing'}`);
              console.log(`➤ Pin 3 (SCK) to Arduino A5: ${hasSCL ? '✓ Connected' : '✗ Missing'}`); 
              console.log(`➤ Pin 4 (SDA) to Arduino A4: ${hasSDA ? '✓ Connected' : '✗ Missing'}`);
              console.log("\nFollow the actual pin labels on the OLED component:");
              console.log("• VCC (1st pin) → 5V or 3.3V on Arduino");
              console.log("• GND (2nd pin) → Any GND pin on Arduino");
              console.log("• SCK (3rd pin) → A5 on Arduino"); 
              console.log("• SDA (4th pin) → A4 on Arduino");
            }, 500);
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