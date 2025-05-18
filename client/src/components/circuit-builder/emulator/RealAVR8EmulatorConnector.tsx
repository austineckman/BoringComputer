/**
 * RealAVR8EmulatorConnector.tsx
 * 
 * This component connects the RealAVR8Emulator to the UniversalEmulatorApp.
 * It serves as the intermediary between the React UI and the true AVR8 emulator.
 */

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
// @ts-ignore - Importing JS module
import { RealAVR8Emulator } from '../simulator/proper/RealAVR8Emulator';
import { WireManager, Wire } from './WireManager';
import { EmulatedComponent } from './HeroEmulator'; // Using same component interface

interface RealAVR8EmulatorConnectorProps {
  code: string;
  isRunning?: boolean;
  onLogMessage?: (message: string) => void;
  onSerialData?: (value: number, char: string) => void;
  onEmulationError?: (error: string) => void;
  onPinStateChange?: (pin: string, isHigh: boolean) => void;
  components?: Record<string, EmulatedComponent>;
  wires?: Array<{
    id: string;
    sourceComponentId: string;
    targetComponentId: string;
    sourcePin: string;
    targetPin: string;
    path?: Array<{x: number, y: number}>;
  }>;
}

// Define the ref interface
interface EmulatorRefType {
  getPinVoltages: () => Record<string, number>;
  getWires: () => Wire[];
  isRunning: boolean;
}

/**
 * RealAVR8EmulatorConnector Component
 * 
 * This component serves as the intermediary between the React UI and the RealAVR8Emulator.
 * It handles all communication with the emulator and manages the lifecycle
 * of the emulation engine, ensuring proper initialization, loading, and cleanup.
 */
