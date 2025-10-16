/**
 * ArduinoCompilationService.ts
 * 
 * Service for compiling Arduino code using the backend compiler proxy
 */

const COMPILER_URL = '/api/arduino-compiler/compile';

export interface CompilationResult {
  success: boolean;
  binary?: string; // Intel HEX format string
  errors?: string[];
  stdout?: string;
  stderr?: string;
}

export class ArduinoCompilationService {
  /**
   * Compile Arduino code using the backend compiler proxy
   */
  public static async compile(code: string): Promise<CompilationResult> {
    try {
      console.log('[Compiler] Sending code to backend compiler proxy...');
      
      const response = await fetch(COMPILER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Compiler] Received response:', result.success ? 'SUCCESS' : 'FAILURE');
      
      if (!result.success && result.errors) {
        console.error('[Compiler] Compilation errors:', result.errors);
      }

      return result;
    } catch (error) {
      console.error('[Compiler] Network or server error:', error);
      return {
        success: false,
        errors: [`Compiler server unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Parse Intel HEX format to Uint16Array for AVR8js
   * Intel HEX format: :LLAAAATT[DD...]CC
   * LL = byte count, AAAA = address, TT = record type, DD = data, CC = checksum
   */
  public static parseHexToProgram(hexString: string): Uint16Array {
    const program = new Uint16Array(0x8000); // 32KB program memory
    
    const lines = hexString.trim().split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) continue;
      
      if (!trimmedLine.startsWith(':')) {
        console.warn('[HEX Parser] Invalid line (no colon):', trimmedLine);
        continue;
      }
      
      const byteCount = parseInt(trimmedLine.substring(1, 3), 16);
      const address = parseInt(trimmedLine.substring(3, 7), 16);
      const recordType = parseInt(trimmedLine.substring(7, 9), 16);
      
      if (recordType === 0x00) {
        for (let i = 0; i < byteCount; i++) {
          const bytePos = 9 + (i * 2);
          const dataByte = parseInt(trimmedLine.substring(bytePos, bytePos + 2), 16);
          
          const wordAddress = Math.floor((address + i) / 2);
          const byteInWord = (address + i) % 2;
          
          if (byteInWord === 0) {
            program[wordAddress] = (program[wordAddress] & 0xFF00) | dataByte;
          } else {
            program[wordAddress] = (program[wordAddress] & 0x00FF) | (dataByte << 8);
          }
        }
      } else if (recordType === 0x01) {
        break;
      }
    }
    
    console.log('[HEX Parser] Parsed program successfully');
    return program;
  }

  /**
   * Compile and parse in one step
   */
  public static async compileAndParse(code: string): Promise<{
    success: boolean;
    program?: Uint16Array;
    errors?: string[];
  }> {
    const result = await this.compile(code);
    
    if (!result.success) {
      return {
        success: false,
        errors: result.errors
      };
    }
    
    try {
      const program = this.parseHexToProgram(result.binary!);
      return {
        success: true,
        program
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse HEX file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}
