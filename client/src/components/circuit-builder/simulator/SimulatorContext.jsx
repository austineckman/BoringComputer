/**
 * SimulatorContext.jsx
 * 
 * This context provides centralized state management for the simulator.
 * It allows components to share simulator state and coordinate actions.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { formatTimeElapsed } from './SimulatorUtils';

// Create the context
const SimulatorContext = createContext(null);

// Create a custom hook to use the simulator context
export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};

// Main provider component
export const SimulatorProvider = ({ children }) => {
  // Simulator state
  const [isRunning, setIsRunning] = useState(false);
  const [simulationStartTime, setSimulationStartTime] = useState(null);
  const [simulationElapsedTime, setSimulationElapsedTime] = useState(0);
  const [components, setComponents] = useState([]);
  const [pinStates, setPinStates] = useState({});
  const [componentStates, setComponentStates] = useState({});
  const [errors, setErrors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [code, setCode] = useState('');
  const [compileStatus, setCompileStatus] = useState(null);
  const [currentSpeed, setCurrentSpeed] = useState(1); // Speed multiplier

  // Timer for tracking simulation time
  useEffect(() => {
    let interval = null;
    
    if (isRunning && simulationStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - simulationStartTime;
        setSimulationElapsedTime(elapsed);
      }, 100);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, simulationStartTime]);

  // Start the simulation
  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setSimulationStartTime(Date.now() - simulationElapsedTime);
    addLog('Simulation started', 'success');
  }, [simulationElapsedTime]);

  // Stop the simulation
  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    addLog('Simulation stopped', 'info');
  }, []);

  // Reset the simulation state
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setSimulationStartTime(null);
    setSimulationElapsedTime(0);
    setPinStates({});
    setErrors([]);
    addLog('Simulation reset', 'info');
  }, []);

  // Update a pin's state
  const updatePinState = useCallback((pinId, state) => {
    setPinStates(prev => ({
      ...prev,
      [pinId]: state
    }));
  }, []);

  // Add a log entry
  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const simTime = simulationStartTime ? formatTimeElapsed(Date.now() - simulationStartTime) : '0ms';
    
    setLogs(prev => [
      { 
        id: Date.now().toString(), 
        timestamp,
        simTime,
        message, 
        type 
      }, 
      ...prev
    ].slice(0, 100)); // Keep only the latest 100 logs
  }, [simulationStartTime]);

  // Add an error
  const addError = useCallback((message) => {
    setErrors(prev => [...prev, { id: Date.now().toString(), message }]);
    addLog(`Error: ${message}`, 'error');
  }, [addLog]);

  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Set simulator speed (0.25x to 4x)
  const setSimulationSpeed = useCallback((speed) => {
    setCurrentSpeed(speed);
    addLog(`Simulation speed set to ${speed}x`, 'info');
  }, [addLog]);

  // Update component list
  const setSimulationComponents = useCallback((newComponents) => {
    setComponents(newComponents);
  }, []);
  
  // Update a component's state
  const updateComponentState = useCallback((componentId, state) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: state
    }));
  }, []);
  
  // Update specific pins on a component
  const updateComponentPins = useCallback((componentId, pins) => {
    setComponentStates(prev => {
      const currentState = prev[componentId] || {};
      return {
        ...prev,
        [componentId]: {
          ...currentState,
          pins: {
            ...(currentState.pins || {}),
            ...pins
          }
        }
      };
    });
  }, []);

  // Expose context value
  const contextValue = {
    isRunning,
    simulationElapsedTime,
    formatElapsedTime: () => formatTimeElapsed(simulationElapsedTime),
    components,
    setSimulationComponents,
    pinStates,
    updatePinState,
    componentStates,
    updateComponentState,
    updateComponentPins,
    errors,
    logs,
    code,
    setCode,
    compileStatus,
    setCompileStatus,
    currentSpeed,
    
    // Methods
    startSimulation,
    stopSimulation,
    resetSimulation,
    addLog,
    addError,
    clearLogs,
    setSimulationSpeed
  };

  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  );
};

export default SimulatorContext;