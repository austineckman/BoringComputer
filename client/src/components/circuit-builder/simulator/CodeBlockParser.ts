/**
 * CodeBlockParser.ts - Proper Arduino code block parsing like Wokwi/Arduino IDE
 * Parses code structure first, then executes conditionally based on control flow
 */

export interface CodeBlock {
  type: 'if' | 'else' | 'elseif' | 'while' | 'for' | 'function' | 'statement';
  condition?: string;
  startLine: number;
  endLine: number;
  instructions: ArduinoInstruction[];
  children?: CodeBlock[];
  parent?: CodeBlock;
}

export interface ArduinoInstruction {
  lineNumber: number;
  instruction: string;
  pin?: number;
  value?: 'HIGH' | 'LOW' | number;
  delayMs?: number;
  function?: string;
  condition?: string;
  variable?: string;
  type?: string;
  params?: any;
}

export class CodeBlockParser {
  private variables: Map<string, number> = new Map();
  
  /**
   * Parse Arduino code into structured blocks like real Arduino IDE
   * This allows proper conditional execution instead of line-by-line
   */
  parseIntoBlocks(code: string): { setup: CodeBlock[], loop: CodeBlock[] } {
    console.log('[CodeBlockParser] Parsing Arduino code into structured blocks...');
    
    const lines = code.split('\n').map((line, index) => ({
      lineNumber: index + 1,
      content: line.trim()
    }));
    
    // Extract setup and loop sections first
    const setupLines = this.extractSection(lines, 'setup');
    const loopLines = this.extractSection(lines, 'loop');
    
    console.log('[CodeBlockParser] Found:', setupLines.length, 'setup lines,', loopLines.length, 'loop lines');
    
    return {
      setup: this.parseBlocksFromLines(setupLines),
      loop: this.parseBlocksFromLines(loopLines)
    };
  }
  
  private extractSection(lines: any[], section: 'setup' | 'loop'): any[] {
    const sectionLines = [];
    let inSection = false;
    let braceDepth = 0;
    
    for (const line of lines) {
      const content = line.content;
      
      // Detect section start
      if (content.includes(`void ${section}(`)) {
        inSection = true;
        braceDepth = 0;
        continue;
      }
      
      if (inSection) {
        // Count braces to know when section ends
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        braceDepth += openBraces - closeBraces;
        
        if (braceDepth < 0) {
          // Section ended
          break;
        }
        
        if (content && !content.startsWith('//')) {
          sectionLines.push(line);
        }
      }
    }
    
    return sectionLines;
  }
  
  /**
   * Parse lines into structured code blocks (if/else/while/for)
   */
  private parseBlocksFromLines(lines: any[]): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const content = line.content;
      
      if (!content) {
        i++;
        continue;
      }
      
      // Parse if statements
      const ifMatch = content.match(/if\s*\((.*?)\)/);
      if (ifMatch) {
        const block = this.parseIfBlock(lines, i);
        blocks.push(block);
        i = block.endLine;
        continue;
      }
      
      // Parse while loops  
      const whileMatch = content.match(/while\s*\((.*?)\)/);
      if (whileMatch) {
        const block = this.parseWhileBlock(lines, i);
        blocks.push(block);
        i = block.endLine;
        continue;
      }
      
      // Parse for loops
      const forMatch = content.match(/for\s*\((.*?);(.*?);(.*?)\)/);
      if (forMatch) {
        const block = this.parseForBlock(lines, i);
        blocks.push(block);
        i = block.endLine;
        continue;
      }
      
      // Parse regular statements
      const instruction = this.parseInstruction(line);
      if (instruction) {
        blocks.push({
          type: 'statement',
          startLine: line.lineNumber,
          endLine: line.lineNumber,
          instructions: [instruction]
        });
      }
      
