import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Trash2, ZoomIn, ZoomOut, Move, Play, Save, FileCode } from 'lucide-react';
import ace from 'ace-builds';

// Import our new CircuitBuilder component
import CircuitBuilder from '../circuit-builder/CircuitBuilder';

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
  const defaultCode = `// CircuitBuilder Arduino Code
  
void setup() {
  // Initialize pins
  pinMode(13, OUTPUT);
}

void loop() {
  // Blink the LED on pin 13
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`;
  
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

  // Simulate running the code (placeholder)
  const runSimulation = () => {
    alert('Simulation started! (This is a placeholder - in a real app, this would run the simulation)');
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <img 
            src="/images/circuit-builder-logo.svg" 
            alt="buildr.exe" 
            className="h-6 mr-2" 
          />
          <h2 className="text-lg font-bold">Circuit Builder</h2>
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
            className="bg-green-600 p-1 rounded hover:bg-green-700 text-xs"
            onClick={runSimulation}
            title="Run Simulation"
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
            title="Close Circuit Builder"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* New Enhanced Circuit Builder */}
        <div className="flex-1 bg-gray-900 overflow-hidden relative">
          <CircuitBuilder />
        </div>

        {/* Code Editor */}
        <div className="w-2/5 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-2 bg-gray-900 text-sm font-bold border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <FileCode size={16} className="mr-2 text-blue-400" />
              <span>Arduino Code</span>
            </div>
          </div>
          <textarea 
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full h-full bg-gray-900 text-gray-100 p-4 text-sm resize-none outline-none border-none font-mono"
            style={{ fontSize: '14px' }}
            spellCheck="false"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilderWindow;