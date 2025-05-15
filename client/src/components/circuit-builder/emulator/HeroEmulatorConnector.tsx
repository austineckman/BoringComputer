import React, { useEffect, useRef, useState } from 'react';
import { HeroEmulator, EmulatedComponent } from './HeroEmulator';
import { WireManager } from './WireManager';

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

/**
 * HeroEmulatorConnector Component
 * 
 * This component serves as the intermediary between the React UI and the HeroEmulator.
 * It handles all communication with the emulator and manages the lifecycle
 * of the emulation engine, ensuring proper initialization, loading, and cleanup.
 */
const HeroEmulatorConnector: React.FC<HeroEmulatorConnectorProps> = ({
  code,
  isRunning = false,
  onLogMessage,
  onSerialData,
  onEmulationError,
  onPinStateChange,
  components = {},
  wires = []
}) => {
  // Reference to the emulator instance
  const emulatorRef = useRef<HeroEmulator | null>(null);
  
  // Reference to the wire manager
  const wireManagerRef = useRef<WireManager | null>(null);
  
  // State to track whether emulation is active
  const [isActive, setIsActive] = useState(false);
  
  // State to track compilation status
  const [compilationSuccess, setCompilationSuccess] = useState(false);
  
  // Initialize the emulator on component mount
  useEffect(() => {
    // Create a new emulator instance if it doesn't exist
    if (!emulatorRef.current) {
      try {
        // Set up the pin change handler to propagate signals
        const handlePinChange = (pin: string, isHigh: boolean, options?: any) => {
          // Propagate the signal through the wire network
          if (wireManagerRef.current) {
            // Find the component that this pin belongs to
            const componentId = findComponentIdByPin(pin);
            if (componentId) {
              // Propagate the signal with voltage (5V for HIGH, 0V for LOW)
              const voltage = isHigh ? 5.0 : 0.0;
              wireManagerRef.current.propagateSignal(componentId, pin, voltage);
            }
          }
          
          // Call the pin state change callback
          if (onPinStateChange) {
            onPinStateChange(pin, isHigh);
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
  const findComponentIdByPin = (pinId: string): string | null => {
    // Check each component for this pin
    for (const [componentId, component] of Object.entries(components)) {
      // The logic here depends on how pins are stored in components
      // This is a simple example - adjust based on your component data structure
      if (component.type === 'led') {
        const ledComponent = component as any;
        if (ledComponent.anode === pinId || ledComponent.cathode === pinId) {
          return componentId;
        }
      } else if (component.type === 'button') {
        const buttonComponent = component as any;
        if (buttonComponent.pin === pinId || buttonComponent.groundPin === pinId) {
          return componentId;
        }
      } else if (component.type === 'oled') {
        const oledComponent = component as any;
        if (oledComponent.sclPin === pinId || oledComponent.sdaPin === pinId || 
            (oledComponent.resetPin && oledComponent.resetPin === pinId)) {
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
          // Import the compiler dynamically
          const { compileArduinoCode } = await import('./ArduinoCompiler');
          
          // Log compilation start
          console.log('Compiling code...');
          onLogMessage?.('Compiling Arduino code...');
          
          // Compile the code
          const result = await compileArduinoCode({
            code,
            board: 'heroboard',
            optimize: true
          });
          
          // Handle compilation result
          if (result.success && result.hex) {
            // Log success
            console.log('Compilation successful!');
            onLogMessage?.(`Compilation successful! Binary size: ${result.binarySize} bytes`);
            
            // Show warnings if any
            if (result.warnings && result.warnings.length > 0) {
              result.warnings.forEach(warning => {
                console.warn('Compilation warning:', warning);
                onLogMessage?.(`Warning: ${warning}`);
              });
            }
            
            // Load the compiled hex into the emulator
            if (emulatorRef.current.loadProgram(result.hex)) {
              setCompilationSuccess(true);
              console.log('Program loaded successfully into emulator');
              onLogMessage?.('Program loaded successfully into emulator');
            } else {
              setCompilationSuccess(false);
              console.error('Failed to load program into emulator');
              onEmulationError?.('Failed to load compiled program into emulator');
            }
          } else {
            // Handle compilation errors
            setCompilationSuccess(false);
            
            const errorMessages = result.errors?.join('\n') || 'Unknown compilation error';
            console.error('Compilation failed:', errorMessages);
            onEmulationError?.(`Compilation failed: ${errorMessages}`);
          }
        } catch (error) {
          // Handle unexpected errors
          setCompilationSuccess(false);
          console.error('Error during compilation process:', error);
          onEmulationError?.(`Error during compilation process: ${error}`);
        }
      }
    };
    
    // Run the async compilation function
    compileAndLoadCode();
  }, [code]);
  
  // Handle starting/stopping the emulation based on props
  useEffect(() => {
    if (emulatorRef.current && compilationSuccess) {
      if (isRunning && !isActive) {
        // Start the emulation
        try {
          emulatorRef.current.start();
          setIsActive(true);
          console.log('Emulation started');
          onLogMessage?.('Emulation started');
        } catch (error) {
          console.error('Error starting emulation:', error);
          onEmulationError?.(`Error starting emulation: ${error}`);
        }
      } else if (!isRunning && isActive) {
        // Stop the emulation
        try {
          emulatorRef.current.stop();
          setIsActive(false);
          console.log('Emulation stopped');
          onLogMessage?.('Emulation stopped');
        } catch (error) {
          console.error('Error stopping emulation:', error);
          onEmulationError?.(`Error stopping emulation: ${error}`);
        }
      }
    }
  }, [isRunning, compilationSuccess]);
  
  // This component doesn't render anything visible
  return null;
};

export default HeroEmulatorConnector;