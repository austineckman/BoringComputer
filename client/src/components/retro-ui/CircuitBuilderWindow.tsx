import React, { useState, useRef, useEffect } from 'react';
import { Trash2, RotateCw, Grid, ZoomIn, ZoomOut, Move } from 'lucide-react';

// Circuit Components Types
interface Position {
  x: number;
  y: number;
}

interface CircuitComponent {
  id: string;
  type: 'battery' | 'wire' | 'led' | 'resistor' | 'breadboard';
  position: Position;
  rotation: number; // 0, 90, 180, 270 degrees
  width: number;
  height: number;
}

interface ComponentDefinition {
  type: 'battery' | 'wire' | 'led' | 'resistor' | 'breadboard';
  label: string;
  width: number;
  height: number;
  color: string;
  icon: string; // SVG or Unicode character representation
}

const GRID_SIZE = 20;

// Component definitions
const componentDefinitions: Record<string, ComponentDefinition> = {
  battery: {
    type: 'battery',
    label: 'Battery',
    width: 3 * GRID_SIZE,
    height: 2 * GRID_SIZE,
    color: '#FFD700',
    icon: '⚡'
  },
  wire: {
    type: 'wire',
    label: 'Wire',
    width: 2 * GRID_SIZE,
    height: GRID_SIZE / 2,
    color: '#FF4500',
    icon: '〰️'
  },
  led: {
    type: 'led',
    label: 'LED',
    width: 1.5 * GRID_SIZE,
    height: 1.5 * GRID_SIZE,
    color: '#00FF00',
    icon: '💡'
  },
  resistor: {
    type: 'resistor',
    label: 'Resistor',
    width: 2 * GRID_SIZE,
    height: GRID_SIZE,
    color: '#964B00',
    icon: '⊡'
  },
  breadboard: {
    type: 'breadboard',
    label: 'Breadboard',
    width: 6 * GRID_SIZE,
    height: 4 * GRID_SIZE,
    color: '#FFFFFF',
    icon: '▭'
  }
};

