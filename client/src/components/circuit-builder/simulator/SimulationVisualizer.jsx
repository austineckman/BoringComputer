import React, { useEffect } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationVisualizer - Provides visual feedback for circuit simulation
 * 
 * This component handles updating the visual state of components 
 * (like LEDs lighting up) based on the simulation state.
 */
const SimulationVisualizer = ({ components, wires }) => {
  const { pinStates, componentStates } = useSimulator();
  
  useEffect(() => {
    // When pin states change, update visual elements to reflect them
    if (!pinStates) return;
    
    // Create a mapping of component types and IDs
    const componentMap = components.reduce((map, component) => {
      map[component.id] = component;
      return map;
    }, {});
    
    // Update LED components
    Object.entries(componentStates).forEach(([componentId, state]) => {
      if (componentId.startsWith('led-')) {
        // Get the DOM element for the LED visualization
        const ledElement = document.getElementById(`led-vis-${componentId}`);
        if (ledElement && state.isLit !== undefined) {
          ledElement.classList.toggle('led-on', state.isLit);
        }
      }
      
      // RGB LED handling
      if (componentId.startsWith('rgbled-')) {
        const rgbElement = document.getElementById(`rgbled-vis-${componentId}`);
        if (rgbElement) {
          const { redValue = 0, greenValue = 0, blueValue = 0 } = state;
          // Convert binary RGB values to CSS color
          const red = redValue * 255;
          const green = greenValue * 255;
          const blue = blueValue * 255;
          rgbElement.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
          
          // Add a 'lit' class if any value is > 0
          const isLit = red > 0 || green > 0 || blue > 0;
          rgbElement.classList.toggle('led-on', isLit);
        }
      }
      
      // Buzzer handling
      if (componentId.startsWith('buzzer-')) {
        const buzzerElement = document.getElementById(`buzzer-vis-${componentId}`);
        if (buzzerElement && state.hasSignal !== undefined) {
          buzzerElement.classList.toggle('buzzer-active', state.hasSignal);
        }
      }
      
      // Add more component types as needed
    });
    
    // Visualize pin states on the HERO board
    // Find pins that are connected to outputs and update their visual state
    Object.entries(pinStates).forEach(([pinId, isHigh]) => {
      const pinElement = document.querySelector(`[data-pin-id="${pinId}"]`);
      if (pinElement) {
        pinElement.classList.toggle('pin-high', isHigh);
      }
    });
    
    // Visualize the wires based on pin states
    // For each wire, check if it's connected to a pin with a state
    wires.forEach(wire => {
      const wireId = wire.id;
      const wireElement = document.getElementById(wireId);
      
      if (wireElement) {
        let isActive = false;
        
        // Find the source and target pin IDs
        const sourcePinName = wire.sourceName;
        const targetPinName = wire.targetName;
        
        // Check if the source or target is a digital pin on the Arduino
        if (
          sourcePinName.match(/^[0-9]+$/) || 
          sourcePinName.match(/^A[0-9]+$/) ||
          targetPinName.match(/^[0-9]+$/) || 
          targetPinName.match(/^A[0-9]+$/)
        ) {
          const pinId = sourcePinName.match(/^[0-9]+$/) || sourcePinName.match(/^A[0-9]+$/) 
            ? sourcePinName
            : targetPinName;
          
          const pinState = pinStates[`D${pinId}`] || pinStates[pinId];
          isActive = pinState === true;
        }
        
        // Update wire visual state
        wireElement.classList.toggle('wire-active', isActive);
      }
    });
    
  }, [pinStates, componentStates, components, wires]);
  
  return null; // This component doesn't render UI elements directly
};

export default SimulationVisualizer;