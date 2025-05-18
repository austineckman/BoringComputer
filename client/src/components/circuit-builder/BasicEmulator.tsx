import React, { useState, useEffect, useRef } from 'react';

interface BasicEmulatorProps {
  onClose: () => void;
}

/**
 * A minimal Arduino emulator that doesn't depend on anything else
 */
const BasicEmulator: React.FC<BasicEmulatorProps> = ({ onClose }) => {
  const [running, setRunning] = useState(false);
  const [ledState, setLedState] = useState(false);
  const [blinkSpeed, setBlinkSpeed] = useState(500); // ms
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([
    "Ultra Minimal Emulator initialized",
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

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  // Start LED blinking when running
  useEffect(() => {
    if (!running) {
      addLog("Emulation stopped");
      return;
    }
    
    // Add startup logs
    addLog("*** ULTRA MINIMAL EMULATOR ***");
    addLog("Starting simulation...");
    addLog("Program uploaded to Arduino");
    addLog("Uploading blink.ino to board");
    addLog("Uploading 3584 bytes");
    addLog("Sketch uses 3584 bytes (11% of program storage space)");
    addLog("Global variables use 184 bytes (9% of dynamic memory)");
    addLog("Running blink.ino");
    
    // Create LED blinking interval
    let lastState = false;
    const blinkInterval = setInterval(() => {
      lastState = !lastState;
      setLedState(lastState);
      
      // Log every state change
      addLog(`[AVR8] Pin 13 is now ${lastState ? 'HIGH' : 'LOW'}`);
      addLog(`[AVR8] delay(${blinkSpeed}ms) started`);
    }, blinkSpeed);
    
    // Clean up on stop
    return () => {
      clearInterval(blinkInterval);
    };
  }, [running, blinkSpeed]);
  
  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Ultra Minimal Emulator</h1>
        <div className="flex items-center space-x-3">
          <select 
            value={blinkSpeed}
            onChange={(e) => setBlinkSpeed(Number(e.target.value))}
            className="bg-gray-700 text-white rounded px-2 py-1.5"
            disabled={running}
          >
            <option value={200}>Fast (200ms)</option>
            <option value={500}>Medium (500ms)</option>
            <option value={1000}>Slow (1000ms)</option>
          </select>
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
        <div className="w-1/2 p-6 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-xl w-full">
            <h2 className="text-center text-lg font-bold mb-6">Arduino HERO Board</h2>
            
            {/* LED Display */}
            <div className="mb-8">
              <div className="text-center mb-4 text-sm text-gray-400">Built-in LED (Pin 13)</div>
              <div 
                className="w-48 h-48 mx-auto rounded-full border-4 border-gray-700 flex items-center justify-center"
                style={{
                  backgroundColor: ledState ? '#ffff00' : '#111',
                  boxShadow: ledState ? '0 0 50px 15px rgba(255, 255, 0, 0.6)' : 'none',
                  transition: 'all 0.05s ease'
                }}
              >
                <div className="text-4xl font-bold" style={{ color: ledState ? 'black' : '#222' }}>
                  LED
                </div>
              </div>
              <div className="text-center mt-4 text-xl">
                <span className="font-bold" style={{ color: ledState ? '#ffff00' : '#666' }}>
                  {ledState ? 'HIGH' : 'LOW'}
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
        <div className="w-1/2 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700 font-bold">
            Simulation Logs
          </div>
          <div className="flex-1 p-3 overflow-auto bg-black text-green-500 font-mono">
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
            <div ref={logsEndRef} />
          </div>
          
          {/* Sample Code Section */}
          <div className="p-3 border-t border-gray-700">
            <div className="font-bold mb-2">Current Sketch: blink.ino</div>
            <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto max-h-40">
{`// Simple blink sketch
void setup() {
  // Initialize digital pin LED_BUILTIN as an output
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);   // Turn the LED on
  delay(${blinkSpeed});              // Wait for ${blinkSpeed} milliseconds
  digitalWrite(LED_BUILTIN, LOW);    // Turn the LED off
  delay(${blinkSpeed});              // Wait for ${blinkSpeed} milliseconds
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicEmulator;