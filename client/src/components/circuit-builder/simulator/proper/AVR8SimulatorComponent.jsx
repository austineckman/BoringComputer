import React, { useState, useEffect, useCallback } from 'react';
import AVR8SimulatorConnector from './AVR8SimulatorConnector';
import { useSimulator } from '../SimulatorContext';

/**
 * AVR8SimulatorComponent
 * 
 * Main component that integrates the AVR8 emulator with the UI.
 * It mediates between the low-level emulator and the higher-level
 * component visualization.
 */
const AVR8SimulatorComponent = ({
  code,
  isRunning,
  onPinChange,
  onLog
}) => {
  // Simulator state
  const [serialOutput, setSerialOutput] = useState('');
  const [compilationStatus, setCompilationStatus] = useState({
    status: 'idle',
    message: 'Ready'
  });
  
  // Access the simulator context to update component states
  const { componentStates, updateComponentState, updateComponentPins } = useSimulator();
  
  // Handle pin state changes from the emulator
  const handlePinChange = useCallback((pin, isHigh) => {
    // Call the parent callback if provided
    if (onPinChange) {
      onPinChange(pin, isHigh);
    }
    
    // Update connected components
    updateConnectedComponents(pin, isHigh);
  }, [onPinChange, componentStates]);
  
  // Handle serial data from the emulator
  const handleSerialData = useCallback((value, char) => {
    setSerialOutput(prev => {
      let newOutput = prev + char;
      
      // If we have a newline, log it and reset
      if (char === '\n') {
        const line = newOutput.trim();
        if (line && onLog) {
          onLog(`Serial: ${line}`);
        }
        return '';
      }
      
      return newOutput;
    });
  }, [onLog]);
  
  // Log messages from the emulator
  const handleLog = useCallback((message) => {
    if (onLog) {
      onLog(message);
    }
  }, [onLog]);
  
  // Update components connected to a pin
  const updateConnectedComponents = useCallback((pin, isHigh, options = {}) => {
    // Get the analog value if provided (for PWM pins)
    const analogValue = options?.analogValue !== undefined ? options.analogValue : (isHigh ? 255 : 0);
    
    if (typeof pin === 'string' && pin.startsWith('A')) {
      // Handle analog pins (A0-A5)
      if (onLog) onLog(`Analog pin ${pin} changed: value=${analogValue}`);
      
      // Update Arduino board pins with analog values
      // Find all Arduino/hero board components
      const heroboardIds = Object.keys(componentStates || {}).filter(id => 
        id === 'heroboard' || 
        id.includes('heroboard') || 
        id.includes('arduino')
      );
      
      // Update each board with analog pin state
      if (heroboardIds.length > 0) {
        heroboardIds.forEach(boardId => {
          // Create pin update object with analog value
          const pinUpdate = {};
          pinUpdate[pin] = { isHigh, analogValue };
          
          // Update the component's pins
          updateComponentPins(boardId, pinUpdate);
        });
      }
      
      return;
    }
    
    // Convert pin to number (if it's not already)
    const pinNumber = typeof pin === 'number' ? pin : parseInt(pin, 10);
    
    // Skip if pin is not valid
    if (isNaN(pinNumber)) return;
    
    // Update Arduino board pins - this is the ONLY place where we update pin states
    // Find all Arduino/hero board components
    const heroboardIds = Object.keys(componentStates || {}).filter(id => 
      id === 'heroboard' || 
      id.includes('heroboard') || 
      id.includes('arduino')
    );
    
    // Update each board
    if (heroboardIds.length > 0) {
      heroboardIds.forEach(boardId => {
        // Create pin update object
        const pinUpdate = {};
        pinUpdate[pinNumber] = isHigh;
        
        // If we have an analog value, include it
        if (options?.analogValue !== undefined) {
          pinUpdate[pinNumber] = { isHigh, analogValue };
        }
        
        // Update the component's pins
        updateComponentPins(boardId, pinUpdate);
        if (onLog) {
          const logMsg = options?.analogValue !== undefined
            ? `Pin ${pinNumber} changed to ${isHigh ? 'HIGH' : 'LOW'} (analog: ${analogValue})`
            : `Pin ${pinNumber} changed to ${isHigh ? 'HIGH' : 'LOW'}`;
          onLog(logMsg);
        }
      });
    } else {
      // Fallback to update a generic heroboard
      const pinUpdate = {};
      
      // If we have an analog value, include it
      if (options?.analogValue !== undefined) {
        pinUpdate[pinNumber] = { isHigh, analogValue };
      } else {
        pinUpdate[pinNumber] = isHigh;
      }
      
      updateComponentPins('heroboard', pinUpdate);
      
      if (onLog) {
        const logMsg = options?.analogValue !== undefined
          ? `Pin ${pinNumber} changed to ${isHigh ? 'HIGH' : 'LOW'} (analog: ${analogValue})`
          : `Pin ${pinNumber} changed to ${isHigh ? 'HIGH' : 'LOW'}`;
        onLog(logMsg);
      }
    }
    
    // DO NOT handle special component updates directly here.
    // All components should listen to pin signal changes and update themselves.
    // This ensures proper emulation where components only respond to signals,
    // not to hardcoded behavior or code keyword detection.
    
    // Note: If components need to be associated with specific pins, this should
    // be done through proper pin connection configuration, not through hardcoded
    // pin assignments or ID pattern matching.
    
  }, [componentStates, updateComponentPins, onLog]);
  
  // Render the connector component
  return (
    <AVR8SimulatorConnector
      code={code}
      isRunning={isRunning}
      onPinChange={handlePinChange}
      onSerialData={handleSerialData}
      onLog={handleLog}
      setCompilationStatus={setCompilationStatus}
    />
  );
};

export default AVR8SimulatorComponent;