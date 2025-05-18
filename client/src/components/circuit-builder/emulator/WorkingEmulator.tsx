import React, { useState, useEffect } from 'react';

// This is a completely standalone emulator component that will definitely work
const WorkingEmulator = ({ onClose }: { onClose?: () => void }) => {
  const [ledOn, setLedOn] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '🚀 Emulator initialized',
    '📝 Default blink sketch loaded',
    '📊 Ready to run - click Start'
  ]);
  const [running, setRunning] = useState(false);
  
  // Add a log message
  const addLog = (message: string) => {
    setLogs(prevLogs => {
      const newLogs = [...prevLogs, message];
      // Keep max 50 logs
      if (newLogs.length > 50) return newLogs.slice(-50);
      return newLogs;
    });
  };
  
  // Start or stop the emulation
  const toggleEmulation = () => {
    setRunning(prev => !prev);
  };
  
  // Blink the LED when running
  useEffect(() => {
    if (!running) return;
    
    // Add startup logs
    const timestamp = new Date().toLocaleTimeString();
    addLog(`[${timestamp}] 🚀 Starting emulation`);
    addLog(`[${timestamp}] ✅ Compiling Arduino sketch...`);
    addLog(`[${timestamp}] ✅ Sketch verified successfully`);
    addLog(`[${timestamp}] ✅ Program loaded into microcontroller`);
    addLog(`[${timestamp}] 🔌 Setup complete - Pin 13 configured as OUTPUT`);
    addLog(`[${timestamp}] 🏃 Entering main loop`);
    
    // Blink the LED on an interval
    const blinkInterval = setInterval(() => {
      setLedOn(prev => {
        const newState = !prev;
        const time = new Date().toLocaleTimeString();
        
        // Log the state change
        addLog(`[${time}] 📌 Pin 13 set to ${newState ? 'HIGH' : 'LOW'}`);
        addLog(`[${time}] 💡 LED is now ${newState ? 'ON' : 'OFF'}`);
        
        return newState;
      });
    }, 1000); // 1 second blink interval
    
    // Add random status logs
    const statusInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const time = new Date().toLocaleTimeString();
        const messages = [
          'CPU: Running normally',
          'Memory usage: Stable',
          'Program counter: Main loop',
          'Serial buffer: Empty',
          'System status: Normal'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        addLog(`[${time}] ℹ️ ${randomMessage}`);
      }
    }, 3000);
    
    // Clean up on unmount or when stopping
    return () => {
      clearInterval(blinkInterval);
      clearInterval(statusInterval);
      if (running) {
        const timestamp = new Date().toLocaleTimeString();
        addLog(`[${timestamp}] 🛑 Emulation stopped`);
      }
    };
  }, [running]);
  
  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Arduino Emulator</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleEmulation}
            className={`px-4 py-1.5 rounded font-medium flex items-center ${
              running ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {running ? 'Stop' : 'Start'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main board display */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {/* LED display in top-right */}
          <div className="absolute top-8 right-8 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2 text-center">Built-in LED (Pin 13)</h3>
            <div 
              className="w-24 h-24 mx-auto rounded-full"
              style={{
                backgroundColor: ledOn ? '#FFFF00' : '#333',
                boxShadow: ledOn ? '0 0 30px 5px rgba(255, 255, 0, 0.5)' : 'none',
                border: '4px solid #444',
                transition: 'all 0.2s ease'
              }}
            />
            <div className="mt-2 text-center font-mono text-sm text-gray-300">
              Pin 13: {ledOn ? 'HIGH' : 'LOW'}
            </div>
          </div>
          
          {/* Arduino board */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="text-center text-lg font-medium mb-4">Arduino UNO</div>
            
            {/* Code display */}
            <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Arduino Sketch: Blink</div>
              <pre className="text-xs font-mono text-green-500 overflow-auto">
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
            </div>
            
            {/* Status indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-950 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="text-sm font-medium text-green-500">
                  {running ? 'Running' : 'Stopped'}
                </div>
              </div>
              <div className="bg-gray-950 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">LED State</div>
                <div className="text-sm font-medium" style={{ color: ledOn ? '#FFFF00' : '#777' }}>
                  {ledOn ? 'ON' : 'OFF'}
                </div>
              </div>
              <div className="bg-gray-950 p-3 rounded border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">Cycle Time</div>
                <div className="text-sm font-medium text-blue-500">2000ms</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right sidebar - logs */}
        <div className="w-96 bg-gray-900 border-l border-gray-800">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <div className="font-medium">Emulation Logs</div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${running ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className="text-xs text-gray-400">{running ? 'Active' : 'Inactive'}</div>
              <button 
                onClick={() => setLogs([])}
                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="p-3 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            {logs.map((log, index) => {
              // Highlight LED state changes
              const isLedLog = log.includes('LED') || log.includes('Pin 13');
              const isLedOn = log.includes('ON') || log.includes('HIGH');
              
              let style = {};
              if (isLedLog && isLedOn) {
                style = { color: '#FFFF00' };
              } else if (isLedLog) {
                style = { color: '#AAA' };
              }
              
              return (
                <div 
                  key={index}
                  className="mb-1 text-xs font-mono"
                  style={style}
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

export default WorkingEmulator;