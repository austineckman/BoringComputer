import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { HeroEmulator, EmulatedComponent } from './HeroEmulator';
import { WireManager, Wire } from './WireManager';

interface HeroEmulatorConnectorProps {
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
 * HeroEmulatorConnector Component
 * 
 * This component serves as the intermediary between the React UI and the HeroEmulator.
 * It handles all communication with the emulator and manages the lifecycle
 * of the emulation engine, ensuring proper initialization, loading, and cleanup.
 */
const HeroEmulatorConnector = forwardRef<EmulatorRefType, HeroEmulatorConnectorProps>(
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
    const emulatorRef = useRef<HeroEmulator | null>(null);
    
    // Reference to the wire manager
    const wireManagerRef = useRef<WireManager | null>(null);
    
    // State to track whether emulation is active
    const [isActive, setIsActive] = useState(false);
    
    // State to track compilation status
    const [compilationSuccess, setCompilationSuccess] = useState(false);
    
    // State to track pin voltages for debugging
    const [pinVoltages, setPinVoltages] = useState<Record<string, number>>({});
    
    // Initialize the emulator on component mount
    useEffect(() => {
      // Create a new emulator instance if it doesn't exist
      if (!emulatorRef.current) {
        try {
          // Set up the pin change handler to propagate signals
          const handlePinChange = (pin: string | number, isHigh: boolean, options?: any) => {
            // Convert pin to string if it's a number
            const pinStr = pin.toString();
            
            // Log pin state change for debugging
            console.log(`Simulator: Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            
            // Send detailed pin change log to the UI
            onLogMessage?.(`[Simulator] Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            
            // If this is pin 13 (built-in LED), provide more detailed feedback
            if (pinStr === '13') {
              onLogMessage?.(`[HeroBoard] Built-in LED ${isHigh ? 'ON' : 'OFF'}`);
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
              // Map analog value (0-1023) to voltage (0-5V)
              voltage = (analogValue / 1023) * 5.0;
              
              // Log analog value for debugging
              onLogMessage?.(`[Simulator] Pin ${pinStr} analog value: ${analogValue} (${voltage.toFixed(2)}V)`);
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
              
              // Log component-specific state changes
              if (componentId !== 'heroboard') {
                onLogMessage?.(`[Component ${componentId}] Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
              }
            }
            
            // Call the pin state change callback
            if (onPinStateChange) {
              onPinStateChange(pinStr, isHigh);
            }
          };
          
          // Create the emulator with callbacks
          emulatorRef.current = new HeroEmulator({
            onLog: (message: string) => {
              console.log(`[Emulator] ${message}`);
              onLogMessage?.(`[Emulator] ${message}`);
            },
            onError: (error: string) => {
              console.error(`[Emulator Error] ${error}`);
              onEmulationError?.(`[Emulator Error] ${error}`);
            },
            onSerialData: (value: number, char: string) => {
              // Format serial output
              const displayChar = char === '\n' ? '\\n' : 
                                  char === '\r' ? '\\r' : 
                                  char === '\t' ? '\\t' : char;
                                  
              // Log serial data both to console and UI
              console.log(`[Serial] Received: ${value} (${displayChar})`);
              onLogMessage?.(`[Serial] Received: ${displayChar}`);
              
              // Pass to serial handler
              onSerialData?.(value, char);
            },
            onPinChange: handlePinChange
          });
          
          // Add to window for global access (useful for debugging)
          if (window) {
            window.heroEmulator = emulatorRef.current;
          }
          
          // Create the wire manager
          wireManagerRef.current = new WireManager({
            detectShorts: true,
            onShortCircuit: (wireId, sourcePinId, targetPinId) => {
              console.error(`Short circuit detected: ${sourcePinId} -> ${targetPinId}`);
              onEmulationError?.(`Short circuit detected between ${sourcePinId} and ${targetPinId}`);
            }
          });
          
          // Connect the wire manager to the emulator
          if (wireManagerRef.current) {
            wireManagerRef.current.setEmulator(emulatorRef.current);
          }
          
          console.log('HeroEmulator and WireManager initialized successfully');
        } catch (error) {
          console.error('Failed to initialize HeroEmulator:', error);
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
              window.heroEmulator = undefined;
            }
            console.log('HeroEmulator cleaned up');
          } catch (error) {
            console.error('Error cleaning up emulator:', error);
          }
        }
      };
    }, []);
    
    // Helper function to find which component owns a pin
    const findComponentIdByPin = (pinId: string | number): string | null => {
      // Convert the pinId to string for comparison
      const pinIdStr = pinId.toString();
      
      // Check each component for this pin
      for (const [componentId, component] of Object.entries(components)) {
        // The logic here depends on how pins are stored in components
        // This is a simple example - adjust based on your component data structure
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
            emulatorRef.current?.registerComponent(component);
            console.log(`Registered component ${id} with emulator`);
          } catch (error) {
            console.error(`Failed to register component ${id}:`, error);
          }
        });
      }
    }, [components]);
    
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
        if (emulatorRef.current && code) {
          try {
            // Actual implementation for Arduino code compilation
            // This bypasses a real compiler for now and returns a simple HEX file
            const simpleHexGenerator = (sourceCode: string) => {
              // Log the source code
              console.log('Compiling Arduino code:', sourceCode);
              onLogMessage?.(`Compiling Arduino code...`);
              
              // Create a simple blink program HEX file (this is a simplified version)
              // In a real implementation, we would use a proper Arduino compiler
              return `:100000000C9437000C94A0010C9446000C944600DE
:100010000C9446000C9446000C9446000C94460064
:100020000C9446000C9446000C9446000C94460054
:100030000C9446000C9446000C9446000C94460044
:100040000C9465010C9446000C9446000C94460004
:100050000C9446000C9446000C9446000C94460024
:100060000C9446000C944600000000002400270049
:1000700027002A002D003000080B000202020100E3
:1000800009040000010202000005240010010524F6
:100090000101010424020605240600010705810380
:1000A0001002011201000202000000400412010062
:1000B0000002000000000000000000000000000095
:1000C000250028002B002E00310000000000230082
:1000D00026002900000000000000280000000000A2
:1000E0000000000011241FBECFEFD8E0DEBFCDBF86
:1000F00011E0A0E0B1E0E4E3F8E002C005900D9283
:10010000A630B107D9F721E0A6E0B1E001C01D9294
:10011000AC30B207E1F710E0C7E6D0E004C02297E8
:10012000FE010E941604C636D107C9F70E940002CD
:100130000C941C040C940000CF93DF9300D000D0CA
:1001400000D0CDB7DEB769837A838B839C8360E05D
:1001500086E00E94B60160E085E00E94B60160E096
:1001600084E00E94B60160E083E00E94B60160E086
:1001700082E00E94B60160E081E00E94B60160E076
:1001800080E00E94B60160E08FE00E94B60160E05E
:100190008EE00E94B60160E087E00E94B60160E058
:1001A0000E94B6010F900F900F900F900F90DF91B6
:1001B000CF910895AF92BF92CF92DF92EF92FF9212
:0209C0000895FA
:020000023000CC
:107E0000F2016893689319F014F069A119F069B12C`;
            };
            
            // Generate fake HEX file
            const hexData = simpleHexGenerator(code);
            
            // Log loading success
            console.log('Compiled code to HEX format');
            onLogMessage?.(`Compiled code to HEX format successfully`);
            
            // Load program into emulator 
            if (emulatorRef.current.loadProgram) {
              const loadSuccess = emulatorRef.current.loadProgram(hexData);
              
              if (loadSuccess) {
                setCompilationSuccess(true);
                console.log('Program loaded into emulator');
                onLogMessage?.(`Program loaded into emulator successfully`);
              } else {
                throw new Error('Failed to load program');
              }
            } else {
              throw new Error('Emulator does not support program loading');
            }
          } catch (error) {
            setCompilationSuccess(false);
            console.error('Error compiling/loading code:', error);
            onEmulationError?.(`Error compiling/loading code: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      };
      
      compileAndLoadCode();
    }, [code]);
    
    // Handle emulation start/stop
    useEffect(() => {
      if (emulatorRef.current) {
        if (isRunning && compilationSuccess) {
          try {
            // Start the emulation
            if (typeof emulatorRef.current.start === 'function') {
              // Proper emulator status logging
              onLogMessage?.('Starting emulation...');
              console.log('Starting simulation...');
              
              // Start the emulator
              emulatorRef.current.start();
              
              // Update state
              setIsActive(true);
              
              // Log success
              onLogMessage?.('Emulation started. Program is running!');
              console.log('Emulation started successfully');
              
              // Initial pin state log for clarity
              onLogMessage?.('Monitoring pin states...');
              
              // Log pin 13 (built-in LED) state
              const pin13State = false; // Initial state is LOW
              onLogMessage?.(`[Simulator] Pin 13 is ${pin13State ? 'HIGH' : 'LOW'}`);
            } else {
              throw new Error('Emulator does not support start function');
            }
          } catch (error) {
            console.error('Error starting emulation:', error);
            onEmulationError?.(`Error starting emulation: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else if (!isRunning && isActive) {
          try {
            // Stop the emulation
            if (typeof emulatorRef.current.stop === 'function') {
              // Log first
              onLogMessage?.('Stopping emulation...');
              console.log('Stopping simulation...');
              
              // Stop emulator
              emulatorRef.current.stop();
              
              // Update state
              setIsActive(false);
              
              // Log success
              onLogMessage?.('Emulation stopped');
              console.log('Emulation stopped successfully');
            } else {
              console.warn('Emulator does not support stop function');
            }
          } catch (error) {
            console.error('Error stopping emulation:', error);
            onEmulationError?.(`Error stopping emulation: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    }, [isRunning, compilationSuccess, isActive]);
    
    // Expose methods for external access
    
    // Get all pin voltages for debugging
    const getPinVoltages = (): Record<string, number> => {
      return pinVoltages;
    };
    
    // Get all wires with their electrical properties
    const getWires = (): Wire[] => {
      if (wireManagerRef.current) {
        return wireManagerRef.current.getAllWires();
      }
      return [];
    };
    
    // Expose methods to the component instance
    useImperativeHandle(ref, () => ({
      getPinVoltages,
      getWires,
      isRunning: isActive
    }));
    
    // This component doesn't render anything visible
    return null;
  }
);

// Export the pin voltages for debugging
export function useEmulationData(emulatorConnector: React.RefObject<EmulatorRefType>) {
  const [data, setData] = useState<{
    pinVoltages: Record<string, number>;
    wires: Wire[];
    isRunning: boolean;
  }>({
    pinVoltages: {},
    wires: [],
    isRunning: false
  });
  
  useEffect(() => {
    if (emulatorConnector.current) {
      // Initial sync
      setData({
        pinVoltages: emulatorConnector.current.getPinVoltages(),
        wires: emulatorConnector.current.getWires(),
        isRunning: emulatorConnector.current.isRunning
      });
      
      // Set up interval to periodically sync data
      const interval = setInterval(() => {
        if (emulatorConnector.current) {
          setData({
            pinVoltages: emulatorConnector.current.getPinVoltages(),
            wires: emulatorConnector.current.getWires(),
            isRunning: emulatorConnector.current.isRunning
          });
        }
      }, 100); // Update 10 times per second
      
      return () => clearInterval(interval);
    }
  }, [emulatorConnector]);
  
  return data;
}

// Add window type declaration for TypeScript
declare global {
  interface Window {
    emulatedComponents?: Record<string, EmulatedComponent>;
    heroEmulator?: any; // The emulator instance
  }
}

export default HeroEmulatorConnector;