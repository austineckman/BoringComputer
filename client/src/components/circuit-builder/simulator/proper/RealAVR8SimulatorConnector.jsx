/**
 * RealAVR8SimulatorConnector.jsx
 * 
 * A React component that connects the RealAVR8Emulator to the circuit simulator UI.
 * This provides the interface between the React components and the emulator.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RealAVR8Emulator } from './RealAVR8Emulator';

/**
 * The RealAVR8SimulatorConnector component connects the RealAVR8Emulator to React components.
 * @param {Object} props - The component props
 * @param {string} props.code - The Arduino code to run
 * @param {boolean} props.isRunning - Whether the simulation should be running
 * @param {Function} props.onPinChange - Callback for pin state changes
 * @param {Function} props.onSerialOutput - Callback for serial output
 * @param {Function} props.onError - Callback for errors
 * @param {Function} props.onLogMessage - Callback for log messages
 * @param {Function} props.setCompilationStatus - Callback to update compilation status
 */
const RealAVR8SimulatorConnector = ({ 
  code,
  isRunning,
  onPinChange,
  onSerialOutput,
  onError,
  onLogMessage,
  setCompilationStatus,
  children
}) => {
  // Create a ref to hold the emulator instance
  const emulatorRef = useRef(null);
  
  // Keep a reference to the latest code
  const codeRef = useRef(code);
  
  // Track whether the code has been compiled and loaded
  const [compilationSuccess, setCompilationSuccess] = useState(false);
  
  // Update code reference when it changes
  useEffect(() => {
    codeRef.current = code;
    // Reset compilation status when code changes
    setCompilationSuccess(false);
    
    if (setCompilationStatus) {
      setCompilationStatus({
        status: 'idle',
        message: 'Code updated - waiting for simulation start'
      });
    }
  }, [code, setCompilationStatus]);
  
  // Initialize the emulator
  useEffect(() => {
    // Create the emulator instance
    emulatorRef.current = new RealAVR8Emulator({
      onPinChange: (pin, isHigh, options) => {
        if (onPinChange) {
          onPinChange(pin, isHigh, options);
        }
      },
      onSerialByte: (value, char) => {
        if (onSerialOutput) {
          onSerialOutput(value, char);
        }
      },
      onError: (message) => {
        if (onError) {
          onError(message);
        }
      },
      onLogMessage: (message) => {
        if (onLogMessage) {
          onLogMessage(message);
        }
      }
    });
    
    // Clean up the emulator on unmount
    return () => {
      if (emulatorRef.current) {
        emulatorRef.current.stop();
        emulatorRef.current = null;
      }
    };
  }, [onPinChange, onSerialOutput, onError, onLogMessage]);
  
  // Handle the simulation running state
  useEffect(() => {
    if (!emulatorRef.current) return;
    
    const emulator = emulatorRef.current;
    
    if (isRunning) {
      // Compile and load the code if needed
      if (!compilationSuccess) {
        const compileAndLoad = async () => {
          try {
            // Update compilation status
            if (setCompilationStatus) {
              setCompilationStatus({
                status: 'compiling',
                message: 'Compiling Arduino code...'
              });
            }
            
            // Load the code into the emulator
            const result = await emulator.loadCode(codeRef.current);
            
            if (result.success) {
              // Update compilation status
              if (setCompilationStatus) {
                setCompilationStatus({
                  status: 'success',
                  message: 'Compilation successful'
                });
              }
              
              setCompilationSuccess(true);
              
              // Start the emulation
              emulator.start();
            } else {
              // Update compilation status
              if (setCompilationStatus) {
                setCompilationStatus({
                  status: 'error',
                  message: `Compilation failed: ${result.error || 'Unknown error'}`
                });
              }
              
              if (onError) {
                onError(`Compilation failed: ${result.error || 'Unknown error'}`);
              }
            }
          } catch (error) {
            // Update compilation status
            if (setCompilationStatus) {
              setCompilationStatus({
                status: 'error',
                message: `Error: ${error.message || 'Unknown error'}`
              });
            }
            
            if (onError) {
              onError(`Error: ${error.message || 'Unknown error'}`);
            }
          }
        };
        
        compileAndLoad();
      } else {
        // Code is already compiled, just start the emulation
        emulator.start();
      }
    } else {
      // Stop the emulation
      emulator.stop();
    }
  }, [isRunning, compilationSuccess, setCompilationStatus, onError]);
  
  // Expose utility functions to detect pins and delays
  const detectPinsUsed = useCallback((code) => {
    return RealAVR8Emulator.detectPinsUsed(code);
  }, []);
  
  const parseDelays = useCallback((code) => {
    return RealAVR8Emulator.parseDelays(code);
  }, []);
  
  // Set a digital input (used by buttons, switches, etc.)
  const setDigitalInput = useCallback((pin, isHigh) => {
    if (emulatorRef.current) {
      emulatorRef.current.setDigitalInput(pin, isHigh);
    }
  }, []);
  
  // Set an analog input (used by potentiometers, etc.)
  const setAnalogInput = useCallback((pin, value) => {
    if (emulatorRef.current) {
      emulatorRef.current.setAnalogInput(pin, value);
    }
  }, []);
  
  // The context value provided to children
  const contextValue = {
    emulator: emulatorRef.current,
    isRunning,
    compilationSuccess,
    detectPinsUsed,
    parseDelays,
    setDigitalInput,
    setAnalogInput
  };
  
  // Render children with the simulator context
  return (
    <div className="simulator-connector">
      {/* Provide the context value to children */}
      {typeof children === 'function' ? children(contextValue) : children}
    </div>
  );
};

export default RealAVR8SimulatorConnector;