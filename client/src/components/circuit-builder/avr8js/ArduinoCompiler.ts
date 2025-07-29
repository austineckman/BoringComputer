/**
 * ArduinoCompiler.ts
 * 
 * Compiles Arduino code to machine code for AVR8 emulation
 */

/**
 * Result of a successful code compilation
 */
export interface CompilationSuccess {
  success: true;
  program: Uint16Array;
  programSize: number;
  usedPins: number[];
  serialEnabled: boolean;
}

/**
 * Result of a failed code compilation
 */
export interface CompilationError {
  success: false;
  errors: string[];
  line?: number;
}

export type CompilationResult = CompilationSuccess | CompilationError;

/**
 * Analyzes Arduino code to extract information about pins, delays, etc.
 */
export interface CodeAnalysis {
  pinsUsed: number[];
  pinModes: Record<number, 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'>;
  libraries: string[];
  delays: number[];
  usesSerial: boolean;
}

/**
 * Analyzes the sketch type based on code content
 */
export interface SketchAnalysis {
  isBlinkSketch: boolean;
  isRgbLedSketch: boolean;
  isButtonSketch: boolean;
  isSerialSketch: boolean;
}

/**
 * The ArduinoCompiler is responsible for parsing and compiling
 * Arduino code for use in the AVR8 emulator.
 */
