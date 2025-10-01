import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { ArduinoCompilationService } from '../compiler/ArduinoCompilationService';
import { AVR8Core } from '../avr8js/AVR8Core';

// Create a context for the simulator
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

// Custom hook to access simulator context
export const useSimulator = () => useContext(SimulatorContext);

// Simulator Provider component
export const SimulatorProvider = ({ children, initialCode = '' }) => {
  // State variables
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [serialLogs, setSerialLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [componentStates, setComponentStates] = useState({});

  // AVR8 emulator state
  const avrCoreRef = useRef(null);
  const executionIntervalRef = useRef(null);
  const isRunningRef = useRef(false); // Use a ref to track running state within intervals

  // Function to add a log entry with timestamp
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;

    // Skip noisy system messages that aren't useful to the user
    if (message.includes('Refreshing component states') ||
        message.includes('updated:') ||
        message.includes('FALLBACK') ||
        message.includes('current_component_state')) {
      return; // Skip these messages
    }

    // Clean up the message and add to logs
    const cleanMessage = formattedMessage
      .replace('[Arduino] ', '')
      .replace(/\[AVR8\] /g, '')
      .replace(/\[Simulator\] /g, '')
      .replace(/\[FALLBACK\] /g, '')
      .replace(/\[DIRECT\] /g, '');

    setLogs(prevLogs => [...prevLogs.slice(-99), cleanMessage]); // Keep last 100 entries
  };

  // Function to add a serial log entry (Arduino IDE style - clean output only)
  const addSerialLog = (message, isNewline = true) => {
    const serialEntry = {
      message: message,
      newline: isNewline
    };

    setSerialLogs(prevLogs => [...prevLogs.slice(-99), serialEntry]); // Keep last 100 entries
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

  // Parse OLED commands from serial output
  const parseOLEDCommand = (line) => {
    // Format: OLED:type:params...
    const parts = line.split(':');
    if (parts.length < 2) return;

    const commandType = parts[1];

    // Find all OLED display components
    const latestComponents = window.latestSimulatorData?.components || [];
    const oledComponents = latestComponents.filter(c =>
      c.type === 'oled-display' || c.id.includes('oled')
    );

    if (oledComponents.length === 0) {
      console.warn('[OLED Parser] No OLED components found');
      return;
    }

    // Update each OLED display
    oledComponents.forEach(oledComponent => {
      const currentState = componentStates[oledComponent.id] || {};
      const currentDisplay = currentState.display || { elements: [] };

      let newElements = [...(currentDisplay.elements || [])];

      switch (commandType) {
        case 'init':
          console.log('[OLED Parser] Initializing OLED display');
          updateComponentState(oledComponent.id, {
            display: { elements: [] }
          });
          break;

        case 'clear':
          console.log('[OLED Parser] Clearing OLED display');
          updateComponentState(oledComponent.id, {
            display: { elements: [] }
          });
          break;

        case 'text':
          // Format: OLED:text:Hello World:10:20
          if (parts.length >= 5) {
            const text = parts[2];
            const x = parseInt(parts[3]);
            const y = parseInt(parts[4]);
            console.log(`[OLED Parser] Drawing text "${text}" at (${x}, ${y})`);
            newElements.push({ type: 'text', text, x, y });
            updateComponentState(oledComponent.id, {
              display: { elements: newElements }
            });
          }
          break;

        case 'frame':
          // Format: OLED:frame:0:0:100:50
          if (parts.length >= 6) {
            const x = parseInt(parts[2]);
            const y = parseInt(parts[3]);
            const width = parseInt(parts[4]);
            const height = parseInt(parts[5]);
            console.log(`[OLED Parser] Drawing frame at (${x}, ${y}) size ${width}x${height}`);
            newElements.push({ type: 'frame', x, y, width, height });
            updateComponentState(oledComponent.id, {
              display: { elements: newElements }
            });
          }
          break;

        case 'filledRect':
          // Format: OLED:filledRect:0:0:100:50
          if (parts.length >= 6) {
            const x = parseInt(parts[2]);
            const y = parseInt(parts[3]);
            const width = parseInt(parts[4]);
            const height = parseInt(parts[5]);
            console.log(`[OLED Parser] Drawing filled rect at (${x}, ${y}) size ${width}x${height}`);
            newElements.push({ type: 'filledRect', x, y, width, height });
            updateComponentState(oledComponent.id, {
              display: { elements: newElements }
            });
          }
          break;

        case 'circle':
          // Format: OLED:circle:64:32:10
          if (parts.length >= 5) {
            const x = parseInt(parts[2]);
            const y = parseInt(parts[3]);
            const radius = parseInt(parts[4]);
            console.log(`[OLED Parser] Drawing circle at (${x}, ${y}) radius ${radius}`);
            newElements.push({ type: 'circle', x, y, radius });
            updateComponentState(oledComponent.id, {
              display: { elements: newElements }
            });
          }
          break;

        case 'filledCircle':
          // Format: OLED:filledCircle:64:32:10
          if (parts.length >= 5) {
            const x = parseInt(parts[2]);
            const y = parseInt(parts[3]);
            const radius = parseInt(parts[4]);
            console.log(`[OLED Parser] Drawing filled circle at (${x}, ${y}) radius ${radius}`);
            newElements.push({ type: 'filledCircle', x, y, radius });
            updateComponentState(oledComponent.id, {
              display: { elements: newElements }
            });
          }
          break;

        default:
          console.warn('[OLED Parser] Unknown command type:', commandType);
      }
    });
  };

  // Initialize all OLED displays when simulation starts
  const initializeOLEDDisplays = () => {
    const latestComponents = window.latestSimulatorData?.components || [];
    const oledComponents = latestComponents.filter(c =>
      c.type === 'oled-display' || c.id.includes('oled')
    );

    oledComponents.forEach(oledComponent => {
      console.log(`[OLED Initializer] Initializing OLED component: ${oledComponent.id}`);
      updateComponentState(oledComponent.id, {
        display: { elements: [] } // Reset display elements
      });
      // Optionally send an 'init' command if your backend expects it
      // parseOLEDCommand('OLED:init');
    });
  };

  // Function to start the simulation using real compilation and AVR8js
  const startSimulation = async (codeToExecute) => {
    // Use passed code or fall back to context code
    const currentCode = codeToExecute || code;
    console.log('[Simulator] startSimulation called with code length:', currentCode?.length);

    if (!currentCode || currentCode.trim() === '') {
      addLog('❌ Error: No Arduino code to execute');
      return;
    }

    // Always update the context code and force a refresh
    setCode(currentCode);

    // Clear any cached state
    setComponentStates({});

    console.log('[Simulator] Using code:', currentCode.substring(0, 100) + '...');

    // Clear previous logs
    setLogs([]);
    setSerialLogs([]);

    // Stop any running simulation
    if (avrCoreRef.current) {
      avrCoreRef.current.stop();
    }
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
    }

    // Compile the code
    console.log('[Simulator] Starting compilation...');
    addLog('🔧 Compiling Arduino code on server...');
    setIsCompiling(true);

    try {
      console.log('[Simulator] About to call ArduinoCompilationService.compileAndParse...');
      const result = await ArduinoCompilationService.compileAndParse(currentCode);
      console.log('[Simulator] ✅ Received compilation result:', result.success, result);
      setIsCompiling(false);

      if (!result.success) {
        console.error('[Simulator] Compilation failed:', result.errors);
        addLog('❌ Compilation failed:');
        result.errors?.forEach(error => addLog(`   ${error}`));
        return;
      }

      console.log('[Simulator] Program size:', result.program?.length, 'words');
      addLog('✅ Compilation successful');
      addLog('🚀 Loading program into AVR8 emulator...');

      // Create AVR8 core and load program
      avrCoreRef.current = new AVR8Core();
      avrCoreRef.current.loadProgram(result.program);

      addLog('🔌 Setting up pin callbacks...');
      console.log('[Simulator] Setting up pin change callbacks...');

      // Set up pin change callbacks for all AVR pins
      // Map AVR port/pin combinations to Arduino pin numbers
      const pinMappings = [
        // Port D pins
        { port: 'D', pin: 0, arduino: 0 },  // RXD
        { port: 'D', pin: 1, arduino: 1 },  // TXD
        { port: 'D', pin: 2, arduino: 2 },  // INT0
        { port: 'D', pin: 3, arduino: 3 },  // INT1/PWM
        { port: 'D', pin: 4, arduino: 4 },
        { port: 'D', pin: 5, arduino: 5 },  // PWM
        { port: 'D', pin: 6, arduino: 6 },  // PWM
        { port: 'D', pin: 7, arduino: 7 },
        // Port B pins
        { port: 'B', pin: 0, arduino: 8 },
        { port: 'B', pin: 1, arduino: 9 },  // PWM
        { port: 'B', pin: 2, arduino: 10 }, // PWM/SS
        { port: 'B', pin: 3, arduino: 11 }, // PWM/MOSI
        { port: 'B', pin: 4, arduino: 12 }, // MISO
        { port: 'B', pin: 5, arduino: 13 }, // SCK/LED
        // Port C pins (analog)
        { port: 'C', pin: 0, arduino: 14 }, // A0
        { port: 'C', pin: 1, arduino: 15 }, // A1
        { port: 'C', pin: 2, arduino: 16 }, // A2
        { port: 'C', pin: 3, arduino: 17 }, // A3
        { port: 'C', pin: 4, arduino: 18 }, // A4/SDA
        { port: 'C', pin: 5, arduino: 19 }, // A5/SCL
      ];

      pinMappings.forEach(({ port, pin, arduino }) => {
        avrCoreRef.current.onPinChange(port, pin, (isHigh) => {
          handlePinChange(arduino, isHigh);
        });
      });

      addLog('✅ Pin callbacks registered');
      console.log('[Simulator] Pin callbacks set up successfully');

      // Set up serial monitoring for OLED commands
      addLog('📡 Setting up serial monitoring...');
      let serialBuffer = '';

      avrCoreRef.current.onSerialData((byte) => {
        const char = String.fromCharCode(byte);

        // Accumulate characters until we get a newline
        if (char === '\n') {
          const line = serialBuffer.trim();
          serialBuffer = '';

          // Parse OLED commands
          if (line.startsWith('OLED:')) {
            console.log('[OLED Serial] Received command:', line);
            parseOLEDCommand(line);
          } else {
            // Regular serial output
            addSerialLog(line);
          }
        } else if (char !== '\r') {
          // Accumulate non-carriage-return characters
          serialBuffer += char;
        }
      });

      addLog('✅ Serial monitoring active');
      console.log('[Simulator] Serial monitoring set up successfully');

      // Start the execution interval directly
      console.log('[Simulator] Starting execution interval...');
      setIsRunning(true); // Set isRunning state
      isRunningRef.current = true; // Update ref

      // Run simulation in intervals with throttling to prevent lag
      executionIntervalRef.current = setInterval(() => {
        if (avrCoreRef.current && isRunningRef.current) {
          // Execute very few cycles per frame to prevent lag but maintain responsiveness
          avrCoreRef.current.execute(200); // Further reduced to 200 cycles
        }
      }, 50); // Reduced to 20 FPS to prevent lag

      console.log('[Simulator] ✅ EXECUTION INTERVAL STARTED - AVR8js is running!');

      setIsCompiling(false);


      // Initialize OLED displays after a short delay to ensure components are loaded
      setTimeout(() => {
        initializeOLEDDisplays();
      }, 100);

    } catch (error) {
      setIsCompiling(false);
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('[Simulator] Error:', error);
    }
  };

  // Handle pin state changes from AVR8 core
  const handlePinChange = (pin, isHigh) => {
    console.log(`[AVR8] Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);

    // Special logging for pin 13
    if (pin === 13) {
      console.log(`🔴 PIN 13 CHANGE DETECTED: ${isHigh ? 'HIGH' : 'LOW'}`);
    }

    // Get the latest components and wires from global storage (avoiding stale closure)
    const latestComponents = window.latestSimulatorData?.components || [];
    const latestWires = window.latestSimulatorData?.wires || [];

    console.log(`[AVR8] Checking ${latestComponents.length} components and ${latestWires.length} wires`);

    // Update the heroboard/Arduino pin states (needed for LED circuit tracing)
    latestComponents.forEach(component => {
      if (component.type === 'heroboard' || component.id.includes('heroboard') || component.id.includes('arduino')) {
        updateComponentPins(component.id, { [pin]: isHigh });
        console.log(`[AVR8] Updated ${component.id} pin ${pin} to ${isHigh ? 'HIGH' : 'LOW'}`);

        // Special handling for pin 13 - Arduino boards have an onboard LED on pin 13
        if (pin === 13) {
          // Update multiple state properties for pin 13
          updateComponentState(component.id, {
            pin13: isHigh,
            onboardLED: isHigh,
            pin13LED: isHigh
          });

          // Also update the pins object
          updateComponentPins(component.id, {
            '13': isHigh,
            'd13': isHigh
          });

          addLog(`🔴 Onboard LED (Pin 13) ${isHigh ? 'ON' : 'OFF'}`);
          console.log(`🔴 [AVR8] Pin 13 LED state updated: ${component.id} -> ${isHigh ? 'HIGH' : 'LOW'}`);
          console.log(`🔴 [AVR8] Component state after update:`, componentStates[component.id]);
        }
      }
    });

    // Update components connected to this pin
    latestComponents.forEach(component => {
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

  // Function to stop the simulation
  const stopSimulation = () => {
    addLog('🛑 Stopping AVR8 simulation...');
    setIsRunning(false);
    isRunningRef.current = false; // Update ref

    // Stop AVR8 core if running
    if (avrCoreRef.current) {
      avrCoreRef.current.stop();
      avrCoreRef.current = null;
      addLog('⏹️ AVR8 core stopped');
    }

    // Stop execution loop
    if (executionIntervalRef.current) {
      clearInterval(executionIntervalRef.current);
      executionIntervalRef.current = null;
    }

    // Reset all component states when stopping
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

  // Store the latest components and wires data globally for execution access
  useEffect(() => {
    console.log(`[SimulatorContext] Components updated:`, components.length, components.map(c => `${c.id}(${c.type})`));

    // Store the latest arrays in global storage so they're always accessible during execution
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.components = components;
    console.log(`[SimulatorContext] Stored ${components.length} components globally`);

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
          console.log(`[SimulatorContext] Registered component: ${component.id} (${component.type})`);
        }
      });

      // Only update state if we have new components
      if (hasChanges) {
        setComponentStates(newStates);
      }
    }
  }, [components, componentStates]);

  useEffect(() => {
    console.log(`[SimulatorContext] Wires updated:`, wires.length, wires.map(w => `${w.sourceComponent}->${w.targetComponent} (${w.sourceName}->${w.targetName})`));

    // Store the latest wires in global storage
    if (!window.latestSimulatorData) {
      window.latestSimulatorData = {};
    }
    window.latestSimulatorData.wires = wires;
    console.log(`[SimulatorContext] Stored ${wires.length} wires globally`);
  }, [wires]);

  // Cleanup execution interval when simulation stops
  useEffect(() => {
    console.log('[Simulator useEffect] isRunning changed to:', isRunning);

    // Only cleanup when stopping - interval is started directly in startSimulation()
    if (!isRunning && executionIntervalRef.current) {
      console.log('[Simulator] Cleaning up execution interval...');
      clearInterval(executionIntervalRef.current);
      executionIntervalRef.current = null;
      console.log('[Simulator] Execution interval cleared');
    }
  }, [isRunning]);

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