import React, { useEffect, useState, useRef } from 'react';
import { CPU, AVRTimer, AVRIOPort, AVRSPI, AVRUSART } from 'avr8js';
import { useSimulator } from './SimulatorContext';
import { compileArduino, extractUsedPins } from './proper/ArduinoCompilerService';

/**
 * ProperAVR8Simulator Component
 * 
 * A production-grade implementation that uses avr8js to create a cycle-accurate
 * simulation of an Arduino microcontroller running compiled machine code.
 */
const ProperAVR8Simulator = ({ code, isRunning, onPinChange, onLog }) => {
  // Compiled program
  const [compiledProgram, setCompiledProgram] = useState(null);
  // Simulation state
  const [simulationState, setSimulationState] = useState({
    running: false,
    pins: {},
    serialOutput: ''
  });
  // CPU & microcontroller references
  const cpuRef = useRef(null);
  const portsRef = useRef({});
  const timersRef = useRef([]);
  // Animation frame for CPU execution
  const rafRef = useRef(null);
  // CPU frequency in Hz (16MHz for Arduino Uno)
  const cpuFrequency = 16000000;
  // Pins used in the program
  const [usedPins, setUsedPins] = useState([]);
  
  // Access simulator context
  const { updateComponentState } = useSimulator();
  
  // Log to console and pass to parent
  const logInfo = (message) => {
    console.log(`[AVR8] ${message}`);
    if (onLog) {
      onLog(message);
    }
  };
  
  // Arduino Uno pin mapping to AVR ports
  const PIN_MAPPING = {
    // Digital pins
    0: { port: 'D', bit: 0 }, // RX
    1: { port: 'D', bit: 1 }, // TX
    2: { port: 'D', bit: 2 },
    3: { port: 'D', bit: 3 }, // PWM
    4: { port: 'D', bit: 4 },
    5: { port: 'D', bit: 5 }, // PWM
    6: { port: 'D', bit: 6 }, // PWM
    7: { port: 'D', bit: 7 },
    8: { port: 'B', bit: 0 },
    9: { port: 'B', bit: 1 }, // PWM
    10: { port: 'B', bit: 2 }, // PWM
    11: { port: 'B', bit: 3 }, // PWM
    12: { port: 'B', bit: 4 },
    13: { port: 'B', bit: 5 }, // LED_BUILTIN
    // Analog pins
    'A0': { port: 'C', bit: 0 },
    'A1': { port: 'C', bit: 1 },
    'A2': { port: 'C', bit: 2 },
    'A3': { port: 'C', bit: 3 },
    'A4': { port: 'C', bit: 4 }, // SDA
    'A5': { port: 'C', bit: 5 }, // SCL
  };
  
  // Port address mapping for AVR ATmega328P
  const PORT_ADDR = {
    'B': { data: 0x25, ddr: 0x24, pin: 0x23 }, // PORTB, DDRB, PINB
    'C': { data: 0x28, ddr: 0x27, pin: 0x26 }, // PORTC, DDRC, PINC
    'D': { data: 0x2B, ddr: 0x2A, pin: 0x29 }, // PORTD, DDRD, PIND
  };

  // Compile the Arduino code
  const compileCode = async () => {
    if (!code) return;
    
    logInfo('Compiling Arduino code...');
    
    try {
      // Call the compiler service
      const result = await compileArduino(code);
      
      if (result.success) {
        logInfo(`Compilation successful. Program size: ${result.size} bytes.`);
        setCompiledProgram(result.program);
        
        // Extract pins used in the program
        const pins = extractUsedPins(result.program);
        setUsedPins(pins);
        
        return result.program;
      } else {
        logInfo(`Compilation failed: ${result.error}`);
        return null;
      }
    } catch (error) {
      logInfo(`Error compiling code: ${error.message}`);
      return null;
    }
  };
  
  // Initialize the AVR simulation
  const initializeAVR = (program) => {
    if (!program) return false;
    
    logInfo('Initializing AVR microcontroller simulation...');
    
    try {
      // Create a new CPU with the compiled program
      const cpu = new CPU(program);
      cpuRef.current = cpu;
      
      // Initialize I/O ports (B, C, D for ATmega328P)
      const ports = {};
      ['B', 'C', 'D'].forEach(portName => {
        const addr = PORT_ADDR[portName];
        ports[portName] = new AVRIOPort(cpu, addr.data, addr.ddr, addr.pin);
        
        // Add listener for port changes
        ports[portName].addPortListener(() => {
          handlePortChange(portName, ports[portName]);
        });
      });
      portsRef.current = ports;
      
      // Initialize timers
      const timers = [];
      // Timer 0 (8-bit) - Controls PWM on pins 5 & 6
      timers[0] = new AVRTimer(cpu, 0);
      // Timer 1 (16-bit) - Controls PWM on pins 9 & 10
      timers[1] = new AVRTimer(cpu, 1);
      // Timer 2 (8-bit) - Controls PWM on pins 3 & 11
      timers[2] = new AVRTimer(cpu, 2);
      timersRef.current = timers;
      
      // Initialize USART for serial communication
      const usart = new AVRUSART(cpu, { 
        onByte: handleSerialByte 
      });
      
      // Initialize SPI (optional)
      const spi = new AVRSPI(cpu);
      
      logInfo('AVR microcontroller initialized successfully');
      return true;
    } catch (error) {
      logInfo(`Error initializing AVR: ${error.message}`);
      return false;
    }
  };
  
  // Handle changes to port values (pin states)
  const handlePortChange = (portName, port) => {
    // Get the PORT value (output pins)
    const portValue = port.PORT;
    // Get the DDR value (data direction register - 1 for output, 0 for input)
    const ddrValue = port.DDR;
    
    // Find which Arduino pins map to this port
    Object.entries(PIN_MAPPING).forEach(([pin, mapping]) => {
      if (mapping.port === portName) {
        const { bit } = mapping;
        const mask = 1 << bit;
        
        // Check if this pin is configured as OUTPUT
        const isOutput = (ddrValue & mask) !== 0;
        
        // If it's an output pin, get its value
        if (isOutput) {
          const isHigh = (portValue & mask) !== 0;
          
          // Update pin state
          setSimulationState(prevState => ({
            ...prevState,
            pins: {
              ...prevState.pins,
              [pin]: { value: isHigh, mode: 'OUTPUT' }
            }
          }));
          
          // Notify about pin change
          handlePinStateChange(pin, isHigh);
        }
      }
    });
  };
  
  // Handle pin state changes from the emulator
  const handlePinStateChange = (pin, isHigh) => {
    // Convert pin to number if it's a string
    const pinNumber = typeof pin === 'string' && pin.startsWith('A') 
      ? pin  // Keep analog pin names as strings ('A0', etc.)
      : parseInt(pin, 10);
    
    // Skip if pin is not valid
    if (isNaN(pinNumber) && typeof pin !== 'string') return;
    
    // Log the pin change
    logInfo(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
    
    // Call onPinChange callback
    if (onPinChange) {
      onPinChange(pinNumber, isHigh);
    }
    
    // Update connected components
    updateConnectedComponents(pinNumber, isHigh);
  };
  
  // Handle serial output from the program
  const handleSerialByte = (value) => {
    const char = String.fromCharCode(value);
    
    setSimulationState(prevState => ({
      ...prevState,
      serialOutput: prevState.serialOutput + char
    }));
    
    // If we received a newline, log the line
    if (char === '\n') {
      const line = simulationState.serialOutput.trim();
      if (line) {
        logInfo(`Serial output: ${line}`);
      }
      
      setSimulationState(prevState => ({
        ...prevState,
        serialOutput: ''
      }));
    }
  };
  
  // Update components connected to a pin
  const updateConnectedComponents = (pin, isHigh) => {
    if (!window.simulatorContext) return;
    
    // Get all component states
    const componentStates = window.simulatorContext.componentStates || {};
    
    // Update Arduino board pins
    const heroboardIds = Object.keys(componentStates).filter(id => 
      id === 'heroboard' || id.includes('heroboard')
    );
    
    // Update each heroboard component
    heroboardIds.forEach(heroboardId => {
      const pinUpdate = {};
      pinUpdate[pin] = isHigh;
      window.simulatorContext.updateComponentPins(heroboardId, pinUpdate);
      logInfo(`Updated ${heroboardId} pin ${pin} to ${isHigh ? 'HIGH' : 'LOW'}`);
    });
    
    // Handle RGB LEDs
    // Look for RGB LED components
    const rgbLedIds = Object.keys(componentStates).filter(id => {
      const component = componentStates[id];
      if (component && component.type === 'rgb-led') {
        return true;
      }
      
      const idLower = id.toLowerCase();
      return idLower.includes('rgb-led') || 
             idLower.includes('rgbled') || 
             idLower.includes('rgb');
    });
    
    // Check if this pin is connected to an RGB LED
    if (rgbLedIds.length > 0) {
      // Standard RGB LED pin mapping
      const pinToColorMap = {
        '9': 'red',
        '10': 'green',
        '11': 'blue'
      };
      
      // If this pin is a color pin, update the LED
      const color = pinToColorMap[pin];
      if (color && window.updateRGBLED) {
        // Use analogWrite value (0-255) if available, else use digital value
        const value = isHigh ? 255 : 0;
        
        // Update each RGB LED
        rgbLedIds.forEach(rgbLedId => {
          if (window.updateRGBLED[rgbLedId]) {
            window.updateRGBLED[rgbLedId](color, value);
            logInfo(`Updated RGB LED ${rgbLedId} ${color} to ${value}`);
          }
        });
      }
    }
  };
  
  // Start the CPU execution loop
  const startCPU = () => {
    if (!cpuRef.current || simulationState.running) return;
    
    logInfo('Starting AVR CPU execution...');
    
    setSimulationState(prev => ({ ...prev, running: true }));
    
    let lastTime = performance.now();
    const BATCH_SIZE = 50000; // Instructions per batch
    
    // Start animation frame loop for CPU execution
    const runCPU = () => {
      if (!cpuRef.current) return;
      
      // Get elapsed time
      const currentTime = performance.now();
      const elapsedTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Calculate cycles based on CPU frequency and elapsed time
      const cycles = Math.floor((cpuFrequency * elapsedTime) / 1000);
      
      // Execute CPU cycles in batches to avoid blocking UI
      try {
        // Execute a batch of instructions
        cpuRef.current.execute(Math.min(cycles, BATCH_SIZE));
        
        // Schedule next execution batch if still running
        if (simulationState.running) {
          rafRef.current = requestAnimationFrame(runCPU);
        }
      } catch (error) {
        logInfo(`CPU execution error: ${error.message}`);
        stopCPU();
      }
    };
    
    // Start the animation loop
    rafRef.current = requestAnimationFrame(runCPU);
  };
  
  // Stop the CPU execution
  const stopCPU = () => {
    logInfo('Stopping AVR CPU execution...');
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    setSimulationState(prev => ({ ...prev, running: false }));
  };
  
  // Reset the CPU and peripherals
  const resetCPU = () => {
    logInfo('Resetting AVR CPU...');
    
    const cpu = cpuRef.current;
    if (cpu) {
      cpu.reset();
    }
    
    setSimulationState({
      running: false,
      pins: {},
      serialOutput: ''
    });
  };
  
  // Compile code when it changes
  useEffect(() => {
    if (code) {
      // Stop any running simulation
      stopCPU();
      resetCPU();
      
      // Compile the code
      compileCode().then(program => {
        if (program) {
          // Initialize the AVR with the compiled program
          const initialized = initializeAVR(program);
          
          // Start simulation if initialization successful and autorun enabled
          if (initialized && isRunning) {
            startCPU();
          }
        }
      });
    }
  }, [code]);
  
  // Start/stop simulation when isRunning changes
  useEffect(() => {
    if (isRunning) {
      // If we have a CPU, start it
      if (cpuRef.current && !simulationState.running) {
        startCPU();
      }
    } else {
      // Stop the CPU
      if (simulationState.running) {
        stopCPU();
      }
    }
  }, [isRunning, simulationState.running]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop simulation
      stopCPU();
      
      // Clean up references
      cpuRef.current = null;
      portsRef.current = {};
      timersRef.current = [];
      
      logInfo('AVR simulator cleaned up');
    };
  }, []);
  
  // Render (invisible component - only for simulation)
  return null;
};

export default ProperAVR8Simulator;