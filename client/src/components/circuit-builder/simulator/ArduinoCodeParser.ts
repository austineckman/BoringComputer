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
  value?: 'HIGH' | 'LOW' | number | string;
  delayMs?: number;
  delayMicros?: number;
  function?: string;
  assignTo?: string | null;
  params?: any;
  originalYParam?: string;
  objectName?: string;
  variableName?: string;
  condition?: string;
}

export class ArduinoCodeParser {
  private setupLines: CodeLine[] = [];
  private loopLines: CodeLine[] = [];
  private currentCode: string = '';
  private variables: Map<string, any> = new Map(); // Store variable declarations (can be numbers or booleans)
  private staticVariables: Map<string, any> = new Map(); // Store static variables that persist across loops

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
    
    // Add built-in Arduino constants first
    this.variables.set('HIGH', 1);
    this.variables.set('LOW', 0);
    this.variables.set('INPUT', 0);
    this.variables.set('OUTPUT', 1);
    this.variables.set('INPUT_PULLUP', 2);
    this.variables.set('LED_BUILTIN', 13);
    this.variables.set('A0', 14);
    this.variables.set('A1', 15);
    this.variables.set('A2', 16);
    this.variables.set('A3', 17);
    this.variables.set('A4', 18);
    this.variables.set('A5', 19);
    
    // Enhanced regex to match more variable declaration patterns
    // Matches: int sw1 = 2; const int sw2 = 3; #define SW3 4; int switch1Pin = 2;
    const variableRegex = /(?:(?:const\s+)?(?:int|byte|char|unsigned\s+int|uint8_t|uint16_t)\s+(\w+)\s*=\s*(\d+)|#define\s+(\w+)\s+(\d+)|(?:bool|boolean)\s+(\w+)\s*=\s*(true|false)|(?:bool|boolean)\s+(\w+)\s*;)/g;
    
    let match;
    while ((match = variableRegex.exec(code)) !== null) {
      let variableName, value;
      
      if (match[1] && match[2]) {
        // Integer variable with assignment: int sw1 = 2;
        variableName = match[1];
        value = parseInt(match[2]);
        console.log(`ArduinoCodeParser: Found int variable ${variableName} = ${value}`);
      } else if (match[3] && match[4]) {
        // #define format: #define SW1 2
        variableName = match[3];
        value = parseInt(match[4]);
        console.log(`ArduinoCodeParser: Found #define ${variableName} = ${value}`);
      } else if (match[5] && match[6]) {
        // Boolean with assignment: bool flag = true;
        variableName = match[5];
        value = match[6] === 'true' ? 1 : 0;
        console.log(`ArduinoCodeParser: Found bool variable ${variableName} = ${value}`);
      } else if (match[7]) {
        // Boolean without assignment: bool flag;
        variableName = match[7];
        value = 0; // Default to false
        console.log(`ArduinoCodeParser: Found bool variable ${variableName} (defaulted to 0)`);
      }
      
      if (variableName && value !== undefined && !isNaN(value)) {
        this.variables.set(variableName, value);
      }
    }
    
    // Also look for common DIP switch variable patterns
    const dipSwitchPatterns = [
      /int\s+(sw\d+|switch\d+|SW\d+|SWITCH\d+)\s*=\s*(\d+)/g,
      /int\s+(switch\d+Pin|sw\d+Pin)\s*=\s*(\d+)/g,
      /const\s+int\s+(sw\d+|switch\d+)\s*=\s*(\d+)/g
    ];
    
    for (const pattern of dipSwitchPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const variableName = match[1];
        const value = parseInt(match[2]);
        if (!this.variables.has(variableName)) {
          this.variables.set(variableName, value);
          console.log(`ArduinoCodeParser: Found DIP switch variable ${variableName} = ${value}`);
        }
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

    // Parse digitalRead(pin) with optional assignment
    // Matches: bool sw1 = digitalRead(2); or just digitalRead(2);
    const digitalReadMatch = line.match(/(?:(?:bool|boolean|int)\s+)?(\w+)\s*=\s*digitalRead\s*\(\s*(\w+|\d+)\s*\)|digitalRead\s*\(\s*(\w+|\d+)\s*\)/);
    if (digitalReadMatch) {
      let variableName = null;
      let pinParam;
      
      if (digitalReadMatch[1] && digitalReadMatch[2]) {
        // Assignment format: sw1 = digitalRead(2)
        variableName = digitalReadMatch[1];
        pinParam = digitalReadMatch[2];
      } else if (digitalReadMatch[3]) {
        // Standalone format: digitalRead(2)
        pinParam = digitalReadMatch[3];
      }
      
      const pin = this.resolveVariable(pinParam || '');
      const instruction = {
        lineNumber,
        instruction: variableName ? `${variableName} = digitalRead(${pin})` : `digitalRead(${pin})`,
        pin: pin ?? undefined,
        function: 'digitalRead',
        assignTo: variableName
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

    // Parse opening braces (start of code blocks)
    if (line.trim() === '{') {
      const instruction = {
        lineNumber,
        instruction: '{',
        function: 'block_start'
      };
      console.log(`ArduinoCodeParser: Found opening brace:`, instruction);
      return instruction;
    }

    // Parse closing braces (end of code blocks)
    if (line.trim() === '}') {
      const instruction = {
        lineNumber,
        instruction: '}',
        function: 'block_end'
      };
      console.log(`ArduinoCodeParser: Found closing brace:`, instruction);
      return instruction;
    }

    // Parse variable assignments (int/float/etc variable = value;)
    const assignMatch = line.match(/^\s*(int|float|long|byte|bool|boolean)\s+(\w+)\s*=\s*(.*?);?\s*$/);
    if (assignMatch) {
      const type = assignMatch[1];
      const variable = assignMatch[2];
      const value = assignMatch[3];
      
      let resolvedValue;
      // Handle boolean values specially
      if (value === 'true') {
        resolvedValue = 1;
      } else if (value === 'false') {
        resolvedValue = 0;
      } else {
        resolvedValue = this.resolveVariable(value) ?? (isNaN(parseFloat(value)) ? value : parseFloat(value));
      }
      
      // Store the variable for future resolution
      if (typeof resolvedValue === 'number') {
        this.variables.set(variable, resolvedValue);
      }
      
      const instruction: any = {
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

    // Parse static variable declarations (static bool blink_on = true;)
    const staticMatch = line.match(/^\s*static\s+(int|float|long|byte|bool|boolean|char)\s+(\w+)\s*=\s*(.+?)\s*;?\s*$/);
    if (staticMatch) {
      const type = staticMatch[1];
      const variable = staticMatch[2];
      const value = staticMatch[3].trim();
      
      // Parse the initial value based on type
      let parsedValue: any;
      if (type === 'bool' || type === 'boolean') {
        parsedValue = value === 'true' || value === '1';
      } else if (type === 'int' || type === 'byte') {
        parsedValue = parseInt(value) || 0;
      } else if (type === 'float' || type === 'long') {
        parsedValue = parseFloat(value) || 0;
      } else if (type === 'char') {
        parsedValue = value.replace(/['"]/g, '');
      } else {
        parsedValue = value;
      }
      
      // Store static variable (will persist across loops)
      if (!this.staticVariables.has(variable)) {
        this.staticVariables.set(variable, parsedValue);
      }
      this.variables.set(variable, this.staticVariables.get(variable));
      
      const instruction: any = {
        lineNumber,
        instruction: line.trim(),
        function: 'static_declaration',
        variable: variable,
        type: type,
        value: this.staticVariables.get(variable),
        isStatic: true
      };
      console.log(`ArduinoCodeParser: Found static variable declaration:`, instruction);
      return instruction;
    }

    // Parse variable declarations without assignment (bool blink_on;)
    const declMatch = line.match(/^\s*(int|float|long|byte|bool|boolean)\s+(\w+)\s*;?\s*$/);
    if (declMatch) {
      const type = declMatch[1];
      const variable = declMatch[2];
      
      // Default values for different types
      let defaultValue: any = 0;
      if (type === 'bool' || type === 'boolean') {
        defaultValue = false; // Use actual boolean false
      }
      
      // Store the variable with default value
      this.variables.set(variable, defaultValue);
      
      const instruction: any = {
        lineNumber,
        instruction: `${type} ${variable}`,
        function: 'declaration',
        variable: variable,
        type: type,
        value: defaultValue
      };
      console.log(`ArduinoCodeParser: Found variable declaration:`, instruction);
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
      
      const instruction: any = {
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

    // Parse else if statements
    const elseIfMatch = line.match(/else\s+if\s*\((.*?)\)/);
    if (elseIfMatch) {
      const condition = elseIfMatch[1];
      const instruction = {
        lineNumber,
        instruction: `else if (${condition})`,
        function: 'elseif',
        condition: condition
      };
      console.log(`ArduinoCodeParser: Found else if statement:`, instruction);
      return instruction;
    }

    // Parse else statements
    const elseMatch = line.match(/^\s*else\s*$/);
    if (elseMatch) {
      const instruction = {
        lineNumber,
        instruction: `else`,
        function: 'else'
      };
      console.log(`ArduinoCodeParser: Found else statement:`, instruction);
      return instruction;
    }

    // Parse switch statements
    const switchMatch = line.match(/switch\s*\((.*?)\)/);
    if (switchMatch) {
      const variable = switchMatch[1];
      const instruction = {
        lineNumber,
        instruction: `switch (${variable})`,
        function: 'switch',
        variable: variable
      };
      console.log(`ArduinoCodeParser: Found switch statement:`, instruction);
      return instruction;
    }

    // Parse case statements
    const caseMatch = line.match(/case\s+(\w+|\d+)\s*:/);
    if (caseMatch) {
      const value = caseMatch[1];
      const instruction: any = {
        lineNumber,
        instruction: `case ${value}:`,
        function: 'case',
        value: value
      };
      console.log(`ArduinoCodeParser: Found case statement:`, instruction);
      return instruction;
    }

    // Parse default case
    const defaultMatch = line.match(/default\s*:/);
    if (defaultMatch) {
      const instruction = {
        lineNumber,
        instruction: `default:`,
        function: 'default'
      };
      console.log(`ArduinoCodeParser: Found default case:`, instruction);
      return instruction;
    }

    // Parse break statements
    const breakMatch = line.match(/break\s*;/);
    if (breakMatch) {
      const instruction = {
        lineNumber,
        instruction: `break;`,
        function: 'break'
      };
      console.log(`ArduinoCodeParser: Found break statement:`, instruction);
      return instruction;
    }

    // Parse increment/decrement operators (i++, ++i, i--, --i, i+=, i-=)
    const incrementMatch = line.match(/(\w+)\s*(\+\+|--|\+=\s*\d+|\-=\s*\d+)/);
    if (incrementMatch) {
      const variable = incrementMatch[1];
      const operator = incrementMatch[2];
      const instruction = {
        lineNumber,
        instruction: `${variable}${operator}`,
        function: 'increment',
        variable: variable,
        operator: operator
      };
      console.log(`ArduinoCodeParser: Found increment/decrement:`, instruction);
      return instruction;
    }

    // Parse array declarations (int array[5];)
    const arrayDeclMatch = line.match(/^\s*(int|float|byte|bool)\s+(\w+)\s*\[\s*(\d+)\s*\]\s*;?\s*$/);
    if (arrayDeclMatch) {
      const type = arrayDeclMatch[1];
      const variable = arrayDeclMatch[2];
      const size = parseInt(arrayDeclMatch[3]);
      const instruction = {
        lineNumber,
        instruction: `${type} ${variable}[${size}]`,
        function: 'arrayDeclaration',
        type: type,
        variable: variable,
        size: size
      };
      console.log(`ArduinoCodeParser: Found array declaration:`, instruction);
      return instruction;
    }

    // Parse array access (array[index])
    const arrayAccessMatch = line.match(/(\w+)\s*\[\s*(\w+|\d+)\s*\]/);
    if (arrayAccessMatch) {
      const array = arrayAccessMatch[1];
      const index = arrayAccessMatch[2];
      const instruction = {
        lineNumber,
        instruction: `${array}[${index}]`,
        function: 'arrayAccess',
        array: array,
        index: index
      };
      console.log(`ArduinoCodeParser: Found array access:`, instruction);
      return instruction;
    }

    // Parse trigonometric functions (sin, cos, tan)
    const trigMatch = line.match(/(sin|cos|tan)\s*\((.*?)\)/);
    if (trigMatch) {
      const func = trigMatch[1];
      const angle = this.resolveVariable(trigMatch[2]) ?? parseFloat(trigMatch[2]);
      const instruction = {
        lineNumber,
        instruction: `${func}(${angle})`,
        function: func,
        angle: angle
      };
      console.log(`ArduinoCodeParser: Found trigonometric function:`, instruction);
      return instruction;
    }

    // Parse bit manipulation functions
    const bitMatch = line.match(/(bitRead|bitWrite|bitSet|bitClear)\s*\((.*?)\)/);
    if (bitMatch) {
      const func = bitMatch[1];
      const params = bitMatch[2].split(',').map(p => {
        const trimmed = p.trim();
        return this.resolveVariable(trimmed) ?? (isNaN(parseInt(trimmed)) ? trimmed : parseInt(trimmed));
      });
      const instruction = {
        lineNumber,
        instruction: `${func}(${bitMatch[2]})`,
        function: func,
        params: params
      };
      console.log(`ArduinoCodeParser: Found bit manipulation function:`, instruction);
      return instruction;
    }

    // Parse return statements
    const returnMatch = line.match(/return\s+(.*?);/);
    if (returnMatch) {
      const value = returnMatch[1];
      const instruction: any = {
        lineNumber,
        instruction: `return ${value};`,
        function: 'return',
        value: value
      };
      console.log(`ArduinoCodeParser: Found return statement:`, instruction);
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

    // Parse U8g2 OLED display object instantiation - handle various U8G2 constructor patterns
    const u8g2InstanceMatch = line.match(/U8G2_[\w_]+\s+(\w+)\s*\((.*?)\)\s*;?/);
    if (u8g2InstanceMatch) {
      const objectName = u8g2InstanceMatch[1];
      const params = u8g2InstanceMatch[2];
      const instruction = {
        lineNumber,
        instruction: line.trim(),
        function: 'u8g2_instantiation',
        objectName: objectName,
        params: this.parseParameters(params)
      };
      console.log(`ArduinoCodeParser: Found U8g2 object instantiation:`, instruction);
      return instruction;
    }

    // Parse U8g2 OLED display functions (more flexible pattern to catch any object name)
    const u8g2Match = line.match(/(\w+)\.(begin|clearBuffer|clearDisplay|sendBuffer|drawStr|drawBox|drawFrame|drawCircle|drawDisc|drawLine|drawPixel|drawTriangle|drawRFrame|drawRBox|setFont|setCursor|setDrawColor|setFontDirection|setFontPosTop|setFontPosCenter|setFontRefHeightExtendedText|getMaxCharHeight|getMaxCharWidth|getStrWidth|getDisplayWidth|getDisplayHeight|setBitmapMode|drawXBMP|drawUTF8|print|println)\s*\((.*?)\)/);
    if (u8g2Match) {
      console.log(`[ArduinoCodeParser] Potential U8g2 match found:`, u8g2Match);
      const objectName = u8g2Match[1];
      const functionName = u8g2Match[2];
      const params = u8g2Match[3];
      
      // Enhanced parameter parsing for specific U8g2 functions
      let parsedParams = this.parseParameters(params);
      
      // Special handling for drawStr to ensure proper text extraction
      if (functionName === 'drawStr') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          parsedParams = {
            param0: (this.resolveVariable(parts[0]) ?? parseInt(parts[0])) || 0,
            param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 0,
            param2: parts[2].replace(/['"]/g, '') // Remove quotes from text
          };
        }
      }
      // Special handling for drawFrame
      else if (functionName === 'drawFrame') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 4) {
          parsedParams = {
            param0: (this.resolveVariable(parts[0]) ?? parseInt(parts[0])) || 0,
            param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 0,
            param2: (this.resolveVariable(parts[2]) ?? parseInt(parts[2])) || 50,
            param3: (this.resolveVariable(parts[3]) ?? parseInt(parts[3])) || 50
          };
        }
      }
      // Special handling for drawCircle/drawDisc
      else if (functionName === 'drawCircle' || functionName === 'drawDisc') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          parsedParams = {
            param0: (this.resolveVariable(parts[0]) ?? parseInt(parts[0])) || 0,
            param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 0,
            param2: (this.resolveVariable(parts[2]) ?? parseInt(parts[2])) || 5
          };
        }
      }
      // Special handling for drawBox (filled rectangle)
      else if (functionName === 'drawBox') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 4) {
          parsedParams = {
            param0: (this.resolveVariable(parts[0]) ?? parseInt(parts[0])) || 0,
            param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 0,
            param2: (this.resolveVariable(parts[2]) ?? parseInt(parts[2])) || 50,
            param3: (this.resolveVariable(parts[3]) ?? parseInt(parts[3])) || 50
          };
        }
      }
      // Special handling for drawTriangle
      else if (functionName === 'drawTriangle') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 6) {
          parsedParams = {
            param0: (this.resolveVariable(parts[0]) ?? parseInt(parts[0])) || 0,
            param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 0,
            param2: (this.resolveVariable(parts[2]) ?? parseInt(parts[2])) || 10,
            param3: (this.resolveVariable(parts[3]) ?? parseInt(parts[3])) || 10,
            param4: (this.resolveVariable(parts[4]) ?? parseInt(parts[4])) || 20,
            param5: (this.resolveVariable(parts[5]) ?? parseInt(parts[5])) || 20
          };
        }
      }
      // Special handling for drawLine
      else if (functionName === 'drawLine') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 4) {
          parsedParams = {
            param0: (this.resolveVariable(parts[0]) ?? parseInt(parts[0])) || 0,
            param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 0,
            param2: (this.resolveVariable(parts[2]) ?? parseInt(parts[2])) || 10,
            param3: (this.resolveVariable(parts[3]) ?? parseInt(parts[3])) || 10
          };
        }
      }
      
      const instruction = {
        lineNumber,
        instruction: `${objectName}.${functionName}(${params})`,
        function: `display.${functionName}`,
        params: parsedParams
      };
      console.log(`ArduinoCodeParser: Found U8g2 instruction:`, instruction);
      console.log(`ArduinoCodeParser: Parsed params for ${functionName}:`, parsedParams);
      return instruction;
    }

    // Parse custom functions like drawCenteredString
    const customFunctionMatch = line.match(/(drawCenteredString|display_lander|display_test_\w+)\s*\((.*?)\)/);
    if (customFunctionMatch) {
      const functionName = customFunctionMatch[1];
      const params = customFunctionMatch[2];
      
      // Convert custom functions to basic display operations
      let instruction = null;
      if (functionName === 'drawCenteredString') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          // Get the text parameter - it's the second parameter
          let textParam = parts[1];
          // Remove quotes if present
          if (textParam.startsWith('"') && textParam.endsWith('"')) {
            textParam = textParam.slice(1, -1);
          }
          
          // Parse the Y position correctly
          let yPos = 10;
          if (parts[0]) {
            const yValue = parts[0].trim();
            
            // Check for simple number
            if (!isNaN(parseInt(yValue))) {
              yPos = parseInt(yValue);
            }
            // Check for variable reference
            else if (yValue === 'font_height') {
              yPos = 8; // Standard font height for u8g2_font_ncenB08_tr
            }
            // Check for calculated expression like centered_y
            else if (yValue === 'centered_y') {
              yPos = 40; // Approximate center of 64px display
            }
            // Try to resolve as variable
            else {
              yPos = this.resolveVariable(yValue) ?? 10;
            }
          }
          
          console.log(`ArduinoCodeParser: drawCenteredString Y position: ${parts[0]} -> ${yPos}`);
          
          instruction = {
            lineNumber,
            instruction: `drawCenteredString(${params})`,
            function: 'display.drawStr',
            params: {
              param0: 30, // Approximate center position for X
              param1: yPos, // Use the actual Y position from the first parameter
              param2: textParam
            },
            // Store the original Y parameter for runtime evaluation
            originalYParam: parts[0]?.trim()
          };
        }
      } else {
        // Other custom functions - just acknowledge them
        instruction = {
          lineNumber,
          instruction: `${functionName}(${params})`,
          function: `custom.${functionName}`,
          params: this.parseParameters(params)
        };
      }
      
      if (instruction) {
        console.log(`ArduinoCodeParser: Found custom function:`, instruction);
        return instruction;
      }
    }

    // Parse Wire library functions for I2C communication
    const wireMatch = line.match(/Wire\.(begin|beginTransmission|write|endTransmission|available|read)\s*\((.*?)\)/);
    if (wireMatch) {
      const functionName = wireMatch[1];
      const params = wireMatch[2];
      const instruction = {
        lineNumber,
        instruction: `Wire.${functionName}(${params})`,
        function: `Wire.${functionName}`,
        params: this.parseParameters(params)
      };
      console.log(`ArduinoCodeParser: Found Wire instruction:`, instruction);
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

  // Helper method to parse function parameters
  private parseParameters(paramString: string): any {
    if (!paramString || paramString.trim() === '') {
      return {};
    }

    const params = paramString.split(',').map(p => p.trim());
    const result: any = {};

    // Handle common parameter patterns
    params.forEach((param, index) => {
      // Remove quotes for string literals
      if (param.startsWith('"') && param.endsWith('"')) {
        result[`param${index}`] = param.slice(1, -1);
        if (index === 0) result.text = param.slice(1, -1);
      } else if (!isNaN(parseInt(param))) {
        result[`param${index}`] = parseInt(param);
        if (index === 0) result.x = parseInt(param);
        if (index === 1) result.y = parseInt(param);
      } else {
        result[`param${index}`] = param;
      }
    });

    return result;
  }
}