import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { ArduinoCompilationService } from '../compiler/ArduinoCompilationService';
import { AVR8Core } from '../avr8js/AVR8Core';
import { OLEDDecoder } from '../avr8js/OLEDDecoder';
import { TM1637Decoder } from './TM1637Decoder';
import { TM1637ProtocolDecoder } from './TM1637ProtocolDecoder';

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
  const componentsRef = useRef([]);
  const wiresRef = useRef([]);
  const oledDecodersRef = useRef({});
  const tm1637DecodersRef = useRef({});
  const tm1637ProtocolDecodersRef = useRef({});

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

      console.log('[Simulator] Setting up I2C/TWI listeners...');
      try {
        // Initialize OLED decoders for all OLED components
        const latestComponents = window.latestSimulatorData?.components || [];
        const oledComponents = latestComponents.filter(c => c.type === 'oled-display');
        
        oledComponents.forEach(oled => {
          // Create decoder for each OLED (default address 0x3C)
          oledDecodersRef.current[oled.id] = new OLEDDecoder(0x3C);
          console.log(`[Simulator] Created OLED decoder for ${oled.id}`);
        });
        
        // Initialize TM1637 protocol decoders for all 7-segment displays
        const segmentedDisplayComponents = latestComponents.filter(c => c.type === 'segmented-display');
        
        segmentedDisplayComponents.forEach(display => {
          // Create protocol decoder for each 7-segment display
          tm1637ProtocolDecodersRef.current[display.id] = new TM1637ProtocolDecoder(
            display.id,
            updateComponentState,
            addLog
          );
          console.log(`[Simulator] Created TM1637 protocol decoder for ${display.id}`);
        });
        
        // Set up I2C START callback
        avrCoreRef.current.onI2CStart((address, write) => {
          console.log(`[Simulator] I2C START - Address: 0x${address.toString(16)}, ${write ? 'Write' : 'Read'}`);
          
          // Notify all OLED decoders of transaction start
          Object.values(oledDecodersRef.current).forEach(decoder => {
            decoder.onStart(address);
          });
        });
        
        // Set up I2C STOP callback
        avrCoreRef.current.onI2CStop(() => {
          console.log(`[Simulator] I2C STOP`);
          
          // Notify all OLED decoders of transaction end
          Object.values(oledDecodersRef.current).forEach(decoder => {
            decoder.onStop();
          });
        });
        
        // Set up I2C data callback
        avrCoreRef.current.onI2CData((address, data) => {
          console.log(`[Simulator] I2C data received - Address: 0x${address.toString(16)}, Data: 0x${data.toString(16)}`);
          
          // Send data to all OLED decoders
          Object.entries(oledDecodersRef.current).forEach(([oledId, decoder]) => {
            decoder.processByte(address, data);
            
            // Update component state with the latest display state
            const displayState = decoder.getDisplayState();
            updateComponentState(oledId, {
              display: displayState
            });
          });
        });
        
        console.log('[Simulator] I2C listeners set up successfully');
        addLog('🔌 I2C/TWI communication enabled for OLED displays');
      } catch (err) {
        console.error('[Simulator] Failed to set up I2C listeners:', err);
        addLog(`❌ Failed to set up I2C listeners: ${err.message}`);
      }
      
      // Set up Serial output callback for TM1637 decoders
      console.log('[Simulator] Setting up serial output listener for TM1637...');
      try {
        let serialBuffer = '';
        
        avrCoreRef.current.onSerialData((byte) => {
          const char = String.fromCharCode(byte);
          
          // Add to serial log display
          if (byte === 10) { // newline
            addSerialLog(serialBuffer, true);
            
            // Process complete line for TM1637 decoders
            Object.values(tm1637DecodersRef.current).forEach(decoder => {
              decoder.processSerialOutput(serialBuffer);
            });
            
            serialBuffer = '';
          } else if (byte === 13) { // carriage return
            // Skip carriage returns
          } else {
            serialBuffer += char;
            // Also add non-newline chars to serial log
            if (serialBuffer.length > 100) {
              // Flush buffer if it gets too long
              addSerialLog(serialBuffer, false);
              
              // Process for TM1637 decoders
              Object.values(tm1637DecodersRef.current).forEach(decoder => {
                decoder.processSerialOutput(serialBuffer);
              });
              
              serialBuffer = '';
            }
          }
        });
        
        console.log('[Simulator] Serial output listener set up successfully');
        addLog('📟 Serial output enabled for 7-segment displays');
      } catch (err) {
        console.error('[Simulator] Failed to set up serial listener:', err);
        addLog(`❌ Failed to set up serial listener: ${err.message}`);
      }

      addLog('▶️ Starting AVR8 execution...');
      console.log('[Simulator] About to start execution interval...');
      setIsRunning(true);

      // Use requestAnimationFrame for smoother, browser-optimized execution
      // Similar to Wokwi's approach - execute cycles based on actual time elapsed
      let lastTime = performance.now();
      let executionCount = 0;
      const CYCLES_PER_MS = 16000; // 16MHz = 16,000 cycles per millisecond

      const executeFrame = () => {
        if (!avrCoreRef.current) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Calculate cycles to execute based on elapsed time
        // Cap at 100ms to prevent huge jumps after tab switching
        const cappedDelta = Math.min(deltaTime, 100);
        const cyclesToExecute = Math.floor(cappedDelta * CYCLES_PER_MS);

        if (cyclesToExecute > 0) {
          avrCoreRef.current.execute(cyclesToExecute);
          executionCount += cyclesToExecute;

          if (executionCount > 16000000) { // Log every ~1 second
            console.log(`[Simulator] Executed ${executionCount} total cycles`);
            executionCount = 0;
          }
        }

        // Continue the animation loop
        executionIntervalRef.current = requestAnimationFrame(executeFrame);
      };

      // Start the execution loop
      executionIntervalRef.current = requestAnimationFrame(executeFrame);

      console.log('[Simulator] Execution loop started using requestAnimationFrame');
      addLog('✅ Simulation running at 16MHz (browser-optimized)');

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

    // Feed TM1637 protocol decoder with pin states (CLK=Pin2, DIO=Pin3)
    if (pin === 2 || pin === 3) {
      Object.values(tm1637ProtocolDecodersRef.current).forEach(decoder => {
        if (pin === 2) {
          decoder.setClkPin(isHigh);
        } else if (pin === 3) {
          decoder.setDioPin(isHigh);
        }
      });
    }

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
      cancelAnimationFrame(executionIntervalRef.current);
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
    componentsRef.current = components; // Update ref

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
    wiresRef.current = wires; // Update ref

    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.wires = wires;
    console.log(`[SimulatorContext] Stored ${wires.length} wires globally`);
  }, [wires]);

  // OLED display update handler
  const updateOLEDDisplay = useCallback((displayId, data) => {
    console.log('[SimulatorContext] OLED update:', displayId, data);

    setComponentStates(prev => {
      const newStates = { ...prev };

      // Find the OLED display component
      const oledComponent = componentsRef.current.find(c => 
        c.type === 'oled-display' || c.id.includes('oled')
      );

      if (oledComponent) {
        newStates[oledComponent.id] = {
          ...newStates[oledComponent.id],
          display: data,
          shouldDisplay: true
        };
        console.log('[SimulatorContext] Updated OLED state:', oledComponent.id, data);
      }

      return newStates;
    });
  }, []);

  // Make context available globally for libraries
  useEffect(() => {
    window.simulatorContext = {
      components: componentsRef.current,
      wires: wiresRef.current,
      updateComponent: (id, newState) => {
        const componentIndex = componentsRef.current.findIndex(c => c.id === id);
        if (componentIndex !== -1) {
          componentsRef.current[componentIndex] = { ...componentsRef.current[componentIndex], ...newState };
          setComponents([...componentsRef.current]); // Trigger re-render
        }
      },
      getComponentState: (id) => componentStates[id],
      updateOLEDDisplay,
    };
  }, [componentsRef.current, wiresRef.current, updateOLEDDisplay, componentStates]); // Added componentStates dependency

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
    setWires,
    updateOLEDDisplay // Include updateOLEDDisplay in context value
  };

  return (
    <SimulatorContext.Provider value={contextValue}>
      {children}
    </SimulatorContext.Provider>
  );
};

export default SimulatorProvider;