const RealAVR8EmulatorConnector = forwardRef<EmulatorRefType, RealAVR8EmulatorConnectorProps>(
  (props, ref) => {
    const {
      code,
      isRunning = false,
      onLogMessage,
      onSerialData,
      onEmulationError,
      onPinStateChange,
      components = {},
      wires = []
    } = props;
    
    // Reference to the emulator instance
    const emulatorRef = useRef<RealAVR8Emulator | null>(null);
    
    // Reference to the wire manager
    const wireManagerRef = useRef<WireManager | null>(null);
    
    // State to track whether emulation is active
    const [isActive, setIsActive] = useState(false);
    
    // State to track compilation status
    const [compilationSuccess, setCompilationSuccess] = useState(false);
    
    // State to track pin voltages for debugging
    const [pinVoltages, setPinVoltages] = useState<Record<string, number>>({});
    
    // Expose API via ref
    useImperativeHandle(ref, () => ({
      getPinVoltages: () => pinVoltages,
      getWires: () => wireManagerRef.current?.getAllWires() || [],
      isRunning: isActive
    }));
    
    // Initialize the emulator on component mount
    useEffect(() => {
      // Create a new emulator instance if it doesn't exist
      if (!emulatorRef.current) {
        try {
          // Set up the pin change handler to propagate signals
          const handlePinChange = (pin: string | number, isHigh: boolean, options?: any) => {
            // Convert pin to string if it's a number
            const pinStr = pin.toString();
            
            // For pin 13 (built-in LED), provide more detailed user-facing feedback
            if (pinStr === '13') {
              onLogMessage?.(`[Arduino] Built-in LED is ${isHigh ? 'ON' : 'OFF'}`);
            }
            
            // Find the component that this pin belongs to
            const componentId = findComponentIdByPin(pinStr);
            
            // Calculate voltage (5V for HIGH, 0V for LOW)
            // For analog pins, use the analog value if provided
            let voltage = isHigh ? 5.0 : 0.0;
            let analogValue = 0;
            
            if (options && options.analogValue !== undefined) {
              // Store analog value
              analogValue = options.analogValue;
              // Map analog value (0-255) to voltage (0-5V)
              voltage = (analogValue / 255) * 5.0;
            }
            
            // Record the voltage for this pin
            if (componentId) {
              const pinKey = `${componentId}.${pinStr}`;
              setPinVoltages(prev => ({
                ...prev,
                [pinKey]: voltage
              }));
              
              // Propagate the signal through the wire network
              if (wireManagerRef.current) {
                wireManagerRef.current.propagateSignal(componentId, pinStr, voltage);
              }
              
              // Log component-specific changes
              if (componentId !== 'heroboard' && 
                  (pinStr === '13' || // always log pin 13 (LED)
                   isHigh)) { // only log HIGH states for most pins to reduce noise
                onLogMessage?.(`[${componentId}] Received signal: ${isHigh ? 'ON' : 'OFF'}`);
              }
            }
            
            // DIRECT COMPONENT UPDATE: Update component state directly in window.emulatedComponents
            if (window.emulatedComponents && componentId && window.emulatedComponents[componentId]) {
              const component = window.emulatedComponents[componentId];
              
              // Check component type and update accordingly
              if (component.type === 'led') {
                if (component.anode?.toString() === pinStr) {
                  component.isOn = isHigh;
                  console.log(`🔌 DIRECT UPDATE: LED ${componentId} set to ${isHigh ? 'ON' : 'OFF'}`);
                  onLogMessage?.(`💡 LED ${componentId} directly set to ${isHigh ? 'ON' : 'OFF'}`);
                }
              }
              
              // Force a DOM update by triggering a custom event
              document.dispatchEvent(new CustomEvent('component-state-changed', { 
                detail: { componentId, pinId: pinStr, isHigh } 
              }));
            }
            
            // Always update built-in LED on pin 13 (standard Arduino behavior)
            if (pinStr === '13' && window.emulatedComponents) {
              // Find the HERO board component
              const heroComponent = Object.entries(window.emulatedComponents)
                .find(([_, comp]) => comp.type === 'heroboard' || comp.type === 'arduino');
                
              if (heroComponent) {
                const [heroId, hero] = heroComponent;
                // @ts-ignore - Update the built-in LED state
                if (hero.builtInLed !== undefined) {
                  // @ts-ignore - TypeScript doesn't know about this property
                  hero.builtInLed = isHigh;
                  console.log(`🔌 DIRECT UPDATE: Built-in LED on ${heroId} set to ${isHigh ? 'ON' : 'OFF'}`);
                  onLogMessage?.(`💡 Built-in LED directly set to ${isHigh ? 'ON' : 'OFF'}`);
                  
                  // Force a DOM update
                  document.dispatchEvent(new CustomEvent('component-state-changed', { 
                    detail: { componentId: heroId, pinId: '13', isHigh } 
                  }));
                }
              }
            }
            
            // Add detailed logs with timestamp for any pin changes
            const timestamp = new Date().toLocaleTimeString();
            const pinMessage = `[${timestamp}] Pin ${pinStr} changed to ${isHigh ? 'HIGH ⚡' : 'LOW ⚫'}`;
            
            // Log to console for debugging
            console.log(`EMULATOR EVENT: ${pinMessage}`);
            
            // Always send to UI logs with visual indicators
            onLogMessage?.(pinMessage);
            
            // For pin 13 (built-in LED), provide special emphasis
            if (pinStr === '13') {
              const ledMessage = `[${timestamp}] 💡 Built-in LED is now ${isHigh ? 'ON' : 'OFF'}`;
              console.log(`EMULATOR LED: ${ledMessage}`);
              onLogMessage?.(ledMessage);
            }
            
            // Call the pin state change callback with extra metadata
            if (onPinStateChange) {
              onPinStateChange(pinStr, isHigh, { 
                timestamp,
                source: 'emulator',
                forced: true 
              });
            }
          };
          
          // Create the emulator with callbacks
          emulatorRef.current = new RealAVR8Emulator({
            onPinChange: handlePinChange,
            onSerialByte: (value: number, char: string) => {
              // Format serial output
              const displayChar = char === '\n' ? '\\n' : 
                                 char === '\r' ? '\\r' : 
                                 char === '\t' ? '\\t' : char;
                                 
              // Log serial data both to console and UI
              console.log(`[Serial] Received: ${value} (${displayChar})`);
              // Serial output should always be visible in logs
              onLogMessage?.(`[Arduino] Serial output: "${displayChar}"`);
              
              // Pass to serial handler
              onSerialData?.(value, char);
            },
            onError: (message: string) => {
              console.error(`[Emulator Error] ${message}`);
              onEmulationError?.(`[Emulator Error] ${message}`);
            },
            onLogMessage: (message: string) => {
              console.log(`[Emulator] ${message}`);
              onLogMessage?.(`[Emulator] ${message}`);
            }
          });
          
          // Add to window for global access (useful for debugging)
          if (window) {
            window.realAVR8Emulator = emulatorRef.current;
          }
          
          // Create the wire manager
          wireManagerRef.current = new WireManager({
            detectShorts: true,
            onShortCircuit: (wireId, sourcePinId, targetPinId) => {
              console.error(`Short circuit detected: ${sourcePinId} -> ${targetPinId}`);
              onEmulationError?.(`Short circuit detected between ${sourcePinId} and ${targetPinId}`);
            }
          });
          
          // Connect the wire manager to the emulator (if using the same interface)
          if (wireManagerRef.current && emulatorRef.current) {
            // Adapt the wire manager to work with our emulator if needed
            wireManagerRef.current.setEmulator(emulatorRef.current as any);
          }
          
          console.log('RealAVR8Emulator and WireManager initialized successfully');
          onLogMessage?.('Real AVR8 Emulator initialized successfully');
        } catch (error) {
          console.error('Failed to initialize RealAVR8Emulator:', error);
          onEmulationError?.(`Failed to initialize emulator: ${error}`);
        }
      }
      
      // Clean up emulator on component unmount
      return () => {
        if (emulatorRef.current) {
          try {
            emulatorRef.current.stop();
            emulatorRef.current = null;
            wireManagerRef.current = null;
            if (window) {
              window.realAVR8Emulator = undefined;
            }
            console.log('RealAVR8Emulator cleaned up');
          } catch (error) {
            console.error('Error cleaning up emulator:', error);
          }
        }
      };
    }, [onLogMessage, onSerialData, onEmulationError, onPinStateChange]);
    
    // Helper function to find which component owns a pin
    const findComponentIdByPin = (pinId: string | number): string | null => {
      // Convert the pinId to string for comparison
      const pinIdStr = pinId.toString();
      
      // Check each component for this pin
      for (const [componentId, component] of Object.entries(components)) {
        // The logic here depends on how pins are stored in components
        if (component.type === 'led') {
          const ledComponent = component as any;
          if (ledComponent.anode?.toString() === pinIdStr || 
              ledComponent.cathode?.toString() === pinIdStr) {
            return componentId;
          }
        } else if (component.type === 'button') {
          const buttonComponent = component as any;
          if (buttonComponent.pin?.toString() === pinIdStr || 
              buttonComponent.groundPin?.toString() === pinIdStr) {
            return componentId;
          }
        } else if (component.type === 'oled') {
          const oledComponent = component as any;
          if (oledComponent.sclPin?.toString() === pinIdStr || 
              oledComponent.sdaPin?.toString() === pinIdStr || 
              (oledComponent.resetPin && oledComponent.resetPin.toString() === pinIdStr)) {
            return componentId;
          }
        } else if (component.type === 'potentiometer') {
          const potComponent = component as any;
          if (potComponent.pin?.toString() === pinIdStr) {
            return componentId;
          }
        } else if (component.type === 'buzzer') {
          const buzzerComponent = component as any;
          if (buzzerComponent.pin?.toString() === pinIdStr || 
              buzzerComponent.groundPin?.toString() === pinIdStr) {
            return componentId;
          }
        }
        // Add more component types as needed
      }
      
      // If the pin doesn't belong to any component, it might be a direct microcontroller pin
      return 'heroboard';
    };
    
    // Register components with the emulator
    useEffect(() => {
      if (emulatorRef.current) {
        // Register each component with the emulator
        Object.entries(components).forEach(([id, component]) => {
          try {
            // Our real emulator may not directly support this yet,
            // so we'll add logging for now
            console.log(`Would register component ${id} with real emulator`);
            onLogMessage?.(`Registered component ${id} with emulator`);
          } catch (error) {
            console.error(`Failed to register component ${id}:`, error);
          }
        });
      }
    }, [components, onLogMessage]);
    
    // Manage wires with the wire manager
    useEffect(() => {
      if (wireManagerRef.current) {
        // First, clear all existing wires
        wireManagerRef.current.clearAllWires();
        
        // Then, add each wire from props
        wires.forEach(wire => {
          try {
            // Convert path array if it exists
            const wirePath = wire.path || [];
            
            // Add the wire to the manager
            wireManagerRef.current?.addWire(
              wire.sourceComponentId,
              wire.sourcePin,
              wire.targetComponentId,
              wire.targetPin,
              wirePath
            );
            
            console.log(`Added wire ${wire.id} to wire manager`);
          } catch (error) {
            console.error(`Failed to add wire ${wire.id}:`, error);
          }
        });
        
        console.log(`Updated wire manager with ${wires.length} wires`);
      }
    }, [wires]);
    
    // Handle code compilation and loading
    useEffect(() => {
      const compileAndLoadCode = async () => {
        if (emulatorRef.current) {
          try {
            onLogMessage?.(`Compiling Arduino code...`);
            
            // Extract and display the setup and loop functions in logs to show activity
            if (code.includes('setup') && code.includes('loop')) {
              // Use simpler regex patterns without the s flag
              const setupPattern = 'void\\s+setup\\s*\\(\\s*\\)\\s*\\{([^}]*)\\}';
              const loopPattern = 'void\\s+loop\\s*\\(\\s*\\)\\s*\\{([^}]*)\\}';
              
              const setupMatch = new RegExp(setupPattern).exec(code);
              const loopMatch = new RegExp(loopPattern).exec(code);
              
              if (setupMatch && setupMatch[1]) {
                onLogMessage?.(`Setup function: void setup() { ${setupMatch[1].trim()} }`);
              }
              
              if (loopMatch && loopMatch[1]) {
                onLogMessage?.(`Loop function: void loop() { ${loopMatch[1].trim()} }`);
              }
            }
            
            // Load the program into our real emulator
            const result = await emulatorRef.current.loadCode(code);
            
            if (result.success) {
              console.log('Program loaded successfully');
              setCompilationSuccess(true);
              onLogMessage?.(`Program compiled and loaded successfully. Ready to run!`);
            } else {
              console.error('Failed to compile/load program:', result.error);
              setCompilationSuccess(false);
              onEmulationError?.(`Failed to compile or load program: ${result.error}`);
            }
          } catch (error) {
            console.error('Exception during code compilation:', error);
            setCompilationSuccess(false);
            onEmulationError?.(`Error compiling code: ${error}`);
          }
        }
      };
      
      // Compile and load the code
      compileAndLoadCode();
    }, [code, onLogMessage, onEmulationError]);
    
    // Handle starting and stopping the emulation
    useEffect(() => {
      if (!emulatorRef.current) return;
      
      // Reference to the status interval timer
      let statusInterval: any = null;
      
      if (isRunning) {
        if (!isActive) {
          // Start the emulation
          if (compilationSuccess) {
            try {
              emulatorRef.current.start();
              setIsActive(true);
              onLogMessage?.('⚡ Emulation started - Monitoring pin changes...');
              console.log('AVR8 Emulation started');
              
              // Start monitoring for pin changes and forcing UI updates
              // This ensures we see pin changes even if callbacks aren't firing properly
              statusInterval = setInterval(() => {
                try {
                  // Get current pin states from emulator
                  const pinStates = emulatorRef.current?.getPinStates() || {};
                  const timestamp = new Date().toLocaleTimeString();
                  
                  // Always log the LED state (pin 13)
                  const pin13State = !!pinStates['13']; 
                  const ledStatus = `[${timestamp}] 💡 LED status: ${pin13State ? 'ON' : 'OFF'}`;
                  onLogMessage?.(ledStatus);
                  
                  // Force pin change notification for LED
                  if (onPinStateChange) {
                    onPinStateChange('13', pin13State, { 
                      timestamp,
                      source: 'monitor_update' 
                    });
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
                const result = await emulatorRef.current?.loadCode(code);
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
                        onPinStateChange('13', pin13State, { 
                          timestamp,
                          source: 'monitor_update' 
                        });
                      }
                    } catch (err) {
                      console.error('Error in pin monitoring:', err);
                    }
                  }, 1500);
                  
                } else {
                  console.error('Failed to compile code:', result?.error);
                  onEmulationError?.(`Failed to compile code: ${result?.error}`);
                }
              } catch (error) {
                console.error('Error during compilation and start:', error);
                onEmulationError?.(`Error during compilation: ${error}`);
              }
            };
            
            compileAndStart();
          }
        }
      } else {
        if (isActive) {
          // Stop the emulation
          try {
            // Clear monitoring interval
            if (statusInterval) {
              clearInterval(statusInterval);
              statusInterval = null;
            }
            
            emulatorRef.current.stop();
            setIsActive(false);
            onLogMessage?.('🛑 Emulation stopped');
            console.log('AVR8 Emulation stopped');
          } catch (error) {
            console.error('Failed to stop emulation:', error);
            onEmulationError?.(`Failed to stop emulation: ${error}`);
          }
        }
      }
      
      // Cleanup when unmounting or when dependencies change
      return () => {
        if (statusInterval) {
          clearInterval(statusInterval);
        }
      };
    }, [isRunning, isActive, compilationSuccess, code, onLogMessage, onEmulationError, onPinStateChange]);
    
    // Render nothing - this is a connector component
    return null;
  }
);

export default RealAVR8EmulatorConnector;

// Extend the global Window interface to include our emulator
declare global {
  interface Window {
    realAVR8Emulator?: RealAVR8Emulator;
    emulatedComponents?: Record<string, EmulatedComponent>;
  }
}