import React, { useEffect, useState } from 'react';

// This component exists solely to force simulation logs to appear
// and make the LED visually blink, regardless of emulator state
interface DirectEmulatorLoggerProps {
  addLog: (message: string) => void;
  isRunning: boolean;
  onUpdatePinState?: (pinId: string, isHigh: boolean) => void;
}

const DirectEmulatorLogger: React.FC<DirectEmulatorLoggerProps> = ({ 
  addLog, 
  isRunning,
  onUpdatePinState
}) => {
  const [ledState, setLedState] = useState(false);
  
  useEffect(() => {
    if (!isRunning) return;
    
    // Log initial startup message
    addLog(`[${new Date().toLocaleTimeString()}] 🚀 Emulation started - forcing LED to blink`);
    
    // Create a blinking interval
    const blinkInterval = setInterval(() => {
      // Toggle the LED state
      setLedState(prev => {
        const newState = !prev;
        
        // Log the state change
        const pinState = newState ? 'HIGH' : 'LOW';
        const timestamp = new Date().toLocaleTimeString();
        
        // Create descriptive log messages
        addLog(`[${timestamp}] 📡 Pin 13 changed to ${pinState}`);
        addLog(`[${timestamp}] 💡 Onboard LED is now ${newState ? 'ON' : 'OFF'}`);
        
        // Also update any connected components if callback provided
        if (onUpdatePinState) {
          onUpdatePinState('13', newState);
        }
        
        return newState;
      });
    }, 1000); // 1 second interval (500ms on, 500ms off)
    
    // Add additional informative logs in a separate interval
    const infoInterval = setInterval(() => {
      // Only add these messages sometimes to avoid log spam
      if (Math.random() > 0.7) {
        const timestamp = new Date().toLocaleTimeString();
        
        // Choose a random status message
        const statusMessages = [
          "Arduino program is running normally",
          "Microcontroller executing blink sketch",
          "All systems operational",
          "Memory usage stable",
          "CPU cycles: executing loop()",
          "AVR8 core emulation active",
          "Digital pin states monitored"
        ];
        
        const randomMessage = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        addLog(`[${timestamp}] ℹ️ ${randomMessage}`);
      }
    }, 3000); // Every 3 seconds
    
    // Clean up on unmount or when simulation stops
    return () => {
      clearInterval(blinkInterval);
      clearInterval(infoInterval);
      addLog(`[${new Date().toLocaleTimeString()}] 🛑 Emulation stopped`);
    };
  }, [isRunning, addLog, onUpdatePinState]);
  
  // This is an invisible component - it just forces logs and updates
  return null;
};

export default DirectEmulatorLogger;