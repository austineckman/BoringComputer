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
    addLog
  } = useSimulator();
  
  // Start/stop simulation based on props
  useEffect(() => {
    if (isRunning) {
      // In a real implementation, this would initialize the AVR8js simulation
      // with the provided code, components and wires
      addLog('AVR8 simulator initialized');
    } else {
      // Cleanup when stopping simulation
      addLog('AVR8 simulator stopped');
    }
    
    return () => {
      // Cleanup on unmount
      if (isRunning) {
        stopSimulation();
      }
    };
  }, [isRunning, code, components, wires]);
  
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
    // Simplified for demonstration
    // In a real implementation, this would trace through the wires
    // to find connected components
    
    // Dummy implementation that returns an empty array
    return [];
  };
  
  // This component doesn't render anything visible
  // It just runs the simulation logic
  return null;
};

export default AVR8Simulator;