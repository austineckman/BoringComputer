/**
 * SimulatorEngine.ts - Main simulation engine that coordinates Arduino emulation
 * 
 * This is the central hub that connects:
 * - Arduino code compilation
 * - AVR8JS emulation 
 * - Visual component updates
 * - Educational quest integration
 */

import { ArduinoEmulator, ArduinoEmulatorOptions } from '../avr8js/ArduinoEmulator';
import { ArduinoCompiler, CompilationResult } from '../avr8js/ArduinoCompiler';

export interface ComponentConnection {
  componentId: string;
  componentType: string;
  arduinoPin: number;
  onPinChange?: (isHigh: boolean) => void;
}

export interface SimulationState {
  isRunning: boolean;
  isCompiling: boolean;
  currentCode: string;
  logs: string[];
  pinStates: { [pin: number]: boolean };
  components: ComponentConnection[];
}

export class SimulatorEngine {
  private emulator: ArduinoEmulator;
  private compiler: ArduinoCompiler;
  private state: SimulationState;
  private stateUpdateCallback?: (state: SimulationState) => void;

  constructor() {
    this.compiler = new ArduinoCompiler();
    
    // Initialize state
    this.state = {
      isRunning: false,
      isCompiling: false,
      currentCode: '',
      logs: [],
      pinStates: {},
      components: []
    };

    // Create emulator with our callback handlers
    const emulatorOptions: ArduinoEmulatorOptions = {
      onPinChange: this.handlePinChange.bind(this),
      onLog: this.addLog.bind(this)
    };

    this.emulator = new ArduinoEmulator(emulatorOptions);
    
    this.addLog('Simulator engine initialized');
  }

  /**
   * Register a callback to be notified when simulation state changes
   */
  public onStateUpdate(callback: (state: SimulationState) => void): void {
    this.stateUpdateCallback = callback;
  }

  /**
   * Connect a visual component to an Arduino pin
   */
  public connectComponent(connection: ComponentConnection): void {
    // Remove any existing connection for this component
    this.state.components = this.state.components.filter(
      c => c.componentId !== connection.componentId
    );
    
    // Add the new connection
    this.state.components.push(connection);
    
    this.addLog(`Connected ${connection.componentType} to pin ${connection.arduinoPin}`);
    this.notifyStateUpdate();
  }

  /**
   * Disconnect a component
   */
  public disconnectComponent(componentId: string): void {
    this.state.components = this.state.components.filter(
      c => c.componentId !== componentId
    );
    
    this.addLog(`Disconnected component ${componentId}`);
    this.notifyStateUpdate();
  }

  /**
   * Compile and run Arduino code
   */
  public async compileAndRun(code: string): Promise<boolean> {
    if (this.state.isRunning) {
      this.stop();
    }

    this.state.isCompiling = true;
    this.state.currentCode = code;
    this.notifyStateUpdate();

    try {
      this.addLog('Compiling Arduino code...');
      
      // Compile the code
      const result: CompilationResult = this.compiler.compile(code);
      
      if (!result.success) {
        this.addLog('Compilation failed:');
        result.errors.forEach(error => this.addLog(`  ${error}`));
        return false;
      }

      this.addLog(`Compilation successful (${result.programSize} words)`);
      this.addLog(`Used pins: ${result.usedPins.join(', ')}`);

      // Load the compiled program into the emulator
      this.emulator.loadProgram(result.program);

      // Start the emulator
      this.emulator.start();
      
      this.state.isRunning = true;
      this.addLog('Simulation started');
      
      return true;

    } catch (error) {
      this.addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
      
    } finally {
      this.state.isCompiling = false;
      this.notifyStateUpdate();
    }
  }

  /**
   * Stop the simulation
   */
  public stop(): void {
    if (this.state.isRunning) {
      this.emulator.stop();
      this.state.isRunning = false;
      this.addLog('Simulation stopped');
      this.notifyStateUpdate();
    }
  }

  /**
   * Handle pin state changes from the emulator
   */
  private handlePinChange(pin: number, isHigh: boolean): void {
    // Update our pin state tracking
    this.state.pinStates[pin] = isHigh;

    // Find all components connected to this pin
    const connectedComponents = this.state.components.filter(
      c => c.arduinoPin === pin
    );

    // Notify each connected component
    connectedComponents.forEach(component => {
      if (component.onPinChange) {
        try {
          component.onPinChange(isHigh);
        } catch (error) {
          this.addLog(`Error updating component ${component.componentId}: ${error}`);
        }
      }
    });

    this.notifyStateUpdate();
  }

  /**
   * Add a log message
   */
  private addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    this.state.logs.push(logEntry);
    
    // Keep only the last 100 log entries
    if (this.state.logs.length > 100) {
      this.state.logs.shift();
    }
    
    console.log(`[SimulatorEngine] ${message}`);
  }

  /**
   * Get current simulation state
   */
  public getState(): SimulationState {
    return { ...this.state };
  }

  /**
   * Get the current state of a specific pin
   */
  public getPinState(pin: number): boolean {
    return this.state.pinStates[pin] || false;
  }

  /**
   * Check if the simulator is currently running
   */
  public isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Notify subscribers of state changes
   */
  private notifyStateUpdate(): void {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.getState());
    }
  }
}