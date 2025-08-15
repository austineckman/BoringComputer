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
    this.setupLines = [];
    this.loopLines = [];
    
    console.log('ArduinoCodeParser: Starting to parse code');
    console.log('ArduinoCodeParser: Code length:', code.length);
    
    // More robust approach: use regex to extract function bodies directly
    const setupMatch = code.match(/void\s+setup\s*\(\s*(?:void)?\s*\)\s*\{([\s\S]*?)(?=\nvoid\s+loop|$)/);
    const loopMatch = code.match(/void\s+loop\s*\(\s*(?:void)?\s*\)\s*\{([\s\S]*?)(?=\n\s*\}?\s*$|$)/);
    
    console.log('ArduinoCodeParser: Setup match found:', !!setupMatch);
    console.log('ArduinoCodeParser: Loop match found:', !!loopMatch);
    
    if (setupMatch) {
      const setupBody = setupMatch[1];
      console.log('ArduinoCodeParser: Setup body length:', setupBody.length);
      console.log('ArduinoCodeParser: Setup body preview:', setupBody.substring(0, 200) + '...');
      
      const setupLines = setupBody.split('\n');
      setupLines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('//') && trimmedLine !== '{' && trimmedLine !== '}') {
          this.setupLines.push({
            lineNumber: index + 1,
            content: trimmedLine,
            type: 'setup'
          });
          console.log(`ArduinoCodeParser: Added to setup: "${trimmedLine}"`);
        }
      });
    }
    
    if (loopMatch) {
      const loopBody = loopMatch[1];
      console.log('ArduinoCodeParser: Loop body length:', loopBody.length);
      console.log('ArduinoCodeParser: Loop body preview:', loopBody.substring(0, 200) + '...');
      
      const loopLines = loopBody.split('\n');
      loopLines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('//') && trimmedLine !== '{' && trimmedLine !== '}') {
          this.loopLines.push({
            lineNumber: index + 1,
            content: trimmedLine,
            type: 'loop'
          });
          console.log(`ArduinoCodeParser: Added to loop: "${trimmedLine}"`);
        }
      });
    }
    
    // Fallback: if regex didn't work, try the old line-by-line approach
    if (this.setupLines.length === 0 && this.loopLines.length === 0) {
      console.log('ArduinoCodeParser: Regex parsing failed, falling back to line-by-line');
      this.parseCodeLineByLine(code);
    }

    console.log(`ArduinoCodeParser: Parsing complete. Setup: ${this.setupLines.length} lines, Loop: ${this.loopLines.length} lines`);
    
    return {
      setup: this.setupLines,
      loop: this.loopLines
    };
  }

  // Fallback line-by-line parsing method
  private parseCodeLineByLine(code: string): void {
    const lines = code.split('\n');
    let currentSection: 'none' | 'setup' | 'loop' = 'none';
    let braceDepth = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      const lineNumber = i + 1;
      
      if (!trimmedLine || trimmedLine.startsWith('//')) continue;
      
      // Check for setup function
      if (trimmedLine.includes('void setup()') || trimmedLine.includes('void setup(void)')) {
        currentSection = 'setup';
        braceDepth = 0;
        console.log(`ArduinoCodeParser: Found setup() at line ${lineNumber}`);
        continue;
      }
      
      // Check for loop function
      if (trimmedLine.includes('void loop()') || trimmedLine.includes('void loop(void)')) {
        currentSection = 'loop';
        braceDepth = 0;
        console.log(`ArduinoCodeParser: Found loop() at line ${lineNumber}`);
        continue;
      }
      
      // Track braces
      braceDepth += (trimmedLine.match(/\{/g) || []).length;
      braceDepth -= (trimmedLine.match(/\}/g) || []).length;
      
      // If we've closed all braces, we're out of the current function
      if (braceDepth <= 0 && currentSection !== 'none') {
        console.log(`ArduinoCodeParser: Exiting ${currentSection} section at line ${lineNumber}, brace depth: ${braceDepth}`);
        currentSection = 'none';
        continue;
      }
      
      // In setup or loop section, add lines to appropriate arrays
      if (currentSection === 'setup' && braceDepth > 0) {
        this.setupLines.push({
          lineNumber,
          content: trimmedLine,
          type: 'setup'
        });
        console.log(`ArduinoCodeParser: Added to setup: Line ${lineNumber}: "${trimmedLine}"`);
      } else if (currentSection === 'loop' && braceDepth > 0) {
        this.loopLines.push({
          lineNumber,
          content: trimmedLine,
          type: 'loop'
        });
        console.log(`ArduinoCodeParser: Added to loop: Line ${lineNumber}: "${trimmedLine}"`);
      } else if (currentSection === 'loop' && trimmedLine && !trimmedLine.startsWith('//')) {
        // Also capture lines even if brace depth is wrong - complex code might have nested structures
        this.loopLines.push({
          lineNumber,
          content: trimmedLine,
          type: 'loop'
        });
        console.log(`ArduinoCodeParser: Added to loop (fallback): Line ${lineNumber}: "${trimmedLine}"`);
      }
    }
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
    
    // Add constants from the advanced OLED test code
    this.variables.set('TEST_PAGE_COUNT', 13);
    this.variables.set('LANDER_HEIGHT', 25);
    this.variables.set('LANDER_WIDTH', 20);
    this.variables.set('BOX1_WIDTH', 20);
    this.variables.set('BOX1_HEIGHT', 10);
    this.variables.set('BOX1_X_OFFSET', 5);
    this.variables.set('BOX2_WIDTH', 30);
    this.variables.set('BOX2_HEIGHT', 8);
    this.variables.set('BOX2_X_OFFSET', 10);
    this.variables.set('BOX2_Y_OFFSET', 5);
    this.variables.set('CIRCLE1_RADIUS', 8);
    this.variables.set('CIRCLE1_DIAMETER', 17);
    this.variables.set('CIRCLE1_X_OFFSET', 8);
    this.variables.set('CIRCLE2_RADIUS', 7);
    this.variables.set('CIRCLE2_X_OFFSET', 24);
    this.variables.set('RBOX1_WIDTH', 40);
    this.variables.set('RBOX1_HEIGHT', 30);
    this.variables.set('RBOX1_X_OFFSET', 5);
    this.variables.set('RBOX2_WIDTH', 25);
    this.variables.set('RBOX2_HEIGHT', 40);
    this.variables.set('RBOX2_X_OFFSET', 50);
    this.variables.set('STRING_X_OFFSET', 30);
    this.variables.set('LINE_X_OFFSET', 7);
    this.variables.set('LINE_Y_MAX', 55);
    this.variables.set('y_offset', 8);
    this.variables.set('frame', 1);
    this.variables.set('display_frame', 1);
    
    // Match variable declarations like: int redPin = 9; bool flag = true; and #define RED_PIN 9
    const variableRegex = /(?:int|const\s+int|float|long|byte|bool|boolean)\s+(\w+)\s*=\s*(\d+(?:\.\d+)?|true|false|HIGH|LOW)|(?:bool|boolean)\s+(\w+)\s*;|#define\s+(\w+)\s+(\d+|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|true|false)/g;
    
    let match;
    while ((match = variableRegex.exec(code)) !== null) {
      let variableName, value;
      
      if (match[1] && match[2]) {
        // Variable with assignment: int redPin = 9; bool flag = true;
        variableName = match[1];
        const valueStr = match[2];
        
        // Convert Arduino constants and boolean values
        switch (valueStr) {
          case 'true': value = 1; break;
          case 'false': value = 0; break;
          case 'HIGH': value = 1; break;
          case 'LOW': value = 0; break;
          default: value = parseFloat(valueStr); break;
        }
      } else if (match[3]) {
        // Boolean variable without assignment: bool blink_on;
        variableName = match[3];
        value = 0; // Default boolean variables to false (0)
      } else if (match[4] && match[5]) {
        // #define format: #define RED_PIN 9 or #define LED_PIN HIGH
        variableName = match[4];
        const valueStr = match[5];
        
        // Convert Arduino constants to numeric values
        switch (valueStr) {
          case 'true': value = 1; break;
          case 'false': value = 0; break;
          case 'HIGH': value = 1; break;
          case 'LOW': value = 0; break;
          case 'INPUT': value = 0; break;
          case 'OUTPUT': value = 1; break;
          case 'INPUT_PULLUP': value = 2; break;
          default: value = parseFloat(valueStr); break;
        }
      }
      
      if (variableName && value !== undefined && !isNaN(value)) {
        this.variables.set(variableName, value);
        console.log(`ArduinoCodeParser: Found variable ${variableName} = ${value}`);
      }
    }
    
    console.log('ArduinoCodeParser: Variables extracted:', Array.from(this.variables.entries()));
  }

  // Extract advanced C++ features for complex Arduino code
  private extractAdvancedFeatures(code: string): void {
    console.log('ArduinoCodeParser: Extracting advanced features');
    
    // Extract const byte expressions with calculations
    const constByteCalcRegex = /const\s+byte\s+(\w+)\s*=\s*([^;]+);/g;
    let match;
    while ((match = constByteCalcRegex.exec(code)) !== null) {
      const [, varName, expression] = match;
      const value = this.evaluateAdvancedExpression(expression.trim());
      if (value !== null) {
        this.variables.set(varName, value);
        console.log(`ArduinoCodeParser: Found const byte ${varName} = ${value} (from: ${expression})`);
      }
    }
  }

  // Evaluate complex expressions with variables and operations
  private evaluateAdvancedExpression(expr: string): number | null {
    try {
      // Handle simple cases first
      if (/^\d+$/.test(expr)) {
        return parseInt(expr);
      }

      // Handle variable references
      if (this.variables.has(expr)) {
        return this.variables.get(expr)!;
      }

      // Handle expressions like "LANDER_WIDTH * 1.5" or "BOX1_HEIGHT / 2"
      const operatorMatch = expr.match(/(\w+)\s*([+\-*/])\s*([\d.]+)/);
      if (operatorMatch) {
        const [, varName, operator, valueStr] = operatorMatch;
        const varValue = this.variables.get(varName);
        const operandValue = parseFloat(valueStr);
        
        if (varValue !== undefined && !isNaN(operandValue)) {
          switch (operator) {
            case '+': return Math.round(varValue + operandValue);
            case '-': return Math.round(varValue - operandValue);
            case '*': return Math.round(varValue * operandValue);
            case '/': return Math.round(varValue / operandValue);
          }
        }
      }

      // Handle bitwise operations like "display_frame >> 3" and "display_frame & 0b00000111"
      const bitwiseMatch = expr.match(/(\w+)\s*(>>|<<|&|\|)\s*(.+)/);
      if (bitwiseMatch) {
        const [, varName, operator, operandExpr] = bitwiseMatch;
        const varValue = this.variables.get(varName) || 0;
        let operandValue = 0;
        
        // Handle binary literals like 0b00000111
        if (operandExpr.startsWith('0b')) {
          operandValue = parseInt(operandExpr.substring(2), 2);
        } else if (operandExpr.includes('*')) {
          // Handle expressions like "TEST_PAGE_COUNT * 8"
          operandValue = this.evaluateAdvancedExpression(operandExpr) || 0;
        } else {
          operandValue = parseInt(operandExpr) || 0;
        }
        
        switch (operator) {
          case '>>': return varValue >> operandValue;
          case '<<': return varValue << operandValue;
          case '&': return varValue & operandValue;
          case '|': return varValue | operandValue;
        }
      }

      // Handle complex expressions like "(CIRCLE1_RADIUS * 2) + 1"
      const complexMatch = expr.match(/\((\w+)\s*\*\s*(\d+)\)\s*\+\s*(\d+)/);
      if (complexMatch) {
        const [, varName, multiplier, addend] = complexMatch;
        const varValue = this.variables.get(varName);
        if (varValue !== undefined) {
          return (varValue * parseInt(multiplier)) + parseInt(addend);
        }
      }

      // Handle variable addition like "RBOX1_X_OFFSET + RBOX1_WIDTH + RBOX1_X_OFFSET"
      const additionMatch = expr.match(/(\w+)\s*\+\s*(\w+)\s*\+\s*(\w+)/);
      if (additionMatch) {
        const [, var1, var2, var3] = additionMatch;
        const val1 = this.variables.get(var1) || 0;
        const val2 = this.variables.get(var2) || 0;
        const val3 = this.variables.get(var3) || 0;
        return val1 + val2 + val3;
      }

      console.warn(`ArduinoCodeParser: Could not evaluate expression: ${expr}`);
      return null;
    } catch (error) {
      console.error(`ArduinoCodeParser: Error evaluating expression "${expr}":`, error);
      return null;
    }
  }

  // Parse loop control structures properly
  private parseLoopStructures(code: string): void {
    console.log('ArduinoCodeParser: Parsing loop control structures');
    
    // Extract for loops with proper variable handling
    const forLoopRegex = /for\s*\(([^)]+)\)\s*\{/g;
    let match;
    while ((match = forLoopRegex.exec(code)) !== null) {
      const loopCondition = match[1];
      console.log(`ArduinoCodeParser: Found for loop: ${loopCondition}`);
      
      // Parse loop variables and conditions
      this.parseLoopCondition(loopCondition);
    }
  }

  private parseLoopCondition(condition: string): void {
    // Parse conditions like "unsigned int display_frame = 0; display_frame < (TEST_PAGE_COUNT * 8); display_frame++"
    const parts = condition.split(';').map(p => p.trim());
    
    if (parts.length >= 3) {
      // Initialize variable
      const initMatch = parts[0].match(/(\w+)\s+(\w+)\s*=\s*(\d+)/);
      if (initMatch) {
        const [, type, varName, value] = initMatch;
        this.variables.set(varName, parseInt(value));
        console.log(`ArduinoCodeParser: Loop variable ${varName} initialized to ${value}`);
      }
      
      // Parse condition
      const conditionMatch = parts[1].match(/(\w+)\s*<\s*(.+)/);
      if (conditionMatch) {
        const [, varName, limitExpr] = conditionMatch;
        const limit = this.evaluateAdvancedExpression(limitExpr);
        if (limit !== null) {
          this.variables.set(`${varName}_limit`, limit);
          console.log(`ArduinoCodeParser: Loop limit for ${varName}: ${limit}`);
        }
      }
    }
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

  // Execute a single iteration of the loop with proper variable tracking
  executeLoopIteration(loopVariable: string, iterationValue: number, loopBody: CodeLine[]): ArduinoInstruction[] {
    console.log(`ArduinoCodeParser: Executing loop iteration ${iterationValue} for variable ${loopVariable}`);
    
    // Update loop variable
    this.variables.set(loopVariable, iterationValue);
    this.variables.set('frame', iterationValue % 8); // Common pattern in your code
    this.variables.set('display_frame', iterationValue);
    
    const instructions: ArduinoInstruction[] = [];
    
    // Parse each line in the loop body with current variable values
    loopBody.forEach(codeLine => {
      const instruction = this.parseInstruction(codeLine);
      if (instruction) {
        instructions.push(instruction);
      }
    });
    
    return instructions;
  }

  // Parse switch statements to extract cases
  parseSwitchStatement(switchCode: string): Map<number, CodeLine[]> {
    const cases = new Map<number, CodeLine[]>();
    console.log('ArduinoCodeParser: Parsing switch statement');
    
    // Extract each case block
    const caseRegex = /case\s+(\d+):\s*([^b]+?)break;/gs;
    let match;
    while ((match = caseRegex.exec(switchCode)) !== null) {
      const caseNumber = parseInt(match[1]);
      const caseCode = match[2].trim();
      
      // Parse the case code into lines
      const caseLines = caseCode.split('\n')
        .map((line, index) => ({
          lineNumber: index + 1,
          content: line.trim(),
          type: 'loop' as const
        }))
        .filter(line => line.content.length > 0);
      
      cases.set(caseNumber, caseLines);
      console.log(`ArduinoCodeParser: Found case ${caseNumber} with ${caseLines.length} lines`);
    }
    
    return cases;
  }

  parseInstruction(codeLine: CodeLine): ArduinoInstruction | null {
    const line = codeLine.content;
    const lineNumber = codeLine.lineNumber;

    console.log(`ArduinoCodeParser: Parsing line ${lineNumber}: "${line}"`);

    // Handle variable assignments and updates
    const assignmentMatch = line.match(/(\w+)\s*([+\-*/]?=)\s*(.+);/);
    if (assignmentMatch) {
      const [, varName, operator, expression] = assignmentMatch;
      const value = this.evaluateAdvancedExpression(expression.trim());
      
      if (value !== null) {
        if (operator === '+=') {
          this.variables.set(varName, (this.variables.get(varName) || 0) + value);
        } else if (operator === '=') {
          this.variables.set(varName, value);
        }
        console.log(`ArduinoCodeParser: Updated variable ${varName} to ${this.variables.get(varName)}`);
      }
      return null; // Variable assignments don't produce instructions
    }

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

    // Parse variable declarations without assignment (bool blink_on;)
    const declMatch = line.match(/^\s*(int|float|long|byte|bool|boolean)\s+(\w+)\s*;?\s*$/);
    if (declMatch) {
      const type = declMatch[1];
      const variable = declMatch[2];
      
      // Default values for different types
      let defaultValue = 0;
      if (type === 'bool' || type === 'boolean') {
        defaultValue = 0; // false
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

    // Parse U8g2 OLED display object instantiation
    const u8g2InstanceMatch = line.match(/U8G2_\w+\s+(\w+)\s*\((.*?)\)\s*;?/);
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

    // Parse custom functions like drawCenteredString and display_test functions
    const customFunctionMatch = line.match(/(drawCenteredString|display_lander|display_test_\w+)\s*\((.*?)\)/);
    if (customFunctionMatch) {
      const functionName = customFunctionMatch[1];
      const params = customFunctionMatch[2];
      
      // Convert custom functions to basic display operations
      let instruction = null;
      
      if (functionName === 'drawCenteredString') {
        const parts = params.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          // Calculate centered X position (simplified)
          const baseX = this.resolveVariable(parts[0]) || parseInt(parts[0]) || 0;
          const centeredX = baseX + 32; // Approximate center
          
          instruction = {
            lineNumber,
            instruction: `drawCenteredString(${params})`,
            function: 'display.drawStr',
            params: {
              param0: centeredX,
              param1: (this.resolveVariable(parts[1]) ?? parseInt(parts[1])) || 10,
              param2: parts[2].replace(/['"]/g, '') // Remove quotes from text
            }
          };
        }
      } else if (functionName === 'display_lander') {
        // Convert display_lander to a series of graphics instructions
        const parts = params.split(',').map(p => p.trim());
        const x = this.resolveVariable(parts[0]) || parseInt(parts[0]) || 20;
        const y = this.resolveVariable(parts[1]) || parseInt(parts[1]) || 20;
        
        // Create a simplified lander drawing instruction
        instruction = {
          lineNumber,
          instruction: `display_lander(${params})`,
          function: 'display.drawFrame', // Start with the main body
          params: {
            param0: x + 5,
            param1: y + 4, 
            param2: 10,
            param3: 20
          }
        };
      } else if (functionName.startsWith('display_test_')) {
        // Handle test functions - convert to simplified graphics
        const testType = functionName.replace('display_test_', '');
        
        switch (testType) {
          case 'box_frame':
            instruction = {
              lineNumber,
              instruction: `${functionName}(${params})`,
              function: 'display.drawBox',
              params: { param0: 5, param1: 24, param2: 20, param3: 10 }
            };
            break;
          case 'circles':
            instruction = {
              lineNumber,
              instruction: `${functionName}(${params})`,
              function: 'display.drawDisc',
              params: { param0: 30, param1: 35, param2: 8 }
            };
            break;
          case 'line':
            instruction = {
              lineNumber,
              instruction: `${functionName}(${params})`,
              function: 'display.drawLine',
              params: { param0: 10, param1: 20, param2: 50, param3: 45 }
            };
            break;
          case 'triangle':
            instruction = {
              lineNumber,
              instruction: `${functionName}(${params})`,
              function: 'display.drawTriangle',
              params: { param0: 30, param1: 20, param2: 50, param3: 20, param4: 40, param5: 35 }
            };
            break;
          default:
            // Other test functions
            instruction = {
              lineNumber,
              instruction: `${functionName}(${params})`,
              function: 'display.drawStr',
              params: { param0: 10, param1: 20, param2: testType }
            };
        }
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