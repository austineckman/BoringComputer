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
    // Check if this is OLED-related code
    const isOLEDCode = code.includes('SSD1306') || 
                       code.includes('U8G2') || 
                       code.includes('U8g2') ||
                       code.includes('Adafruit_GFX') || 
                       code.includes('Adafruit_SSD1306') ||
                       code.includes('U8glib');
                       
    if (!isOLEDCode) return null;
    
    // Extract OLED initialization
    const oledInitRegex = /(SSD1306|Adafruit_SSD1306|U8G2|U8g2|U8GLIB)[\s\w]*\([\s\w,]*\)/g;
    const initMatches = [...code.matchAll(oledInitRegex)];
    
    // Extract drawing commands
    const drawCommands = [];
    
    // U8g2 drawing commands
    if (code.includes('U8g2') || code.includes('U8g2lib')) {
      const u8g2DrawRegex = /\.(drawStr|drawLine|drawCircle|drawBox|drawFrame|drawPixel|drawXBM|drawBitmap)\(/g;
      const u8g2Matches = [...code.matchAll(u8g2DrawRegex)];
      drawCommands.push(...u8g2Matches);
    }
    
    // Adafruit drawing commands
    if (code.includes('Adafruit_SSD1306') || code.includes('Adafruit_GFX')) {
      const adafruitDrawRegex = /\.(drawPixel|drawLine|drawRect|fillRect|drawCircle|fillCircle|drawTriangle|fillTriangle|drawRoundRect|fillRoundRect|print|println|setTextSize|setTextColor|setTextWrap|setCursor)\(/g;
      const adafruitMatches = [...code.matchAll(adafruitDrawRegex)];
      drawCommands.push(...adafruitMatches);
    }
    
    // SSD1306 direct commands - these are low-level commands that might be used
    if (code.includes('SSD1306')) {
      const ssd1306CommandRegex = /\.(ssd1306_command|ssd1306_data|command|data)\(/g;
      const ssd1306Matches = [...code.matchAll(ssd1306CommandRegex)];
      drawCommands.push(...ssd1306Matches);
    }
    
    // Text display commands - these are very common
    const textRegex = /\.(print|println|drawString|drawStr|setCursor|setTextSize|write)\(/g;
    const textMatches = [...code.matchAll(textRegex)];
    drawCommands.push(...textMatches);

    // Return the parsing results
    return {
      hasOLEDCode: isOLEDCode,
      initCommands: initMatches.map(match => match[0]),
      drawCommands: drawCommands.map(match => match[0]),
      requiresLibrary: true
    };
  };

  // Function to check for correct OLED wiring in the circuit
  const checkOLEDWiring = (oledId) => {
    // In a real implementation, we would check if the OLED is correctly wired
    // with SDA, SCL, VCC, and GND pins connected to the Arduino
    // For now, we'll assume it's correctly wired if it exists in the DOM
    return document.getElementById(oledId) !== null;
  };

  // Find and initialize OLED displays in the circuit
  useEffect(() => {
    if (!isRunning || !compiledCode) return;
    
    // Find all OLED components in the DOM
    const oledElements = document.querySelectorAll('[id^="oled-display-"]');
    
    if (oledElements.length > 0) {
      logInfo(`Initializing ${oledElements.length} OLED display(s)`);
      
      // Check if we have required OLED libraries
      const hasRequiredLibraries = hasOLEDLibrary(compiledCode.libraries);
      
      // Parse OLED commands from the code
      const oledCommands = parseOLEDCommands(code);
      const hasOLEDCode = oledCommands && oledCommands.hasOLEDCode;
      
      oledElements.forEach(element => {
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
      });
    }
  }, [isRunning, code, compiledCode]);
  
  // The component doesn't render anything
  return null;
};

export default AVR8Simulator;