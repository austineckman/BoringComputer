import React, { useEffect, useState } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationVisualizer
 * 
 * Responsible for visualizing the current state of the simulation
 * Shows active pins, voltage levels, and provides visual feedback
 */
const SimulationVisualizer = ({ components, wires }) => {
  const { 
    isSimulationRunning,
    componentStates,
    pinStates,
    addLog
  } = useSimulator();
  
  const [activePins, setActivePins] = useState({});
  const [highlightedWires, setHighlightedWires] = useState({});
  
  // Update visualization based on simulation state
  useEffect(() => {
    if (!isSimulationRunning) {
      // Clear all highlights when simulation is stopped
      setActivePins({});
      setHighlightedWires({});
      return;
    }
    
    // Map active pins
    const newActivePins = {};
    Object.entries(pinStates).forEach(([pinId, isHigh]) => {
      newActivePins[pinId] = isHigh;
    });
    setActivePins(newActivePins);
    
    // Highlight wires that are carrying current
    // A wire is active if its source or target pin is HIGH
    const newHighlightedWires = {};
    wires.forEach(wire => {
      // Parse pin IDs into the format used in pinStates
      const sourcePinParts = wire.sourceId.split('-');
      const targetPinParts = wire.targetId.split('-');
      
      // Simplified: assume pin names after the last dash
      const sourcePinName = sourcePinParts[sourcePinParts.length - 1];
      const targetPinName = targetPinParts[targetPinParts.length - 1];
      
      // Check if source or target pin is active
      const isSourceActive = pinStates[`D${sourcePinName}`] || pinStates[`A${sourcePinName}`];
      const isTargetActive = pinStates[`D${targetPinName}`] || pinStates[`A${targetPinName}`];
      
      // Wire is highlighted if either end is active
      newHighlightedWires[wire.id] = isSourceActive || isTargetActive;
    });
    setHighlightedWires(newHighlightedWires);
    
  }, [isSimulationRunning, pinStates, wires]);
  
  // Generate indicator elements for active pins
  const pinIndicators = Object.entries(activePins).map(([pinId, isHigh]) => {
    // Skip pins that are not on the board
    if (!pinId.startsWith('D') && !pinId.startsWith('A')) return null;
    
    // Find the pin element in the DOM
    const pinName = pinId.substring(1); // Remove the D or A prefix
    const pinElement = document.querySelector(`[id$="-${pinName}"]`);
    
    if (!pinElement) return null;
    
    // Get pin position
    const rect = pinElement.getBoundingClientRect();
    
    // Return indicator component
    return (
      <div
        key={pinId}
        className={`absolute rounded-full border-2 border-white ${isHigh ? 'bg-green-500' : 'bg-red-500'}`}
        style={{
          width: '12px',
          height: '12px',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          zIndex: 100,
          boxShadow: isHigh ? '0 0 8px rgba(0, 255, 0, 0.8)' : 'none'
        }}
        title={`${pinId} ${isHigh ? 'HIGH' : 'LOW'}`}
      />
    );
  }).filter(Boolean);
  
  // Apply visual effects to component elements based on state
  useEffect(() => {
    if (!isSimulationRunning || !componentStates) return;
    
    // Apply visual effects to each component based on its state
    Object.entries(componentStates).forEach(([componentId, state]) => {
      const componentElement = document.getElementById(componentId);
      if (!componentElement) return;
      
      // Extract the component type from the ID
      const componentType = componentId.split('-')[0];
      
      // Apply component-specific visual effects
      switch (componentType) {
        case 'led':
          // LED component
          if (state.isLit) {
            // Add glow effect for lit LED
            componentElement.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.8))';
            componentElement.dataset.state = 'on';
          } else {
            componentElement.style.filter = '';
            componentElement.dataset.state = 'off';
          }
          break;
          
        case 'rgbled':
          // RGB LED component
          const redIntensity = state.redValue || 0;
          const greenIntensity = state.greenValue || 0;
          const blueIntensity = state.blueValue || 0;
          
          if (redIntensity || greenIntensity || blueIntensity) {
            // Calculate color based on RGB values
            const r = Math.round(redIntensity * 255);
            const g = Math.round(greenIntensity * 255);
            const b = Math.round(blueIntensity * 255);
            const rgbColor = `rgb(${r}, ${g}, ${b})`;
            
            componentElement.style.filter = `drop-shadow(0 0 8px ${rgbColor})`;
            componentElement.dataset.state = 'on';
          } else {
            componentElement.style.filter = '';
            componentElement.dataset.state = 'off';
          }
          break;
          
        case 'buzzer':
          // Buzzer component
          if (state.hasSignal) {
            // Add animation for active buzzer
            componentElement.classList.add('buzzer-active');
            componentElement.dataset.state = 'on';
            
            // Play a sound (if implemented)
            // This would be handled by the buzzer component itself
          } else {
            componentElement.classList.remove('buzzer-active');
            componentElement.dataset.state = 'off';
          }
          break;
          
        default:
          // Other components
          break;
      }
    });
    
    // Cleanup function
    return () => {
      // Remove all visual effects when component unmounts
      document.querySelectorAll('[data-state]').forEach(el => {
        el.style.filter = '';
        el.classList.remove('buzzer-active');
        delete el.dataset.state;
      });
    };
  }, [isSimulationRunning, componentStates]);
  
  return (
    <div className="simulation-visualizer">
      {/* Pin state indicators */}
      {isSimulationRunning && pinIndicators}
      
      {/* Simulation status overlay */}
      {isSimulationRunning && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-50 flex items-center">
          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
          Simulation Active
        </div>
      )}
    </div>
  );
};

export default SimulationVisualizer;