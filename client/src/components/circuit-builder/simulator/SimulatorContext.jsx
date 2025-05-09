import React, { createContext, useState, useContext, useEffect } from 'react';
import { getComponentHandler } from '../registry/ComponentRegistry';
import '../registry/RegistryInitializer'; // Import to ensure registry is initialized

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
  
  // Debug flag for development - helps with OLED display debugging
  const [debugMode, setDebugMode] = useState(true);
  
  // Function to add a log entry with timestamp
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    setLogs(prevLogs => [...prevLogs, formattedMessage]);
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
  
  // Function to start the simulation
  const startSimulation = () => {
    addLog('Starting simulation...');
    setIsRunning(true);
  };
  
  // Function to stop the simulation
  const stopSimulation = () => {
    addLog('Stopping simulation...');
    setIsRunning(false);
  };
  
  // Log component and wire state changes for debugging
  useEffect(() => {
    console.log('Simulator components updated:', components.length);
  }, [components]);
  
  useEffect(() => {
    console.log('Simulator wires updated:', wires.length);
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
  
  // Add component registry system to the simulator context
  const getComponentTypeFromId = (componentId) => {
    if (!componentId) return null;
    
    if (componentId.includes('led')) return 'LED';
    if (componentId.includes('oled')) return 'OLED';
    if (componentId.includes('rgb-led')) return 'RGB_LED';
    if (componentId.includes('button')) return 'BUTTON';
    
    // Add more component type detection as needed
    return null;
  };
  
  // Function to check wiring using component registry
  const checkComponentWiring = (componentId) => {
    try {
      const componentType = getComponentTypeFromId(componentId);
      if (!componentType) return false;
      
      // Get the appropriate handler from the registry
      const checkWiringHandler = getComponentHandler(componentType, 'checkWiring');
      if (!checkWiringHandler) {
        console.warn(`No wiring check handler found for ${componentType}`);
        return false;
      }
      
      // Call the handler from the registry
      return checkWiringHandler(componentId);
    } catch (error) {
      console.error('Error checking component wiring:', error);
      return false;
    }
  };
  
  // Function to update component state using component registry
  const updateComponentWithRegistry = (componentId, pinValues) => {
    try {
      const componentType = getComponentTypeFromId(componentId);
      if (!componentType) return null;
      
      // Get the appropriate handler from the registry
      const updateStateHandler = getComponentHandler(componentType, 'updateState');
      if (!updateStateHandler) {
        console.warn(`No update state handler found for ${componentType}`);
        return null;
      }
      
      // Call the handler and update the component state
      const newState = updateStateHandler(componentId, pinValues);
      if (newState) {
        updateComponentState(componentId, newState);
      }
      
      return newState;
    } catch (error) {
      console.error('Error updating component with registry:', error);
      return null;
    }
  };
  
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
    setWires,
    debugMode,
    setDebugMode,
    // Add the registry functions to the context
    getComponentTypeFromId,
    checkComponentWiring,
    updateComponentWithRegistry
  };
  
  // Also expose the context to the window for non-React components
  useEffect(() => {
    window.simulatorContext = {
      code,
      logs,
      isRunning,
      components,
      wires,
      componentStates,
      startSimulation,
      stopSimulation,
      addLog,
      debugMode,
      // Add registry functions
      getComponentTypeFromId,
      checkComponentWiring,
      updateComponentWithRegistry,
      // Expose registry utility directly
      getComponentHandler
    };
    
    console.log("Simulator context updated with registry integration");
    
    return () => {
      // Clean up when unmounted
      window.simulatorContext = undefined;
    };
  }, [code, logs, isRunning, components, wires, componentStates, debugMode]);
  
  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  );
};

export default SimulatorProvider;