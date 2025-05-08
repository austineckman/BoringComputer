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
    
    // For demonstration purposes, we're focusing on pin 13, 
    // but this same code would work for any pin
    if (pinNumber === 13) {
      // First, try to find LEDs connected through wires
      const connectedLEDs = findConnectedComponents('led', pinNumber);
      
      if (connectedLEDs.length > 0) {
        console.log(`Found ${connectedLEDs.length} LEDs connected to pin ${pinNumber}`);
        
        // Update each connected LED
        connectedLEDs.forEach(led => {
          console.log(`Updating LED ${led.id} to ${isHigh ? 'ON' : 'OFF'}`);
          
          // Update the LED state via onPinChange callback
          onPinChange(
            { componentId: led.id, type: 'led' },
            isHigh
          );
        });
      } else {
        // Temporary fallback for debugging/development: update all LEDs
        // In production, this would be removed so only connected LEDs are updated
        console.log('No connected LEDs found through wires, updating all LEDs as fallback');
        
        // Get all LED components
        const allLEDs = components.filter(c => c.type.toLowerCase() === 'led');
        console.log(`Found ${allLEDs.length} total LED components to update as fallback`);
        
        // Update each LED
        allLEDs.forEach(led => {
          console.log(`Updating LED ${led.id} to ${isHigh ? 'ON' : 'OFF'}`);
          
          // Update the LED state
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
    
    console.log(`Looking for ${componentType} components connected to pin ${pinNumber}`);
    console.log(`HERO board ID: ${heroBoard.id}`);
    
    // Try multiple formats of pin IDs to handle different naming patterns
    const possiblePinFormats = [
      `pt-heroboard-${heroBoard.id}-${pinNumber}`,        // Standard format
      `pt-heroboard-heroboard-${heroBoard.id}-${pinNumber}`, // Expanded format
      `pt-heroboard-${heroBoard.id}-D${pinNumber}`,       // Digital pin format
      `pt-heroboard-heroboard-${heroBoard.id}-D${pinNumber}`, // Expanded digital format
      `pt-heroboard-${heroBoard.id}-digital-${pinNumber}`, // Alternate digital pin format
      `pt-heroboard-${heroBoard.id}-${pinNumber}`,        // Standard format as string
      `${pinNumber}`                                      // Just the pin number
    ];
    
    console.log("Possible pin formats:", possiblePinFormats);
    
    // Find wires connected to any of these pin formats
    const connectedWires = wires.filter(wire => {
      // Log wire source and target for debugging
      console.log(`Wire: source=${wire.sourceId}, target=${wire.targetId}`);
      
      return possiblePinFormats.some(pinFormat => 
        wire.sourceId?.includes(pinFormat) || 
        wire.targetId?.includes(pinFormat)
      );
    });
    
    console.log(`Found ${connectedWires.length} wires connected to pin ${pinNumber}`);
    
    // Find connected components
    const connectedComponents = [];
    
    connectedWires.forEach(wire => {
      // Determine which end is connected to the HERO board
      const isSourceHeroBoard = possiblePinFormats.some(format => wire.sourceId?.includes(format));
      
      // Get the other end ID (either source or target depending on which is the HERO board)
      const otherEndId = isSourceHeroBoard ? wire.targetId : wire.sourceId;
      
      console.log(`Other end ID: ${otherEndId}`);
      
      // Try to extract component type from the ID
      // The format can vary, but we'll try to handle common patterns
      if (otherEndId) {
        const otherEndParts = otherEndId.split('-');
        
        // Handle multiple possible formats
        let otherComponentType = '';
        let otherComponentId = '';
        
        if (otherEndParts.length >= 3) {
          // Format: pt-<type>-<id>-<pin>
          otherComponentType = otherEndParts[1]?.toLowerCase();
          otherComponentId = otherEndParts[2];
          
          console.log(`Extracted component type: ${otherComponentType}, id: ${otherComponentId}`);
          
          // Check if this is the component type we're looking for
          if (otherComponentType === componentType.toLowerCase()) {
            // Find the corresponding component in our list
            const component = components.find(c => 
              c.id === otherComponentId || 
              // Fallback: any component of the right type
              (c.type.toLowerCase() === componentType.toLowerCase())
            );
            
            if (component) {
              console.log(`Found connected ${componentType} component: ${component.id}`);
              connectedComponents.push(component);
            }
          }
        }
      }
    });
    
    console.log(`Returning ${connectedComponents.length} ${componentType} components`);
    return connectedComponents;
  };
  
  // This component doesn't render anything visible
  // It just runs the simulation logic
  return null;
};

export default AVR8Simulator;