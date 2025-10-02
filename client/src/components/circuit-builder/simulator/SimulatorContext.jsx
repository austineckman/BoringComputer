import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { AVRRunner } from '../avr8js/AVRRunner';
import { loadHex } from '../avr8js/loadHex';

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
  const avrRunnerRef = useRef(null);
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
    
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
    }
    
    addLog('🔧 Compiling Arduino code on server...');
    setIsCompiling(true);
    
    try {
      const response = await fetch('/api/arduino-compiler/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode })
      });
      
      const result = await response.json();
      setIsCompiling(false);
      
      if (!result.success) {
        addLog('❌ Compilation failed');
        if (result.errors) {
          result.errors.forEach(err => addLog(`   ${err}`));
        } else if (result.error) {
          addLog(`   ${result.error}`);
        }
        return;
      }
      
      addLog('✅ Compilation successful');
      addLog('🚀 Loading program into AVR8 emulator...');
      
      const program = loadHex(result.binary);
      avrRunnerRef.current = new AVRRunner(program);
      
      // Port B: bits 0-5 map to Arduino pins 8-13
      avrRunnerRef.current.portB.addListener((value) => {
        // Pin 8 = PB0 (bit 0)
        handlePinChange(8, (value & (1 << 0)) !== 0);
        // Pin 9 = PB1 (bit 1)
        handlePinChange(9, (value & (1 << 1)) !== 0);
        // Pin 10 = PB2 (bit 2)
        handlePinChange(10, (value & (1 << 2)) !== 0);
        // Pin 11 = PB3 (bit 3)
        handlePinChange(11, (value & (1 << 3)) !== 0);
        // Pin 12 = PB4 (bit 4)
        handlePinChange(12, (value & (1 << 4)) !== 0);
        // Pin 13 = PB5 (bit 5) - ONBOARD LED
        handlePinChange(13, (value & (1 << 5)) !== 0);
      });
      
      // Port C: bits 0-5 map to analog pins A0-A5
      avrRunnerRef.current.portC.addListener((value) => {
        for (let bit = 0; bit < 6; bit++) {
          const isHigh = ((value >> bit) & 1) === 1;
          handlePinChange(`A${bit}`, isHigh);
        }
      });
      
      // Port D: bits 0-7 map to digital pins 0-7
      avrRunnerRef.current.portD.addListener((value) => {
        for (let bit = 0; bit < 8; bit++) {
          const isHigh = ((value >> bit) & 1) === 1;
          handlePinChange(bit, isHigh);
        }
      });
      
      addLog('▶️ Starting AVR8 execution...');
      setIsRunning(true);
      
      executionIntervalRef.current = setInterval(() => {
        if (avrRunnerRef.current) {
          avrRunnerRef.current.execute(16000);
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
    
    avrRunnerRef.current = null;
    
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
      executionIntervalRef.current = null;
    }
    
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
    
    addLog('✅ Simulation stopped');
  };
  
  // Store the latest components and wires data globally for execution access
  useEffect(() => {
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.components = components;
    
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
        }
      });
      
      // Only update state if we have new components
      if (hasChanges) {
        setComponentStates(newStates);
      }
    }
  }, [components, componentStates]);
  
  useEffect(() => {
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.wires = wires;
  }, [wires]);
  
  // Make the simulator context available globally for non-React components
  useEffect(() => {
    window.simulatorContext = {
      componentStates,
      wires,
      updateComponentState,
      updateComponentPins
    };
    
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