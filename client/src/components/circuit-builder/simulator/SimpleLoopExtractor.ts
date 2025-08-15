/**
 * SimpleLoopExtractor.ts - Lightweight Arduino loop content extractor
 * Designed for performance - won't freeze the browser
 */

export class SimpleLoopExtractor {
  
  /**
   * Extract the loop function content from Arduino code
   * Uses simple, efficient string manipulation
   */
  extractLoop(code: string): string[] {
    console.log('SimpleLoopExtractor: Starting extraction');
    
    // Find the loop function
    const loopRegex = /void\s+loop\s*\(\s*\)\s*\{/;
    const loopMatch = code.match(loopRegex);
    
    if (!loopMatch || loopMatch.index === undefined) {
      console.log('SimpleLoopExtractor: No loop function found');
      return [];
    }
    
    // Start from after the opening brace
    let startIndex = loopMatch.index + loopMatch[0].length;
    let braceCount = 1;
    let endIndex = startIndex;
    
    // Find the matching closing brace
    for (let i = startIndex; i < code.length && braceCount > 0; i++) {
      const char = code[i];
      
      // Skip string literals
      if (char === '"') {
        i++;
        while (i < code.length && code[i] !== '"') {
          if (code[i] === '\\') i++; // Skip escaped characters
          i++;
        }
        continue;
      }
      
      // Skip single-line comments
      if (char === '/' && code[i + 1] === '/') {
        while (i < code.length && code[i] !== '\n') i++;
        continue;
      }
      
      // Skip multi-line comments
      if (char === '/' && code[i + 1] === '*') {
        i += 2;
        while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
          i++;
        }
        i++;
        continue;
      }
      
      // Count braces
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
        }
      }
    }
    
    // Extract the loop body
    const loopBody = code.substring(startIndex, endIndex).trim();
    
    if (!loopBody) {
      console.log('SimpleLoopExtractor: Empty loop body');
      return [];
    }
    
    console.log('SimpleLoopExtractor: Found loop body with', loopBody.length, 'characters');
    
    // Split into lines and clean them up
    const lines = loopBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Filter out empty lines and comments
        return line && 
               !line.startsWith('//') && 
               line !== '{' && 
               line !== '}';
      });
    
    console.log('SimpleLoopExtractor: Extracted', lines.length, 'lines from loop');
    return lines;
  }
  
  /**
   * Extract setup function content
   */
  extractSetup(code: string): string[] {
    console.log('SimpleLoopExtractor: Extracting setup');
    
    // Find the setup function
    const setupRegex = /void\s+setup\s*\(\s*\)\s*\{/;
    const setupMatch = code.match(setupRegex);
    
    if (!setupMatch || setupMatch.index === undefined) {
      console.log('SimpleLoopExtractor: No setup function found');
      return [];
    }
    
    // Start from after the opening brace
    let startIndex = setupMatch.index + setupMatch[0].length;
    let braceCount = 1;
    let endIndex = startIndex;
    
    // Find the matching closing brace
    for (let i = startIndex; i < code.length && braceCount > 0; i++) {
      const char = code[i];
      
      // Skip string literals
      if (char === '"') {
        i++;
        while (i < code.length && code[i] !== '"') {
          if (code[i] === '\\') i++; // Skip escaped characters
          i++;
        }
        continue;
      }
      
      // Skip comments
      if (char === '/' && code[i + 1] === '/') {
        while (i < code.length && code[i] !== '\n') i++;
        continue;
      }
      
      if (char === '/' && code[i + 1] === '*') {
        i += 2;
        while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
          i++;
        }
        i++;
        continue;
      }
      
      // Count braces
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i;
        }
      }
    }
    
    // Extract the setup body
    const setupBody = code.substring(startIndex, endIndex).trim();
    
    if (!setupBody) {
      console.log('SimpleLoopExtractor: Empty setup body');
      return [];
    }
    
    // Split into lines and clean them up
    const lines = setupBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        return line && 
               !line.startsWith('//') && 
               line !== '{' && 
               line !== '}';
      });
    
    console.log('SimpleLoopExtractor: Extracted', lines.length, 'lines from setup');
    return lines;
  }
  
  /**
   * Parse a single line into a simple instruction
   */
  parseLineToInstruction(line: string, lineNumber: number): any {
    const trimmed = line.trim();
    
    // Remove trailing semicolon
    const clean = trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed;
    
    // Check for delay
    if (clean.includes('delay(')) {
      const delayMatch = clean.match(/delay\s*\(\s*(\d+)\s*\)/);
      if (delayMatch) {
        return {
          lineNumber,
          instruction: clean,
          function: 'delay',
          delayMs: parseInt(delayMatch[1]),
          params: { ms: parseInt(delayMatch[1]) }
        };
      }
    }
    
    // Check for OLED display functions
    if (clean.includes('.clearBuffer()')) {
      return {
        lineNumber,
        instruction: clean,
        function: 'display.clearBuffer',
        params: {}
      };
    }
    
    if (clean.includes('.sendBuffer()')) {
      return {
        lineNumber,
        instruction: clean,
        function: 'display.sendBuffer',
        params: {}
      };
    }
    
    if (clean.includes('.drawStr(')) {
      const match = clean.match(/\.drawStr\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
      if (match) {
        return {
          lineNumber,
          instruction: clean,
          function: 'display.drawStr',
          params: {
            x: match[1].trim(),
            y: match[2].trim(),
            text: match[3].trim().replace(/['"]/g, '')
          }
        };
      }
    }
    
    if (clean.includes('.drawCircle(')) {
      const match = clean.match(/\.drawCircle\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
      if (match) {
        return {
          lineNumber,
          instruction: clean,
          function: 'display.drawCircle',
          params: {
            x: match[1].trim(),
            y: match[2].trim(),
            radius: match[3].trim()
          }
        };
      }
    }
    
    if (clean.includes('.drawDisc(')) {
      const match = clean.match(/\.drawDisc\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
      if (match) {
        return {
          lineNumber,
          instruction: clean,
          function: 'display.drawDisc',
          params: {
            x: match[1].trim(),
            y: match[2].trim(),
            radius: match[3].trim()
          }
        };
      }
    }
    
    if (clean.includes('.drawFrame(')) {
      const match = clean.match(/\.drawFrame\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)/);
      if (match) {
        return {
          lineNumber,
          instruction: clean,
          function: 'display.drawFrame',
          params: {
            x: match[1].trim(),
            y: match[2].trim(),
            width: match[3].trim(),
            height: match[4].trim()
          }
        };
      }
    }
    
    if (clean.includes('.setFont(')) {
      const match = clean.match(/\.setFont\s*\(\s*([^)]+)\)/);
      if (match) {
        return {
          lineNumber,
          instruction: clean,
          function: 'display.setFont',
          params: {
            font: match[1].trim()
          }
        };
      }
    }
    
    // Check for control structures
    if (clean.startsWith('if') || clean.startsWith('if(')) {
      return {
        lineNumber,
        instruction: clean,
        function: 'if',
        params: { condition: clean }
      };
    }
    
    if (clean.startsWith('for') || clean.startsWith('for(')) {
      return {
        lineNumber,
        instruction: clean,
        function: 'for',
        params: { loop: clean }
      };
    }
    
    if (clean.startsWith('while') || clean.startsWith('while(')) {
      return {
        lineNumber,
        instruction: clean,
        function: 'while',
        params: { condition: clean }
      };
    }
    
    // Default: just a statement
    return {
      lineNumber,
      instruction: clean,
      function: 'statement',
      params: {}
    };
  }
}

export default SimpleLoopExtractor;