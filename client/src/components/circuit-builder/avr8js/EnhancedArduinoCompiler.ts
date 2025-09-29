/**
 * EnhancedArduinoCompiler.ts
 * 
 * Compiles Arduino C++ code to AVR machine code for AVR8js emulation
 * This compiler generates real AVR opcodes from parsed Arduino instructions
 */

import { ArduinoCodeParser, ArduinoInstruction } from '../simulator/ArduinoCodeParser';

export interface CompilationSuccess {
  success: true;
  program: Uint16Array;
  programSize: number;
  usedPins: number[];
  serialEnabled: boolean;
}

export interface CompilationError {
  success: false;
  errors: string[];
  line?: number;
}

export type CompilationResult = CompilationSuccess | CompilationError;

/**
 * AVR Opcode Generator
 * Generates real AVR assembly opcodes for common Arduino operations
 */
class AVROpcodeGenerator {
  private code: number[] = [];
  private pinToDDRMap: Map<number, { port: string; bit: number }> = new Map();
  
  constructor() {
    this.initializePinMapping();
  }
  
  /**
   * Initialize Arduino pin to AVR port/bit mapping (ATmega328P)
   */
  private initializePinMapping() {
    // Digital pins 0-7 -> PORTD bits 0-7
    for (let i = 0; i <= 7; i++) {
      this.pinToDDRMap.set(i, { port: 'D', bit: i });
    }
    // Digital pins 8-13 -> PORTB bits 0-5
    for (let i = 8; i <= 13; i++) {
      this.pinToDDRMap.set(i, { port: 'B', bit: i - 8 });
    }
    // Analog pins A0-A5 (14-19) -> PORTC bits 0-5
    for (let i = 14; i <= 19; i++) {
      this.pinToDDRMap.set(i, { port: 'C', bit: i - 14 });
    }
  }
  
  /**
   * Get DDR and PORT register addresses for a given AVR port
   */
  private getPortAddresses(port: string): { ddr: number; port: number } {
    const addresses = {
      'B': { ddr: 0x24, port: 0x25 },
      'C': { ddr: 0x27, port: 0x28 },
      'D': { ddr: 0x2A, port: 0x2B }
    };
    return addresses[port as 'B' | 'C' | 'D'] || addresses['B'];
  }
  
  /**
   * Generate pinMode(pin, mode) opcodes
   */
  generatePinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP') {
    const mapping = this.pinToDDRMap.get(pin);
    if (!mapping) return;
    
    const { ddr, port: portAddr } = this.getPortAddresses(mapping.port);
    const bitMask = 1 << mapping.bit;
    
    if (mode === 'OUTPUT') {
      // Set DDR bit to 1 (output)
      // sbi DDRx, bit - Set bit in I/O register
      this.code.push(0x9A00 | (ddr << 3) | mapping.bit);
    } else {
      // Clear DDR bit to 0 (input)
      // cbi DDRx, bit - Clear bit in I/O register
      this.code.push(0x9800 | (ddr << 3) | mapping.bit);
      
      if (mode === 'INPUT_PULLUP') {
        // Set PORT bit to 1 (enable pullup)
        this.code.push(0x9A00 | (portAddr << 3) | mapping.bit);
      }
    }
  }
  
  /**
   * Generate digitalWrite(pin, value) opcodes
   */
  generateDigitalWrite(pin: number, value: 'HIGH' | 'LOW') {
    const mapping = this.pinToDDRMap.get(pin);
    if (!mapping) return;
    
    const { port } = this.getPortAddresses(mapping.port);
    
    if (value === 'HIGH') {
      // sbi PORTx, bit - Set bit in PORT register
      this.code.push(0x9A00 | (port << 3) | mapping.bit);
    } else {
      // cbi PORTx, bit - Clear bit in PORT register
      this.code.push(0x9800 | (port << 3) | mapping.bit);
    }
  }
  
  /**
   * Generate delay(ms) opcodes
   * This creates a nested loop for the delay
   */
  generateDelay(delayMs: number) {
    // At 16MHz, we need approximately 16000 cycles per millisecond
    // We'll use nested loops to create the delay
    
    // Calculate loop iterations
    const cyclesPerMs = 16000;
    const totalCycles = delayMs * cyclesPerMs;
    
    // Use a simple approximation: outer loop * inner loop ≈ total cycles
    const outerLoop = Math.min(255, Math.floor(Math.sqrt(totalCycles / 4)));
    const innerLoop = Math.floor(totalCycles / (outerLoop * 4));
    
    // ldi r24, innerLoop
    this.code.push(0xE800 | ((innerLoop & 0xF0) << 4) | (innerLoop & 0x0F));
    
    // delay_inner:
    const innerLoopStart = this.code.length;
    // dec r24
    this.code.push(0x958A);
    // brne delay_inner
    this.code.push(0xF7F1);
    
    // ldi r25, outerLoop
    this.code.push(0xE900 | ((outerLoop & 0xF0) << 4) | (outerLoop & 0x0F));
    
    // delay_outer:
    const outerLoopStart = this.code.length;
    // dec r25
    this.code.push(0x959A);
    // brne delay_outer
    this.code.push(0xF7F1);
  }
  
  /**
   * Generate analogWrite(pin, value) opcodes (PWM)
   * This is simplified - in real AVR we'd use timer/counter registers
   */
  generateAnalogWrite(pin: number, value: number) {
    // For now, treat PWM as digital HIGH if value > 128, LOW otherwise
    // A full PWM implementation would require timer setup
    if (value > 128) {
      this.generateDigitalWrite(pin, 'HIGH');
    } else if (value > 0) {
      // Could implement software PWM here
      this.generateDigitalWrite(pin, 'HIGH');
    } else {
      this.generateDigitalWrite(pin, 'LOW');
    }
  }
  
  /**
   * Generate rjmp (relative jump) opcode
   */
  generateJump(offset: number) {
    // rjmp offset
    this.code.push(0xC000 | (offset & 0x0FFF));
  }
  
  /**
   * Generate nop (no operation)
   */
  generateNop() {
    this.code.push(0x0000);
  }
  
  /**
   * Get the compiled program
   */
  getProgram(): Uint16Array {
    return new Uint16Array(this.code);
  }
  
  /**
   * Get current program size
   */
  getSize(): number {
    return this.code.length;
  }
}

/**
 * Enhanced Arduino Compiler
 * Compiles Arduino code to AVR machine code using real opcodes
 */
export class EnhancedArduinoCompiler {
  private parser: ArduinoCodeParser;
  
  constructor() {
    this.parser = new ArduinoCodeParser();
  }
  
  /**
   * Compile Arduino code to AVR machine code
   */
  compile(code: string): CompilationResult {
    try {
      console.log('[EnhancedCompiler] Starting compilation...');
      
      // Parse the Arduino code
      const parseResult = this.parser.parseCode(code);
      const setupInstructions = parseResult.setup.map(line => 
        this.parser.parseInstruction(line)
      ).filter(inst => inst !== null) as ArduinoInstruction[];
      
      const loopInstructions = parseResult.loop.map(line => 
        this.parser.parseInstruction(line)
      ).filter(inst => inst !== null) as ArduinoInstruction[];
      
      console.log('[EnhancedCompiler] Setup instructions:', setupInstructions.length);
      console.log('[EnhancedCompiler] Loop instructions:', loopInstructions.length);
      
      if (setupInstructions.length === 0 && loopInstructions.length === 0) {
        return {
          success: false,
          errors: ['No valid Arduino instructions found in code']
        };
      }
      
      // Generate machine code
      const generator = new AVROpcodeGenerator();
      const usedPins: Set<number> = new Set();
      let serialEnabled = false;
      
      // Compile setup() instructions
      console.log('[EnhancedCompiler] Compiling setup()...');
      for (const inst of setupInstructions) {
        this.compileInstruction(inst, generator, usedPins);
        if (inst.instruction.includes('Serial')) {
          serialEnabled = true;
        }
      }
      
      // Mark the start of the loop
      const loopStart = generator.getSize();
      
      // Compile loop() instructions
      console.log('[EnhancedCompiler] Compiling loop()...');
      for (const inst of loopInstructions) {
        this.compileInstruction(inst, generator, usedPins);
        if (inst.instruction.includes('Serial')) {
          serialEnabled = true;
        }
      }
      
      // Jump back to loop start
      const jumpOffset = loopStart - generator.getSize() - 1;
      generator.generateJump(jumpOffset);
      
      // Get the compiled program
      const program = generator.getProgram();
      
      console.log('[EnhancedCompiler] Compilation successful!');
      console.log('[EnhancedCompiler] Program size:', program.length, 'words');
      console.log('[EnhancedCompiler] Used pins:', Array.from(usedPins));
      
      return {
        success: true,
        program,
        programSize: program.length,
        usedPins: Array.from(usedPins),
        serialEnabled
      };
      
    } catch (error) {
      console.error('[EnhancedCompiler] Compilation error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Compile a single Arduino instruction to AVR opcodes
   */
  private compileInstruction(
    inst: ArduinoInstruction, 
    generator: AVROpcodeGenerator, 
    usedPins: Set<number>
  ) {
    console.log('[EnhancedCompiler] Compiling:', inst.instruction);
    
    // pinMode
    if (inst.instruction.includes('pinMode') && inst.pin !== undefined) {
      const mode = inst.instruction.includes('OUTPUT') ? 'OUTPUT' : 
                   inst.instruction.includes('INPUT_PULLUP') ? 'INPUT_PULLUP' : 'INPUT';
      generator.generatePinMode(inst.pin, mode);
      usedPins.add(inst.pin);
    }
    
    // digitalWrite
    else if (inst.instruction.includes('digitalWrite') && inst.pin !== undefined) {
      const value = inst.value as 'HIGH' | 'LOW';
      generator.generateDigitalWrite(inst.pin, value);
      usedPins.add(inst.pin);
    }
    
    // analogWrite
    else if (inst.instruction.includes('analogWrite') && inst.pin !== undefined) {
      const value = typeof inst.value === 'number' ? inst.value : 0;
      generator.generateAnalogWrite(inst.pin, value);
      usedPins.add(inst.pin);
    }
    
    // delay
    else if (inst.delayMs !== undefined) {
      generator.generateDelay(inst.delayMs);
    }
    
    // For other instructions, add a nop for now
    else {
      generator.generateNop();
    }
  }
}
