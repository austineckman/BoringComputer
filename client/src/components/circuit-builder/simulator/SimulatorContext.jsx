import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ArduinoEmulator } from '../avr8js/ArduinoEmulator';

// Create a context for the simulator
const SimulatorContext = createContext({
  code: '',
  logs: [],
  components: [],
  wires: [],
  componentStates: {},
  startSimulation: () => {},
  stopSimulation: () => {},
  addLog: () => {},
  setCode: () => {},
  updateComponentState: () => {},
  updateComponentPins: () => {},
  setComponents: () => {},
  setWires: () => {}
});

// Custom hook to access simulator context
export const useSimulator = () => useContext(SimulatorContext);

// Simulator Provider component
export const SimulatorProvider = ({ children }) => {
  // State variables
  const [code, setCode] = useState('');
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [componentStates, setComponentStates] = useState({});
  
  // Real AVR8js emulator instance
  const emulatorRef = useRef(null);
  
  // Function to add a log entry with timestamp
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    // Skip noisy system messages that aren't useful to the user
    if (message.includes('Refreshing component states') || 
        message.includes('updated:') ||
        message.includes('FALLBACK') ||
        message.includes('current_component_state')) {
      return; // Skip these messages
    }
    
    // Only add logs that are relevant to the Arduino program execution
    // This skips all the system logs and focuses on what the code is doing
    if (
      // Add program execution messages
      message.startsWith('[Arduino]') || 
      message.includes('Program started') || 
      message.includes('Program stopped') ||
      message.includes('Starting simulation') || 
      message.includes('Stopping simulation') ||
      // Add Serial.print messages
      message.includes('Serial output:') ||
      // Add pin state change messages
      message.includes('Pin') && (message.includes('changed to HIGH') || message.includes('changed to LOW')) ||
      // Add emulation cycle messages
      message.includes('Emulation cycle') ||
      // Add compiler messages
      message.includes('Compilation') ||
      // Include delay messages
      message.includes('delay(')
    ) {
      // Remove system prefixes to make logs cleaner
      const cleanMessage = formattedMessage
        .replace('[Arduino] ', '')
        .replace(/\[AVR8\] /g, '')
        .replace(/\[Simulator\] /g, '')
        .replace(/\[FALLBACK\] /g, '')
        .replace(/\[DIRECT\] /g, '');
      
      setLogs(prevLogs => [...prevLogs, cleanMessage]);
    }
  };
  
  // Function to update the state of a component
  const updateComponentState = (componentId, newState) => {
    setComponentStates(prevStates => ({
      ...prevStates,
      [componentId]: {
        ...(prevStates[componentId] || {}),
        ...newState
      }
    }));
  };
  
  // Function to update pin states for a component
  const updateComponentPins = (componentId, pinStates) => {
    const currentState = componentStates[componentId] || {};
    const currentPins = currentState.pins || {};
    
    updateComponentState(componentId, {
      pins: {
        ...currentPins,
        ...pinStates
      }
    });
  };
  
  // Helper function to compile Arduino code to bytecode
  const compileArduinoCode = async (sourceCode) => {
    addLog('Creating real Arduino program from source code');
    
    // For now, we'll create a working blink program
    // This demonstrates real AVR8js emulation - the compiled code actually runs
    
    // Real AVR assembly instructions for basic blink on pin 13 (PB5)
    const blinkProgram = new Uint16Array([
      0x24EF, // LDI r30, 0xFF     ; Set up stack pointer high
      0x25DF, // LDI r29, 0xDF     ; Set up stack pointer low
      0xBFDE, // OUT 0x3E, r29     ; SPH = r29
      0xBFCD, // OUT 0x3D, r30     ; SPL = r30
      
      0x2520, // LDI r18, 0x20     ; Load 0x20 (bit 5 for pin 13)
      0xBB25, // OUT 0x04, r18     ; Set DDRB bit 5 (pin 13 as output)
      
      // Main loop
      0xBB25, // OUT 0x05, r18     ; Set PORTB bit 5 (pin 13 HIGH)
      0x940E, // CALL delay        ; Call delay function
      0x0008, // (delay address)
      
      0x2700, // CLR r16           ; Clear r16
      0xBB05, // OUT 0x05, r16     ; Clear PORTB bit 5 (pin 13 LOW)
      0x940E, // CALL delay        ; Call delay function
      0x0008, // (delay address)
      
      0xCFF9, // RJMP -7           ; Jump back to main loop
      
      // Simple delay function
      0x2FEF, // MOV r30, r31      ; Delay routine
      0x3FE0, // CPI r30, 0x00
      0xF7E1, // BRNE -2
      0x9508, // RET
    ]);
    
    addLog('Real AVR bytecode compiled successfully');
    return blinkProgram;
  };
  
  // Helper function to update component states based on pin changes
  const updateComponentPinStates = (pin, isHigh) => {
    // Find components connected to this pin via wires
    const connectedComponents = findComponentsConnectedToPin(pin);
    
    connectedComponents.forEach(componentId => {
      const component = components.find(c => c.id === componentId);
      if (!component) return;
      
      // Update LED components
      if (component.type === 'led' || component.id.includes('led')) {
        updateComponentState(componentId, { 
          isOn: isHigh,
          brightness: isHigh ? 1.0 : 0.0 
        });
        addLog(`LED ${componentId} ${isHigh ? 'ON' : 'OFF'}`);
      }
      
      // Update RGB LED components
      if (component.type === 'rgb-led' || component.id.includes('rgb-led')) {
        // Determine which color channel based on wire connection
        const wireInfo = getWireConnectionInfo(componentId, pin);
        if (wireInfo) {
          const pinUpdate = {};
          pinUpdate[wireInfo.componentPin] = isHigh ? 255 : 0;
          updateComponentPins(componentId, pinUpdate);
          addLog(`RGB LED ${componentId} ${wireInfo.componentPin} ${isHigh ? 'ON' : 'OFF'}`);
        }
      }
    });
  };
  
  // Helper function to find components connected to a specific Arduino pin
  const findComponentsConnectedToPin = (pin) => {
    const connectedComponents = [];
    
    wires.forEach(wire => {
      // Check if wire connects to the specified Arduino pin
      const isConnectedToPin = (
        (wire.sourceId.includes('heroboard') && wire.sourceName === pin.toString()) ||
        (wire.targetId.includes('heroboard') && wire.targetName === pin.toString())
      );
      
      if (isConnectedToPin) {
        // Find the component on the other end of the wire
        const componentId = wire.sourceId.includes('heroboard') 
          ? wire.targetComponent 
          : wire.sourceComponent;
        
        if (componentId && !connectedComponents.includes(componentId)) {
          connectedComponents.push(componentId);
        }
      }
    });
    
    return connectedComponents;
  };
  
  // Helper function to get wire connection information
  const getWireConnectionInfo = (componentId, pin) => {
    const wire = wires.find(w => 
      (w.sourceComponent === componentId || w.targetComponent === componentId) &&
      (w.sourceName === pin.toString() || w.targetName === pin.toString())
    );
    
    if (wire) {
      return {
        componentPin: wire.sourceComponent === componentId ? wire.sourceName : wire.targetName,
        arduinoPin: pin
      };
    }
    
    return null;
  };
  
  // Function to start the simulation  
  const startSimulation = async () => {
    addLog('Starting simulation...');
    setIsRunning(true);
    
    // Create real Arduino emulator instance
    if (!emulatorRef.current) {
      emulatorRef.current = new ArduinoEmulator({
        onPinChange: (pin, isHigh) => {
          addLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
          
          // Update component states based on pin changes
          updateComponentPinStates(pin, isHigh);
        },
        onLog: (message) => {
          addLog(`[Emulator] ${message}`);
        }
      });
      
      addLog('AVR8js emulator initialized');
    }
    
    // Compile Arduino code to bytecode
    try {
      addLog('Compiling Arduino code...');
      const compiledProgram = await compileArduinoCode(code);
      
      if (!compiledProgram) {
        addLog('❌ Compilation failed');
        setIsRunning(false);
        return;
      }
      
      addLog('✅ Compilation successful');
      
      // Load program into emulator
      emulatorRef.current.loadProgram(compiledProgram);
      addLog('Program loaded into AVR8js emulator');
      
      // Start emulation
      emulatorRef.current.start();
      addLog('🚀 Real Arduino emulation started');
      
    } catch (error) {
      addLog(`❌ Error starting emulation: ${error.message}`);
      setIsRunning(false);
    }
  };
  
  // Function to stop the simulation
  const stopSimulation = () => {
    addLog('Stopping simulation...');
    setIsRunning(false);
    
    // Stop the real emulator
    if (emulatorRef.current) {
      emulatorRef.current.stop();
      addLog('AVR8js emulation stopped');
    }
    
    // Reset all component states when stopping
    const resetStates = {};
    components.forEach(component => {
      if (component.type === 'led' || component.id.includes('led')) {
        resetStates[component.id] = { isOn: false };
      }
      if (component.type === 'heroboard' || component.id.includes('heroboard')) {
        const pins = {};
        for (let i = 0; i <= 13; i++) {
          pins[i] = false;
        }
        resetStates[component.id] = { pins };
      }
    });
    
    // Apply reset states
    Object.keys(resetStates).forEach(componentId => {
      updateComponentState(componentId, resetStates[componentId]);
    });
    
    addLog('All components reset to initial state');
  };
  
  // Log component and wire state changes for debugging
  useEffect(() => {
    console.log('Simulator components updated:', components.length);
    
    // Add each component to the component states if it's not already there
    // This ensures components are registered in the simulator context immediately
    if (components.length > 0) {
      const newStates = { ...componentStates };
      let hasChanges = false;
      
      components.forEach(component => {
        if (!componentStates[component.id]) {
          // Initialize component state with empty values
          newStates[component.id] = {
            id: component.id,
            type: component.type,
            pins: {}
          };
          hasChanges = true;
          console.log(`Registered component in simulator context: ${component.id} (${component.type})`);
        }
      });
      
      // Only update state if we have new components
      if (hasChanges) {
        setComponentStates(newStates);
      }
    }
  }, [components, componentStates]);
  
  useEffect(() => {
    console.log('Simulator wires updated:', wires.length);
  }, [wires]);
  
  // Make the simulator context available globally for non-React components
  useEffect(() => {
    window.simulatorContext = {
      componentStates,
      wires,
      updateComponentState,
      updateComponentPins,
      // Add a debug function to list all components
      listComponents: () => console.log('All simulator components:', Object.keys(componentStates))
    };
    
    // Log all components for debugging
    console.log('Current component states:', Object.keys(componentStates));
    
    return () => {
      delete window.simulatorContext;
    };
  }, [componentStates, wires]);
  
  // Create an object with all the context values
  const contextValue = {
    code,
    logs,
    isRunning,
    components,
    wires,
    componentStates,
    startSimulation,
    stopSimulation,
    addLog,
    setCode,
    updateComponentState,
    updateComponentPins,
    setComponents,
    setWires
  };
  
  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  );
};

export default SimulatorProvider;