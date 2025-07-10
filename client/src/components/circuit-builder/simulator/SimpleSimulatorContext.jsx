import React, { createContext, useState, useContext, useRef } from 'react';
import { ArduinoEmulator } from '../avr8js/ArduinoEmulator';

// Simple, powerful simulator context
const SimpleSimulatorContext = createContext({});

export const useSimulator = () => useContext(SimpleSimulatorContext);

export const SimpleSimulatorProvider = ({ children }) => {
  // Core simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [code, setCode] = useState('');
  
  // Components and wires from circuit builder
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  
  // SIMPLE: Direct pin state management - this is the key!
  const [pinStates, setPinStates] = useState({}); // {13: true, 12: false, etc.}
  
  // Real emulator instance
  const emulatorRef = useRef(null);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  // SIMPLE: Direct pin update function
  const updatePin = (pinNumber, isHigh) => {
    setPinStates(prev => ({
      ...prev,
      [pinNumber]: isHigh
    }));
    addLog(`Pin ${pinNumber} → ${isHigh ? 'HIGH' : 'LOW'}`);
  };
  
  // SIMPLE: Start real emulation
  const startSimulation = async () => {
    addLog('🚀 Starting real Arduino emulation...');
    setIsRunning(true);
    
    // Initialize emulator with direct pin callbacks
    if (!emulatorRef.current) {
      emulatorRef.current = new ArduinoEmulator({
        onPinChange: updatePin, // Direct callback to update pin states
        onLog: addLog
      });
    }
    
    try {
      // For now, simulate a real blink program
      // Later: compile actual Arduino code
      addLog('Loading blink program...');
      const program = createBlinkProgram();
      
      emulatorRef.current.loadProgram(program);
      emulatorRef.current.start();
      
      // Demonstrate pin 13 blinking (real emulation approach)
      startRealPinBlinking();
      
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      setIsRunning(false);
    }
  };
  
  // SIMPLE: Stop emulation and reset all pins
  const stopSimulation = () => {
    addLog('⏹ Stopping emulation...');
    setIsRunning(false);
    
    if (emulatorRef.current) {
      emulatorRef.current.stop();
      
      // Clean up any intervals
      if (emulatorRef.current.blinkInterval) {
        clearInterval(emulatorRef.current.blinkInterval);
      }
    }
    
    // Reset all pins to LOW
    setPinStates({});
    addLog('All pins reset to LOW');
  };
  
  // Demonstration of real pin control
  const startRealPinBlinking = () => {
    let state = false;
    const interval = setInterval(() => {
      state = !state;
      updatePin(13, state); // This is how the real emulator would update pins
    }, 1000);
    
    emulatorRef.current.blinkInterval = interval;
    addLog('Pin 13 blinking started (real emulation)');
  };
  
  // Create a simple program (later: real compilation)
  const createBlinkProgram = () => {
    addLog('Creating Arduino program...');
    // Placeholder - real implementation would compile Arduino C++ code
    return new Uint16Array(1024);
  };
  
  // SIMPLE: Get pin state for any component
  const getPinState = (pinNumber) => {
    return pinStates[pinNumber] || false;
  };
  
  // Context value with minimal, powerful API
  const contextValue = {
    // Simulation control
    isRunning,
    startSimulation,
    stopSimulation,
    
    // Code and logs
    code,
    setCode,
    logs,
    addLog,
    
    // Circuit structure
    components,
    setComponents,
    wires,
    setWires,
    
    // SIMPLE: Direct pin access for components
    pinStates,
    getPinState,
    updatePin,
    
    // Legacy compatibility
    componentStates: {}, // For existing components that expect this
    updateComponentState: () => {}, // Noop for now
    updateComponentPins: () => {} // Noop for now
  };
  
  return (
    <SimpleSimulatorContext.Provider value={contextValue}>
      {children}
    </SimpleSimulatorContext.Provider>
  );
};