import React from 'react';
import { useSimulator } from './SimulatorContext';
import { FileTerminal, Trash2 } from 'lucide-react';

/**
 * SimulationLogPanel - Display simulation logs in a scrollable panel
 */
const SimulationLogPanel = () => {
  const { logs: simulatorLogs, clearLogs: clearSimulatorLogs, isRunning: isSimulationRunning } = useSimulator();
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-md p-2 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FileTerminal size={14} className="text-blue-400 mr-1" />
          <span className="text-xs font-medium">Simulation Logs</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={clearSimulatorLogs}
            className="text-gray-400 hover:text-white"
            title="Clear Logs"
          >
            <Trash2 size={14} />
          </button>
          
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500' : 'bg-red-500'} mr-1`}></div>
            <span className="text-xs text-gray-400">{isSimulationRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto text-xs font-mono">
        {simulatorLogs.length === 0 ? (
          <div className="text-gray-500 italic p-2">No simulation logs yet</div>
        ) : (
          <div className="space-y-1">
            {simulatorLogs.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationLogPanel;