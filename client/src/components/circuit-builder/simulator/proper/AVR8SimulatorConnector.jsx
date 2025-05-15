import React, { useEffect, useRef, useCallback } from 'react';
import { AVR8Emulator } from './AVR8Emulator';
import { compileArduino } from './ArduinoCompilerService';

/**
 * Parse delay values from the Arduino code
 * @param {string} code - The Arduino code to parse
 * @returns {number[]} - Array of delay values in milliseconds
 */
function parseDelaysFromCode(code) {
  const delays = [];
  const delayRegex = /delay\s*\(\s*(\d+)\s*\)/g;
  
  let match;
  while ((match = delayRegex.exec(code)) !== null) {
    const delayMs = parseInt(match[1], 10);
    delays.push(delayMs);
  }
  
  return delays;
}

/**
 * AVR8SimulatorConnector
 * 
 * This component connects the AVR8Emulator to React components.
 * It handles the lifecycle of the emulator and provides callbacks
 * for React components to interact with the emulation.
 */
const AVR8SimulatorConnector = ({ 
  code,
  isRunning = false,
  onPinChange,
  onSerialData,
  onLog,
  setCompilationStatus
}) => {
  // Reference to our emulator instance
  const emulatorRef = useRef(null);
  
  // Keep track of our current code
  const codeRef = useRef(code);
  
  // Utility for logging - only log errors and pin updates
  const logInfo = (message) => {
    if (message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('pin ') || 
        message.toLowerCase().includes('fail')) {
      console.log(`[AVR8] ${message}`);
      if (onLog) {
        onLog(message);
      }
    }
  };
  
  // Custom pin change handler that supports proper RGB LED operation
  const handlePinChange = useCallback((pin, isHigh, options = {}) => {
    // Handle ALL pin changes
    const { analogValue } = options;
    const stateLabel = isHigh ? 'HIGH' : 'LOW';
    const pwmValue = analogValue !== undefined ? analogValue : (isHigh ? 255 : 0);
    
    // Log all pin changes
    console.log(`[AVR8] Pin ${pin} changed to ${stateLabel} (analog: ${pwmValue})`);
    
    // Pass the pin change to our parent component
    if (onPinChange) {
      if (options && typeof options.analogValue === 'number') {
        onPinChange(pin, isHigh, { analogValue: options.analogValue });
      } else {
        onPinChange(pin, isHigh);
      }
    }
    
    // Special handling for RGB LED pins
    if (pin === 9 || pin === 10 || pin === 11) {
      const pinColorMap = {
        9: 'red',
        10: 'green',
        11: 'blue'
      };
      
      const color = pinColorMap[pin];
      if (color) {
        console.log(`[AVR8] Updating RGB LED ${color} channel to ${pwmValue}`);
        
        // Update all RGB LEDs with this pin change
        if (window.simulatorContext) {
          const rgbLedIds = Object.keys(window.simulatorContext.componentStates || {})
            .filter(id => id.includes('rgb-led') || 
                          (window.simulatorContext.componentStates[id] && 
                           window.simulatorContext.componentStates[id].type === 'rgb-led'));
          
          // Update each RGB LED component with the pin change
          rgbLedIds.forEach(componentId => {
            console.log(`[AVR8] Updating RGB LED component ${componentId} ${color} channel to ${pwmValue}`);
            
            // Try the global update function if it exists
            if (window.updateRGBLED && window.updateRGBLED[componentId]) {
              window.updateRGBLED[componentId](color, pwmValue);
            }
            
            // Also update through the simulator context
            window.simulatorContext.updateComponentState(componentId, {
              [`${color}Value`]: pwmValue,
              pins: {
                ...(window.simulatorContext.componentStates[componentId]?.pins || {}),
                [color]: pwmValue
              }
            });
          });
        }
      }
    }
  }, [onPinChange]);

  // Initialize the emulator
  useEffect(() => {
    try {
      // Create a new emulator instance with callbacks
      const emulator = new AVR8Emulator({
        onPinChange: handlePinChange,
        onSerialByte: (value, char) => {
          if (onSerialData) {
            onSerialData(value, char);
          }
        },
        onError: (message) => {
          logInfo(message);
        }
      });
      
      emulatorRef.current = emulator;
      
      // Log setup complete
      logInfo('AVR8 simulator initialized');
      
      // Set initialization flag
      emulator.initialized = true;
      logInfo('Simulator ready - waiting for user to click "Run Simulation"');
      
      // Cleanup on unmount
      return () => {
        if (emulatorRef.current) {
          emulatorRef.current.stop();
          emulatorRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing AVR8 emulator:', error);
      logInfo(`Error initializing emulator: ${error.message}`);
    }
  }, []);
  
  // Effect to handle code changes - but only compile, don't auto-run
  useEffect(() => {
    codeRef.current = code;
    
    if (!code || !emulatorRef.current) return;
    
    // Don't auto-compile on every code change
    // User needs to explicitly click Run Simulation
    
    // If isRunning changes (user clicks button), then we'll handle
    // compilation and execution in the isRunning effect below
    
    // Just update the stored code without compiling
    logInfo('Code updated - waiting for user to click "Run Simulation"');
    
  }, [code]);
  
  // Effect to handle running state changes - compile and execute when Run Simulation is clicked
  useEffect(() => {
    if (!emulatorRef.current || !codeRef.current) return;
    
    if (isRunning) {
      // User clicked Run Simulation button
      if (!emulatorRef.current.running) {
        logInfo('User requested to start simulation');
        
        // First stop any existing simulation
        emulatorRef.current.stop();
        
        // Update compilation status to loading
        if (setCompilationStatus) {
          setCompilationStatus({
            status: 'compiling',
            message: 'Compiling Arduino code...'
          });
        }
        
        // Compile and load the code, then start the simulation
        const compileAndStart = async () => {
          try {
            // Compile the Arduino code
            const result = await compileArduino(codeRef.current);
            
            if (result.success) {
              logInfo(`Compilation successful. Program size: ${result.program.length * 2} bytes`);
              
              // Check if the compiled program exists before loading
              if (!result.program || result.program.length === 0) {
                logInfo('Compiled program is empty or invalid');
                
                // Update compilation status
                if (setCompilationStatus) {
                  setCompilationStatus({
                    status: 'error',
                    message: 'Compiled program is empty or invalid'
                  });
                }
                return;
              }
              
              // Log the program contents for debugging
              logInfo(`Program bytes: ${result.program.slice(0, 10).join(', ')}... (${result.program.length} words total)`);
              
              // Load the program into the emulator with pins detected from code
              const loaded = emulatorRef.current.loadProgram(result.program, {
                pinsUsed: result.pinsUsed || []
              });
              
              if (loaded) {
                logInfo('Program loaded successfully with pin detection');
                
                // Update compilation status
                if (setCompilationStatus) {
                  setCompilationStatus({
                    status: 'ready',
                    message: 'Compilation successful'
                  });
                }
                
                // Parse pin usage and delay values from Arduino code
                const delayValues = parseDelaysFromCode(codeRef.current);
                
                // Extract pin information from the compilation result
                const pinsUsed = result.pinsUsed || [];
                const hasRGBLED = result.hasRGBLED || false;
                
                // Store which pins are used in the emulator for debugging
                emulatorRef.current.pinsInUse = pinsUsed;
                
                if (pinsUsed.length > 0) {
                  logInfo(`Found pins used in code: ${pinsUsed.join(', ')}`);
                  
                  // Log specific information about RGB LED pins if they are used
                  if (hasRGBLED) {
                    const rgbPins = pinsUsed.filter(pin => [9, 10, 11].includes(pin));
                    logInfo(`RGB LED pins detected: ${rgbPins.join(', ')}`);
                    logInfo(`Note: Pin 9=Red, Pin 10=Green, Pin 11=Blue`);
                  }
                }
                
                if (delayValues.length > 0) {
                  logInfo(`Found delay values in code: ${delayValues.join(', ')} ms`);
                  
                  // Set the delay values in the emulator for accurate timing
                  emulatorRef.current.setDelayTiming(delayValues);
                } else {
                  logInfo('No delay values found in code. Using default delay timing.');
                }
                
                // Start the emulator with ONLY the compiled code
                // This ensures we use ONLY the CPU emulator and not any shortcuts
                const started = emulatorRef.current.start();
                
                if (!started) {
                  logInfo('Failed to start emulator after loading program');
                }
              } else {
                logInfo('Failed to load program');
                
                // Update compilation status
                if (setCompilationStatus) {
                  setCompilationStatus({
                    status: 'error',
                    message: 'Failed to load program'
                  });
                }
              }
            } else {
              logInfo(`Compilation failed: ${result.error}`);
              
              // Update compilation status
              if (setCompilationStatus) {
                setCompilationStatus({
                  status: 'error',
                  message: `Compilation failed: ${result.error}`
                });
              }
            }
          } catch (error) {
            logInfo(`Error during compilation: ${error.message}`);
            
            // Update compilation status
            if (setCompilationStatus) {
              setCompilationStatus({
                status: 'error',
                message: `Error: ${error.message}`
              });
            }
          }
        };
        
        // Run the compilation and start process
        compileAndStart();
      }
    } else {
      // User clicked Stop Simulation button
      if (emulatorRef.current.running) {
        logInfo('Stopping emulator');
        emulatorRef.current.stop();
      }
    }
  }, [isRunning, setCompilationStatus]);
  
  // This is a non-visual component
  return null;
};

export default AVR8SimulatorConnector;