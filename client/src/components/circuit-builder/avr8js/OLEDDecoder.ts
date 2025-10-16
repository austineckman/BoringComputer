/**
 * OLEDDecoder.ts - SSD1306/SH1106 OLED Display Protocol Decoder
 * 
 * Decodes I2C commands sent to OLED displays and maintains a display buffer
 */

export interface OLEDDisplayElement {
  type: 'text' | 'frame' | 'filledRect' | 'circle' | 'filledCircle' | 'triangle' | 'line' | 'pixel';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  x3?: number;
  y3?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
}

export interface OLEDDisplayState {
  initialized: boolean;
  elements: OLEDDisplayElement[];
  buffer: number[][]; // 128x64 pixel buffer
  cursorX: number;
  cursorY: number;
}

/**
 * SSD1306/SH1106 OLED Display Decoder
 * Tracks I2C commands and builds a visual representation
 */
export class OLEDDecoder {
  private address: number;
  private displayWidth: number = 128;
  private displayHeight: number = 64;
  private buffer: number[][];
  private elements: OLEDDisplayElement[] = [];
  private cursorX: number = 0;
  private cursorY: number = 0;
  private columnStart: number = 0;
  private columnEnd: number = 127;
  private pageStart: number = 0;
  private pageEnd: number = 7;
  private currentColumn: number = 0;
  private currentPage: number = 0;
  
  // I2C transaction state
  private inTransaction: boolean = false;
  private expectingControlByte: boolean = true;
  private dataMode: boolean = false; // false = command, true = data from control byte
  private continuationBit: boolean = false;
  
  constructor(address: number = 0x3C) {
    this.address = address;
    this.buffer = this.createEmptyBuffer();
  }
  
  private createEmptyBuffer(): number[][] {
    return new Array(this.displayHeight).fill(0).map(() => 
      new Array(this.displayWidth).fill(0)
    );
  }
  
  /**
   * Called when I2C START condition detected
   */
  public onStart(addr: number): void {
    if (addr === this.address) {
      this.inTransaction = true;
      this.expectingControlByte = true;
      console.log('[OLED] I2C Transaction START');
    }
  }
  
  /**
   * Called when I2C STOP condition detected
   */
  public onStop(): void {
    this.inTransaction = false;
    this.expectingControlByte = true;
    console.log('[OLED] I2C Transaction STOP');
  }
  
  /**
   * Process an I2C byte sent to the OLED
   */
  public processByte(addr: number, data: number): void {
    // Check if this byte is for our OLED
    if (addr !== this.address) {
      return;
    }
    
    if (!this.inTransaction) {
      // First byte after address - this is a control byte
      this.onStart(addr);
    }
    
    if (this.expectingControlByte) {
      // This is the control byte (Co | D/C# | 0 0 0 0 0 0)
      // Bit 7 (Co): Continuation bit (0 = last control byte, 1 = more control bytes follow)
      // Bit 6 (D/C#): Data/Command select (0 = command, 1 = data)
      // Bits 5-0: Must be 0
      
      this.continuationBit = (data & 0x80) !== 0;
      this.dataMode = (data & 0x40) !== 0;
      this.expectingControlByte = this.continuationBit; // Expect another control byte if Co=1
      
      console.log(`[OLED] Control byte: Co=${this.continuationBit ? 1 : 0}, D/C=${this.dataMode ? 1 : 0}`);
      return;
    }
    
    // Process the data/command byte
    if (this.dataMode) {
      this.processDataByte(data);
    } else {
      this.processCommandByte(data);
    }
    
    // If continuation bit was set, expect another control byte next
    if (this.continuationBit) {
      this.expectingControlByte = true;
    }
  }
  
  /**
   * Process a command byte
   */
  private processCommandByte(cmd: number): void {
    // Display On/Off
    if ((cmd & 0xFE) === 0xAE) {
      const displayOn = (cmd & 0x01) === 0x01;
      console.log(`[OLED] Display ${displayOn ? 'ON' : 'OFF'}`);
      return;
    }
    
    // Set Column Address (lower nibble)
    if ((cmd & 0xF0) === 0x00) {
      this.currentColumn = (this.currentColumn & 0xF0) | (cmd & 0x0F);
      console.log(`[OLED] Set column (low): ${this.currentColumn}`);
      return;
    }
    
    // Set Column Address (upper nibble)
    if ((cmd & 0xF0) === 0x10) {
      this.currentColumn = (this.currentColumn & 0x0F) | ((cmd & 0x0F) << 4);
      console.log(`[OLED] Set column (high): ${this.currentColumn}`);
      return;
    }
    
    // Set Page Address
    if ((cmd & 0xF8) === 0xB0) {
      this.currentPage = cmd & 0x07;
      console.log(`[OLED] Set page: ${this.currentPage}`);
      return;
    }
    
    // Set addressing mode
    if (cmd === 0x20) {
      console.log('[OLED] Set addressing mode (next byte)');
      return;
    }
    
    // Set contrast
    if (cmd === 0x81) {
      console.log('[OLED] Set contrast (next byte)');
      return;
    }
    
    console.log(`[OLED] Command: 0x${cmd.toString(16)}`);
  }
  
  /**
   * Process a data byte (pixel data)
   */
  private processDataByte(data: number): void {
    // Each data byte represents 8 vertical pixels in a column
    const page = this.currentPage;
    const column = this.currentColumn;
    
    if (column >= 0 && column < this.displayWidth && page >= 0 && page < 8) {
      // Each page is 8 pixels tall
      const yBase = page * 8;
      
      for (let bit = 0; bit < 8; bit++) {
        const y = yBase + bit;
        if (y < this.displayHeight) {
          this.buffer[y][column] = (data & (1 << bit)) ? 1 : 0;
        }
      }
      
      console.log(`[OLED] Write data 0x${data.toString(16)} to col=${column}, page=${page}`);
    }
    
    // Auto-increment column
    this.currentColumn++;
    if (this.currentColumn > this.columnEnd) {
      this.currentColumn = this.columnStart;
      this.currentPage++;
      if (this.currentPage > this.pageEnd) {
        this.currentPage = this.pageStart;
      }
    }
  }
  
  /**
   * Get the current display state
   */
  public getDisplayState(): OLEDDisplayState {
    // Convert buffer to elements for rendering
    this.extractElementsFromBuffer();
    
    return {
      initialized: true,
      elements: this.elements,
      buffer: this.buffer,
      cursorX: this.cursorX,
      cursorY: this.cursorY
    };
  }
  
  /**
   * Extract visual elements from the pixel buffer
   * This is a simplified version that detects basic patterns
   */
  private extractElementsFromBuffer(): void {
    // For now, we'll just render the raw pixels
    // Future enhancement: pattern detection for text, shapes, etc.
    
    // Clear previous elements
    this.elements = [];
    
    // Add pixels as elements
    for (let y = 0; y < this.displayHeight; y++) {
      for (let x = 0; x < this.displayWidth; x++) {
        if (this.buffer[y][x] === 1) {
          this.elements.push({
            type: 'pixel',
            x: x,
            y: y
          });
        }
      }
    }
  }
  
  /**
   * Clear the display buffer
   */
  public clear(): void {
    this.buffer = this.createEmptyBuffer();
    this.elements = [];
    this.currentColumn = 0;
    this.currentPage = 0;
  }
  
  /**
   * Reset the decoder state
   */
  public reset(): void {
    this.clear();
    this.cursorX = 0;
    this.cursorY = 0;
    this.dataMode = false;
  }
}
