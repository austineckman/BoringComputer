import React from 'react';
import { Play, Square, RefreshCw, Save, FolderOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useEmulator } from './EmulatorContext';

/**
 * Emulator Controls Component
 * 
 * Provides buttons to compile, run, and stop the emulator
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
      >
        {isRunning ? (
          <>
            <Square className="h-4 w-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Run
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        disabled={isRunning || isCompiling}
        onClick={() => compileAndRun()}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Verify
      </Button>
      
      <Button variant="outline" size="sm" disabled={isRunning}>
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
      
      <Button variant="outline" size="sm" disabled={isRunning}>
        <FolderOpen className="h-4 w-4 mr-2" />
        Open
      </Button>
      
      {isCompiling && (
        <div className="text-xs text-muted-foreground ml-2 animate-pulse">
          Compiling...
        </div>
      )}
      
      {error && (
        <div className="text-xs text-destructive ml-2">
          {error}
        </div>
      )}
    </div>
  );
}