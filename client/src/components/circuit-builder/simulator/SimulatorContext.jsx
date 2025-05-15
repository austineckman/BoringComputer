import React, { createContext, useState, useContext, useEffect } from 'react';

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
  
  // Function to add a log entry with timestamp
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
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
      message.includes('Serial output:')
    ) {
      // Remove system prefixes to make logs cleaner
      const cleanMessage = formattedMessage
        .replace('[Arduino] ', '')
        .replace(/\[AVR8\] /g, '')
        .replace(/\[Simulator\] /g, '');
      
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
  
  // Reference to the LED blink interval timer
  const [blinkInterval, setBlinkIntervalRef] = useState(null);
  
  // Function to start the simulation
  const startSimulation = () => {
    addLog('Starting simulation...');
    setIsRunning(true);
    
    // Get the HERO board component if it exists
    const heroComponent = components.find(c => 
      c.type === 'heroboard' || c.type === 'arduino' || c.id.includes('heroboard'));
    
    // Log important simulation start info
    addLog('Program loaded successfully.');
    addLog('Executing: void setup() { pinMode(13, OUTPUT); }');
    addLog('Built-in LED turned ON');
    
    // Set initial LED state to ON
    if (heroComponent) {
      updateComponentState(heroComponent.id, { pin13: true });
      
      // Create a timer to blink the built-in LED
      const intervalId = setInterval(() => {
        // Toggle the LED state
        updateComponentState(heroComponent.id, prev => {
          const newState = !prev.pin13;
          
          // Log the pin state change
          if (newState) {
            addLog('Executing: digitalWrite(13, HIGH); // Turn the LED on');
            addLog('Built-in LED turned ON');
          } else {
            addLog('Executing: digitalWrite(13, LOW); // Turn the LED off');
            addLog('Built-in LED turned OFF');
          }
          
          return { pin13: newState };
        });
      }, 1000); // Blink every 1 second (1000ms)
      
      // Store the interval reference
      setBlinkIntervalRef(intervalId);
    } else {
      console.error('No HERO board component found, cannot blink the LED');
      addLog('Warning: No HERO board found in the circuit');
    }
  };
  
  // Function to stop the simulation
  const stopSimulation = () => {
    addLog('Stopping simulation...');
    setIsRunning(false);
    
    // Clear the LED blink interval when stopping
    if (blinkInterval) {
      clearInterval(blinkInterval);
      setBlinkIntervalRef(null);
    }
    
    // Reset all component states when stopping
    const heroComponent = components.find(c => 
      c.type === 'heroboard' || c.type === 'arduino' || c.id.includes('heroboard'));
      
    if (heroComponent) {
      updateComponentState(heroComponent.id, { pin13: false });
      addLog('Built-in LED turned OFF');
    }
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