/**
 * UniversalEmulatorApp.tsx
 * 
 * This is the main component for the Universal Emulator application.
 * It integrates our HeroEmulator with the circuit builder interface,
 * creating a standalone application that can be used in fullscreen mode.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Play, Square, Save, FileCode, Download } from 'lucide-react';
import { CircuitComponentPalette } from './CircuitComponentPalette';
import { ArduinoCodeEditor } from './ArduinoCodeEditor';
import { CircuitBuilder } from './CircuitBuilder';
import RealAVR8EmulatorConnector from './RealAVR8EmulatorConnector';
import EmulatedLEDComponent from './EmulatedLEDComponent';
import { EmulatedComponent } from './HeroEmulator';

// Define the emulated components on the window for global access
declare global {
  interface Window {
    emulatedComponents?: Record<string, EmulatedComponent>;
  }
}

// Default Arduino sketch for new projects
const DEFAULT_SKETCH = `// Universal Emulator - Arduino Sketch
void setup() {
  // Initialize pins
  pinMode(13, OUTPUT); // Built-in LED
  
  // Initialize serial communication
  Serial.begin(9600);
  Serial.println("HERO board initialized");
}

void loop() {
  // Blink the built-in LED
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
  
  // Print a message to the serial monitor
  Serial.println("Hello from HERO board!");
}`;

interface UniversalEmulatorAppProps {
  onClose: () => void;
  isFullscreen?: boolean;
}

/**
 * UniversalEmulatorApp Component
 * 
 * This component provides the full Universal Emulator application interface.
 */
const UniversalEmulatorApp: React.FC<UniversalEmulatorAppProps> = ({
  onClose,
  isFullscreen = true,
}) => {
  // State for the Arduino code
  const [code, setCode] = useState(DEFAULT_SKETCH);
  
  // State for circuit components
  const [components, setComponents] = useState<any[]>([]);
  
  // State for wires
  const [wires, setWires] = useState<any[]>([]);
  
  // State for simulation control
  const [isRunning, setIsRunning] = useState(false);
  
  // State for simulation logs
  const [logs, setLogs] = useState<string[]>([]);
  
  // State for serial output
  const [serialOutput, setSerialOutput] = useState('');
  
  // Debug state to track pin changes from the emulator
  const [debugPins, setDebugPins] = useState<Record<string, boolean>>({});
  
  // State for zoom level (1 = 100%)
  const [zoom, setZoom] = useState(1);
  
  // Add a log message
  const addLog = useCallback((message: string) => {
    setLogs(prevLogs => [...prevLogs, message]);
  }, []);
  
  // Clear all logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  // Toggle simulation
  const toggleSimulation = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  // Handle pin change events from the emulator
  const handlePinChange = useCallback((pin: string | number, isHigh: boolean, options?: any) => {
    const pinStr = pin.toString();
    addLog(`Pin ${pinStr} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
    
    // Update our debug pins state
    setDebugPins(prev => ({
      ...prev,
      [pinStr]: isHigh
    }));
    
    // For pin 13 (built-in LED), provide special debug info
    if (pinStr === '13') {
      console.log(`🔌 HERO Board LED (Pin 13) changed to ${isHigh ? 'ON' : 'OFF'}`);
      addLog(`📌 Built-in LED on pin 13 is now ${isHigh ? 'ON' : 'OFF'}`);
    }
    
    // For any analog values, show them too
    if (options && options.analogValue !== undefined) {
      console.log(`🔌 Pin ${pinStr} analog value: ${options.analogValue}`);
      addLog(`📊 Pin ${pinStr} analog value: ${options.analogValue}`);
    }
    
    // Update component states based on pin changes
    // For example, turning on/off LEDs connected to specific pins
  }, [addLog]);
  
  // Handle serial data from the emulator
  const handleSerialData = useCallback((value: number, char: string) => {
    setSerialOutput(prev => prev + char);
  }, []);
  
  // Handle errors from the emulator
  const handleError = useCallback((message: string) => {
    addLog(`Error: ${message}`);
  }, [addLog]);
  
  // Add a component to the circuit
  const handleAddComponent = useCallback((componentType: string, x: number, y: number) => {
    // Create a new component based on the type
    const newComponent = {
      id: `${componentType}-${Date.now()}`,
      type: componentType,
      x,
      y,
      // Add other component-specific properties
    };
    
    setComponents(prev => [...prev, newComponent]);
  }, []);
  
  // Reset zoom to 100%
  const resetZoom = useCallback(() => {
    setZoom(1);
  }, []);
  
  // Increase zoom by 10%
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);
  
  // Decrease zoom by 10%
  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);
  
  // Save the current project
  const saveProject = useCallback(() => {
    // TODO: Implement save functionality
    addLog('Project saved');
  }, [addLog]);
  
  // Export the current code
  const exportCode = useCallback(() => {
    // Create a download link for the code
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'arduino_sketch.ino';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    addLog('Code exported to arduino_sketch.ino');
  }, [code, addLog]);
  
  // Render the Universal Emulator App
  return (
    <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
      {/* Top toolbar */}
      <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <h2 className="text-lg font-bold mr-4">Universal Emulator</h2>
          
          <div className="flex space-x-2">
            {/* Simulation controls */}
            <button
              onClick={toggleSimulation}
              className={`px-2 py-1 rounded flex items-center ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
              title={isRunning ? 'Stop Simulation' : 'Start Simulation'}
            >
              {isRunning ? <Square size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
              {isRunning ? 'Stop' : 'Run'}
            </button>
            
            {/* Zoom controls */}
            <button
              onClick={zoomOut}
              className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            
            <button
              onClick={resetZoom}
              className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
              title="Reset Zoom"
            >
              <span className="text-xs font-mono">{Math.round(zoom * 100)}%</span>
            </button>
            
            <button
              onClick={zoomIn}
              className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {/* Project controls */}
          <button
            onClick={saveProject}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            title="Save Project"
          >
            <Save size={16} />
          </button>
          
          <button
            onClick={exportCode}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
            title="Export Code"
          >
            <FileCode size={16} />
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Component palette */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 overflow-auto">
          <div className="p-2 border-b border-gray-700">
            <h3 className="text-sm font-bold">Components</h3>
          </div>
          <div className="p-2">
            <CircuitComponentPalette 
              onAddComponent={(type) => {
                // Get default position at center of canvas
                const x = window.innerWidth / 2;
                const y = window.innerHeight / 3;
                handleAddComponent(type, x, y);
              }} 
            />
          </div>
        </div>
        
        {/* Main circuit canvas */}
        <CircuitBuilder
          components={components}
          wires={wires}
          onComponentMove={(componentId, x, y) => {
            setComponents(prev => 
              prev.map(c => c.id === componentId ? { ...c, x, y } : c)
            );
          }}
          onComponentSelect={(componentId) => {
            // Handle component selection
            console.log(`Selected component: ${componentId}`);
          }}
          onWireCreate={(wire) => {
            // Create a new wire
            const newWire = {
              id: `wire-${Date.now()}`,
              sourcePinId: wire.sourcePinId || '',
              targetPinId: wire.targetPinId || '',
              sourceComponentId: wire.sourceComponentId || '',
              targetComponentId: wire.targetComponentId || '',
              points: wire.points || []
            };
            
            setWires(prev => [...prev, newWire]);
          }}
          onWireDelete={(wireId) => {
            // Delete a wire
            setWires(prev => prev.filter(w => w.id !== wireId));
          }}
          onDeleteComponent={(componentId) => {
            // Delete a component
            setComponents(prev => prev.filter(c => c.id !== componentId));
            
            // Also delete any wires connected to this component
            setWires(prev => 
              prev.filter(w => 
                w.sourceComponentId !== componentId && 
                w.targetComponentId !== componentId
              )
            );
          }}
          zoom={zoom}
        />
        
        {/* Right sidebar - Logs and Serial Output */}
        <div className="w-64 bg-gray-900 border-l border-gray-700 overflow-hidden flex flex-col">
          {/* Logs */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-bold">Logs</h3>
              <button
                onClick={clearLogs}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {logs.map((log, index) => (
                <div key={index} className="text-xs mb-1 font-mono">
                  {log}
                </div>
              ))}
              
              {/* Debug Pin States */}
              {Object.keys(debugPins).length > 0 && (
                <div className="mt-4 p-2 bg-gray-800 rounded border border-gray-700">
                  <div className="font-bold mb-1 text-white">Active Pin States:</div>
                  {Object.entries(debugPins).map(([pin, isHigh]) => (
                    <div key={pin} className={`flex items-center mb-1 ${isHigh ? 'text-green-400' : 'text-red-400'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${isHigh ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      Pin {pin}: {isHigh ? 'HIGH' : 'LOW'}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Serial Output */}
          <div className="h-1/3 overflow-hidden flex flex-col border-t border-gray-700">
            <div className="p-2 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-sm font-bold">Serial Monitor</h3>
              <button
                onClick={() => setSerialOutput('')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-black font-mono text-xs">
              {serialOutput}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom code editor */}
      <div className="h-1/3 bg-gray-800 border-t border-gray-700">
        <ArduinoCodeEditor
          code={code}
          onChange={setCode}
          isRunning={isRunning}
        />
      </div>
      
      {/* Real AVR8 Emulator connector - invisible but handles the emulation */}
      <RealAVR8EmulatorConnector
        code={code}
        isRunning={isRunning}
        onSerialData={handleSerialData}
        onLogMessage={addLog}
        onEmulationError={handleError}
        onPinStateChange={handlePinChange}
        components={Object.fromEntries(
          Object.entries(window.emulatedComponents || {})
            .filter(([id, _]) => 
              components.some(c => c.id === id)
            )
        )}
      />
    </div>
  );
};

export default UniversalEmulatorApp;