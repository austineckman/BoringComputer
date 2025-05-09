import React from 'react';
import { Play, Square, RefreshCw, Save, FolderOpen, Cpu, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useEmulator } from './EmulatorContext';

/**
 * Emulator Controls Component - Retro Gaming Style
 * 
 * Provides buttons to compile, run, and stop the emulator
 * with a retro gaming aesthetic
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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRun}
        disabled={isCompiling}
        className={`border ${isRunning 
          ? 'border-red-500 bg-red-900/30 hover:bg-red-800/50 text-red-300' 
          : 'border-green-500 bg-blue-900/30 hover:bg-green-800/50 text-green-300'}`}
      >
        {isRunning ? (
          <>
            <Square className="h-4 w-4 mr-2" />
            STOP
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            RUN
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        disabled={isRunning || isCompiling}
        onClick={() => compileAndRun()}
        className="border border-yellow-500 bg-blue-900/30 hover:bg-yellow-900/30 text-yellow-300"
      >
        <Cpu className="h-4 w-4 mr-2" />
        VERIFY
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        disabled={isRunning}
        className="border border-cyan-500 bg-blue-900/30 hover:bg-blue-800/50 text-cyan-300"
      >
        <Save className="h-4 w-4 mr-2" />
        SAVE
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        disabled={isRunning}
        className="border border-cyan-500 bg-blue-900/30 hover:bg-blue-800/50 text-cyan-300"
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        OPEN
      </Button>
      
      {isCompiling && (
        <div className="ml-2 px-2 py-1 bg-amber-900/30 border border-amber-700 rounded text-amber-300 text-xs font-bold animate-pulse flex items-center">
          <Zap className="h-3 w-3 mr-1 animate-pulse" />
          COMPILING...
        </div>
      )}
      
      {error && (
        <div className="ml-2 px-2 py-1 bg-red-900/30 border border-red-700 rounded text-red-300 text-xs">
          {error}
        </div>
      )}
    </div>
  );
}