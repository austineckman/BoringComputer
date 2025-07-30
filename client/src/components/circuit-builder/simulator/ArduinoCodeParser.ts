/**
 * ArduinoCodeParser.ts - Parse and execute Arduino C++ code line by line
 */

export interface CodeLine {
  lineNumber: number;
  content: string;
  type: 'setup' | 'loop' | 'function' | 'declaration' | 'comment' | 'empty';
}

export interface ArduinoInstruction {
  lineNumber: number;
  instruction: string;
  pin?: number;
  value?: 'HIGH' | 'LOW' | number;
  delayMs?: number;
}

export class ArduinoCodeParser {
  private setupLines: CodeLine[] = [];
  private loopLines: CodeLine[] = [];
  private currentCode: string = '';
  private variables: Map<string, number> = new Map(); // Store variable declarations

  parseCode(code: string): { setup: CodeLine[], loop: CodeLine[] } {
    console.log('ArduinoCodeParser: Starting to parse code');
    console.log('ArduinoCodeParser: Code length:', code.length);
    
    this.currentCode = code;
    this.setupLines = [];
    this.loopLines = [];
    this.variables.clear(); // Reset variables

    // First pass: extract variable declarations
    this.extractVariables(code);

    const lines = code.split('\n');
    let currentSection: 'none' | 'setup' | 'loop' = 'none';
    let braceDepth = 0;

    console.log('ArduinoCodeParser: Total lines to process:', lines.length);

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      const lineNumber = index + 1;

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
        return;
      }

      console.log(`ArduinoCodeParser: Line ${lineNumber}: "${trimmedLine}" (Section: ${currentSection}, Depth: ${braceDepth})`);

      // Track braces FIRST
      const openBraces = (trimmedLine.match(/\{/g) || []).length;
      const closeBraces = (trimmedLine.match(/\}/g) || []).length;
      const braceDelta = openBraces - closeBraces;

      // Detect setup() function
      if (trimmedLine.includes('void setup()') || trimmedLine.includes('void setup(')) {
        console.log('ArduinoCodeParser: Found void setup() function');
        currentSection = 'setup';
        braceDepth = braceDelta; // Start with the braces on this line
        console.log(`ArduinoCodeParser: Setup function found, initial braceDepth: ${braceDepth}`);
        return;
      }

      // Detect loop() function
      if (trimmedLine.includes('void loop()') || trimmedLine.includes('void loop(')) {
        console.log('ArduinoCodeParser: Found void loop() function');
        currentSection = 'loop';
        braceDepth = braceDelta; // Start with the braces on this line
        console.log(`ArduinoCodeParser: Loop function found, initial braceDepth: ${braceDepth}`);
        return;
      }

      // Update brace depth for regular lines
      braceDepth += braceDelta;
      
      if (braceDelta !== 0) {
        console.log(`ArduinoCodeParser: Brace change: +${openBraces} -{closeBraces} = ${braceDelta}, new depth: ${braceDepth}`);
      }

      // Add lines to appropriate section
      if (currentSection === 'setup' && braceDepth > 0) {
        console.log(`ArduinoCodeParser: Adding line ${lineNumber} to SETUP: "${trimmedLine}"`);
        this.setupLines.push({
          lineNumber,
          content: trimmedLine,
          type: 'setup'
        });
      } else if (currentSection === 'loop' && braceDepth > 0) {
        console.log(`ArduinoCodeParser: Adding line ${lineNumber} to LOOP: "${trimmedLine}"`);
        this.loopLines.push({
          lineNumber,
          content: trimmedLine,
          type: 'loop'
        });
      }

