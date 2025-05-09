import React, { useEffect, useRef } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationLogPanel Component
 * 
 * This component displays the simulation logs in a scrollable panel.
 */
const SimulationLogPanel = () => {
  const { logs } = useSimulator();
  const logContainerRef = useRef(null);
  
  // Auto-scroll to the bottom when logs update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-white mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Simulation Logs
      </h3>
      
      <div
        ref={logContainerRef}
        className="flex-1 bg-gray-900 font-mono text-xs overflow-y-auto p-2 rounded"
        style={{ maxHeight: 'calc(100% - 30px)' }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No logs yet. Run the simulation to see logs.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-green-400 mb-1 break-words">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulationLogPanel;