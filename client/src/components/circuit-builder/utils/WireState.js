/**
 * Minimal wire state management
 * 
 * This file provides a simple global state for wire management
 * using a standard JavaScript module pattern
 */

// Wire State
const WireState = {
  // Current state
  state: {
    pendingWireStart: null,
    wires: [],
    isWiring: false,
    lastUpdate: Date.now()
  },
  
  // List of callbacks for state updates
  subscribers: [],
  
  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  },
  
  // Notify subscribers
  notifyAll() {
    this.state.lastUpdate = Date.now();
    this.subscribers.forEach(callback => callback(this.state));
  },
  
  // Start a wire from a pin
  startWire(pin) {
    console.log("WIRE STATE: Starting wire from pin", pin);
    this.state.pendingWireStart = pin;
    this.state.isWiring = true;
    this.notifyAll();
  },
  
  // Complete a wire to another pin
  completeWire(targetPin) {
    if (!this.state.pendingWireStart) return;
    
    console.log("WIRE STATE: Completing wire to pin", targetPin);
    
    const newWire = {
      id: `wire-${Date.now()}`,
      sourceId: this.state.pendingWireStart.id,
      targetId: targetPin.id,
      sourcePosition: this.state.pendingWireStart.position,
      targetPosition: targetPin.position,
      sourceType: this.state.pendingWireStart.type,
      targetType: targetPin.type
    };
    
    this.state.wires.push(newWire);
    this.state.pendingWireStart = null;
    this.state.isWiring = false;
    
    this.notifyAll();
    return newWire;
  },
  
  // Cancel the current wire
  cancelWire() {
    console.log("WIRE STATE: Canceling wire");
    this.state.pendingWireStart = null;
    this.state.isWiring = false;
    this.notifyAll();
  },
  
  // Delete a wire
  deleteWire(wireId) {
    console.log("WIRE STATE: Deleting wire", wireId);
    this.state.wires = this.state.wires.filter(wire => wire.id !== wireId);
    this.notifyAll();
  },
  
  // Get current state
  getState() {
    return { ...this.state };
  },
  
  // Update mouse position (doesn't trigger full update)
  updateMousePosition(position) {
    this.state.mousePosition = position;
    // We don't notify on every mouse move to reduce renders
  },
  
  // Get mouse position
  getMousePosition() {
    return this.state.mousePosition;
  }
};

// Export as singleton
export default WireState;