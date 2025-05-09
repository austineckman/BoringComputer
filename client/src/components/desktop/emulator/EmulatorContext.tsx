import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// Types for pin states and components
export interface PinState {
  isHigh: boolean;
  value: number; // Analog value (0-255 for PWM, 0-1023 for analog input)
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | 'ANALOG';
}

export interface EmulatorComponent {
  id: string;
  type: string;
  pins: Record<string, string>; // Pin connections (component pin -> board pin)
  state: Record<string, any>; // Component-specific state
}

// Interface for the emulator context
interface EmulatorContextProps {
  // Emulator state
  code: string;
  setCode: (code: string) => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  
  // Pins and components
  pinStates: Record<string | number, PinState>;
  components: Record<string, EmulatorComponent>;
  
  // Actions
  compileAndRun: () => Promise<boolean>;
  stopSimulation: () => void;
  
  // Pin operations
  setPinMode: (pin: string | number, mode: PinState['mode']) => void;
  setPinState: (pin: string | number, isHigh: boolean, value?: number) => void;
  getPinState: (pin: string | number) => PinState | undefined;
  
  // Component operations
  addComponent: (component: EmulatorComponent) => void;
  removeComponent: (id: string) => void;
  connectComponentPin: (componentId: string, componentPin: string, boardPin: string | number) => void;
  
  // Serial monitor
  serialData: string[];
  clearSerialData: () => void;
  
  // Logs
  logs: string[];
  addLog: (log: string) => void;
  clearLogs: () => void;
  
  // Loading/error states
  isCompiling: boolean;
  error: string | null;
}

// Create the context with default values
const EmulatorContext = createContext<EmulatorContextProps>({
  code: '',
  setCode: () => {},
  isRunning: false,
  setIsRunning: () => {},
  
  pinStates: {},
  components: {},
  
  compileAndRun: async () => false,
  stopSimulation: () => {},
  
  setPinMode: () => {},
  setPinState: () => {},
  getPinState: () => undefined,
  
  addComponent: () => {},
  removeComponent: () => {},
  connectComponentPin: () => {},
  
  serialData: [],
  clearSerialData: () => {},
  
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
  
  isCompiling: false,
  error: null
});

// Web Worker reference type
type EmulatorWorker = Worker & {
  postMessage: (message: any) => void;
};

/**
 * Emulator Provider Component
 * 
 * This creates an isolated emulator instance with its own state and Web Worker.
 * Each instance is completely independent of others.
 */
