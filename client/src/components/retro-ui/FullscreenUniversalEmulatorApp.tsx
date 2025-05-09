import React from 'react';
import { X, ZoomIn, ZoomOut, Move, RotateCcw, Trash2, Play, Save, FileCode, Download } from 'lucide-react';
import { EmulatorProvider } from '../desktop/emulator/EmulatorContext';
import { CodeEditor } from '../desktop/emulator/CodeEditor';
import { CircuitBuilder } from '../desktop/emulator/CircuitBuilder';
import { ComponentPalette } from '../desktop/emulator/components/ComponentPalette';

interface FullscreenUniversalEmulatorAppProps {
  onClose: () => void;
}

/**
 * Fullscreen Universal Emulator App
 * This component creates a fullscreen version of the Universal Emulator
 * with a layout matching the Sandbox application
 */
const FullscreenUniversalEmulatorApp: React.FC<FullscreenUniversalEmulatorAppProps> = ({ onClose }) => {
  // UI state
  const [zoom, setZoom] = React.useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = React.useState(false);
  const [showExampleDropdown, setShowExampleDropdown] = React.useState(false);
  const [code, setCode] = React.useState(`// This example blinks an LED connected to pin 13 (or the built-in LED)
// This is a great first test for your Arduino setup!

void setup() {
  // Initialize digital pin LED_BUILTIN as an output
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);  // Turn the LED on
  delay(1000);                      // Wait for a second
  digitalWrite(LED_BUILTIN, LOW);   // Turn the LED off
  delay(1000);                      // Wait for a second
}`);

  // Toggle simulation
  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 z-50 flex flex-col text-white overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <img 
            src="/@fs/home/runner/workspace/attached_assets/led.icon.png" 
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
          <button 
            className={`p-1 rounded text-xs ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            onClick={toggleSimulation}
            title={isSimulationRunning ? "Stop Simulation" : "Run Simulation"}
          >
            <Play size={18} />
          </button>
          <button 
            className="bg-blue-600 p-1 rounded hover:bg-blue-700 text-xs"
            title="Save Project"
          >
            <Save size={18} />
          </button>
          
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
            <EmulatorProvider instanceId="fullscreen-universal-emulator">
              <ComponentPalette onAddComponent={() => {}} />
            </EmulatorProvider>
          </div>
        </div>
        
        {/* Main Circuit Canvas */}
        <div className="flex-1 bg-gray-900 overflow-hidden relative">
          <EmulatorProvider instanceId="fullscreen-universal-emulator">
            <CircuitBuilder />
          </EmulatorProvider>
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
          <EmulatorProvider instanceId="fullscreen-universal-emulator">
            <CodeEditor initialCode={code} onChange={setCode} />
          </EmulatorProvider>
        </div>
      </div>
    </div>
  );
};

export default FullscreenUniversalEmulatorApp;