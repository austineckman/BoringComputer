import { registerComponentHandler } from './ComponentRegistry';

/**
 * LED component handlers - version 1.0.0
 * This file contains stable handlers for LED components
 */

// Component type
const COMPONENT_TYPE = 'LED';
// Component version
const COMPONENT_VERSION = '1.0.0';

/**
 * Check if an LED is properly wired in the circuit
 * 
 * @param {string} ledId - The ID of the LED component
 * @returns {boolean} - Whether the LED is properly wired
 */
export function checkLEDWiring(ledId) {
  console.log(`[STABLE LED v${COMPONENT_VERSION}] Checking wiring for ${ledId}`);
  
  // Accessing the simulatorContext
  const { wires } = window.simulatorContext || { wires: [] };
  
  // If no wires, the LED can't be properly wired
  if (!wires || wires.length === 0) {
    console.log("No wires found in the circuit");
    return false;
  }
  
  // Extract LED base ID (without pin part)
  const ledBaseId = ledId.includes('led-') ? 
      ledId.substring(0, ledId.lastIndexOf('-')) : 
      ledId;
  
  // For LED, we need at least one connection to a digital pin
  // and one connection to either GND or another component
  let hasAnodeConnection = false;
  let hasCathodeConnection = false;
  
  for (const wire of wires) {
    // Skip invalid wires
    if (!wire || !wire.sourceId || !wire.targetId) continue;
    
    try {
      // Check if the wire involves our LED
      const isSourceLED = wire.sourceComponent && wire.sourceComponent.includes(ledBaseId);
      const isTargetLED = wire.targetComponent && wire.targetComponent.includes(ledBaseId);
      
      if (isSourceLED || isTargetLED) {
        // Get the LED pin name
        const ledPinName = isSourceLED ? wire.sourceName : wire.targetName;
        
        // Check anode connection (usually pin 'A')
        if (ledPinName === 'A') {
          hasAnodeConnection = true;
        }
        
        // Check cathode connection (usually pin 'C')
        if (ledPinName === 'C') {
          hasCathodeConnection = true;
        }
      }
    } catch (error) {
      console.error("Error checking LED wiring:", error);
    }
  }
  
  // For LED to be properly wired, both anode and cathode must be connected
  return hasAnodeConnection && hasCathodeConnection;
}

/**
 * Update the LED state based on pin values
 * 
 * @param {string} ledId - The ID of the LED component
 * @param {Object} pinValues - Pin values from Arduino
 * @returns {Object} - The updated LED state
 */
export function updateLEDState(ledId, pinValues) {
  console.log(`[STABLE LED v${COMPONENT_VERSION}] Updating state for ${ledId}`);
  
  // Connect the LED to the Arduino pins
  // This uses a simplified approach - in a real application,
  // we would need to trace the connections through the wires
  
  let isOn = false;
  
  // Get wire connections for this LED
  const { wires } = window.simulatorContext || { wires: [] };
  
  if (!wires || wires.length === 0) {
    return { isLit: false };
  }
  
  // Extract LED base ID (without pin part)
  const ledBaseId = ledId.includes('led-') ? 
      ledId.substring(0, ledId.lastIndexOf('-')) : 
      ledId;
  
  // Find the Arduino pin connected to the LED's anode (A)
  let anodePin = null;
  let cathodePin = null;
  
  for (const wire of wires) {
    // Skip invalid wires
    if (!wire || !wire.sourceId || !wire.targetId) continue;
    
    try {
      // Check for LED anode connection (sourcing current)
      if (wire.sourceComponent && wire.sourceComponent.includes(ledBaseId) && wire.sourceName === 'A') {
        // LED anode is the source, target is the controlling pin
        if (wire.targetComponent && wire.targetComponent.includes('heroboard')) {
          anodePin = wire.targetName;
        }
      } 
      else if (wire.targetComponent && wire.targetComponent.includes(ledBaseId) && wire.targetName === 'A') {
        // LED anode is the target, source is the controlling pin
        if (wire.sourceComponent && wire.sourceComponent.includes('heroboard')) {
          anodePin = wire.sourceName;
        }
      }
      
      // Check for LED cathode connection (sinking current)
      if (wire.sourceComponent && wire.sourceComponent.includes(ledBaseId) && wire.sourceName === 'C') {
        // LED cathode is the source, target is the ground or controlling pin
        if (wire.targetComponent && wire.targetComponent.includes('heroboard')) {
          cathodePin = wire.targetName;
        }
      } 
      else if (wire.targetComponent && wire.targetComponent.includes(ledBaseId) && wire.targetName === 'C') {
        // LED cathode is the target, source is the ground or controlling pin
        if (wire.sourceComponent && wire.sourceComponent.includes('heroboard')) {
          cathodePin = wire.sourceName;
        }
      }
    } catch (error) {
      console.error("Error checking LED connections:", error);
    }
  }
  
  // Determine LED state based on connections
  if (anodePin && cathodePin) {
    // For the LED to be on:
    // 1. If connected to digital pins: anode must be HIGH and cathode LOW
    // 2. If anode connected to power (5V/3.3V) and cathode to digital: cathode must be LOW
    // 3. If anode connected to digital and cathode to GND: anode must be HIGH
    
    if (cathodePin.includes('GND') || cathodePin.includes('gnd')) {
      // Case 3: Cathode to GND, anode to digital pin
      if (anodePin.match(/^\d+$/)) {
        // Anode connected to digital pin
        const pinNum = parseInt(anodePin);
        isOn = pinValues.heroboard && pinValues.heroboard.pins && pinValues.heroboard.pins[pinNum] === true;
      }
    } 
    else if (anodePin.includes('5V') || anodePin.includes('3.3V')) {
      // Case 2: Anode to power, cathode to digital pin
      if (cathodePin.match(/^\d+$/)) {
        // Cathode connected to digital pin
        const pinNum = parseInt(cathodePin);
        isOn = pinValues.heroboard && pinValues.heroboard.pins && pinValues.heroboard.pins[pinNum] === false;
      }
    }
    else {
      // Case 1: Both connected to digital pins
      if (anodePin.match(/^\d+$/) && cathodePin.match(/^\d+$/)) {
        const anodePinNum = parseInt(anodePin);
        const cathodePinNum = parseInt(cathodePin);
        
        const anodeValue = pinValues.heroboard && pinValues.heroboard.pins && pinValues.heroboard.pins[anodePinNum] === true;
        const cathodeValue = pinValues.heroboard && pinValues.heroboard.pins && pinValues.heroboard.pins[cathodePinNum] === false;
        
        isOn = anodeValue && cathodeValue;
      }
    }
  }
  
  return { isLit: isOn };
}

// Register all handlers with the component registry
registerComponentHandler(COMPONENT_TYPE, 'checkWiring', checkLEDWiring, COMPONENT_VERSION);
registerComponentHandler(COMPONENT_TYPE, 'updateState', updateLEDState, COMPONENT_VERSION);

// Export for direct use if needed
export default {
  version: COMPONENT_VERSION,
  checkLEDWiring,
  updateLEDState
};