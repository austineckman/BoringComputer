/**
 * TM1637Decoder.ts
 * Decodes TM1637 7-segment display function calls from serial output
 * and updates the visual display component
 */

export class TM1637Decoder {
  private componentId: string;
  private updateComponentState: (id: string, state: any) => void;
  private currentValue: string = "    ";
  private currentBrightness: number = 7;
  private addLog: (message: string, type?: string) => void;

  constructor(
    componentId: string,
    updateComponentState: (id: string, state: any) => void,
    addLog: (message: string, type?: string) => void
  ) {
    this.componentId = componentId;
    this.updateComponentState = updateComponentState;
    this.addLog = addLog;
    console.log(`[TM1637Decoder] Initialized for component ${componentId}`);
  }

  /**
   * Process serial output to detect TM1637 function calls
   */
  processSerialOutput(output: string): void {
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Look for TM1637 debug output patterns
      // These patterns match the debug output from the TM1637 library
      
      // Pattern: TM1637_CALL: showNumberDec(1234, true)
      const showNumberDecMatch = line.match(/TM1637_CALL:\s*showNumberDec\s*\(\s*(\d+)\s*,?\s*(true|false)?\s*\)/i);
      if (showNumberDecMatch) {
        const number = parseInt(showNumberDecMatch[1]);
        const leadingZeros = showNumberDecMatch[2] === 'true';
        this.handleShowNumberDec(number, leadingZeros);
        continue;
      }

      // Pattern: TM1637_CALL: showNumberDecEx(1234, 0x40, true)
      const showNumberDecExMatch = line.match(/TM1637_CALL:\s*showNumberDecEx\s*\(\s*(\d+)\s*,\s*0x([0-9a-fA-F]+)\s*,?\s*(true|false)?\s*\)/i);
      if (showNumberDecExMatch) {
        const number = parseInt(showNumberDecExMatch[1]);
        const dots = parseInt(showNumberDecExMatch[2], 16);
        const leadingZeros = showNumberDecExMatch[3] === 'true';
        this.handleShowNumberDecEx(number, dots, leadingZeros);
        continue;
      }

      // Pattern: TM1637_CALL: setBrightness(5)
      const setBrightnessMatch = line.match(/TM1637_CALL:\s*setBrightness\s*\(\s*(\d+)\s*\)/i);
      if (setBrightnessMatch) {
        const brightness = parseInt(setBrightnessMatch[1]);
        this.handleSetBrightness(brightness);
        continue;
      }

      // Pattern: TM1637_CALL: clear()
      const clearMatch = line.match(/TM1637_CALL:\s*clear\s*\(\s*\)/i);
      if (clearMatch) {
        this.handleClear();
        continue;
      }

      // Pattern: TM1637_CALL: setSegments([0xFF, 0xFF, 0xFF, 0xFF])
      const setSegmentsMatch = line.match(/TM1637_CALL:\s*setSegments\s*\(\s*\[([^\]]+)\]\s*\)/i);
      if (setSegmentsMatch) {
        const segments = setSegmentsMatch[1].split(',').map(s => parseInt(s.trim(), 16));
        this.handleSetSegments(segments);
        continue;
      }
    }
  }

  /**
   * Handle showNumberDec(number, leadingZeros) call
   */
  private handleShowNumberDec(number: number, leadingZeros: boolean = false): void {
    let displayValue: string;
    
    if (leadingZeros) {
      // Show leading zeros (e.g., 0012 for number 12)
      displayValue = number.toString().padStart(4, '0');
    } else {
      // No leading zeros (e.g., "  12" for number 12)
      displayValue = number.toString().padStart(4, ' ');
    }
    
    // Truncate to 4 digits if longer
    if (displayValue.length > 4) {
      displayValue = displayValue.substring(displayValue.length - 4);
    }
    
    this.currentValue = displayValue;
    this.updateDisplay();
    
    console.log(`[TM1637Decoder] showNumberDec(${number}, ${leadingZeros}) -> "${displayValue}"`);
    this.addLog(`7-Segment: Showing ${number}`, 'info');
  }

  /**
   * Handle showNumberDecEx(number, dots, leadingZeros) call
   * The dots parameter is a bitmask for showing decimal points/colons
   */
  private handleShowNumberDecEx(number: number, dots: number, leadingZeros: boolean = false): void {
    let displayValue: string;
    
    if (leadingZeros) {
      displayValue = number.toString().padStart(4, '0');
    } else {
      displayValue = number.toString().padStart(4, ' ');
    }
    
    if (displayValue.length > 4) {
      displayValue = displayValue.substring(displayValue.length - 4);
    }
    
    // Add colon for time format if bit 6 is set (0x40 = 0b01000000)
    if (dots & 0x40 && displayValue.length >= 4) {
      // Insert colon between digits 2 and 3 (e.g., "12:34")
      displayValue = displayValue.substring(0, 2) + ':' + displayValue.substring(2);
    }
    
    this.currentValue = displayValue;
    this.updateDisplay();
    
    console.log(`[TM1637Decoder] showNumberDecEx(${number}, ${dots.toString(16)}, ${leadingZeros}) -> "${displayValue}"`);
    this.addLog(`7-Segment: Showing ${displayValue}`, 'info');
  }

  /**
   * Handle setBrightness(brightness) call
   * Brightness range: 0-7
   */
  private handleSetBrightness(brightness: number): void {
    // Clamp brightness to 0-7 range
    this.currentBrightness = Math.max(0, Math.min(7, brightness));
    this.updateDisplay();
    
    console.log(`[TM1637Decoder] setBrightness(${brightness})`);
    this.addLog(`7-Segment: Brightness ${this.currentBrightness}/7`, 'info');
  }

  /**
   * Handle clear() call
   */
  private handleClear(): void {
    this.currentValue = "    "; // 4 blank spaces
    this.updateDisplay();
    
    console.log(`[TM1637Decoder] clear()`);
    this.addLog(`7-Segment: Display cleared`, 'info');
  }

  /**
   * Handle setSegments(data) call
   * This is for custom segment patterns
   */
  private handleSetSegments(segments: number[]): void {
    // Convert segment data to display representation
    // For now, we'll show "----" to indicate custom segments
    // In a full implementation, you'd decode each segment byte
    const displayValue = segments.map(() => '-').join('').padEnd(4, ' ').substring(0, 4);
    
    this.currentValue = displayValue;
    this.updateDisplay();
    
    console.log(`[TM1637Decoder] setSegments([${segments.map(s => '0x' + s.toString(16)).join(', ')}])`);
    this.addLog(`7-Segment: Custom segments`, 'info');
  }

  /**
   * Update the visual component state
   */
  private updateDisplay(): void {
    this.updateComponentState(this.componentId, {
      displayValue: this.currentValue,
      brightness: this.currentBrightness,
      type: 'segmented-display'
    });
  }

  /**
   * Reset the display to initial state
   */
  public reset(): void {
    this.currentValue = "    ";
    this.currentBrightness = 7;
    this.updateDisplay();
    console.log(`[TM1637Decoder] Reset`);
  }
}