const CircuitBuilderWindow: React.FC = () => {
  // State for the circuit components on the canvas
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  
  // State for canvas transform
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  
  // State for drag operations
  const [draggedComponent, setDraggedComponent] = useState<CircuitComponent | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  
  // Canvas ref for dimension calculations
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Helper function to create a new component
  const createComponent = (type: 'battery' | 'wire' | 'led' | 'resistor' | 'breadboard', position: Position): CircuitComponent => {
    const definition = componentDefinitions[type];
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      position,
      rotation: 0,
      width: definition.width,
      height: definition.height
    };
  };
  
  // Helper function to snap position to grid
  const snapToGrid = (position: Position): Position => {
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    };
  };

  // Handle starting to drag a component from the palette
  const handleStartDragFromPalette = (e: React.MouseEvent, type: 'battery' | 'wire' | 'led' | 'resistor' | 'breadboard') => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const initialPosition = {
      x: e.clientX - rect.left - pan.x,
      y: e.clientY - rect.top - pan.y
    };
    
    const newComponent = createComponent(type, initialPosition);
    setDraggedComponent(newComponent);
    setIsDragging(true);
    setDragOffset({
      x: componentDefinitions[type].width / 2,
      y: componentDefinitions[type].height / 2
    });
  };

  // Handle starting to drag an existing component on the canvas
  const handleStartDragExisting = (e: React.MouseEvent, component: CircuitComponent) => {
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    setDraggedComponent(component);
    setIsDragging(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mousePos = {
      x: e.clientX - rect.left - pan.x,
      y: e.clientY - rect.top - pan.y
    };
    
    setDragOffset({
      x: mousePos.x - component.position.x,
      y: mousePos.y - component.position.y
    });
  };

  // Handle mouse movement during dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Handle panning
    if (isPanning) {
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
      
      return;
    }
    
    // Handle component dragging
    if (isDragging && draggedComponent) {
      const mousePos = {
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom
      };
      
      const newPosition = {
        x: mousePos.x - dragOffset.x,
        y: mousePos.y - dragOffset.y
      };
      
      const snappedPosition = snapToGrid(newPosition);
      
      setDraggedComponent({
        ...draggedComponent,
        position: snappedPosition
      });
    }
  };

  // Handle ending dragging
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (isDragging && draggedComponent) {
      // Check if we're dragging an existing component or a new one
      const existingComponentIndex = components.findIndex(c => c.id === draggedComponent.id);
      
      if (existingComponentIndex >= 0) {
        // Update existing component
        const updatedComponents = [...components];
        updatedComponents[existingComponentIndex] = draggedComponent;
        setComponents(updatedComponents);
      } else {
        // Add new component
        setComponents([...components, draggedComponent]);
      }
      
      setIsDragging(false);
      setDraggedComponent(null);
    }
  };

  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start panning with middle mouse button or when holding space
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  // Handle zooming with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));
    
    setZoom(newZoom);
  };

  // Handle component rotation
  const rotateComponent = (id: string) => {
    setComponents(components.map(component => {
      if (component.id === id) {
        return {
          ...component,
          rotation: (component.rotation + 90) % 360
        };
      }
      return component;
    }));
  };

  // Handle component deletion
  const deleteComponent = (id: string) => {
    setComponents(components.filter(component => component.id !== id));
  };

  // Handle keyboard events (for delete key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && draggedComponent) {
        deleteComponent(draggedComponent.id);
        setIsDragging(false);
        setDraggedComponent(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draggedComponent]);

  return (
    <div className="circuit-builder h-full flex flex-col">
      <div className="toolbar flex justify-between items-center bg-gray-800 text-white p-2 border-b border-gray-700">
        <div className="left-tools flex space-x-2">
          <button 
            className="tool-btn p-1 hover:bg-gray-700 rounded" 
            title="Pan Canvas"
          >
            <Move size={16} />
          </button>
          <button 
            className="tool-btn p-1 hover:bg-gray-700 rounded" 
            title="Zoom In"
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
          >
            <ZoomIn size={16} />
          </button>
          <button 
            className="tool-btn p-1 hover:bg-gray-700 rounded" 
            title="Zoom Out"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          >
            <ZoomOut size={16} />
          </button>
          <button 
            className="tool-btn p-1 hover:bg-gray-700 rounded" 
            title="Toggle Grid"
          >
            <Grid size={16} />
          </button>
        </div>
        <div className="center-tools">
          <span className="text-xs">Circuit Builder</span>
        </div>
        <div className="right-tools flex space-x-2">
          <button 
            className="tool-btn p-1 hover:bg-gray-700 rounded" 
            title="Reset Canvas"
            onClick={() => {
              setPan({ x: 0, y: 0 });
              setZoom(1);
            }}
          >
            <RotateCw size={16} />
          </button>
          <button 
            className="tool-btn p-1 hover:bg-red-700 rounded" 
            title="Clear All Components"
            onClick={() => setComponents([])}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex">
        {/* Component Palette */}
        <div className="component-palette w-16 bg-gray-700 flex flex-col items-center py-2 overflow-y-auto">
          {Object.entries(componentDefinitions).map(([key, component]) => (
            <div 
              key={key}
              className="component-item mb-3 w-12 h-12 flex flex-col items-center justify-center cursor-grab"
              onMouseDown={(e) => handleStartDragFromPalette(e, component.type)}
            >
              <div 
                className="icon-container w-10 h-10 flex items-center justify-center rounded border border-gray-600 hover:border-blue-500"
                style={{ backgroundColor: component.color }}
              >
                <span className="text-xl">{component.icon}</span>
              </div>
              <span className="text-white text-xs mt-1">{component.label}</span>
            </div>
          ))}
        </div>
        
        {/* Circuit Canvas */}
        <div 
          className="circuit-canvas flex-grow bg-gray-900 relative overflow-hidden"
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Grid Lines */}
          <div 
            className="grid-container absolute pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: '2000px',
              height: '2000px',
              backgroundImage: `
                linear-gradient(to right, rgba(50, 50, 50, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(50, 50, 50, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              transformOrigin: '0 0',
            }}
          >
            {/* Main Grid Lines */}
            <div 
              className="main-grid-lines pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `
                  linear-gradient(to right, rgba(100, 100, 100, 0.2) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(100, 100, 100, 0.2) 1px, transparent 1px)
                `,
                backgroundSize: `${GRID_SIZE * 5}px ${GRID_SIZE * 5}px`,
              }}
            />
          </div>
          
          {/* Rendered Components */}
          <div 
            className="components-container absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {components.map(component => (
              <div
                key={component.id}
                className="circuit-component absolute select-none cursor-move flex items-center justify-center"
                style={{
                  left: `${component.position.x}px`,
                  top: `${component.position.y}px`,
                  width: `${component.width}px`,
                  height: `${component.height}px`,
                  backgroundColor: componentDefinitions[component.type].color,
                  transform: `rotate(${component.rotation}deg)`,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  zIndex: draggedComponent?.id === component.id ? 100 : 10,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
                onMouseDown={(e) => handleStartDragExisting(e, component)}
              >
                <span className="text-center text-2xl pointer-events-none">
                  {componentDefinitions[component.type].icon}
                </span>
                
                {/* Component Controls (visible on hover) */}
                <div className="component-controls absolute -top-6 left-0 right-0 flex justify-center space-x-1 opacity-0 hover:opacity-100 transition-opacity">
                  <button 
                    className="rotate-btn p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      rotateComponent(component.id);
                    }}
                  >
                    <RotateCw size={12} />
                  </button>
                  <button 
                    className="delete-btn p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteComponent(component.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Currently Dragged Component Preview */}
            {isDragging && draggedComponent && (
              <div
                className="circuit-component absolute select-none flex items-center justify-center"
                style={{
                  left: `${draggedComponent.position.x}px`,
                  top: `${draggedComponent.position.y}px`,
                  width: `${draggedComponent.width}px`,
                  height: `${draggedComponent.height}px`,
                  backgroundColor: componentDefinitions[draggedComponent.type].color,
                  transform: `rotate(${draggedComponent.rotation}deg)`,
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  borderRadius: '4px',
                  zIndex: 100,
                  opacity: 0.8,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                }}
              >
                <span className="text-center text-2xl pointer-events-none">
                  {componentDefinitions[draggedComponent.type].icon}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="status-bar bg-gray-800 text-white py-1 px-2 text-xs flex justify-between border-t border-gray-700">
        <div>Zoom: {Math.round(zoom * 100)}%</div>
        <div>Grid: {GRID_SIZE}px</div>
        <div>Components: {components.length}</div>
      </div>
    </div>
  );
};

export default CircuitBuilderWindow;