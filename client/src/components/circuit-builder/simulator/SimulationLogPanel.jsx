import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationLogPanel Component
 * 
 * This component displays the simulation logs in a scrollable panel.
 * It includes auto-scrolling functionality that can be toggled on/off.
 * It filters the logs to only show ACTUAL Arduino code execution output.
 */
const SimulationLogPanel = () => {
  const { logs } = useSimulator();
  const logContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Filter logs to only show ACTUAL Arduino program execution
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Get the log message without timestamp
      const messageWithoutTimestamp = log.replace(/\[\d{1,2}:\d{2}:\d{2}(?: [AP]M)?\] /, '');
      
      // Only show useful logs - actual program execution ones, not system messages
      return (
        // Include program execution messages
        messageWithoutTimestamp.includes('Executing:') ||
        messageWithoutTimestamp.includes('Program loaded') ||
        messageWithoutTimestamp.includes('Program started') ||
        messageWithoutTimestamp.includes('Program stopped') ||
        messageWithoutTimestamp.includes('Compiling ') ||
        
        // Include actual Arduino output about pin states
        (messageWithoutTimestamp.includes('Built-in LED') || 
         messageWithoutTimestamp.includes('Pin 13') ||
         messageWithoutTimestamp.includes('digitalWrite(13')) ||
        
        // Include Serial output and delays
        messageWithoutTimestamp.includes('Serial output:') ||
        messageWithoutTimestamp.includes('delay(')
      );
    });
  }, [logs]);
  
  // Auto-scroll to the bottom when logs update (only if autoScroll is enabled)
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);
  
  // Handle scroll events to disable auto-scroll if user manually scrolls up
  const handleScroll = () => {
    if (!logContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 10; // 10px buffer
    
    // Only update if the state is changing to avoid unnecessary renders
    if (autoScroll !== isScrolledToBottom) {
      setAutoScroll(isScrolledToBottom);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Simulation Logs
        </h3>
        
        {/* Auto-scroll toggle */}
        <button 
          onClick={() => setAutoScroll(!autoScroll)}
          className={`text-xs px-2 py-1 rounded ${autoScroll ? 'bg-blue-600' : 'bg-gray-700'}`}
          title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
        >
          {autoScroll ? "Auto" : "Manual"}
        </button>
      </div>
      
      <div
        ref={logContainerRef}
        className="flex-1 bg-gray-900 font-mono text-xs overflow-y-auto p-2 rounded"
        style={{ 
          maxHeight: 'calc(100% - 30px)',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain' // Prevents scroll chaining
        }}
        onScroll={handleScroll}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 italic">No program logs yet. Run your Arduino code to see execution output.</div>
        ) : (
          <div className="pb-1"> {/* Extra padding at bottom for better scrolling */}
            {filteredLogs.map((log, index) => (
              <div key={index} className="text-green-400 mb-1 break-words">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationLogPanel;