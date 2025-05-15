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
            
            // Find the component that this pin belongs to
            const componentId = findComponentIdByPin(pinStr);
            
            // Calculate voltage (5V for HIGH, 0V for LOW)
            // For analog pins, use the analog value if provided
            let voltage = isHigh ? 5.0 : 0.0;
            if (options && options.analogValue !== undefined) {
              // Map analog value (0-1023) to voltage (0-5V)
              voltage = (options.analogValue / 1023) * 5.0;
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
            // In a real implementation, this would call the actual compiler
            // For now, we'll simulate compilation
            const isValid = true; // Placeholder for actual validation
            
            if (isValid) {
              // Inject the code into the emulator
              if ('loadProgram' in emulatorRef.current) {
                await (emulatorRef.current as any).loadProgram(code);
                setCompilationSuccess(true);
                console.log('Code compiled and loaded successfully');
              } else {
                // Fallback method
                emulatorRef.current.load?.(code);
                setCompilationSuccess(true);
                console.log('Code loaded successfully');
              }
            } else {
              setCompilationSuccess(false);
              console.error('Compilation failed: Invalid code');
              onEmulationError?.(`Compilation failed: Invalid code`);
            }
          } catch (error) {
            setCompilationSuccess(false);
            console.error('Error compiling code:', error);
            onEmulationError?.(`Error compiling code: ${error}`);
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
            emulatorRef.current.start();
            setIsActive(true);
            console.log('Emulation started');
          } catch (error) {
            console.error('Error starting emulation:', error);
            onEmulationError?.(`Error starting emulation: ${error}`);
          }
        } else {
          try {
            // Stop the emulation
            emulatorRef.current.stop();
            setIsActive(false);
            console.log('Emulation stopped');
          } catch (error) {
            console.error('Error stopping emulation:', error);
          }
        }
      }
    }, [isRunning, compilationSuccess]);
    
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