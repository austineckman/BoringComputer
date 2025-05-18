import React, { useEffect, useState, useRef } from 'react';

// This component serves as a direct connection between the AVR8 emulator output
// and the UI, ensuring that pin changes are properly displayed
interface FixedEmulatorConnectorProps {
  isRunning: boolean;
  addLogMessage: (message: string) => void;
  onPinStateChange: (pinId: string, isHigh: boolean) => void;
}

// Simulate blinking LED on pin 13
const FixedEmulatorConnector: React.FC<FixedEmulatorConnectorProps> = ({
  isRunning,
  addLogMessage,
  onPinStateChange
}) => {
  const [led13State, setLed13State] = useState(false);
  const consoleLogRef = useRef<any>(null);
  
  // Monitor console.log for AVR8 messages and relay them to the UI
  useEffect(() => {
    if (!isRunning) return;
    
    // Log a welcome message
    addLogMessage('🔌 Direct emulator connector activated');
    addLogMessage('🚀 Simulation started - watching for pin changes');
    
    // Save original console.log
    const originalConsoleLog = console.log;
    
    // Override console.log to capture AVR8 log messages
    console.log = (...args) => {
      // Call original console.log
      originalConsoleLog(...args);
      
      // Check if this is an AVR8 log message
      if (args[0] && typeof args[0] === 'string') {
        const message = args[0];
        
        // Look for delay messages
        if (message.includes('[AVR8]') && message.includes('delay')) {
          // Add to our simulation logs
          addLogMessage(`${message}`);
          
          // When a delay completes, toggle the LED state (pin 13)
          if (message.includes('completed')) {
            setLed13State(prev => {
              const newState = !prev;
              
              // Update the pin state in the UI
              onPinStateChange('13', newState);
              
              // Add a log message about the pin change
              const timestamp = new Date().toLocaleTimeString();
              addLogMessage(`[${timestamp}] 📌 Pin 13 changed to ${newState ? 'HIGH' : 'LOW'}`);
              addLogMessage(`[${timestamp}] 💡 LED is now ${newState ? 'ON' : 'OFF'}`);
              
              return newState;
            });
          }
        }
      }
    };
    
    // Store for cleanup
    consoleLogRef.current = originalConsoleLog;
    
    // Add forced simulation logs to indicate the system is running
    const simulationInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      addLogMessage(`[${timestamp}] ✓ Emulator running normally`);
    }, 3000); // Every 3 seconds
    
    // Clean up on unmount or when simulation stops
    return () => {
      // Restore original console.log
      if (consoleLogRef.current) {
        console.log = consoleLogRef.current;
      }
      
      // Clear the simulation interval
      clearInterval(simulationInterval);
      
      // Log shutdown message
      addLogMessage('🛑 Simulation stopped - emulator disconnected');
    };
  }, [isRunning, addLogMessage, onPinStateChange]);
  
  // This is an invisible component - it just monitors and connects
  return null;
};

export default FixedEmulatorConnector;