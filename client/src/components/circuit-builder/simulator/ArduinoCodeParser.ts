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

    // Parse analogWrite(pin, value)
    const analogWriteMatch = line.match(/analogWrite\s*\(\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*\)/);
    if (analogWriteMatch) {
      const pin = this.resolveVariable(analogWriteMatch[1]);
      const pwmValue = this.resolveVariable(analogWriteMatch[2]) ?? parseInt(analogWriteMatch[2]);
      const instruction = {
        lineNumber,
        instruction: `analogWrite(${pin}, ${pwmValue})`,
        pin: pin ?? undefined,
        value: pwmValue
      };
      console.log(`ArduinoCodeParser: Found analogWrite instruction:`, instruction);
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

    // Parse digitalRead(pin)
    const digitalReadMatch = line.match(/digitalRead\s*\(\s*(\w+|\d+)\s*\)/);
    if (digitalReadMatch) {
      const pin = this.resolveVariable(digitalReadMatch[1]);
      const instruction = {
        lineNumber,
        instruction: `digitalRead(${pin})`,
        pin: pin ?? undefined,
        function: 'digitalRead'
      };
      console.log(`ArduinoCodeParser: Found digitalRead instruction:`, instruction);
      return instruction;
    }

    // Parse analogRead(pin)
    const analogReadMatch = line.match(/analogRead\s*\(\s*(\w+|\d+)\s*\)/);
    if (analogReadMatch) {
      const pin = this.resolveVariable(analogReadMatch[1]);
      const instruction = {
        lineNumber,
        instruction: `analogRead(${pin})`,
        pin: pin ?? undefined,
        function: 'analogRead'
      };
      console.log(`ArduinoCodeParser: Found analogRead instruction:`, instruction);
      return instruction;
    }

    // Parse map(value, fromLow, fromHigh, toLow, toHigh)
    const mapMatch = line.match(/map\s*\(\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*\)/);
    if (mapMatch) {
      const value = this.resolveVariable(mapMatch[1]) ?? parseInt(mapMatch[1]);
      const fromLow = this.resolveVariable(mapMatch[2]) ?? parseInt(mapMatch[2]);
      const fromHigh = this.resolveVariable(mapMatch[3]) ?? parseInt(mapMatch[3]);
      const toLow = this.resolveVariable(mapMatch[4]) ?? parseInt(mapMatch[4]);
      const toHigh = this.resolveVariable(mapMatch[5]) ?? parseInt(mapMatch[5]);
      const instruction = {
        lineNumber,
        instruction: `map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`,
        function: 'map',
        params: { value, fromLow, fromHigh, toLow, toHigh }
      };
      console.log(`ArduinoCodeParser: Found map instruction:`, instruction);
      return instruction;
    }

    // Parse constrain(value, min, max)
    const constrainMatch = line.match(/constrain\s*\(\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*,\s*(\w+|\d+)\s*\)/);
    if (constrainMatch) {
      const value = this.resolveVariable(constrainMatch[1]) ?? parseInt(constrainMatch[1]);
      const min = this.resolveVariable(constrainMatch[2]) ?? parseInt(constrainMatch[2]);
      const max = this.resolveVariable(constrainMatch[3]) ?? parseInt(constrainMatch[3]);
      const instruction = {
        lineNumber,
        instruction: `constrain(${value}, ${min}, ${max})`,
        function: 'constrain',
        params: { value, min, max }
      };
      console.log(`ArduinoCodeParser: Found constrain instruction:`, instruction);
      return instruction;
    }

    // Parse random(min, max) or random(max)
    const randomMatch = line.match(/random\s*\(\s*(\w+|\d+)(?:\s*,\s*(\w+|\d+))?\s*\)/);
    if (randomMatch) {
      const min = randomMatch[2] ? (this.resolveVariable(randomMatch[1]) ?? parseInt(randomMatch[1])) : 0;
      const max = randomMatch[2] ? (this.resolveVariable(randomMatch[2]) ?? parseInt(randomMatch[2])) : (this.resolveVariable(randomMatch[1]) ?? parseInt(randomMatch[1]));
      const instruction = {
        lineNumber,
        instruction: randomMatch[2] ? `random(${min}, ${max})` : `random(${max})`,
        function: 'random',
        params: { min, max }
      };
      console.log(`ArduinoCodeParser: Found random instruction:`, instruction);
      return instruction;
    }

    // Parse millis()
    const millisMatch = line.match(/millis\s*\(\s*\)/);
    if (millisMatch) {
      const instruction = {
        lineNumber,
        instruction: `millis()`,
        function: 'millis'
      };
      console.log(`ArduinoCodeParser: Found millis instruction:`, instruction);
      return instruction;
    }

    // Parse micros()
    const microsMatch = line.match(/micros\s*\(\s*\)/);
    if (microsMatch) {
      const instruction = {
        lineNumber,
        instruction: `micros()`,
        function: 'micros'
      };
      console.log(`ArduinoCodeParser: Found micros instruction:`, instruction);
      return instruction;
    }

    // Parse delayMicroseconds(us)
    const delayMicrosMatch = line.match(/delayMicroseconds\s*\(\s*(\w+|\d+)\s*\)/);
    if (delayMicrosMatch) {
      const microseconds = this.resolveVariable(delayMicrosMatch[1]) ?? parseInt(delayMicrosMatch[1]);
      const instruction = {
        lineNumber,
        instruction: `delayMicroseconds(${microseconds})`,
        delayMicros: microseconds,
        function: 'delayMicroseconds'
      };
      console.log(`ArduinoCodeParser: Found delayMicroseconds instruction:`, instruction);
      return instruction;
    }

    // Parse tone(pin, frequency) or tone(pin, frequency, duration)
    const toneMatch = line.match(/tone\s*\(\s*(\w+|\d+)\s*,\s*(\w+|\d+)(?:\s*,\s*(\w+|\d+))?\s*\)/);
    if (toneMatch) {
      const pin = this.resolveVariable(toneMatch[1]);
      const frequency = this.resolveVariable(toneMatch[2]) ?? parseInt(toneMatch[2]);
      const duration = toneMatch[3] ? (this.resolveVariable(toneMatch[3]) ?? parseInt(toneMatch[3])) : undefined;
      const instruction = {
        lineNumber,
        instruction: duration ? `tone(${pin}, ${frequency}, ${duration})` : `tone(${pin}, ${frequency})`,
        pin: pin ?? undefined,
        function: 'tone',
        params: { frequency, duration }
      };
      console.log(`ArduinoCodeParser: Found tone instruction:`, instruction);
      return instruction;
    }

    // Parse noTone(pin)
    const noToneMatch = line.match(/noTone\s*\(\s*(\w+|\d+)\s*\)/);
    if (noToneMatch) {
      const pin = this.resolveVariable(noToneMatch[1]);
      const instruction = {
        lineNumber,
        instruction: `noTone(${pin})`,
        pin: pin ?? undefined,
        function: 'noTone'
      };
      console.log(`ArduinoCodeParser: Found noTone instruction:`, instruction);
      return instruction;
    }

    // Parse mathematical functions: abs(), max(), min(), pow(), sqrt()
    const mathMatch = line.match(/(abs|max|min|pow|sqrt|sq)\s*\((.*?)\)/);
    if (mathMatch) {
      const func = mathMatch[1];
      const params = mathMatch[2].split(',').map(p => {
        const trimmed = p.trim();
        return this.resolveVariable(trimmed) ?? (isNaN(parseFloat(trimmed)) ? trimmed : parseFloat(trimmed));
      });
      const instruction = {
        lineNumber,
        instruction: `${func}(${mathMatch[2]})`,
        function: func,
        params: params
      };
      console.log(`ArduinoCodeParser: Found math function:`, instruction);
      return instruction;
    }

    // Parse if statements
    const ifMatch = line.match(/if\s*\((.*?)\)/);
    if (ifMatch) {
      const condition = ifMatch[1];
      const instruction = {
        lineNumber,
        instruction: `if (${condition})`,
        function: 'if',
        condition: condition
      };
      console.log(`ArduinoCodeParser: Found if statement:`, instruction);
      return instruction;
    }

    // Parse variable assignments (int/float/etc variable = value;)
    const assignMatch = line.match(/^\s*(int|float|long|byte|bool|boolean)\s+(\w+)\s*=\s*(.*?);?\s*$/);
    if (assignMatch) {
      const type = assignMatch[1];
      const variable = assignMatch[2];
      const value = assignMatch[3];
      const resolvedValue = this.resolveVariable(value) ?? (isNaN(parseFloat(value)) ? value : parseFloat(value));
      
      // Store the variable for future resolution
      if (typeof resolvedValue === 'number') {
        this.variables.set(variable, resolvedValue);
      }
      
      const instruction = {
        lineNumber,
        instruction: `${type} ${variable} = ${resolvedValue}`,
        function: 'assignment',
        variable: variable,
        type: type,
        value: resolvedValue
      };
      console.log(`ArduinoCodeParser: Found variable assignment:`, instruction);
      return instruction;
    }

    // Parse simple variable assignments (variable = value;)
    const simpleAssignMatch = line.match(/^\s*(\w+)\s*=\s*(.*?);?\s*$/);
    if (simpleAssignMatch) {
      const variable = simpleAssignMatch[1];
      const value = simpleAssignMatch[2];
      const resolvedValue = this.resolveVariable(value) ?? (isNaN(parseFloat(value)) ? value : parseFloat(value));
      
      // Store the variable for future resolution
      if (typeof resolvedValue === 'number') {
        this.variables.set(variable, resolvedValue);
      }
      
      const instruction = {
        lineNumber,
        instruction: `${variable} = ${resolvedValue}`,
        function: 'assignment',
        variable: variable,
        value: resolvedValue
      };
      console.log(`ArduinoCodeParser: Found simple assignment:`, instruction);
      return instruction;
    }

    // Parse for loops
    const forMatch = line.match(/for\s*\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)/);
    if (forMatch) {
      const init = forMatch[1];
      const condition = forMatch[2];
      const increment = forMatch[3];
      const instruction = {
        lineNumber,
        instruction: `for (${init}; ${condition}; ${increment})`,
        function: 'for',
        init: init,
        condition: condition,
        increment: increment
      };
      console.log(`ArduinoCodeParser: Found for loop:`, instruction);
      return instruction;
    }

    // Parse while loops
    const whileMatch = line.match(/while\s*\((.*?)\)/);
    if (whileMatch) {
      const condition = whileMatch[1];
      const instruction = {
        lineNumber,
        instruction: `while (${condition})`,
        function: 'while',
        condition: condition
      };
      console.log(`ArduinoCodeParser: Found while loop:`, instruction);
      return instruction;
    }

    // Parse Serial.print/println
    const serialMatch = line.match(/Serial\.(print|println)\s*\((.*)\)/);
    if (serialMatch) {
      const instruction = {
        lineNumber,
        instruction: `Serial.${serialMatch[1]}(${serialMatch[2]})`,
        function: 'serial'
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