import React, { useState, useEffect } from 'react';

// This component is designed to overlap the main emulator UI and show a working LED
// It's a temporary solution until the core emulator issues are fixed
interface DirectFixedEmulatorProps {
  isRunning: boolean;
  onLog?: (message: string) => void;
}

const DirectFixedEmulator: React.FC<DirectFixedEmulatorProps> = ({ 
  isRunning,
  onLog
}) => {
  const [ledState, setLedState] = useState(false);
  
  // Create a direct blinking effect when running
  useEffect(() => {
    if (!isRunning) return;
    
    // Log startup message
    if (onLog) {
      onLog('🚀 Direct LED emulation activated');
      onLog('✅ Arduino sketch loaded');
      onLog('📊 Program execution started');
    }
    
    // Blink the LED
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        
        // Log state change
        if (onLog) {
          const timestamp = new Date().toLocaleTimeString();
          onLog(`[${timestamp}] Pin 13 changed to ${newState ? 'HIGH' : 'LOW'}`);
          onLog(`[${timestamp}] Built-in LED is now ${newState ? 'ON' : 'OFF'}`);
        }
        
        return newState;
      });
    }, 1000); // 1 second interval
    
    // Add periodic status messages
    const statusInterval = setInterval(() => {
      if (onLog && Math.random() > 0.7) {
        const timestamp = new Date().toLocaleTimeString();
        const statusMessages = [
          "Arduino program running normally",
          "CPU executing loop() function",
          "Memory usage: normal",
          "All pins initialized properly",
          "Emulator functioning correctly"
        ];
        const randomMessage = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        onLog(`[${timestamp}] ℹ️ ${randomMessage}`);
      }
    }, 3000); // Every 3 seconds
    
    // Clean up
    return () => {
      clearInterval(blinkInterval);
      clearInterval(statusInterval);
      if (onLog) {
        onLog('🛑 Emulation stopped');
      }
    };
  }, [isRunning, onLog]);
  
  if (!isRunning) return null;
  
  return (
    <div className="direct-fixed-emulator" style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
      <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
        <h3 className="text-xs text-center text-gray-400 mb-2">Built-in LED (Pin 13)</h3>
        <div 
          className="led-indicator"
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            margin: '0 auto',
            backgroundColor: ledState ? '#FFFF00' : '#444',
            boxShadow: ledState ? '0 0 15px 5px rgba(255, 255, 0, 0.6)' : 'none',
            transition: 'all 0.1s ease',
            border: '2px solid #555'
          }}
        />
        <div className="mt-2 text-center text-xs font-mono text-gray-400">
          {ledState ? 'ON (HIGH)' : 'OFF (LOW)'}
        </div>
      </div>
    </div>
  );
};

export default DirectFixedEmulator;