import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ArduinoCompilationService } from '../compiler/ArduinoCompilationService';
import { AVR8Core } from '../avr8js/AVR8Core';

// Create a context for the simulator
const SimulatorContext = createContext({
  code: '',
  logs: [],
  serialLogs: [],
  isCompiling: false,
  components: [],
  wires: [],
  componentStates: {},
  startSimulation: () => {},
  stopSimulation: () => {},
  addLog: () => {},
  addSerialLog: () => {},
  setCode: () => {},
  updateComponentState: () => {},
  updateComponentPins: () => {},
  setComponents: () => {},
  setWires: () => {}
});

// Custom hook to access simulator context
export const useSimulator = () => useContext(SimulatorContext);

// Simulator Provider component
export const SimulatorProvider = ({ children, initialCode = '' }) => {
  // State variables
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [serialLogs, setSerialLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [componentStates, setComponentStates] = useState({});
  
  // AVR8 emulator state
  const avrCoreRef = useRef(null);
  const executionIntervalRef = useRef(null);
  
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
    
    // Clean up the message and add to logs
    const cleanMessage = formattedMessage
      .replace('[Arduino] ', '')
      .replace(/\[AVR8\] /g, '')
      .replace(/\[Simulator\] /g, '')
      .replace(/\[FALLBACK\] /g, '')
      .replace(/\[DIRECT\] /g, '');
    
    setLogs(prevLogs => [...prevLogs.slice(-99), cleanMessage]); // Keep last 100 entries
  };

  // Function to add a serial log entry (Arduino IDE style - clean output only)
  const addSerialLog = (message, isNewline = true) => {
    const serialEntry = {
      message: message,
      newline: isNewline
    };
    
    setSerialLogs(prevLogs => [...prevLogs.slice(-99), serialEntry]); // Keep last 100 entries
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
  
  // Function to start the simulation using real compilation and AVR8js
  const startSimulation = async (codeToExecute) => {
    const currentCode = codeToExecute || code;
    
    if (!currentCode || currentCode.trim() === '') {
      addLog('❌ Error: No Arduino code to execute');
      return;
    }
    
    if (codeToExecute && codeToExecute !== code) {
      setCode(codeToExecute);
    }
    
    setLogs([]);
    setSerialLogs([]);
    
    if (avrCoreRef.current) {
      avrCoreRef.current.stop();
    }
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
    }
    
    addLog('🔧 Compiling Arduino code on server...');
    setIsCompiling(true);
    
    try {
      const result = await ArduinoCompilationService.compileAndParse(currentCode);
      
      setIsCompiling(false);
      
      if (!result.success) {
        addLog('❌ Compilation failed:');
        result.errors?.forEach(error => addLog(`   ${error}`));
        return;
      }
      
      addLog('✅ Compilation successful');
      addLog('🚀 Loading program into AVR8 emulator...');
      
      avrCoreRef.current = new AVR8Core();
      avrCoreRef.current.loadProgram(result.program);
      
      for (let arduinoPin = 0; arduinoPin <= 19; arduinoPin++) {
        const mapping = AVR8Core.mapArduinoPin(arduinoPin);
        if (mapping) {
          avrCoreRef.current.onPinChange(mapping.port, mapping.pin, (isHigh) => {
            handlePinChange(arduinoPin, isHigh);
          });
        }
      }
      
      addLog('▶️ Starting AVR8 execution...');
      setIsRunning(true);
      
      executionIntervalRef.current = setInterval(() => {
        if (avrCoreRef.current) {
          avrCoreRef.current.execute(16000);
        }
      }, 1);
      
      addLog('✅ Simulation running');
      
    } catch (error) {
      setIsCompiling(false);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle pin state changes from AVR8 core
  const handlePinChange = (pin, isHigh) => {
    const latestComponents = window.latestSimulatorData?.components || [];
    const latestWires = window.latestSimulatorData?.wires || [];
    
    latestComponents.forEach(component => {
      if (component.type === 'heroboard') {
        updateComponentPins(component.id, {
          [pin]: isHigh,
          ...(pin === 13 ? { pin13: isHigh } : {})
        });
      }
      
      if (component.type === 'led' || component.id.includes('led')) {
        const connectedWires = latestWires.filter(wire => 
          (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
          (wire.sourceName === pin.toString() || wire.targetName === pin.toString())
        );
        
        if (connectedWires.length > 0) {
          updateComponentState(component.id, { 
            isOn: isHigh,
            brightness: isHigh ? 1.0 : 0.0
          });
        }
      }
    });
  };
  
  // Function to stop the simulation
  const stopSimulation = () => {
    addLog('🛑 Stopping AVR8 simulation...');
    setIsRunning(false);
    
    // Stop AVR8 core if running
    if (avrCoreRef.current) {
      avrCoreRef.current.stop();
      avrCoreRef.current = null;
      addLog('⏹️ AVR8 core stopped');
    }
    
    // Stop execution loop
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
      executionIntervalRef.current = null;
    }
    
    // Reset all component states when stopping
    components.forEach(component => {
      if (component.type === 'led' || component.id.includes('led')) {
        updateComponentState(component.id, { 
          isOn: false,
          brightness: 0.0 
        });
      }
      
      if (component.type === 'heroboard' || component.id.includes('heroboard')) {
        const pins = {};
        for (let i = 0; i <= 13; i++) {
          pins[i] = false;
        }
        updateComponentState(component.id, { pins: pins });
      }
    });
    
    addLog('✅ Simulation stopped - all components reset');
  };
  
  // Store the latest components and wires data globally for execution access
  useEffect(() => {
    console.log(`[SimulatorContext] Components updated:`, components.length, components.map(c => `${c.id}(${c.type})`));
    
    // Store the latest arrays in global storage so they're always accessible during execution
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.components = components;
    console.log(`[SimulatorContext] Stored ${components.length} components globally`);
    
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
          console.log(`[SimulatorContext] Registered component: ${component.id} (${component.type})`);
        }
      });
      
      // Only update state if we have new components
      if (hasChanges) {
        setComponentStates(newStates);
      }
    }
  }, [components, componentStates]);
  
  useEffect(() => {
    console.log(`[SimulatorContext] Wires updated:`, wires.length, wires.map(w => `${w.sourceComponent}->${w.targetComponent} (${w.sourceName}->${w.targetName})`));
    
    // Store the latest wires in global storage
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.wires = wires;
    console.log(`[SimulatorContext] Stored ${wires.length} wires globally`);
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
    serialLogs,
    isRunning,
    isCompiling,
    components,
    wires,
    componentStates,
    startSimulation,
    stopSimulation,
    addLog,
    addSerialLog,
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