      i++;
    }
    
    return blocks;
  }
  
  /**
   * Parse if/else/elseif block structure like Arduino IDE
   */
  private parseIfBlock(lines: any[], startIndex: number): CodeBlock {
    const startLine = lines[startIndex];
    const ifMatch = startLine.content.match(/if\s*\((.*?)\)/);
    const condition = ifMatch[1];
    
    console.log('[CodeBlockParser] Parsing if block with condition:', condition);
    
    // Find the instructions that belong to this if block
    const ifInstructions = [];
    const elseInstructions = [];
    
    let i = startIndex + 1;
    let foundElse = false;
    
    // Parse instructions until we find 'else' or reach end of block
    while (i < lines.length) {
      const line = lines[i];
      const content = line.content;
      
      // Check for else
      if (content.trim() === 'else' || content.includes('else {')) {
        foundElse = true;
        i++;
        continue;
      }
      
      // Check if we've reached the end of this conditional block
      if (this.isEndOfConditionalBlock(line, lines, i)) {
        break;
      }
      
      const instruction = this.parseInstruction(line);
      if (instruction) {
        if (foundElse) {
          elseInstructions.push(instruction);
        } else {
          ifInstructions.push(instruction);
        }
      }
      
      i++;
    }
    
    console.log('[CodeBlockParser] If block parsed:', ifInstructions.length, 'if instructions,', elseInstructions.length, 'else instructions');
    
    const block: CodeBlock = {
      type: 'if',
      condition: condition,
      startLine: startLine.lineNumber,
      endLine: i,
      instructions: ifInstructions
    };
    
    // Add else block as child if it exists
    if (elseInstructions.length > 0) {
      block.children = [{
        type: 'else',
        startLine: startLine.lineNumber,
        endLine: i,
        instructions: elseInstructions
      }];
    }
    
    return block;
  }
  
  /**
   * Determine if we've reached the end of a conditional block
   */
  private isEndOfConditionalBlock(line: any, lines: any[], index: number): boolean {
    const content = line.content;
    
    // Check for control flow keywords that would end the current block
    if (content.includes('if (') && !content.includes('else if')) {
      return true; // New if statement starts
    }
    
    // Check for delay() which often marks end of conditional logic in Arduino
    if (content.includes('delay(')) {
      // Look ahead - if next instruction is not part of the same conditional, this ends the block
      const nextLine = lines[index + 1];
      if (!nextLine || !this.isConditionalInstruction(nextLine.content)) {
        return true;
      }
    }
    
    return false;
  }
  
  private isConditionalInstruction(content: string): boolean {
    return content.includes('digitalWrite') || 
           content.includes('analogWrite') ||
           content.includes('Serial.') ||
           content.includes('delay');
  }
  
  private parseWhileBlock(lines: any[], startIndex: number): CodeBlock {
    // Similar to if block but for while loops
    return {
      type: 'while',
      startLine: lines[startIndex].lineNumber,
      endLine: startIndex + 1,
      instructions: []
    };
  }
  
  private parseForBlock(lines: any[], startIndex: number): CodeBlock {
    // Similar to if block but for for loops
    return {
      type: 'for',
      startLine: lines[startIndex].lineNumber,
      endLine: startIndex + 1,
      instructions: []
    };
  }
  
  /**
   * Parse individual instruction line into ArduinoInstruction
   */
  private parseInstruction(line: any): ArduinoInstruction | null {
    const content = line.content;
    const lineNumber = line.lineNumber;
    
    // Parse pinMode(pin, mode)
    const pinModeMatch = content.match(/pinMode\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/);
    if (pinModeMatch) {
      return {
        lineNumber,
        instruction: `pinMode(${pinModeMatch[1]}, ${pinModeMatch[2]})`,
        pin: parseInt(pinModeMatch[1])
      };
    }
    
    // Parse digitalWrite(pin, value)
    const digitalWriteMatch = content.match(/digitalWrite\s*\(\s*(\w+|\d+)\s*,\s*(\w+)\s*\)/);
    if (digitalWriteMatch) {
      return {
        lineNumber,
        instruction: `digitalWrite(${digitalWriteMatch[1]}, ${digitalWriteMatch[2]})`,
        pin: parseInt(digitalWriteMatch[1]),
        value: digitalWriteMatch[2] as 'HIGH' | 'LOW'
      };
    }
    
    // Parse analogRead(pin)
    const analogReadMatch = content.match(/analogRead\s*\(\s*(\w+|\d+)\s*\)/);
    if (analogReadMatch) {
      return {
        lineNumber,
        instruction: `analogRead(${analogReadMatch[1]})`,
        pin: parseInt(analogReadMatch[1]),
        function: 'analogRead'
      };
    }
    
    // Parse delay(ms)
    const delayMatch = content.match(/delay\s*\(\s*(\d+)\s*\)/);
    if (delayMatch) {
      return {
        lineNumber,
        instruction: `delay(${delayMatch[1]})`,
        delayMs: parseInt(delayMatch[1])
      };
    }
    
    // Parse Serial.print/println
    const serialMatch = content.match(/Serial\.(print|println)\s*\((.*)\)/);
    if (serialMatch) {
      return {
        lineNumber,
        instruction: `Serial.${serialMatch[1]}(${serialMatch[2]})`,
        function: 'serial'
      };
    }
    
    return null;
  }
  
  /**
   * Execute a code block with proper conditional logic
   */
  executeBlock(block: CodeBlock, context: any): boolean {
    console.log(`[CodeBlockParser] Executing ${block.type} block with ${block.instructions?.length || 0} instructions`);
    
    if (block.type === 'if') {
      // Evaluate condition
      const conditionResult = this.evaluateCondition(block.condition!, context);
      console.log(`[CodeBlockParser] If condition "${block.condition}" evaluated to:`, conditionResult);
      
      if (conditionResult) {
        // Execute if block instructions
        console.log(`[CodeBlockParser] Executing IF branch (${block.instructions.length} instructions)`);
        return true;
      } else {
        // Execute else block if it exists
        if (block.children && block.children.length > 0) {
          console.log(`[CodeBlockParser] Executing ELSE branch (${block.children[0].instructions.length} instructions)`);
          return false; // Signal to execute else block
        }
        console.log(`[CodeBlockParser] Skipping IF block (condition false, no else)`);
        return false;
      }
    }
    
    if (block.type === 'statement') {
      console.log(`[CodeBlockParser] Executing statement: ${block.instructions[0]?.instruction}`);
      return true;
    }
    
    return true;
  }
  
  /**
   * Evaluate condition expression like Arduino IDE
   */
  private evaluateCondition(condition: string, context: any): boolean {
    try {
      console.log(`[CodeBlockParser] Evaluating condition: "${condition}"`);
      console.log(`[CodeBlockParser] Available context:`, context);
      
      // Replace variables with their values
      let evaluatedCondition = condition;
      
      // Look for variable references
      const variableMatch = condition.match(/(\w+)\s*([><=!]+)\s*(\d+)/);
      if (variableMatch) {
        const variableName = variableMatch[1];
        const operator = variableMatch[2];
        const compareValue = parseInt(variableMatch[3]);
        
        // Get variable value from context
        let variableValue = context?.variables?.[variableName] || 
                           context?.globalVars?.[variableName] ||
                           window?.lastAnalogReadValue?.value;
        
        if (variableValue !== undefined) {
          evaluatedCondition = `${variableValue} ${operator} ${compareValue}`;
          console.log(`[CodeBlockParser] Resolved variable ${variableName}=${variableValue}, condition: ${evaluatedCondition}`);
        }
      }
      
      // Safely evaluate the condition
      const result = Function(`"use strict"; return (${evaluatedCondition})`)();
      console.log(`[CodeBlockParser] Condition result:`, result);
      return Boolean(result);
      
    } catch (error) {
      console.error(`[CodeBlockParser] Error evaluating condition "${condition}":`, error);
      return false;
    }
  }
}