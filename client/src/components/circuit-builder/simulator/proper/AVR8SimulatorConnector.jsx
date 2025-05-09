import React, { useEffect, useRef } from 'react';
import { AVR8Emulator } from './AVR8Emulator';
import { compileArduino } from './ArduinoCompilerService';

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
  
  // Initialize the emulator
  useEffect(() => {
    try {
      // Create a new emulator instance with callbacks
      const emulator = new AVR8Emulator({
        onPinChange: (pin, isHigh, options) => {
          if (onPinChange) {
            // Pass analog value if available (for PWM pins)
            if (options && typeof options.analogValue === 'number') {
              onPinChange(pin, isHigh, { analogValue: options.analogValue });
            } else {
              onPinChange(pin, isHigh);
            }
          }
        },
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
              
              // Load the program into the emulator
              const loaded = emulatorRef.current.loadProgram(result.program);
              
              if (loaded) {
                logInfo('Program loaded successfully');
                
                // Update compilation status
                if (setCompilationStatus) {
                  setCompilationStatus({
                    status: 'ready',
                    message: 'Compilation successful'
                  });
                }
                
                // Start the emulator with the parsed user program
                emulatorRef.current.start(result.userProgram);
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