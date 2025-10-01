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

// Port change tracking
let prevPortB = 0;
let prevPortC = 0;
let prevPortD = 0;

// Function to initialize the AVR8 emulator
function initEmulator() {
  try {
    // Create a new CPU instance
    cpu = new CPU(program);

    // Create I/O ports
    portB = new AVRIOPort(cpu, portBConfig);
    portC = new AVRIOPort(cpu, portCConfig);
    portD = new AVRIOPort(cpu, portDConfig);

    // Create timer
    timer0 = new AVRTimer(cpu, timer0Config);

    // Reset port tracking
    prevPortB = 0;
    prevPortC = 0;
    prevPortD = 0;

    // Set up port change listeners using the avr8js port listeners
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

    // Reset CPU
    cpu.reset();
    cpu.pc = 0;
    cpu.cycles = 0;

    // Log initialization
    self.postMessage({
      type: 'log',
      data: 'AVR8 Emulator initialized successfully'
    });

    console.log('[AVR8Worker] Emulator initialized, PC:', cpu.pc);

  } catch (error) {
    console.error('[AVR8Worker] Initialization error:', error);
    self.postMessage({
      type: 'log',
      data: `Initialization error: ${error.message}`
    });
  }
}

// Handle port value changes and notify about pin changes
function handlePortChange(port: string, currentValue: number, prevValue: number) {
  console.log(`[AVR8Worker] Port ${port} changed: 0x${prevValue.toString(16)} → 0x${currentValue.toString(16)}`);

  // Check each bit for changes
  for (let bit = 0; bit < 8; bit++) {
    const mask = 1 << bit;
    const wasHigh = (prevValue & mask) !== 0;
    const isHigh = (currentValue & mask) !== 0;

    if (wasHigh !== isHigh) {
      // Convert to Arduino pin number
      let arduinoPin;
      if (port === 'B') {
        arduinoPin = bit + 8; // PB0-PB7 = Arduino pins 8-15 (but only 8-13 exist)
        if (bit > 5) return; // Only PB0-PB5 exist on Arduino
      } else if (port === 'C') {
        arduinoPin = bit + 14; // PC0-PC5 = Arduino A0-A5 (pins 14-19)
        if (bit > 5) return; // Only PC0-PC5 exist
      } else if (port === 'D') {
        arduinoPin = bit; // PD0-PD7 = Arduino pins 0-7
      } else {
        return;
      }

      console.log(`[AVR8Worker] Arduino Pin ${arduinoPin} (${port}${bit}) changed: ${wasHigh ? 'HIGH' : 'LOW'} → ${isHigh ? 'HIGH' : 'LOW'}`);

      // Send pin change message to main thread
      self.postMessage({
        type: 'pinChange',
        data: { pin: arduinoPin, isHigh }
      });

      // Special logging for pin 13
      if (arduinoPin === 13) {
        console.log(`[AVR8Worker] 🔴 PIN 13 CHANGE DETECTED: ${isHigh ? 'HIGH' : 'LOW'}`);
        self.postMessage({
          type: 'log',
          data: `🔴 PIN 13 (Built-in LED) ${isHigh ? 'ON' : 'OFF'}`
        });
      }
    }
  }
}

// Function to start the emulation cycle
function startEmulation() {
  if (!cpu) {
    self.postMessage({
      type: 'log',
      data: 'Error: CPU not initialized'
    });
    return;
  }

  console.log('[AVR8Worker] Starting emulation cycle...');

  // Start execution loop with realistic timing
  cycleInterval = setInterval(() => {
    try {
      // Execute cycles (16MHz = 16,000,000 cycles per second)
      // At 60 FPS, that's ~266,667 cycles per frame
      // Let's do smaller chunks to be responsive
      const cyclesToExecute = 10000;

      for (let i = 0; i < cyclesToExecute; i++) {
        cpu.tick();

        // Check for port changes every few cycles by reading memory directly
        if (i % 100 === 0) {
          const currentPortB = cpu.data[0x25] || 0;
          const currentPortC = cpu.data[0x28] || 0;
          const currentPortD = cpu.data[0x2B] || 0;

          if (currentPortB !== prevPortB) {
            handlePortChange('B', currentPortB, prevPortB);
            prevPortB = currentPortB;
          }
          if (currentPortC !== prevPortC) {
            handlePortChange('C', currentPortC, prevPortC);
            prevPortC = currentPortC;
          }
          if (currentPortD !== prevPortD) {
            handlePortChange('D', currentPortD, prevPortD);
            prevPortD = currentPortD;
          }
        }
      }

    } catch (error) {
      console.error('[AVR8Worker] Execution error:', error);
      self.postMessage({
        type: 'log',
        data: `Execution error: ${error.message}`
      });
      stopEmulation();
    }
  }, 16); // ~60 FPS

  self.postMessage({
    type: 'log',
    data: 'Emulation cycle started'
  });
}

// Function to stop emulation
function stopEmulation() {
  if (cycleInterval !== null) {
    clearInterval(cycleInterval);
    cycleInterval = null;
  }

  self.postMessage({
    type: 'log',
    data: 'Emulation stopped'
  });
}

// Main message handler
self.onmessage = function(event) {
  const { type, data } = event.data;

  console.log(`[AVR8Worker] Received message: ${type}`);

  switch (type) {
    case 'loadProgram':
      // Load program into memory
      if (data && data.program) {
        program.fill(0); // Clear existing program

        // Copy new program
        for (let i = 0; i < Math.min(data.program.length, program.length); i++) {
          program[i] = data.program[i];
        }

        console.log(`[AVR8Worker] Program loaded: ${data.program.length} words`);

        // Initialize emulator
        initEmulator();

        // Start emulation
        startEmulation();

        self.postMessage({
          type: 'log',
          data: `Program loaded and emulation started (${data.program.length} words)`
        });
      } else {
        self.postMessage({
          type: 'log',
          data: 'Error: No program data received'
        });
      }
      break;

    case 'stop':
      stopEmulation();
      break;

    default:
      console.warn('[AVR8Worker] Unknown message type:', type);
  }
};

// Log that worker is ready
console.log('[AVR8Worker] Worker ready and waiting for messages');