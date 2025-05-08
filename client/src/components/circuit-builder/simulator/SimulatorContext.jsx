import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateArduinoCode, configureSimulationSpeed } from './ArduinoCompiler';

// Create a context for the simulator state
const SimulatorContext = createContext(null);

// Format timestamp for logs
const formatTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString();
};

// Provider component to wrap the application
export const SimulatorProvider = ({ children }) => {
  // Main simulation state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  // Pin and component states
  const [pinStates, setPinStates] = useState({});
  const [componentStates, setComponentStates] = useState({});
  
  // Logs and errors
  const [simulatorLogs, setSimulatorLogs] = useState([]);
  const [compilationErrors, setCompilationErrors] = useState([]);
  
  // Configuration options
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  // Add a log entry
  const addSimulatorLog = (message) => {
    const timestamp = formatTimestamp();
    setSimulatorLogs(prev => {
      // Limit logs to 100 entries to prevent performance issues
      const newLogs = [...prev, { timestamp, message }];
      if (newLogs.length > 100) {
        return newLogs.slice(-100);
      }
      return newLogs;
    });
  };
  
  // Clear logs
  const clearSimulatorLogs = () => {
    setSimulatorLogs([]);
  };
  
  // Start the simulation
  const startSimulation = (arduinoCode) => {
    // Validate code before running
    const errors = validateArduinoCode(arduinoCode);
    setCompilationErrors(errors);
    
    if (errors.length > 0) {
      addSimulatorLog('Simulation failed to start due to code errors');
      return false;
    }
    
    try {
      // Configure simulation speed based on code complexity
      const { performance } = configureSimulationSpeed(arduinoCode);
      
      // Initialize pin states
      setPinStates({
        // Digital pins default to LOW
        D0: false, D1: false, D2: false, D3: false,
        D4: false, D5: false, D6: false, D7: false,
        D8: false, D9: false, D10: false, D11: false,
        D12: false, D13: false,
        // Analog pins default to 0
        A0: 0, A1: 0, A2: 0, A3: 0, A4: 0, A5: 0
      });
      
      // Initialize component states (empty object, will be populated during simulation)
      setComponentStates({});
      
      // Log simulation start
      addSimulatorLog('Simulation started');
      setIsSimulationRunning(true);
      
      // Start a simple simulation loop - in a real implementation, this would
      // interact with the AVR8js library
      simulateLoop(arduinoCode);
      
      return true;
    } catch (error) {
      addSimulatorLog(`Error starting simulation: ${error.message}`);
      console.error('Simulation error:', error);
      return false;
    }
  };
  
  // Stop the simulation
  const stopSimulation = () => {
    setIsSimulationRunning(false);
    addSimulatorLog('Simulation stopped');
  };
  
  // Simple simulation for testing (this is where AVR8js would be integrated)
  const simulateLoop = (code) => {
    // This function simulates simple Arduino behavior for demonstration purposes
    // For example, let's simulate the LED blinking example:
    let pin13State = false;
    
    // Extract blinking delay from the code (simple regex to find delay values)
    let delayMatch = code.match(/delay\s*\(\s*(\d+)\s*\)/);
    let blinkDelay = delayMatch ? parseInt(delayMatch[1], 10) : 1000;
    
    // Scale to reasonable speed regardless of actual delay
    blinkDelay = Math.max(300, Math.min(blinkDelay, 1000));
    
    // Simulate the blinking
    const blinkInterval = setInterval(() => {
      if (!isSimulationRunning) {
        clearInterval(blinkInterval);
        return;
      }
      
      // Toggle pin 13 (LED_BUILTIN)
      pin13State = !pin13State;
      setPinStates(prev => ({ ...prev, D13: pin13State }));
      
      // Update component states based on connections
      // This would be more sophisticated in a real implementation
      // using the actual circuit connections
      addSimulatorLog(`Pin D13 (LED_BUILTIN) set to ${pin13State ? 'HIGH' : 'LOW'}`);
    }, blinkDelay);
    
    // Make sure to clean up if component unmounts
    return () => clearInterval(blinkInterval);
  };
  
  // Set a pin state directly (for testing or manual override)
  const setDigitalPinState = (pinNumber, isHigh) => {
    setPinStates(prev => ({ ...prev, [`D${pinNumber}`]: isHigh }));
    addSimulatorLog(`Pin D${pinNumber} set to ${isHigh ? 'HIGH' : 'LOW'}`);
  };
  
  // Set an analog pin state directly
  const setAnalogPinState = (pinNumber, value) => {
    setPinStates(prev => ({ ...prev, [`A${pinNumber}`]: value }));
    addSimulatorLog(`Pin A${pinNumber} set to ${value}`);
  };
  
  // Update a component's state
  const updateComponentState = (componentId, newState) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: {
        ...(prev[componentId] || {}),
        ...newState
      }
    }));
  };
  
  // Create a value object with all the context methods and state
  const value = {
    // Simulation control
    isSimulationRunning,
    startSimulation,
    stopSimulation,
    simulationSpeed,
    setSimulationSpeed,
    
    // State management
    pinStates,
    componentStates,
    setDigitalPinState,
    setAnalogPinState,
    updateComponentState,
    
    // Logs and errors
    simulatorLogs,
    addSimulatorLog,
    clearSimulatorLogs,
    compilationErrors,
  };
  
  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
};

// Custom hook to use the simulator context
export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};