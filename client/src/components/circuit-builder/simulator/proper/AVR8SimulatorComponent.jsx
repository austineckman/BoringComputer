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
    // Log the pin change
    console.log(`[AVR8] Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
    
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
  const updateConnectedComponents = useCallback((pin, isHigh) => {
    if (typeof pin === 'string' && pin.startsWith('A')) {
      // Handle analog pins (A0-A5)
      console.log(`[AVR8] Analog pin ${pin} state changed: ${isHigh}`);
      return;
    }
    
    // Convert pin to number (if it's not already)
    const pinNumber = typeof pin === 'number' ? pin : parseInt(pin, 10);
    
    // Skip if pin is not valid
    if (isNaN(pinNumber)) return;
    
    // Update Arduino board pins
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
        
        // Update the component's pins
        updateComponentPins(boardId, pinUpdate);
        console.log(`[AVR8] Updated ${boardId} pin ${pinNumber} to ${isHigh ? 'HIGH' : 'LOW'}`);
      });
    } else {
      // Fallback to update a generic heroboard
      const pinUpdate = {};
      pinUpdate[pinNumber] = isHigh;
      updateComponentPins('heroboard', pinUpdate);
      console.log(`[AVR8] Fallback: Updated generic heroboard pin ${pinNumber} to ${isHigh ? 'HIGH' : 'LOW'}`);
    }
    
    // Handle special component updates
    
    // Pin 13 is the built-in LED
    if (pinNumber === 13) {
      console.log(`[AVR8] Built-in LED (pin 13) changed to ${isHigh ? 'ON' : 'OFF'}`);
      
      // Force updates to all LED components connected to pin 13
      const ledIds = Object.keys(componentStates || {}).filter(id => {
        const component = componentStates[id];
        return component && (
          component.type === 'led' || 
          id.includes('led') || 
          id.includes('LED')
        );
      });
      
      ledIds.forEach(ledId => {
        if (componentStates[ledId]?.connectedPin === 13) {
          updateComponentState(ledId, { isLit: isHigh });
          console.log(`[AVR8] Updated LED ${ledId} connected to pin 13 to ${isHigh ? 'ON' : 'OFF'}`);
        }
      });
    }
    
    // Handle RGB LEDs (pins 9-11 typically)
    if ([9, 10, 11].includes(pinNumber)) {
      const rgbLedIds = Object.keys(componentStates || {}).filter(id => {
        const component = componentStates[id];
        return component && (
          component.type === 'rgbled' || 
          component.type === 'rgb-led' || 
          id.includes('rgb') || 
          id.includes('RGB')
        );
      });
      
      // Standard pin mapping for RGB LEDs
      const pinToColorMap = {
        9: 'red',
        10: 'green',
        11: 'blue'
      };
      
      const color = pinToColorMap[pinNumber];
      
      // Only update if this is a color pin and we have RGB LEDs
      if (color && rgbLedIds.length > 0) {
        // Set analog value (0-255) based on digital state for now
        // In a full implementation, we'd get this from the PWM
        const value = isHigh ? 255 : 0;
        
        // Update each RGB LED component
        rgbLedIds.forEach(ledId => {
          // Use global update function if available (legacy support)
          if (typeof window !== 'undefined' && window.updateRGBLED && window.updateRGBLED[ledId]) {
            window.updateRGBLED[ledId](color, value);
            console.log(`[AVR8] Updated RGB LED ${ledId} ${color} channel to ${value}`);
          } else {
            // Use our context update mechanism
            // Create RGB state object with just this color updated
            const rgbState = { 
              [color]: value 
            };
            
            updateComponentState(ledId, rgbState);
            console.log(`[AVR8] Updated RGB LED ${ledId} state for ${color}: ${value}`);
          }
        });
      }
    }
    
    // TODO: Handle other component types (OLED, 7-segment, etc.)
  }, [componentStates, updateComponentState, updateComponentPins]);
  
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