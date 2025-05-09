import React, { useState, useEffect } from 'react';
import AVR8SimulatorComponent from './AVR8SimulatorComponent';
import { useSimulator } from '../SimulatorContext';

/**
 * AVR8SimulatorConnector
 * 
 * This component bridges the existing circuit builder interface with
 * our proper AVR8 simulator implementation.
 * 
 * It handles the transition from the regex-based simulator to the
 * actual AVR microcontroller emulation.
 */
const AVR8SimulatorConnector = ({
  code,
  isRunning,
  onLog
}) => {
  // Compilation errors
  const [compileErrors, setCompileErrors] = useState([]);
  // Pin change log
  const [pinChanges, setPinChanges] = useState([]);
  
  // Access the simulator context
  const { updateComponentState } = useSimulator();
  
  // Log information to the console
  const logInfo = (message) => {
    console.log(`[AVR8Connector] ${message}`);
    if (onLog) {
      onLog(message);
    }
  };
  
  // Handle pin state changes from the emulator
  const handlePinChange = (pin, isHigh, details = {}) => {
    // Log the pin change
    const timestamp = new Date().toLocaleTimeString();
    const message = `Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`;
    setPinChanges(prev => [...prev, { timestamp, pin, state: isHigh, message }]);
    
    logInfo(message);
    
    // The simulator component itself will handle updating connected components
  };
  
  // Handle compilation errors
  const handleCompileError = (error) => {
    setCompileErrors(prev => [...prev, error]);
    logInfo(`Compilation error: ${error.message}`);
  };
  
  // Connect to the window's simulation context when running
  useEffect(() => {
    if (isRunning) {
      logInfo('Starting proper AVR8 emulation');
      if (window.simulatorContext) {
        window.isSimulationRunning = true;
      }
    } else {
      logInfo('Stopping AVR8 emulation');
      if (window.simulatorContext) {
        window.isSimulationRunning = false;
      }
    }
  }, [isRunning]);
  
  useEffect(() => {
    // Inform the user about the proper simulator
    logInfo('Loaded proper AVR8 simulator - cycle-accurate Arduino emulation');
    
    // Cleanup on unmount
    return () => {
      logInfo('Shutting down proper AVR8 simulator');
    };
  }, []);

  return (
    <div className="avr8-simulator-connector">
      {/* The actual simulator component */}
      <AVR8SimulatorComponent
        code={code}
        isRunning={isRunning}
        onPinChange={handlePinChange}
        onLog={logInfo}
        onCompileError={handleCompileError}
      />
      
      {/* Debug UI - can be shown/hidden as needed */}
      {false && (
        <div className="debug-panel">
          <h3>AVR8 Simulator Debug</h3>
          
          {compileErrors.length > 0 && (
            <div className="compile-errors">
              <h4>Compilation Errors</h4>
              <ul>
                {compileErrors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="pin-changes">
            <h4>Recent Pin Changes</h4>
            <ul>
              {pinChanges.slice(-10).map((change, index) => (
                <li key={index}>
                  {change.timestamp} - {change.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AVR8SimulatorConnector;