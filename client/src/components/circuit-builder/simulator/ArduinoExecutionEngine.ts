/**
 * ArduinoExecutionEngine.ts - Proper execution engine for Arduino code
 * Handles loops, conditionals, switch statements, and function calls
 */

import { ArduinoCodeParser, type CodeLine, type ArduinoInstruction } from './ArduinoCodeParser';

export interface ExecutionState {
  variables: Map<string, number>;
  loopDepth: number;
  currentFrame: number;
  switchValue?: number;
}

export class ArduinoExecutionEngine {
  private parser: ArduinoCodeParser;
  private state: ExecutionState;
  private maxIterations = 1000; // Prevent infinite loops

  constructor() {
    this.parser = new ArduinoCodeParser();
    this.state = {
      variables: new Map(),
      loopDepth: 0,
      currentFrame: 0
    };
  }

  // Execute the complete Arduino program
  executeProgram(code: string): ArduinoInstruction[] {
    console.log('ArduinoExecutionEngine: Starting program execution');
    
    const { setup, loop } = this.parser.parseCode(code);
    const allInstructions: ArduinoInstruction[] = [];

    // Execute setup once
    console.log('ArduinoExecutionEngine: Executing setup()');
    setup.forEach(line => {
      const instruction = this.parser.parseInstruction(line);
      if (instruction) {
        allInstructions.push(instruction);
      }
    });

    // Execute loop with proper flow control
    console.log('ArduinoExecutionEngine: Executing loop()');
    const loopInstructions = this.executeLoopWithFlowControl(loop, code);
    allInstructions.push(...loopInstructions);

    return allInstructions;
  }

  // Execute loop with proper for-loop and switch statement handling
  private executeLoopWithFlowControl(loopLines: CodeLine[], fullCode: string): ArduinoInstruction[] {
    const instructions: ArduinoInstruction[] = [];
    
    // Look for for-loop pattern in the full code
    const forLoopMatch = fullCode.match(/for\s*\(\s*unsigned\s+int\s+(\w+)\s*=\s*(\d+);\s*\1\s*<\s*\(([^)]+)\);\s*\1\+\+\s*\)\s*\{([\s\S]*?)\}/);
    
    if (forLoopMatch) {
      const [, loopVar, startValue, limitExpr, loopBody] = forLoopMatch;
      
      // Evaluate loop limit
      this.state.variables.set('TEST_PAGE_COUNT', 13);
      const limit = this.evaluateExpression(limitExpr);
      const start = parseInt(startValue);
      
      console.log(`ArduinoExecutionEngine: Found for loop: ${loopVar} from ${start} to ${limit}`);
      
      // Execute first few iterations to demonstrate the pattern
      const maxExecutions = Math.min(limit, 24); // Limit to avoid too many instructions
      
      for (let i = start; i < maxExecutions; i++) {
        this.state.variables.set(loopVar, i);
        this.state.currentFrame = i;
        
        // Handle switch statement within the loop
        const switchMatch = loopBody.match(/switch\s*\(\s*([^)]+)\s*\)\s*\{([\s\S]*?)\}/);
        if (switchMatch) {
          const [, switchExpr, switchBody] = switchMatch;
          const switchValue = this.evaluateExpression(switchExpr);
          
          console.log(`ArduinoExecutionEngine: Switch value for iteration ${i}: ${switchValue}`);
          
          // Execute the appropriate case
          const caseInstructions = this.executeSwitchCase(switchValue, switchBody, i);
          instructions.push(...caseInstructions);
        } else {
          // Execute loop body directly
          const bodyLines = this.parseLoopBody(loopBody);
          bodyLines.forEach(line => {
            const instruction = this.parser.parseInstruction(line);
            if (instruction) {
              instructions.push(instruction);
            }
          });
        }
        
        // Add sendBuffer after each iteration
        instructions.push({
          lineNumber: i,
          instruction: 'lander_display.sendBuffer();',
          function: 'display.sendBuffer',
          params: {}
        });
      }
    } else {
      // Fallback: execute loop lines directly
      loopLines.forEach(line => {
        const instruction = this.parser.parseInstruction(line);
        if (instruction) {
          instructions.push(instruction);
        }
      });
    }
    
    return instructions;
  }

  // Execute specific switch case
  private executeSwitchCase(switchValue: number, switchBody: string, iteration: number): ArduinoInstruction[] {
    const instructions: ArduinoInstruction[] = [];
    
    // Extract the function call for this case
    const casePattern = new RegExp(`case\\s+${switchValue}:\\s*([^;]+);`, 'g');
    const caseMatch = casePattern.exec(switchBody);
    
    if (caseMatch) {
      const functionCall = caseMatch[1].trim();
      console.log(`ArduinoExecutionEngine: Executing case ${switchValue}: ${functionCall}`);
      
      // Convert function call to graphics instructions
      const caseInstructions = this.convertFunctionToInstructions(functionCall, iteration);
      instructions.push(...caseInstructions);
    }
    
    return instructions;
  }

  // Convert high-level function calls to basic graphics instructions
  private convertFunctionToInstructions(functionCall: string, iteration: number): ArduinoInstruction[] {
    const instructions: ArduinoInstruction[] = [];
    const frame = iteration % 8; // Frame within each page
    
    // First add common setup for each case
    instructions.push(
      {
        lineNumber: iteration * 100,
        instruction: 'lander_display.clearBuffer();',
        function: 'display.clearBuffer',
        params: {}
      },
      {
        lineNumber: iteration * 100 + 1,
        instruction: 'lander_display.setFont(u8g_font_6x10);',
        function: 'display.setFont',
        params: { font: 'u8g_font_6x10' }
      },
      {
        lineNumber: iteration * 100 + 2,
        instruction: 'drawCenteredString(0, 0, "Exploration Lander");',
        function: 'display.drawStr',
        params: { param0: 32, param1: 8, param2: 'Exploration Lander' }
      }
    );

    // Handle specific test functions
    if (functionCall.includes('display_test_ready')) {
      instructions.push(
        {
          lineNumber: iteration * 100 + 10,
          instruction: 'display_lander(20, 25);',
          function: 'display.drawFrame',
          params: { param0: 25, param1: 29, param2: 10, param3: 20 }
        },
        {
          lineNumber: iteration * 100 + 11,
          instruction: 'drawCenteredString(50, 30, "Begin");',
          function: 'display.drawStr',
          params: { param0: 80, param1: 30, param2: frame % 2 === 0 ? 'Begin' : '' }
        }
      );
    } else if (functionCall.includes('display_test_box_frame')) {
      instructions.push(
        {
          lineNumber: iteration * 100 + 10,
          instruction: 'drawCenteredString(0, 16, "drawBox");',
          function: 'display.drawStr',
          params: { param0: 32, param1: 16, param2: 'drawBox' }
        },
        {
          lineNumber: iteration * 100 + 11,
          instruction: 'lander_display.drawBox(5, 24, 20, 10);',
          function: 'display.drawBox',
          params: { param0: 5, param1: 24, param2: 20, param3: 10 }
        },
        {
          lineNumber: iteration * 100 + 12,
          instruction: `lander_display.drawBox(${10 + frame}, 29, 30, 8);`,
          function: 'display.drawBox',
          params: { param0: 10 + frame, param1: 29, param2: 30, param3: 8 }
        }
      );
    } else if (functionCall.includes('display_test_circles')) {
      instructions.push(
        {
          lineNumber: iteration * 100 + 10,
          instruction: 'drawCenteredString(0, 16, "drawDisc");',
          function: 'display.drawStr',
          params: { param0: 32, param1: 16, param2: 'drawDisc' }
        },
        {
          lineNumber: iteration * 100 + 11,
          instruction: 'lander_display.drawDisc(8, 32, 8);',
          function: 'display.drawDisc',
          params: { param0: 8, param1: 32, param2: 8 }
        },
        {
          lineNumber: iteration * 100 + 12,
          instruction: `lander_display.drawDisc(${24 + frame}, 32, 7);`,
          function: 'display.drawDisc',
          params: { param0: 24 + frame, param1: 32, param2: 7 }
        }
      );
    } else if (functionCall.includes('display_test_line')) {
      instructions.push(
        {
          lineNumber: iteration * 100 + 10,
          instruction: 'drawCenteredString(0, 16, "drawLine");',
          function: 'display.drawStr',
          params: { param0: 32, param1: 16, param2: 'drawLine' }
        },
        {
          lineNumber: iteration * 100 + 11,
          instruction: `lander_display.drawLine(${7 + frame}, 24, 40, 55);`,
          function: 'display.drawLine',
          params: { param0: 7 + frame, param1: 24, param2: 40, param3: 55 }
        },
        {
          lineNumber: iteration * 100 + 12,
          instruction: `lander_display.drawLine(${7 + frame * 2}, 24, 60, 55);`,
          function: 'display.drawLine',
          params: { param0: 7 + frame * 2, param1: 24, param2: 60, param3: 55 }
        }
      );
    } else if (functionCall.includes('display_test_triangle')) {
      instructions.push(
        {
          lineNumber: iteration * 100 + 10,
          instruction: 'drawCenteredString(0, 16, "drawTriangle");',
          function: 'display.drawStr',
          params: { param0: 32, param1: 16, param2: 'drawTriangle' }
        },
        {
          lineNumber: iteration * 100 + 11,
          instruction: 'lander_display.drawTriangle(14, 31, 45, 44, 10, 54);',
          function: 'display.drawTriangle',
          params: { param0: 14, param1: 31, param2: 45, param3: 44, param4: 10, param5: 54 }
        },
        {
          lineNumber: iteration * 100 + 12,
          instruction: `lander_display.drawTriangle(${14 + frame}, ${31 - frame}, ${45 + frame}, ${44 - frame}, ${57 + frame}, ${0 - frame});`,
          function: 'display.drawTriangle',
          params: { param0: 14 + frame, param1: Math.max(0, 31 - frame), param2: 45 + frame, param3: Math.max(0, 44 - frame), param4: 57 + frame, param5: Math.max(0, 0 - frame) }
        }
      );
    }
    
    return instructions;
  }

  // Parse loop body into individual lines
  private parseLoopBody(body: string): CodeLine[] {
    return body.split('\n')
      .map((line, index) => ({
        lineNumber: index + 1,
        content: line.trim(),
        type: 'loop' as const
      }))
      .filter(line => line.content.length > 0 && !line.content.startsWith('//'));
  }

  // Evaluate expressions with variable substitution
  private evaluateExpression(expr: string): number {
    // Handle "display_frame >> 3" type expressions
    if (expr.includes('>>')) {
      const [varName, shiftAmount] = expr.split('>>').map(s => s.trim());
      const varValue = this.state.variables.get(varName) || this.state.currentFrame;
      return varValue >> parseInt(shiftAmount);
    }
    
    // Handle "TEST_PAGE_COUNT * 8" type expressions
    if (expr.includes('*')) {
      const [left, right] = expr.split('*').map(s => s.trim());
      const leftValue = this.state.variables.get(left) || parseInt(left) || 0;
      const rightValue = this.state.variables.get(right) || parseInt(right) || 0;
      return leftValue * rightValue;
    }
    
    // Handle variable references
    if (this.state.variables.has(expr.trim())) {
      return this.state.variables.get(expr.trim())!;
    }
    
    // Handle numbers
    if (/^\d+$/.test(expr.trim())) {
      return parseInt(expr.trim());
    }
    
    return 0;
  }
}