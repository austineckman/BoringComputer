import React, { useEffect, useState } from 'react';
import { useSimulator } from './SimulatorContext';
import { calculateCircuitState } from './SimulatorUtils';
import SimulationVisualizer from './SimulationVisualizer';

/**
 * AVR8Simulator - Main component for Arduino simulation
 * 
 * This component acts as the bridge between the UI and the AVR8js simulation library,
 * providing visual feedback for pin states and component interactions.
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
    isSimulationRunning, 
    componentStates, 
    pinStates,
    compilationErrors
  } = useSimulator();
  
  // Monitor simulation errors and provide visual feedback
  useEffect(() => {
    if (compilationErrors && compilationErrors.length > 0) {
      // Log compilation errors
      compilationErrors.forEach(error => {
        onLog(`Error (Line ${error.line}): ${error.message}`);
      });
    }
  }, [compilationErrors, onLog]);
  
  // Detect changes in pin states and reflect them in the UI
  useEffect(() => {
    if (!isSimulationRunning) return;
    
    // Process pin state changes and pass them to the parent component
    Object.entries(pinStates).forEach(([pinId, isHigh]) => {
      // Extract the pin number (remove D or A prefix)
      const pinType = pinId.charAt(0);
      const pinNumber = parseInt(pinId.substring(1), 10);
      
      if (!isNaN(pinNumber)) {
        // Notify parent component about pin state change
        onPinChange(pinNumber, isHigh);
      }
    });
    
    // Process component state changes
    Object.entries(componentStates).forEach(([componentId, state]) => {
      // Find the component in our list
      const component = components.find(c => c.id === componentId);
      if (component) {
        // Notify parent component about component state change
        onPinChange({ componentId, ...state }, null);
      }
    });
  }, [isSimulationRunning, pinStates, componentStates, components, onPinChange]);
  
  // No visible UI - the visualization is handled by SimulationVisualizer
  return (
    <>
      {isSimulationRunning && (
        <SimulationVisualizer 
          components={components} 
          wires={wires} 
        />
      )}
    </>
  );
};

export default AVR8Simulator;