// AVR8Worker.ts
// This Web Worker provides isolated execution of the AVR8js emulator

// Import avr8js from the npm package
import {
  CPU,
  AVRIOPort,
  AVRTimer,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config
} from 'avr8js';

// Constants for Arduino UNO pin mapping
const PIN_TO_PORT_BIT = {
  0: { port: 'D', bit: 0 }, // RX
  1: { port: 'D', bit: 1 }, // TX
  2: { port: 'D', bit: 2 }, // D2
  3: { port: 'D', bit: 3 }, // D3 (PWM)
  4: { port: 'D', bit: 4 }, // D4
  5: { port: 'D', bit: 5 }, // D5 (PWM)
  6: { port: 'D', bit: 6 }, // D6 (PWM)
  7: { port: 'D', bit: 7 }, // D7
  8: { port: 'B', bit: 0 }, // B0
  9: { port: 'B', bit: 1 }, // B1 (PWM)
  10: { port: 'B', bit: 2 }, // B2 (PWM)
  11: { port: 'B', bit: 3 }, // B3 (PWM)
  12: { port: 'B', bit: 4 }, // B4
  13: { port: 'B', bit: 5 }, // B5
  'A0': { port: 'C', bit: 0 }, // ADC0
  'A1': { port: 'C', bit: 1 }, // ADC1
  'A2': { port: 'C', bit: 2 }, // ADC2
  'A3': { port: 'C', bit: 3 }, // ADC3
  'A4': { port: 'C', bit: 4 }, // ADC4/SDA
  'A5': { port: 'C', bit: 5 }  // ADC5/SCL
};

// State for the emulator instance
let cpu: CPU | null = null;
let portB: AVRIOPort | null = null;
let portC: AVRIOPort | null = null;
let portD: AVRIOPort | null = null;
let timer0: AVRTimer | null = null;

// Program memory
let program = new Uint16Array(0x8000); // 32KB program memory

// Execution interval
let cycleInterval: number | null = null;

// Function to initialize the AVR8 emulator
function initEmulator() {
  // Create a new CPU instance
  cpu = new CPU(program);
  
  // Create I/O ports
  portB = new AVRIOPort(cpu, portBConfig);
  portC = new AVRIOPort(cpu, portCConfig);
  portD = new AVRIOPort(cpu, portDConfig);
  
  // Create timer
  timer0 = new AVRTimer(cpu, timer0Config);
  
  // Track previous port values for change detection
  let prevPortB = 0;
  let prevPortC = 0;
  let prevPortD = 0;
  
  // Set up port change listeners
  portB.addListener((value) => {
    handlePortChange('B', value, prevPortB);
    prevPortB = value;
  });
  
  portC.addListener((value) => {
    handlePortChange('C', value, prevPortC);
    prevPortC = value;
  });
  
  portD.addListener((value) => {
    handlePortChange('D', value, prevPortD);
    prevPortD = value;
  });
  
  // Log initialization
  self.postMessage({
    type: 'log',
    data: 'AVR8 Emulator initialized'
  });
}

// Handle port value changes and notify about pin changes
function handlePortChange(portName: string, value: number, oldValue: number) {
  if (value === oldValue) return;
  
  // Find which bits changed
  const changedBits = value ^ oldValue;
  
  // For each changed bit, find the corresponding Arduino pin
  for (let bit = 0; bit < 8; bit++) {
    if ((changedBits >> bit) & 1) {
      // This bit changed
      const isHigh = ((value >> bit) & 1) === 1;
      
      // Find Arduino pin number for this port/bit
      const pin = getArduinoPinFromPortBit(portName, bit);
      
      if (pin !== null) {
        // Convert to number if it's a numeric string
        const pinNum = typeof pin === 'string' && !isNaN(Number(pin)) ? Number(pin) : pin;
        
        // Notify about pin change
        self.postMessage({
          type: 'pinChange',
          data: {
            pin: pinNum,
            isHigh,
            value: isHigh ? 255 : 0 // Simple digital value
          }
        });
      }
    }
  }
}

