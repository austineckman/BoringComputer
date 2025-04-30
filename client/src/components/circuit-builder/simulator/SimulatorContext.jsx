import React, { createContext, useState, useContext, useCallback } from 'react';

// Create a context for the simulator
const SimulatorContext = createContext({
  isSimulationRunning: false,
  startSimulation: () => {},
  stopSimulation: () => {},
  setPinState: () => {},
  updateComponentState: () => {},
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
    // This will be called by components to update pin states
    // It gets passed to the AVR8Simulator component
    addLog(`Pin ${pin} set to ${isHigh ? 'HIGH' : 'LOW'}`);
  }, []);
  
  // Update component state based on pin state
  const updateComponentState = useCallback((componentId, newState) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: newState
    }));
    
    addLog(`Component ${componentId} state updated`);
  }, []);
  
  // Create the context value object
  const contextValue = {
    isSimulationRunning,
    startSimulation,
    stopSimulation,
    setPinState,
    updateComponentState,
    componentStates,
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