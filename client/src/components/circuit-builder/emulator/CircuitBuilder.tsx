import React, { useState, useRef, useEffect } from 'react';

interface ComponentData {
  id: string;
  type: string;
  x: number;
  y: number;
  props: Record<string, any>;
}

interface WireData {
  id: string;
  sourcePinId: string;
  targetPinId: string;
  sourceComponentId: string;
  targetComponentId: string;
  points: { x: number; y: number }[];
}

interface CircuitBuilderProps {
  components: ComponentData[];
  wires: WireData[];
  onComponentMove?: (componentId: string, x: number, y: number) => void;
  onComponentSelect?: (componentId: string | null) => void;
  onWireCreate?: (wire: Partial<WireData>) => void;
  onWireDelete?: (wireId: string) => void;
  onDeleteComponent?: (componentId: string) => void;
  zoom?: number;
}

/**
 * Circuit Builder Component
 * 
 * This component renders the circuit canvas where components and wires are displayed
 * and can be interacted with.
 */
export function CircuitBuilder({
  components = [],
  wires = [],
  onComponentMove,
  onComponentSelect,
  onWireCreate,
  onWireDelete,
  onDeleteComponent,
  zoom = 1
}: CircuitBuilderProps) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State to force component updates
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // Listen for component state change events
  useEffect(() => {
    const handleComponentStateChange = (event: any) => {
      // Force a re-render when component states change
      setUpdateTrigger(prev => prev + 1);
      console.log(`CircuitBuilder received component state change for: ${event.detail?.componentId}`);
    };
    
    // Add event listener
    document.addEventListener('component-state-changed', handleComponentStateChange);
    
    // Clean up
    return () => {
      document.removeEventListener('component-state-changed', handleComponentStateChange);
    };
  }, []);
  
  // State for dragging components
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // State for drawing wires
  const [drawingWire, setDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState<{ 
    pinId: string; 
    componentId: string; 
    x: number; 
    y: number 
  } | null>(null);
  
  // State for selected component
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  
  // Handle component selection
  const handleComponentSelect = (componentId: string) => {
    const newSelected = selectedComponent === componentId ? null : componentId;
    setSelectedComponent(newSelected);
    if (onComponentSelect) {
      onComponentSelect(newSelected);
    }
  };
  
  // Handle component mouse down (start dragging)
  const handleComponentMouseDown = (
    e: React.MouseEvent, 
    componentId: string
  ) => {
    e.stopPropagation();
    
    // Find the component
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    // Set dragging state
    setDraggingComponent(componentId);
    
    // Calculate offset to maintain relative position
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // Select the component
    handleComponentSelect(componentId);
  };
  
  // Handle canvas mouse move (dragging component or drawing wire)
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingComponent) {
      // Get canvas position
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;
      
      // Calculate new position
      const x = e.clientX - canvasRect.left - dragOffset.x;
      const y = e.clientY - canvasRect.top - dragOffset.y;
      
      // Move the component
      if (onComponentMove) {
        onComponentMove(draggingComponent, x, y);
      }
    }
  };
  
  // Handle mouse up (stop dragging or finish drawing wire)
  const handleCanvasMouseUp = () => {
    // Stop dragging
    if (draggingComponent) {
      setDraggingComponent(null);
    }
  };
  
  // Handle pin click (start or end wire drawing)
  const handlePinClick = (
    pinId: string, 
    componentId: string, 
    x: number, 
    y: number
  ) => {
    if (!drawingWire) {
      // Start drawing a wire
      setDrawingWire(true);
      setWireStart({ pinId, componentId, x, y });
    } else if (wireStart) {
      // Finish drawing a wire
      if (wireStart.pinId !== pinId && wireStart.componentId !== componentId) {
        // Create wire data
        const newWire = {
          sourcePinId: wireStart.pinId,
          targetPinId: pinId,
          sourceComponentId: wireStart.componentId,
          targetComponentId: componentId,
          points: [
            { x: wireStart.x, y: wireStart.y },
            { x, y }
          ]
        };
        
        // Call the wire create callback
        if (onWireCreate) {
          onWireCreate(newWire);
        }
      }
      
      // Reset wire drawing state
      setDrawingWire(false);
      setWireStart(null);
    }
  };
  
  // Render a component based on its type
  const renderComponent = (component: ComponentData) => {
    switch (component.type) {
      case 'led':
        return (
          <div 
            key={component.id}
            style={{ 
              position: 'absolute', 
              left: component.x, 
              top: component.y,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: 'move'
            }}
            onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
            className={`component ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`}
            data-component-id={component.id}
          >
            <div 
              className="w-8 h-8 rounded-full border-2"
              style={{ 
                backgroundColor: component.props.color || 'red',
                borderColor: '#333'
              }}
            />
          </div>
        );
      
      case 'heroboard':
        // For now, render a placeholder for the HERO board
        return (
          <div 
            key={component.id}
            style={{ 
              position: 'absolute', 
              left: component.x, 
              top: component.y,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: 'move'
            }}
            onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
            className={`component ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`}
            data-component-id={component.id}
          >
            <div 
              className="bg-blue-900 rounded-md p-2 border border-blue-700"
              style={{ width: '200px', height: '120px' }}
            >
              <div className="text-xs text-white font-bold mb-1">HERO Board</div>
              <div className="flex flex-wrap justify-around">
                {/* Render pins as small circles */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div 
                    key={`pin-${i}`}
                    className="w-3 h-3 bg-yellow-500 rounded-full m-1"
                    onClick={() => handlePinClick(`pin-${i}`, component.id, component.x + 10 + i * 5, component.y + 10)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        // For other components, render a placeholder
        return (
          <div 
            key={component.id}
            style={{ 
              position: 'absolute', 
              left: component.x, 
              top: component.y,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              cursor: 'move'
            }}
            onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
            className={`component ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`}
            data-component-id={component.id}
          >
            <div 
              className="bg-gray-700 rounded-md p-2"
              style={{ width: '80px', height: '80px' }}
            >
              <div className="text-xs text-white">{component.type}</div>
            </div>
          </div>
        );
    }
  };
  
  // Render a wire
  const renderWire = (wire: WireData) => {
    // For simplicity, render a straight line between first and last point
    const start = wire.points[0];
    const end = wire.points[wire.points.length - 1];
    
    return (
      <svg
        key={wire.id}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#aaaaaa"
          strokeWidth="2"
        />
      </svg>
    );
  };
  
  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-gray-800 overflow-auto"
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onClick={() => {
        // Deselect component if clicking on empty canvas
        if (selectedComponent && onComponentSelect) {
          setSelectedComponent(null);
          onComponentSelect(null);
        }
      }}
    >
      {/* Render grid for reference */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: 'center center'
        }}
      />
      
      {/* Render components */}
      {components.map(renderComponent)}
      
      {/* Render wires */}
      {wires.map(renderWire)}
      
      {/* Render wire being drawn */}
      {drawingWire && wireStart && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        >
          <line
            x1={wireStart.x}
            y1={wireStart.y}
            x2={wireStart.x}
            y2={wireStart.y}
            stroke="#ffff00"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </svg>
      )}
    </div>
  );
}