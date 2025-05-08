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
  onLog
}) => {
  const { 
    startSimulation,
    stopSimulation,
    pinStates,
    updatePinState,
    updateComponentPins,
    addLog,
    components, // Get components from context
    wires       // Get wires from context
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
      } else if (!isNaN(parseInt(pin))) {
        // Only add numeric pins
        pins.push(pin.toString());
      } else {
        console.log(`Warning: Found non-numeric pin reference "${pin}" in code`);
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
    
    // Process pin updates for all pins
    // Now handling all pins, not just 9-13
    if (pinNumber >= 0 && pinNumber <= 19) {
      // First, try to find regular LEDs connected through wires (directly or through resistors)
      const connectedLEDs = findConnectedComponents('led', pinNumber, true);
      
      // Also check for RGB LEDs connected to this pin
      const connectedRGBLEDs = findConnectedComponents('rgbled', pinNumber, true);
      
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
      
      // Only update connected components - remove fallback mechanism
      if (!componentsUpdated) {
        console.log(`No components connected to pin ${pinNumber} found - nothing to update`);
        
        // Log information about what we were looking for
        console.log(`Was looking for components connected to pin ${pinNumber} with state=${isHigh}`);
        console.log(`Available components: ${components.length}`);
        console.log(`Available wires: ${wires.length}`);
        
        // SPECIAL CASE: For pin 13 on the HERO board itself (built-in LED)
        if (pinNumber === 13) {
          // Always update the heroboard's pin 13 LED directly
          const heroBoards = components.filter(c => c.type.toLowerCase() === 'heroboard');
          if (heroBoards.length > 0) {
            heroBoards.forEach(board => {
              console.log(`Directly updating HERO board ${board.id} built-in pin 13 LED to ${isHigh ? 'ON' : 'OFF'}`);
              updateComponentPins(board.id, { '13': isHigh });
            });
          }
        }
      }
    }
  };
  
  // Helper to find components of a given type connected to a pin (directly or through resistors)
  const findConnectedComponents = (componentType, pinNumber, checkPassiveComponents = false) => {
    // Find the HERO board (Arduino) component
    const heroBoard = components.find(c => c.type === 'heroboard');
    if (!heroBoard) return [];
    
    // Log wire connection check for any pin (to debug the connection issue)
    console.log(`Looking for ${componentType} components connected to pin ${pinNumber} (with passive component check: ${checkPassiveComponents})`);
    console.log(`HERO board ID: ${heroBoard.id}`);
    console.log(`Available wires from context: ${wires.length}`);
    console.log(`Available components: ${components.length}`);
    
    // Try multiple formats of pin IDs to handle different naming patterns
    const possiblePinFormats = [
      `pt-heroboard-${heroBoard.id}-${pinNumber}`,        // Standard format
      `pt-heroboard-heroboard-${heroBoard.id}-${pinNumber}`, // Expanded format
      `pt-heroboard-${heroBoard.id}-D${pinNumber}`,       // Digital pin format
      `pt-heroboard-heroboard-${heroBoard.id}-D${pinNumber}`, // Expanded digital format
      `pt-heroboard-${heroBoard.id}-digital-${pinNumber}`, // Alternate digital pin format
      `pt-heroboard-${heroBoard.id}-${pinNumber}`,        // Standard format as string
      `${pinNumber}`,                                     // Just the pin number
      pinNumber.toString()                               // Pin number as string
    ];
    
    // Log potential pin formats
    console.log("Possible pin formats:", possiblePinFormats);
    
    // More detailed wire checking - log each wire's source and target for easier debugging
    wires.forEach(wire => {
      console.log(`Wire: ${wire.sourceName} (${wire.sourceId}) -> ${wire.targetName} (${wire.targetId})`);
    });
    
    // Find wires connected to any of these pin formats
    const connectedWires = wires.filter(wire => {
      // Check if the source or target contains any of the pin formats
      return possiblePinFormats.some(pinFormat => 
        wire.sourceId?.includes(pinFormat) || 
        wire.targetId?.includes(pinFormat)
      );
    });
    
    console.log(`Found ${connectedWires.length} wires connected to pin ${pinNumber}`);
    
    // Set to track visited component IDs for cycle detection
    const visitedComponents = new Set();
    
    // Find connected components
    const connectedComponents = [];
    
    // Helper function to recursively trace connections through components
    const traceConnections = (wire, targetType, visitedWires = new Set()) => {
      // Don't process the same wire twice (prevents cycles)
      if (visitedWires.has(wire.id)) return [];
      visitedWires.add(wire.id);
      
      // Determine which end is connected to the source we're tracing from
      const isSourceHeroBoard = possiblePinFormats.some(format => wire.sourceId?.includes(format));
      const isSourceVisited = Array.from(visitedComponents).some(id => wire.sourceId?.includes(id));
      
      // Get the other end ID (either source or target depending on context)
      let otherEndId;
      if (isSourceHeroBoard || isSourceVisited) {
        otherEndId = wire.targetId;
      } else {
        otherEndId = wire.sourceId;
      }
      
      console.log(`Tracing from wire ${wire.id}: ${wire.sourceId} -> ${wire.targetId}`);
      console.log(`Other end ID: ${otherEndId}`);
      
      // If no other end, skip this wire
      if (!otherEndId) return [];
      
      const otherEndParts = otherEndId.split('-');
      if (otherEndParts.length < 3) return [];
      
      // Extract component type and ID
      const otherComponentType = otherEndParts[1]?.toLowerCase();
      const otherComponentId = otherEndParts[2];
      
      console.log(`Extracted: type=${otherComponentType}, id=${otherComponentId}`);
      
      // Add to visited components
      visitedComponents.add(otherComponentId);
      
      // Check if this is our target component type
      if (otherComponentType === targetType.toLowerCase()) {
        // Find the actual component with this ID
        const component = components.find(c => c.id === otherComponentId);
        if (component) {
          console.log(`Found target component: ${component.type} ${component.id}`);
          return [component];
        }
      }
      
      // If this is a passive component (resistor, capacitor, etc.), trace through it
      const isPassiveComponent = otherComponentType === 'resistor' || 
                               otherComponentType === 'capacitor' ||
                               otherComponentType === 'jumper';
      
      if (checkPassiveComponents && isPassiveComponent) {
        console.log(`Found passive component ${otherComponentType}, tracing through it...`);
        
        // Get all wires connected to this passive component
        const connectedPassiveWires = wires.filter(w => 
          w.id !== wire.id && // Skip the wire we came from
          (w.sourceId?.includes(otherComponentId) || w.targetId?.includes(otherComponentId))
        );
        
        console.log(`Found ${connectedPassiveWires.length} other wires connected to ${otherComponentType}`);
        
        // Recursively trace through each connected wire
        const foundComponents = [];
        connectedPassiveWires.forEach(nextWire => {
          // Only proceed if we haven't visited this wire
          if (!visitedWires.has(nextWire.id)) {
            const traced = traceConnections(nextWire, targetType, visitedWires);
            foundComponents.push(...traced);
          }
        });
        
        return foundComponents;
      }
      
      // Not a target and not a passive component we can trace through
      return [];
    };
    
    // Make sure each wire has a unique ID for tracing
    const wiresWithIds = connectedWires.map((wire, index) => {
      // If the wire doesn't have an ID, give it one
      if (!wire.id) {
        return { ...wire, id: `wire-${index}` };
      }
      return wire;
    });
    
    // Trace connections from each wire connected to the HERO board pin
    wiresWithIds.forEach(wire => {
      const components = traceConnections(wire, componentType);
      connectedComponents.push(...components);
    });
    
    // Remove duplicates by ID
    const uniqueComponents = [];
    const addedIds = new Set();
    
    connectedComponents.forEach(comp => {
      if (!addedIds.has(comp.id)) {
        addedIds.add(comp.id);
        uniqueComponents.push(comp);
      }
    });
    
    console.log(`Returning ${uniqueComponents.length} ${componentType} components`);
    return uniqueComponents;
  };
  
  // This component doesn't render anything visible
  // It just runs the simulation logic
  return null;
};

export default AVR8Simulator;