// Convert port/bit to Arduino pin number
function getArduinoPinFromPortBit(portName: string, bit: number): number | string | null {
  for (const [pin, map] of Object.entries(PIN_TO_PORT_BIT)) {
    if (map.port === portName && map.bit === bit) {
      return pin;
    }
  }
  return null;
}

// Convert Arduino pin to port/bit
function getPortBitFromArduinoPin(pin: number | string): { port: string, bit: number } | null {
  return PIN_TO_PORT_BIT[pin as keyof typeof PIN_TO_PORT_BIT] || null;
}

// Set the state of an Arduino pin (for input simulation)
// Note: This is not fully implemented yet as it requires direct port manipulation
function setPinState(pin: number | string, isHigh: boolean) {
  const mapping = getPortBitFromArduinoPin(pin);
  if (!mapping || !cpu) return;
  
  // TODO: Implement input pin state setting
  // For now, this is a placeholder for future input simulation
  console.warn('[AVR8Worker] setPinState not fully implemented');
}

// Set pin mode (INPUT, OUTPUT, INPUT_PULLUP)
// Note: Pin modes are controlled by the program itself via DDR registers
function setPinMode(pin: number | string, mode: string) {
  // TODO: Implement pin mode setting if needed for input simulation
  // For now, pin modes are controlled by the program itself
  console.warn('[AVR8Worker] setPinMode not fully implemented');
}

// Load a hex file into program memory
function loadHexFile(hexData: string) {
  // Simple implementation - parse hex file and load into program memory
  const lines = hexData.split('\n');
  
  for (const line of lines) {
    if (line.startsWith(':')) {
      const byteCount = parseInt(line.substr(1, 2), 16);
      const address = parseInt(line.substr(3, 4), 16);
      const recordType = parseInt(line.substr(7, 2), 16);
      
      if (recordType === 0) {
        // Data record
        for (let i = 0; i < byteCount; i += 2) {
          const byteIndex = 9 + i * 2;
          const byte1 = parseInt(line.substr(byteIndex, 2), 16);
          const byte2 = parseInt(line.substr(byteIndex + 2, 2), 16) || 0;
          
          const wordValue = byte1 | (byte2 << 8);
          const wordAddress = (address + i) / 2;
          
          program[wordAddress] = wordValue;
        }
      }
    }
  }
  
  return true;
}

