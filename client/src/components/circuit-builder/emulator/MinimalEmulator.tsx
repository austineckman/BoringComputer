import React, { useState, useEffect } from 'react';

interface MinimalEmulatorProps {
  onClose: () => void;
}

/**
 * A minimal, guaranteed-to-work Arduino emulator
 * This component has zero dependencies on other emulator code
 */
const MinimalEmulator: React.FC<MinimalEmulatorProps> = ({ onClose }) => {
  // Bare minimum state - just a blinking LED and logs
  const [ledOn, setLedOn] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Arduino emulator ready"
  ]);
  
  // Toggle running state
  const toggleRunning = () => {
    setRunning(prev => !prev);
  };
  
  // Add log message
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };
  
  // Handle blinking LED when emulator is running
  useEffect(() => {
    if (!running) return;
    
    // Add startup logs
    addLog("Simulation started");
    addLog("Running Arduino blink sketch");
    
    // Start LED blinking
    const blinkInterval = setInterval(() => {
      setLedOn(prev => {
        const newState = !prev;
        addLog(`LED pin 13 is now ${newState ? 'HIGH' : 'LOW'}`);
        return newState;
      });
    }, 1000);
    
    // Cleanup on stop
    return () => {
      clearInterval(blinkInterval);
      if (running) {
        addLog("Simulation stopped");
      }
    };
  }, [running]);
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">Arduino Emulator (Minimal)</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleRunning}
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
      <div className="flex flex-1">
        {/* Left - LED and board */}
        <div className="w-2/3 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-lg w-full">
            <h2 className="text-center text-lg font-bold mb-6">HERO Board</h2>
            
            {/* LED display */}
            <div className="mb-8 flex flex-col items-center">
              <div 
                className="w-24 h-24 rounded-full border-4 border-gray-700 mb-2"
                style={{
                  backgroundColor: ledOn ? '#ffff00' : '#333',
                  boxShadow: ledOn ? '0 0 30px 10px rgba(255, 255, 0, 0.5)' : 'none',
                  transition: 'all 0.1s ease'
                }}
              />
              <div className="text-center">
                <div className="text-sm text-gray-400">Built-in LED (Pin 13)</div>
                <div className="text-xl font-bold" style={{ color: ledOn ? '#ffff00' : '#666' }}>
                  {ledOn ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
            
            {/* Status display */}
            <div className="bg-gray-900 p-4 rounded text-center">
              <div className="text-sm text-gray-400 mb-1">Simulation Status</div>
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
              // Highlight LED logs
              const isLedLog = log.toLowerCase().includes('led');
              const isOn = log.toLowerCase().includes('high');
              
              let style = {};
              if (isLedLog) {
                style = { color: isOn ? '#ffff00' : '#999' };
              }
              
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

export default MinimalEmulator;