import React, { useEffect, useRef, useState } from 'react';
import { HeroEmulator, EmulatedComponent } from './HeroEmulator';

interface HeroEmulatorConnectorProps {
  code: string;
  isRunning?: boolean;
  onLogMessage?: (message: string) => void;
  onSerialData?: (value: number, char: string) => void;
  onEmulationError?: (error: string) => void;
  components?: Record<string, EmulatedComponent>;
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
  components = {}
}) => {
  // Reference to the emulator instance
  const emulatorRef = useRef<HeroEmulator | null>(null);
  
  // State to track whether emulation is active
  const [isActive, setIsActive] = useState(false);
  
  // State to track compilation status
  const [compilationSuccess, setCompilationSuccess] = useState(false);
  
  // Initialize the emulator on component mount
  useEffect(() => {
    // Create a new emulator instance if it doesn't exist
    if (!emulatorRef.current) {
      try {
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
          }
        });
        
        console.log('HeroEmulator initialized successfully');
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
          console.log('HeroEmulator cleaned up');
        } catch (error) {
          console.error('Error cleaning up emulator:', error);
        }
      }
    };
  }, []);
  
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