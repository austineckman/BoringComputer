import { AVRRunner, CPU } from 'avr8js';
import { loadHex } from './utils/hexLoader';

export interface PinState {
  pin: number;
  port: string;
  value: boolean;
  mode: 'input' | 'output';
}

export interface EmulationState {
  running: boolean;
  pins: PinState[];
  registers: Record<string, number>;
  frequency: number;
  cycleCount: number;
  time: number;
  serialOutput: string;
}

export interface CompilationResult {
  success: boolean;
  hex: string | null;
  errors: string[];
  warnings: string[];
}

export class AVR8EmulationService {
  private runner: AVRRunner | null = null;
  private cpu: CPU | null = null;
  private code: string = '';
  private pinStates: PinState[] = [];
  private serialOutput: string = '';
  private pinChangeCallbacks: ((pins: PinState[]) => void)[] = [];
  private serialCallbacks: ((output: string) => void)[] = [];
  private stateChangeCallbacks: ((state: EmulationState) => void)[] = [];
  private frequency: number = 16000000; // 16MHz default Arduino clock
  private running: boolean = false;
  private cycleCount: number = 0;
  private startTime: number = 0;
  private lastRenderTime: number = 0;

  constructor() {
    // Initialize default pin states for Arduino Uno pins
    this.initializePins();
  }

  private initializePins() {
    // Arduino Uno digital pins 0-13
    for (let i = 0; i <= 13; i++) {
      const portInfo = this.getPinPortInfo(i);
      this.pinStates.push({
        pin: i,
        port: portInfo.port,
        value: false,
        mode: 'input', // Default to input
      });
    }

    // Arduino Uno analog pins A0-A5
    for (let i = 0; i <= 5; i++) {
      const pinNumber = i + 14; // A0 is pin 14, etc.
      const portInfo = this.getPinPortInfo(pinNumber);
      this.pinStates.push({
        pin: pinNumber,
        port: portInfo.port,
        value: false,
        mode: 'input', // Default to input
      });
    }
  }

  private getPinPortInfo(pin: number) {
    // Map Arduino pin numbers to ATmega328P ports and pins
    // This mapping is specific to Arduino Uno
    const pinMapping: Record<number, { port: string; bit: number }> = {
      0: { port: 'D', bit: 0 }, // PD0, RX
      1: { port: 'D', bit: 1 }, // PD1, TX
      2: { port: 'D', bit: 2 }, // PD2
      3: { port: 'D', bit: 3 }, // PD3, PWM
      4: { port: 'D', bit: 4 }, // PD4
      5: { port: 'D', bit: 5 }, // PD5, PWM
      6: { port: 'D', bit: 6 }, // PD6, PWM
      7: { port: 'D', bit: 7 }, // PD7
      8: { port: 'B', bit: 0 }, // PB0
      9: { port: 'B', bit: 1 }, // PB1, PWM
      10: { port: 'B', bit: 2 }, // PB2, PWM, SS
      11: { port: 'B', bit: 3 }, // PB3, PWM, MOSI
      12: { port: 'B', bit: 4 }, // PB4, MISO
      13: { port: 'B', bit: 5 }, // PB5, SCK, LED_BUILTIN
      14: { port: 'C', bit: 0 }, // PC0, A0
      15: { port: 'C', bit: 1 }, // PC1, A1
      16: { port: 'C', bit: 2 }, // PC2, A2
      17: { port: 'C', bit: 3 }, // PC3, A3
      18: { port: 'C', bit: 4 }, // PC4, A4, SDA
      19: { port: 'C', bit: 5 }, // PC5, A5, SCL
    };

    return pinMapping[pin] || { port: '?', bit: 0 };
  }

  setCode(code: string) {
    this.code = code;
  }

  loadHex(hexData: string) {
    if (!hexData) {
      return false;
    }

    try {
      const program = loadHex(hexData);
      this.setupEmulation(program);
      return true;
    } catch (error) {
      console.error('Failed to load hex:', error);
      return false;
    }
  }

  private setupEmulation(program: Uint8Array) {
    this.stop();
    this.serialOutput = '';
    this.cycleCount = 0;

    // Create new CPU and runner
    this.runner = new AVRRunner(program, {
      frequency: this.frequency,
    });
    this.cpu = this.runner.cpu;

    // Set up USART for serial output
    this.runner.usart.onByteTransmit = (value) => {
      const char = String.fromCharCode(value);
      this.serialOutput += char;
      // Notify all serial output listeners
      this.serialCallbacks.forEach(callback => callback(this.serialOutput));
    };

    // Initialize pin states based on the CPU
    this.updatePins();
  }

  start() {
    if (!this.runner || this.running) {
      return;
    }

    this.running = true;
    this.startTime = performance.now();
    this.lastRenderTime = this.startTime;
    this.runEmulation();
  }

  stop() {
    this.running = false;
  }

  private runEmulation() {
    if (!this.running || !this.runner) {
      return;
    }

    // Execute a batch of instructions
    try {
      for (let i = 0; i < 10000; i++) {
        this.runner.execute(1);
        this.cycleCount++;
      }

      // Update pin states and notify listeners
      this.updatePins();

      // Update overall emulation state
      this.notifyStateChange();

      // Continue the emulation loop
      requestAnimationFrame(() => this.runEmulation());
    } catch (error) {
      console.error('Emulation error:', error);
      this.stop();
    }
  }

