import React, { useState, useEffect, useCallback } from 'react';
import AVR8SimulatorComponent from './proper/AVR8SimulatorComponent';
import { useSimulator } from './SimulatorContext';

/**
 * ProperAVR8Simulator Component
 * 
 * A production-grade implementation that uses avr8js to create a cycle-accurate
 * simulation of an Arduino microcontroller running compiled machine code.
 */
const ProperAVR8Simulator = ({ code, isRunning, onPinChange, onLog }) => {
  // Serial output from the simulation
  const [serialOutput, setSerialOutput] = useState('');
  // Used to track pins that are currently HIGH (active)
  const [activePins, setActivePins] = useState({});
  
  // Access simulator context
  const { updateComponentState, updateComponentPins } = useSimulator();
  
  // Log to console and pass to parent - only log errors and pin updates
  const handleLog = useCallback((message) => {
    if (message.toLowerCase().includes('error') || 
        message.toLowerCase().includes('pin ') || 
        message.toLowerCase().includes('fail') ||
        message.toLowerCase().includes('serial:')) {
      console.log(`[AVR8] ${message}`);
      if (onLog) {
        onLog(message);
      }
    }
  }, [onLog]);
  
  // Handle pin change from the simulator
  const handlePinChange = useCallback((pin, isHigh) => {
    // Update active pins state
    setActivePins(prev => ({
      ...prev,
      [pin]: isHigh
    }));
    
    // Call the parent callback if provided
    if (onPinChange) {
      onPinChange(pin, isHigh);
    }
    
    // Log the pin change
    handleLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
  }, [onPinChange, handleLog]);
  
  // Handle serial data from simulator
  const handleSerialData = useCallback((value, char) => {
    setSerialOutput(prev => {
      const newOutput = prev + char;
      
      // If we get a newline, log it
      if (char === '\n') {
        const line = newOutput.trim();
        if (line) {
          handleLog(`Serial: ${line}`);
        }
        return '';
      }
      
      return newOutput;
    });
  }, [handleLog]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Reset state
      setSerialOutput('');
      setActivePins({});
      
      handleLog('AVR8 simulator cleaned up');
    };
  }, [handleLog]);
  
  // Render the proper AVR8 simulator
  return (
    <AVR8SimulatorComponent
      code={code}
      isRunning={isRunning}
      onPinChange={handlePinChange}
      onSerialData={handleSerialData}
      onLog={handleLog}
    />
  );
};

export default ProperAVR8Simulator;