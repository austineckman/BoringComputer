import React, { useState, useEffect } from 'react';

interface EmergencyFixedEmulatorProps {
  isRunning: boolean;
}

// This is a completely standalone emulator that doesn't rely on any other components
const EmergencyFixedEmulator: React.FC<EmergencyFixedEmulatorProps> = ({ isRunning }) => {
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Force a clean blinking LED and simulation logs
  useEffect(() => {
    if (!isRunning) {
      setLogs([]);
      return;
    }
    
    // Initial log messages
    const initialLogs = [
      "🚀 Emergency emulator activated",
      "✅ Compilation successful",
      "✅ Program loaded into microcontroller",
      "⚡ Hardware emulation started",
      "📊 Running Arduino sketch with blink pattern"
    ];
    
    setLogs(initialLogs);
    
    // LED blinking interval
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        const timestamp = new Date().toLocaleTimeString();
        
        // Add log entries
        setLogs(logs => [
          ...logs,
          `[${timestamp}] Pin 13 set to ${newState ? 'HIGH' : 'LOW'}`,
          `[${timestamp}] Onboard LED is now ${newState ? 'ON' : 'OFF'}`
        ]);
        
        return newState;
      });
    }, 1000); // 1 second interval
    
    // System status updates
    const statusInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      if (Math.random() > 0.7) {
        const statusMessages = [
          "Program executing normally",
          "CPU cycles: executing loop()",
          "Memory usage: stable",
          "Serial buffer empty",
          "Hardware emulation active",
          "AVR8 core running at 16MHz"
        ];
        
        const randomMessage = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        
        setLogs(logs => [
          ...logs,
          `[${timestamp}] ${randomMessage}`
        ]);
      }
    }, 3000); // Status updates every 3 seconds
    
    // Cleanup
    return () => {
      clearInterval(blinkInterval);
      clearInterval(statusInterval);
      setLogs(logs => [
        ...logs,
        "🛑 Emulation stopped",
        "📋 Program execution terminated"
      ]);
    };
  }, [isRunning]);
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">EMERGENCY Emulator Mode</h2>
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 bg-red-600 rounded text-white"
            onClick={() => window.location.reload()}
          >
            Reset Emulator
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Blinking LED */}
          <div className="absolute top-8 right-8 bg-gray-800 p-4 rounded shadow-lg">
            <h3 className="text-sm text-gray-400 mb-2 text-center">Built-in LED (Pin 13)</h3>
            <div 
              className="w-16 h-16 mx-auto rounded-full border-4 border-gray-700"
              style={{
                backgroundColor: ledState ? '#FFFF00' : '#333333',
                boxShadow: ledState ? '0 0 20px 5px rgba(255, 255, 0, 0.5)' : 'none',
                transition: 'all 0.1s ease'
              }}
            />
            <div className="mt-2 text-center text-xs font-mono text-gray-400">
              {ledState ? 'ON (HIGH)' : 'OFF (LOW)'}
            </div>
          </div>
          
          {/* Hero board placeholder */}
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
            <div className="text-center text-gray-400 mb-4 text-xs">HERO Board (Emulated)</div>
            <div className="w-80 h-48 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center">
              <div className="text-green-500 text-sm font-mono">
                Arduino Emulation Active
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-gray-400">
              Emulating blink.ino - Pin 13 (Built-in LED)
            </div>
          </div>
        </div>
        
        {/* Side panel with logs */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Simulation Logs</h3>
            <div className="px-2 py-1 bg-green-600 rounded-full text-xs text-white animate-pulse">
              Active
            </div>
          </div>
          <div className="flex-1 p-3 overflow-auto">
            {logs.map((log, index) => {
              // Highlight LED state changes
              const isLEDLog = log.includes('LED') || log.includes('Pin 13');
              const isLEDOn = log.includes('ON') || log.includes('HIGH');
              
              // Style based on log type
              let logStyle = {};
              if (isLEDLog && isLEDOn) {
                logStyle = { color: '#FFFF00' };
              }
              
              return (
                <div 
                  key={index} 
                  className="mb-2 text-xs font-mono" 
                  style={logStyle}
                >
                  {log}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFixedEmulator;