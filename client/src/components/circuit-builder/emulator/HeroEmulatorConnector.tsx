/**
 * HeroEmulatorConnector.tsx
 * 
 * This component connects our HeroEmulator to the Sandbox application components.
 * It provides APIs compatible with the existing Sandbox component system while
 * ensuring all component behaviors are driven by the actual hardware emulation.
 */

import React, { useEffect, useRef, useState } from 'react';
import { HeroEmulator } from './HeroEmulator';

interface HeroEmulatorConnectorProps {
  code: string;
  isRunning: boolean;
  onPinChange?: (pin: string | number, isHigh: boolean, options?: any) => void;
  onSerialData?: (value: number, char: string) => void;
  onLog?: (message: string) => void;
  onError?: (message: string) => void;
}

/**
 * HeroEmulatorConnector Component
 * 
 * This connector maintains the emulator instance and bridges API differences
 * between our emulator and the existing Sandbox APIs.
 */
const HeroEmulatorConnector: React.FC<HeroEmulatorConnectorProps> = ({
  code,
  isRunning,
  onPinChange,
  onSerialData,
  onLog,
  onError,
}) => {
  // Reference to the HeroEmulator instance
  const emulatorRef = useRef<HeroEmulator | null>(null);
  
  // Hex code compiled from Arduino source
  const [compiledHex, setCompiledHex] = useState<string | null>(null);
  
  // Track emulator state
  const [emulatorRunning, setEmulatorRunning] = useState(false);
  
  // Initialize the emulator on component mount
  useEffect(() => {
    // Create a new emulator instance
    if (!emulatorRef.current) {
      emulatorRef.current = new HeroEmulator({
        onPinChange: (pin, isHigh, options) => {
          // Forward pin change events to parent component
          if (onPinChange) {
            onPinChange(pin, isHigh, options);
          }
          
          // Log the pin change
          if (onLog) {
            onLog(`[HERO Emulator] Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
          }
        },
        onSerialData: (value, char) => {
          // Forward serial data to parent component
          if (onSerialData) {
            onSerialData(value, char);
          }
          
          // Log the serial data
          if (onLog) {
            onLog(`[HERO Emulator] Serial: ${char} (${value})`);
          }
        },
        onLog: (message) => {
          // Forward log messages to parent component
          if (onLog) {
            onLog(message);
          }
        },
        onError: (message) => {
          // Forward error messages to parent component
          if (onError) {
            onError(message);
          }
        },
      });
      
      if (onLog) {
        onLog('[HERO Emulator] HERO board emulator initialized');
      }
    }
    
    // Clean up the emulator when the component unmounts
    return () => {
      if (emulatorRef.current) {
        emulatorRef.current.stop();
        if (onLog) {
          onLog('[HERO Emulator] HERO board emulator stopped and cleaned up');
        }
      }
    };
  }, [onPinChange, onSerialData, onLog, onError]);
  
  // Handle code changes and compile to hex
  useEffect(() => {
    if (!code || code.trim() === '') {
      setCompiledHex(null);
      return;
    }
    
    // TODO: Integrate with actual Arduino compiler
    // For now, we'll use a placeholder. In production, we would send the code
    // to a server for compilation or use a WebAssembly compiler.
    
    if (onLog) {
      onLog('[HERO Emulator] Code updated, ready for compilation');
    }
    
    // If we can compile the code to hex, do it here and call setCompiledHex()
    
  }, [code, onLog]);
  
  // Handle changes to isRunning prop
  useEffect(() => {
    if (!emulatorRef.current) return;
    
    if (isRunning && !emulatorRunning) {
      // Start the emulator
      if (compiledHex) {
        // Load the program if we have hex code
        emulatorRef.current.loadProgram(compiledHex);
      }
      
      const success = emulatorRef.current.start();
      if (success) {
        setEmulatorRunning(true);
        if (onLog) {
          onLog('[HERO Emulator] Emulation started');
        }
      } else {
        if (onError) {
          onError('[HERO Emulator] Failed to start emulation');
        }
      }
    } else if (!isRunning && emulatorRunning) {
      // Stop the emulator
      emulatorRef.current.stop();
      setEmulatorRunning(false);
      if (onLog) {
        onLog('[HERO Emulator] Emulation stopped');
      }
    }
  }, [isRunning, emulatorRunning, compiledHex, onLog, onError]);
  
  // This is a non-visual component, it just manages the emulator instance
  return null;
};

export default HeroEmulatorConnector;