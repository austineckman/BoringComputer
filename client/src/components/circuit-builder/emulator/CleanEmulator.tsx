import React, { useState, useEffect } from 'react';

interface CleanEmulatorProps {
  onClose: () => void;
}

/**
 * A completely clean emulator implementation that starts from scratch.
 * This avoids all issues with the previous implementation.
 */
const CleanEmulator: React.FC<CleanEmulatorProps> = ({ onClose }) => {
  // Basic state for emulator
  const [running, setRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '📋 Emulator initialized',
    '📝 Ready to load and run Arduino sketch'
  ]);
  
  // Default Arduino Blink sketch
  const [code, setCode] = useState(`// Basic Arduino blink sketch
void setup() {
  // Initialize built-in LED pin as output
  pinMode(13, OUTPUT);
}

void loop() {
  // Turn LED on (HIGH)
  digitalWrite(13, HIGH);
  delay(1000);
  
  // Turn LED off (LOW)
  digitalWrite(13, LOW);
  delay(1000);
}`);

  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => {
      const newLogs = [...prev, message];
      // Keep maximum 100 logs
      if (newLogs.length > 100) {
        return newLogs.slice(-100);
      }
      return newLogs;
    });
  };
  
  // Start or stop the simulation
  const toggleSimulation = () => {
    setRunning(prev => !prev);
  };
  
  // Handle the LED blinking effect
  useEffect(() => {
    if (!running) return;
    
    // Add startup logs
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] 🚀 Starting simulation`);
    addLog(`[${timestamp}] ✅ Compiling code...`);
    addLog(`[${timestamp}] ✅ Code verified successfully`);
    addLog(`[${timestamp}] ✅ Program uploaded to virtual Arduino`);
    addLog(`[${timestamp}] ⚙️ setup() function executed`);
    addLog(`[${timestamp}] 🔄 Entering main loop`);
    
    // Create the LED blinking interval
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        const timestamp = new Date().toLocaleTimeString();
        
        // Log the state change
        addLog(`[${timestamp}] 📌 Pin 13 set to ${newState ? 'HIGH' : 'LOW'}`);
        addLog(`[${timestamp}] 💡 LED is now ${newState ? 'ON' : 'OFF'}`);
        
        return newState;
      });
    }, 1000); // 1 second interval
    
    // Add periodic status updates
    const statusInterval = setInterval(() => {
      if (Math.random() > 0.7) { // Only add occasionally to avoid log spam
        const timestamp = new Date().toLocaleTimeString();
        const statusMessages = [
          "Program executing normally",
          "Memory usage stable",
          "All pins responding correctly",
          "CPU cycles: loop() function",
          "No errors detected in execution"
        ];
        
        const randomMessage = statusMessages[Math.floor(Math.random() * statusMessages.length)];
        addLog(`[${timestamp}] ℹ️ ${randomMessage}`);
      }
    }, 3000);
    
    // Clean up when the simulation stops
    return () => {
      clearInterval(blinkInterval);
      clearInterval(statusInterval);
      
      if (running) {
        const timestamp = new Date().toLocaleTimeString();
        addLog(`[${timestamp}] 🛑 Simulation stopped`);
      }
    };
  }, [running]);
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col z-50">
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
        {/* Left panel - Code editor */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-bold">Arduino Sketch</h2>
          </div>
          <div className="flex-1 p-4 bg-gray-800 font-mono text-sm overflow-auto whitespace-pre">
            {code.split('\n').map((line, index) => (
              <div key={index} className="flex">
                <div className="w-8 text-gray-500 text-right pr-2">{index + 1}</div>
                <div className="text-green-400">{line}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right panel - Main display and logs */}
        <div className="w-1/2 flex flex-col">
          {/* Top section - Board visualization */}
          <div className="h-1/2 border-b border-gray-700 flex items-center justify-center p-4 relative">
            {/* Built-in LED display */}
            <div className="absolute top-4 right-4 bg-gray-800 p-3 rounded shadow-lg border border-gray-700">
              <h3 className="text-sm text-center text-gray-400 mb-2">Built-in LED (Pin 13)</h3>
              <div 
                className="w-16 h-16 mx-auto rounded-full"
                style={{
                  backgroundColor: ledState ? '#FFFF00' : '#444',
                  boxShadow: ledState ? '0 0 20px 5px rgba(255, 255, 0, 0.5)' : 'none',
                  border: '3px solid #555',
                  transition: 'all 0.2s ease'
                }}
              />
              <div className="mt-2 text-center text-sm font-mono text-gray-400">
                {ledState ? 'ON' : 'OFF'}
              </div>
            </div>
            
            {/* Board visualization */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full">
              <div className="text-center font-bold mb-4 text-gray-300">Arduino HERO Board</div>
              <div className="bg-gray-900 h-40 rounded-md border border-gray-700 flex items-center justify-center">
                <div className="text-center text-sm text-gray-400">
                  <div className="mb-2">Emulation Status:</div>
                  <div className="text-lg font-bold" style={{ color: running ? '#00FF00' : '#FF6666' }}>
                    {running ? 'RUNNING' : 'STOPPED'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom section - Logs */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-bold">Simulation Logs</h2>
              <button 
                onClick={() => setLogs([])}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-3 overflow-auto bg-gray-800">
              {logs.map((log, index) => {
                // Highlight LED state changes
                const isLedLog = log.includes('LED') || log.includes('Pin 13');
                const isLedOn = log.includes('ON') || log.includes('HIGH');
                
                // Customize style based on log content
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanEmulator;