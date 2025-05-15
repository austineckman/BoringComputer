/**
 * TypeScript declaration file for RealAVR8Emulator
 */

export interface RealAVR8EmulatorOptions {
  onPinChange?: (pin: number | string, isHigh: boolean, options?: any) => void;
  onSerialByte?: (value: number, char: string) => void;
  onError?: (message: string) => void;
  onLogMessage?: (message: string) => void;
}

export interface CompilationResult {
  success: boolean;
  error?: string;
  program?: number[];
  metadata?: {
    pinsUsed: (number | string)[];
  };
}

export class RealAVR8Emulator {
  constructor(options?: RealAVR8EmulatorOptions);
  
  // State properties
  pinStates: Record<string | number, boolean>;
  analogValues: Record<string | number, number>;
  running: boolean;
  program: number[] | null;
  
  // Methods
  loadCode(code: string): Promise<CompilationResult>;
  start(): void;
  stop(): void;
  reset(): void;
  setDigitalInput(pin: number | string, isHigh: boolean): void;
  setAnalogInput(pin: string, value: number): void;
  
  // Logging methods
  log(message: string): void;
  
  // Static methods
  static detectPinsUsed(code: string): (number | string)[];
  static parseDelays(code: string): number[];
}