  private updatePins() {
    if (!this.cpu) {
      return;
    }

    // Update pin states based on current CPU state
    this.pinStates.forEach((pinState, index) => {
      const portInfo = this.getPinPortInfo(pinState.pin);
      const portRegister = this.cpu!.data[`PORT${portInfo.port}`];
      const ddrRegister = this.cpu!.data[`DDR${portInfo.port}`];
      const pinRegister = this.cpu!.data[`PIN${portInfo.port}`];

      // Update pin mode (input/output) based on DDR register
      const isDDRBitSet = !!(ddrRegister & (1 << portInfo.bit));
      pinState.mode = isDDRBitSet ? 'output' : 'input';

      // Update pin value based on PORT register for outputs or PIN register for inputs
      if (pinState.mode === 'output') {
        pinState.value = !!(portRegister & (1 << portInfo.bit));
      } else {
        pinState.value = !!(pinRegister & (1 << portInfo.bit));
      }
    });

    // Notify all pin change listeners
    this.pinChangeCallbacks.forEach(callback => callback([...this.pinStates]));
  }

  private notifyStateChange() {
    const currentTime = performance.now();
    const elapsedTime = (currentTime - this.startTime) / 1000; // in seconds

    const state: EmulationState = {
      running: this.running,
      pins: [...this.pinStates],
      registers: this.getRegisterValues(),
      frequency: this.frequency,
      cycleCount: this.cycleCount,
      time: elapsedTime,
      serialOutput: this.serialOutput,
    };

    // Notify all state change listeners
    this.stateChangeCallbacks.forEach(callback => callback(state));
  }

  private getRegisterValues(): Record<string, number> {
    if (!this.cpu) {
      return {};
    }

    const registers: Record<string, number> = {};

    // Add general purpose registers (r0-r31)
    for (let i = 0; i <= 31; i++) {
      registers[`r${i}`] = this.cpu.data[i];
    }

    // Add special registers
    registers['PC'] = this.cpu.pc;
    registers['SP'] = this.cpu.sp;
    registers['SREG'] = this.cpu.data[0x5F]; // Status register

    // Add I/O registers for ports
    ['B', 'C', 'D'].forEach(port => {
      registers[`PORT${port}`] = this.cpu.data[`PORT${port}`];
      registers[`DDR${port}`] = this.cpu.data[`DDR${port}`];
      registers[`PIN${port}`] = this.cpu.data[`PIN${port}`];
    });

    return registers;
  }

  setInputPin(pin: number, value: boolean) {
    if (!this.cpu) {
      return;
    }

    // Find pin information
    const portInfo = this.getPinPortInfo(pin);
    if (!portInfo) {
      return;
    }

    // Check if the pin is configured as input
    const ddrRegister = this.cpu.data[`DDR${portInfo.port}`];
    const isInput = !(ddrRegister & (1 << portInfo.bit));

    if (isInput) {
      // Update PIN register to simulate input
      const pinRegister = this.cpu.data[`PIN${portInfo.port}`];
      if (value) {
        this.cpu.data[`PIN${portInfo.port}`] = pinRegister | (1 << portInfo.bit);
      } else {
        this.cpu.data[`PIN${portInfo.port}`] = pinRegister & ~(1 << portInfo.bit);
      }

      // Update our internal pin state
      const pinIndex = this.pinStates.findIndex(p => p.pin === pin);
      if (pinIndex >= 0) {
        this.pinStates[pinIndex].value = value;
      }

      // Notify pin change
      this.pinChangeCallbacks.forEach(callback => callback([...this.pinStates]));
    }
  }

  getPinState(pin: number): PinState | undefined {
    return this.pinStates.find(p => p.pin === pin);
  }

  getAllPinStates(): PinState[] {
    return [...this.pinStates];
  }

  getEmulationState(): EmulationState {
    return {
      running: this.running,
      pins: [...this.pinStates],
      registers: this.getRegisterValues(),
      frequency: this.frequency,
      cycleCount: this.cycleCount,
      time: this.running ? (performance.now() - this.startTime) / 1000 : 0,
      serialOutput: this.serialOutput,
    };
  }

  // Register for pin change events
  onPinChange(callback: (pins: PinState[]) => void) {
    this.pinChangeCallbacks.push(callback);
    return () => {
      this.pinChangeCallbacks = this.pinChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register for serial output events
  onSerialOutput(callback: (output: string) => void) {
    this.serialCallbacks.push(callback);
    // Immediately send the current state
    callback(this.serialOutput);
    return () => {
      this.serialCallbacks = this.serialCallbacks.filter(cb => cb !== callback);
    };
  }

  // Register for overall state change events
  onStateChange(callback: (state: EmulationState) => void) {
    this.stateChangeCallbacks.push(callback);
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  reset() {
    // Reset the emulator to initial state
    if (this.runner) {
      this.runner.reset();
      this.serialOutput = '';
      this.cycleCount = 0;
      this.startTime = performance.now();
      this.updatePins();
      this.notifyStateChange();
    }
  }

  // Set the CPU frequency
  setFrequency(frequency: number) {
    this.frequency = frequency;
    if (this.runner) {
      this.runner.frequency = frequency;
    }
  }

  isRunning(): boolean {
    return this.running;
  }
}