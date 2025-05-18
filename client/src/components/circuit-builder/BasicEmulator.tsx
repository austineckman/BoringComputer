import React, { useState, useEffect } from 'react';

interface BasicEmulatorProps {
  onClose: () => void;
}

/**
 * A minimal Arduino emulator that doesn't depend on anything else
 */
const BasicEmulator: React.FC<BasicEmulatorProps> = ({ onClose }) => {
  const [running, setRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Arduino Emulator initialized",
    "Ready to run your sketch"
  ]);
  
  // Toggle running state
  const toggleRunning = () => {
    setRunning(prev => !prev);
  };
  
  // Add a log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };
  
  // Start LED blinking when running
  useEffect(() => {
    if (!running) return;
    
    // Add startup logs
    addLog("Starting simulation...");
    addLog("Program uploaded to Arduino");
    addLog("Running the Blink sketch");
    
    // Create LED blinking interval
    const blinkInterval = setInterval(() => {
      setLedState(prev => {
        const newState = !prev;
        addLog(`Pin 13 is now ${newState ? 'HIGH' : 'LOW'}`);
        return newState;
      });
    }, 1000);
    
    // Clean up on stop
    return () => {
      clearInterval(blinkInterval);
    };
  }, [running]);
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Arduino Emulator</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleRunning}
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
        {/* Left - Arduino board and LED */}
        <div className="w-2/3 p-6 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-xl w-full">
            <h2 className="text-center text-lg font-bold mb-6">Arduino HERO Board</h2>
            
            {/* LED Display */}
            <div className="mb-8">
              <div className="text-center mb-2 text-sm text-gray-400">Built-in LED (Pin 13)</div>
              <div 
                className="w-32 h-32 mx-auto rounded-full border-4 border-gray-700"
                style={{
                  backgroundColor: ledState ? '#ffff00' : '#333',
                  boxShadow: ledState ? '0 0 30px 10px rgba(255, 255, 0, 0.5)' : 'none',
                  transition: 'all 0.1s ease'
                }}
              />
              <div className="text-center mt-2 text-lg">
                <span className="font-bold" style={{ color: ledState ? '#ffff00' : '#666' }}>
                  {ledState ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
            
            {/* Status Display */}
            <div className="bg-gray-900 p-4 rounded text-center">
              <div className="text-sm text-gray-400 mb-1">Emulation Status</div>
              <div className={`text-lg font-bold ${running ? 'text-green-500' : 'text-red-500'}`}>
                {running ? 'RUNNING' : 'STOPPED'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right - Logs */}
        <div className="w-1/3 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700 font-bold">
            Simulation Logs
          </div>
          <div className="flex-1 p-3 overflow-auto">
            {logs.map((log, index) => {
              // Highlight LED-related logs
              const isLedLog = log.toLowerCase().includes('pin 13') || log.toLowerCase().includes('led');
              const isHigh = log.toLowerCase().includes('high');
              
              const style = isLedLog
                ? { color: isHigh ? '#ffff00' : '#999' }
                : {};
              
              return (
                <div key={index} className="text-sm mb-1" style={style}>
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

export default BasicEmulator;