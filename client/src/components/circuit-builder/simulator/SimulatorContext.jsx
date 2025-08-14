import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { CPU, AVRIOPort, portBConfig } from 'avr8js';
import { ArduinoCodeParser } from './ArduinoCodeParser';

// Create a context for the simulator
const SimulatorContext = createContext({
  code: '',
  logs: [],
  serialLogs: [],
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
      const delayMs = instruction.delayMs;
      addLog(`[${timestamp}] → Waiting ${delayMs}ms...`);
      console.log(`OUTER executeInstruction: delay found, delayMs = ${delayMs}, instruction =`, instruction);
      console.log(`OUTER executeInstruction: returning delay value: ${delayMs}`);
      return delayMs;
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
      // Parse the actual code from the editor please fucking work fuck you holy shit fuck 
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
        
        // Debug all possible instruction types
        console.log(`executeInstruction: instruction.instruction = "${instruction.instruction}"`);
        console.log(`executeInstruction: instruction.delayMs = ${instruction.delayMs}`);
        console.log(`executeInstruction: instruction includes delay? ${instruction.instruction.includes('delay')}`);
        console.log(`executeInstruction: has delayMs? ${!!instruction.delayMs}`);
        
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
          
          // First try the old method - direct connections (backward compatibility)
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
          
          // Check each LED component found in wires
          componentIdsFromWires.forEach(componentId => {
            // Find wires connected to this component
            const componentWires = wires.filter(wire => 
              wire.sourceComponent === componentId || wire.targetComponent === componentId
            );
            
            console.log(`[Simulator] Component ${componentId} has ${componentWires.length} wires:`, componentWires);
            
            // Check if any wire connects this component directly to the pin
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
                console.log(`[Simulator] Found component ${componentId} connected directly to pin ${pinNumber} via wire (component pin: ${componentPinName})`);
              }
            });
            
            // If no direct connection found, try multi-hop tracing through resistors
            if (connectedComponents.filter(c => c.id === componentId).length === 0) {
              console.log(`[Simulator] No direct connection for ${componentId}, trying multi-hop trace...`);
              
              // Find if this LED is connected through resistors to the target pin
              const ledWires = wires.filter(wire => 
                wire.sourceComponent === componentId || wire.targetComponent === componentId
              );
              
              for (const ledWire of ledWires) {
                // Extract resistor ID from wire endpoint data since targetComponent might be undefined
                let resistorId = null;
                
                if (ledWire.targetId && ledWire.targetId.includes('resistor')) {
                  const match = ledWire.targetId.match(/pt-resistor-([^-]+)-/);
                  if (match) {
                    resistorId = match[1]; // Extract just the unique ID part (u4yl4n44)
                  }
                } else if (ledWire.sourceId && ledWire.sourceId.includes('resistor')) {
                  const match = ledWire.sourceId.match(/pt-resistor-([^-]+)-/);
                  if (match) {
                    resistorId = match[1]; // Extract just the unique ID part (u4yl4n44)
                  }
                }
                
                if (resistorId) {
                  console.log(`[Simulator] ${componentId} connects through resistor ${resistorId}`);
                  
                  // Now find ALL wires that connect to this resistor (by checking wire IDs, not component fields)
                  const resistorWires = wires.filter(wire => 
                    (wire.sourceId?.includes(resistorId) || wire.targetId?.includes(resistorId)) &&
                    wire.id !== ledWire.id
                  );
                  
                  console.log(`[Simulator] Found ${resistorWires.length} other wires connected to resistor ${resistorId}`);
                  
                  for (const resistorWire of resistorWires) {
                    const pinConnected = (
                      resistorWire.sourceName === pinNumber.toString() || 
                      resistorWire.targetName === pinNumber.toString() ||
                      resistorWire.sourceName === `pin-${pinNumber}` || 
                      resistorWire.targetName === `pin-${pinNumber}` ||
                      resistorWire.sourceName === `${pinNumber}` || 
                      resistorWire.targetName === `${pinNumber}`
                    );
                    
                    console.log(`[Simulator] Checking resistor connection: ${resistorWire.sourceComponent || 'unknown'}(${resistorWire.sourceName}) → ${resistorWire.targetComponent || 'unknown'}(${resistorWire.targetName}), connects to pin ${pinNumber}: ${pinConnected}`);
                    
                    if (pinConnected) {
                      const componentPinName = ledWire.sourceComponent === componentId ? ledWire.sourceName : ledWire.targetName;
                      connectedComponents.push({ 
                        id: componentId, 
                        type: componentId.includes('rgb') ? 'rgbled' : 'led',
                        pinName: componentPinName
                      });
                      console.log(`[Simulator] SUCCESS: Found component ${componentId} connected to pin ${pinNumber} through resistor ${resistorId}`);
                      break;
                    }
                  }
                }
              }
            }
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

        if (instruction.instruction.includes('delayMicroseconds')) {
          const microseconds = instruction.delayMicros;
          const milliseconds = microseconds / 1000;
          addLog(`[${timestamp}] → Waiting ${microseconds}μs (${milliseconds.toFixed(2)}ms)...`);
          return Math.max(1, milliseconds); // Minimum 1ms delay for visibility
        }

        // Handle delay instructions - check both instruction text and delayMs property
        if (instruction.instruction.includes('delay') || instruction.delayMs) {
          const delayMs = instruction.delayMs;
          addLog(`[${timestamp}] → Waiting ${delayMs}ms...`);
          console.log(`executeInstruction: delay instruction found, delayMs = ${delayMs}, instruction =`, instruction);
          console.log(`executeInstruction: returning delay value: ${delayMs}`);
          return delayMs;
        }

        if (instruction.function === 'digitalRead') {
          const pinNumber = instruction.pin;
          
          // Guard against null pin numbers
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → digitalRead(UNKNOWN_PIN) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping digitalRead with null pin number`);
            return 0;
          }
          
          // Check for DipSwitch components connected to this pin
          let readValue = 'LOW'; // Default to LOW if no components found
          
          // Look for DipSwitch components connected to this pin
          components.forEach(component => {
            if (component.type === 'dip-switch-3' || component.id.includes('dip-switch')) {
              // Find wires connected to this DipSwitch and the target pin
              const dipSwitchWires = wires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (dipSwitchWires.length > 0) {
                // Get the DipSwitch state from component states
                const dipSwitchState = componentStates[component.id];
                if (dipSwitchState && dipSwitchState.value) {
                  // Check which switch position corresponds to this pin
                  // DipSwitch has 3 positions, we'll map them to different pins or use switch index
                  const switchValues = dipSwitchState.value; // Array of [bool, bool, bool]
                  
                  // For now, use the first switch (index 0) - can be enhanced to map specific switches to pins
                  const isHighState = switchValues[0]; 
                  readValue = isHighState ? 'HIGH' : 'LOW';
                  
                  console.log(`[Simulator] digitalRead(${pinNumber}) reading from DipSwitch ${component.id}: switch[0] = ${isHighState} → ${readValue}`);
                  addLog(`[${timestamp}] → digitalRead(${pinNumber}) reading DipSwitch: ${readValue}`);
                  return 0;
                }
              }
            }
          });
          
          // Look for Keypad components connected to this pin
          components.forEach(component => {
            if (component.type === 'keypad' || component.id.includes('keypad')) {
              const keypadWires = wires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (keypadWires.length > 0) {
                const keypadState = componentStates[component.id];
                if (keypadState && keypadState.pressedKey) {
                  // Simulate key matrix scanning - for now, return HIGH if any key is pressed
                  readValue = 'HIGH';
                  console.log(`[Simulator] digitalRead(${pinNumber}) reading from Keypad ${component.id}: key pressed = ${keypadState.pressedKey} → ${readValue}`);
                  addLog(`[${timestamp}] → digitalRead(${pinNumber}) reading Keypad: ${readValue} (key: ${keypadState.pressedKey})`);
                  return 0;
                }
              }
            }
          });
          
          // Look for RotaryEncoder button press
          components.forEach(component => {
            if (component.type === 'rotary-encoder' || component.id.includes('rotary-encoder')) {
              const encoderWires = wires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (encoderWires.length > 0) {
                const encoderState = componentStates[component.id];
                if (encoderState && encoderState.buttonPressed) {
                  readValue = 'HIGH';
                  console.log(`[Simulator] digitalRead(${pinNumber}) reading from RotaryEncoder button ${component.id}: pressed = ${readValue}`);
                  addLog(`[${timestamp}] → digitalRead(${pinNumber}) reading RotaryEncoder button: ${readValue}`);
                  return 0;
                }
              }
            }
          });
          
          // If no input components found, return default LOW
          addLog(`[${timestamp}] → digitalRead(${pinNumber}) returned ${readValue}`);
          console.log(`[Simulator] digitalRead(${pinNumber}) no input components connected, returning default: ${readValue}`);
          return 0;
        }

        if (instruction.function === 'analogRead') {
          const pinNumber = instruction.pin;
          
          // Guard against null pin numbers
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → analogRead(UNKNOWN_PIN) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping analogRead with null pin number`);
            return 0;
          }
          
          let readValue = 0; // Default to 0 if no components found
          
          // Use the latest components and wires data from global storage
          const latestComponents = window.latestSimulatorData?.components || components;
          const latestWires = window.latestSimulatorData?.wires || wires;
          
          console.log(`[Simulator] ====== analogRead(${pinNumber}) DETAILED DEBUG ======`);
          console.log(`[Simulator] CLOSURE - components.length:`, components.length);
          console.log(`[Simulator] CLOSURE - wires.length:`, wires.length);
          console.log(`[Simulator] LATEST - components.length:`, latestComponents.length);
          console.log(`[Simulator] LATEST - wires.length:`, latestWires.length);
          console.log(`[Simulator] Using LATEST components:`, latestComponents.map(c => ({ id: c.id, type: c.type, props: c.props })));
          console.log(`[Simulator] Using LATEST wires:`, latestWires.map(w => ({ 
            id: w.id, 
            source: w.sourceComponent, 
            target: w.targetComponent, 
            sourceName: w.sourceName, 
            targetName: w.targetName 
          })));
          
          // Look for Photoresistor components connected to this pin
          latestComponents.forEach(component => {
            if (component.type === 'photoresistor' || component.id.includes('photoresistor')) {
              console.log(`[Simulator] Found photoresistor component: ${component.id} (type: ${component.type})`);
              
              // Find wires connected to this Photoresistor and the target pin
              // Pin 14 = A0, Pin 15 = A1, etc.
              const analogPinName = `A${pinNumber - 14}`;
              const photoresistorWires = latestWires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === analogPinName || wire.targetName === analogPinName ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              console.log(`[Simulator] Photoresistor ${component.id} has ${photoresistorWires.length} exact wires:`, photoresistorWires.map(w => `${w.sourceName} -> ${w.targetName}`));
              console.log(`[Simulator] Looking for pin ${pinNumber} (analog pin ${analogPinName})`);
              
              // If no wires matched exactly, try more flexible matching
              let finalPhotoresistorWires = photoresistorWires;
              if (finalPhotoresistorWires.length === 0) {
                const flexibleWires = latestWires.filter(wire => 
                  (wire.sourceComponent === component.id || wire.targetComponent === component.id)
                );
                console.log(`[Simulator] Flexible match - photoresistor has ${flexibleWires.length} total wires:`, flexibleWires);
                finalPhotoresistorWires = flexibleWires; // Use any wire connected to photoresistor
              }
              
              if (finalPhotoresistorWires.length > 0) {
                // Get the current light level from the component props (updated by the Properties panel)
                const lightLevelPercent = component.props?.lightLevel || 50;
                // Convert percentage (0-100) to analog value (0-1023), so high light = high value
                const lightLevel = Math.round((lightLevelPercent / 100) * 1023);
                
                console.log(`[Simulator] analogRead(${pinNumber}) reading from Photoresistor ${component.id}: lightLevel = ${lightLevel} (${lightLevelPercent}%)`);
                addLog(`[${timestamp}] → analogRead(${pinNumber}) returned ${lightLevel} (${(lightLevel/1023*5).toFixed(2)}V from ${lightLevelPercent}% light)`);
                
                // Store the value for variable assignment
                executionStateRef.current.lastAnalogValue = lightLevel;
                return lightLevel;
              }
            }
          });
          
          // Look for RotaryEncoder components connected to this pin
          latestComponents.forEach(component => {
            if (component.type === 'rotary-encoder' || component.id.includes('rotary-encoder')) {
              const encoderWires = latestWires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === `A${pinNumber}` || wire.targetName === `A${pinNumber}` ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (encoderWires.length > 0) {
                const encoderState = componentStates[component.id];
                if (encoderState && encoderState.position !== undefined) {
                  readValue = Math.abs(encoderState.position) % 1024; // Convert position to 0-1023 range
                  console.log(`[Simulator] analogRead(${pinNumber}) reading from RotaryEncoder ${component.id}: position = ${encoderState.position} → ${readValue}`);
                  addLog(`[${timestamp}] → analogRead(${pinNumber}) reading RotaryEncoder: ${readValue}`);
                  // Store the value for variable assignment
                  executionStateRef.current.lastAnalogValue = readValue;
                  return readValue;
                }
              }
            }
          });
          
          // If no analog components found, return default reading
          addLog(`[${timestamp}] → analogRead(${pinNumber}) returned ${readValue} (${(readValue/1023*5).toFixed(2)}V)`);
          console.log(`[Simulator] analogRead(${pinNumber}) no analog components connected, returning default: ${readValue}`);
          // Store the value for variable assignment
          executionStateRef.current.lastAnalogValue = readValue;
          return readValue;
        }

        if (instruction.function === 'map') {
          const { value, fromLow, fromHigh, toLow, toHigh } = instruction.params;
          const mappedValue = Math.round(toLow + (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow));
          addLog(`[${timestamp}] → map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh}) returned ${mappedValue}`);
          return 0;
        }

        if (instruction.function === 'constrain') {
          const { value, min, max } = instruction.params;
          const constrainedValue = Math.max(min, Math.min(max, value));
          addLog(`[${timestamp}] → constrain(${value}, ${min}, ${max}) returned ${constrainedValue}`);
          return 0;
        }

        if (instruction.function === 'random') {
          const { min, max } = instruction.params;
          const randomValue = Math.floor(Math.random() * (max - min)) + min;
          addLog(`[${timestamp}] → random(${min === 0 ? max : `${min}, ${max}`}) returned ${randomValue}`);
          return 0;
        }

        if (instruction.function === 'millis') {
          // Calculate simulated millis based on execution time
          const currentTime = Date.now();
          if (!executionStateRef.current.startTime) {
            executionStateRef.current.startTime = currentTime;
          }
          const elapsedMs = currentTime - executionStateRef.current.startTime;
          addLog(`[${timestamp}] → millis() returned ${elapsedMs}`);
          return 0;
        }

        if (instruction.function === 'micros') {
          // Calculate simulated micros based on execution time
          const currentTime = Date.now();
          if (!executionStateRef.current.startTime) {
            executionStateRef.current.startTime = currentTime;
          }
          const elapsedMicros = (currentTime - executionStateRef.current.startTime) * 1000;
          addLog(`[${timestamp}] → micros() returned ${elapsedMicros}`);
          return 0;
        }

        if (instruction.function === 'tone') {
          const pinNumber = instruction.pin;
          const { frequency, duration } = instruction.params;
          
          // Guard against null pin numbers
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → tone(UNKNOWN_PIN, ${frequency}Hz) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping tone with null pin number`);
            return 0;
          }
          
          // Look for Buzzer components connected to this pin
          components.forEach(component => {
            if (component.type === 'buzzer' || component.id.includes('buzzer')) {
              const buzzerWires = wires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (buzzerWires.length > 0) {
                // Update buzzer state with tone information
                updateComponentState(component.id, { 
                  isPlaying: true,
                  frequency: frequency,
                  duration: duration || null,
                  type: 'buzzer'
                });
                console.log(`[Simulator] tone(${pinNumber}, ${frequency}Hz${duration ? `, ${duration}ms` : ''}) → Buzzer ${component.id}`);
                
                // Schedule automatic stop if duration is specified
                if (duration) {
                  setTimeout(() => {
                    updateComponentState(component.id, { 
                      isPlaying: false,
                      frequency: 0,
                      duration: null,
                      type: 'buzzer'
                    });
                    console.log(`[Simulator] Buzzer ${component.id} stopped after ${duration}ms`);
                  }, duration);
                }
              }
            }
          });
          
          if (duration) {
            addLog(`[${timestamp}] → tone(${pinNumber}, ${frequency}Hz, ${duration}ms) - Playing tone`);
          } else {
            addLog(`[${timestamp}] → tone(${pinNumber}, ${frequency}Hz) - Playing continuous tone`);
          }
          return 0;
        }

        if (instruction.function === 'noTone') {
          const pinNumber = instruction.pin;
          
          // Guard against null pin numbers
          if (pinNumber === null || pinNumber === undefined) {
            addLog(`[${timestamp}] → noTone(UNKNOWN_PIN) - Pin variable not resolved`);
            console.warn(`[Simulator] Skipping noTone with null pin number`);
            return 0;
          }
          
          // Look for Buzzer components connected to this pin and stop them
          components.forEach(component => {
            if (component.type === 'buzzer' || component.id.includes('buzzer')) {
              const buzzerWires = wires.filter(wire => 
                (wire.sourceComponent === component.id || wire.targetComponent === component.id) &&
                (wire.sourceName === pinNumber.toString() || wire.targetName === pinNumber.toString() ||
                 wire.sourceName === `pin-${pinNumber}` || wire.targetName === `pin-${pinNumber}` ||
                 wire.sourceName === `${pinNumber}` || wire.targetName === `${pinNumber}`)
              );
              
              if (buzzerWires.length > 0) {
                // Stop the buzzer
                updateComponentState(component.id, { 
                  isPlaying: false,
                  frequency: 0,
                  duration: null,
                  type: 'buzzer'
                });
                console.log(`[Simulator] noTone(${pinNumber}) → Stopped Buzzer ${component.id}`);
              }
            }
          });
          
          addLog(`[${timestamp}] → noTone(${pinNumber}) - Stopping tone`);
          return 0;
        }

        // Handle mathematical functions
        if (['abs', 'max', 'min', 'pow', 'sqrt', 'sq'].includes(instruction.function)) {
          const func = instruction.function;
          const params = instruction.params;
          let result;
          
          switch (func) {
            case 'abs':
              result = Math.abs(params[0]);
              break;
            case 'max':
              result = Math.max(...params);
              break;
            case 'min':
              result = Math.min(...params);
              break;
            case 'pow':
              result = Math.pow(params[0], params[1]);
              break;
            case 'sqrt':
              result = Math.sqrt(params[0]);
              break;
            case 'sq':
              result = params[0] * params[0];
              break;
            default:
              result = 0;
          }
          
          addLog(`[${timestamp}] → ${func}(${params.join(', ')}) returned ${result}`);
          return 0;
        }

        // Handle variable assignments
        if (instruction.function === 'assignment') {
          const { variable, value, type } = instruction;
          
          let finalValue = value;
          
          // Check if the value is a function call result (like analogRead)
          if (typeof value === 'string' && value.includes('analogRead')) {
            // Extract the pin number from analogRead call
            const pinMatch = value.match(/analogRead\s*\(\s*A?(\d+)\s*\)/);
            if (pinMatch) {
              const pinNumber = parseInt(pinMatch[1]) + 14; // A0 = pin 14, A1 = pin 15, etc.
              
              // Execute the analogRead call directly to get the current value
              const analogInstruction = { function: 'analogRead', pin: pinNumber, instruction: value };
              finalValue = executeInstruction(analogInstruction);
              
              console.log(`[Simulator] Assignment: ${variable} = ${value} -> executed analogRead and got ${finalValue}`);
            } else {
              // Fallback to last analog value
              finalValue = executionStateRef.current.lastAnalogValue || 0;
              console.log(`[Simulator] Assignment: ${variable} = analogRead() (fallback) -> ${finalValue}`);
            }
          } else if (typeof value === 'number') {
            finalValue = value;
            console.log(`[Simulator] Assignment: ${variable} = ${finalValue} (direct number)`);
          } else {
            console.log(`[Simulator] Assignment: ${variable} = ${value} (${typeof value})`);
          }
          
          // Store the variable in execution state for resolution in Serial.println
          if (!executionStateRef.current.variables) {
            executionStateRef.current.variables = new Map();
          }
          executionStateRef.current.variables.set(variable, finalValue);
          
          console.log(`[Simulator] Stored variable '${variable}' with value ${finalValue} (type: ${typeof finalValue})`);
          console.log(`[Simulator] Current variables map:`, Array.from(executionStateRef.current.variables.entries()));
          
          if (type) {
            addLog(`[${timestamp}] → Declared ${type} variable '${variable}' = ${finalValue}`);
          } else {
            addLog(`[${timestamp}] → Variable '${variable}' = ${finalValue}`);
          }
          return 0;
        }

        // Handle control structures (basic logging for now)
        if (instruction.function === 'if') {
          addLog(`[${timestamp}] → if (${instruction.condition}) - Evaluating condition`);
          return 0;
        }

        if (instruction.function === 'for') {
          addLog(`[${timestamp}] → for (${instruction.init}; ${instruction.condition}; ${instruction.increment}) - Starting loop`);
          return 0;
        }

        if (instruction.function === 'while') {
          addLog(`[${timestamp}] → while (${instruction.condition}) - Checking condition`);
          return 0;
        }

        // Handle else if statements
        if (instruction.function === 'elseif') {
          addLog(`[${timestamp}] → else if (${instruction.condition}) - Evaluating condition`);
          return 0;
        }

        // Handle else statements
        if (instruction.function === 'else') {
          addLog(`[${timestamp}] → else - Executing else block`);
          return 0;
        }

        // Handle switch statements
        if (instruction.function === 'switch') {
          addLog(`[${timestamp}] → switch (${instruction.variable}) - Switching on variable`);
          return 0;
        }

        // Handle case statements
        if (instruction.function === 'case') {
          addLog(`[${timestamp}] → case ${instruction.value}: - Checking case`);
          return 0;
        }

        // Handle default case
        if (instruction.function === 'default') {
          addLog(`[${timestamp}] → default: - Executing default case`);
          return 0;
        }

        // Handle break statements
        if (instruction.function === 'break') {
          addLog(`[${timestamp}] → break; - Breaking from loop/switch`);
          return 0;
        }

        // Handle increment/decrement operators
        if (instruction.function === 'increment') {
          const { variable, operator } = instruction;
          addLog(`[${timestamp}] → ${variable}${operator} - Incrementing/decrementing variable`);
          return 0;
        }

        // Handle array declarations
        if (instruction.function === 'arrayDeclaration') {
          const { type, variable, size } = instruction;
          addLog(`[${timestamp}] → Declared ${type} array '${variable}[${size}]'`);
          return 0;
        }

        // Handle array access
        if (instruction.function === 'arrayAccess') {
          const { array, index } = instruction;
          addLog(`[${timestamp}] → Accessing ${array}[${index}]`);
          return 0;
        }

        // Handle trigonometric functions
        if (['sin', 'cos', 'tan'].includes(instruction.function)) {
          const func = instruction.function;
          const angle = instruction.angle;
          let result;
          
          switch (func) {
            case 'sin':
              result = Math.sin(angle);
              break;
            case 'cos':
              result = Math.cos(angle);
              break;
            case 'tan':
              result = Math.tan(angle);
              break;
            default:
              result = 0;
          }
          
          addLog(`[${timestamp}] → ${func}(${angle}) returned ${result.toFixed(4)}`);
          return 0;
        }

        // Handle bit manipulation functions
        if (['bitRead', 'bitWrite', 'bitSet', 'bitClear'].includes(instruction.function)) {
          const func = instruction.function;
          const params = instruction.params;
          let result = 'executed';
          
          switch (func) {
            case 'bitRead':
              result = `bit ${params[1]} of ${params[0]} = ${(params[0] >> params[1]) & 1}`;
              break;
            case 'bitWrite':
              result = `set bit ${params[1]} of ${params[0]} to ${params[2]}`;
              break;
            case 'bitSet':
              result = `set bit ${params[1]} of ${params[0]} to 1`;
              break;
            case 'bitClear':
              result = `clear bit ${params[1]} of ${params[0]} to 0`;
              break;
          }
          
          addLog(`[${timestamp}] → ${func}(${params.join(', ')}) - ${result}`);
          return 0;
        }

        // Handle I2C/Wire library functions for OLED displays
        if (['Wire.begin', 'Wire.beginTransmission', 'Wire.write', 'Wire.endTransmission'].includes(instruction.function)) {
          const func = instruction.function;
          
          switch (func) {
            case 'Wire.begin':
              addLog(`[${timestamp}] → Wire.begin() - I2C initialized`);
              // Update all OLED displays to initialized state
              components.forEach(component => {
                if (component.type === 'oled-display' || component.id.includes('oled')) {
                  updateComponentState(component.id, { 
                    i2cInitialized: true,
                    type: 'oled-display'
                  });
                }
              });
              break;
            case 'Wire.beginTransmission':
              const address = instruction.params?.address || 0x3C;
              addLog(`[${timestamp}] → Wire.beginTransmission(0x${address.toString(16)}) - Starting I2C transmission`);
              break;
            case 'Wire.write':
              const data = instruction.params?.data || instruction.params?.value || 0;
              addLog(`[${timestamp}] → Wire.write(${data}) - Sending I2C data`);
              break;
            case 'Wire.endTransmission':
              addLog(`[${timestamp}] → Wire.endTransmission() - I2C transmission complete`);
              break;
          }
          return 0;
        }

        // Handle OLED display functions (U8g2 library)
        if (instruction.function && instruction.function.includes('display.')) {
          const func = instruction.function.replace('display.', '');
          
          // Look for OLED display components
          components.forEach(component => {
            if (component.type === 'oled-display' || component.id.includes('oled')) {
              const currentState = componentStates[component.id] || {};
              
              switch (func) {
                case 'begin':
                  updateComponentState(component.id, { 
                    ...currentState,
                    initialized: true,
                    type: 'oled-display'
                  });
                  addLog(`[${timestamp}] → display.begin() - OLED ${component.id} initialized`);
                  break;
                case 'clear':
                case 'clearBuffer':
                  updateComponentState(component.id, { 
                    ...currentState,
                    buffer: [],
                    type: 'oled-display'
                  });
                  addLog(`[${timestamp}] → display.${func}() - OLED ${component.id} cleared`);
                  break;
                case 'print':
                case 'println':
                  const text = instruction.params?.text || instruction.params?.value || '';
                  const currentBuffer = currentState.buffer || [];
                  updateComponentState(component.id, { 
                    ...currentState,
                    buffer: [...currentBuffer, text],
                    type: 'oled-display'
                  });
                  addLog(`[${timestamp}] → display.${func}("${text}") - Text added to OLED ${component.id}`);
                  break;
                case 'sendBuffer':
                case 'display':
                  addLog(`[${timestamp}] → display.${func}() - OLED ${component.id} display updated`);
                  break;
                case 'setFont':
                  const font = instruction.params?.font || 'default';
                  updateComponentState(component.id, { 
                    ...currentState,
                    font: font,
                    type: 'oled-display'
                  });
                  addLog(`[${timestamp}] → display.setFont(${font}) - OLED ${component.id} font set`);
                  break;
                case 'setCursor':
                  const x = instruction.params?.x || 0;
                  const y = instruction.params?.y || 0;
                  updateComponentState(component.id, { 
                    ...currentState,
                    cursorX: x,
                    cursorY: y,
                    type: 'oled-display'
                  });
                  addLog(`[${timestamp}] → display.setCursor(${x}, ${y}) - OLED ${component.id} cursor set`);
                  break;
              }
            }
          });
          return 0;
        }

        // Handle 7-segment display functions
        if (instruction.function && (instruction.function.includes('showNumberDec') || instruction.function.includes('setBrightness'))) {
          const func = instruction.function;
          
          // Look for 7-segment display components
          components.forEach(component => {
            if (component.type === 'segmented-display' || component.id.includes('segment')) {
              const currentState = componentStates[component.id] || {};
              
              if (func.includes('showNumberDec')) {
                const number = instruction.params?.number || instruction.params?.value || 0;
                updateComponentState(component.id, { 
                  ...currentState,
                  displayValue: number.toString(),
                  type: 'segmented-display'
                });
                addLog(`[${timestamp}] → ${func}(${number}) - 7-Segment ${component.id} showing "${number}"`);
              }
              
              if (func.includes('setBrightness')) {
                const brightness = instruction.params?.brightness || instruction.params?.value || 7;
                updateComponentState(component.id, { 
                  ...currentState,
                  brightness: brightness,
                  type: 'segmented-display'
                });
                addLog(`[${timestamp}] → ${func}(${brightness}) - 7-Segment ${component.id} brightness set`);
              }
            }
          });
          return 0;
        }

        // Handle Keypad library functions
        if (instruction.function && instruction.function.includes('keypad.')) {
          const func = instruction.function.replace('keypad.', '');
          
          if (func === 'getKey') {
            // Look for keypad components and return pressed key
            let pressedKey = null;
            components.forEach(component => {
              if (component.type === 'keypad' || component.id.includes('keypad')) {
                const keypadState = componentStates[component.id];
                if (keypadState && keypadState.pressedKey) {
                  pressedKey = keypadState.pressedKey;
                  addLog(`[${timestamp}] → keypad.getKey() returned '${pressedKey}' from ${component.id}`);
                }
              }
            });
            
            if (!pressedKey) {
              addLog(`[${timestamp}] → keypad.getKey() returned NO_KEY`);
            }
          }
          return 0;
        }

        // Handle return statements
        if (instruction.function === 'return') {
          addLog(`[${timestamp}] → return ${instruction.value}; - Returning from function`);
          return 0;
        }

        if (instruction.function === 'serial') {
          // Extract the actual message from Serial.print(message) or Serial.println(message)
          const serialMatch = instruction.instruction.match(/Serial\.print(?:ln)?\s*\((.*)\)/);
          if (serialMatch) {
            let message = serialMatch[1].trim();
            
            // Check if it's a variable reference (no quotes)
            if (!((message.startsWith('"') && message.endsWith('"')) || 
                  (message.startsWith("'") && message.endsWith("'")))) {
              // It's a variable - resolve it to its actual value
              const variables = executionStateRef.current.variables || new Map();
              const variableValue = variables.get(message);
              if (variableValue !== undefined) {
                message = variableValue.toString();
                console.log(`[Serial] Resolved variable '${serialMatch[1].trim()}' to value: ${message}`);
              } else {
                // If variable not found, it might be a direct function call like analogRead(A0)
                // For now, show the raw instruction and let user know
                console.log(`[Serial] Variable '${message}' not found, showing raw instruction`);
              }
            } else {
              // Remove quotes if it's a string literal
              message = message.slice(1, -1);
            }
            
            // Add to serial log (clean output like Arduino IDE)
            const isNewline = instruction.instruction.includes('println');
            addSerialLog(message, isNewline);
            
            // Also log for debugging (with timestamp)
            addLog(`[${timestamp}] → Serial.${isNewline ? 'println' : 'print'}(${message})`);
          }
          return 0;
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
            
            // Log the delay value for debugging
            console.log(`executeNextInstruction: setup delayMs returned = ${delayMs}, using timeout = ${delayMs || 300}ms`);
            
            setTimeout(() => {
              if (executionStateRef.current.phase !== 'stopped') {
                console.log(`executeNextInstruction called, state.phase:`, executionStateRef.current.phase);
                executeNextInstruction();
              }
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
            
            // Log the delay value for debugging
            console.log(`executeNextInstruction: delayMs returned = ${delayMs}, using timeout = ${delayMs || 300}ms`);
            
            setTimeout(() => {
              if (executionStateRef.current.phase !== 'stopped') {
                console.log(`executeNextInstruction called, state.phase:`, executionStateRef.current.phase);
                executeNextInstruction();
              }
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