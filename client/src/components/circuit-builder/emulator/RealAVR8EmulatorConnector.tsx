/**
 * RealAVR8EmulatorConnector.tsx
 * 
 * This component connects the real AVR8 emulator to our React components.
 * It handles loading code, starting/stopping simulation, and forwarding
 * pin change signals to the UI.
 */

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { RealAVR8Emulator } from '../simulator/proper/RealAVR8Emulator';
import { EmulatedLEDComponent, EmulatedLEDComponentType } from './EmulatedLEDComponent';

// Type definitions for external interface
interface RealAVR8EmulatorConnectorProps {
  code: string;
  isRunning?: boolean;
  onPinChange?: (pin: string | number, isHigh: boolean, options?: any) => void;
  onSerialData?: (value: number, char: string) => void;
  onLogMessage?: (message: string) => void;
  onPinStateChange?: (pin: string, isHigh: boolean) => void;
  onEmulationError?: (message: string) => void;
  components?: Record<string, any>;
}

// Interface for the component ref
export interface EmulatorRefType {
  start: () => void;
  stop: () => void;
  reset: () => void;
  setDigitalInput: (pin: string | number, isHigh: boolean) => void;
  setAnalogInput: (pin: string, value: number) => void;
  loadCode: (code: string) => Promise<{success: boolean, error?: string}>;
  pinStates: Record<string, boolean>;
}

/**
 * RealAVR8EmulatorConnector Component
 * 
 * This component serves as the intermediary between the React UI and the RealAVR8Emulator.
 * It handles all communication with the emulator and manages the lifecycle
 * of the emulation engine, ensuring proper initialization, loading, and cleanup.
 */
