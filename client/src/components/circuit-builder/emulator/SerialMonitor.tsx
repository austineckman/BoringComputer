import React, { useState, useRef, useEffect } from 'react';

interface SerialMonitorProps {
  className?: string;
  baudRate?: number;
  autoScroll?: boolean;
  maxLines?: number;
  onSendData?: (data: string) => void;
  onClear?: () => void;
  onSaveLog?: (logData: string) => void;
}

/**
 * SerialMonitor Component
 * 
 * This component displays data received from the serial interface of the
 * emulated microcontroller and allows sending data to the microcontroller.
 * It closely mimics the Arduino IDE's serial monitor functionality.
 */
export function SerialMonitor({
  className = '',
  baudRate = 9600,
  autoScroll = true,
  maxLines = 1000,
  onSendData,
  onClear,
  onSaveLog
}: SerialMonitorProps) {
  const [connected, setConnected] = useState(false);
  const [serialData, setSerialData] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timestamp, setTimestamp] = useState(true);
  const [autoscroll, setAutoscroll] = useState(autoScroll);
  const [selectedBaudRate, setSelectedBaudRate] = useState(baudRate);
  
  const outputRef = useRef<HTMLDivElement>(null);
  const baudRates = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
  
  // Auto-scroll to bottom when new data arrives
  useEffect(() => {
    if (autoscroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [serialData, autoscroll]);
  
  // When baudRate changes, update the selected baud rate
  useEffect(() => {
    setSelectedBaudRate(baudRate);
  }, [baudRate]);
  
  // Register serial data handler with the emulator
  useEffect(() => {
    const handleSerialData = (value: number, char: string) => {
      const time = new Date().toLocaleTimeString();
      const formattedData = timestamp ? `[${time}] ${char}` : char;
      
      setSerialData(prev => {
        // Add the new data
        const newData = [...prev, formattedData];
        
        // Trim to maxLines if needed
        return newData.length > maxLines 
          ? newData.slice(newData.length - maxLines) 
          : newData;
      });
    };
    
    // Register with window to receive data from the emulator
    if (window) {
      window.serialDataHandler = handleSerialData;
      setConnected(true);
    }
    
    return () => {
      // Clean up
      if (window && window.serialDataHandler === handleSerialData) {
        window.serialDataHandler = null;
        setConnected(false);
      }
    };
  }, [timestamp, maxLines]);
  
  // Function to send serial data to the emulator
  const sendData = () => {
    if (!inputValue.trim()) return;
    
    if (onSendData) {
      onSendData(inputValue);
    }
    
    // Also add to our display with a marker showing it was sent
    const time = new Date().toLocaleTimeString();
    const formattedData = timestamp 
      ? `[${time}] >>> ${inputValue}` 
      : `>>> ${inputValue}`;
    
    setSerialData(prev => [...prev, formattedData]);
    setInputValue('');
  };
  
  // Handle Enter key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendData();
    }
  };
  
  // Clear the serial monitor
  const clearMonitor = () => {
    setSerialData([]);
    if (onClear) {
      onClear();
    }
  };
  
  // Save the serial monitor log
  const saveLog = () => {
    if (onSaveLog) {
      onSaveLog(serialData.join('\n'));
    } else {
      // Default implementation: download as a file
      const blob = new Blob([serialData.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `serial_log_${new Date().toISOString().replace(/:/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className={`serial-monitor ${className}`}>
      {/* Header with controls */}
      <div className="serial-monitor-header bg-gray-800 border-b border-gray-700 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-white">Serial Monitor</span>
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} 
                title={connected ? 'Connected' : 'Disconnected'}></span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Baud rate selector */}
          <select 
            value={selectedBaudRate}
            onChange={(e) => setSelectedBaudRate(parseInt(e.target.value))}
            className="bg-gray-700 text-white text-xs rounded px-1 py-0.5"
          >
            {baudRates.map(rate => (
              <option key={rate} value={rate}>{rate} baud</option>
            ))}
          </select>
          
          {/* Timestamp toggle */}
          <label className="text-xs text-white flex items-center space-x-1">
            <input
              type="checkbox"
              checked={timestamp}
              onChange={() => setTimestamp(!timestamp)}
              className="h-3 w-3"
            />
            <span>Timestamp</span>
          </label>
          
          {/* Autoscroll toggle */}
          <label className="text-xs text-white flex items-center space-x-1">
            <input
              type="checkbox"
              checked={autoscroll}
              onChange={() => setAutoscroll(!autoscroll)}
              className="h-3 w-3"
            />
            <span>Autoscroll</span>
          </label>
          
          {/* Action buttons */}
          <button
            onClick={clearMonitor}
            className="bg-gray-700 hover:bg-gray-600 text-xs text-white rounded px-2 py-0.5"
            title="Clear serial monitor"
          >
            Clear
          </button>
          
          <button
            onClick={saveLog}
            className="bg-gray-700 hover:bg-gray-600 text-xs text-white rounded px-2 py-0.5"
            title="Save log as file"
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Output area */}
      <div 
        ref={outputRef}
        className="serial-monitor-output bg-black text-green-400 font-mono text-xs p-2 h-48 overflow-auto whitespace-pre-wrap"
      >
        {serialData.length === 0 ? (
          <div className="text-gray-500 italic">No data received</div>
        ) : (
          serialData.map((line, index) => (
            <div key={index} className="serial-line">
              {line}
            </div>
          ))
        )}
      </div>
      
      {/* Input area */}
      <div className="serial-monitor-input bg-gray-800 border-t border-gray-700 p-2 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Send serial data..."
          className="flex-1 bg-gray-900 text-white px-2 py-1 text-sm rounded-l border-0 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={sendData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Register serial data handler type on window
declare global {
  interface Window {
    serialDataHandler: ((value: number, char: string) => void) | null;
  }
}

export default SerialMonitor;