/**
 * TM1637ProtocolDecoder.ts
 * Decodes TM1637 display protocol from CLK/DIO pin states
 * This monitors the actual hardware communication to update the display
 */

export class TM1637ProtocolDecoder {
  private componentId: string;
  private updateComponentState: (id: string, state: any) => void;
  private addLog: (message: string, type?: string) => void;
  
  // Protocol state
  private clkPin: boolean = false;
  private dioPin: boolean = false;
  private lastClkPin: boolean = false;
  
  // Data collection
  private currentByte: number = 0;
  private bitCount: number = 0;
  private receivedBytes: number[] = [];
  private isReceiving: boolean = false;
  
  // Display state
  private displayData: number[] = [0, 0, 0, 0];
  private brightness: number = 7;

  constructor(
    componentId: string,
    updateComponentState: (id: string, state: any) => void,
    addLog: (message: string, type?: string) => void
  ) {
    this.componentId = componentId;
    this.updateComponentState = updateComponentState;
    this.addLog = addLog;
    console.log(`[TM1637ProtocolDecoder] Initialized for component ${componentId}`);
  }

  /**
   * Update CLK pin state
   */
  public setClkPin(state: boolean): void {
    this.lastClkPin = this.clkPin;
    this.clkPin = state;
    
    // Check for clock edges
    this.checkProtocol();
  }

  /**
   * Update DIO pin state
   */
  public setDioPin(state: boolean): void {
    this.dioPin = state;
  }

  /**
   * Check for TM1637 protocol patterns
   */
  private checkProtocol(): void {
    // START condition: DIO goes LOW while CLK is HIGH
    if (this.clkPin && !this.dioPin && !this.isReceiving) {
      this.startCondition();
      return;
    }

    // STOP condition: DIO goes HIGH while CLK is HIGH
    if (this.clkPin && this.dioPin && this.isReceiving) {
      this.stopCondition();
      return;
    }

    // Data bit on rising clock edge
    if (this.clkPin && !this.lastClkPin && this.isReceiving) {
      this.receiveBit(this.dioPin);
    }
  }

  /**
   * Handle START condition
   */
  private startCondition(): void {
    console.log('[TM1637] START condition detected');
    this.isReceiving = true;
    this.currentByte = 0;
    this.bitCount = 0;
  }

  /**
   * Handle STOP condition
   */
  private stopCondition(): void {
    console.log('[TM1637] STOP condition detected');
    this.isReceiving = false;
    
    // Process the received command
    this.processCommand();
    
    // Clear for next transaction
    this.receivedBytes = [];
  }

  /**
   * Receive a single bit
   */
  private receiveBit(bit: boolean): void {
    this.currentByte |= (bit ? 1 : 0) << this.bitCount;
    this.bitCount++;

    // Complete byte received
    if (this.bitCount === 8) {
      this.receivedBytes.push(this.currentByte);
      console.log(`[TM1637] Received byte: 0x${this.currentByte.toString(16).toUpperCase()}`);
      this.currentByte = 0;
      this.bitCount = 0;
    }
  }

  /**
   * Process received command
   */
  private processCommand(): void {
    if (this.receivedBytes.length === 0) return;

    const cmd = this.receivedBytes[0];

    // Data command (0x40)
    if (cmd === 0x40) {
      console.log('[TM1637] Data write command');
    }
    
    // Address command (0xC0-0xC5)
    else if ((cmd & 0xF8) === 0xC0) {
      const address = cmd & 0x07;
      console.log(`[TM1637] Address command: ${address}`);
      
      // Following bytes are display data
      for (let i = 1; i < this.receivedBytes.length; i++) {
        const pos = address + i - 1;
        if (pos < 4) {
          this.displayData[pos] = this.receivedBytes[i];
        }
      }
      
      // Update display
      this.updateDisplay();
    }
    
    // Display control (0x80-0x8F)
    else if ((cmd & 0xF0) === 0x80) {
      const brightnessValue = cmd & 0x07;
      const displayOn = (cmd & 0x08) !== 0;
      
      this.brightness = brightnessValue;
      console.log(`[TM1637] Display control: brightness=${brightnessValue}, on=${displayOn}`);
      
      this.updateDisplay();
    }
  }

  /**
   * Update the visual display
   */
  private updateDisplay(): void {
    // Convert segment data to displayable characters
    const displayValue = this.displayData.map(segments => this.segmentsToChar(segments)).join('');
    
    console.log(`[TM1637] Display update: "${displayValue}" brightness=${this.brightness}`);
    
    this.updateComponentState(this.componentId, {
      displayValue,
      brightness: this.brightness,
      type: 'segmented-display'
    });
    
    this.addLog(`7-Segment: ${displayValue}`, 'info');
  }

  /**
   * Convert segment byte to character
   */
  private segmentsToChar(segments: number): string {
    const digitMap: {[key: number]: string} = {
      0x3F: '0',
      0x06: '1',
      0x5B: '2',
      0x4F: '3',
      0x66: '4',
      0x6D: '5',
      0x7D: '6',
      0x07: '7',
      0x7F: '8',
      0x6F: '9',
      0x77: 'A',
      0x7C: 'b',
      0x39: 'C',
      0x5E: 'd',
      0x79: 'E',
      0x71: 'F',
      0x00: ' '
    };

    // Check for decimal point
    const hasDecimal = (segments & 0x80) !== 0;
    const baseSegments = segments & 0x7F;
    
    const char = digitMap[baseSegments] || '-';
    return hasDecimal ? char + '.' : char;
  }

  /**
   * Reset the decoder
   */
  public reset(): void {
    this.displayData = [0, 0, 0, 0];
    this.brightness = 7;
    this.receivedBytes = [];
    this.isReceiving = false;
    this.updateDisplay();
  }
}