const RealAVR8EmulatorConnector = forwardRef<EmulatorRefType, RealAVR8EmulatorConnectorProps>((props, ref) => {
  const {
    code,
    isRunning = false,
    onLogMessage,
    onSerialData,
    onEmulationError,
    onPinStateChange,
    components = {},
    onPinChange
  } = props;

  // Reference to the actual emulator instance
  const emulatorRef = useRef<RealAVR8Emulator | null>(null);
  
  // State to track if emulation is active
  const [isActive, setIsActive] = useState(false);
  
  // State to track if compilation was successful
  const [compilationSuccess, setCompilationSuccess] = useState(false);
  
  // Expose methods to parent components through the ref
  useImperativeHandle(ref, () => ({
    start: () => {
      if (emulatorRef.current) {
        emulatorRef.current.start();
        setIsActive(true);
      }
    },
    stop: () => {
      if (emulatorRef.current) {
        emulatorRef.current.stop();
        setIsActive(false);
      }
    },
    reset: () => {
      if (emulatorRef.current) {
        emulatorRef.current.reset();
      }
    },
    setDigitalInput: (pin: string | number, isHigh: boolean) => {
      if (emulatorRef.current) {
        emulatorRef.current.setDigitalInput(pin, isHigh);
      }
    },
    setAnalogInput: (pin: string, value: number) => {
      if (emulatorRef.current) {
        emulatorRef.current.setAnalogInput(pin, value);
      }
    },
    loadCode: async (code: string) => {
      if (emulatorRef.current) {
        try {
          const result = await emulatorRef.current.loadCode(code);
          return { success: true };
        } catch (error) {
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      }
      return { success: false, error: 'Emulator not initialized' };
    },
    // Return a copy of the current pin states
    get pinStates() {
      return emulatorRef.current?.getPinStates() || {};
    }
  }));
  
  // Function to find which component a pin belongs to
  const findComponentIdByPin = (pinStr: string) => {
    // This would map pin numbers to component IDs in a real implementation
    return null;
  };
  
  // Initialize emulator on mount
  useEffect(() => {
    let statusInterval: NodeJS.Timeout;
    
    // Initialize the emulator
    const setupEmulator = () => {
      // Create a new emulator instance if it doesn't exist
      if (!emulatorRef.current) {
        try {
          // Set up the pin change handler to propagate signals
          const handlePinChange = (pin: string | number, isHigh: boolean, options?: any) => {
            // Convert pin to string if it's a number
            const pinStr = pin.toString();
            const pinChangeTime = new Date().toLocaleTimeString();
            
            // Always log every pin change with detailed information
            console.log(`[EMULATOR] Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            onLogMessage?.(`[${pinChangeTime}] Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            
            // Forward this to the parent component if defined
            if (props.onPinChange) {
              props.onPinChange(pin, isHigh, options);
            }
            
            // For pin 13 (built-in LED), provide more detailed user-facing feedback
            if (pinStr === '13') {
              const ledStatus = isHigh ? 'ON' : 'OFF';
              console.log(`[EMULATOR] 💡 Built-in LED is ${ledStatus}`);
              onLogMessage?.(`[${pinChangeTime}] 💡 Built-in LED is ${ledStatus}`);
              
              // Update the component pin state
              if (onPinStateChange) {
                onPinStateChange(pinStr, isHigh);
              }
            }
            
            // Find the component that this pin belongs to
            const componentId = findComponentIdByPin(pinStr);
            
            // Calculate voltage (5V for HIGH, 0V for LOW)
            // For analog pins, use the analog value if provided
            let voltage = isHigh ? 5.0 : 0.0;
            if (options && typeof options.analogValue !== 'undefined') {
              voltage = (options.analogValue / 1023) * 5.0; // Convert 0-1023 to 0-5V
            }
            
            // Update the LED component if it exists
            if (window.emulatedComponents && window.emulatedComponents[`led-${pinStr}`]) {
              const ledComponent = window.emulatedComponents[`led-${pinStr}`] as EmulatedLEDComponentType;
              if (ledComponent && ledComponent.setLedState) {
                ledComponent.setLedState(isHigh);
              }
            }
          };
          
          // Handle serial data from the emulator
          const handleSerialData = (value: number, char: string) => {
            if (onSerialData) {
              onSerialData(value, char);
            }
            
            // Also log to the console for debugging
            console.log(`[Serial] ${char} (${value})`);
            
            // Add to logs
            onLogMessage?.(`[Serial] ${char}`);
          };
          
          // Handle errors from the emulator
          const handleError = (message: string) => {
            onEmulationError?.(message);
            console.error(`[Emulator Error] ${message}`);
            onLogMessage?.(`⚠️ Error: ${message}`);
          };
          
          // Create the emulator instance with callbacks
          emulatorRef.current = new RealAVR8Emulator({
            onPinChange: handlePinChange,
            onSerialData: handleSerialData,
            onError: handleError,
            onLogMessage: (message: string) => {
              console.log(`[AVR8] ${message}`);
              onLogMessage?.(`[AVR8] ${message}`);
            }
          });
          
          onLogMessage?.('✅ AVR8 emulator initialized');
          console.log('RealAVR8Emulator initialized successfully');
          
        } catch (error) {
          console.error('Failed to initialize emulator:', error);
          onEmulationError?.(`Failed to initialize emulator: ${error}`);
        }
      }
    };
    
    // Set up the emulator
    setupEmulator();
    
    return () => {
      // Stop the emulator and clear any intervals
      if (emulatorRef.current) {
        emulatorRef.current.stop();
      }
      
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [onLogMessage, onSerialData, onEmulationError, onPinStateChange, onPinChange]);
  
  // Handle changes to the isRunning prop
  useEffect(() => {
    let statusInterval: NodeJS.Timeout;
    
    // Start or stop the emulator based on isRunning
    if (isRunning) {
      onLogMessage?.('Starting hardware emulation...');
      
      // If we've already compiled the code successfully, just start it
      if (compilationSuccess && emulatorRef.current) {
        try {
          emulatorRef.current.start();
          setIsActive(true);
          console.log('AVR8 Emulation started');
          onLogMessage?.('✅ Emulation started');
          
          // Set up a monitor to periodically check and report pin states
          statusInterval = setInterval(() => {
            try {
              const pinStates = emulatorRef.current?.getPinStates() || {};
              const timestamp = new Date().toLocaleTimeString();
              const pin13State = !!pinStates['13']; 
              
              // Report to UI
              onLogMessage?.(`[${timestamp}] 🔍 LED Status: ${pin13State ? 'ON' : 'OFF'}`);
              
              // Update pin state tracking
              if (onPinStateChange) {
                onPinStateChange('13', pin13State);
              }
            } catch (err) {
              console.error('Error in pin monitoring:', err);
            }
          }, 1500);
          
        } catch (error) {
          console.error('Failed to start emulation:', error);
          onEmulationError?.(`Failed to start emulation: ${error}`);
        }
      } else {
        // Try to compile and load the code first
        const compileAndStart = async () => {
          try {
            if (emulatorRef.current) {
              const result = await emulatorRef.current.loadCode(code);
              if (result?.success) {
                emulatorRef.current.start();
                setIsActive(true);
                setCompilationSuccess(true);
                onLogMessage?.('✅ Code compiled and emulation started');
                console.log('AVR8 Emulation started after compilation');
                
                // Same monitoring logic as above
                statusInterval = setInterval(() => {
                  try {
                    const pinStates = emulatorRef.current?.getPinStates() || {};
                    const timestamp = new Date().toLocaleTimeString();
                    const pin13State = !!pinStates['13']; 
                    onLogMessage?.(`[${timestamp}] 💡 LED status: ${pin13State ? 'ON' : 'OFF'}`);
                    
                    if (onPinStateChange) {
                      onPinStateChange('13', pin13State);
                    }
                  } catch (err) {
                    console.error('Error in pin monitoring:', err);
                  }
                }, 1500);
                
              } else {
                console.error('Failed to compile code:', result?.error);
                onEmulationError?.(`Failed to compile code: ${result?.error}`);
              }
            }
          } catch (error) {
            console.error('Error during compilation and start:', error);
            onEmulationError?.(`Error during compilation and start: ${error}`);
          }
        };
        
        compileAndStart();
      }
    } else {
      // Stop the emulator if it's running
      if (isActive && emulatorRef.current) {
        emulatorRef.current.stop();
        setIsActive(false);
        onLogMessage?.('Emulation stopped');
        
        // Clear any monitoring intervals
        if (statusInterval) {
          clearInterval(statusInterval);
        }
      }
    }
    
    return () => {
      // Clean up interval on unmount or when isRunning changes
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [isRunning, code, compilationSuccess, isActive, onLogMessage, onEmulationError, onPinStateChange]);
  
  // Load code when it changes
  useEffect(() => {
    // Only try to load code if we have an emulator instance
    // and we're not currently running (to avoid disruption)
    if (emulatorRef.current && !isActive && code) {
      setCompilationSuccess(false);
      
      // Try to compile the code
      const compileCode = async () => {
        try {
          const result = await emulatorRef.current?.loadCode(code);
          if (result?.success) {
            setCompilationSuccess(true);
            onLogMessage?.('✅ Code compiled successfully');
          } else {
            console.error('Failed to compile code:', result?.error);
            onEmulationError?.(`Failed to compile code: ${result?.error}`);
          }
        } catch (error) {
          console.error('Error during code compilation:', error);
          onEmulationError?.(`Error during code compilation: ${error}`);
        }
      };
      
      compileCode();
    }
  }, [code, isActive, onLogMessage, onEmulationError]);
  
  // Return an empty div - this component doesn't render anything
  return (
    <div className="hidden">
      {/* This component doesn't render any UI elements */}
    </div>
  );
});

export default RealAVR8EmulatorConnector;