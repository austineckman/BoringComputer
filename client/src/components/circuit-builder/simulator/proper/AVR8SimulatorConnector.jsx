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
  
  // Initialize the emulator
  useEffect(() => {
    // Create a new emulator instance
    const emulator = new AVR8Emulator();
    emulatorRef.current = emulator;
    
    // Set up event handlers
    if (onPinChange) {
      emulator.onPinChange(onPinChange);
    }
    
    if (onSerialData) {
      emulator.onSerialData(onSerialData);
    }
    
    if (onLog) {
      emulator.onLog(onLog);
    }
    
    // Log setup complete
    logInfo('AVR8 simulator initialized');
    
    // Cleanup on unmount
    return () => {
      if (emulatorRef.current) {
        logInfo('Cleaning up simulator');
        emulatorRef.current.cleanup();
        emulatorRef.current = null;
      }
    };
  }, []);
  
  // Utility for logging
  const logInfo = (message) => {
    console.log(`[AVR8] ${message}`);
    if (onLog) {
      onLog(message);
    }
  };
  
  // Effect to handle code changes
  useEffect(() => {
    codeRef.current = code;
    
    if (!code || !emulatorRef.current) return;
    
    // Stop the emulator if it's running
    if (emulatorRef.current.running) {
      emulatorRef.current.stop();
    }
    
    // Compile the new code
    logInfo('Compiling code...');
    
    // Set compilation status to loading
    if (setCompilationStatus) {
      setCompilationStatus({
        status: 'compiling',
        message: 'Compiling Arduino code...'
      });
    }
    
    const compileAndLoad = async () => {
      try {
        // Compile the Arduino code
        const result = await compileArduino(code);
        
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
            
            // Start the emulator if isRunning is true
            if (isRunning) {
              emulatorRef.current.start();
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
    
    // Run the compilation process
    compileAndLoad();
  }, [code]);
  
  // Effect to handle running state changes
  useEffect(() => {
    if (!emulatorRef.current) return;
    
    if (isRunning) {
      if (!emulatorRef.current.running) {
        logInfo('Starting emulator');
        emulatorRef.current.start();
      }
    } else {
      if (emulatorRef.current.running) {
        logInfo('Stopping emulator');
        emulatorRef.current.stop();
      }
    }
  }, [isRunning]);
  
  // This is a non-visual component
  return null;
};

export default AVR8SimulatorConnector;