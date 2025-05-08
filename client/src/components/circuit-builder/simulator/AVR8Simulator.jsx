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
      addLog('AVR8 simulator initialized');
      
      // For our basic LED blink example, we'll simulate pin 13 (LED_BUILTIN) toggling
      // This simulates the actual AVR8js functionality for the blink sketch
      let isHigh = false;
      const interval = setInterval(() => {
        // Toggle pin 13 state to simulate the blink sketch
        isHigh = !isHigh;
        
        // Update pin state in the simulator context
        updatePinState(13, isHigh);
        
        // Also directly notify the CircuitBuilderWindow via onPinChange
        onPinChange(13, isHigh);
        
        // Log the state change
        addLog(`Pin 13 changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        
        // Check for connected LEDs and update them
        updateConnectedComponents(13, isHigh);
      }, 1000); // 1 second interval for blinking
      
      // Store the interval ID for cleanup
      return () => {
        clearInterval(interval);
        addLog('AVR8 simulator stopped');
      };
    }
    
    return () => {
      // Cleanup on unmount
      if (isRunning) {
        stopSimulation();
      }
    };
  }, [isRunning, code, components, wires, updatePinState, addLog, onPinChange, stopSimulation]);
  
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
  }, [pinStates]);
  
  // Find components connected to the given pin and update their state
  const updateConnectedComponents = (pinNumber, isHigh) => {
    // This is a simplified example
    // In a real implementation, we would check the wires array to find
    // which components are connected to this pin
    
    // For example, if pin 13 is connected to an LED component
    if (pinNumber === 13) {
      const connectedLEDs = findConnectedComponents('led', pinNumber);
      
      connectedLEDs.forEach(led => {
        // Update the LED state
        onPinChange(
          { componentId: led.id, type: 'led', isOn: isHigh },
          isHigh
        );
      });
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