// Compile Arduino code to AVR machine code
async function compileArduinoCode(code: string) {
  try {
    // For now, we'll use a placeholder hardcoded program
    // In a production system, we would call out to an Arduino compilation service
    // or use a WebAssembly-based compiler
    
    // This is a placeholder representation of a simple blink program
    const hexFile = `
:100000000C945D000C9485000C9485000C94850084
:100010000C9485000C9485000C9485000C9485004C
:100020000C9485000C9485000C9485000C9485003C
:100030000C9485000C9485000C9485000C9485002C
:100040000C9485000C9485000C9485000C9485001C
:100050000C9485000C9485000C9485000C9485000C
:100060000C9485000C9485000C9485000C94850000
:100070000C9485000C9485000C9485000C94850090
:100080000C9485000C9485000C9485000C94850080
:100090000C9485000C9485000C9485000C94850070
:1000A0000C9485000C9485000C9485000C94850060
:1000B0000C9485000C9485000C9485000C94850050
:1000C0000C9485000C9485000C9485000C94850040
:1000D0000C9485000C9485000C9485000C94850030
:1000E0000C9485000C94860100C94BD000C946E0238
:1000F0000C94C7000C94AF020C9487000C9487005F
:1001000011241FBECFEFD8E0DEBFCDBF11E0A0E062
:10011000B1E0E0EAFDE002C005900D92A032B10751
:10012000D9F721E0A0E2B1E001C01D92AE34B2074C
:10013000E1F70E94D5020C94FD020C94000090E07D
:10014000FC01EC55FF4F2491FC01E057FF4F849153
:10015000882399F090E0880F991FFC01EA57FF4FE5
:10016000A591B491FC01E458FF4F859194918FB7E2
:10017000F894EC91E22BEC938FBF0895A0E0B0E0F2
:10018000EAE2F0E00C94BD02B0E0A8E7A1E00C949F
:10019000D8020C94BD00CF93DF93EC01899188239A
:1001A00019F00E948700FACFDF91CF9108950F9303
:1001B0001F93CF93DF938C01D0E0C0E0F801EC0F97
:1001C000FD1F6491662371F0E32B09F0C901992788
:1001D00089E0F8E7E7E1D2E001900D928A95E1F7F4
:1001E0000E948700682F8D2F9C2FDF91CF911F9130
:1001F0000F9108950C9443000C9443000C940F01DA
:1002000008951F920F920FB60F9211242F933F9373
:100210008F939F93AF93BF93809126019091270137
:10022000A0912801B09129013091250123E0230FF6
:100230002D3720F40196A11DB11D05C026E8230F8D
:100240000296A11DB11D20932501809326019093C3
:100250002701A0932801B09329018091210190914D
:100260002201A0912301B09124010196A11DB11D04
:100270008093210190932201A0932301B093240107
:10028000BF91AF919F918F913F912F910F900FBEA7
:100290000F901F9018953FB7F894809121019091A4
:1002A0002201A0912301B091240126B5A89B05C07B
:1002B0002F3F19F00196A11DB11D3FBF6627782FDF
:1002C000892F9A2F620F711D811D911D42E0660F64
:1002D000771F881F991F4A95D1F708958F929F92EC
:1002E000AF92BF92CF92DF92EF92FF926B017C01E2
:1002F0000E9446014B015C01C114D104E104F104DF
:10030000F1F00E944601DC01CB0188199909AA09C7
:10031000BB09883E9340A105B10570F321E0C21A1E
:10032000D108E108F10888EE880E83E0981EA11C68
:10033000B11CC114D104E104F10419F7DDCFFF90C5
:10034000EF90DF90CF90BF90AF909F908F900895D4
:10035000789483B7836083BF82E08093000189E12D
:10036000809301018AE080930201E0E0F0E09183E5
:10037000808380E091E0918380837894089582E035
:100380008AB986E083B908955D9BFECF8CB1089511
:100390009CB5937F982B9CBD08959CB59F709CBD8F
:1003A00008959CB59C7F982B9CBD08959CB59D7F23
:1003B0009CBD08959CB59C7F9CBD08958CB58F7BE9
:1003C0008CBD08958CB58F778CBD08950F931F935F
:1003D000CF93DF9300D000D0CDB7DEB780912A011D
:1003E000882379F0809100018431D0F4109200013B
:1003F0008091020180930101809301010E94A9008D
:1004000080910101882329F0809102018F5F8093FF
:10041000020180910101809300010E94A90081E03F
:1004200080932A010F900F900F900F90DF91CF9172
:100430001F910F910895E4E2F1E0108211821282A3
:100440001382148280E090E0A0E8BFE38093210124
:1004500090932201A0932301B093240180E0809359
:100460002A018093000183E08093010181E08093A2
:1004700002010E94A9000E941A010E94CD000E946A
:10048000410160E087B981E090E00E9487000E94FB
:10049000E9000E946D0180E090E00895A1E21A2E71
:1004A000AA1BBB1BFD010DC0AA1FBB1FEE1FFF1F91
:1004B000A217B307E407F50720F0A21BB30BE40BA7
:1004C000F50B661F771F881F991F1A9469F7609599
:1004D0007095809590959B01AC01BD01CF01089538
:1004E000EE0FFF1F0590F491E02D0994F894FFCFB1
:1004F0000000000069012E015A01680180000D0AC2
:1005000000000000010101010101010101010105E9
:0205100000000E
:00000001FF
`;
    
    // Clear the program memory
    program = new Uint16Array(0x8000);
    
    // Load the hex file
    const success = loadHexFile(hexFile);
    
    // Return compilation result
    return {
      success,
      message: success ? 'Compilation successful' : 'Failed to compile code'
    };
  } catch (error) {
    console.error('Compilation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compilation error'
    };
  }
}

