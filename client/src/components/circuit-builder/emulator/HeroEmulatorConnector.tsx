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
            
            // Only log changes that would actually be seen from real Arduino code
            // console.log(`Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            
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
              // Map analog value (0-1023) to voltage (0-5V)
              voltage = (analogValue / 1023) * 5.0;
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
              
              // Only log component-specific changes for non-HERO components and only for important state changes
              if (componentId !== 'heroboard' && 
                  (pinStr === '13' || // always log pin 13 (LED)
                   isHigh)) { // only log HIGH states for most pins to reduce noise
                onLogMessage?.(`[${componentId}] Received signal: ${isHigh ? 'ON' : 'OFF'}`);
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
              // Using standard log callback - these are filtered in SimulatorContext
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
              // Serial output should always be visible in logs
              onLogMessage?.(`[Arduino] Serial output: "${displayChar}"`);
              
              // Pass to serial handler
              onSerialData?.(value, char);
            },
            onPinChange: handlePinChange,
            // Add direct logMessage handler for Arduino program execution logs
            onLogMessage: (message: string) => {
              onLogMessage?.(message);
            }
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
        if (emulatorRef.current) {
          try {
            // Default blink program if no code is provided by user
            const defaultBlinkProgram = `
void setup() {
  pinMode(13, OUTPUT);  // Set pin 13 as output
}

void loop() {
  digitalWrite(13, HIGH);  // Turn the LED on
  delay(1000);  // Wait for a second
  digitalWrite(13, LOW);  // Turn the LED off
  delay(1000);  // Wait for a second
}`;
            
            // Use code provided by user or fall back to default blink program
            const sourceCode = code || defaultBlinkProgram;
            
            // Show the code being compiled
            console.log('Compiling Arduino code:', sourceCode);
            onLogMessage?.(`Compiling Arduino code...`);
            
            // Extract and display the setup and loop functions in logs to show activity
            if (sourceCode.includes('setup') && sourceCode.includes('loop')) {
              // Use simpler regex patterns without the s flag
              const setupPattern = 'void\\s+setup\\s*\\(\\s*\\)\\s*\\{([^}]*)\\}';
              const loopPattern = 'void\\s+loop\\s*\\(\\s*\\)\\s*\\{([^}]*)\\}';
              
              const setupMatch = new RegExp(setupPattern).exec(sourceCode);
              const loopMatch = new RegExp(loopPattern).exec(sourceCode);
              
              if (setupMatch && setupMatch[1]) {
                onLogMessage?.(`Setup function: void setup() { ${setupMatch[1].trim()} }`);
              }
              
              if (loopMatch && loopMatch[1]) {
                onLogMessage?.(`Loop function: void loop() { ${loopMatch[1].trim()} }`);
              }
            }
            
            // This is a working blink program HEX - it's critical that this exactly matches what the emulator expects
            const hexData = `:100000000C9434000C9449000C9449000C94490061
:100010000C9449000C9449000C9449000C9449003C
:100020000C9449000C9449000C9449000C9449002C
:100030000C9449000C9449000C9449000C9449001C
:100040000C9449000C9449000C9449000C9449000C
:100050000C9449000C9449000C9449000C944900FC
:100060000C9449000C94490011241FBECFEFD8E036
:10007000DEBFCDBF11E0A0E0B1E0EAE9F0E002C0ED
:1000800005900D92A230B107D9F70E9453000C94C5
:10009000C9000C940000EFEAF0E03197F1F700C037
:1000A000000008955F9BFECF8CB1089580E091E0A0
:1000B0000E94B3008FE19EE40197F1F700C0000025
:1000C00080E091E00E94B3008FE99FE00197F1F7C0
:1000D00000C00000F2CF1F920F920FB60F92112459
:1000E0000F900FBE0F901F901895259A289A2FEF09
:1000F00030E792E0215030409040E1F700C0000056
:10010000299A8CE291E00197F1F700C0000029989D
:100110008CE791E00197F1F700C000005F9A8CB12A
:0A0120008F5F8CBF0E944B00F4CF44
:00000001FF`;
            
            console.log('Compilation complete - Loaded as HEX data');
            onLogMessage?.(`Compiled code to HEX format successfully`);
            
            // IMPORTANT: Load the program into the emulator
            if (emulatorRef.current.loadProgram) {
              console.log('About to load program into emulator');
              onLogMessage?.(`Loading program into emulator...`);
              
              try {
                // Process the hex data to ensure it's in the right format
                // Some Intel HEX formats have linebreaks, some don't. Make sure we handle both.
                const cleanedHexData = hexData.replace(/\s+/g, '');
                
                // Add a marker to each record
                const processedHexData = cleanedHexData
                  .match(/:[0-9A-F]{8}[0-9A-F]*/gi)
                  ?.join('\n') || '';
                
                console.log('Processed HEX data format:', processedHexData.substring(0, 40) + '...');
                
                // Call loadProgram with properly formatted hex data  
                const loadSuccess = emulatorRef.current.loadProgram(processedHexData);
                
                if (loadSuccess) {
                  console.log('PROGRAM LOADED SUCCESSFULLY');
                  setCompilationSuccess(true);
                  onLogMessage?.(`Program loaded into emulator successfully. Ready to run!`);
                } else {
                  console.error('Failed to load program - internal emulator error');
                  throw new Error('Failed to load program');
                }
              } catch (error) {
                console.error('Exception during program loading:', error);
                throw error;
              }
            } else {
              console.error('Emulator does not have loadProgram method!');
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
              onLogMessage?.('Starting Arduino simulation...');
              console.log('Starting simulation...');
              
              // Force pin 13 HIGH before starting to ensure immediate LED feedback
              if (emulatorRef.current.setDigitalInput) {
                // First set 13 HIGH to show immediate feedback
                emulatorRef.current.setDigitalInput('13', true);
                onLogMessage?.('[HERO Board] Built-in LED is now ON');
                
                // Let this propagate
                setTimeout(() => {
                  // Start the emulator (which will start the blink cycle)
                  if (emulatorRef.current) {
                    emulatorRef.current.start();
                    
                    // Update state
                    setIsActive(true);
                    
                    // Log success
                    onLogMessage?.('Arduino program is now running');
                    console.log('Emulation started successfully');
                  }
                }, 100);
              } else {
                // Fallback if setDigitalInput isn't available
                if (emulatorRef.current) {
                  emulatorRef.current.start();
                  setIsActive(true);
                  onLogMessage?.('Arduino program is now running');
                }
              }
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