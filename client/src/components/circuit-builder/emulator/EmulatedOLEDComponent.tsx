import React, { useEffect, useRef, useState } from 'react';
import { EmulatedComponent } from './HeroEmulator';

interface EmulatedOLEDComponentProps {
  id: string;
  sclPin: string;
  sdaPin: string;
  resetPin?: string;
  width?: number;
  height?: number;
  i2cAddress?: number;
  className?: string;
  onStateChange?: (displayBuffer: Uint8Array) => void;
}

/**
 * EmulatedOLEDComponent
 * 
 * This component simulates an OLED display that communicates with the
 * microcontroller via I2C. It supports a variety of display libraries 
 * including Adafruit SSD1306, U8g2, and others.
 * 
 * The display is drawn on a canvas and updates in real-time as the
 * microcontroller sends data via I2C.
 */
const EmulatedOLEDComponent: React.FC<EmulatedOLEDComponentProps> = ({
  id,
  sclPin,
  sdaPin,
  resetPin,
  width = 128,
  height = 64,
  i2cAddress = 0x3C, // Default for most SSD1306 OLED displays
  className = '',
  onStateChange
}) => {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Display buffer (one bit per pixel)
  const [displayBuffer, setDisplayBuffer] = useState<Uint8Array>(new Uint8Array(width * height / 8));
  
  // Display mode
  const [displayMode, setDisplayMode] = useState<'normal' | 'inverted'>('normal');
  
  // I2C state
  const [i2cEnabled, setI2cEnabled] = useState(false);
  
  // Draw the display buffer to the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.fillStyle = displayMode === 'normal' ? '#000' : '#fff';
    ctx.fillRect(0, 0, width, height);
    
    // Set pixel color
    ctx.fillStyle = displayMode === 'normal' ? '#fff' : '#000';
    
    // Draw pixels from the buffer
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate byte index and bit position
        const byteIndex = Math.floor((y * width + x) / 8);
        const bitPosition = 7 - ((y * width + x) % 8);
        
        // Check if the pixel is set
        if (displayBuffer[byteIndex] & (1 << bitPosition)) {
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    
    // Notify parent component if needed
    if (onStateChange) {
      onStateChange(displayBuffer);
    }
  }, [displayBuffer, displayMode, width, height, onStateChange]);
  
  // Create an emulated component that can be registered with the HeroEmulator
  useEffect(() => {
    // Command processing state
    let currentCommand = 0;
    let commandData: number[] = [];
    let addressingMode = 0; // 0: Horizontal, 1: Vertical, 2: Page
    let currentColumn = 0;
    let currentPage = 0;
    
    // Buffer for I2C received data
    let i2cBuffer: number[] = [];
    let isCommand = false;
    
    // Function to process a command
    const processCommand = (cmd: number) => {
      // Common SSD1306 commands
      switch (cmd) {
        case 0xAE: // Display off
          console.log('OLED: Display OFF');
          break;
          
        case 0xAF: // Display on
          console.log('OLED: Display ON');
          break;
          
        case 0xA6: // Normal display
          setDisplayMode('normal');
          console.log('OLED: Normal display');
          break;
          
        case 0xA7: // Inverted display
          setDisplayMode('inverted');
          console.log('OLED: Inverted display');
          break;
          
        case 0x20: // Set addressing mode
          console.log('OLED: Set addressing mode');
          // This command requires an additional byte
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0x21: // Set column address
          console.log('OLED: Set column address');
          // This command requires 2 additional bytes
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0x22: // Set page address
          console.log('OLED: Set page address');
          // This command requires 2 additional bytes
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0x40: // Set display start line
        case 0x41: case 0x42: case 0x43: case 0x44: case 0x45: case 0x46: case 0x47:
        case 0x48: case 0x49: case 0x4A: case 0x4B: case 0x4C: case 0x4D: case 0x4E: case 0x4F:
        case 0x50: case 0x51: case 0x52: case 0x53: case 0x54: case 0x55: case 0x56: case 0x57:
        case 0x58: case 0x59: case 0x5A: case 0x5B: case 0x5C: case 0x5D: case 0x5E: case 0x5F:
        case 0x60: case 0x61: case 0x62: case 0x63: case 0x64: case 0x65: case 0x66: case 0x67:
        case 0x68: case 0x69: case 0x6A: case 0x6B: case 0x6C: case 0x6D: case 0x6E: case 0x6F:
        case 0x70: case 0x71: case 0x72: case 0x73: case 0x74: case 0x75: case 0x76: case 0x77:
          console.log(`OLED: Set start line to ${cmd & 0x3F}`);
          break;
          
        case 0x81: // Set contrast
          console.log('OLED: Set contrast');
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0xA8: // Set multiplex ratio
          console.log('OLED: Set multiplex ratio');
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0xC0: // Set scan direction (normal)
        case 0xC8: // Set scan direction (remapped)
          console.log(`OLED: Set scan direction ${cmd === 0xC8 ? 'remapped' : 'normal'}`);
          break;
          
        case 0xD3: // Set display offset
          console.log('OLED: Set display offset');
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0xD5: // Set display clock
          console.log('OLED: Set display clock');
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0xD9: // Set precharge period
          console.log('OLED: Set precharge period');
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0xDA: // Set COM pins hardware configuration
          console.log('OLED: Set COM pins hardware configuration');
          currentCommand = cmd;
          commandData = [];
          return;
          
        case 0xDB: // Set VCOMH deselect level
          console.log('OLED: Set VCOMH deselect level');
          currentCommand = cmd;
          commandData = [];
          return;
          
        default:
          // Try to interpret as column or page address
          if (cmd >= 0x00 && cmd <= 0x0F) {
            // Set column address (lower nibble)
            currentColumn = (currentColumn & 0xF0) | cmd;
            console.log(`OLED: Set column address lower nibble: ${cmd}`);
          } else if (cmd >= 0x10 && cmd <= 0x1F) {
            // Set column address (higher nibble)
            currentColumn = (currentColumn & 0x0F) | ((cmd & 0x0F) << 4);
            console.log(`OLED: Set column address higher nibble: ${cmd & 0x0F}`);
          } else if (cmd >= 0xB0 && cmd <= 0xB7) {
            // Set page address
            currentPage = cmd & 0x07;
            console.log(`OLED: Set page address: ${currentPage}`);
          } else {
            console.log(`OLED: Unknown command: 0x${cmd.toString(16)}`);
          }
      }
      
      // Reset command
      currentCommand = 0;
    };
    
    // Function to process a data byte (for display)
    const processData = (data: number) => {
      // Calculate buffer position based on addressing mode and current column/page
      const bufferPos = currentPage * width + currentColumn;
      
      // Make sure we don't write outside the buffer
      if (bufferPos >= 0 && bufferPos < displayBuffer.length) {
        // Update the buffer
        const newBuffer = new Uint8Array(displayBuffer);
        newBuffer[bufferPos] = data;
        setDisplayBuffer(newBuffer);
      }
      
      // Increment column/page based on addressing mode
      if (addressingMode === 0) {
        // Horizontal addressing mode
        currentColumn++;
        if (currentColumn >= width / 8) {
          currentColumn = 0;
          currentPage++;
          if (currentPage >= height / 8) {
            currentPage = 0;
          }
        }
      } else if (addressingMode === 1) {
        // Vertical addressing mode
        currentPage++;
        if (currentPage >= height / 8) {
          currentPage = 0;
          currentColumn++;
          if (currentColumn >= width / 8) {
            currentColumn = 0;
          }
        }
      } else {
        // Page addressing mode
        currentColumn++;
        if (currentColumn >= width / 8) {
          currentColumn = 0;
        }
      }
    };
    
    // Function to process I2C data
    const processI2C = (data: number[]) => {
      // First byte is control byte
      // Bit 7:0, Bit 6: Co (0: continue, 1: last command), Bits 0-5: 0 for command, 0x40 for data
      if (data.length === 0) return;
      
      const controlByte = data[0];
      const remainingData = data.slice(1);
      
      // Check if this is a command or data
      isCommand = (controlByte & 0x40) === 0;
      
      // Process each byte
      for (const byte of remainingData) {
        if (isCommand) {
          if (currentCommand !== 0) {
            // This is a parameter for a previous command
            commandData.push(byte);
            
            // Process multi-byte commands
            if (currentCommand === 0x20 && commandData.length === 1) {
              // Set addressing mode
              addressingMode = byte & 0x03;
              console.log(`OLED: Addressing mode set to ${addressingMode}`);
              currentCommand = 0;
            } else if (currentCommand === 0x21 && commandData.length === 2) {
              // Set column address
              console.log(`OLED: Column address set to ${commandData[0]}-${commandData[1]}`);
              currentColumn = commandData[0];
              currentCommand = 0;
            } else if (currentCommand === 0x22 && commandData.length === 2) {
              // Set page address
              console.log(`OLED: Page address set to ${commandData[0]}-${commandData[1]}`);
              currentPage = commandData[0];
              currentCommand = 0;
            } else if ((currentCommand === 0x81 || currentCommand === 0xA8 || 
                         currentCommand === 0xD3 || currentCommand === 0xD5 || 
                         currentCommand === 0xD9 || currentCommand === 0xDA || 
                         currentCommand === 0xDB) && commandData.length === 1) {
              // Single parameter commands
              console.log(`OLED: Command 0x${currentCommand.toString(16)} param: 0x${byte.toString(16)}`);
              currentCommand = 0;
            }
          } else {
            // New command
            processCommand(byte);
          }
        } else {
          // Process display data
          processData(byte);
        }
      }
    };
    
    // Define the emulated component for the emulator
    const emulatedOLED: EmulatedComponent = {
      id,
      type: 'oled',
      
      // Method to respond to pin changes
      onPinChange: (pinId: string, isHigh: boolean) => {
        if (pinId === sclPin) {
          // SCL (clock) pin change
          // In a real implementation, we would track I2C state machine
          // This is a simplified version
          console.log(`OLED ${id} SCL pin changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        } 
        else if (pinId === sdaPin) {
          // SDA (data) pin change
          console.log(`OLED ${id} SDA pin changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        }
        else if (pinId === resetPin && resetPin) {
          // Reset pin change
          if (!isHigh) {
            // Active LOW reset
            setDisplayBuffer(new Uint8Array(width * height / 8));
            console.log(`OLED ${id} reset`);
          }
        }
      },
      
      // Method called when I2C data is sent to this device
      onStateChange: (state: any) => {
        if (state && state.i2cData && state.i2cAddress === i2cAddress) {
          // Process I2C data
          processI2C(state.i2cData);
          console.log(`OLED ${id} received I2C data:`, state.i2cData);
        }
      },
      
      // Method to get current state
      getState: () => {
        return {
          displayBuffer,
          width,
          height,
          i2cAddress,
          i2cEnabled
        };
      }
    };
    
    // Expose the emulated component to parent components
    if (window && !window.emulatedComponents) {
      window.emulatedComponents = {};
    }
    
    if (window.emulatedComponents) {
      window.emulatedComponents[id] = emulatedOLED;
      console.log(`OLED component ${id} registered with SCL: ${sclPin}, SDA: ${sdaPin}`);
    }
    
    // Clean up when component unmounts
    return () => {
      if (window.emulatedComponents && window.emulatedComponents[id]) {
        delete window.emulatedComponents[id];
        console.log(`OLED component ${id} unregistered`);
      }
    };
  }, [id, sclPin, sdaPin, resetPin, i2cAddress, width, height, displayBuffer]);
  
  // Calculate styles for the OLED display
  const displayStyle: React.CSSProperties = {
    width: width + 8, // Add some padding
    height: height + 8,
    padding: 4,
    position: 'relative',
    backgroundColor: '#111',
    borderRadius: 2,
    boxShadow: '0 0 0 2px #444',
    overflow: 'hidden'
  };

  // Canvas should be exactly the display dimensions
  const canvasStyle: React.CSSProperties = {
    width: width,
    height: height,
    imageRendering: 'pixelated' // Keep pixels sharp when scaled
  };

  return (
    <div
      className={`emulated-oled ${className}`}
      style={displayStyle}
      data-component-id={id}
      data-component-type="oled"
    >
      {/* OLED Display Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={canvasStyle}
      />
      
      {/* Display the pins at the bottom */}
      <div 
        className="oled-pins"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
          position: 'absolute',
          bottom: -15
        }}
      >
        {/* SCL pin */}
        <div
          className="oled-pin scl-pin"
          style={{
            width: 2,
            height: 8,
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id={sclPin}
        >
          <div
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            {sclPin}
          </div>
        </div>
        
        {/* SDA pin */}
        <div
          className="oled-pin sda-pin"
          style={{
            width: 2,
            height: 8,
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id={sdaPin}
        >
          <div
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            {sdaPin}
          </div>
        </div>
        
        {/* Reset pin (if provided) */}
        {resetPin && (
          <div
            className="oled-pin reset-pin"
            style={{
              width: 2,
              height: 8,
              backgroundColor: '#999',
              position: 'relative'
            }}
            data-pin-id={resetPin}
          >
            <div
              className="pin-label"
              style={{
                position: 'absolute',
                bottom: -15,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '8px',
                color: '#ccc'
              }}
            >
              {resetPin}
            </div>
          </div>
        )}
        
        {/* VCC pin */}
        <div
          className="oled-pin vcc-pin"
          style={{
            width: 2,
            height: 8,
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id="VCC"
        >
          <div
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            VCC
          </div>
        </div>
        
        {/* GND pin */}
        <div
          className="oled-pin gnd-pin"
          style={{
            width: 2,
            height: 8,
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id="GND"
        >
          <div
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            GND
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmulatedOLEDComponent;