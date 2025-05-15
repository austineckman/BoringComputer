import { HeroEmulator } from './HeroEmulator';

// Define the wire interface
export interface Wire {
  id: string;
  sourceComponentId: string;
  targetComponentId: string;
  sourcePin: string;
  targetPin: string;
  path?: Array<{x: number, y: number}>;
  
  // Electrical properties
  voltage?: number;
  current?: number;
  resistance?: number;
  isShortCircuit?: boolean;
}

interface WireManagerOptions {
  detectShorts?: boolean;
  maxCurrent?: number;
  wireResistance?: number;
  onShortCircuit?: (wireId: string, sourcePinId: string, targetPinId: string) => void;
}

/**
 * WireManager
 * 
 * This class manages the wires in a circuit, maintaining their connections and
 * handling signal propagation between components. It can detect short circuits
 * and calculate voltage drops and current flow.
 */
export class WireManager {
  private wires: Record<string, Wire> = {};
  private nodeConnections: Record<string, Set<string>> = {};
  private pinVoltages: Record<string, number> = {};
  private emulator: HeroEmulator | null = null;
  private propagationInProgress: boolean = false;
  
  // Configuration options
  private options: Required<WireManagerOptions> = {
    detectShorts: true,
    maxCurrent: 0.5, // 500mA max current
    wireResistance: 0.1, // 0.1 ohm per wire
    onShortCircuit: () => {}
  };
  
  constructor(options?: WireManagerOptions) {
    // Apply custom options if provided
    if (options) {
      this.options = { ...this.options, ...options };
    }
  }
  
  /**
   * Link the wire manager to an emulator instance
   */
  public setEmulator(emulator: HeroEmulator): void {
    this.emulator = emulator;
  }
  
  /**
   * Add a wire to the circuit
   */
  public addWire(
    sourceComponentId: string,
    sourcePin: string,
    targetComponentId: string,
    targetPin: string,
    path?: Array<{x: number, y: number}>
  ): Wire {
    // Generate a unique ID for the wire
    const wireId = `wire-${this.generateId()}`;
    
    // Create the wire object
    const wire: Wire = {
      id: wireId,
      sourceComponentId,
      sourcePin,
      targetComponentId,
      targetPin,
      path,
      voltage: 0,
      current: 0,
      resistance: this.options.wireResistance,
      isShortCircuit: false
    };
    
    // Store the wire
    this.wires[wireId] = wire;
    
    // Update the node connections
    const sourceNode = `${sourceComponentId}.${sourcePin}`;
    const targetNode = `${targetComponentId}.${targetPin}`;
    
    if (!this.nodeConnections[sourceNode]) {
      this.nodeConnections[sourceNode] = new Set<string>();
    }
    if (!this.nodeConnections[targetNode]) {
      this.nodeConnections[targetNode] = new Set<string>();
    }
    
    this.nodeConnections[sourceNode].add(targetNode);
    this.nodeConnections[targetNode].add(sourceNode);
    
    // Check for short circuits if enabled
    if (this.options.detectShorts) {
      this.detectShortCircuit(wire);
    }
    
    return wire;
  }
  
  /**
   * Remove a wire from the circuit
   */
  public removeWire(wireId: string): boolean {
    if (!this.wires[wireId]) {
      return false;
    }
    
    const wire = this.wires[wireId];
    
    // Update node connections
    const sourceNode = `${wire.sourceComponentId}.${wire.sourcePin}`;
    const targetNode = `${wire.targetComponentId}.${wire.targetPin}`;
    
    if (this.nodeConnections[sourceNode]) {
      this.nodeConnections[sourceNode].delete(targetNode);
      if (this.nodeConnections[sourceNode].size === 0) {
        delete this.nodeConnections[sourceNode];
      }
    }
    
    if (this.nodeConnections[targetNode]) {
      this.nodeConnections[targetNode].delete(sourceNode);
      if (this.nodeConnections[targetNode].size === 0) {
        delete this.nodeConnections[targetNode];
      }
    }
    
    // Remove the wire
    delete this.wires[wireId];
    
    return true;
  }
  
  /**
   * Clear all wires from the circuit
   */
  public clearAllWires(): void {
    this.wires = {};
    this.nodeConnections = {};
  }
  
  /**
   * Get a wire by ID
   */
  public getWire(wireId: string): Wire | null {
    return this.wires[wireId] || null;
  }
  
  /**
   * Get all wires in the circuit
   */
  public getAllWires(): Wire[] {
    return Object.values(this.wires);
  }
  
