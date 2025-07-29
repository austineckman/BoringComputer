import React from 'react';
// @ts-ignore - SimulatorContext is a JSX file
import { useSimulator } from './SimulatorContext';

const SimplifiedLogPanel: React.FC = () => {
  // @ts-ignore - logs comes from context
  const { logs, isRunning } = useSimulator();

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400 font-mono text-sm">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
        <span className="text-white font-semibold">Arduino Simulation Logs</span>
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">
            No logs yet. Click "Run" to start Arduino simulation...
          </div>
        ) : (
          logs.map((log: string, index: number) => (
            <div key={index} className="flex">
              <span className="text-gray-500 w-8 text-right mr-2 flex-shrink-0">
                {String(index + 1).padStart(3, '0')}:
              </span>
              <span className="flex-1 break-words">
                {log}
              </span>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-gray-800 px-3 py-1 border-t border-gray-700 text-xs text-gray-400">
        {logs.length} log entries • {isRunning ? 'Simulation running' : 'Simulation stopped'}
      </div>
    </div>
  );
};

export default SimplifiedLogPanel;