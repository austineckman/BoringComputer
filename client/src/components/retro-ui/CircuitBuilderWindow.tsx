import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Trash2, ZoomIn, ZoomOut, Move, Play, Save, FileCode } from 'lucide-react';
import ace from 'ace-builds';

// Import our CircuitBuilder component
import CircuitBuilder from '../circuit-builder/CircuitBuilder';

// Import simulator components
import { SimulatorProvider, useSimulator } from '../circuit-builder/simulator/SimulatorContext';
import AVR8Simulator from '../circuit-builder/simulator/AVR8Simulator';
import SimulationLogPanel from '../circuit-builder/simulator/SimulationLogPanel';
import SimulationVisualizer from '../circuit-builder/simulator/SimulationVisualizer';
import { defaultSketch } from '../circuit-builder/simulator/SimulatorUtils';

// Legacy imports (keeping for compatibility with existing code)
import { 
  componentOptions, 
  createComponent, 
  renderComponent, 
  ComponentData 
} from '../circuit-builder/ComponentGenerator';
import CircuitWire from '../circuit-builder/CircuitWire';
import CircuitPin from '../circuit-builder/CircuitPin';

// Define the PinPosition interface
interface PinPosition {
  id: string;
  x: number;
  y: number;
}

// Types for wire connections
interface WireConnection {
  id: string;
  startPin: PinPosition;
  endPin: PinPosition;
  color: string;
}

interface CircuitBuilderWindowProps {
  onClose: () => void;
}