  /**
   * Propagate a signal from a component pin through the wire network
   */
  public propagateSignal(componentId: string, pinId: string, voltage: number): void {
    // Prevent recursive propagation
    if (this.propagationInProgress) {
      return;
    }
    
    this.propagationInProgress = true;
    
    try {
      const sourceNode = `${componentId}.${pinId}`;
      this.pinVoltages[sourceNode] = voltage;
      
      // Queue of nodes to propagate to
      const queue: string[] = [sourceNode];
      const visited = new Set<string>();
      
      while (queue.length > 0) {
        const currentNode = queue.shift()!;
        
        if (visited.has(currentNode)) {
          continue;
        }
        
        visited.add(currentNode);
        
        // Get the current voltage at this node
        const currentVoltage = this.pinVoltages[currentNode] || 0;
        
        // Propagate to connected nodes
        const connectedNodes = this.nodeConnections[currentNode] || new Set<string>();
        // Convert Set to Array for iteration to avoid downlevelIteration issues
        Array.from(connectedNodes).forEach(connectedNode => {
          if (!visited.has(connectedNode)) {
            // Set the voltage on the connected node
            this.pinVoltages[connectedNode] = currentVoltage;
            
            // Update the emulator if connected
            if (this.emulator) {
              const [connectedComponentId, connectedPinId] = connectedNode.split('.');
              
              // Don't update if this is a microcontroller pin (let the emulator handle that)
              if (connectedComponentId !== 'heroboard') {
                // For now, just set high/low based on voltage threshold
                const isHigh = currentVoltage > 2.5;
                
                // Update component in emulator (via custom method or property access)
                if (this.emulator) {
                  // If the emulator has a setComponentPinState method, use it
                  if ('setComponentPinState' in this.emulator) {
                    (this.emulator as any).setComponentPinState(
                      connectedComponentId,
                      connectedPinId,
                      isHigh,
                      { voltage: currentVoltage }
                    );
                  } 
                  // Otherwise, use the registered components dictionary if available
                  else if (window.emulatedComponents && window.emulatedComponents[connectedComponentId]) {
                    const component = window.emulatedComponents[connectedComponentId];
                    if (component && component.onPinChange) {
                      component.onPinChange(connectedPinId, isHigh, { voltage: currentVoltage });
                    }
                  }
                }
              }
            }
            
            // Add to queue for further propagation
            queue.push(connectedNode);
          }
        });
      }
      
      // Calculate currents and update wire states
      this.calculateCircuitState();
    } finally {
      this.propagationInProgress = false;
    }
  }
  
  /**
   * Get the voltage at a specific pin
   */
  public getVoltage(componentId: string, pinId: string): number {
    const node = `${componentId}.${pinId}`;
    return this.pinVoltages[node] || 0;
  }
  
  /**
   * Get all pin voltages in the circuit
   */
  public getAllVoltages(): Record<string, number> {
    return { ...this.pinVoltages };
  }
  
  /**
   * Check for short circuits
   */
  private detectShortCircuit(wire: Wire): boolean {
    // For now, a simple implementation that checks if a pin is connected to itself
    // A more complex implementation would use graph theory to find loops with voltage sources
    const sourceComponent = wire.sourceComponentId;
    const targetComponent = wire.targetComponentId;
    const sourcePin = wire.sourcePin;
    const targetPin = wire.targetPin;
    
    // If a pin is shorted to itself
    if (sourceComponent === targetComponent && sourcePin === targetPin) {
      wire.isShortCircuit = true;
      this.options.onShortCircuit(wire.id, sourcePin, targetPin);
      return true;
    }
    
    // If GND pins are connected to each other, that's not a short
    if (sourcePin === 'GND' && targetPin === 'GND') {
      return false;
    }
    
    // Check for other potential short circuit conditions
    // (For now, this is a simplified implementation)
    
    return false;
  }
  
  /**
   * Calculate the electrical state of the circuit
   */
  private calculateCircuitState(): void {
    // Update wire states based on voltages
    for (const wire of Object.values(this.wires)) {
      const sourceNode = `${wire.sourceComponentId}.${wire.sourcePin}`;
      const targetNode = `${wire.targetComponentId}.${wire.targetPin}`;
      
      const sourceVoltage = this.pinVoltages[sourceNode] || 0;
      const targetVoltage = this.pinVoltages[targetNode] || 0;
      
      // Set wire voltage (average of endpoints for display)
      wire.voltage = (sourceVoltage + targetVoltage) / 2;
      
      // Calculate current (simplified Ohm's law)
      const voltageDifference = Math.abs(sourceVoltage - targetVoltage);
      
      if (wire.resistance && wire.resistance > 0) {
        wire.current = voltageDifference / wire.resistance;
      } else {
        wire.current = 0;
      }
      
      // Check if the current exceeds the maximum
      if (wire.current > this.options.maxCurrent) {
        wire.isShortCircuit = true;
        this.options.onShortCircuit(wire.id, wire.sourcePin, wire.targetPin);
      }
    }
  }
  
  /**
   * Generate a random ID string
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}