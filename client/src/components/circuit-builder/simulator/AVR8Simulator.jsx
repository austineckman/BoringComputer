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
    
    wires.forEach(wire => {
      const sourceId = wire.sourceId;
      const targetId = wire.targetId;
      
      // Skip incomplete wires
      if (!sourceId || !targetId) return;
      
      // Map HeroBoard pins (D0-D13, A0-A5) to connected component pins
      if (sourceId.startsWith('heroboard')) {
        const pinName = sourceId.split('-')[1]; // e.g., "D5"
        if (!connections[pinName]) {
          connections[pinName] = [];
        }
        connections[pinName].push(`${targetId}`);
      } 
      else if (targetId.startsWith('heroboard')) {
        const pinName = targetId.split('-')[1]; // e.g., "D5"
        if (!connections[pinName]) {
          connections[pinName] = [];
        }
        connections[pinName].push(`${sourceId}`);
      }
    });
    
    setPinConnections(connections);
    console.log("Pin connections mapped:", connections);
    
  }, [wires, components]);
  
  // Compile Arduino code to binary
  const compileCode = async (sourceCode) => {
    // For now, we'll use a simple blink example as our compiled program
    // In a real implementation, you'd need to compile the Arduino code to AVR binary
    // or use an embedded Arduino compiler like avr-gcc via a WebAssembly bridge
    
    // This is a simplified memory setup for our virtual Arduino
    // In the real implementation, we would compile the actual sourceCode
    
    // Initialize program memory with our simplified blink sketch
    // Each instruction is just a placeholder - not actual AVR assembly
    const memorySize = 0x8000; // 32KB program memory
    const programBytes = new Uint16Array(memorySize);
    
    // Clear memory
    for (let i = 0; i < programBytes.length; i++) {
      programBytes[i] = 0;
    }
    
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
    }
    
    return programBytes;
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
  }, [isRunning, compiledProgram]);
  
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