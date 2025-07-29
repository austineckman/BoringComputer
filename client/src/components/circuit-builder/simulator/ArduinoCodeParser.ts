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

  parseCode(code: string): { setup: CodeLine[], loop: CodeLine[] } {
    console.log('ArduinoCodeParser: Starting to parse code');
    console.log('ArduinoCodeParser: Code length:', code.length);
    
    this.currentCode = code;
    this.setupLines = [];
    this.loopLines = [];

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

  parseInstruction(codeLine: CodeLine): ArduinoInstruction | null {
    const line = codeLine.content;
    const lineNumber = codeLine.lineNumber;

    // Parse pinMode(pin, mode)
    const pinModeMatch = line.match(/pinMode\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/);
    if (pinModeMatch) {
      const pin = pinModeMatch[1] === 'LED_BUILTIN' ? 13 : parseInt(pinModeMatch[1]);
      return {
        lineNumber,
        instruction: `pinMode(${pin}, ${pinModeMatch[2]})`,
        pin
      };
    }

    // Parse digitalWrite(pin, value)
    const digitalWriteMatch = line.match(/digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/);
    if (digitalWriteMatch) {
      const pin = digitalWriteMatch[1] === 'LED_BUILTIN' ? 13 : parseInt(digitalWriteMatch[1]);
      const value = digitalWriteMatch[2] as 'HIGH' | 'LOW';
      return {
        lineNumber,
        instruction: `digitalWrite(${pin}, ${value})`,
        pin,
        value
      };
    }

    // Parse delay(ms)
    const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/);
    if (delayMatch) {
      return {
        lineNumber,
        instruction: `delay(${delayMatch[1]})`,
        delayMs: parseInt(delayMatch[1])
      };
    }

    // Parse Serial.print/println
    const serialMatch = line.match(/Serial\.(print|println)\s*\((.*)\)/);
    if (serialMatch) {
      return {
        lineNumber,
        instruction: `Serial.${serialMatch[1]}(${serialMatch[2]})`
      };
    }

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