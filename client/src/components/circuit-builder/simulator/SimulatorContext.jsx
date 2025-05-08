import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { calculateCircuitState } from './SimulatorUtils';
import { compileArduinoCode, validateCircuitForCode } from './ArduinoCompiler';

// Create a context for the simulator
const SimulatorContext = createContext({
  isSimulationRunning: false,
  isCompiling: false,
  startSimulation: () => {},
  stopSimulation: () => {},
  setPinState: () => {},
  updateComponentState: () => {},
  compileAndRun: () => {},
  componentStates: {},  // Store component states (e.g., LED on/off)
  pinStates: {},        // Store pin states (HIGH/LOW)
  logs: [],
  addLog: () => {},
  compilationErrors: [],
  compilationWarnings: [],
  simulationSpeed: 1,
  setSimulationSpeed: () => {}
});

/**
 * SimulatorProvider - Provides simulation state and methods to the component tree
 */
export const SimulatorProvider = ({ children }) => {
  // State for simulation status
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // State for component signal states (connected to pins)
  const [componentStates, setComponentStates] = useState({});
  
  // State for pin states (HIGH/LOW)
  const [pinStates, setPinStates] = useState({});
  
  // State for simulation logs
  const [logs, setLogs] = useState([]);
  
  // State for compilation results
  const [compilationErrors, setCompilationErrors] = useState([]);
  const [compilationWarnings, setCompilationWarnings] = useState([]);
  const [compiledProgram, setCompiledProgram] = useState(null);
  
  // State for simulation speed
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  // References for simulation interval
  const simulationIntervalRef = useRef(null);
  const simulationTickRef = useRef(0);
  const simulationCodeRef = useRef('');
  const circuitConnectionsRef = useRef({});
  const circuitComponentsRef = useRef([]);
  
  // Start the simulation
  const startSimulation = useCallback(() => {
    if (!compiledProgram) {
      addLog('Error: No compiled program available. Compile the code first.');
      return;
    }
    
    addLog('Simulation started');
    setIsSimulationRunning(true);
    
    // Set up the simulation loop
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    
    // Initial component states based on setup function
    const { pinModes, digitalWrites } = compiledProgram.analysis;
    
    // Set initial pin states based on pinMode declarations
    const initialPinStates = {};
    pinModes.forEach(({ pin, mode }) => {
      if (mode === 'OUTPUT') {
        // Initialize output pins to LOW
        initialPinStates[`D${pin}`] = false;
      }
    });
    setPinStates(initialPinStates);
    
    // Start the simulation interval
    simulationTickRef.current = 0;
    simulationIntervalRef.current = setInterval(() => {
      simulationTick();
    }, 100 / simulationSpeed); // Adjust frequency based on speed
  }, [compiledProgram, simulationSpeed]);
  
  // Perform a single step of the simulation
  const simulationTick = useCallback(() => {
    if (!isSimulationRunning || !compiledProgram) return;
    
    simulationTickRef.current++;
    const tick = simulationTickRef.current;
    
    // Get the digital writes from the compiled program
    const { digitalWrites, analogWrites, delays } = compiledProgram.analysis;
    
    // Calculate total delay in the loop
    const totalDelayMs = delays.reduce((sum, d) => sum + d.ms, 0) || 1000;
    
    // Calculate position in the loop based on time
    const loopPosition = (tick * 100 / simulationSpeed) % totalDelayMs;
    
    // Determine current position in the loop timeline
    let currentTime = 0;
    
    // Update pin states based on the loop position
    setPinStates(prev => {
      const newPinStates = { ...prev };
      
      // Process all digitalWrites in chronological order
      for (let i = 0; i < digitalWrites.length; i++) {
        const write = digitalWrites[i];
        
        // Simplified: assume writes occur at the start and after each delay
        if (i === 0 || (currentTime <= loopPosition && loopPosition < currentTime + (delays[i]?.ms || 0))) {
          // Apply this write
          newPinStates[`D${write.pin}`] = write.state;
          // Don't apply any more writes from this loop iteration
          break;
        }
        
        // Move time cursor forward
        currentTime += delays[i]?.ms || 0;
      }
      
      return newPinStates;
    });
    
    // Process all circuit connections to update component states
    const circuitState = calculateCircuitState(
      circuitComponentsRef.current, 
      circuitConnectionsRef.current,
      pinStates
    );
    
    // Update component states
    setComponentStates(circuitState.componentStates);
    
    // Log periodically (not every tick)
    if (tick % 20 === 0) {
      console.log(`Simulation tick ${tick}: Processing circuit state`);
    }
  }, [isSimulationRunning, compiledProgram, pinStates, simulationSpeed]);
  
  // Stop the simulation
  const stopSimulation = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    
    addLog('Simulation stopped');
    setIsSimulationRunning(false);
    
    // Reset component states
    setComponentStates({});
    setPinStates({});
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
  
  // Update component state based on pin state
  const updateComponentState = useCallback((componentId, newState) => {
    setComponentStates(prev => ({
      ...prev,
      [componentId]: newState
    }));
    
    addLog(`Component ${componentId} state updated`);
  }, []);
  
  // Compile and run the Arduino code
  const compileAndRun = useCallback((code, components, connections) => {
    // Store circuit connections for simulation
    circuitConnectionsRef.current = connections || {};
    circuitComponentsRef.current = components || [];
    simulationCodeRef.current = code;
    
    // Stop any running simulation
    if (isSimulationRunning) {
      stopSimulation();
    }
    
    setIsCompiling(true);
    addLog("Compiling Arduino code...");
    
    // Clear previous errors and warnings
    setCompilationErrors([]);
    setCompilationWarnings([]);
    
    try {
      // First, validate the circuit for the code
      const circuitValidation = validateCircuitForCode(code, connections);
      
      // Log warnings from circuit validation
      if (circuitValidation.warnings.length > 0) {
        setCompilationWarnings(circuitValidation.warnings);
        circuitValidation.warnings.forEach(warning => {
          addLog(`Warning: ${warning}`);
        });
      }
      
      // Log missing connections
      if (circuitValidation.missingConnections.length > 0) {
        const missingSummary = `Warning: Pins ${circuitValidation.missingConnections.join(', ')} are used in code but not connected in circuit`;
        addLog(missingSummary);
        setCompilationWarnings(prev => [...prev, missingSummary]);
      }
      
      // Compile the code
      const compilationResult = compileArduinoCode(code);
      
      if (!compilationResult.success) {
        // Compilation failed
        setCompilationErrors(compilationResult.errors);
        compilationResult.errors.forEach(error => {
          addLog(`Error (line ${error.line}): ${error.message}`);
        });
        
        setIsCompiling(false);
        return false;
      }
      
      // Compilation succeeded
      setCompiledProgram(compilationResult);
      
      // Log compilation results
      const { pinModes, digitalWrites, analogWrites, delays } = compilationResult.analysis;
      
      addLog(`Compilation successful. Found:`);
      addLog(`- ${pinModes.length} pinMode declarations`);
      addLog(`- ${digitalWrites.length} digitalWrite operations`);
      addLog(`- ${analogWrites.length} analogWrite operations`);
      addLog(`- ${delays.length} delay statements totaling ${delays.reduce((sum, d) => sum + d.ms, 0)}ms per loop`);
      
      // Check for blink patterns
      const { patterns } = compilationResult.analysis;
      if (patterns.blink.length > 0) {
        patterns.blink.forEach(pattern => {
          addLog(`Detected blink pattern on pin ${pattern.pin} (period: ${pattern.period}ms)`);
        });
      }
      
      setIsCompiling(false);
      return true;
    } catch (error) {
      console.error("Compilation error:", error);
      addLog(`Compilation error: ${error.message}`);
      setCompilationErrors([{ line: 1, message: error.message }]);
      setIsCompiling(false);
      return false;
    }
  }, [isSimulationRunning, stopSimulation, addLog]);
  
  // Create the context value object
  const contextValue = {
    isSimulationRunning,
    isCompiling,
    startSimulation,
    stopSimulation,
    setPinState,
    updateComponentState,
    compileAndRun,
    componentStates,
    pinStates,
    logs,
    addLog,
    compilationErrors,
    compilationWarnings,
    simulationSpeed,
    setSimulationSpeed
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