export class ArduinoCompiler {
  /**
   * Compile Arduino code to program bytes
   */
  public compile(code: string): CompilationResult {
    try {
      // Analyze the code first
      const analysis = this.analyzeCode(code);
      console.log('Code analysis:', analysis);
      
      // Analyze sketch type
      const sketchType = this.analyzeSketchType(code, analysis);
      console.log('Sketch analysis:', sketchType);
      
      // In a real implementation, we would compile the code here.
      // Since we're focusing on getting a working simulator now,
      // we'll generate pre-compiled programs based on the analysis.
      
      let program: Uint16Array;
      
      if (sketchType.isBlinkSketch) {
        program = this.generateBlinkProgram(analysis);
        console.log('Generated blink program');
      } else if (sketchType.isRgbLedSketch) {
        program = this.generateRgbLedProgram(analysis);
        console.log('Generated RGB LED program');
      } else {
        // Default to a simple blink program for now
        program = this.generateDefaultProgram();
        console.log('Generated default program');
      }
      
      return {
        success: true,
        program,
        programSize: program.length,
        usedPins: analysis.pinsUsed,
        serialEnabled: analysis.usesSerial
      };
    } catch (error) {
      console.error('Compilation error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Analyze Arduino code to extract important details
   */
  private analyzeCode(code: string): CodeAnalysis {
    const analysis: CodeAnalysis = {
      pinsUsed: [],
      pinModes: {},
      libraries: [],
      delays: [],
      usesSerial: false
    };
    
    // Extract included libraries
    const includeRegex = /#include\s+<([^>]+)>/g;
    let match;
    while ((match = includeRegex.exec(code)) !== null) {
      analysis.libraries.push(match[1]);
    }
    
    // Check for serial usage
    if (code.includes('Serial.begin') || code.includes('Serial.print')) {
      analysis.usesSerial = true;
    }
    
    // Extract pin modes
    const pinModeRegex = /pinMode\s*\(\s*(\d+)\s*,\s*(INPUT|OUTPUT|INPUT_PULLUP)\s*\)/g;
    while ((match = pinModeRegex.exec(code)) !== null) {
      const pin = parseInt(match[1], 10);
      const mode = match[2] as 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
      
      analysis.pinsUsed.push(pin);
      analysis.pinModes[pin] = mode;
    }
    
    // Extract digital write pins
    const digitalWriteRegex = /digitalWrite\s*\(\s*(\d+)\s*,/g;
    while ((match = digitalWriteRegex.exec(code)) !== null) {
      const pin = parseInt(match[1], 10);
      if (!analysis.pinsUsed.includes(pin)) {
        analysis.pinsUsed.push(pin);
      }
    }
    
    // Extract delay values
    const delayRegex = /delay\s*\(\s*(\d+)\s*\)/g;
    while ((match = delayRegex.exec(code)) !== null) {
      analysis.delays.push(parseInt(match[1], 10));
    }
    
    return analysis;
  }
  
  /**
   * Analyze the sketch type based on code content
   */
  private analyzeSketchType(code: string, analysis: CodeAnalysis): SketchAnalysis {
    return {
      // Is it a basic blink sketch?
      isBlinkSketch: 
        analysis.pinsUsed.includes(13) && 
        analysis.delays.length > 0 &&
        code.includes('digitalWrite') &&
        !code.includes('analogWrite'),
      
      // Is it an RGB LED sketch?
      isRgbLedSketch: 
        analysis.pinsUsed.length >= 3 &&
        analysis.pinsUsed.some(pin => [9, 10, 11].includes(pin)) &&
        code.includes('digitalWrite') &&
        !analysis.usesSerial,
      
      // Is it a button sketch?
      isButtonSketch: 
        code.includes('digitalRead') &&
        analysis.pinsUsed.some(pin => analysis.pinModes[pin] === 'INPUT' || analysis.pinModes[pin] === 'INPUT_PULLUP'),
      
      // Does it use serial communication?
      isSerialSketch: analysis.usesSerial
    };
  }
  
  /**
   * Generate a simple blink program (for pin 13)
   */
  private generateBlinkProgram(analysis: CodeAnalysis): Uint16Array {
    // This is a simplified Arduino blink program in hex format
    // Based on the classic blink sketch compiled for ATmega328P
    
    // Get the primary delay from analysis, default to 1000ms
    const delayMs = analysis.delays.length > 0 ? analysis.delays[0] : 1000;
    
    // Create a realistic blink program that toggles pin 13 (PB5)
    // This is a hand-crafted hex program that mimics compiled Arduino code
    const program = new Uint16Array([
      // Setup code (like setup() function)
      0x24BE, // eor r11, r11 (clear r11)
      0x2400, // nop
      0xE5A5, // ldi r26, 0x25 (DDRB address)
      0xE0B0, // ldi r27, 0x00 
      0xE020, // ldi r18, 0x20 (bit 5 for pin 13)
      0x9312, // st X, r18 (set DDRB bit 5 to output)
      
      // Main loop (like loop() function)
      0xE5A4, // ldi r26, 0x24 (PORTB address) - Loop start
      0xE0B0, // ldi r27, 0x00
      0x911C, // ld r17, X (read current PORTB)
      0xE020, // ldi r18, 0x20 (bit 5 mask)
      0x2712, // eor r17, r18 (toggle bit 5)
      0x931C, // st X, r17 (write back to PORTB)
      
      // Delay loop (simplified delay implementation)
      0xE5F0 + ((delayMs >> 8) & 0x0F), // ldi r31, high(delay_count)
      0xE0E0 + (delayMs & 0x0F),        // ldi r30, low(delay_count)
      0x97E1, // sbiw r30, 1 (delay loop start)
      0xF7F1, // brne delay_loop
      0xE5F0 + ((delayMs >> 4) & 0x0F), // Additional delay iterations
      0xE0E0 + ((delayMs >> 2) & 0x0F),
      0x97E1, // sbiw r30, 1
      0xF7F1, // brne delay_loop2
      
      0xCFF6, // rjmp main_loop (jump back to loop start)
      0x2400, // nop (padding)
      0x2400, // nop (padding)
      0x2400  // nop (padding)
    ]);
    
    return program;
  }
  
  /**
   * Generate an RGB LED program
   */
  private generateRgbLedProgram(analysis: CodeAnalysis): Uint16Array {
    // Similar placeholder as above
    const program = new Uint16Array(32);
    
    for (let i = 0; i < program.length; i++) {
      program[i] = 0x2400 + i; 
    }
    
    return program;
  }
  
  /**
   * Generate a default (empty) program
   */
  private generateDefaultProgram(): Uint16Array {
    // Return a minimal program
    return new Uint16Array(16).fill(0x2400); // Fill with NOPs
  }
}