import React, { useEffect, useRef } from 'react';

interface SimulationLogsPanelProps {
  logs: string[];
  onClear: () => void;
  isRunning?: boolean;
}

export const SimulationLogsPanel: React.FC<SimulationLogsPanelProps> = ({ 
  logs, 
  onClear,
  isRunning = false 
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  // Calculate a meaningful scrollbar color based on running state
  const scrollbarColor = isRunning ? '#00cc00' : '#666666';
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
        <h3 className="text-sm font-bold text-white">
          Simulation Logs 
          {isRunning && <span className="ml-2 text-green-400">● Running</span>}
        </h3>
        <button 
          onClick={onClear}
          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>
      <div 
        className="flex-1 overflow-auto p-2 text-gray-300 text-xs"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${scrollbarColor} #1f2937`,
        }}
      >
        {logs.length > 0 ? (
          <>
            {logs.map((log, index) => {
              // Highlight LED state changes with colors
              const isLEDLog = log.includes('LED') || log.includes('Pin 13');
              const isLEDOn = log.includes('ON') || log.includes('HIGH');
              const isLEDOff = log.includes('OFF') || log.includes('LOW');
              
              // Add appropriate style based on content
              let logStyle = {};
              if (isLEDLog) {
                if (isLEDOn) {
                  logStyle = { color: '#ffff00', fontWeight: 'bold' };
                } else if (isLEDOff) {
                  logStyle = { color: '#999900', fontWeight: 'bold' };
                }
              }
              
              return (
                <div 
                  key={index} 
                  className="mb-1 font-mono" 
                  style={logStyle}
                >
                  {log}
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </>
        ) : (
          <div className="text-gray-500 italic">
            {isRunning 
              ? "Starting simulation, logs will appear here..." 
              : "No logs available - click 'Run' to start simulation"}
          </div>
        )}
      </div>
    </div>
  );
};