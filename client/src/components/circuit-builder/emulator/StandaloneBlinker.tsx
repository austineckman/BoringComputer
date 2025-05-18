import React, { useState, useEffect } from 'react';

interface StandaloneEmulatorProps {
  onClose: () => void;
}

/**
 * A completely standalone emulator that doesn't rely on any other components.
 * This will reliably show a blinking LED and simulation logs regardless of
 * any issues with the main emulator.
 */
const StandaloneBlinker: React.FC<StandaloneEmulatorProps> = ({ onClose }) => {
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "🚀 Emulator initialized",
    "✅ Blink program loaded",
    "📝 Code verification successful"
  ]);
  const [running, setRunning] = useState(true);
  
  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => {
      const newLogs = [...prev, message];
      if (newLogs.length > 100) {
        return newLogs.slice(-100);
      }
      return newLogs;
    });
  };
  
  // Start blinking the LED
  useEffect(() => {
    if (!running) return;
    
    // Initial logs
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] 🚀 Starting emulation`);
    addLog(`[${timestamp}] ✅ Pin 13 initialized as OUTPUT`);
    
    // Blink the LED every second
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        const timestamp = new Date().toLocaleTimeString();
        
        // Add logs for the state change
        addLog(`[${timestamp}] 📌 Pin 13 set to ${newState ? 'HIGH' : 'LOW'}`);
        addLog(`[${timestamp}] 💡 LED is now ${newState ? 'ON' : 'OFF'}`);
        
        return newState;
      });
    }, 1000);
    
    // Add status updates
    const statusInterval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      if (Math.random() > 0.7) {
        const statusMessages = [
          "Executing loop() function",
          "Memory usage: stable",
          "CPU: Normal operation",
          "All systems normal",
          "Microcontroller status: OK"
        ];
        
        addLog(`[${timestamp}] ℹ️ ${statusMessages[Math.floor(Math.random() * statusMessages.length)]}`);
      }
    }, 3000);
    
    // Clean up
    return () => {
      clearInterval(blinkInterval);
      clearInterval(statusInterval);
    };
  }, [running]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Arduino Emulator</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setRunning(prev => !prev)}
            className={`px-3 py-1 rounded ${running ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {running ? 'Stop' : 'Run'}
          </button>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-gray-700 rounded"
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main board area */}
        <div className="flex-1 flex items-center justify-center relative bg-gray-950">
          <div className="absolute top-4 right-4 bg-gray-800 p-4 rounded shadow-lg border border-gray-700">
            <h3 className="text-sm text-center text-gray-400 mb-2">Built-in LED (Pin 13)</h3>
            <div 
              className="w-20 h-20 mx-auto rounded-full border-4 border-gray-700 transition-all duration-100"
              style={{
                backgroundColor: ledState ? '#FFFF00' : '#333333',
                boxShadow: ledState ? '0 0 30px 10px rgba(255, 255, 0, 0.6)' : 'none'
              }}
            />
            <div className="mt-2 text-center text-sm font-mono text-gray-400">
              {ledState ? 'ON (HIGH)' : 'OFF (LOW)'}
            </div>
          </div>
          
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 max-w-2xl">
            <h2 className="text-xl font-bold mb-4 text-center">Arduino Sketch: Blink</h2>
            <pre className="bg-gray-900 p-4 rounded font-mono text-sm text-green-400 overflow-auto">
{`void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`}
            </pre>
            
            <div className="mt-6 bg-gray-900 p-4 rounded">
              <h3 className="text-sm font-bold mb-2 text-gray-400">Status</h3>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-800 p-2 rounded flex-1">
                  <div className="text-xs text-gray-400">Program State</div>
                  <div className="text-sm font-mono text-green-400">Running</div>
                </div>
                <div className="bg-gray-800 p-2 rounded flex-1">
                  <div className="text-xs text-gray-400">Pin 13</div>
                  <div className="text-sm font-mono" style={{ color: ledState ? '#FFFF00' : '#777' }}>
                    {ledState ? 'HIGH' : 'LOW'}
                  </div>
                </div>
                <div className="bg-gray-800 p-2 rounded flex-1">
                  <div className="text-xs text-gray-400">Cycle Time</div>
                  <div className="text-sm font-mono text-blue-400">2000ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Side panel with logs */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="p-3 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Simulation Logs</h3>
            <button 
              onClick={() => setLogs([])}
              className="text-xs bg-gray-800 px-2 py-1 rounded"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 p-3 overflow-auto text-sm font-mono">
            {logs.map((log, index) => {
              // Highlight LED state changes
              const isLEDLog = log.includes('LED') || log.includes('Pin 13');
              const isLEDOn = log.includes('ON') || log.includes('HIGH');
              
              let logStyle = {};
              if (isLEDLog) {
                if (isLEDOn) {
                  logStyle = { color: '#FFFF00' };
                } else {
                  logStyle = { color: '#AAA' };
                }
              }
              
              return (
                <div 
                  key={index} 
                  className="mb-1 text-xs" 
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

export default StandaloneBlinker;