import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { CPU, AVRIOPort, portBConfig } from 'avr8js';
import { ArduinoCodeParser } from './ArduinoCodeParser';

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
export const SimulatorProvider = ({ children, initialCode = '' }) => {
  // State variables
  const [code, setCode] = useState(initialCode);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [componentStates, setComponentStates] = useState({});
  
  // AVR8JS simulation state
  const cpuRef = useRef(null);
  const portBRef = useRef(null);
  const animationRef = useRef(null);
  const codeParserRef = useRef(new ArduinoCodeParser());
  const executionStateRef = useRef({
    phase: 'stopped', // 'setup', 'loop', 'stopped'
    setupIndex: 0,
    loopIndex: 0,
    setupInstructions: [],
    loopInstructions: [],
    loopCount: 0
  });
  
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
  
  // Initialize AVR8JS when components change
  useEffect(() => {
    if (!cpuRef.current) {
      try {
        // Create CPU with program memory
        const cpu = new CPU(new Uint16Array(0x8000));
        cpuRef.current = cpu;
        
        // Create Port B for pin 13 (which is PB5)
        const portB = new AVRIOPort(cpu, portBConfig);
        portBRef.current = portB;
        
        // Listen for pin changes on Port B
        portB.addListener((value) => {
          // Pin 13 is bit 5 of Port B
          const pin13State = (value & 0x20) !== 0;
          
          // Update LED components connected to pin 13
          components.forEach(component => {
            if (component.type === 'led' || component.id.includes('led')) {
              // Find wires connected to this LED and pin 13
              const connectedWires = wires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === '13' || wire.targetName === '13')
              );
              
              if (connectedWires.length > 0) {
                updateComponentState(component.id, { 
                  isOn: pin13State,
                  brightness: pin13State ? 1.0 : 0.0 
                });
                addLog(`🔌 Pin 13 → ${pin13State ? 'HIGH (5V)' : 'LOW (0V)'} | LED ${pin13State ? 'ON' : 'OFF'}`);
              }
            }
          });
        });
        
        addLog('AVR8JS initialized successfully');
      } catch (error) {
        addLog(`Error initializing AVR8JS: ${error.message}`);
      }
    }
  }, [components, wires]);

  // Compile Arduino code to machine code
  const compileArduinoCode = (code) => {
    // Simple blink program machine code for testing
    const BLINK_PROGRAM = new Uint16Array([
      0x24BE, // eor r11, r11
      0xE5A5, // ldi r26, 0x25  ; DDRB address
      0xE0B0, // ldi r27, 0x00
      0xE020, // ldi r18, 0x20  ; Pin 13 is bit 5 of PORTB
      0x931C, // st X, r18      ; Set DDRB bit 5 (pin 13) to output
      
      // Main loop - toggle pin 13 with delay
      0xE5A4, // ldi r26, 0x24  ; PORTB address (loop start)
      0xE0B0, // ldi r27, 0x00
      0x911C, // ld r17, X      ; Read current PORTB value
      0xE020, // ldi r18, 0x20  ; Pin 13 mask (bit 5)
      0x2712, // eor r17, r18   ; Toggle pin 13 bit
      0x931C, // st X, r17      ; Write back to PORTB
      
      // Simple delay loop
      0xE5FF, // ldi r31, 0xFF  ; Outer loop counter high
      0xE0EF, // ldi r30, 0xFF  ; Outer loop counter low
      0xE1D0, // ldi r29, 0x10  ; Inner loop counter
      0x951A, // dec r29        ; Inner delay loop
      0xF7F1, // brne inner_loop
      0x97E1, // sbiw r30, 1    ; Decrement outer counter
      0xF7E1, // brne delay_loop
      
      0xCFF0, // rjmp loop_start ; Jump back to main loop
    ]);
    
    return BLINK_PROGRAM;
  };
  
  // Execute a single Arduino instruction
  const executeInstruction = (instruction) => {
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] Line ${instruction.lineNumber}: ${instruction.instruction}`);

    if (instruction.instruction.includes('pinMode')) {
      addLog(`[${timestamp}] → Pin ${instruction.pin} configured as ${instruction.instruction.includes('OUTPUT') ? 'OUTPUT' : 'INPUT'}`);
    }

    if (instruction.instruction.includes('digitalWrite')) {
      const voltage = instruction.value === 'HIGH' ? '5V' : '0V';
      addLog(`[${timestamp}] → Pin ${instruction.pin} set to ${instruction.value} (${voltage})`);
      
      // Update component states for pin changes
      components.forEach(component => {
        if (component.type === 'led' || component.id.includes('led')) {
          const connectedWires = wires.filter(wire => 
            (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
            (wire.sourceName === instruction.pin.toString() || wire.targetName === instruction.pin.toString())
          );
          
          if (connectedWires.length > 0) {
            const isOn = instruction.value === 'HIGH';
            updateComponentState(component.id, { 
              isOn: isOn,
              brightness: isOn ? 1.0 : 0.0 
            });
            addLog(`[${timestamp}] → LED ${component.id} turned ${isOn ? 'ON' : 'OFF'}`);
          }
        }
      });
    }

    if (instruction.instruction.includes('analogWrite')) {
      const pwmValue = instruction.value;
      const brightness = pwmValue / 255; // Convert 0-255 to 0-1
      const percentage = Math.round(brightness * 100);
      addLog(`[${timestamp}] → Pin ${instruction.pin} PWM set to ${pwmValue}/255 (${percentage}%)`);
      
      // Update component states for PWM changes
      components.forEach(component => {
        if (component.type === 'led' || component.id.includes('led')) {
          const connectedWires = wires.filter(wire => 
            (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
            (wire.sourceName === instruction.pin.toString() || wire.targetName === instruction.pin.toString())
          );
          
          if (connectedWires.length > 0) {
            const isOn = pwmValue > 0;
            updateComponentState(component.id, { 
              isOn: isOn,
              brightness: brightness,
              pwmValue: pwmValue
            });
            addLog(`[${timestamp}] → LED ${component.id} brightness set to ${percentage}%`);
          }
        }
      });
    }

    if (instruction.instruction.includes('delay')) {
      addLog(`[${timestamp}] → Waiting ${instruction.delayMs}ms...`);
      return instruction.delayMs;
    }

    if (instruction.instruction.includes('Serial.print')) {
      addLog(`[${timestamp}] → Serial: ${instruction.instruction}`);
    }

    return 0;
  };

  // Function to start the simulation - modified to accept code parameter
  const startSimulation = (codeToExecute) => {
    // Use passed code or fall back to context code
    const currentCode = codeToExecute || code;
    console.log('SimulatorContext: startSimulation called with code length:', currentCode?.length);
    console.log('SimulatorContext: code preview:', currentCode?.substring(0, 100));
    
    if (!currentCode || currentCode.trim() === '') {
      addLog('❌ Error: No Arduino code to execute');
      console.log('SimulatorContext ERROR: code is:', JSON.stringify(currentCode));
      return;
    }
    
    // Update the context code if we received code as parameter
    if (codeToExecute && codeToExecute !== code) {
      setCode(codeToExecute);
    }
    
    // Clear previous logs
    setLogs([]);
    
    addLog('🔄 Parsing Arduino code...');
    
    try {
      // Parse the actual code from the editor
      console.log('SimulatorContext: About to parse code with ArduinoCodeParser');
      const parseResult = codeParserRef.current.parseCode(currentCode);
      console.log('SimulatorContext: Parse result:', parseResult);
      
      const setupInstructions = codeParserRef.current.getSetupInstructions();
      const loopInstructions = codeParserRef.current.getLoopInstructions();
      
      console.log('SimulatorContext: Setup instructions:', setupInstructions);
      console.log('SimulatorContext: Loop instructions:', loopInstructions);
      
      // DEBUG: Log what parser found
      console.log('DEBUG Parser Results:', { 
        setupLines: parseResult.setup?.length, 
        loopLines: parseResult.loop?.length,
        setupInstructions: setupInstructions.length, 
        loopInstructions: loopInstructions.length 
      });
      console.log('DEBUG Raw Loop Lines:', parseResult.loop);
      
      if (!parseResult || (!setupInstructions.length && !loopInstructions.length)) {
        addLog('❌ Error: ArduinoCodeParser failed to extract any instructions');
        console.log('SimulatorContext: Parser returned empty instructions');
        return;
      }
      
      addLog(`📋 Found ${parseResult.setup?.length || 0} lines in setup(), ${parseResult.loop?.length || 0} lines in loop()`);
      addLog(`✅ Code parsed: ${setupInstructions.length} setup instructions, ${loopInstructions.length} loop instructions`);
      
      // Initialize execution state
      executionStateRef.current = {
        phase: 'setup',
        setupIndex: 0,
        loopIndex: 0,
        setupInstructions,
        loopInstructions,
        loopCount: 0
      };
      
      // Define the instruction execution function
      const executeInstruction = (instruction) => {
        console.log('executeInstruction called with:', instruction);
        const timestamp = new Date().toLocaleTimeString();
        
        if (instruction.instruction.includes('pinMode')) {
          const pinNumber = instruction.pin;
          
          // Guard against null pin numbers from failed variable resolution
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → pinMode(UNKNOWN_PIN, ...) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping pinMode with null pin number`);
            return;
          }
          
          addLog(`[${timestamp}] → Pin ${pinNumber} configured as ${instruction.instruction.includes('OUTPUT') ? 'OUTPUT' : 'INPUT'}`);
        }

        if (instruction.instruction.includes('digitalWrite')) {
          const isHigh = instruction.value === 'HIGH';
          const pinNumber = instruction.pin;
          
          // Guard against null pin numbers from failed variable resolution
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → digitalWrite(UNKNOWN_PIN, ${instruction.value}) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping digitalWrite with null pin number`);
            return;
          }
          
          const voltage = instruction.value === 'HIGH' ? '5V' : '0V';
          addLog(`[${timestamp}] → Pin ${pinNumber} set to ${instruction.value} (${voltage})`);
          
          // Update Hero Board pin 13 state for built-in LED blinking
          if (pinNumber === 13) {
            console.log(`[Simulator] Setting Hero Board pin 13 to ${isHigh ? 'HIGH' : 'LOW'}`);
            
            // Find all Hero Board components and update their pin 13 state
            console.log(`[Simulator] Looking for Hero Boards in components:`, components.map(c => `${c.id}(${c.type})`));
            console.log(`[Simulator] Available component states:`, Object.keys(componentStates));
            
            // First try to find actual Hero Board components
            const heroBoardComponents = components.filter(c => 
              c.type === 'heroboard' || c.id.includes('heroboard') || c.type === 'hero-board'
            );
            
            if (heroBoardComponents.length > 0) {
              heroBoardComponents.forEach(component => {
                updateComponentState(component.id, { 
                  pin13: isHigh,
                  pins: { ...componentStates[component.id]?.pins, '13': isHigh }
                });
                console.log(`[Simulator] Updated Hero Board ${component.id} pin 13 state to ${isHigh}`);
              });
            } else {
              // If no Hero Boards found, create a global pin state that Hero Boards can read
              console.log(`[Simulator] No Hero Board found, creating global pin 13 state`);
              // Use a global state approach that Hero Board can monitor
              if (!window.arduinoSimulatorState) window.arduinoSimulatorState = {};
              window.arduinoSimulatorState.pin13 = isHigh;
              
              // Dispatch custom event for Hero Board to listen to
              const event = new CustomEvent('arduinoPinChange', {
                detail: { pin: 13, value: isHigh }
              });
              document.dispatchEvent(event);
            }
          }
          
          // Update external LED components connected to any pin via wires
          console.log(`[Simulator] Looking for LEDs connected to pin ${pinNumber}`);
          console.log(`[Simulator] Available wires:`, wires.length);
          console.log(`[Simulator] Available components:`, components.map(c => `${c.id}(${c.type})`));
          
          // Find LEDs and RGB LEDs connected to this pin through wires
          const connectedComponents = [];
          
          // Extract LED and RGB LED IDs from wire data
          const componentIdsFromWires = new Set();
          wires.forEach(wire => {
            if (wire.sourceComponent && (wire.sourceComponent.includes('led') || wire.sourceComponent.includes('rgb'))) {
              componentIdsFromWires.add(wire.sourceComponent);
            }
            if (wire.targetComponent && (wire.targetComponent.includes('led') || wire.targetComponent.includes('rgb'))) {
              componentIdsFromWires.add(wire.targetComponent);
            }
          });
          
          console.log(`[Simulator] LED/RGB LED IDs found in wires:`, Array.from(componentIdsFromWires));
          
          // Check each component found in wires
          componentIdsFromWires.forEach(componentId => {
            // Find wires connected to this component
            const componentWires = wires.filter(wire => 
              wire.sourceComponent === componentId || wire.targetComponent === componentId
            );
            
            console.log(`[Simulator] Component ${componentId} has ${componentWires.length} wires:`, componentWires);
            
            // Check if any wire connects this component to the pin we're setting
            componentWires.forEach(wire => {
              const isConnectedToPin = (
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString()) ||
                (wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}`) ||
                (wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (isConnectedToPin) {
                // Determine which pin on the component this wire connects to
                const componentPinName = wire.sourceComponent === componentId ? wire.sourceName : wire.targetName;
                
                connectedComponents.push({ 
                  id: componentId, 
                  type: componentId.includes('rgb') ? 'rgbled' : 'led',
                  pinName: componentPinName
                });
                console.log(`[Simulator] Found component ${componentId} connected to pin ${pinNumber} via wire (component pin: ${componentPinName})`);
              }
            });
          });
          
          // Update all connected components
          connectedComponents.forEach(component => {
            if (component.type === 'rgbled') {
              // Handle RGB LED with separate color channels
              console.log(`[Simulator] Handling RGB LED ${component.id}, pin: ${component.pinName}, state: ${isHigh}`);
              
              const currentState = componentStates[component.id] || { ledRed: 0, ledGreen: 0, ledBlue: 0 };
              const newState = { ...currentState };
              
              // Map pin names to color channels (various naming conventions)
              const pinName = component.pinName.toLowerCase();
              if (pinName.includes('r') || pinName === 'red') {
                newState.ledRed = isHigh ? 1.0 : 0.0;
                addLog(`[${timestamp}] → RGB LED ${component.id} RED channel: ${isHigh ? 'ON' : 'OFF'}`);
              } else if (pinName.includes('g') || pinName === 'green') {
                newState.ledGreen = isHigh ? 1.0 : 0.0;
                addLog(`[${timestamp}] → RGB LED ${component.id} GREEN channel: ${isHigh ? 'ON' : 'OFF'}`);
              } else if (pinName.includes('b') || pinName === 'blue') {
                newState.ledBlue = isHigh ? 1.0 : 0.0;
                addLog(`[${timestamp}] → RGB LED ${component.id} BLUE channel: ${isHigh ? 'ON' : 'OFF'}`);
              }
              
              updateComponentState(component.id, newState);
              console.log(`[Simulator] Updated RGB LED ${component.id} state:`, newState);
              
            } else {
              // Handle regular LED
              updateComponentState(component.id, { 
                isOn: isHigh,
                brightness: isHigh ? 1.0 : 0.0,
                voltage: isHigh ? 5 : 0
              });
              addLog(`[${timestamp}] → LED ${component.id} turned ${isHigh ? 'ON' : 'OFF'}`);
              console.log(`[Simulator] Updated LED ${component.id} state: isOn=${isHigh}`);
            }
          });
          
          if (connectedComponents.length === 0) {
            console.log(`[Simulator] No LEDs found connected to pin ${pinNumber}`);
            console.log(`[Simulator] Available LED components:`, components.filter(c => c.type === 'led' || c.id.includes('led')));
            console.log(`[Simulator] Checking wires for pin ${pinNumber}...`);
            wires.forEach((wire, i) => {
              console.log(`[Simulator] Wire ${i}: ${wire.sourceComponent}(${wire.sourceName}) → ${wire.targetComponent}(${wire.targetName})`);
            });
          }
        }

        if (instruction.instruction.includes('analogWrite')) {
          const pwmValue = instruction.value;
          const pinNumber = instruction.pin;
          const brightness = pwmValue / 255; // Convert 0-255 to 0-1
          const percentage = Math.round(brightness * 100);
          
          // Guard against null pin numbers from failed variable resolution
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → analogWrite(UNKNOWN_PIN, ${pwmValue}) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping analogWrite with null pin number`);
            return;
          }
          
          addLog(`[${timestamp}] → Pin ${pinNumber} PWM set to ${pwmValue}/255 (${percentage}%)`);
          
          // Find LEDs and RGB LEDs connected to this pin through wires
          const connectedComponents = [];
          
          // Extract LED and RGB LED IDs from wire data
          const componentIdsFromWires = new Set();
          wires.forEach(wire => {
            if (wire.sourceComponent && (wire.sourceComponent.includes('led') || wire.sourceComponent.includes('rgb'))) {
              componentIdsFromWires.add(wire.sourceComponent);
            }
            if (wire.targetComponent && (wire.targetComponent.includes('led') || wire.targetComponent.includes('rgb'))) {
              componentIdsFromWires.add(wire.targetComponent);
            }
          });
          
          console.log(`[Simulator] analogWrite: LED/RGB LED IDs found in wires:`, Array.from(componentIdsFromWires));
          
          // Check each component found in wires
          componentIdsFromWires.forEach(componentId => {
            // Find wires connected to this component
            const componentWires = wires.filter(wire => 
              wire.sourceComponent === componentId || wire.targetComponent === componentId
            );
            
            console.log(`[Simulator] analogWrite: Component ${componentId} has ${componentWires.length} wires:`, componentWires);
            
            // Check if any wire connects this component to the pin we're setting
            componentWires.forEach(wire => {
              const isConnectedToPin = (
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString()) ||
                (wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}`) ||
                (wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (isConnectedToPin) {
                // Determine which pin on the component this wire connects to
                const componentPinName = wire.sourceComponent === componentId ? wire.sourceName : wire.targetName;
                
                connectedComponents.push({ 
                  id: componentId, 
                  type: componentId.includes('rgb') ? 'rgbled' : 'led',
                  pinName: componentPinName
                });
                console.log(`[Simulator] analogWrite: Found component ${componentId} connected to pin ${pinNumber} via wire (component pin: ${componentPinName})`);
              }
            });
          });
          
          // Update all connected components
          connectedComponents.forEach(component => {
            if (component.type === 'rgbled') {
              // Handle RGB LED with PWM color channels
              console.log(`[Simulator] analogWrite: Handling RGB LED ${component.id}, pin: ${component.pinName}, PWM: ${pwmValue}`);
              
              const currentState = componentStates[component.id] || { ledRed: 0, ledGreen: 0, ledBlue: 0 };
              const newState = { ...currentState };
              
              // Map pin names to color channels (various naming conventions)
              const pinName = component.pinName.toLowerCase();
              if (pinName.includes('r') || pinName === 'red') {
                newState.ledRed = brightness;
                addLog(`[${timestamp}] → RGB LED ${component.id} RED channel: ${percentage}% (${pwmValue}/255)`);
              } else if (pinName.includes('g') || pinName === 'green') {
                newState.ledGreen = brightness;
                addLog(`[${timestamp}] → RGB LED ${component.id} GREEN channel: ${percentage}% (${pwmValue}/255)`);
              } else if (pinName.includes('b') || pinName === 'blue') {
                newState.ledBlue = brightness;
                addLog(`[${timestamp}] → RGB LED ${component.id} BLUE channel: ${percentage}% (${pwmValue}/255)`);
              }
              
              updateComponentState(component.id, newState);
              console.log(`[Simulator] analogWrite: Updated RGB LED ${component.id} state:`, newState);
              
            } else {
              // Handle regular LED with PWM brightness
              const isOn = pwmValue > 0;
              updateComponentState(component.id, { 
                isOn: isOn,
                brightness: brightness,
                pwmValue: pwmValue,
                voltage: brightness * 5 // Scale voltage based on PWM
              });
              addLog(`[${timestamp}] → LED ${component.id} brightness: ${percentage}% (${pwmValue}/255)`);
              console.log(`[Simulator] analogWrite: Updated LED ${component.id} state: brightness=${brightness}, pwmValue=${pwmValue}`);
            }
          });
          
          if (connectedComponents.length === 0) {
            console.log(`[Simulator] analogWrite: No LEDs found connected to pin ${pinNumber}`);
          }
        }

        if (instruction.instruction.includes('delay')) {
          addLog(`[${timestamp}] → Waiting ${instruction.delayMs}ms...`);
          return instruction.delayMs;
        }

        if (instruction.instruction.includes('Serial.print')) {
          addLog(`[${timestamp}] → Serial: ${instruction.instruction}`);
        }

        return 0;
      };

      setIsRunning(true);
      addLog('🔧 Starting Arduino execution...');
      addLog('⚡ Entering setup() function');
      
      // Start the execution loop
      const executeNextInstruction = () => {
        const state = executionStateRef.current;
        console.log('executeNextInstruction called, state.phase:', state.phase);
        
        if (state.phase === 'stopped') {
          console.log('executeNextInstruction: stopped because phase is stopped');
          return;
        }
        
        console.log('executeNextInstruction: current state:', state);
        
        if (state.phase === 'setup') {
          if (state.setupIndex < state.setupInstructions.length) {
            const instruction = state.setupInstructions[state.setupIndex];
            addLog(`[Setup] Line ${instruction.lineNumber}: ${instruction.instruction}`);
            const delayMs = executeInstruction(instruction);
            state.setupIndex++;
            
            setTimeout(() => {
              if (executionStateRef.current.phase !== 'stopped') executeNextInstruction();
            }, delayMs || 300); // Slower for readability
          } else {
            // Setup complete, move to loop
            state.phase = 'loop';
            state.loopCount = 1;
            addLog('✅ setup() completed');
            addLog('🔄 Entering loop() function');
            executeNextInstruction();
          }
        } else if (state.phase === 'loop') {
          if (state.loopInstructions.length === 0) {
            addLog('⚠️ loop() function is empty');
            return;
          }
          
          if (state.loopIndex < state.loopInstructions.length) {
            const instruction = state.loopInstructions[state.loopIndex];
            addLog(`[Loop ${state.loopCount}] Line ${instruction.lineNumber}: ${instruction.instruction}`);
            const delayMs = executeInstruction(instruction);
            state.loopIndex++;
            
            setTimeout(() => {
              if (executionStateRef.current.phase !== 'stopped') executeNextInstruction();
            }, delayMs || 300);
          } else {
            // Loop complete, restart
            state.loopIndex = 0;
            state.loopCount++;
            addLog(`🔄 loop() iteration ${state.loopCount} starting`);
            executeNextInstruction();
          }
        }
      };
      
      console.log('About to call executeNextInstruction for the first time, isRunning:', isRunning);
      setTimeout(() => executeNextInstruction(), 100); // Small delay to ensure state is set
      
    } catch (error) {
      addLog(`❌ Code parsing error: ${error.message}`);
    }
  };
  
  // Function to stop the simulation
  const stopSimulation = () => {
    addLog('🛑 Stopping Arduino simulation...');
    setIsRunning(false);
    
    // Reset execution state
    executionStateRef.current = {
      phase: 'stopped',
      setupIndex: 0,
      loopIndex: 0,
      setupInstructions: [],
      loopInstructions: [],
      loopCount: 0
    };
    
    // Stop the AVR8JS simulation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Reset CPU if it exists
    if (cpuRef.current) {
      cpuRef.current.reset();
    }
    
    // Reset all component states when stopping
    components.forEach(component => {
      if (component.type === 'led' || component.id.includes('led')) {
        updateComponentState(component.id, { 
          isOn: false,
          brightness: 0.0 
        });
        addLog(`💡 LED ${component.id} turned OFF`);
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