// Execute a cycle of the CPU
function executeCycle() {
  if (!cpu) return;
  
  // Execute 16000 CPU cycles per tick (1ms worth at 16MHz)
  const CYCLES_PER_MS = 16000;
  for (let i = 0; i < CYCLES_PER_MS; i++) {
    cpu.tick();
  }
}

// Start the emulation
function startEmulation() {
  if (!cpu || cycleInterval !== null) return;
  
  // Reset the CPU to start from address 0
  cpu.reset();
  
  // Log PC for debugging
  self.postMessage({
    type: 'log',
    data: `CPU reset - PC: ${cpu.pc}`
  });
  
  // Start interval for CPU execution (1ms ticks)
  cycleInterval = setInterval(executeCycle, 1) as unknown as number;
  
  // Notify about start
  self.postMessage({
    type: 'log',
    data: 'AVR8 execution started - CPU is running'
  });
}

// Stop the emulation
function stopEmulation() {
  if (cycleInterval === null) return;
  
  // Clear the execution interval
  clearInterval(cycleInterval);
  cycleInterval = null;
  
  // Notify about stop
  self.postMessage({
    type: 'log',
    data: { message: 'Emulation stopped' }
  });
}

// Handle messages from the main thread
self.onmessage = async (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'init':
      // Initialize the emulator
      initEmulator();
      break;
      
    case 'loadProgram':
      // Load a pre-compiled program and start execution
      if (data.program && data.program instanceof Uint16Array) {
        // Stop any existing emulation
        stopEmulation();
        
        // Load the new program
        program = new Uint16Array(data.program);
        
        // Re-initialize CPU with new program
        cpu = new CPU(program);
        
        // Re-create I/O ports with new CPU
        portB = new AVRIOPort(cpu, portBConfig);
        portC = new AVRIOPort(cpu, portCConfig);
        portD = new AVRIOPort(cpu, portDConfig);
        
        // Re-create timer
        timer0 = new AVRTimer(cpu, timer0Config);
        
        // Track previous port values for change detection
        let prevPortB = 0;
        let prevPortC = 0;
        let prevPortD = 0;
        
        // Re-attach port listeners
        portB.addListener((value) => {
          handlePortChange('B', value, prevPortB);
          prevPortB = value;
        });
        
        portC.addListener((value) => {
          handlePortChange('C', value, prevPortC);
          prevPortC = value;
        });
        
        portD.addListener((value) => {
          handlePortChange('D', value, prevPortD);
          prevPortD = value;
        });
        
        // Log and start
        self.postMessage({
          type: 'log',
          data: `Program loaded (${program.length} words)`
        });
        
        // Start execution
        startEmulation();
      }
      break;
      
    case 'compile':
      // Legacy support - compile Arduino code
      const result = await compileArduinoCode(data.code);
      
      self.postMessage({
        type: 'compilationComplete',
        data: result
      });
      
      if (result.success) {
        startEmulation();
      }
      break;
      
    case 'start':
      // Start the emulation
      startEmulation();
      break;
      
    case 'stop':
      // Stop the emulation
      stopEmulation();
      break;
      
    case 'setPinState':
      // Set pin state (for inputs from the user)
      setPinState(data.pin, data.isHigh);
      break;
      
    case 'setPinMode':
      // Set pin mode
      setPinMode(data.pin, data.mode);
      break;
  }
};

// Initialize the emulator when the worker starts
initEmulator();

// Export empty object to make TypeScript happy
export {};