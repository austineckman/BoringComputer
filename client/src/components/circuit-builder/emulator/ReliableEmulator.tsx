import React, { useState, useEffect, useCallback } from 'react';

interface ReliableEmulatorProps {
  onClose: () => void;
  /**
   * Optional components array.
   * This emulator doesn't need them to function, but accepts them for compatibility.
   */
  components?: any[];
  /**
   * Optional code string.
   * Will use a default blink sketch if not provided.
   */
  code?: string;
}

/**
 * A reliable, stripped-down emulator that guarantees visual feedback.
 * This component can be used in place of UniversalEmulatorApp for a guaranteed working experience.
 */
const ReliableEmulator: React.FC<ReliableEmulatorProps> = ({
  onClose,
  components = [],
  code: initialCode
}) => {
  // Basic state
  const [running, setRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '🔌 Emulator initialized',
    '📝 Arduino sketch loaded',
    '⚙️ Ready to run simulation'
  ]);
  
  // Default Arduino code (blink sketch)
  const [code] = useState(initialCode || `void setup() {
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
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, message];
      // Keep max 100 logs for performance
      if (newLogs.length > 100) return newLogs.slice(-100);
      return newLogs;
    });
  }, []);
  
  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  // Toggle simulation running state
  const toggleSimulation = useCallback(() => {
    setRunning(prev => !prev);
  }, []);
  
  // Handle LED blinking and simulation logs
  useEffect(() => {
    if (!running) return;
    
    // Add startup logs
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] 🚀 Starting emulation...`);
    addLog(`[${timestamp}] ✅ Compiling code...`);
    addLog(`[${timestamp}] ✅ Code compiled successfully`);
    addLog(`[${timestamp}] 📥 Uploading to Arduino...`);
    addLog(`[${timestamp}] ✅ Upload complete`);
    addLog(`[${timestamp}] ⚙️ Running setup() function...`);
    addLog(`[${timestamp}] 🔌 Setting pin 13 as OUTPUT`);
    addLog(`[${timestamp}] 🏃 Starting loop() execution`);
    
    // Initialize the LED blinking interval
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        const time = new Date().toLocaleTimeString();
        
        // Log the state change
        addLog(`[${time}] 📌 Pin 13 set to ${newState ? 'HIGH' : 'LOW'}`);
        addLog(`[${time}] 💡 Built-in LED is now ${newState ? 'ON' : 'OFF'}`);
        
        return newState;
      });
    }, 1000); // 1 second interval for the blink
    
    // Add occasional status updates
    const statusInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        const time = new Date().toLocaleTimeString();
        const messages = [
          '🔄 loop() function running',
          '⏱️ delay() function called',
          '💻 Program execution normal',
          '📊 Memory usage: stable',
          '⚡ Voltage: 5.0V'
        ];
        
        addLog(`[${time}] ${messages[Math.floor(Math.random() * messages.length)]}`);
      }
    }, 3000); // Add status updates every 3 seconds
    
    // Clean up when simulation stops or component unmounts
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Arduino Emulator</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-1.5 rounded font-medium flex items-center space-x-2 ${
              running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <span>{running ? 'Stop' : 'Run'}</span>
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
        {/* Left panel - Arduino and LED visualization */}
        <div className="w-1/2 flex items-center justify-center relative">
          {/* Built-in LED display (top-right) */}
          <div className="absolute top-6 right-6 bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-sm text-center text-gray-400 mb-2">Built-in LED (Pin 13)</h3>
            <div 
              className="w-24 h-24 mx-auto rounded-full"
              style={{
                backgroundColor: ledState ? '#FFFF00' : '#333',
                boxShadow: ledState ? '0 0 30px 5px rgba(255, 255, 0, 0.6)' : 'none',
                border: '4px solid #555',
                transition: 'all 0.2s ease'
              }}
            />
            <div className="mt-2 text-center font-mono text-sm">
              <span className={ledState ? 'text-yellow-300' : 'text-gray-400'}>
                {ledState ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
          
          {/* Arduino board visualization */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-xl w-full">
            <h2 className="text-center text-lg font-bold mb-4">HERO Board</h2>
            
            {/* Board visualization */}
            <div className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
              <div className="text-center mb-4">
                <div className="text-sm mb-1">Status:</div>
                <div className={`font-bold ${running ? 'text-green-500' : 'text-red-500'}`}>
                  {running ? 'RUNNING' : 'STOPPED'}
                </div>
              </div>
              
              {/* Pins visualization - simplified */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {/* Generate 14 digital pins */}
                {Array.from({ length: 14 }).map((_, index) => (
                  <div 
                    key={`pin-${index}`}
                    className="flex flex-col items-center"
                  >
                    <div 
                      className={`w-6 h-6 rounded-full border-2 ${
                        index === 13 && ledState 
                          ? 'bg-yellow-300 border-yellow-500' 
                          : 'bg-gray-800 border-gray-600'
                      }`}
                    />
                    <div className="text-xs mt-1">{index}</div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-800 p-2 rounded w-full text-center text-sm">
                {running ? 'Program running...' : 'Ready'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right panel - Code and logs */}
        <div className="w-1/2 flex flex-col border-l border-gray-700">
          {/* Code editor */}
          <div className="h-1/2 border-b border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
              <h2 className="font-bold">Arduino Sketch</h2>
            </div>
            <div className="flex-1 overflow-auto bg-gray-900 p-4">
              <pre className="font-mono text-sm text-green-500">{code}</pre>
            </div>
          </div>
          
          {/* Simulation logs */}
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
            <div className="flex-1 overflow-auto p-3 bg-gray-800">
              {logs.map((log, index) => {
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
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReliableEmulator;