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
      if (!isLibraryLoaded(lib)) {
        logInfo(`Loading library: ${lib}`);
        await loadLibrary(lib);
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
  
  // Find and initialize OLED displays in the circuit
  useEffect(() => {
    if (!isRunning) return;
    
    // Find all OLED components in the DOM
    const oledElements = document.querySelectorAll('[id^="oled-display-"]');
    
    if (oledElements.length > 0) {
      logInfo(`Initializing ${oledElements.length} OLED display(s)`);
      
      oledElements.forEach(element => {
        const oledId = element.id;
        
        // Create an empty display buffer (128x64 pixels for SSD1306)
        const displayBuffer = new Array(64).fill(0).map(() => 
          new Array(128).fill(0)
        );
        
        // Update component state with the buffer
        updateComponentState(oledId, {
          buffer: displayBuffer,
          initialized: true
        });
        
        logInfo(`OLED display ${oledId} initialized`);
      });
    }
  }, [isRunning]);
  
  // The component doesn't render anything
  return null;
};

export default AVR8Simulator;