export function EmulatorProvider({ 
  children, 
  instanceId 
}: { 
  children: React.ReactNode, 
  instanceId: string 
}) {
  // State for the code editor
  const [code, setCode] = useState<string>(
    `// Arduino Emulator - Universal Emulator
// Built with real AVR8 emulation

void setup() {
  // Initialize digital pin LED_BUILTIN (pin 13) as an output
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Basic blink example
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
`);
  
  // Emulator state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pin and component state
  const [pinStates, setPinStates] = useState<Record<string | number, PinState>>({});
  const [components, setComponents] = useState<Record<string, EmulatorComponent>>({});
  
  // Serial monitor and logs
  const [serialData, setSerialData] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Web Worker reference - critical for isolated execution
  const workerRef = useRef<EmulatorWorker | null>(null);
  
  // Initialize pin states for Arduino pins
  useEffect(() => {
    const initialPinStates: Record<string | number, PinState> = {};
    
    // Digital pins (0-13)
    for (let i = 0; i <= 13; i++) {
      initialPinStates[i] = {
        isHigh: false,
        value: 0,
        mode: 'INPUT'
      };
    }
    
    // Analog pins (A0-A5)
    for (let i = 0; i <= 5; i++) {
      initialPinStates[`A${i}`] = {
        isHigh: false,
        value: 0,
        mode: 'ANALOG'
      };
    }
    
    setPinStates(initialPinStates);
  }, []);
  
  // Initialize the Web Worker for emulation
  useEffect(() => {
    // Create a new worker for this emulator instance
    // This will be implemented in a separate file
    const worker = new Worker(
      new URL('./AVR8Worker.ts', import.meta.url), 
      { type: 'module' }
    );
    
    workerRef.current = worker as EmulatorWorker;
    
    // Handle messages from the worker
    worker.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'pinChange':
          // Update pin state when the emulator changes a pin
          const { pin, isHigh, value } = data;
          setPinStates(prevStates => ({
            ...prevStates,
            [pin]: {
              ...prevStates[pin],
              isHigh,
              value: value !== undefined ? value : (isHigh ? 255 : 0)
            }
          }));
          
          addLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}${
            value !== undefined ? ` (value: ${value})` : ''
          }`);
          break;
          
        case 'serialData':
          // Append serial data from the emulator
          setSerialData(prev => [...prev, data.data]);
          break;
          
        case 'log':
          // Log messages from the emulator
          addLog(data.message);
          break;
          
        case 'error':
          // Handle emulator errors
          setError(data.message);
          break;
          
        case 'compilationComplete':
          // Compilation has finished
          setIsCompiling(false);
          if (data.success) {
            // Start the program if compilation was successful
            addLog('Compilation successful');
            setError(null);
          } else {
            // Show compilation error
            setError(data.error || 'Compilation failed');
            addLog(`Compilation failed: ${data.error}`);
          }
          break;
      }
    };
    
    // Cleanup when the component unmounts
    return () => {
      // Stop the emulator and terminate the worker
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' });
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [instanceId]); // Re-initialize only if the instance ID changes
  
  // Add a log message
  const addLog = (log: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };
  
  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Clear serial monitor data
  const clearSerialData = () => {
    setSerialData([]);
  };
  
  // Set the mode of a pin
  const setPinMode = (pin: string | number, mode: PinState['mode']) => {
    setPinStates(prevStates => ({
      ...prevStates,
      [pin]: {
        ...prevStates[pin],
        mode
      }
    }));
    
    // Also notify the emulator worker about the pin mode change
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'setPinMode',
        data: { pin, mode }
      });
    }
  };
  
  // Set the state of a pin
  const setPinState = (pin: string | number, isHigh: boolean, value?: number) => {
    setPinStates(prevStates => ({
      ...prevStates,
      [pin]: {
        ...prevStates[pin],
        isHigh,
        value: value !== undefined ? value : (isHigh ? 255 : 0)
      }
    }));
    
    // Also notify the emulator worker about the pin state change
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'setPinState',
        data: { pin, isHigh, value }
      });
    }
  };
  
  // Get the state of a pin
  const getPinState = (pin: string | number) => {
    return pinStates[pin];
  };
  
  // Add a new component
  const addComponent = (component: EmulatorComponent) => {
    setComponents(prev => ({
      ...prev,
      [component.id]: component
    }));
  };
  
  // Remove a component
  const removeComponent = (id: string) => {
    setComponents(prev => {
      const newComponents = { ...prev };
      delete newComponents[id];
      return newComponents;
    });
  };
  
  // Connect a component pin to a board pin
  const connectComponentPin = (
    componentId: string, 
    componentPin: string, 
    boardPin: string | number
  ) => {
    setComponents(prev => {
      const component = prev[componentId];
      if (!component) return prev;
      
      return {
        ...prev,
        [componentId]: {
          ...component,
          pins: {
            ...component.pins,
            [componentPin]: boardPin.toString()
          }
        }
      };
    });
  };
  
  // Compile and run the code
  const compileAndRun = async (): Promise<boolean> => {
    if (!workerRef.current) return false;
    
    setIsCompiling(true);
    setError(null);
    
    // Send the code to the worker for compilation
    workerRef.current.postMessage({
      type: 'compile',
      data: { code }
    });
    
    // Set running state
    setIsRunning(true);
    
    // This is a placeholder - actual compilation status will be returned
    // by the worker in the compilationComplete message
    return true;
  };
  
  // Stop the simulation
  const stopSimulation = () => {
    if (!workerRef.current) return;
    
    // Tell the worker to stop the emulation
    workerRef.current.postMessage({ type: 'stop' });
    
    // Update running state
    setIsRunning(false);
    
    // Add log message
    addLog('Simulation stopped');
  };
  
  // Context value
  const contextValue: EmulatorContextProps = {
    code,
    setCode,
    isRunning,
    setIsRunning,
    
    pinStates,
    components,
    
    compileAndRun,
    stopSimulation,
    
    setPinMode,
    setPinState,
    getPinState,
    
    addComponent,
    removeComponent,
    connectComponentPin,
    
    serialData,
    clearSerialData,
    
    logs,
    addLog,
    clearLogs,
    
    isCompiling,
    error
  };
  
  return (
    <EmulatorContext.Provider value={contextValue}>
      {children}
    </EmulatorContext.Provider>
  );
}

// Custom hook to use the emulator context
export function useEmulator() {
  return useContext(EmulatorContext);
}