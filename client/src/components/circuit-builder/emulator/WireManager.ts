/**
 * WireManager.ts
 * 
 * This class manages wire connections between components and handles
 * signal propagation through the circuit. It's a critical part of the
 * emulation system that ensures components are properly connected and
 * signals flow correctly based on the circuit design.
 * 
 * Wire connections must be accurate to physical electronics so that
 * the behavior matches real hardware, not just visual simulation.
 */

import { EmulatedComponent, HeroEmulator } from './HeroEmulator';

// Define the structure of a wire
export interface Wire {
  id: string;
  sourceComponentId: string;
  targetComponentId: string;
  sourcePin: string;
  targetPin: string;
  // Visual properties
  path: { x: number, y: number }[];
  color: string;
  // Electrical properties
  resistance?: number; // Wire resistance in ohms
  current?: number; // Current flow through the wire
  voltage?: number; // Voltage across the wire
}

// Wire node for tracking the electrical network
interface WireNode {
  componentId: string;
  pin: string;
  connectedTo: WireNode[];
  voltage?: number;
}

export interface SignalPropagationOptions {
  // Propagation speed factor (1.0 = normal)
  speed?: number;
  // Whether to apply resistance effects
  applyResistance?: boolean;
  // Whether to detect shorts
  detectShorts?: boolean;
  // Callback for when a short is detected
  onShortCircuit?: (wireId: string, sourcePinId: string, targetPinId: string) => void;
}

export class WireManager {
  private wires: Map<string, Wire> = new Map();
  private emulator: HeroEmulator | null = null;
  private wireNodes: Map<string, WireNode> = new Map();
  private pinVoltages: Map<string, number> = new Map();
  private propagationOptions: SignalPropagationOptions = {
    speed: 1.0,
    applyResistance: true,
    detectShorts: true
  };

  constructor(options?: SignalPropagationOptions) {
    if (options) {
      this.propagationOptions = { ...this.propagationOptions, ...options };
    }
  }

  /**
   * Set the emulator instance for this wire manager
   */
  setEmulator(emulator: HeroEmulator): void {
    this.emulator = emulator;
    console.log('WireManager connected to emulator');
  }

  /**
   * Add a wire to the circuit
   * @returns the created wire object
   */
  addWire(
    sourceComponentId: string, 
    sourcePinId: string, 
    targetComponentId: string, 
    targetPinId: string, 
    path: { x: number, y: number }[] = []
  ): Wire {
    // Create a unique ID for the wire
    const wireId = `wire-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Set default path if none provided
    if (path.length === 0) {
      // Create a straight line between components
      path = [
        { x: 0, y: 0 }, // Will be filled in later with actual coordinates
        { x: 0, y: 0 }
      ];
    }
    
    // Create the wire object
    const wire: Wire = {
      id: wireId,
      sourceComponentId,
      targetComponentId,
      sourcePin: sourcePinId,
      targetPin: targetPinId,
      path,
      color: '#ffff00', // Default to yellow
      resistance: 0.1, // Default resistance (ohms)
    };
    
    // Add to our map of wires
    this.wires.set(wireId, wire);
    
    // Update the electrical network
    this.updateElectricalNetwork();
    
    console.log(`Wire added: ${sourceComponentId}.${sourcePinId} -> ${targetComponentId}.${targetPinId}`);
    
    return wire;
  }

  /**
   * Remove a wire from the circuit
   */
  removeWire(wireId: string): boolean {
    if (this.wires.has(wireId)) {
      this.wires.delete(wireId);
      
      // Update the electrical network
      this.updateElectricalNetwork();
      
      console.log(`Wire removed: ${wireId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all wires in the circuit
   */
  getAllWires(): Wire[] {
    return Array.from(this.wires.values());
  }

  /**
   * Get wires connected to a specific component
   */
  getWiresForComponent(componentId: string): Wire[] {
    return this.getAllWires().filter(wire => 
      wire.sourceComponentId === componentId || wire.targetComponentId === componentId
    );
  }

  /**
   * Get wires connected to a specific pin
   */
  getWiresForPin(componentId: string, pinId: string): Wire[] {
    return this.getAllWires().filter(wire => 
      (wire.sourceComponentId === componentId && wire.sourcePin === pinId) || 
      (wire.targetComponentId === componentId && wire.targetPin === pinId)
    );
  }

  /**
   * Update the wire's path points
   */
  updateWirePath(wireId: string, path: { x: number, y: number }[]): boolean {
    const wire = this.wires.get(wireId);
    if (wire) {
      wire.path = path;
      return true;
    }
    return false;
  }

  /**
   * Set the wire's color
   */
  setWireColor(wireId: string, color: string): boolean {
    const wire = this.wires.get(wireId);
    if (wire) {
      wire.color = color;
      return true;
    }
    return false;
  }

  /**
   * Rebuild the electrical network based on current wire connections
   */
  private updateElectricalNetwork(): void {
    // Clear existing network
    this.wireNodes.clear();
    
    // Iterate through all wires and build the network
    this.wires.forEach(wire => {
      // Get or create nodes for each end of the wire
      const sourceNodeKey = `${wire.sourceComponentId}.${wire.sourcePin}`;
      const targetNodeKey = `${wire.targetComponentId}.${wire.targetPin}`;
      
      let sourceNode = this.wireNodes.get(sourceNodeKey);
      let targetNode = this.wireNodes.get(targetNodeKey);
      
      // Create nodes if they don't exist
      if (!sourceNode) {
        sourceNode = {
          componentId: wire.sourceComponentId,
          pin: wire.sourcePin,
          connectedTo: []
        };
        this.wireNodes.set(sourceNodeKey, sourceNode);
      }
      
      if (!targetNode) {
        targetNode = {
          componentId: wire.targetComponentId,
          pin: wire.targetPin,
          connectedTo: []
        };
        this.wireNodes.set(targetNodeKey, targetNode);
      }
      
      // Connect the nodes bidirectionally
      sourceNode.connectedTo.push(targetNode);
      targetNode.connectedTo.push(sourceNode);
    });
    
    console.log(`Electrical network updated with ${this.wireNodes.size} nodes`);
  }

  /**
   * Propagate a signal through the network when a pin changes state
   */
  propagateSignal(
    sourceComponentId: string, 
    sourcePinId: string, 
    voltage: number, 
    visited: Set<string> = new Set()
  ): void {
    if (!this.emulator) {
      console.warn('Cannot propagate signal: no emulator connected');
      return;
    }
    
    const nodeKey = `${sourceComponentId}.${sourcePinId}`;
    
    // Prevent infinite loops by tracking visited nodes
    if (visited.has(nodeKey)) {
      return;
    }
    visited.add(nodeKey);
    
    // Store the voltage for this pin
    this.pinVoltages.set(nodeKey, voltage);
    
    // Get the source node
    const node = this.wireNodes.get(nodeKey);
    if (!node) {
      return; // No connections for this pin
    }
    
    // Propagate to connected nodes
    node.connectedTo.forEach(connectedNode => {
      const connectedKey = `${connectedNode.componentId}.${connectedNode.pin}`;
      
      // Skip if we've already visited this node
      if (visited.has(connectedKey)) {
        return;
      }
      
      // Find the wire connecting these nodes
      const connectingWire = this.findWireBetweenNodes(nodeKey, connectedKey);
      if (!connectingWire) {
        return;
      }
      
      // Calculate voltage drop if resistance is applied
      let propagatedVoltage = voltage;
      if (this.propagationOptions.applyResistance && connectingWire.resistance && connectingWire.resistance > 0) {
        // Simple voltage drop calculation (very basic)
        propagatedVoltage = voltage * (1 - Math.min(connectingWire.resistance / 1000, 0.5));
      }
      
      // Check for short circuits
      if (this.propagationOptions.detectShorts) {
        const targetVoltage = this.pinVoltages.get(connectedKey);
        if (targetVoltage !== undefined && Math.abs(voltage - targetVoltage) > 4.5) {
          // Potential short circuit detected (voltage difference is too high)
          this.handleShortCircuit(connectingWire);
        }
      }
      
      // Update the voltage for this pin
      connectedNode.voltage = propagatedVoltage;
      
      // Notify the emulator about the new voltage/state for this pin
      const isHigh = propagatedVoltage > 2.5; // Above 2.5V is considered HIGH
      
      // Notify the emulator
      this.emulator?.setDigitalInput(connectedNode.pin, isHigh);
      
      // Continue propagation
      this.propagateSignal(connectedNode.componentId, connectedNode.pin, propagatedVoltage, visited);
    });
  }

  /**
   * Find a wire connecting two nodes
   */
  private findWireBetweenNodes(node1Key: string, node2Key: string): Wire | undefined {
    const [comp1Id, pin1Id] = node1Key.split('.');
    const [comp2Id, pin2Id] = node2Key.split('.');
    
    return this.getAllWires().find(wire => 
      (wire.sourceComponentId === comp1Id && wire.sourcePin === pin1Id &&
       wire.targetComponentId === comp2Id && wire.targetPin === pin2Id) ||
      (wire.sourceComponentId === comp2Id && wire.sourcePin === pin2Id &&
       wire.targetComponentId === comp1Id && wire.targetPin === pin1Id)
    );
  }

  /**
   * Handle a short circuit
   */
  private handleShortCircuit(wire: Wire): void {
    console.error(`Short circuit detected in wire: ${wire.id}`);
    
    // Change the wire color to indicate a short
    wire.color = '#ff0000';
    
    // Call the short circuit callback if defined
    if (this.propagationOptions.onShortCircuit) {
      this.propagationOptions.onShortCircuit(
        wire.id, 
        `${wire.sourceComponentId}.${wire.sourcePin}`, 
        `${wire.targetComponentId}.${wire.targetPin}`
      );
    }
  }

  /**
   * Clear all wires
   */
  clearAllWires(): void {
    this.wires.clear();
    this.wireNodes.clear();
    this.pinVoltages.clear();
    console.log('All wires cleared');
  }
}