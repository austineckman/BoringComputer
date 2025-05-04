import React, { useEffect, useState, useRef } from 'react';
import { 
  CPU, 
  AVRIOPort, 
  PinState, 
  portBConfig, 
  portCConfig, 
  portDConfig,
  usart0Config
} from 'avr8js';

/**
 * AVR8Simulator
 * 
 * Handles the simulation of AVR microcontroller using avr8js
 * Connects Arduino sketch code to the circuit components
 */
const AVR8Simulator = ({ 
  code, 
  isRunning, 
  onPinChange,
  components, 
  wires,
  onLog
}) => {
  // Simulator state
  const [cpu, setCpu] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [compiledProgram, setCompiledProgram] = useState(null);
  const timerRef = useRef(null);
  const lastCycleTimeRef = useRef(0);
  
  // Store component pin connections for quick lookup
  const [pinConnections, setPinConnections] = useState({});
  
  // Reference to ports for access outside useEffect
  const portsRef = useRef({
    portB: null,
    portC: null,
    portD: null
  });
  
  // Initialize the CPU and peripherals
  const initSimulation = () => {
    if (!compiledProgram) {
      console.log("No compiled program available");
      return;
    }

    // Create a new CPU
    const newCpu = new CPU(compiledProgram);
    
    // Create IO ports (same as Arduino UNO)
    const portB = new AVRIOPort(newCpu, portBConfig);
    const portC = new AVRIOPort(newCpu, portCConfig);
    const portD = new AVRIOPort(newCpu, portDConfig);
    
    // Store references to ports
    portsRef.current = { portB, portC, portD };
    
    // Set up event listeners for pin changes
    setupPinChangeListeners(portB, 'B');
    setupPinChangeListeners(portC, 'C');
    setupPinChangeListeners(portD, 'D');
    
    // TODO: Add other peripherals (USART, timers, etc.)
    
    setCpu(newCpu);
    
    // Log simulation initialization
    if (onLog) {
      onLog("AVR8 Simulation initialized");
    }
  };
  
  // Set up listeners for pin state changes
  const setupPinChangeListeners = (port, portName) => {
    // avr8js doesn't have a direct addPinChangeListener method in the way we're using it
    // Instead, we'll set up our own listener system by checking port values periodically
    
    // Store the initial pin states
    const initialStates = [];
    for (let i = 0; i < 8; i++) {
      // Use port.readValue() to get the current value of the pin
      initialStates[i] = port.outputRegister & (1 << i) ? PinState.High : PinState.Low;
    }
    
    // Every time the CPU executes, we'll check if pin states have changed
    port.cpu.onPostCycle = () => {
      for (let i = 0; i < 8; i++) {
        // Get the current pin state
        const currentState = port.outputRegister & (1 << i) ? PinState.High : PinState.Low;
        
        // Check if the state has changed
        if (currentState !== initialStates[i]) {
          initialStates[i] = currentState;
          
          // Map to Arduino pin and handle the state change
          const arduinoPin = mapPortPinToArduino(portName, i);
          if (arduinoPin !== null) {
            handlePinStateChange(arduinoPin, currentState);
          }
        }
      }
    };
  };
  
  // Map AVR port/pin to Arduino pin numbers
  const mapPortPinToArduino = (port, pin) => {
    // Arduino UNO pin mapping
    const mapping = {
      'B': {
        0: 8,  // PB0 -> D8
        1: 9,  // PB1 -> D9
        2: 10, // PB2 -> D10
        3: 11, // PB3 -> D11
        4: 12, // PB4 -> D12
        5: 13, // PB5 -> D13
      },
      'C': {
        0: 14, // PC0 -> A0
        1: 15, // PC1 -> A1
        2: 16, // PC2 -> A2
        3: 17, // PC3 -> A3
        4: 18, // PC4 -> A4
        5: 19, // PC5 -> A5
      },
      'D': {
        0: 0,  // PD0 -> D0 (RX)
        1: 1,  // PD1 -> D1 (TX)
        2: 2,  // PD2 -> D2
        3: 3,  // PD3 -> D3
        4: 4,  // PD4 -> D4
        5: 5,  // PD5 -> D5
        6: 6,  // PD6 -> D6
        7: 7,  // PD7 -> D7
      }
    };
    
    if (mapping[port] && mapping[port][pin] !== undefined) {
      return mapping[port][pin];
    }
    return null;
  };
  
  // Handle pin state changes from the CPU
  const handlePinStateChange = (pin, state) => {
    const isHigh = state === PinState.High;
    console.log(`Pin D${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
    
    // Call the onPinChange callback to update UI components
    if (onPinChange) {
      // Pass the pin number and state (true for HIGH, false for LOW)
      onPinChange(pin, isHigh);
    }
    
    // Check for connected components via wires
    const pinKey = `D${pin}`;
    const connectedPins = pinConnections[pinKey] || [];
    
    // Process connected components
    if (connectedPins.length > 0) {
      console.log(`Found ${connectedPins.length} connections for pin ${pinKey}`);
      
      // Update connected components
      connectedPins.forEach(connection => {
        // Parse the connection string - format is "componentId:pinName"
        const parts = connection.split(':');
        if (parts.length === 2) {
          const componentId = parts[0];
          const componentPin = parts[1];
          
          // This will propagate the signal to connected components
          console.log(`Propagating signal to ${componentId} pin ${componentPin}: ${isHigh ? 'HIGH' : 'LOW'}`);
          
          // Update the component state based on the signal
          // For example, if it's an LED connected to pin 13, turn it on when pin 13 is HIGH
          if (componentId.includes('led-')) {
            // Simplified LED update - in a full implementation, we would check pin polarities
            updateLEDComponent(componentId, componentPin, isHigh);
          } 
          else if (componentId.includes('buzzer-')) {
            // Update buzzer state
            updateBuzzerComponent(componentId, componentPin, isHigh);
          }
          // Add more component types as needed
        }
      });
    }
  };
  
  // Update LED component state when it receives a signal
  const updateLEDComponent = (ledId, pinName, isHigh) => {
    // Find the LED in the components list
    const led = components.find(c => c.id === ledId);
    if (!led) return;
    
    // We need to make sure this isn't directly modifying the components array
    const updatedLED = { ...led };
    
    // For a simple LED:
    // If the pin is the anode and isHigh, or pin is cathode and !isHigh, LED lights up
    // This implementation assumes we have a common ground
    if (pinName === 'anode' && isHigh) {
      console.log(`LED ${ledId} ON`);
      
      // Call the main onPinChange callback with component updates
      if (onPinChange) {
        onPinChange({ 
          componentId: ledId, 
          isLit: true 
        });
      }
    } else if (pinName === 'cathode' && !isHigh) {
      console.log(`LED ${ledId} ON`);
      
      // Call the main onPinChange callback with component updates
      if (onPinChange) {
        onPinChange({ 
          componentId: ledId, 
          isLit: true 
        });
      }
    } else {
      console.log(`LED ${ledId} OFF`);
      
      // Call the main onPinChange callback with component updates
      if (onPinChange) {
        onPinChange({ 
          componentId: ledId, 
          isLit: false 
        });
      }
    }
  };
  
  // Update Buzzer component state when it receives a signal
  const updateBuzzerComponent = (buzzerId, pinName, isHigh) => {
    // Similar to LED update logic, but for a buzzer
    // If the pin is the positive and isHigh, buzzer gets signal
    if (pinName === 'positive' && isHigh) {
      console.log(`Buzzer ${buzzerId} ON`);
      
      // Call the main onPinChange callback with component updates
      if (onPinChange) {
        onPinChange({ 
          componentId: buzzerId, 
          hasSignal: true 
        });
      }
    } else {
      console.log(`Buzzer ${buzzerId} OFF`);
      
      // Call the main onPinChange callback with component updates
      if (onPinChange) {
        onPinChange({ 
          componentId: buzzerId, 
          hasSignal: false 
        });
      }
    }
  };
  
  // Analyze the circuit and build connection map
  useEffect(() => {
    if (!wires || !components) return;
    
    // Build a map of pin connections
    const connections = {};
    
    // Function to parse pin ID
    const parsePinId = (pinId) => {
      // Format: componentType-uniqueId-pinName
      // Example: heroboard-123abc-D5, led-456def-anode
      const parts = pinId.split('-');
      if (parts.length < 3) return null;
      
      const componentType = parts[0];  // heroboard, led, etc.
      const componentId = `${parts[0]}-${parts[1]}`; // heroboard-123abc
      
      // The pin name might have dashes in it, so join the rest of the parts
      const pinName = parts.slice(2).join('-'); // D5, anode, etc.
      
      return { componentType, componentId, pinName };
    };
    
    // Function to check if a pin is a hero board pin
    const isHeroboardPin = (pinId) => {
      const parts = parsePinId(pinId);
      if (!parts) return false;
      return parts.componentType === 'heroboard' && 
            (parts.pinName.startsWith('D') || parts.pinName.startsWith('A'));
    };
    
    // Process each wire to build connections
    wires.forEach(wire => {
      const sourceId = wire.sourceId;
      const targetId = wire.targetId;
      
      // Skip incomplete wires
      if (!sourceId || !targetId) return;
      
      // Parse the source and target pins
      const sourceInfo = parsePinId(sourceId);
      const targetInfo = parsePinId(targetId);
      
      if (!sourceInfo || !targetInfo) {
        console.warn("Invalid pin ID format:", sourceId, targetId);
        return;
      }
      
      // Map Arduino pins (D0-D13, A0-A5) to connected component pins
      if (isHeroboardPin(sourceId)) {
        const pinKey = sourceInfo.pinName; // e.g., "D5"
        if (!connections[pinKey]) {
          connections[pinKey] = [];
        }
        // Store: componentId:pinName format
        connections[pinKey].push(`${targetInfo.componentId}:${targetInfo.pinName}`);
      } 
      else if (isHeroboardPin(targetId)) {
        const pinKey = targetInfo.pinName; // e.g., "D5"
        if (!connections[pinKey]) {
          connections[pinKey] = [];
        }
        // Store: componentId:pinName format
        connections[pinKey].push(`${sourceInfo.componentId}:${sourceInfo.pinName}`);
      }
    });
    
    setPinConnections(connections);
    console.log("Pin connections mapped:", connections);
    
    // We'll log this only once when the connections change, not on every render
    const connectionCount = Object.keys(connections).length;
    if (onLog && connectionCount > 0) {
      onLog(`Circuit Analysis: ${connectionCount} hero board pins connected`);
      
      Object.entries(connections).forEach(([pin, connectedPins]) => {
        onLog(`  ${pin} connected to ${connectedPins.length} component pins:`);
        connectedPins.forEach(connection => {
          onLog(`    ▶ ${connection}`);
        });
      });
    }
    
  // Important: Only include stable dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wires, components]);
  
  // Compile Arduino code to binary
  const compileCode = async (sourceCode) => {
    try {
      // First, perform basic syntax validation on the Arduino code
      const syntaxErrors = validateArduinoSyntax(sourceCode);
      
      if (syntaxErrors.length > 0) {
        if (onLog) {
          onLog("Compilation failed: Syntax errors detected");
          syntaxErrors.forEach(error => {
            onLog(`Error: ${error.message} at line ${error.line}`);
          });
        }
        return null;
      }
      
      // Check if the code contains a valid setup and loop function
      const hasSetup = sourceCode.includes("void setup()");
      const hasLoop = sourceCode.includes("void loop()");
      
      if (!hasSetup || !hasLoop) {
        if (onLog) {
          if (!hasSetup) onLog("Error: Missing 'void setup()' function");
          if (!hasLoop) onLog("Error: Missing 'void loop()' function");
        }
        return null;
      }
      
      // Extract pin configurations from the code
      const setupCode = extractFunctionBody(sourceCode, "setup");
      const loopCode = extractFunctionBody(sourceCode, "loop");
      
      // Analyze setup function for pinMode declarations
      const pinModes = extractPinModes(setupCode);
      
      // Check for digital and analog writes in the loop function
      const digitalWrites = extractDigitalWrites(loopCode);
      const analogWrites = extractAnalogWrites(loopCode);
      
      // Look for delay calls to understand timing
      const delays = extractDelays(loopCode);
      
      // Log the analysis results
      if (onLog) {
        onLog("Analyzing Arduino code...");
        if (pinModes.length > 0) {
          onLog(`Found ${pinModes.length} pinMode declarations:`);
          pinModes.forEach(pm => {
            onLog(`  Pin ${pm.pin} set as ${pm.mode}`);
          });
        }
        
        if (digitalWrites.length > 0) {
          onLog(`Found ${digitalWrites.length} digitalWrite commands:`);
          digitalWrites.forEach(dw => {
            onLog(`  Pin ${dw.pin} set to ${dw.state ? 'HIGH' : 'LOW'}`);
          });
        }
        
        if (analogWrites.length > 0) {
          onLog(`Found ${analogWrites.length} analogWrite commands:`);
          analogWrites.forEach(aw => {
            onLog(`  Pin ${aw.pin} set to value ${aw.value}`);
          });
        }
        
        if (delays.length > 0) {
          onLog(`Found ${delays.length} delay calls:`);
          delays.forEach(d => {
            onLog(`  Delay of ${d.ms}ms`);
          });
        }
      }
      
      // Create a memory buffer for the virtual AVR program
      // In a real-world scenario, this would come from a proper C compiler
      // For our sandbox app, we'll create machine code from our analysis
      const memorySize = 0x8000; // 32KB program memory
      const programBytes = new Uint16Array(memorySize);
      
      // Clear memory
      for (let i = 0; i < programBytes.length; i++) {
        programBytes[i] = 0;
      }
      
      // Create a simplified program based on our analysis
      let addr = 0;
      
      // Add any output pin initializations from pinMode calls
      pinModes.forEach(pm => {
        if (pm.mode === "OUTPUT") {
          const pinInfo = getPinPortAndBit(pm.pin);
          if (pinInfo) {
            // Set the corresponding DDR bit for this pin
            // SBI DDRx, bit (Set Bit in I/O Register - Data Direction Register)
            const ddrAddr = getDDRAddress(pinInfo.port);
            programBytes[addr++] = 0x9A00 | (ddrAddr << 3) | pinInfo.bit; // SBI instruction
          }
        }
      });
      
      // Loop start address
      const loopAddr = addr;
      
      // Add digitalWrite operations from the loop function
      digitalWrites.forEach(dw => {
        const pinInfo = getPinPortAndBit(dw.pin);
        if (pinInfo) {
          const portAddr = getPORTAddress(pinInfo.port);
          if (dw.state) {
            // SBI PORTx, bit (Set Bit in I/O Register - PORT)
            programBytes[addr++] = 0x9A00 | (portAddr << 3) | pinInfo.bit;
          } else {
            // CBI PORTx, bit (Clear Bit in I/O Register - PORT)
            programBytes[addr++] = 0x9800 | (portAddr << 3) | pinInfo.bit;
          }
        }
      });
      
      // Add a simple delay (using NOPs for simplicity)
      // In a real implementation, we would generate proper delay loops
      const delayLength = delays.length > 0 ? 
        Math.min(Math.max(delays[0].ms / 10, 5), 50) : 10; // Between 5-50 NOPs
      
      for (let i = 0; i < delayLength; i++) {
        programBytes[addr++] = 0x0000; // NOP instruction
      }
      
      // Jump back to loop start
      const relJump = (loopAddr - addr - 1) & 0x0FFF; // Relative jump value (12 bits)
      programBytes[addr++] = 0xC000 | relJump; // RJMP to loopAddr
      
      setCompiledProgram(programBytes);
      
      if (onLog) {
        onLog("Program compiled successfully");
        onLog(`Created ${addr} instructions in program memory`);
      }
      
      return programBytes;
    } catch (error) {
      if (onLog) {
        onLog(`Compilation error: ${error.message}`);
      }
      console.error("Error compiling Arduino code:", error);
      return null;
    }
  };
  
  // Helper function to get DDR address for a port
  const getDDRAddress = (port) => {
    // DDR addresses in AVR ATmega328P
    switch(port) {
      case 'B': return 0x04; // DDRB
      case 'C': return 0x07; // DDRC
      case 'D': return 0x0A; // DDRD
      default: return 0x04;  // Default to DDRB
    }
  };
  
  // Helper function to get PORT address for a port
  const getPORTAddress = (port) => {
    // PORT addresses in AVR ATmega328P
    switch(port) {
      case 'B': return 0x05; // PORTB
      case 'C': return 0x08; // PORTC
      case 'D': return 0x0B; // PORTD
      default: return 0x05;  // Default to PORTB
    }
  };
  
  // Helper function to get port and bit for a pin number
  const getPinPortAndBit = (pin) => {
    // Arduino pin mapping to ATmega328P ports and bits
    if (pin >= 0 && pin <= 7) {
      return { port: 'D', bit: pin };
    } else if (pin >= 8 && pin <= 13) {
      return { port: 'B', bit: pin - 8 };
    } else if (pin >= 14 && pin <= 19) {
      return { port: 'C', bit: pin - 14 };
    }
    return null;
  };
  
  // Extract pinMode calls from code
  const extractPinModes = (code) => {
    const result = [];
    const regex = /pinMode\s*\(\s*(\d+|A\d+)\s*,\s*(OUTPUT|INPUT|INPUT_PULLUP)\s*\)/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const pin = match[1].startsWith('A') ? 
        parseInt(match[1].substring(1)) + 14 : // A0 = 14, A1 = 15, etc.
        parseInt(match[1]);
      
      result.push({
        pin,
        mode: match[2]
      });
    }
    
    return result;
  };
  
  // Extract analogWrite calls from code
  const extractAnalogWrites = (code) => {
    const result = [];
    const regex = /analogWrite\s*\(\s*(\d+|A\d+)\s*,\s*([^\)]+)\s*\)/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const pin = match[1].startsWith('A') ? 
        parseInt(match[1].substring(1)) + 14 : 
        parseInt(match[1]);
      
      // Try to evaluate the value expression if it's simple
      let value = 0;
      try {
        if (/^\d+$/.test(match[2])) {
          value = parseInt(match[2]);
        } else {
          value = 128; // Default to middle value if we can't determine
        }
      } catch (e) {
        value = 128; // Default middle value
      }
      
      result.push({
        pin,
        value: Math.min(Math.max(value, 0), 255) // Ensure value is 0-255
      });
    }
    
    return result;
  };
  
  // Extract delay calls from code
  const extractDelays = (code) => {
    const result = [];
    const regex = /delay\s*\(\s*(\d+|[^\)]+)\s*\)/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      let ms = 1000; // Default to 1 second
      
      try {
        if (/^\d+$/.test(match[1])) {
          ms = parseInt(match[1]);
        }
      } catch (e) {
        // Keep default if we can't parse
      }
      
      result.push({ ms });
    }
    
    return result;
  };
  
  // Basic Arduino syntax validator
  const validateArduinoSyntax = (code) => {
    const errors = [];
    const lines = code.split('\n');
    
    // Track braces for matching
    let openBraces = 0;
    let closeBraces = 0;
    
    // Check each line for common syntax errors
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith("//") || trimmedLine === "") {
        return;
      }
      
      // Count braces
      for (const char of trimmedLine) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
      }
      
      // Check for missing semicolons on statements
      if (trimmedLine.length > 0 && 
          !trimmedLine.endsWith("{") && 
          !trimmedLine.endsWith("}") && 
          !trimmedLine.endsWith(";") &&
          !trimmedLine.startsWith("#include") &&
          !trimmedLine.startsWith("void setup") &&
          !trimmedLine.startsWith("void loop")) {
        errors.push({
          line: lineNum,
          message: `Missing semicolon at the end of statement`
        });
      }
      
      // Check for common Arduino function syntax
      if (trimmedLine.includes("digitalRead") || 
          trimmedLine.includes("digitalWrite") || 
          trimmedLine.includes("analogRead") || 
          trimmedLine.includes("analogWrite")) {
        
        // Check for missing parentheses
        if (!trimmedLine.includes("(") || !trimmedLine.includes(")")) {
          errors.push({
            line: lineNum,
            message: `Missing parentheses in function call`
          });
        }
        
        // Check for missing pin or value parameters
        if (trimmedLine.includes("()") || 
            (trimmedLine.includes("(") && trimmedLine.includes(")") && !trimmedLine.includes(","))) {
          errors.push({
            line: lineNum,
            message: `Missing parameters in function call`
          });
        }
      }
    });
    
    // Check for unmatched braces
    if (openBraces !== closeBraces) {
      errors.push({
        line: lines.length,
        message: `Unmatched braces: ${openBraces} opening vs ${closeBraces} closing`
      });
    }
    
    return errors;
  };
  
  // Extract the body of a function from the code
  const extractFunctionBody = (code, functionName) => {
    const regex = new RegExp(`void\\s+${functionName}\\s*\\(\\)\\s*{([\\s\\S]*?)}`, 'i');
    const match = code.match(regex);
    
    return match ? match[1].trim() : '';
  };
  
  // Extract digitalWrite commands from code
  const extractDigitalWrites = (code) => {
    const results = [];
    const regex = /digitalWrite\s*\(\s*(\d+|LED_BUILTIN)\s*,\s*(HIGH|LOW)\s*\)/g;
    
    let match;
    while ((match = regex.exec(code)) !== null) {
      const pin = match[1] === 'LED_BUILTIN' ? 13 : parseInt(match[1]);
      const state = match[2] === 'HIGH';
      
      results.push({ pin, state });
    }
    
    return results;
  };
  
  // Start the simulation
  const startSimulation = () => {
    if (!cpu) {
      console.error("CPU not initialized");
      if (onLog) onLog("Error: CPU not initialized. Try compiling the sketch first.");
      return;
    }
    
    setSimulationActive(true);
    
    // Set up a timer to execute CPU cycles
    if (!timerRef.current) {
      lastCycleTimeRef.current = Date.now();
      
      // Log active port states at simulation start
      if (onLog) {
        onLog("Initializing ports for simulation");
        const ports = portsRef.current;
        if (ports.portB) onLog("Port B initialized");
        if (ports.portC) onLog("Port C initialized");
        if (ports.portD) onLog("Port D initialized");

        // Log any active wire connections
        if (Object.keys(pinConnections).length > 0) {
          onLog(`Active circuit connections: ${Object.keys(pinConnections).length} pins connected`);
        } else {
          onLog("Warning: No circuit connections detected. Connect components to see results.");
        }
      }
      
      timerRef.current = setInterval(() => {
        if (!cpu) return;
        
        const now = Date.now();
        const elapsedMs = now - lastCycleTimeRef.current;
        lastCycleTimeRef.current = now;
        
        // Calculate how many cycles to execute based on the ATmega328P frequency (16MHz)
        // We aim to execute cycles based on time elapsed to maintain real-time simulation
        const cyclesToExecute = Math.ceil(16000 * elapsedMs);
        
        try {
          // Execute the calculated number of CPU cycles
          cpu.execute(cyclesToExecute);
          
          // Log simulation performance metrics occasionally (every ~1 second)
          if (Math.random() < 0.01) {  // About 1% chance each 10ms interval
            console.log(`AVR8js execution: ${cyclesToExecute} cycles (${elapsedMs}ms elapsed)`);
          }
        } catch (e) {
          console.error("Simulation error:", e);
          if (onLog) onLog(`Simulation error: ${e.message}`);
          stopSimulation();
        }
      }, 10); // Update every 10ms for a balance of performance and accuracy
    }
    
    if (onLog) {
      onLog("Simulation started");
      onLog("Executing Arduino code on virtual AVR microcontroller");
    }
  };
  
  // Stop the simulation
  const stopSimulation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setSimulationActive(false);
    
    if (onLog) {
      onLog("Simulation stopped");
    }
  };
  
  // Compile code when it changes
  useEffect(() => {
    if (code) {
      compileCode(code);
    }
  }, [code]);
  
  // Initialize simulation when isRunning changes
  useEffect(() => {
    if (isRunning && !simulationActive && compiledProgram) {
      initSimulation();
      startSimulation();
    } else if (!isRunning && simulationActive) {
      stopSimulation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, compiledProgram, simulationActive]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Set a pin state manually (for input components like buttons)
  const setPinState = (pin, high) => {
    // Map pin number to port and pin
    let port;
    let portPin;
    
    if (pin >= 0 && pin <= 7) {
      port = portsRef.current.portD;
      portPin = pin;
    } else if (pin >= 8 && pin <= 13) {
      port = portsRef.current.portB;
      portPin = pin - 8;
    } else if (pin >= 14 && pin <= 19) {
      port = portsRef.current.portC;
      portPin = pin - 14;
    }
    
    if (port && portPin !== undefined) {
      // Only modify input pins
      if (port.directionRegister & (1 << portPin)) {
        // This is an output pin, don't change its state
        console.log(`Cannot set state of output pin D${pin}`);
        return;
      }
      
      // Set the pin state
      port.setPin(portPin, high ? PinState.High : PinState.Low);
      console.log(`Set pin D${pin} to ${high ? 'HIGH' : 'LOW'}`);
    }
  };
  
  // Expose the setPinState function to the parent component
  if (onPinChange && typeof onPinChange === 'function') {
    onPinChange.setPinState = setPinState;
  }
  
  return (
    <div style={{ display: 'none' }}>
      {/* This is a headless component, no UI needed */}
    </div>
  );
};

export default AVR8Simulator;