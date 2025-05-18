import React, { useState, useEffect, useCallback } from 'react';

interface SimpleEmulatorProps {
  onClose: () => void;
}

/**
 * A minimalist Arduino emulator that focuses purely on the visual
 * representation of the running code. This component doesn't try
 * to accurately emulate hardware but provides visual feedback
 * that matches what would happen on a real Arduino.
 */
const SimpleEmulator: React.FC<SimpleEmulatorProps> = ({ onClose }) => {
  // Basic state
  const [running, setRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Default Arduino code (blink sketch)
  const [code] = useState(`void setup() {
  // Set pin 13 (built-in LED) as output
  pinMode(13, OUTPUT);
}

void loop() {
  // Turn LED on
  digitalWrite(13, HIGH);
  delay(1000);
  
  // Turn LED off
  digitalWrite(13, LOW);
  delay(1000);
}`);

  // Add a log message
  const addLog = useCallback((message: string) => {
    setLogs(prev => {
      const newLogs = [...prev, message];
      // Keep maximum 50 logs
      if (newLogs.length > 50) {
        return newLogs.slice(-50);
      }
      return newLogs;
    });
  }, []);
  
  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  // Start or stop the simulation
  const toggleSimulation = useCallback(() => {
    setRunning(prev => !prev);
  }, []);
  
  // Initialize logs with some basic information
  useEffect(() => {
    addLog('⚙️ Simple Arduino Emulator initialized');
    addLog('📝 Blink sketch loaded');
    addLog('⏺️ Press Run to start simulation');
    
    // Cleanup on unmount
    return () => {
      // Nothing to clean up here
    };
  }, [addLog]);
  
  // Handle the LED blinking
  useEffect(() => {
    if (!running) return;
    
    // Add startup log messages
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] 🚀 Starting simulation`);
    addLog(`[${timestamp}] ✅ Code compiled successfully`);
    addLog(`[${timestamp}] 📥 Program uploaded to Arduino`);
    addLog(`[${timestamp}] ⚙️ Running setup() function`);
    addLog(`[${timestamp}] 🔄 Entering main loop`);
    
    // Blink the LED
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        const time = new Date().toLocaleTimeString();
        
        // Log the state change
        addLog(`[${time}] 📌 Pin 13 set to ${newState ? 'HIGH' : 'LOW'}`);
        addLog(`[${time}] 💡 Built-in LED is now ${newState ? 'ON' : 'OFF'}`);
        
        return newState;
      });
    }, 1000); // 1 second interval
    
    // Add occasional system status messages
    const statusInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const time = new Date().toLocaleTimeString();
        const messages = [
          '⏱️ delay() function called',
          '🔁 loop() function executing',
          '📊 Memory usage: 2048 bytes (stable)',
          '⚡ System voltage: 5.0V',
          '🔌 USB connection: stable'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        addLog(`[${time}] ${randomMessage}`);
      }
    }, 2500);
    
    // Cleanup when simulation is stopped
    return () => {
      clearInterval(blinkInterval);
      clearInterval(statusInterval);
      
      if (running) {
        const timestamp = new Date().toLocaleTimeString();
        addLog(`[${timestamp}] 🛑 Simulation stopped`);
      }
    };
  }, [running, addLog]);
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Arduino Emulator</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-1.5 rounded font-medium ${
              running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {running ? 'Stop' : 'Run'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded font-medium"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Arduino visualization */}
        <div className="w-1/2 p-6 flex items-center justify-center relative">
          {/* Arduino board container */}
          <div 
            className="bg-gray-800 rounded-lg border border-gray-700 p-8 w-full max-w-md"
            style={{ maxHeight: '80%' }}
          >
            <h2 className="text-center text-lg font-bold mb-6">Arduino HERO Board</h2>
            
            {/* Board visualization */}
            <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
              {/* Status indicator */}
              <div className="mb-6 flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${running ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{running ? 'Running' : 'Stopped'}</span>
              </div>
              
              {/* LED area */}
              <div className="mb-6 flex flex-col items-center">
                <div 
                  className="w-16 h-16 rounded-full border-4 border-gray-600"
                  style={{
                    backgroundColor: ledState ? '#FFFF00' : '#444',
                    boxShadow: ledState ? '0 0 20px 5px rgba(255, 255, 0, 0.6)' : 'none',
                    transition: 'all 0.1s ease'
                  }}
                />
                <div className="mt-2 text-sm text-center">
                  Built-in LED (Pin 13)<br />
                  <span className={ledState ? 'text-yellow-300' : 'text-gray-400'}>
                    {ledState ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
              
              {/* Status display */}
              <div className="bg-gray-800 p-3 rounded w-full">
                <div className="text-xs mb-1 text-gray-400">Execution:</div>
                <div className="text-sm font-mono">
                  {running ? 'loop() function running...' : 'Ready to start'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right panel - Code and logs */}
        <div className="w-1/2 flex flex-col border-l border-gray-700">
          {/* Code editor */}
          <div className="h-1/2 border-b border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700 bg-gray-800">
              <h2 className="font-bold">Arduino Sketch</h2>
            </div>
            <div className="flex-1 overflow-auto bg-gray-900 p-4">
              <pre className="font-mono text-sm text-green-400">{code}</pre>
            </div>
          </div>
          
          {/* Logs */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
              <h2 className="font-bold">Simulation Logs</h2>
              <button 
                onClick={clearLogs}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 bg-gray-900">
              {logs.length > 0 ? (
                logs.map((log, index) => {
                  // Highlight LED-related logs
                  const isLedLog = log.includes('LED') || log.includes('Pin 13');
                  const isLedOn = log.includes('ON') || log.includes('HIGH');
                  
                  let style = {};
                  if (isLedLog && isLedOn) {
                    style = { color: '#FFFF00' };
                  } else if (isLedLog) {
                    style = { color: '#AAA' };
                  }
                  
                  return (
                    <div key={index} className="text-sm font-mono mb-1" style={style}>
                      {log}
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 italic text-sm">No logs yet. Start simulation to see logs.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEmulator;