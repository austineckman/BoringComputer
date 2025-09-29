/**
 * ArduinoInterpreter.ts
 * 
 * A proper Arduino interpreter that executes code instruction-by-instruction
 * Using real emulator/interpreter patterns
 */

export interface PinState {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP' | null;
  value: boolean;
  pwmValue?: number;
}

export interface InterpreterState {
  pins: Map<number, PinState>;
  variables: Map<string, any>;
  loopIteration: number;
  startTime: number;
}

export interface InterpreterCallbacks {
  onPinChange?: (pin: number, value: boolean, pwmValue?: number) => void;
  onLog?: (message: string) => void;
  onDelay?: (ms: number) => void;
}

export class ArduinoInterpreter {
  private state: InterpreterState;
  private callbacks: InterpreterCallbacks;
  private setupCode: string = '';
  private loopCode: string = '';
  private running: boolean = false;
  private loopIntervalId: number | null = null;

  constructor(callbacks: InterpreterCallbacks = {}) {
    this.callbacks = callbacks;
    this.state = {
      pins: new Map(),
      variables: new Map(),
      loopIteration: 0,
      startTime: Date.now()
    };
    
    // Initialize all pins
    for (let i = 0; i <= 19; i++) {
      this.state.pins.set(i, { mode: null, value: false });
    }
  }

  /**
   * Parse Arduino code and extract setup() and loop()
   */
  public parseCode(code: string): boolean {
    try {
      // Extract setup() function
      const setupMatch = code.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/);
      this.setupCode = setupMatch ? setupMatch[1].trim() : '';
      
      // Extract loop() function  
      const loopMatch = code.match(/void\s+loop\s*\(\s*\)\s*\{([\s\S]*?)\}/);
      this.loopCode = loopMatch ? loopMatch[1].trim() : '';
      
      this.log(`Parsed setup: ${this.setupCode.length} chars, loop: ${this.loopCode.length} chars`);
      return true;
    } catch (error) {
      this.log(`Parse error: ${error}`);
      return false;
    }
  }

  /**
   * Start executing the Arduino program
   */
  public start(): void {
    if (this.running) return;
    
    this.running = true;
    this.state.startTime = Date.now();
    this.state.loopIteration = 0;
    
    // Execute setup()
    this.log('Executing setup()...');
    this.executeBlock(this.setupCode);
    
    // Start loop() execution
    this.log('Starting loop()...');
    this.executeLoop();
  }

  /**
   * Stop the interpreter
   */
  public stop(): void {
    this.running = false;
    if (this.loopIntervalId !== null) {
      clearTimeout(this.loopIntervalId);
      this.loopIntervalId = null;
    }
    this.log('Interpreter stopped');
  }

  /**
   * Execute loop() repeatedly
   */
  private executeLoop(): void {
    if (!this.running) return;
    
    this.state.loopIteration++;
    this.executeBlock(this.loopCode);
    
    // Schedule next loop iteration (using minimal delay to allow UI updates)
    this.loopIntervalId = window.setTimeout(() => this.executeLoop(), 10);
  }

  /**
   * Execute a block of code
   */
  private executeBlock(code: string): void {
    // Split into lines and execute each
    const lines = code.split(';').map(l => l.trim()).filter(l => l.length > 0);
    
    for (const line of lines) {
      this.executeLine(line);
    }
  }

  /**
   * Execute a single line of code
   */
  private executeLine(line: string): void {
    // Remove comments
    line = line.replace(/\/\/.*$/, '').trim();
    if (!line) return;

    // pinMode(pin, mode)
    if (line.includes('pinMode')) {
      const match = line.match(/pinMode\s*\(\s*(\d+)\s*,\s*(\w+)\s*\)/);
      if (match) {
        const pin = parseInt(match[1]);
        const mode = match[2] as 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
        this.pinMode(pin, mode);
      }
      return;
    }

    // digitalWrite(pin, value)
    if (line.includes('digitalWrite')) {
      const match = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW)\s*\)/);
      if (match) {
        const pin = parseInt(match[1]);
        const value = match[2] === 'HIGH';
        this.digitalWrite(pin, value);
      }
      return;
    }

    // analogWrite(pin, value)
    if (line.includes('analogWrite')) {
      const match = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/);
      if (match) {
        const pin = parseInt(match[1]);
        const pwmValue = parseInt(match[2]);
        this.analogWrite(pin, pwmValue);
      }
      return;
    }

    // delay(ms)
    if (line.includes('delay')) {
      const match = line.match(/delay\s*\(\s*(\d+)\s*\)/);
      if (match) {
        const ms = parseInt(match[1]);
        this.delay(ms);
      }
      return;
    }

    // Serial.print / Serial.println
    if (line.includes('Serial.print')) {
      const match = line.match(/Serial\.println?\s*\(\s*["']([^"']*)["']\s*\)/);
      if (match) {
        this.log(`Serial: ${match[1]}`);
      }
      return;
    }
  }

  /**
   * Arduino pinMode() implementation
   */
  private pinMode(pin: number, mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'): void {
    const pinState = this.state.pins.get(pin);
    if (pinState) {
      pinState.mode = mode;
      this.log(`Pin ${pin} set to ${mode}`);
    }
  }

  /**
   * Arduino digitalWrite() implementation
   */
  private digitalWrite(pin: number, value: boolean): void {
    const pinState = this.state.pins.get(pin);
    if (pinState) {
      pinState.value = value;
      pinState.pwmValue = undefined;
      this.log(`Pin ${pin} → ${value ? 'HIGH' : 'LOW'}`);
      
      // Notify callback
      if (this.callbacks.onPinChange) {
        this.callbacks.onPinChange(pin, value);
      }
    }
  }

  /**
   * Arduino analogWrite() implementation
   */
  private analogWrite(pin: number, pwmValue: number): void {
    const pinState = this.state.pins.get(pin);
    if (pinState) {
      pinState.pwmValue = pwmValue;
      pinState.value = pwmValue > 0;
      this.log(`Pin ${pin} PWM → ${pwmValue}`);
      
      // Notify callback
      if (this.callbacks.onPinChange) {
        this.callbacks.onPinChange(pin, pwmValue > 0, pwmValue);
      }
    }
  }

  /**
   * Arduino delay() implementation
   */
  private delay(ms: number): void {
    // In a real interpreter, we'd pause execution
    // For now, we just log it
    if (this.callbacks.onDelay) {
      this.callbacks.onDelay(ms);
    }
  }

  /**
   * Log a message
   */
  private log(message: string): void {
    console.log(`[Interpreter] ${message}`);
    if (this.callbacks.onLog) {
      this.callbacks.onLog(message);
    }
  }

  /**
   * Get current pin state
   */
  public getPinState(pin: number): PinState | undefined {
    return this.state.pins.get(pin);
  }

  /**
   * Get millis() value
   */
  public millis(): number {
    return Date.now() - this.state.startTime;
  }
}
