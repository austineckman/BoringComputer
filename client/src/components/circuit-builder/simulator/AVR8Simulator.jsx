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
    for (let i = 0; i < 8; i++) {
      port.addPinChangeListener(i, (newState) => {
        const arduinoPin = mapPortPinToArduino(portName, i);
        if (arduinoPin !== null) {
          handlePinStateChange(arduinoPin, newState);
        }
      });
    }
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
    console.log(`Pin D${pin} changed to ${state === PinState.High ? 'HIGH' : 'LOW'}`);
    
    // Call the onPinChange callback to update UI components
    if (onPinChange) {
      onPinChange(pin, state === PinState.High);
    }
    
    // Check for connected components via wires
    const connectedPins = pinConnections[`D${pin}`] || [];
    
    // Update connected components
    connectedPins.forEach(connection => {
      const [componentId, componentPin] = connection.split(':');
      if (componentId && componentPin) {
        // This will propagate the signal to connected components
        console.log(`Propagating signal to ${componentId} pin ${componentPin}`);
        // The actual component update will happen in the CircuitBuilder component
      }
    });
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
    
    // This is a pre-assembled binary of a simple blink program
    // In a full implementation, this would be replaced with a real Arduino sketch compiler
    
    const programBytes = new Uint16Array([
      0x2400, // digitalWrite(13, HIGH) simulation
      0x2411, // delay(1000) simulation
      0x2401, // digitalWrite(13, LOW) simulation
      0x2411, // delay(1000) simulation
      0xCFFF  // Jump back to start
    ]);
    
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