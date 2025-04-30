import React, { createContext, useState, useContext, useCallback } from 'react';

// Create a context for the simulator
const SimulatorContext = createContext({
  isSimulationRunning: false,
  startSimulation: () => {},
  stopSimulation: () => {},
  setPinState: () => {},
  updateComponentState: () => {},
  componentStates: {},  // Store component states (e.g., LED on/off)
  pinStates: {},        // Store pin states (HIGH/LOW)
  logs: [],
  addLog: () => {}
});

/**
 * SimulatorProvider - Provides simulation state and methods to the component tree
 */
export const SimulatorProvider = ({ children }) => {
  // State for simulation status
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  // State for component signal states (connected to pins)
  const [componentStates, setComponentStates] = useState({});
  
  // State for pin states (HIGH/LOW)
  const [pinStates, setPinStates] = useState({});
  
  // State for simulation logs
  const [logs, setLogs] = useState([]);
  
  // Start the simulation
  const startSimulation = useCallback(() => {
    addLog('Simulation started');
    setIsSimulationRunning(true);
  }, []);
  
  // Stop the simulation
  const stopSimulation = useCallback(() => {
    addLog('Simulation stopped');
    setIsSimulationRunning(false);
    
    // Reset component states
    setComponentStates({});
  }, []);
  
  // Add a log entry with timestamp
  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message }]);
    console.log(`[Simulator] ${message}`);
  }, []);
  
  // Set pin state (for input components like buttons)
  const setPinState = useCallback((pin, isHigh) => {
    // Update the pin state in our state object
    setPinStates(prev => ({
      ...prev,
      [`D${pin}`]: isHigh
    }));
    
    // This will be called by components to update pin states
    // It gets passed to the AVR8Simulator component
    addLog(`Pin ${pin} set to ${isHigh ? 'HIGH' : 'LOW'}`);
  }, []);
  
  // Update component state based on pin state - Wokwi style
  const updateComponentState = useCallback((componentId, newState) => {
    console.log(`Updating component state for ${componentId}:`, newState);
    
    // Update the component state in our state store
    setComponentStates(prev => ({
      ...prev,
      [componentId]: newState
    }));
    
    // WOKWI STYLE: Also dispatch a DOM event for components to listen for
    // This allows components to be notified of state changes even if they're rendered after the state is updated
    document.dispatchEvent(new CustomEvent('componentStateChanged', {
      detail: {
        componentId: componentId,
        ...newState
      }
    }));
    
    addLog(`Component ${componentId} state updated: ${JSON.stringify(newState)}`);
  }, []);
  
  // Create the context value object
  const contextValue = {
    isSimulationRunning,
    startSimulation,
    stopSimulation,
    setPinState,
    updateComponentState,
    componentStates,
    pinStates,
    logs,
    addLog
  };
  
  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  );
};

// Custom hook for using the simulator context
export const useSimulator = () => useContext(SimulatorContext);

export default SimulatorContext;