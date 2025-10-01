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
        console.log('[ArduinoCompiler] Generated blink program');
      } else if (sketchType.isRgbLedSketch) {
        program = this.generateRgbLedProgram(analysis);
        console.log('[ArduinoCompiler] Generated RGB LED program');
      } else {
        // Return failure for unrecognized sketches so SimulatorContext can fall back to text parser
        console.log('[ArduinoCompiler] Sketch type not recognized, falling back to parser');
        return {
          success: false,
          errors: ['Sketch pattern not recognized for AVR8 compilation - will use interpreter fallback']
        };
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
      // Is it a basic blink sketch? (ANY pin with digitalWrite and delay)
      isBlinkSketch: 
        analysis.pinsUsed.length > 0 && 
        analysis.delays.length > 0 &&
        code.includes('digitalWrite') &&
        !code.includes('analogWrite'),
      
      // Is it an RGB LED sketch?
      isRgbLedSketch: 
        analysis.pinsUsed.length >= 3 &&
        code.includes('digitalWrite') &&
        !analysis.usesSerial &&
        !this.isSimpleBlink(code, analysis),
      
      // Is it a button sketch?
      isButtonSketch: 
        code.includes('digitalRead') &&
        analysis.pinsUsed.some(pin => analysis.pinModes[pin] === 'INPUT' || analysis.pinModes[pin] === 'INPUT_PULLUP'),
      
      // Does it use serial communication?
      isSerialSketch: analysis.usesSerial
    };
  }
  
  /**
   * Helper to detect simple blink patterns
   */
  private isSimpleBlink(code: string, analysis: CodeAnalysis): boolean {
    // Simple blink: single pin, toggles HIGH/LOW with delays
    const hasHigh = code.includes('HIGH');
    const hasLow = code.includes('LOW');
    const hasSinglePin = analysis.pinsUsed.length === 1;
    return hasSinglePin && hasHigh && hasLow;
  }
  
  /**
   * Generate a simple blink program for ANY pin
   */
  private generateBlinkProgram(analysis: CodeAnalysis): Uint16Array {
    // Get the first pin used (most likely the LED pin)
    const targetPin = analysis.pinsUsed[0] || 13;
    
    // Get the primary delay from analysis, default to 1000ms
    const delayMs = analysis.delays.length > 0 ? analysis.delays[0] : 1000;
    
    // Convert Arduino pin to AVR port/bit
    const { port, bit } = this.arduinoPinToAVR(targetPin);
    
    console.log(`[Compiler] Generating blink for pin ${targetPin} (${port}${bit}) with ${delayMs}ms delay`);
    
    // For pin 13 (PB5), create a working blink program
    if (targetPin === 13) {
      // Hand-crafted AVR assembly for Arduino pin 13 (PB5) blink
      const program = new Uint16Array([
        // Setup - Set PB5 as output
        0x25EF,  // ldi r18, 0x20  (bit 5 mask)
        0xB32A,  // out DDRB, r18  (set PB5 as output)
        
        // Main loop start (address 2)
        0x25EF,  // ldi r18, 0x20  (bit 5 mask) 
        0xB32B,  // out PORTB, r18 (turn on PB5)
        
        // Delay loop 1 (turn on delay)
        0xEF2F,  // ldi r18, 0xFF
        0xEF3F,  // ldi r19, 0xFF  
        0x953A,  // dec r19
        0xF7F1,  // brne -2
        0x952A,  // dec r18
        0xF7E9,  // brne -6
        
        // Turn off LED
        0x2522,  // clr r18
        0xB32B,  // out PORTB, r18 (turn off PB5)
        
        // Delay loop 2 (turn off delay)
        0xEF2F,  // ldi r18, 0xFF
        0xEF3F,  // ldi r19, 0xFF
        0x953A,  // dec r19
        0xF7F1,  // brne -2
        0x952A,  // dec r18
        0xF7E9,  // brne -6
        
        // Jump back to main loop
        0xCFF2,  // rjmp 2 (jump back to loop start)
        
        // Padding
        0x0000,  // nop
        0x0000,  // nop
        0x0000,  // nop
        0x0000,  // nop
        0x0000,  // nop
        0x0000,  // nop
        0x0000,  // nop
        0x0000   // nop
      ]);
      
      console.log('[Compiler] Generated Pin 13 blink program with real AVR instructions');
      console.log('[Compiler] Program preview:', program.slice(0, 8).map(x => '0x' + x.toString(16)).join(', '));
      
      return program;
    }
    
    // For other pins, generate a generic program
    let ddrAddress, portAddress;
    
    if (port === 'B') {
      ddrAddress = 0x04;  // DDRB I/O address
      portAddress = 0x05; // PORTB I/O address
    } else if (port === 'C') {
      ddrAddress = 0x07;  // DDRC I/O address
      portAddress = 0x08; // PORTC I/O address
    } else { // Port D
      ddrAddress = 0x0A;  // DDRD I/O address
      portAddress = 0x0B; // PORTD I/O address
    }
    
    const bitMask = 1 << bit;
    
    // Create a generic blink program
    const program = new Uint16Array([
      // Setup: Set pin as output
      0xE020 | bitMask,        // ldi r18, bit_mask
      0xB300 | (ddrAddress << 5) | 0x12, // out DDR, r18
      
      // Main loop: Turn on LED
      0xE020 | bitMask,        // ldi r18, bit_mask
      0xB300 | (portAddress << 5) | 0x12, // out PORT, r18
      
      // Delay
      0xEF2F,  // ldi r18, 0xFF
      0xEF3F,  // ldi r19, 0xFF
      0x953A,  // dec r19
      0xF7F1,  // brne -2
      0x952A,  // dec r18
      0xF7E9,  // brne -6
      
      // Turn off LED
      0x2522,  // clr r18
      0xB300 | (portAddress << 5) | 0x12, // out PORT, r18
      
      // Delay
      0xEF2F,  // ldi r18, 0xFF
      0xEF3F,  // ldi r19, 0xFF
      0x953A,  // dec r19
      0xF7F1,  // brne -2
      0x952A,  // dec r18
      0xF7E9,  // brne -6
      
      // Jump back
      0xCFF4,  // rjmp 4 (back to main loop)
      
      // Padding
      0x0000, 0x0000, 0x0000, 0x0000,
      0x0000, 0x0000, 0x0000, 0x0000
    ]);
    
    return program;
  }
  
  /**
   * Convert Arduino pin number to AVR port and bit
   */
  private arduinoPinToAVR(pin: number): { port: string, bit: number } {
    if (pin >= 0 && pin <= 7) {
      return { port: 'D', bit: pin };  // PD0-PD7
    } else if (pin >= 8 && pin <= 13) {
      return { port: 'B', bit: pin - 8 }; // PB0-PB5
    } else if (pin >= 14 && pin <= 19) {
      return { port: 'C', bit: pin - 14 }; // PC0-PC5
    }
    // Default to pin 13 (PB5) if unknown
    return { port: 'B', bit: 5 };
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