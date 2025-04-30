import React, { useRef, useEffect } from 'react';
import { useSimulator } from './SimulatorContext';

/**
 * SimulationLogPanel - Displays simulation logs and status
 */
const SimulationLogPanel = () => {
  const { logs, isSimulationRunning } = useSimulator();
  const logContainerRef = useRef(null);
  
  // Auto-scroll logs to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  return (
    <div className="bg-gray-800 border-t border-gray-700 text-white">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold">Simulation Logs</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">{isSimulationRunning ? 'Running' : 'Stopped'}</span>
        </div>
      </div>
      
      <div 
        ref={logContainerRef}
        className="h-32 overflow-y-auto p-2 text-xs font-mono"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">No simulation logs yet</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-400">[{log.timestamp}]</span>{' '}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulationLogPanel;