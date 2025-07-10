import React from 'react';
import { Play, Square, RefreshCw, Code, Zap } from 'lucide-react';
import { useSimulator } from './SimpleSimulatorContext';

/**
 * Simple, powerful simulation control panel
 * Shows real emulation status and controls
 */
const SimulationControlPanel = () => {
  const { 
    isRunning, 
    startSimulation, 
    stopSimulation, 
    logs, 
    pinStates, 
    code, 
    setCode 
  } = useSimulator();

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <Zap className="mr-2 text-yellow-400" size={20} />
          Arduino Emulator
        </h3>
        <div className={`px-2 py-1 rounded text-xs font-bold ${
          isRunning ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
        }`}>
          {isRunning ? 'RUNNING' : 'STOPPED'}
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
            isRunning 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Play size={16} className="mr-1" />
          Run Code
        </button>
        
        <button
          onClick={stopSimulation}
          disabled={!isRunning}
          className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
            !isRunning 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <Square size={16} className="mr-1" />
          Stop
        </button>
        
        <button
          onClick={() => {
            stopSimulation();
            setTimeout(startSimulation, 100);
          }}
          className="flex items-center px-3 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          <RefreshCw size={16} className="mr-1" />
          Restart
        </button>
      </div>

      {/* Pin States Display */}
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center">
          <Code size={14} className="mr-1" />
          Pin States
        </h4>
        <div className="bg-gray-800 rounded p-2">
          {Object.keys(pinStates).length > 0 ? (
            <div className="grid grid-cols-4 gap-2 text-xs">
              {Object.entries(pinStates).map(([pin, state]) => (
                <div key={pin} className="flex items-center">
                  <span className="text-gray-400 mr-1">Pin {pin}:</span>
                  <span className={`font-bold ${state ? 'text-green-400' : 'text-red-400'}`}>
                    {state ? 'HIGH' : 'LOW'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No pin activity</div>
          )}
        </div>
      </div>

      {/* Simulation Logs */}
      <div>
        <h4 className="text-sm font-bold text-gray-300 mb-2">Emulation Log</h4>
        <div className="bg-gray-800 rounded p-2 h-32 overflow-y-auto">
          {logs.length > 0 ? (
            <div className="space-y-1">
              {logs.slice(-10).map((log, index) => (
                <div key={index} className="text-xs text-gray-300 font-mono">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-xs">No logs yet</div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="mt-4 text-xs text-gray-400">
        <p>• Connect components to Arduino pins</p>
        <p>• Click "Run Code" to start real emulation</p>
        <p>• Components respond to actual pin states</p>
      </div>
    </div>
  );
};

export default SimulationControlPanel;