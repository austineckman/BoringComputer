import React, { useEffect } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * AVR8Simulator - This component handles the actual AVR8 simulation
 * It runs the Arduino code and manages pin states
 */
const AVR8Simulator = ({ 
  code,
  isRunning,
  onPinChange,
  components,
  wires,
  onLog
}) => {
  const { 
    startSimulation,
    stopSimulation,
    pinStates,
    updatePinState,
    addLog
  } = useSimulator();
  
  // Start/stop simulation based on props
  useEffect(() => {
    if (isRunning) {
      // Initialize the AVR8js simulation with the provided code
      console.log('AVR8 simulator initialized');
      
      // For our basic LED blink example, we'll simulate pin 13 (LED_BUILTIN) toggling
      // This simulates the actual AVR8js functionality for the blink sketch
      let isHigh = false;
      const interval = setInterval(() => {
        // Toggle pin 13 state to simulate the blink sketch
        isHigh = !isHigh;
        
        // Update pin state in the simulator context
        updatePinState(`D${13}`, isHigh);
        
        // Also directly notify the CircuitBuilderWindow via onPinChange
        onPinChange(13, isHigh);
        
        // Log the state change via console to avoid re-render loop
        console.log(`Pin 13 changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        
        // Check for connected LEDs and update them
        updateConnectedComponents(13, isHigh);
      }, 1000); // 1 second interval for blinking
      
      // Store the interval ID for cleanup
      return () => {
        clearInterval(interval);
        console.log('AVR8 simulator stopped');
      };
    }
    
    return () => {
      // Cleanup on unmount
      if (isRunning) {
        // Don't call stopSimulation() here to avoid update loops
        console.log('Simulator cleanup on unmount');
      }
    };
  }, [isRunning, code]); // Only depend on these two variables to prevent update loops
  
  // When pin states change, notify parent component
  useEffect(() => {
    // For example, when pin D13 (LED_BUILTIN) changes state
    if (pinStates.D13 !== undefined) {
      onPinChange(13, pinStates.D13);
    }
    
    // Process all digital pins
    Object.entries(pinStates)
      .filter(([pin]) => pin.startsWith('D'))
      .forEach(([pin, state]) => {
        const pinNumber = parseInt(pin.substring(1), 10);
        
        // Find connected components and update them
        updateConnectedComponents(pinNumber, state);
      });
  }, [pinStates, onPinChange]);
  
  // Find components connected to the given pin and update their state
  const updateConnectedComponents = (pinNumber, isHigh) => {
    // Log the pin change for debugging
    console.log(`Checking components connected to pin ${pinNumber}, state=${isHigh}`);
    
    // Always update pin 13 components for now (we'll implement proper wire tracing later)
    if (pinNumber === 13) {
      // First, try to find LEDs connected through wires
      const connectedLEDs = findConnectedComponents('led', pinNumber);
      
      if (connectedLEDs.length > 0) {
        console.log(`Found ${connectedLEDs.length} LEDs connected to pin ${pinNumber}`);
        connectedLEDs.forEach(led => {
          console.log(`Updating LED ${led.id} to ${isHigh ? 'ON' : 'OFF'}`);
          // Update the LED state
          onPinChange(
            { componentId: led.id, type: 'led' },
            isHigh
          );
        });
      } else {
        // Fallback: if no LEDs found through wire connections, 
        // update all LEDs (for demonstration purposes)
        console.log('No connected LEDs found through wires, updating all LEDs');
        components
          .filter(c => c.type.toLowerCase() === 'led')
          .forEach(led => {
            console.log(`Updating all LEDs: ${led.id} to ${isHigh ? 'ON' : 'OFF'}`);
            onPinChange(
              { componentId: led.id, type: 'led' },
              isHigh
            );
          });
      }
    }
  };
  
  // Helper to find components of a given type connected to a pin
  const findConnectedComponents = (componentType, pinNumber) => {
    // Find the HERO board (Arduino) component
    const heroBoard = components.find(c => c.type === 'heroboard');
    if (!heroBoard) return [];
    
    // Find the pin on the HERO board
    const pinId = `pt-heroboard-${heroBoard.id}-${pinNumber}`;
    
    // Find wires connected to this pin
    const connectedWires = wires.filter(wire => 
      wire.sourceId === pinId || wire.targetId === pinId
    );
    
    // Find connected components
    const connectedComponents = [];
    
    connectedWires.forEach(wire => {
      // Determine the other end of the wire
      const otherEndId = wire.sourceId === pinId ? wire.targetId : wire.sourceId;
      
      // Extract component ID from the pin ID (format: pt-<type>-<componentId>-<pinName>)
      const otherEndParts = otherEndId.split('-');
      const otherComponentType = otherEndParts[1]; // e.g., 'led'
      const otherComponentId = otherEndParts[2]; // e.g., 'abc123'
      
      // Find the component
      if (otherComponentType === componentType) {
        const component = components.find(c => c.id === otherComponentId);
        if (component) {
          connectedComponents.push(component);
        }
      }
    });
    
    return connectedComponents;
  };
  
  // This component doesn't render anything visible
  // It just runs the simulation logic
  return null;
};

export default AVR8Simulator;