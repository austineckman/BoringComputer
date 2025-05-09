import React from 'react';
import { Play, Square, RefreshCw, Save, FolderOpen, Cpu, Zap } from 'lucide-react';
import { useEmulator } from './EmulatorContext';

/**
 * Emulator Controls Component - Sandbox Style
 * 
 * Provides buttons to compile, run, and stop the emulator
 * with styles matching the Sandbox UI
 */
export function EmulatorControls() {
  const { 
    isRunning, 
    isCompiling, 
    compileAndRun, 
    stopSimulation,
    error
  } = useEmulator();
  
  // Handle run button click
  const handleRun = async () => {
    if (isRunning) {
      stopSimulation();
    } else {
      await compileAndRun();
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <button 
        className={`p-1 rounded text-xs ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        onClick={handleRun}
        disabled={isCompiling}
        title={isRunning ? "Stop Simulation" : "Run Simulation"}
      >
        <Play size={18} />
      </button>
      
      <button
        className="bg-blue-600 p-1 rounded hover:bg-blue-700 text-xs"
        disabled={isRunning || isCompiling}
        onClick={() => compileAndRun()}
        title="Verify Code"
      >
        <Cpu size={18} />
      </button>
      
      <button 
        className="bg-blue-600 p-1 rounded hover:bg-blue-700 text-xs"
        disabled={isRunning}
        title="Save Project"
      >
        <Save size={18} />
      </button>
      
      <button 
        className="bg-blue-600 p-1 rounded hover:bg-blue-700 text-xs"
        disabled={isRunning}
        title="Open Project"
      >
        <FolderOpen size={18} />
      </button>
      
      {isCompiling && (
        <div className="px-2 py-1 bg-amber-900 rounded text-amber-300 text-xs font-bold animate-pulse flex items-center">
          <Zap className="h-3 w-3 mr-1 animate-pulse" />
          Compiling...
        </div>
      )}
      
      {error && (
        <div className="px-2 py-1 bg-red-900 rounded text-red-300 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}