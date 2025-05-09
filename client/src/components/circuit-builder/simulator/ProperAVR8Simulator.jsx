import React, { useState, useEffect, useCallback } from 'react';
import AVR8SimulatorComponent from './proper/AVR8SimulatorComponent';
import { useSimulator } from './SimulatorContext';

/**
 * ProperAVR8Simulator Component
 * 
 * A production-grade implementation that uses avr8js to create a cycle-accurate
 * simulation of an Arduino microcontroller running compiled machine code.
 */
const ProperAVR8Simulator = ({ code, isRunning, onPinChange, onLog }) => {
  // Serial output from the simulation
  const [serialOutput, setSerialOutput] = useState('');
  // Used to track pins that are currently HIGH (active)
  const [activePins, setActivePins] = useState({});
  
  // Access simulator context
  const { updateComponentState, updateComponentPins } = useSimulator();
  
  // Log to console and pass to parent
  const handleLog = useCallback((message) => {
    console.log(`[AVR8] ${message}`);
    if (onLog) {
      onLog(message);
    }
  }, [onLog]);
  
  // Handle pin change from the simulator
  const handlePinChange = useCallback((pin, isHigh) => {
    // Update active pins state
    setActivePins(prev => ({
      ...prev,
      [pin]: isHigh
    }));
    
    // Call the parent callback if provided
    if (onPinChange) {
      onPinChange(pin, isHigh);
    }
    
    // Log the pin change
    handleLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
  }, [onPinChange, handleLog]);
  
  // Handle serial data from simulator
  const handleSerialData = useCallback((value, char) => {
    setSerialOutput(prev => {
      const newOutput = prev + char;
      
      // If we get a newline, log it
      if (char === '\n') {
        const line = newOutput.trim();
        if (line) {
          handleLog(`Serial: ${line}`);
        }
        return '';
      }
      
      return newOutput;
    });
  }, [handleLog]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Reset state
      setSerialOutput('');
      setActivePins({});
      
      handleLog('AVR8 simulator cleaned up');
    };
  }, [handleLog]);
  
  // Render the proper AVR8 simulator
  return (
    <AVR8SimulatorComponent
      code={code}
      isRunning={isRunning}
      onPinChange={handlePinChange}
      onSerialData={handleSerialData}
      onLog={handleLog}
    />
  );
  
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