      // Reset section when we exit the function
      if (braceDepth === 0 && currentSection !== 'none') {
        console.log(`ArduinoCodeParser: Exiting ${currentSection} section (braceDepth = 0)`);
        currentSection = 'none';
      }
    });

    console.log(`ArduinoCodeParser: Parsing complete. Setup lines: ${this.setupLines.length}, Loop lines: ${this.loopLines.length}`);
    console.log('ArduinoCodeParser: Setup lines:', this.setupLines);
    console.log('ArduinoCodeParser: Loop lines:', this.loopLines);

    return { setup: this.setupLines, loop: this.loopLines };
  }

  // Extract variable declarations from the entire code
  private extractVariables(code: string): void {
    console.log('ArduinoCodeParser: Extracting variables');
    
    // Match variable declarations like: int redPin = 9; and #define RED_PIN 9
    const variableRegex = /(?:int|const\s+int)\s+(\w+)\s*=\s*(\d+)|#define\s+(\w+)\s+(\d+)/g;
    
    let match;
    while ((match = variableRegex.exec(code)) !== null) {
      let variableName, value;
      
      if (match[1] && match[2]) {
        // int/const int format: int redPin = 9;
        variableName = match[1];
        value = parseInt(match[2]);
      } else if (match[3] && match[4]) {
        // #define format: #define RED_PIN 9
        variableName = match[3];
        value = parseInt(match[4]);
      }
      
      if (variableName && value !== undefined && !isNaN(value)) {
        this.variables.set(variableName, value);
        console.log(`ArduinoCodeParser: Found variable ${variableName} = ${value}`);
      }
    }
    
    console.log('ArduinoCodeParser: Variables extracted:', Array.from(this.variables.entries()));
  }

  // Resolve a variable name to its value
  private resolveVariable(variableName: string): number | null {
    if (variableName === 'LED_BUILTIN') return 13;
    if (/^\d+$/.test(variableName)) return parseInt(variableName);
    
    const value = this.variables.get(variableName);
    if (value !== undefined) {
      console.log(`ArduinoCodeParser: Resolved ${variableName} to ${value}`);
      return value;
    }
    
    console.warn(`ArduinoCodeParser: Unknown variable: ${variableName}`);
    return null;
  }

  parseInstruction(codeLine: CodeLine): ArduinoInstruction | null {
    const line = codeLine.content;
    const lineNumber = codeLine.lineNumber;

    console.log(`ArduinoCodeParser: Parsing line ${lineNumber}: "${line}"`);

    // Parse pinMode(pin, mode)
    const pinModeMatch = line.match(/pinMode\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/);
    if (pinModeMatch) {
      const pin = this.resolveVariable(pinModeMatch[1]);
      const instruction = {
        lineNumber,
        instruction: `pinMode(${pin}, ${pinModeMatch[2]})`,
        pin: pin ?? undefined
      };
      console.log(`ArduinoCodeParser: Found pinMode instruction:`, instruction);
      return instruction;
    }

    // Parse digitalWrite(pin, value)
    const digitalWriteMatch = line.match(/digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/);
    if (digitalWriteMatch) {
      const pin = this.resolveVariable(digitalWriteMatch[1]);
      const value = digitalWriteMatch[2] as 'HIGH' | 'LOW';
      const instruction = {
        lineNumber,
        instruction: `digitalWrite(${pin}, ${value})`,
        pin: pin ?? undefined,
        value
      };
      console.log(`ArduinoCodeParser: Found digitalWrite instruction:`, instruction);
      return instruction;
    }

    // Parse delay(ms)
    const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/);
    if (delayMatch) {
      const instruction = {
        lineNumber,
        instruction: `delay(${delayMatch[1]})`,
        delayMs: parseInt(delayMatch[1])
      };
      console.log(`ArduinoCodeParser: Found delay instruction:`, instruction);
      return instruction;
    }

    // Parse Serial.print/println
    const serialMatch = line.match(/Serial\.(print|println)\s*\((.*)\)/);
    if (serialMatch) {
      const instruction = {
        lineNumber,
        instruction: `Serial.${serialMatch[1]}(${serialMatch[2]})`
      };
      console.log(`ArduinoCodeParser: Found serial instruction:`, instruction);
      return instruction;
    }

    console.log(`ArduinoCodeParser: No instruction found for line ${lineNumber}: "${line}"`);
    return null;
  }

  getSetupInstructions(): ArduinoInstruction[] {
    return this.setupLines
      .map(line => this.parseInstruction(line))
      .filter(instruction => instruction !== null) as ArduinoInstruction[];
  }

  getLoopInstructions(): ArduinoInstruction[] {
    return this.loopLines
      .map(line => this.parseInstruction(line))
      .filter(instruction => instruction !== null) as ArduinoInstruction[];
  }
}