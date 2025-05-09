import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Move, RotateCcw, Trash2, Play, Save, FileCode, Download, X } from 'lucide-react';
import { AppWindow } from '../os/AppWindow';
import { CodeEditor } from './emulator/CodeEditor';
import { CircuitBuilder } from './emulator/CircuitBuilder';
import { EmulatorControls } from './emulator/EmulatorControls';
import { SerialMonitor } from './emulator/SerialMonitor';
import { EmulatorProvider } from './emulator/EmulatorContext';
import { ComponentPalette } from './emulator/components/ComponentPalette';

// Desktop app icon for CraftingTable OS
const EMULATOR_ICON = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNpcmN1aXQtYm9hcmQiPjxyZWN0IHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeD0iMyIgeT0iMyIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjIiLz48cGF0aCBkPSJNOS4xNCAxNUg3YTIgMiAwIDAgMSAwLTRoMiIvPjxwYXRoIGQ9Ik0xNSA5aDJhMiAyIDAgMCAxIDIgMnY0TTkuMTQgMTVsNS41Mi0zLjUyTTE1IDE3aDJhMiAyIDAgMSAwIDAtNGgtMSIvPjwvc3ZnPg==';

/**
 * Universal Emulator Desktop App - Style matched with Sandbox UI
 * 
 * This component serves as the entry point for the emulator app 
 * in the CraftingTable OS desktop environment.
 */
export function UniversalEmulator({ 
  appId, 
  isActive, 
  onClose 
}: { 
  appId: string; 
  isActive: boolean; 
  onClose: () => void; 
}) {
  // States for UI management
  const [activeTab, setActiveTab] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [showExampleDropdown, setShowExampleDropdown] = useState(false);
  
  // Toggle simulation
  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };
  
  return (
    <AppWindow
      appId={appId}
      title="Universal Emulator"
      icon={EMULATOR_ICON}
      isActive={isActive}
      onClose={onClose}
      width={1200}
      height={800}
      resizable={true}
    >
      {/* Each EmulatorProvider creates an isolated emulator instance */}
      <EmulatorProvider instanceId={`${appId}-${activeTab}`}>
        <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
          {/* Toolbar */}
          <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <img 
                src={EMULATOR_ICON}
                alt="Universal Emulator" 
                className="h-6 mr-2" 
              />
              <h2 className="text-lg font-bold">Universal Emulator</h2>
            </div>
            <div className="flex items-center space-x-2">
              {/* Canvas controls */}
              <button 
                className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
                onClick={() => setZoom(Math.min(3, zoom * 1.2))}
                title="Zoom In"
              >
                <ZoomIn size={18} />
              </button>
              <button 
                className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
                onClick={() => setZoom(Math.max(0.1, zoom * 0.8))}
                title="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>
              <button 
                className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
                title="Reset View"
              >
                <Move size={18} />
              </button>
              <span className="text-xs">{Math.round(zoom * 100)}%</span>
              
              {/* Component controls */}
              <button 
                className="bg-gray-700 p-1 rounded hover:bg-gray-600 opacity-50 cursor-not-allowed text-xs"
                title="Rotate Selected Component"
                disabled={true}
              >
                <RotateCcw size={18} />
              </button>
              <button 
                className="bg-gray-700 p-1 rounded hover:bg-gray-600 opacity-50 cursor-not-allowed text-xs"
                title="Delete Selected Item"
                disabled={true}
              >
                <Trash2 size={18} />
              </button>
              
              {/* Project controls */}
              <div className="w-px h-6 bg-gray-600 mx-2"></div>
              <EmulatorControls />
              
              {/* Close button */}
              <button 
                onClick={onClose}
                className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 ml-4"
                title="Close Universal Emulator"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Component Palette */}
            <div className="w-64 bg-gray-900 border-r border-gray-700">
              <div className="p-2 border-b border-gray-700">
                <h3 className="text-sm font-bold">Components</h3>
              </div>
              <div className="overflow-auto p-2 h-full">
                <ComponentPalette onAddComponent={() => {}} />
              </div>
            </div>
            
            {/* Main Circuit Canvas */}
            <div className="flex-1 bg-gray-900 overflow-hidden relative">
              <CircuitBuilder />
            </div>
          </div>
          
          {/* Bottom Code Editor */}
          <div className="h-1/3 bg-gray-800 border-t border-gray-700 flex flex-col">
            <div className="p-2 bg-gray-900 text-sm font-bold border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <FileCode size={16} className="mr-2 text-blue-400" />
                <span>Arduino Code</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className={`px-2 py-1 rounded text-xs flex items-center ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={toggleSimulation}
                >
                  <Play size={14} className="mr-1" />
                  <span>{isSimulationRunning ? 'Stop Simulation' : 'Run Simulation'}</span>
                </button>
                <button className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs flex items-center">
                  <Save size={14} className="mr-1" />
                  <span>Save Code</span>
                </button>
                
                <div className="relative">
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs flex items-center"
                    onClick={() => setShowExampleDropdown(!showExampleDropdown)}
                  >
                    <Download size={14} className="mr-1" />
                    <span>Load Example</span>
                  </button>
                  
                  {showExampleDropdown && (
                    <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
                      <div className="py-1">
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-700">
                          Blink Example
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-700">
                          OLED Display Example
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-gray-700">
                          RGB LED Example
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor />
            </div>
          </div>
        </div>
      </EmulatorProvider>
    </AppWindow>
  );
}

// Desktop app metadata for the CraftingTable OS
export const metadata = {
  name: "Universal Emulator",
  description: "Emulate Arduino hardware with real-time circuit simulation",
  icon: EMULATOR_ICON
};