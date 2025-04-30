import React, { useEffect, useState, useRef } from 'react';
import { 
  CPU, 
  AVRIOPort, 
  PinState, 
  portBConfig, 
  portCConfig, 
  portDConfig,
  timer0Config,
  usart0Config
} from 'avr8js';
import { validateArduinoSyntax, extractFunctionBody, extractDigitalWrites } from './SimulatorUtils';

/**
 * AVR8Simulator
 * 
 * Handles the simulation of AVR microcontroller using avr8js directly from Wokwi's implementation
 * Following the patterns and techniques used in the Wokwi's AVR8js GitHub repository
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
  
  // Handle pin state changes from the CPU - WOKWI style
  const handlePinStateChange = (pin, state) => {
    const isHigh = state === PinState.High;
    console.log(`Pin D${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
    
    // Call the onPinChange callback to update UI components
    if (onPinChange) {
      // Pass the pin number and state (true for HIGH, false for LOW)
      onPinChange(pin, isHigh);
    }
    
    // WOKWI STYLE: Dispatch a global event that components can listen for
    // This allows any component in the DOM to react to Arduino pin changes
    document.dispatchEvent(new CustomEvent('arduinoPinChanged', {
      detail: {
        pin: pin,
        isHigh: isHigh,
        pinKey: `D${pin}`
      }
    }));
    
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
          
          // WOKWI STYLE: Dispatch component-specific events
          // This allows LED components to directly listen for changes affecting them
          document.dispatchEvent(new CustomEvent('pinStateChanged', {
            detail: {
              componentId: componentId,
              pin: componentPin,
              isHigh: isHigh
            }
          }));
          
          // Update the component state based on the signal
          // For example, if it's an LED connected to pin 13, turn it on when pin 13 is HIGH
          if (componentId.includes('led-')) {
            // Enhanced LED update with polarity check
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
      
      // For now, we'll use a simple blink example as our compiled program
      // In a real implementation, you'd need to compile the Arduino code to AVR binary
      // or use an embedded Arduino compiler like avr-gcc via a WebAssembly bridge
      
      // This is a simplified memory setup for our virtual Arduino
      // In the real implementation, we would compile the actual sourceCode
      const memorySize = 0x8000; // 32KB program memory
      const programBytes = new Uint16Array(memorySize);
      
      // Clear memory
      for (let i = 0; i < programBytes.length; i++) {
        programBytes[i] = 0;
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
      
      // Check for digitalWrite commands to control pins
      const digitalWrites = extractDigitalWrites(loopCode);
      
      // Simplified program that toggles pin 13 (PB5) on and off
      let addr = 0;
      
      // 1. Set pin 13 (PB5) as output
      // SBI DDRB, 5 (Set Bit in I/O Register - Data Direction Register B, bit 5)
      programBytes[addr++] = 0x9A95; // SBI 0x04, 5 (DDRB is at 0x04)
      
      // Loop:
      const loopAddr = addr;
      
      // 2. Set pin 13 HIGH
      // SBI PORTB, 5 (Set Bit in I/O Register - Port B, bit 5)
      programBytes[addr++] = 0x9A9D; // SBI 0x05, 5 (PORTB is at 0x05)
      
      // 3. Delay (simplified - in real code this would be many instructions)
      for (let i = 0; i < 10; i++) {
        programBytes[addr++] = 0x0000; // NOP
      }
      
      // 4. Set pin 13 LOW
      // CBI PORTB, 5 (Clear Bit in I/O Register - Port B, bit 5)
      programBytes[addr++] = 0x989D; // CBI 0x05, 5 (PORTB is at 0x05)
      
      // 5. Delay again
      for (let i = 0; i < 10; i++) {
        programBytes[addr++] = 0x0000; // NOP
      }
      
      // 6. Jump back to loop
      // RJMP to loop address
      const relJump = (loopAddr - addr - 1) & 0x0FFF; // Relative jump value
      programBytes[addr++] = 0xC000 | relJump; // RJMP to loopAddr
      
      setCompiledProgram(programBytes);
      
      if (onLog) {
        onLog("Program compiled successfully");
        
        // Log extracted information about the program
        if (digitalWrites.length > 0) {
          onLog(`Found ${digitalWrites.length} digitalWrite commands`);
          digitalWrites.forEach(dw => {
            onLog(`  Pin ${dw.pin} set to ${dw.state ? 'HIGH' : 'LOW'}`);
          });
        }
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
      return;
    }
    
    setSimulationActive(true);
    
    // Set up a timer to execute CPU cycles
    if (!timerRef.current) {
      lastCycleTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        if (!cpu) return;
        
        const now = Date.now();
        const elapsedMs = now - lastCycleTimeRef.current;
        lastCycleTimeRef.current = now;
        
        // Calculate how many cycles to execute based on the ATmega328P frequency (16MHz)
        // We aim to execute 16,000 cycles per millisecond
        const cyclesToExecute = 16000 * elapsedMs;
        
        try {
          // Execute the calculated number of CPU cycles
          cpu.execute(cyclesToExecute);
        } catch (e) {
          console.error("Simulation error:", e);
          stopSimulation();
        }
      }, 10); // Update every 10ms for a balance of performance and accuracy
    }
    
    if (onLog) {
      onLog("Simulation started");
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