const CircuitBuilderWindow: React.FC<CircuitBuilderWindowProps> = ({ onClose }) => {
  // State for components and wires
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [wires, setWires] = useState<WireConnection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // State for creating a wire
  const [wireCreationMode, setWireCreationMode] = useState(false);
  const [wireStartPin, setWireStartPin] = useState<PinPosition | null>(null);
  const [wireEndPin, setWireEndPin] = useState<PinPosition | null>(null);
  const [tempWirePosition, setTempWirePosition] = useState<{ x: number; y: number } | null>(null);
  
  // Canvas view state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Code editor state
  const [editorReady, setEditorReady] = useState(false);
  
  // Default Arduino code for new projects
  const defaultCode = `// This example blinks an LED connected to pin 13 (or the built-in LED)
// This is a great first test for your Arduino setup!

void setup() {
  // Initialize digital pin LED_BUILTIN (usually pin 13) as an output
  pinMode(LED_BUILTIN, OUTPUT);
  
  // Add more pin initializations here if needed
  // For example: pinMode(10, OUTPUT); // for another LED
}

void loop() {
  // Turn the LED on
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);  // Wait for 1 second (1000 milliseconds)
  
  // Turn the LED off
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);  // Wait for 1 second
  
  // The loop repeats indefinitely
}

/* 
  Common Arduino functions:
  
  - digitalWrite(pin, value): Sets a digital pin to HIGH or LOW
  - digitalRead(pin): Reads a digital pin, returns HIGH or LOW
  - analogWrite(pin, value): Sets an analog value (PWM) on a pin (0-255)
  - analogRead(pin): Reads an analog input, returns 0-1023
  - delay(ms): Pauses program execution for 'ms' milliseconds
  - millis(): Returns time since program started in milliseconds
*/`;
  
  // References
  const canvasRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const gridSize = 20; // Size of grid squares in pixels

  // Simple editor for now
  useEffect(() => {
    setEditorReady(true);
  }, []);

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Add a new component to the canvas
  const addComponent = (componentName: string) => {
    // Default position in the center of visible canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    let centerX = 0;
    let centerY = 0;
    
    if (canvasRect) {
      centerX = (canvasRect.width / 2 - pan.x) / zoom;
      centerY = (canvasRect.height / 2 - pan.y) / zoom;
    }
    
    const newComponent = createComponent(componentName);
    
    // Update position to be centered in the current view
    newComponent.attrs.left = Math.round(centerX / gridSize) * gridSize;
    newComponent.attrs.top = Math.round(centerY / gridSize) * gridSize;
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
    setSelectedWire(null);
  };

  // Delete the selected component or wire
  const deleteSelectedItem = () => {
    if (selectedComponent) {
      // Remove the component
      setComponents(components.filter(c => c.id !== selectedComponent));
      
      // Also remove any wires connected to this component
      const updatedWires = wires.filter(wire => 
        !wire.startPin.id.startsWith(`${selectedComponent}-`) && 
        !wire.endPin.id.startsWith(`${selectedComponent}-`)
      );
      setWires(updatedWires);
      setSelectedComponent(null);
    } else if (selectedWire) {
      // Remove the wire
      setWires(wires.filter(w => w.id !== selectedWire));
      setSelectedWire(null);
    }
  };

  // Rotate the selected component
  const rotateSelectedComponent = () => {
    if (selectedComponent) {
      setComponents(components.map(c => {
        if (c.id === selectedComponent) {
          return {
            ...c,
            attrs: {
              ...c.attrs,
              rotate: (c.attrs.rotate + 90) % 360
            }
          };
        }
        return c;
      }));
    }
  };

  // Handle component mouse down event for dragging
  const handleComponentMouseDown = (id: string, isActive: boolean) => {
    if (!isActive) return;
    
    setSelectedComponent(id);
    setSelectedWire(null);
    
    const component = components.find(c => c.id === id);
    if (!component) return;
    
    setDraggingComponent(id);
    setDragOffset({ x: 10, y: 10 }); // Offset from top-left corner
  };

  // Handle mouse move for dragging components
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingComponent) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // Calculate new position
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      const left = Math.round(((mouseX - dragOffset.x) / zoom - pan.x) / gridSize) * gridSize;
      const top = Math.round(((mouseY - dragOffset.y) / zoom - pan.y) / gridSize) * gridSize;
      
      setComponents(components.map(c => {
        if (c.id === draggingComponent) {
          return { 
            ...c, 
            attrs: {
              ...c.attrs,
              left,
              top
            } 
          };
        }
        return c;
      }));
    } else if (isPanning) {
      // Handle canvas panning
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      
      setPan({
        x: pan.x + dx,
        y: pan.y + dy
      });
      
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    } else if (wireCreationMode && wireStartPin) {
      // Show wire while dragging
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        setTempWirePosition({
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top
        });
      }
    }
  };

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setDraggingComponent(null);
    setIsPanning(false);
    
    // Clear temporary wire if we're not connecting to a pin
    if (wireCreationMode && !wireEndPin) {
      setWireCreationMode(false);
      setWireStartPin(null);
      setTempWirePosition(null);
    }
  };

  // Handle mouse down on the canvas for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Clear any selection when clicking on the canvas
    if (!wireCreationMode) {
      setSelectedComponent(null);
      setSelectedWire(null);
    }
    
    // Only start panning if the middle mouse button (wheel) is pressed or 
    // if holding the spacebar and using left click
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
      e.preventDefault();
    }
  };

  // Handle wheel for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Get the cursor position relative to the canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;
    
    // Calculate the point on the canvas under the cursor before zooming
    const pointXBeforeZoom = mouseX / zoom - pan.x;
    const pointYBeforeZoom = mouseY / zoom - pan.y;
    
    // Adjust zoom based on wheel direction
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * zoomDelta));
    
    // Calculate the point after zooming
    const pointXAfterZoom = mouseX / newZoom - pan.x;
    const pointYAfterZoom = mouseY / newZoom - pan.y;
    
    // Adjust pan to keep the point under the cursor
    const panXDelta = pointXAfterZoom - pointXBeforeZoom;
    const panYDelta = pointYAfterZoom - pointYBeforeZoom;
    
    setZoom(newZoom);
    setPan({
      x: pan.x + panXDelta,
      y: pan.y + panYDelta
    });
  };

  // Key handler for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedItem();
      } else if (e.key === 'r') {
        rotateSelectedComponent();
      } else if (e.key === 'Escape') {
        // Cancel wire creation mode
        if (wireCreationMode) {
          setWireCreationMode(false);
          setWireStartPin(null);
          setTempWirePosition(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedWire, wireCreationMode, wireStartPin]);

  // Handle pin click for wire creation
  const handlePinClick = (pinId: string) => {
    if (!wireCreationMode) {
      // Start wire creation
      setWireCreationMode(true);
      
      // Get the pin element position
      const pinElement = document.getElementById(pinId);
      if (pinElement) {
        const pinRect = pinElement.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Calculate pin position relative to canvas
          const pinX = (pinRect.left + pinRect.width/2 - canvasRect.left) / zoom - pan.x;
          const pinY = (pinRect.top + pinRect.height/2 - canvasRect.top) / zoom - pan.y;
          
          const startPin: PinPosition = {
            id: pinId,
            x: pinX,
            y: pinY,
          };
          
          setWireStartPin(startPin);
        }
      }
    } else if (wireStartPin && wireStartPin.id !== pinId) {
      // Complete wire creation
      // Get the pin element position
      const pinElement = document.getElementById(pinId);
      if (pinElement) {
        const pinRect = pinElement.getBoundingClientRect();
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        
        if (canvasRect) {
          // Calculate pin position relative to canvas
          const pinX = (pinRect.left + pinRect.width/2 - canvasRect.left) / zoom - pan.x;
          const pinY = (pinRect.top + pinRect.height/2 - canvasRect.top) / zoom - pan.y;
          
          const endPin: PinPosition = {
            id: pinId,
            x: pinX,
            y: pinY,
          };
          
          // Create a new wire with appropriate color based on the pin types
          const [startCompId, startPinName] = wireStartPin.id.split('-', 2);
          const [endCompId, endPinName] = pinId.split('-', 2);
          
          // Determine wire color based on pin type
          let wireColor = '#3b82f6'; // Default blue
          
          if (startPinName && endPinName) {
            // Power connections
            if (startPinName.includes('5v') || startPinName.includes('3v3') || 
                endPinName.includes('5v') || endPinName.includes('3v3')) {
              wireColor = '#ff6666'; // Red for power
            }
            // Ground connections
            else if (startPinName.includes('gnd') || endPinName.includes('gnd')) {
              wireColor = '#aaaaaa'; // Gray for ground
            }
            // Digital pin connections
            else if ((startPinName.startsWith('d') || endPinName.startsWith('d')) && 
                    !isNaN(parseInt(startPinName.substring(1), 10)) || 
                    !isNaN(parseInt(endPinName.substring(1), 10))) {
              wireColor = '#66ffff'; // Cyan for digital
            }
            // Analog pin connections
            else if ((startPinName.startsWith('a') || endPinName.startsWith('a')) && 
                    !isNaN(parseInt(startPinName.substring(1), 10)) || 
                    !isNaN(parseInt(endPinName.substring(1), 10))) {
              wireColor = '#ffcc66'; // Orange for analog
            }
          }
          
          // Create a new wire
          const newWire: WireConnection = {
            id: generateId(),
            startPin: wireStartPin,
            endPin: endPin,
            color: wireColor
          };
          
          setWires([...wires, newWire]);
          
          // Reset wire creation mode
          setWireCreationMode(false);
          setWireStartPin(null);
          setTempWirePosition(null);
        }
      }
    }
  };

  // Handle wire click
  const handleWireClick = (wireId: string) => {
    setSelectedWire(wireId);
    setSelectedComponent(null);
  };

  // Get code from the editor (simple textarea for now)
  const [code, setCode] = useState(defaultCode);
  
  const getCode = () => {
    return code;
  };

  // Save the current project
  const saveProject = () => {
    const projectData = {
      components,
      wires,
      code: getCode()
    };
    
    // In a real app, you'd save this to a database or file
    console.log('Saving project:', projectData);
    
    // For now, just show an alert
    alert('Project saved! (This is a placeholder - in a real app, this would save to the database)');
  };

  // Simulation state - using the simulator context instead of local state
  
  // Import simulator context
  const { 
    isSimulationRunning, 
    startSimulation, 
    stopSimulation, 
    compileAndRun,
    addLog: addSimulatorLog,
    logs: simulatorLogs
  } = useSimulator();
  
  // Run the simulation
  const runSimulation = () => {
    if (isSimulationRunning) {
      // Stop the simulation
      stopSimulation();
    } else {
      // Get current connections from the wires
      const connections = {};
      
      // Process each wire to build connection map
      wires.forEach(wire => {
        // Extract pin information
        const sourceParts = wire.startPin.id.split('-');
        const targetParts = wire.endPin.id.split('-');
        
        // Format in the way our simulator expects
        // For heroboard pins, use the standard pin designation (D12, A0, etc.)
        if (sourceParts[0] === 'heroboard') {
          const pinKey = sourceParts[sourceParts.length - 1];
          if (!connections[pinKey]) {
            connections[pinKey] = [];
          }
          connections[pinKey].push(`${targetParts[0]}:${targetParts[targetParts.length - 1]}`);
        }
        else if (targetParts[0] === 'heroboard') {
          const pinKey = targetParts[targetParts.length - 1];
          if (!connections[pinKey]) {
            connections[pinKey] = [];
          }
          connections[pinKey].push(`${sourceParts[0]}:${sourceParts[sourceParts.length - 1]}`);
        }
      });
      
      // Compile the code and start the simulation if successful
      const code = getCode();
      if (compileAndRun(code, components, connections)) {
        // If compilation was successful, start the simulation
        startSimulation();
      }
    }
  };
  
  // Add a log entry with timestamp
  const addSimulationLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSimulationLogs(prev => [...prev, { timestamp, message }]);
    console.log(`[Simulator] ${message}`);
  };

  return (
    <SimulatorProvider>
      <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
        {/* Toolbar */}
        <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <img 
              src="/@fs/home/runner/workspace/attached_assets/led.icon.png" 
              alt="Sandbox" 
              className="h-6 mr-2" 
            />
            <h2 className="text-lg font-bold">Sandbox</h2>
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
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
              title="Reset View"
            >
              <Move size={18} />
            </button>
            <span className="text-xs">{Math.round(zoom * 100)}%</span>
            
            {/* Component controls */}
            <button 
              className={`p-1 rounded text-xs ${selectedComponent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600 opacity-50 cursor-not-allowed'}`}
              onClick={rotateSelectedComponent}
              disabled={!selectedComponent}
              title="Rotate Selected Component"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              className={`p-1 rounded text-xs ${selectedComponent || selectedWire ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600 opacity-50 cursor-not-allowed'}`}
              onClick={deleteSelectedItem}
              disabled={!selectedComponent && !selectedWire}
              title="Delete Selected Item"
            >
              <Trash2 size={18} />
            </button>
            
            {/* Project controls */}
            <div className="w-px h-6 bg-gray-600 mx-2"></div>
            <button 
              className={`p-1 rounded text-xs ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={runSimulation}
              title={isSimulationRunning ? "Stop Simulation" : "Run Simulation"}
            >
              <Play size={18} />
            </button>
            <button 
              className="bg-blue-600 p-1 rounded hover:bg-blue-700 text-xs"
              onClick={saveProject}
              title="Save Project"
            >
              <Save size={18} />
            </button>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 ml-4"
              title="Close Sandbox"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Sandbox Component */}
          <div className="w-full bg-gray-900 overflow-hidden relative">
            <CircuitBuilder />
            
            {/* Simulation overlay - hidden in the UI but active when simulation is running */}
            <AVR8Simulator 
              code={code}
              isRunning={isSimulationRunning}
              onPinChange={(pinOrComponent, isHigh) => {
                // Handle pin change events from the simulator
                if (typeof pinOrComponent === 'number') {
                  // This is a pin change event
                  const pin = pinOrComponent;
                  console.log(`Simulator: Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
                  // Standard pin change
                  addSimulationLog(`Pin ${pin} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
                } else if (typeof pinOrComponent === 'object' && pinOrComponent.componentId) {
                  // This is a component state update
                  const { componentId, ...state } = pinOrComponent;
                  console.log(`Simulator: Component ${componentId} state updated`, state);
                  
                  // Find the component and update its state in the simulator context
                  addSimulationLog(`Updated component ${componentId}`);
                }
              }}
              components={components}
              wires={wires}
              onLog={addSimulationLog}
            />
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
                onClick={runSimulation}
              >
                <Play size={14} className="mr-1" />
                <span>{isSimulationRunning ? 'Stop Simulation' : 'Run Simulation'}</span>
              </button>
              <button className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs flex items-center">
                <Save size={14} className="mr-1" />
                <span>Save Code</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col">
            <textarea 
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-gray-900 text-gray-100 p-4 text-sm resize-none outline-none border-none font-mono"
              style={{ fontSize: '14px' }}
              spellCheck="false"
            ></textarea>
            
            {/* Simulation Log Panel */}
            <div className="h-32 overflow-y-auto bg-gray-800 border-t border-gray-700">
              <div className="p-2 text-xs text-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">Simulation Logs</h3>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500' : 'bg-red-500'} mr-1`}></div>
                    <span>{isSimulationRunning ? 'Running' : 'Stopped'}</span>
                  </div>
                </div>
                
                <div className="font-mono h-20 overflow-y-auto">
                  {simulationLogs.length === 0 ? (
                    <div className="text-gray-500 italic">No simulation logs yet</div>
                  ) : (
                    simulationLogs.map((log, index) => (
                      <div key={index} className="text-xs mb-1">
                        <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                        <span>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimulatorProvider>
  );
};

export default CircuitBuilderWindow;