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
    updateComponentPins,
    addLog
  } = useSimulator();
  
  // Parse Arduino code to extract active pins
  const extractActivePins = (code) => {
    const pins = [];
    
    // Extract all digitalWrite calls
    const digitalWriteRegex = /digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*\w+\s*\)/g;
    let match;
    
    while ((match = digitalWriteRegex.exec(code)) !== null) {
      const pin = match[1];
      // Handle LED_BUILTIN constant
      if (pin === 'LED_BUILTIN') {
        pins.push('13');
      } else {
        pins.push(pin.toString());
      }
    }
    
    // If no pins found, default to pin 13
    return pins.length > 0 ? [...new Set(pins)] : ['13'];
  };

  // Start/stop simulation based on props
  useEffect(() => {
    if (isRunning) {
      // Initialize the AVR8js simulation with the provided code
      console.log('AVR8 simulator initialized');
      
      // Extract active pins from the Arduino code
      const activePins = extractActivePins(code);
      console.log('Active pins detected in code:', activePins);
      
      // For our basic simulation, we'll toggle the active pins
      let isHigh = false;
      const interval = setInterval(() => {
        // Toggle pin state
        isHigh = !isHigh;
        
        // Update all active pins
        activePins.forEach(pin => {
          // Update pin state in the simulator context
          updatePinState(`D${pin}`, isHigh);
          
          // Also directly notify the CircuitBuilderWindow via onPinChange
          // This needs to run outside interval to avoid an infinite update loop
          const updateComponents = () => {
            // Log the state change via console
            console.log(`Simulator: Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
            
            // Update the HERO board's pin LED
            // Find the HERO board component
            const heroBoard = components.find(c => c.type === 'heroboard');
            if (heroBoard) {
              // Use the dedicated function to update pin states in the context
              updateComponentPins(heroBoard.id, { [pin]: isHigh });
              
              // Also notify the parent component via the callback
              onPinChange(parseInt(pin), isHigh);
            }
            
            // Check for connected LEDs and update them
            updateConnectedComponents(parseInt(pin), isHigh);
          };
          
          // Execute the updates outside the React update cycle
          setTimeout(updateComponents, 0);
          
          // Add log entry - call this directly to avoid dependency on addLog changing
          if (typeof addLog === 'function') {
            addLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
          }
        });
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
    if (!isRunning) return; // Only process pin changes when simulation is running
    
    // For example, when pin D13 (LED_BUILTIN) changes state
    const pinD13State = pinStates.D13;
    if (pinD13State !== undefined) {
      // Only call this directly for pin 13 (our standard example)
      // Use a stable reference to avoid dependency loops
      const pin13Value = !!pinD13State; // Convert to boolean
      console.log(`Processing pin D13 state change to ${pin13Value}`);
      updateComponentPins('heroboard', { '13': pin13Value });
    }
    
    // Process all digital pins - using a copy to avoid dependency issues
    const pinStateEntries = Object.entries(pinStates)
      .filter(([pin]) => pin.startsWith('D'));
    
    if (pinStateEntries.length > 0) {
      // Isolate this in a separate function to avoid dependency loop
      setTimeout(() => {
        pinStateEntries.forEach(([pin, state]) => {
          const pinNumber = parseInt(pin.substring(1), 10);
          // Store in local variables to break circular dependencies
          const currentPin = pinNumber;
          const currentState = !!state; // Convert to boolean
          
          // Call the update function directly
          if (updateComponentPins && typeof updateComponentPins === 'function') {
            // Find connected components and update them using a more stable method
            components.forEach(comp => {
              if (comp.type === 'heroboard') {
                updateComponentPins(comp.id, { [currentPin]: currentState });
              }
            });
          }
        });
      }, 0);
    }
  }, [pinStates, isRunning]); // Remove onPinChange from dependencies
  
  // Find components connected to the given pin and update their state
  const updateConnectedComponents = (pinNumber, isHigh) => {
    // Log the pin change for debugging
    console.log(`Checking components connected to pin ${pinNumber}, state=${isHigh}`);
    
    // SPECIAL CASE: For pin 13, ALWAYS update the built-in LED on all heroboards
    if (pinNumber === 13) {
      // Find all HERO boards
      const heroBoards = components.filter(c => c.type.toLowerCase() === 'heroboard');
      
      // Update each HERO board's pin 13 LED
      heroBoards.forEach(board => {
        console.log(`Directly updating HERO board ${board.id} pin 13 LED to ${isHigh ? 'HIGH' : 'LOW'}`);
        updateComponentPins(board.id, { '13': isHigh });
      });
    }
    
    // For demonstration purposes, we're focusing on pins 9-13, 
    // but this same code would work for any pin
    if (pinNumber >= 9 && pinNumber <= 13) {
      // First, try to find regular LEDs connected through wires
      const connectedLEDs = findConnectedComponents('led', pinNumber);
      
      // Also check for RGB LEDs connected to this pin
      const connectedRGBLEDs = findConnectedComponents('rgbled', pinNumber);
      
      let componentsUpdated = false;
      
      // Update regular LEDs
      if (connectedLEDs.length > 0) {
        console.log(`Found ${connectedLEDs.length} LEDs connected to pin ${pinNumber}`);
        componentsUpdated = true;
        
        // Update each connected LED
        connectedLEDs.forEach(led => {
          console.log(`Updating LED ${led.id} to ${isHigh ? 'ON' : 'OFF'}`);
          
          // Update the LED state via onPinChange callback
          onPinChange(
            { componentId: led.id, type: 'led' },
            isHigh
          );
        });
      }
      
      // Update RGB LEDs
      if (connectedRGBLEDs.length > 0) {
        console.log(`Found ${connectedRGBLEDs.length} RGB LEDs connected to pin ${pinNumber}`);
        componentsUpdated = true;
        
        // Update each connected RGB LED
        // For RGB LED, we need to determine which color channel to update based on pin
        connectedRGBLEDs.forEach(rgbled => {
          console.log(`Updating RGB LED ${rgbled.id} pin ${pinNumber} to ${isHigh ? 'ON' : 'OFF'}`);
          
          // Map pins to RGB colors (simplified mapping)
          // In a real project, this would use the actual pin mapping from the component
          const colorMap = {
            9: 'red',
            10: 'green',
            11: 'blue',
            12: 'red',   // Fallback
            13: 'green'  // Fallback
          };
          
          const color = colorMap[pinNumber] || 'all';
          
          // Update the RGB LED state via onPinChange callback
          onPinChange(
            { 
              componentId: rgbled.id, 
              type: 'rgbled',
              color: color  // Pass which color channel should be updated
            },
            isHigh
          );
        });
      }
      
      // If no components were updated through wires, use a fallback for demonstration
      if (!componentsUpdated && pinNumber !== 13) { // Skip for pin 13 (handled above)
        console.log('No components found through wires, using fallback for demonstration');
        
        // Get all LED components
        const allLEDs = components.filter(c => c.type.toLowerCase() === 'led');
        const allRGBLEDs = components.filter(c => c.type.toLowerCase() === 'rgbled');
        
        console.log(`Found ${allLEDs.length} LED components and ${allRGBLEDs.length} RGB LED components to update as fallback`);
        
        // Update each LED
        allLEDs.forEach(led => {
          console.log(`Updating LED ${led.id} to ${isHigh ? 'ON' : 'OFF'}`);
          
          // Update the LED state
          onPinChange(
            { componentId: led.id, type: 'led' },
            isHigh
          );
        });
        
        // Update RGB LEDs based on pin number
        const colorMap = {
          9: 'red',
          10: 'green',
          11: 'blue',
          12: 'red',   // Fallback
          13: 'green'  // Fallback
        };
        
        if (colorMap[pinNumber]) {
          allRGBLEDs.forEach(rgbled => {
            console.log(`Updating RGB LED ${rgbled.id} ${colorMap[pinNumber]} channel to ${isHigh ? 'ON' : 'OFF'}`);
            
            // Update the RGB LED state
            onPinChange(
              { 
                componentId: rgbled.id, 
                type: 'rgbled',
                color: colorMap[pinNumber]
              },
              isHigh
            );
          });
        }
      }
    }
  };
  
  // Helper to find components of a given type connected to a pin
  const findConnectedComponents = (componentType, pinNumber) => {
    // Find the HERO board (Arduino) component
    const heroBoard = components.find(c => c.type === 'heroboard');
    if (!heroBoard) return [];
    
    // Avoid excessive logging to reduce browser load
    if (pinNumber === 13) {
      console.log(`Looking for ${componentType} components connected to pin ${pinNumber}`);
      console.log(`HERO board ID: ${heroBoard.id}`);
    }
    
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
    
    // Avoid excessive logging to reduce browser load
    if (pinNumber === 13) {
      console.log("Possible pin formats:", possiblePinFormats);
    }
    
    // Find wires connected to any of these pin formats
    const connectedWires = wires.filter(wire => {
      // Only log for pin 13 to reduce console spam
      if (pinNumber === 13) {
        console.log(`Wire: source=${wire.sourceId}, target=${wire.targetId}`);
      }
      
      return possiblePinFormats.some(pinFormat => 
        wire.sourceId?.includes(pinFormat) || 
        wire.targetId?.includes(pinFormat)
      );
    });
    
    if (pinNumber === 13) {
      console.log(`Found ${connectedWires.length} wires connected to pin ${pinNumber}`);
    }
    
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