import { registerComponentHandler } from './ComponentRegistry';

/**
 * OLED component handlers - version 1.0.0
 * This file contains stable handlers for OLED display components
 */

// Component type
const COMPONENT_TYPE = 'OLED';
// Component version
const COMPONENT_VERSION = '1.0.0';

/**
 * Check if an OLED display is properly wired in the circuit
 * 
 * @param {string} oledId - The ID of the OLED component
 * @returns {boolean} - Whether the OLED is properly wired
 */
export function checkOLEDWiring(oledId) {
  console.log(`[STABLE OLED v${COMPONENT_VERSION}] Checking wiring for ${oledId}`);
  
  // Accessing the simulatorContext
  const { wires } = window.simulatorContext || { wires: [] };
  
  // If no wires, the OLED can't be properly wired
  if (!wires || wires.length === 0) {
    console.log("No wires found in the circuit");
    return false;
  }
  
  // Extract OLED base ID (without pin part)
  const oledBaseId = oledId.includes('oled-display') ? 
      oledId.substring(0, oledId.lastIndexOf('-')) : 
      oledId;
  
  // For OLED display, we need connections to:
  // 1. SDA (usually A4 on Arduino)
  // 2. SCL (usually A5 on Arduino)
  // 3. VCC (5V or 3.3V)
  // 4. GND
  let hasSDA = false;
  let hasSCL = false;
  let hasVCC = false;
  let hasGND = false;
  
  for (const wire of wires) {
    // Skip invalid wires
    if (!wire || !wire.sourceId || !wire.targetId) continue;
    
    try {
      // Check if the wire involves our OLED display
      const isSourceOLED = wire.sourceComponent && wire.sourceComponent.includes(oledBaseId);
      const isTargetOLED = wire.targetComponent && wire.targetComponent.includes(oledBaseId);
      
      if (isSourceOLED || isTargetOLED) {
        // Get the OLED pin name and its connected pin
        const oledPinName = isSourceOLED ? wire.sourceName : wire.targetName;
        const otherPinName = isSourceOLED ? wire.targetName : wire.sourceName;
        
        // Check for SDA connection
        if (oledPinName && (oledPinName.includes('sda') || oledPinName.includes('data'))) {
          if (otherPinName && (otherPinName === 'A4' || otherPinName === 'a4' || 
              otherPinName.includes('sda') || otherPinName.includes('data'))) {
            hasSDA = true;
          }
        }
        
        // Check for SCL connection
        else if (oledPinName && (oledPinName.includes('scl') || oledPinName.includes('clock'))) {
          if (otherPinName && (otherPinName === 'A5' || otherPinName === 'a5' || 
              otherPinName.includes('scl') || otherPinName.includes('clock'))) {
            hasSCL = true;
          }
        }
        
        // Check for VCC connection
        else if (oledPinName && (oledPinName.includes('vcc') || oledPinName.includes('vdd') || 
                  oledPinName.includes('power'))) {
          if (otherPinName && (otherPinName.includes('5v') || otherPinName.includes('3.3v') || 
              otherPinName.includes('vcc'))) {
            hasVCC = true;
          }
        }
        
        // Check for GND connection
        else if (oledPinName && (oledPinName.includes('gnd') || oledPinName.includes('ground'))) {
          if (otherPinName && (otherPinName.includes('gnd') || otherPinName.includes('ground'))) {
            hasGND = true;
          }
        }
      }
    } catch (error) {
      console.error("Error checking OLED wiring:", error);
    }
  }
  
  // For OLED to be properly wired:
  // - SDA and SCL are absolutely required (I2C communication)
  // - At least one of VCC or GND should be connected for power
  const hasEssentialConnections = hasSDA && hasSCL;
  const hasPowerConnection = hasVCC || hasGND;
  
  console.log(`OLED wiring status: SDA=${hasSDA}, SCL=${hasSCL}, VCC=${hasVCC}, GND=${hasGND}`);
  return hasEssentialConnections && hasPowerConnection;
}

/**
 * Parse OLED commands from Arduino code
 * 
 * @param {string} code - Arduino code to parse
 * @returns {Object} - Parsed OLED commands and status
 */
export function parseOLEDCommands(code) {
  if (!code) return { hasOLEDCode: false, commands: [] };
  
  // Check for Adafruit SSD1306 or U8g2 libraries
  const hasAdafruitLib = code.includes('Adafruit_SSD1306') || code.includes('Adafruit_GFX');
  const hasU8g2Lib = code.includes('U8g2lib') || code.includes('u8g2.begin');
  
  // Extract display initialization
  const initPatterns = [
    /Adafruit_SSD1306\s+\w+\s*\([^)]*\)/g,
    /U8G2_SSD1306[^(]*\([^)]*\)/g,
    /u8g2\.begin\(\)/g
  ];
  
  let initMatches = [];
  for (const pattern of initPatterns) {
    const matches = code.match(pattern);
    if (matches) initMatches = [...initMatches, ...matches];
  }
  
  // Extract display commands
  const commandPatterns = [
    /\.(clearDisplay|display|drawPixel|drawLine|drawRect|fillRect|drawCircle|fillCircle|drawTriangle|fillTriangle|drawRoundRect|fillRoundRect|drawChar|drawText|setCursor|setTextSize|setTextColor|print|println|write)\([^)]*\)/g,
    /\.(clear|clearBuffer|sendBuffer|drawBox|drawFrame|drawStr|drawGlyph|setFont|drawLine|drawHLine|drawVLine|drawCircle|drawDisc|drawEllipse|drawFilledEllipse)\([^)]*\)/g
  ];
  
  let drawCommands = [];
  for (const pattern of commandPatterns) {
    const matches = code.match(pattern);
    if (matches) drawCommands = [...drawCommands, ...matches];
  }
  
  // Check for page mode pattern (U8g2 specific)
  const hasPageMode = code.includes('firstPage') && code.includes('nextPage');
  
  return {
    hasOLEDCode: (hasAdafruitLib || hasU8g2Lib) && (initMatches.length > 0 || drawCommands.length > 0),
    isAdafruitStyle: hasAdafruitLib,
    isU8g2Style: hasU8g2Lib,
    hasPageMode,
    commands: [...initMatches, ...drawCommands],
    initMatches,
    drawCommands
  };
}

/**
 * Create an empty display buffer for an OLED
 * 
 * @param {number} width - Display width in pixels
 * @param {number} height - Display height in pixels 
 * @returns {Array} - 2D array representing display buffer
 */
export function createEmptyBuffer(width = 128, height = 64) {
  return new Array(height).fill(0).map(() => new Array(width).fill(0));
}

// Register all handlers with the component registry
registerComponentHandler(COMPONENT_TYPE, 'checkWiring', checkOLEDWiring, COMPONENT_VERSION);
registerComponentHandler(COMPONENT_TYPE, 'parseCommands', parseOLEDCommands, COMPONENT_VERSION);
registerComponentHandler(COMPONENT_TYPE, 'createEmptyBuffer', createEmptyBuffer, COMPONENT_VERSION);

// Export for direct use if needed
export default {
  version: COMPONENT_VERSION,
  checkOLEDWiring,
  parseOLEDCommands,
  createEmptyBuffer
};