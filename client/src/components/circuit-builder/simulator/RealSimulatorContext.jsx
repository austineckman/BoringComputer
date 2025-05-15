/**
 * RealSimulatorContext.jsx
 * 
 * A context provider for the real AVR8 emulator integration.
 * This replaces the fake simulator with a real, cycle-accurate emulator.
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import RealAVR8SimulatorConnector from './proper/RealAVR8SimulatorConnector';

// Create the context
const RealSimulatorContext = createContext(null);

/**
 * Use the real simulator context
 * @returns {Object} The simulator context value
 */
export const useRealSimulator = () => {
  const context = useContext(RealSimulatorContext);
  if (!context) {
    throw new Error('useRealSimulator must be used within a RealSimulatorProvider');
  }
  return context;
};

/**
 * The RealSimulatorProvider component provides the real AVR8 emulator context
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components
 */
export const RealSimulatorProvider = ({ children }) => {
  // State for the emulator
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [compilationStatus, setCompilationStatus] = useState({
    status: 'idle',
    message: 'Ready to compile'
  });
  const [serialOutput, setSerialOutput] = useState([]);
  const [pinStates, setPinStates] = useState({});
  const [logs, setLogs] = useState([]);
  
  // Add a log message
  const addLog = useCallback((message) => {
    setLogs(prevLogs => [...prevLogs, { 
      id: Date.now(),
      message,
      timestamp: new Date().toISOString()
    }]);
  }, []);
  
  // Handle pin state changes
  const handlePinChange = useCallback((pin, isHigh, options = {}) => {
    setPinStates(prevStates => ({
      ...prevStates,
      [pin]: { isHigh, ...options }
    }));
    
    addLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}${
      options.analogValue !== undefined ? ` (analog: ${options.analogValue})` : ''
    }`);
  }, [addLog]);
  
  // Handle serial output
  const handleSerialOutput = useCallback((value, char) => {
    setSerialOutput(prevOutput => [...prevOutput, { value, char }]);
    addLog(`Serial output: ${value} (${char})`);
  }, [addLog]);
  
  // Handle errors
  const handleError = useCallback((message) => {
    addLog(`ERROR: ${message}`);
  }, [addLog]);
  
  // Handle log messages
  const handleLogMessage = useCallback((message) => {
    addLog(message);
  }, [addLog]);
  
  // Start the simulation
  const startSimulation = useCallback(() => {
    addLog('Starting simulation...');
    setIsRunning(true);
  }, [addLog]);
  
  // Stop the simulation
  const stopSimulation = useCallback(() => {
    addLog('Stopping simulation...');
    setIsRunning(false);
  }, [addLog]);
  
  // Toggle the simulation
  const toggleSimulation = useCallback(() => {
    if (isRunning) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [isRunning, startSimulation, stopSimulation]);
  
  // Set digital input
  const setDigitalInput = useCallback((pin, isHigh) => {
    addLog(`Setting digital input pin ${pin} to ${isHigh ? 'HIGH' : 'LOW'}`);
    // This will be implemented by the simulator connector
  }, [addLog]);
  
  // Set analog input
  const setAnalogInput = useCallback((pin, value) => {
    addLog(`Setting analog input ${pin} to ${value}`);
    // This will be implemented by the simulator connector
  }, [addLog]);
  
  // The context value
  const contextValue = {
    code,
    setCode,
    isRunning,
    startSimulation,
    stopSimulation,
    toggleSimulation,
    compilationStatus,
    serialOutput,
    pinStates,
    logs,
    addLog,
    setDigitalInput,
    setAnalogInput
  };
  
  return (
    <RealSimulatorContext.Provider value={contextValue}>
      <RealAVR8SimulatorConnector 
        code={code}
        isRunning={isRunning}
        onPinChange={handlePinChange}
        onSerialOutput={handleSerialOutput}
        onError={handleError}
        onLogMessage={handleLogMessage}
        setCompilationStatus={setCompilationStatus}
      >
        {(simulatorApi) => {
          // Update the context value with the simulator API functions
          contextValue.setDigitalInput = simulatorApi.setDigitalInput;
          contextValue.setAnalogInput = simulatorApi.setAnalogInput;
          contextValue.detectPinsUsed = simulatorApi.detectPinsUsed;
          contextValue.parseDelays = simulatorApi.parseDelays;
          
          return children;
        }}
      </RealAVR8SimulatorConnector>
    </RealSimulatorContext.Provider>
  );
};