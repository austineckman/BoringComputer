import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ArduinoCompilationService } from '../compiler/ArduinoCompilationService';
import { AVR8Core } from '../avr8js/AVR8Core';

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

export const useSimulator = () => useContext(SimulatorContext);

export const SimulatorProvider = ({ children, initialCode = '' }) => {
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [serialLogs, setSerialLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [componentStates, setComponentStates] = useState({});
  
  const avrCoreRef = useRef(null);
  const executionIntervalRef = useRef(null);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    if (message.includes('Refreshing component states') || 
        message.includes('updated:') ||
        message.includes('FALLBACK') ||
        message.includes('current_component_state')) {
      return;
    }
    
    const cleanMessage = formattedMessage
      .replace('[Arduino] ', '')
      .replace(/\[AVR8\] /g, '')
      .replace(/\[Simulator\] /g, '')
      .replace(/\[FALLBACK\] /g, '')
      .replace(/\[DIRECT\] /g, '');
    
    setLogs(prevLogs => [...prevLogs.slice(-99), cleanMessage]);
  };

  const addSerialLog = (message, isNewline = true) => {
    const serialEntry = {
      message: message,
      newline: isNewline
    };
    
    setSerialLogs(prevLogs => [...prevLogs.slice(-99), serialEntry]);
  };
  
  const updateComponentState = (componentId, newState) => {
    setComponentStates(prevStates => ({
      ...prevStates,
      [componentId]: {
        ...(prevStates[componentId] || {}),
        ...newState
      }
    }));
  };
  
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
  
  const startSimulation = async (codeToExecute) => {
    const currentCode = codeToExecute || code;
    console.log('[Simulator] startSimulation called with code length:', currentCode?.length);
    
    if (!currentCode || currentCode.trim() === '') {
      addLog('❌ Error: No Arduino code to execute');
      return;
    }
    
    if (codeToExecute && codeToExecute !== code) {
      setCode(codeToExecute);
    }
    
    setLogs([]);
    setSerialLogs([]);
    
    if (avrCoreRef.current) {
      avrCoreRef.current.stop();
    }
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
    }
    
    addLog('🔧 Compiling Arduino code on server...');
    setIsCompiling(true);
    
    try {
      const result = await ArduinoCompilationService.compileAndParse(currentCode);
      console.log('[Simulator] Compilation result:', result);
      
      setIsCompiling(false);
      
      if (!result.success) {
        addLog('❌ Compilation failed:');
        result.errors?.forEach(error => addLog(`   ${error}`));
        return;
      }
      
      addLog('✅ Compilation successful');
      addLog('🚀 Loading program into AVR8 emulator...');
      
      console.log('[Simulator] Creating AVR8Core instance...');
      console.log('[Simulator] AVR8Core class:', AVR8Core);
      try {
        avrCoreRef.current = new AVR8Core();
        console.log('[Simulator] AVR8Core created successfully');
      } catch (err) {
        console.error('[Simulator] Failed to create AVR8Core:', err);
        addLog(`❌ Failed to create emulator: ${err.message}`);
        return;
      }
      
      try {
        avrCoreRef.current.loadProgram(result.program);
        console.log('[Simulator] Program loaded into AVR8Core, size:', result.program?.length);
      } catch (err) {
        console.error('[Simulator] Failed to load program:', err);
        addLog(`❌ Failed to load program: ${err.message}`);
        return;
      }
      
      console.log('[Simulator] Setting up pin change listeners...');
      try {
        for (let arduinoPin = 0; arduinoPin <= 19; arduinoPin++) {
          const mapping = AVR8Core.mapArduinoPin(arduinoPin);
          if (mapping) {
            avrCoreRef.current.onPinChange(mapping.port, mapping.pin, (isHigh) => {
              handlePinChange(arduinoPin, isHigh);
            });
          }
        }
        console.log('[Simulator] Pin change listeners set up successfully');
      } catch (err) {
        console.error('[Simulator] Failed to set up pin listeners:', err);
        addLog(`❌ Failed to set up pin listeners: ${err.message}`);
        return;
      }
      
      addLog('▶️ Starting AVR8 execution...');
      console.log('[Simulator] About to start execution interval...');
      setIsRunning(true);
      
      // Execute 100,000 cycles per interval to achieve real-time 16MHz simulation
      // This allows delay(1000) to complete in ~1 second of wall-clock time
      let executionCount = 0;
      executionIntervalRef.current = setInterval(() => {
        if (avrCoreRef.current) {
          avrCoreRef.current.execute(100000);
          executionCount++;
          if (executionCount % 100 === 0) {
            console.log(`[Simulator] Executed ${executionCount * 100000} total cycles`);
          }
        }
      }, 1);
      
      console.log('[Simulator] Execution interval started');
      addLog('✅ Simulation running at 16MHz');
      
    } catch (error) {
      setIsCompiling(false);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('[Simulator] Error:', error);
    }
  };
  
  const handlePinChange = (pin, isHigh) => {
    console.log(`[AVR8] Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
    
    const latestComponents = window.latestSimulatorData?.components || [];
    const latestWires = window.latestSimulatorData?.wires || [];
    
    console.log(`[AVR8] Checking ${latestComponents.length} components and ${latestWires.length} wires`);
    
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
        
        console.log(`[AVR8] Component ${component.id} has ${connectedWires.length} wires connected to pin ${pin}`);
        
        if (connectedWires.length > 0) {
          updateComponentState(component.id, { 
            isOn: isHigh,
            brightness: isHigh ? 1.0 : 0.0
          });
          addLog(`💡 Pin ${pin} → ${component.id} ${isHigh ? 'ON' : 'OFF'}`);
        }
      }
    });
  };
  
  const stopSimulation = () => {
    addLog('🛑 Stopping AVR8 simulation...');
    setIsRunning(false);
    
    if (avrCoreRef.current) {
      avrCoreRef.current.stop();
      avrCoreRef.current = null;
      addLog('⏹️ AVR8 core stopped');
    }
    
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
    
    addLog('✅ Simulation stopped - all components reset');
  };
  
  useEffect(() => {
    console.log(`[SimulatorContext] Components updated:`, components.length, components.map(c => `${c.id}(${c.type})`));
    
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.components = components;
    console.log(`[SimulatorContext] Stored ${components.length} components globally`);
    
    if (components.length > 0) {
      const newStates = { ...componentStates };
      let hasChanges = false;
      
      components.forEach(component => {
        if (!componentStates[component.id]) {
          newStates[component.id] = {
            id: component.id,
            type: component.type,
            pins: {}
          };
          hasChanges = true;
          console.log(`[SimulatorContext] Registered component: ${component.id} (${component.type})`);
        }
      });
      
      if (hasChanges) {
        setComponentStates(newStates);
      }
    }
  }, [components, componentStates]);
  
  useEffect(() => {
    console.log(`[SimulatorContext] Wires updated:`, wires.length, wires.map(w => `${w.sourceComponent}->${w.targetComponent} (${w.sourceName}->${w.targetName})`));
    
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.wires = wires;
    console.log(`[SimulatorContext] Stored ${wires.length} wires globally`);
  }, [wires]);
  
  useEffect(() => {
    window.simulatorContext = {
      componentStates,
      wires,
      updateComponentState,
      updateComponentPins,
      listComponents: () => console.log('All simulator components:', Object.keys(componentStates))
    };
    
    console.log('Current component states:', Object.keys(componentStates));
    
    return () => {
      delete window.simulatorContext;
    };
  }, [componentStates, wires]);
  
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
