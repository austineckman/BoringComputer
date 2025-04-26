import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Trash2, ZoomIn, ZoomOut, Move } from 'lucide-react';

// Circuit component types
type ComponentType = 'battery' | 'wire' | 'led' | 'resistor' | 'breadboard';

interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number; // in degrees
  width: number;
  height: number;
}

interface CircuitBuilderWindowProps {
  onClose: () => void;
}

const CircuitBuilderWindow: React.FC<CircuitBuilderWindowProps> = ({ onClose }) => {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [code, setCode] = useState('// Write your Arduino code here\n\nvoid setup() {\n  // Initialize components\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  // Main program loop\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridSize = 20; // Size of grid squares in pixels

  // Component palette items
  const paletteItems: { type: ComponentType; name: string; color: string; width: number; height: number }[] = [
    { type: 'battery', name: 'Battery', color: '#FF5722', width: 3, height: 2 },
    { type: 'wire', name: 'Wire', color: '#2196F3', width: 1, height: 1 },
    { type: 'led', name: 'LED', color: '#4CAF50', width: 1, height: 1 },
    { type: 'resistor', name: 'Resistor', color: '#9C27B0', width: 2, height: 1 },
    { type: 'breadboard', name: 'Breadboard', color: '#795548', width: 6, height: 4 }
  ];

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  // Add a new component to the canvas
  const addComponent = (type: ComponentType) => {
    // Default position in the center of visible canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    let centerX = 0;
    let centerY = 0;
    
    if (canvasRect) {
      centerX = (canvasRect.width / 2 - pan.x) / zoom;
      centerY = (canvasRect.height / 2 - pan.y) / zoom;
    }
    
    const paletteItem = paletteItems.find(item => item.type === type);
    if (!paletteItem) return;
    
    const newComponent: CircuitComponent = {
      id: generateId(),
      type,
      x: Math.round(centerX / gridSize) * gridSize,
      y: Math.round(centerY / gridSize) * gridSize,
      rotation: 0,
      width: paletteItem.width * gridSize,
      height: paletteItem.height * gridSize
    };
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent.id);
  };

  // Delete the selected component
  const deleteSelectedComponent = () => {
    if (selectedComponent) {
      setComponents(components.filter(c => c.id !== selectedComponent));
      setSelectedComponent(null);
    }
  };

  // Rotate the selected component
  const rotateSelectedComponent = () => {
    if (selectedComponent) {
      setComponents(components.map(c => {
        if (c.id === selectedComponent) {
          return { ...c, rotation: (c.rotation + 90) % 360 };
        }
        return c;
      }));
    }
  };

  // Handle mouse down on a component
  const handleComponentMouseDown = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    setSelectedComponent(componentId);
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    // Calculate offset from the mouse to the component's top-left corner
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggingComponent(componentId);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  // Handle mouse move for dragging components
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingComponent) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // Calculate new position
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      
      const x = Math.round(((mouseX - dragOffset.x) / zoom - pan.x) / gridSize) * gridSize;
      const y = Math.round(((mouseY - dragOffset.y) / zoom - pan.y) / gridSize) * gridSize;
      
      setComponents(components.map(c => {
        if (c.id === draggingComponent) {
          return { ...c, x, y };
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
    }
  };

  // Handle mouse up to stop dragging
  const handleCanvasMouseUp = () => {
    setDraggingComponent(null);
    setIsPanning(false);
  };

  // Handle mouse down on the canvas for panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start panning if the middle mouse button (wheel) is pressed or if holding the spacebar
    if (e.button === 1 || e.button === 0) {
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
        deleteSelectedComponent();
      } else if (e.key === 'r') {
        rotateSelectedComponent();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, components]);

  // Render component based on its type
  const renderComponent = (component: CircuitComponent) => {
    const paletteItem = paletteItems.find(item => item.type === component.type);
    if (!paletteItem) return null;
    
    const isSelected = component.id === selectedComponent;
    
    return (
      <div
        key={component.id}
        className={`absolute rounded-md cursor-move transition-shadow ${isSelected ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
        style={{
          left: `${component.x}px`,
          top: `${component.y}px`,
          width: `${component.width}px`,
          height: `${component.height}px`,
          backgroundColor: paletteItem.color,
          transform: `rotate(${component.rotation}deg)`,
          zIndex: isSelected ? 10 : 1,
          transition: 'transform 0.2s ease'
        }}
        onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
      >
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
          {paletteItem.name}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-gray-800 text-white overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-900 p-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-bold">Circuit Builder</h2>
        </div>
        <div className="flex items-center space-x-2">
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
          <button 
            className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-xs"
            onClick={rotateSelectedComponent}
            disabled={!selectedComponent}
            title="Rotate Selected Component"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            className="bg-red-700 p-1 rounded hover:bg-red-600 text-xs"
            onClick={deleteSelectedComponent}
            disabled={!selectedComponent}
            title="Delete Selected Component"
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 ml-4"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Component Palette */}
        <div className="w-40 bg-gray-700 p-2 flex flex-col space-y-2 overflow-y-auto">
          <h3 className="text-sm font-bold mb-2">Components</h3>
          {paletteItems.map((item) => (
            <div
              key={item.type}
              className="bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => addComponent(item.type)}
            >
              <div
                className="mx-auto mb-1 rounded"
                style={{
                  width: `${Math.min(32, item.width * 10)}px`,
                  height: `${Math.min(32, item.height * 10)}px`,
                  backgroundColor: item.color
                }}
              ></div>
              <div className="text-xs text-center">{item.name}</div>
            </div>
          ))}
          <div className="text-xs mt-4 p-2 bg-gray-800 rounded">
            <p>Drag components onto the grid.</p>
            <p className="mt-2">Rotate: Right-click or press 'R'</p>
            <p className="mt-1">Delete: Delete key</p>
            <p className="mt-1">Pan: Middle-click drag</p>
            <p className="mt-1">Zoom: Scroll wheel</p>
          </div>
        </div>

        {/* Circuit Canvas */}
        <div 
          className="flex-1 bg-gray-900 overflow-hidden relative"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
          ref={canvasRef}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
              backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '0 0',
              scale: `${zoom}`
            }}
          >
            {components.map(renderComponent)}
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-2/5 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-2 bg-gray-900 text-sm font-bold border-b border-gray-700">
            Code Editor
          </div>
          <textarea
            className="flex-1 bg-gray-800 text-green-400 p-4 font-mono text-sm resize-none outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CircuitBuilderWindow;