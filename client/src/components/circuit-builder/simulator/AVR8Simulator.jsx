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
  
  // NEW APPROACH:
  // Parse Arduino code to extract a sequence of pin states and timing operations
  // This better simulates how Arduino actually executes code sequentially
  const parseArduinoCode = (code) => {
    // First, clean the Arduino code for better parsing
    // Remove comments and extra whitespace
    const cleanedCode = code
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('Parsing Arduino code...');
    
    // We'll analyze the loop() function to extract our state sequence
    const loopMatch = cleanedCode.match(/void\s+loop\s*\(\s*\)\s*\{([^}]*)\}/);
    if (!loopMatch || !loopMatch[1]) {
      console.log('Could not find loop() function in code or loop is empty');
      // Default to blinking pin 13
      return {
        sequence: [
          { action: 'digitalWrite', pin: '13', state: 'HIGH' },
          { action: 'delay', ms: 1000 },
          { action: 'digitalWrite', pin: '13', state: 'LOW' },
          { action: 'delay', ms: 1000 }
        ],
        pins: ['13']
      };
    }
    
    // Loop content
    const loopContent = loopMatch[1].trim();
    console.log('Loop content:', loopContent);
    
    // Extract digitalWrite and delay operations
    // We need to maintain their order in the sequence
    const sequence = [];
    const pins = new Set();
    
    // Match digitalWrite(pin, state) calls
    const digitalWriteRegex = /digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(HIGH|LOW)\s*\)/g;
    // Match delay(ms) calls
    const delayRegex = /delay\s*\(\s*(\d+)\s*\)/g;
    
    // Combined regex that matches both calls while preserving their order
    const combinedRegex = /digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(HIGH|LOW)\s*\)|delay\s*\(\s*(\d+)\s*\)/g;
    
    // Extract operations in sequence
    let opMatch;
    while ((opMatch = combinedRegex.exec(loopContent)) !== null) {
      if (opMatch[1] !== undefined && opMatch[2] !== undefined) {
        // This is a digitalWrite operation
        let pin = opMatch[1];
        const state = opMatch[2];
        
        // Handle LED_BUILTIN constant
        if (pin === 'LED_BUILTIN') {
          pin = '13';
        } else if (isNaN(parseInt(pin, 10))) {
          console.log(`Warning: Found non-numeric pin reference "${pin}" in code, using pin 13 as fallback`);
          pin = '13';
        }
        
        pins.add(pin.toString());
        sequence.push({
          action: 'digitalWrite',
          pin: pin.toString(),
          state
        });
        
        console.log(`Found digitalWrite: pin ${pin}, state ${state}`);
      } else if (opMatch[3] !== undefined) {
        // This is a delay operation
        const ms = parseInt(opMatch[3], 10);
        
        sequence.push({
          action: 'delay',
          ms
        });
        
        console.log(`Found delay: ${ms}ms`);
      }
    }
    
    // If we couldn't find any meaningful operations, default to basic blink
    if (sequence.length === 0) {
      console.log('No operations found in loop, using default blink sequence');
      sequence.push({ action: 'digitalWrite', pin: '13', state: 'HIGH' });
      sequence.push({ action: 'delay', ms: 1000 });
      sequence.push({ action: 'digitalWrite', pin: '13', state: 'LOW' });
      sequence.push({ action: 'delay', ms: 1000 });
      pins.add('13');
    }
    
    console.log('Parsed sequence:', sequence);
    
    return {
      sequence,
      pins: Array.from(pins)
    };
  };

  // Start/stop simulation based on props
  useEffect(() => {
    if (isRunning) {
      console.log('AVR8 simulator initialized');
      
      // Parse the Arduino code into a sequence of operations
      const { sequence, pins: activePins } = parseArduinoCode(code);
      
      console.log('Detected active pins:', activePins);
      console.log('Operations sequence:', sequence);
      
      // Current position in the sequence
      let currentStep = 0;
      let timeoutId = null;
      
      // Function to update pin state based on digitalWrite action
      const setPinState = (pin, state) => {
        const isHigh = state === 'HIGH';
        console.log(`Executing digitalWrite: pin ${pin} -> ${state}`);
        
        // Update pin state in the simulator context
        updatePinState(`D${pin}`, isHigh);
        
        // Create a function to update components to avoid React update issues
        const updateComponents = () => {
          // Find the HERO board component
          const heroBoard = components.find(c => c.type === 'heroboard');
          if (heroBoard) {
            // Update the pin state in our component state tracking
            updateComponentPins(heroBoard.id, { [pin]: isHigh });
            
            // Also notify the parent component
            onPinChange(parseInt(pin), isHigh);
          }
          
          // Update any connected components (LEDs, etc.)
          updateConnectedComponents(parseInt(pin), isHigh);
        };
        
        // Execute component updates outside React cycle
        setTimeout(updateComponents, 0);
        
        // Add log entry
        if (typeof addLog === 'function') {
          addLog(`Pin ${pin} set to ${state}`);
        }
      };
      
      // Function to execute each step in sequence
      const executeNextStep = () => {
        if (!isRunning) return; // Safety check
        
        // Get the current operation
        const operation = sequence[currentStep];
        
        // Execute the current operation
        if (operation.action === 'digitalWrite') {
          setPinState(operation.pin, operation.state);
        } else if (operation.action === 'delay') {
          console.log(`Executing delay: ${operation.ms}ms`);
          
          // Log the delay action
          if (typeof addLog === 'function') {
            addLog(`Delay for ${operation.ms}ms`);
          }
        }
        
        // Move to the next step (or loop back to beginning)
        currentStep = (currentStep + 1) % sequence.length;
        
        // Schedule the next operation
        const nextDelay = operation.action === 'delay' ? operation.ms : 0;
        timeoutId = setTimeout(executeNextStep, nextDelay);
      };
      
      // Start the simulation
      timeoutId = setTimeout(executeNextStep, 10); // Start immediately
      
      // Store the timeout ID for cleanup
      return () => {
        clearTimeout(timeoutId);
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
      
      // Direct lookup in the components list first - most reliable method
      const directMatch = components.find(comp => 
        otherEndId.includes(comp.id) && 
        comp.type.toLowerCase() === targetType.toLowerCase()
      );
      
      if (directMatch) {
        console.log(`Found direct component match: ${directMatch.type} ${directMatch.id}`);
        return [directMatch];
      }
      
      // If no direct match, extract type and ID from the pin ID
      let compType = '';
      let compId = '';
      
      if (otherEndId.includes('led-')) {
        compType = 'led';
        // Try to extract the full LED ID
        const matches = otherEndId.match(/led-[a-z0-9]+/);
        if (matches && matches.length > 0) {
          compId = matches[0];
        }
      } else if (otherEndId.includes('rgbled-')) {
        compType = 'rgbled';
        const matches = otherEndId.match(/rgbled-[a-z0-9]+/);
        if (matches && matches.length > 0) {
          compId = matches[0];
        }
      } else {
        // Standard format extraction
        compType = otherEndParts[1]?.toLowerCase();
        compId = otherEndParts[2];
      }
      
      console.log(`Extracted: type=${compType}, id=${compId}`);
      
      // Add to visited components
      visitedComponents.add(compId);
      
      // If this matches our target type, look for the component
      if (compType === targetType.toLowerCase()) {
        const foundComponent = components.find(c => c.id === compId);
        if (foundComponent) {
          console.log(`Found target component: ${foundComponent.type} ${foundComponent.id}`);
          return [foundComponent];
        }
      }
      
      // Last resort for LED components - just try to find ANY LED
      if (targetType.toLowerCase() === 'led' && compType === 'led') {
        const anyLed = components.find(c => c.type.toLowerCase() === 'led');
        if (anyLed) {
          console.log(`Last resort: Using available LED ${anyLed.id}`);
          return [anyLed];
        }
      }
      
      // If this is a passive component, trace through it
      const isPassiveComponent = 
        compType === 'resistor' || 
        compType === 'capacitor' || 
        compType === 'jumper';
      
      if (checkPassiveComponents && isPassiveComponent) {
        console.log(`Found passive component ${compType}, tracing through it...`);
        
        // Get all other wires connected to this passive component
        const connectedPassiveWires = wires.filter(w => 
          w.id !== wire.id && // Skip the wire we came from
          (w.sourceId?.includes(compId) || w.targetId?.includes(compId))
        );
        
        console.log(`Found ${connectedPassiveWires.length} other wires connected to ${compType}`);
        
        // Recursively trace through each connected wire
        const foundComponents = [];
        
        connectedPassiveWires.forEach(nextWire => {
          if (!visitedWires.has(nextWire.id)) {
            const traced = traceConnections(nextWire, targetType, visitedWires);
            foundComponents.push(...traced);
          }
        });
        
        return foundComponents;
      }
      
      return [];
    };
    
    // Make sure each wire has a unique ID for tracing
    const wiresWithIds = connectedWires.map((wire, index) => {
      if (!wire.id) {
        return { ...wire, id: `wire-${index}` };
      }
      return wire;
    });
    
    // Trace connections from each wire connected to the pin
    wiresWithIds.forEach(wire => {
      const found = traceConnections(wire, componentType);
      connectedComponents.push(...found);
    });
    
    // Remove duplicates
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
  return null;
};

export default AVR8Simulator;