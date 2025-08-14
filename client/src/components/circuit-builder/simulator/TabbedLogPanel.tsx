import React, { useState } from 'react';
// @ts-ignore - SimulatorContext is a JSX file
import { useSimulator } from './SimulatorContext';

const TabbedLogPanel: React.FC = () => {
  // @ts-ignore - logs and serialLogs come from context
  const { logs, serialLogs = [], isRunning } = useSimulator();
  const [activeTab, setActiveTab] = useState<'simulation' | 'serial'>('simulation');

  const renderTabButton = (tab: 'simulation' | 'serial', label: string, count: number) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
        activeTab === tab
          ? 'text-white border-blue-400 bg-gray-700'
          : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
      }`}
    >
      {label} ({count})
    </button>
  );

  const renderSimulationLogs = () => (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {logs.length === 0 ? (
        <div className="text-gray-500 italic">
          No simulation logs yet. Click "Run" to start Arduino simulation...
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
  );

  const renderSerialMonitor = () => (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {serialLogs.length === 0 ? (
        <div className="text-gray-500 italic">
          No serial output yet. Use Serial.print() or Serial.println() in your Arduino code...
        </div>
      ) : (
        serialLogs.map((log: any, index: number) => {
          const timestamp = log.timestamp || new Date().toLocaleTimeString();
          const message = typeof log === 'string' ? log : (log.message || log.data || String(log));
          
          return (
            <div key={index} className="flex">
              <span className="text-blue-400 text-xs mr-2 flex-shrink-0 w-20">
                {timestamp}
              </span>
              <span className="flex-1 break-words text-green-400">
                {message}
              </span>
            </div>
          );
        })
      )}
    </div>
  );

  const getStatusText = () => {
    if (activeTab === 'simulation') {
      return `${logs.length} log entries • ${isRunning ? 'Simulation running' : 'Simulation stopped'}`;
    } else {
      return `${serialLogs.length} serial messages • ${isRunning ? 'Monitoring serial output' : 'Serial monitor idle'}`;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400 font-mono text-sm">
      {/* Tab Header */}
      <div className="bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex">
          {renderTabButton('simulation', 'Simulation', logs.length)}
          {renderTabButton('serial', 'Serial Monitor', serialLogs.length)}
        </div>
        <div className={`w-2 h-2 rounded-full mr-3 ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
      </div>
      
      {/* Tab Content */}
      {activeTab === 'simulation' ? renderSimulationLogs() : renderSerialMonitor()}
      
      {/* Status Footer */}
      <div className="bg-gray-800 px-3 py-1 border-t border-gray-700 text-xs text-gray-400">
        {getStatusText()}
      </div>
    </div>
  );
};

export default TabbedLogPanel;