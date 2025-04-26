import React, { useState, useRef, useEffect } from 'react';
import { Trash2, RotateCw, Grid, ZoomIn, ZoomOut, Move, PlayCircle, AlertCircle, Zap, Code } from 'lucide-react';
import { ReactSVG } from 'react-svg';
import CodeEditorModal from './CodeEditorModal';

// Circuit Components Types
interface Position {
  x: number;
  y: number;
}

// Connection point interface
interface ConnectionPoint {
  id: string;
  type: 'input' | 'output' | 'both'; // Whether this is an input, output, or both
  position: Position; // Relative to component
  parentId: string; // ID of the component it belongs to
  pinName?: string; // Name of the pin (for microcontroller pins)
}

// Wire interface
interface Wire {
  id: string;
  startPointId: string; // ID of the connection point where wire starts
  endPointId: string; // ID of the connection point where wire ends
  startPosition: Position; // Absolute position
  endPosition: Position; // Absolute position
  color: string; // Wire color - can be used for indication (red for power, black for ground)
}

type ComponentType = 'battery' | 'led' | 'resistor' | 'breadboard' | 'switch' | 'potentiometer' | 'capacitor' | 'microcontroller';

interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number; // 0, 90, 180, 270 degrees
  width: number;
  height: number;
  connectionPoints: ConnectionPoint[]; // Added connection points
  isEnergized?: boolean; // Whether the component has power flowing through it
  hasProblem?: boolean; // Whether there's an issue with this component in the circuit
  // For microcontroller
  pinStates?: Record<string, 'HIGH' | 'LOW'>; // Digital pin states for microcontroller
  code?: string; // User's code for the microcontroller
}

interface ComponentDefinition {
  type: ComponentType;
  label: string;
  width: number;
  height: number;
  color: string;
  icon: string; // Unicode character representation (fallback)
  svgPath: string; // Path to SVG file
  connectionPoints: Array<{
    type: 'input' | 'output' | 'both';
    position: Position; // Relative to component (0,0 is top-left)
    pinName?: string; // Pin name for microcontroller (e.g., "GP0", "GP1", etc.)
  }>;
}

const GRID_SIZE = 20;
const CONNECTION_POINT_RADIUS = 4;

// Component definitions
const componentDefinitions: Record<string, ComponentDefinition> = {
  microcontroller: {
    type: 'microcontroller',
    label: 'Pico W',
    width: 160,
    height: 100,
    color: '#1e88e5',
    icon: '🔌',
    svgPath: '/images/components/microcontroller.svg',
    connectionPoints: [
      // Left side pins (GP0-GP5, GND)
      { type: 'both', position: { x: 5, y: 17 }, pinName: 'GP0' },
      { type: 'both', position: { x: 5, y: 27 }, pinName: 'GP1' },
      { type: 'both', position: { x: 5, y: 37 }, pinName: 'GP2' },
      { type: 'both', position: { x: 5, y: 47 }, pinName: 'GP3' },
      { type: 'both', position: { x: 5, y: 57 }, pinName: 'GP4' },
      { type: 'both', position: { x: 5, y: 67 }, pinName: 'GP5' },
      { type: 'both', position: { x: 5, y: 77 }, pinName: 'GND' },
      
      // Right side pins (GP6-GP11, VSYS)
      { type: 'both', position: { x: 155, y: 17 }, pinName: 'GP6' },
      { type: 'both', position: { x: 155, y: 27 }, pinName: 'GP7' },
      { type: 'both', position: { x: 155, y: 37 }, pinName: 'GP8' },
      { type: 'both', position: { x: 155, y: 47 }, pinName: 'GP9' },
      { type: 'both', position: { x: 155, y: 57 }, pinName: 'GP10' },
      { type: 'both', position: { x: 155, y: 67 }, pinName: 'GP11' },
      { type: 'both', position: { x: 155, y: 77 }, pinName: 'VSYS' }
    ]
  },
  battery: {
    type: 'battery',
    label: 'Battery',
    width: 40,
    height: 60,
    color: '#f0f0f0',
    icon: '⚡',
    svgPath: '/images/components/battery.svg',
    connectionPoints: [
      // Positive terminal (top)
      { type: 'output', position: { x: 20, y: 0 } },
      // Negative terminal (bottom)
      { type: 'output', position: { x: 20, y: 60 } }
    ]
  },
  // Wire has been removed as a component - now using wire drawing tool
  led: {
    type: 'led',
    label: 'LED',
    width: 40,
    height: 42,
    color: '#e0e0e0',
    icon: '💡',
    svgPath: '/images/components/led.svg',
    connectionPoints: [
      // Anode (positive, left leg)
      { type: 'input', position: { x: 15, y: 42 } },
      // Cathode (negative, right leg)
      { type: 'input', position: { x: 25, y: 42 } }
    ]
  },
  resistor: {
    type: 'resistor',
    label: 'Resistor',
    width: 60,
    height: 20,
    color: '#d2d2b4',
    icon: '⊡',
    svgPath: '/images/components/resistor.svg',
    connectionPoints: [
      // Left terminal
      { type: 'both', position: { x: 0, y: 10 } },
      // Right terminal
      { type: 'both', position: { x: 60, y: 10 } }
    ]
  },
  capacitor: {
    type: 'capacitor',
    label: 'Capacitor',
    width: 60,
    height: 30,
    color: '#e0e0e0',
    icon: '⌶',
    svgPath: '/images/components/capacitor.svg',
    connectionPoints: [
      // Left terminal
      { type: 'both', position: { x: 0, y: 15 } },
      // Right terminal
      { type: 'both', position: { x: 60, y: 15 } }
    ]
  },
  switch: {
    type: 'switch',
    label: 'Switch',
    width: 60,
    height: 40,
    color: '#e0e0e0',
    icon: '⚙',
    svgPath: '/images/components/switch.svg',
    connectionPoints: [
      // Left terminal
      { type: 'both', position: { x: 0, y: 20 } },
      // Right terminal
      { type: 'both', position: { x: 60, y: 20 } }
    ]
  },
  potentiometer: {
    type: 'potentiometer',
    label: 'Potentiometer',
    width: 60,
    height: 50,
    color: '#c0c0c0',
    icon: '◉',
    svgPath: '/images/components/potentiometer.svg',
    connectionPoints: [
      // Left terminal
      { type: 'both', position: { x: 0, y: 25 } },
      // Right terminal
      { type: 'both', position: { x: 60, y: 25 } },
      // Wiper terminal (bottom)
      { type: 'both', position: { x: 30, y: 50 } }
    ]
  },
  breadboard: {
    type: 'breadboard',
    label: 'Breadboard',
    width: 120,
    height: 80,
    color: '#FFFFFF',
    icon: '▭',
    svgPath: '/images/components/breadboard.svg',
    connectionPoints: [
      // Top power rail (5 points)
      { type: 'both', position: { x: 10, y: 10 } },
      { type: 'both', position: { x: 30, y: 10 } },
      { type: 'both', position: { x: 50, y: 10 } },
      { type: 'both', position: { x: 70, y: 10 } },
      { type: 'both', position: { x: 90, y: 10 } },
      { type: 'both', position: { x: 110, y: 10 } },
      
      // Bottom power rail (5 points)
      { type: 'both', position: { x: 10, y: 70 } },
      { type: 'both', position: { x: 30, y: 70 } },
      { type: 'both', position: { x: 50, y: 70 } },
      { type: 'both', position: { x: 70, y: 70 } },
      { type: 'both', position: { x: 90, y: 70 } },
      { type: 'both', position: { x: 110, y: 70 } },
      
      // Top central connection points (row 1)
      { type: 'both', position: { x: 10, y: 25 } },
      { type: 'both', position: { x: 20, y: 25 } },
      { type: 'both', position: { x: 30, y: 25 } },
      { type: 'both', position: { x: 40, y: 25 } },
      { type: 'both', position: { x: 50, y: 25 } },
      { type: 'both', position: { x: 60, y: 25 } },
      { type: 'both', position: { x: 70, y: 25 } },
      { type: 'both', position: { x: 80, y: 25 } },
      { type: 'both', position: { x: 90, y: 25 } },
      { type: 'both', position: { x: 100, y: 25 } },
      { type: 'both', position: { x: 110, y: 25 } },
      
      // Top central connection points (row 2)
      { type: 'both', position: { x: 10, y: 35 } },
      { type: 'both', position: { x: 20, y: 35 } },
      { type: 'both', position: { x: 30, y: 35 } },
      { type: 'both', position: { x: 40, y: 35 } },
      { type: 'both', position: { x: 50, y: 35 } },
      { type: 'both', position: { x: 60, y: 35 } },
      { type: 'both', position: { x: 70, y: 35 } },
      { type: 'both', position: { x: 80, y: 35 } },
      { type: 'both', position: { x: 90, y: 35 } },
      { type: 'both', position: { x: 100, y: 35 } },
      { type: 'both', position: { x: 110, y: 35 } },
      
      // Bottom central connection points (row 1)
      { type: 'both', position: { x: 10, y: 47 } },
      { type: 'both', position: { x: 20, y: 47 } },
      { type: 'both', position: { x: 30, y: 47 } },
      { type: 'both', position: { x: 40, y: 47 } },
      { type: 'both', position: { x: 50, y: 47 } },
      { type: 'both', position: { x: 60, y: 47 } },
      { type: 'both', position: { x: 70, y: 47 } },
      { type: 'both', position: { x: 80, y: 47 } },
      { type: 'both', position: { x: 90, y: 47 } },
      { type: 'both', position: { x: 100, y: 47 } },
      { type: 'both', position: { x: 110, y: 47 } },
      
      // Bottom central connection points (row 2)
      { type: 'both', position: { x: 10, y: 57 } },
      { type: 'both', position: { x: 20, y: 57 } },
      { type: 'both', position: { x: 30, y: 57 } },
      { type: 'both', position: { x: 40, y: 57 } },
      { type: 'both', position: { x: 50, y: 57 } },
      { type: 'both', position: { x: 60, y: 57 } },
      { type: 'both', position: { x: 70, y: 57 } },
      { type: 'both', position: { x: 80, y: 57 } },
      { type: 'both', position: { x: 90, y: 57 } },
      { type: 'both', position: { x: 100, y: 57 } },
      { type: 'both', position: { x: 110, y: 57 } }
    ]
  }
};

const CircuitBuilderWindow: React.FC = () => {
  // State for the circuit components on the canvas
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  
  // State for simulation
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);
  const [energizedComponentIds, setEnergizedComponentIds] = useState<Set<string>>(new Set());
  const [problemComponentIds, setProblemComponentIds] = useState<Set<string>>(new Set());
  
  // State for wires in the circuit
  const [wires, setWires] = useState<Wire[]>([]);
  
  // State for wire drawing
  const [isDrawingWire, setIsDrawingWire] = useState<boolean>(false);
  const [wireStartPoint, setWireStartPoint] = useState<ConnectionPoint | null>(null);
  const [wireEndPosition, setWireEndPosition] = useState<Position | null>(null);
  const [highlightedPoint, setHighlightedPoint] = useState<ConnectionPoint | null>(null);
  
  // State for canvas transform
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  
  // State for drag operations
  const [draggedComponent, setDraggedComponent] = useState<CircuitComponent | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  
  // State for code editor
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [selectedMicrocontroller, setSelectedMicrocontroller] = useState<CircuitComponent | null>(null);
  
  // Canvas ref for dimension calculations
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Helper function to create a new component with connection points
  const createComponent = (type: ComponentType, position: Position): CircuitComponent => {
    // Make sure the type exists in componentDefinitions
    if (!componentDefinitions[type]) {
      console.error(`Component type "${type}" is not defined`);
      // Return a default component as fallback (battery)
      return createComponent('battery', position);
    }
    
    const definition = componentDefinitions[type];
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Create connection points for the component
    const connectionPoints = definition.connectionPoints.map((cpDef, index) => {
      return {
        id: `${id}-cp-${index}`,
        type: cpDef.type,
        position: cpDef.position,
        parentId: id,
        pinName: cpDef.pinName
      };
    });
    
    // Create component with type-specific properties
    let component: CircuitComponent = {
      id,
      type,
      position,
      rotation: 0,
      width: definition.width,
      height: definition.height,
      connectionPoints
    };
    
    // Add microcontroller-specific properties
    if (type === 'microcontroller') {
      component.code = `# MicroPython code for Pico W
from machine import Pin
import time

# Example: Blink the onboard LED
led = Pin(25, Pin.OUT)

while True:
    led.on()
    time.sleep(0.5)
    led.off()
    time.sleep(0.5)
`;
      
      // Initialize all pins to LOW by default
      const pinStates: Record<string, 'HIGH' | 'LOW'> = {};
      connectionPoints.forEach(cp => {
        if (cp.pinName && cp.pinName !== 'GND' && cp.pinName !== 'VSYS') {
          pinStates[cp.pinName] = 'LOW';
        }
      });
      component.pinStates = pinStates;
    }
    
    return component;
  };
  
  // Helper function to snap position to grid
  const snapToGrid = (position: Position): Position => {
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    };
  };

  // Handle starting to drag a component from the palette
  const handleStartDragFromPalette = (e: React.MouseEvent, type: ComponentType) => {
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
    
    // Safely access componentDefinitions properties with a guard
    if (componentDefinitions[type]) {
      setDragOffset({
        x: componentDefinitions[type].width / 2,
        y: componentDefinitions[type].height / 2
      });
    } else {
      // Default offset
      setDragOffset({ x: 20, y: 20 });
    }
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

  // Helper function to get the absolute position of a connection point
  const getConnectionPointAbsolutePosition = (component: CircuitComponent, connectionPoint: ConnectionPoint): Position => {
    // Apply component rotation to the connection point
    let rotatedX = connectionPoint.position.x;
    let rotatedY = connectionPoint.position.y;
    
    const centerX = component.width / 2;
    const centerY = component.height / 2;
    
    if (component.rotation === 90) {
      rotatedX = component.height - connectionPoint.position.y;
      rotatedY = connectionPoint.position.x;
    } else if (component.rotation === 180) {
      rotatedX = component.width - connectionPoint.position.x;
      rotatedY = component.height - connectionPoint.position.y;
    } else if (component.rotation === 270) {
      rotatedX = connectionPoint.position.y;
      rotatedY = component.width - connectionPoint.position.x;
    }
    
    return {
      x: component.position.x + rotatedX,
      y: component.position.y + rotatedY
    };
  };
  
  // Find a connection point near a position
  const findNearbyConnectionPoint = (position: Position, excludePointId?: string): ConnectionPoint | null => {
    const maxDistance = 15; // Maximum distance in pixels to consider "nearby"
    let closestPoint: ConnectionPoint | null = null;
    let minDistance = maxDistance;
    
    components.forEach(component => {
      component.connectionPoints.forEach(point => {
        if (excludePointId && point.id === excludePointId) return;
        
        const pointPosition = getConnectionPointAbsolutePosition(component, point);
        const distance = Math.sqrt(
          Math.pow(position.x - pointPosition.x, 2) + 
          Math.pow(position.y - pointPosition.y, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = { ...point };
        }
      });
    });
    
    return closestPoint;
  };
  
  // Handle connection point click to start drawing a wire
  const handleConnectionPointClick = (e: React.MouseEvent, component: CircuitComponent, connectionPoint: ConnectionPoint) => {
    e.stopPropagation();
    
    if (isDrawingWire) {
      // We're already drawing a wire and clicked on a connection point - finish the wire
      if (wireStartPoint && wireStartPoint.id !== connectionPoint.id) {
        const startComponent = components.find(c => c.id === wireStartPoint.parentId);
        
        if (startComponent) {
          // Get absolute positions of both connection points
          const startPos = getConnectionPointAbsolutePosition(startComponent, wireStartPoint);
          const endPos = getConnectionPointAbsolutePosition(component, connectionPoint);
          
          // Check if wire types are compatible
          const isCompatible = (
            wireStartPoint.type === 'both' || 
            connectionPoint.type === 'both' ||
            (wireStartPoint.type === 'output' && connectionPoint.type === 'input') ||
            (wireStartPoint.type === 'input' && connectionPoint.type === 'output')
          );
          
          if (isCompatible) {
            // Create new wire and add it to the state
            const newWire: Wire = {
              id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              startPointId: wireStartPoint.id,
              endPointId: connectionPoint.id,
              startPosition: startPos,
              endPosition: endPos,
              color: '#888888' // Default gray color for now
            };
            
            setWires([...wires, newWire]);
          }
        }
      }
      
      // Reset wire drawing state whether successful or not
      setIsDrawingWire(false);
      setWireStartPoint(null);
      setWireEndPosition(null);
    } else {
      // Start drawing a new wire
      setIsDrawingWire(true);
      setWireStartPoint(connectionPoint);
      
      // Set initial end position to the same as start position
      const startPos = getConnectionPointAbsolutePosition(component, connectionPoint);
      setWireEndPosition(startPos);
    }
  };
  
  // Handle mouse movement during dragging or wire drawing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mousePos = {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
    
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
    
    // Handle wire drawing
    if (isDrawingWire) {
      setWireEndPosition(mousePos);
      
      // Find nearby connection point for snapping
      const nearbyPoint = findNearbyConnectionPoint(mousePos, wireStartPoint?.id);
      setHighlightedPoint(nearbyPoint);
      
      return;
    }
    
    // Handle component dragging
    if (isDragging && draggedComponent) {
      const newPosition = {
        x: mousePos.x - dragOffset.x,
        y: mousePos.y - dragOffset.y
      };
      
      const snappedPosition = snapToGrid(newPosition);
      
      setDraggedComponent({
        ...draggedComponent,
        position: snappedPosition
      });
      
      // Update wires connected to this component in real-time
      updateConnectedWires(draggedComponent.id, snappedPosition);
    }
  };

  // Update wires connected to a component that's being moved
  const updateConnectedWires = (componentId: string, newPosition: Position) => {
    // Find the component that's being moved
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    // Update all wires connected to this component
    const updatedWires = wires.map(wire => {
      let updatedWire = { ...wire };
      let needsUpdate = false;
      
      // Find the connection points this wire is connected to
      const startPoint = components.flatMap(c => c.connectionPoints).find(cp => cp.id === wire.startPointId);
      const endPoint = components.flatMap(c => c.connectionPoints).find(cp => cp.id === wire.endPointId);
      
      // If start point belongs to the moved component, update start position
      if (startPoint && startPoint.parentId === componentId) {
        const startComponent = { ...component, position: newPosition };
        updatedWire.startPosition = getConnectionPointAbsolutePosition(startComponent, startPoint);
        needsUpdate = true;
      }
      
      // If end point belongs to the moved component, update end position
      if (endPoint && endPoint.parentId === componentId) {
        const endComponent = { ...component, position: newPosition };
        updatedWire.endPosition = getConnectionPointAbsolutePosition(endComponent, endPoint);
        needsUpdate = true;
      }
      
      return needsUpdate ? updatedWire : wire;
    });
    
    setWires(updatedWires);
  };
  
  // Delete a wire
  const deleteWire = (wireId: string) => {
    setWires(wires.filter(wire => wire.id !== wireId));
  };
  
  // Handle ending dragging or wire drawing
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    
    if (isDrawingWire && wireStartPoint && wireEndPosition) {
      // If we're drawing a wire and released on a highlighted point, complete the wire
      if (highlightedPoint) {
        const startComponent = components.find(c => c.id === wireStartPoint.parentId);
        
        if (startComponent) {
          const endComponent = components.find(c => c.id === highlightedPoint.parentId);
          
          if (endComponent) {
            // Get absolute positions of both connection points
            const startPos = getConnectionPointAbsolutePosition(startComponent, wireStartPoint);
            const endPos = getConnectionPointAbsolutePosition(endComponent, highlightedPoint);
            
            // Check if wire types are compatible
            const isCompatible = (
              wireStartPoint.type === 'both' || 
              highlightedPoint.type === 'both' ||
              (wireStartPoint.type === 'output' && highlightedPoint.type === 'input') ||
              (wireStartPoint.type === 'input' && highlightedPoint.type === 'output')
            );
            
            if (isCompatible) {
              // Create new wire and add it to the state
              const newWire: Wire = {
                id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                startPointId: wireStartPoint.id,
                endPointId: highlightedPoint.id,
                startPosition: startPos,
                endPosition: endPos,
                color: '#888888' // Default gray color for now
              };
              
              setWires([...wires, newWire]);
            }
          }
        }
      }
      
      // Reset wire drawing state
      setIsDrawingWire(false);
      setWireStartPoint(null);
      setWireEndPosition(null);
      setHighlightedPoint(null);
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
        
        // Update connected wires' positions
        const finalWires = wires.map(wire => {
          let updatedWire = { ...wire };
          let needsUpdate = false;
          
          // Find the connection points this wire is connected to
          const startPoint = draggedComponent.connectionPoints.find(cp => cp.id === wire.startPointId);
          const endPoint = draggedComponent.connectionPoints.find(cp => cp.id === wire.endPointId);
          
          // If start point belongs to the moved component, update start position
          if (startPoint) {
            updatedWire.startPosition = getConnectionPointAbsolutePosition(draggedComponent, startPoint);
            needsUpdate = true;
          }
          
          // If end point belongs to the moved component, update end position
          if (endPoint) {
            updatedWire.endPosition = getConnectionPointAbsolutePosition(draggedComponent, endPoint);
            needsUpdate = true;
          }
          
          return needsUpdate ? updatedWire : wire;
        });
        
        setWires(finalWires);
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
    // Remove the component
    setComponents(components.filter(component => component.id !== id));
    
    // Find all connection points belonging to this component
    const componentToDelete = components.find(c => c.id === id);
    if (!componentToDelete) return;
    
    const pointIdsToRemove = componentToDelete.connectionPoints.map(cp => cp.id);
    
    // Remove all wires connected to this component
    setWires(wires.filter(wire => 
      !pointIdsToRemove.includes(wire.startPointId) && 
      !pointIdsToRemove.includes(wire.endPointId)
    ));
  };

  // Handle opening the code editor for a microcontroller
  const handleOpenCodeEditor = (component: CircuitComponent) => {
    if (component.type !== 'microcontroller') return;
    
    setSelectedMicrocontroller(component);
    setIsCodeEditorOpen(true);
  };
  
  // Handle saving code from the editor
  const handleSaveCode = (code: string) => {
    if (!selectedMicrocontroller) return;
    
    // Update the microcontroller's code
    const updatedComponents = components.map(comp => 
      comp.id === selectedMicrocontroller.id 
        ? { ...comp, code } 
        : comp
    );
    
    setComponents(updatedComponents);
    setIsCodeEditorOpen(false);
  };
  
  // Handle running microcontroller code
  const handleRunCode = (code: string) => {
    if (!selectedMicrocontroller) return;
    
    // Very simple code analysis for pin states
    const pinStates: Record<string, 'HIGH' | 'LOW'> = {...(selectedMicrocontroller.pinStates || {})};
    
    // Look for patterns like: pin = Pin(0, Pin.OUT) and pin.value(1) or pin.on()
    // This is a simple regex approach - a real implementation would use proper parsing
    const pinDefinitions = Array.from(code.matchAll(/(\w+)\s*=\s*Pin\((\d+)/g));
    const pinMap: Record<string, string> = {};
    
    // Map variable names to pin numbers
    pinDefinitions.forEach(match => {
      const [_, varName, pinNum] = match;
      pinMap[varName] = `GP${pinNum}`;
    });
    
    // Find HIGH settings (pin.value(1) or pin.on())
    const highPins = Array.from(code.matchAll(/(\w+)\.(?:value\(1\)|on\(\))/g));
    highPins.forEach(match => {
      const [_, varName] = match;
      if (pinMap[varName]) {
        pinStates[pinMap[varName]] = 'HIGH';
      }
    });
    
    // Find LOW settings (pin.value(0) or pin.off())
    const lowPins = Array.from(code.matchAll(/(\w+)\.(?:value\(0\)|off\(\))/g));
    lowPins.forEach(match => {
      const [_, varName] = match;
      if (pinMap[varName]) {
        pinStates[pinMap[varName]] = 'LOW';
      }
    });
    
    // Update the microcontroller with new pin states and code
    const updatedComponents = components.map(comp => 
      comp.id === selectedMicrocontroller.id 
        ? { ...comp, pinStates, code } 
        : comp
    );
    
    setComponents(updatedComponents);
    
    // Run simulation to update the circuit with new pin states
    setSelectedMicrocontroller(null);
    simulateCircuit();
  };

  // Circuit simulation function
  const simulateCircuit = () => {
    // Reset simulation state
    setIsSimulating(true);
    setSimulationStatus(null);
    const newEnergizedIds = new Set<string>();
    const newProblemIds = new Set<string>();
    
    // Find all power sources in the circuit (batteries and microcontrollers with HIGH pins)
    const batteries = components.filter(c => c.type === 'battery');
    const microcontrollers = components.filter(c => 
      c.type === 'microcontroller' && 
      c.pinStates && 
      Object.values(c.pinStates).includes('HIGH')
    );
    
    const powerSources = [...batteries, ...microcontrollers];
    
    if (powerSources.length === 0) {
      setSimulationStatus("No power source found. Add a battery or a microcontroller with HIGH pins to your circuit.");
      setIsSimulating(false);
      return;
    }
    
    // Set for tracking already visited components and connection points
    const visitedComponentIds = new Set<string>();
    const visitedConnectionPointIds = new Set<string>();
    
    // For each power source, trace the circuit
    let anyCircuitCompleted = false;
    
    // Process batteries
    batteries.forEach(battery => {
      // Find the positive terminal (first connection point is positive)
      const positiveTerminal = battery.connectionPoints[0];
      const negativeTerminal = battery.connectionPoints[1];
      
      // Mark battery as energized
      newEnergizedIds.add(battery.id);
      
      // Start tracing from positive terminal
      const circuitCompleted = traceCircuit(
        positiveTerminal, 
        negativeTerminal, 
        battery,
        visitedComponentIds,
        visitedConnectionPointIds,
        newEnergizedIds,
        newProblemIds
      );
      
      if (circuitCompleted) {
        anyCircuitCompleted = true;
      }
    });
    
    // Process microcontrollers
    microcontrollers.forEach(microcontroller => {
      // Mark microcontroller as energized
      newEnergizedIds.add(microcontroller.id);
      
      // Find connection points for pins that are set to HIGH
      const highPinPoints = microcontroller.connectionPoints.filter(cp => 
        cp.pinName && 
        microcontroller.pinStates && 
        microcontroller.pinStates[cp.pinName] === 'HIGH'
      );
      
      // Find ground connection points
      const groundPoints = microcontroller.connectionPoints.filter(cp => 
        cp.pinName === 'GND'
      );
      
      if (groundPoints.length === 0) {
        // No ground pin found
        setSimulationStatus("Microcontroller missing ground connection");
        return;
      }
      
      // Trace circuit from each HIGH pin to GND
      highPinPoints.forEach(highPin => {
        groundPoints.forEach(groundPin => {
          const circuitCompleted = traceCircuit(
            highPin,
            groundPin,
            microcontroller,
            visitedComponentIds,
            visitedConnectionPointIds,
            newEnergizedIds,
            newProblemIds
          );
          
          if (circuitCompleted) {
            anyCircuitCompleted = true;
          }
        });
      });
    });
    
    if (!anyCircuitCompleted) {
      setSimulationStatus("Open circuit detected. Check your connections.");
    } else {
      setSimulationStatus("Circuit successfully energized!");
    }
    
    // Update component states
    setEnergizedComponentIds(newEnergizedIds);
    setProblemComponentIds(newProblemIds);
    setIsSimulating(false);
  };
  
  // Trace circuit from a starting point to see if it completes a loop back to negative terminal
  const traceCircuit = (
    currentPoint: ConnectionPoint,
    targetPoint: ConnectionPoint,
    startComponent: CircuitComponent,
    visitedComponentIds: Set<string>,
    visitedConnectionPointIds: Set<string>,
    energizedIds: Set<string>,
    problemIds: Set<string>,
    depth = 0
  ): boolean => {
    // Prevent infinite recursion
    if (depth > 50) return false;
    
    // Mark this point as visited
    visitedConnectionPointIds.add(currentPoint.id);
    
    // If we've reached the target point, we've completed the circuit
    if (currentPoint.id === targetPoint.id) {
      return true;
    }
    
    // Find all wires connected to this point
    const connectedWires = wires.filter(w => 
      w.startPointId === currentPoint.id || w.endPointId === currentPoint.id
    );
    
    // If no connected wires, this is an open circuit
    if (connectedWires.length === 0) {
      // Find the component this connection point belongs to
      const component = components.find(c => c.id === currentPoint.parentId);
      if (component && component.id !== startComponent.id) {
        problemIds.add(component.id);
      }
      return false;
    }
    
    // Try each connected wire
    for (const wire of connectedWires) {
      // Determine the other end of the wire
      const otherPointId = wire.startPointId === currentPoint.id ? wire.endPointId : wire.startPointId;
      
      // Skip if we've already visited this point
      if (visitedConnectionPointIds.has(otherPointId)) continue;
      
      // Find the connection point at the other end
      const otherPoint = components.flatMap(c => c.connectionPoints).find(cp => cp.id === otherPointId);
      if (!otherPoint) continue;
      
      // Find the component this connection point belongs to
      const component = components.find(c => c.id === otherPoint.parentId);
      if (!component) continue;
      
      // Skip if we've already visited this component (except for the target/battery)
      if (visitedComponentIds.has(component.id) && component.id !== startComponent.id) continue;
      
      // Mark component as energized
      energizedIds.add(component.id);
      // Mark the wire as energized too
      energizedIds.add(wire.id);
      
      // Special case for LED - only allow current flow in the correct direction
      if (component.type === 'led') {
        const anodePoint = component.connectionPoints[0]; // Left leg of LED is anode (+)
        const cathodePoint = component.connectionPoints[1]; // Right leg of LED is cathode (-)
        
        // If current is flowing in the wrong direction through LED, mark as problem
        if (otherPoint.id === cathodePoint.id && currentPoint.parentId !== startComponent.id) {
          problemIds.add(component.id);
          continue; // Skip this path
        }
      }
      
      // Mark this component as visited
      visitedComponentIds.add(component.id);
      
      // Continue tracing from this point
      const completed = traceCircuit(
        otherPoint,
        targetPoint,
        startComponent,
        visitedComponentIds,
        visitedConnectionPointIds,
        energizedIds,
        problemIds,
        depth + 1
      );
      
      // If we completed the circuit, bubble up the success
      if (completed) return true;
    }
    
    // If we tried all paths and none completed the circuit, return false
    return false;
  };
  
  // Handle keyboard events (for delete key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete component with Delete key
      if (e.key === 'Delete' && draggedComponent) {
        deleteComponent(draggedComponent.id);
        setIsDragging(false);
        setDraggedComponent(null);
      }
      
      // Cancel wire drawing with Escape key
      if (e.key === 'Escape' && isDrawingWire) {
        setIsDrawingWire(false);
        setWireStartPoint(null);
        setWireEndPosition(null);
        setHighlightedPoint(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draggedComponent, isDrawingWire]);

  return (
    <div className="circuit-builder h-full flex flex-col">
      {/* Code Editor Modal */}
      {isCodeEditorOpen && selectedMicrocontroller && (
        <CodeEditorModal
          isOpen={isCodeEditorOpen}
          onClose={() => setIsCodeEditorOpen(false)}
          initialCode={selectedMicrocontroller.code || ''}
          onSaveCode={handleSaveCode}
          onRunCode={handleRunCode}
        />
      )}
      
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
        <div className="center-tools flex items-center space-x-3">
          <span className="text-xs">Circuit Builder</span>
          <button 
            className={`px-3 py-1 rounded flex items-center space-x-1 ${isSimulating ? 'bg-gray-600 cursor-wait' : 'bg-green-700 hover:bg-green-600'}`}
            onClick={simulateCircuit}
            disabled={isSimulating}
            title="Simulate Circuit"
          >
            <PlayCircle size={16} />
            <span className="text-xs">Simulate Circuit</span>
          </button>
          {simulationStatus && (
            <div className="flex items-center">
              {simulationStatus.includes('success') ? (
                <div className="text-green-400 text-xs flex items-center">
                  <Zap size={14} className="mr-1" />
                  {simulationStatus}
                </div>
              ) : (
                <div className="text-red-400 text-xs flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {simulationStatus}
                </div>
              )}
            </div>
          )}
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
            onClick={() => {
              // Clear all components and wires
              setComponents([]);
              setWires([]);
              
              // Reset any active operations
              setIsDrawingWire(false);
              setWireStartPoint(null);
              setWireEndPosition(null);
              setHighlightedPoint(null);
            }}
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
                {component.svgPath ? (
                  <ReactSVG
                    src={component.svgPath}
                    className="w-8 h-8"
                    loading={() => <span className="text-xl">{component.icon}</span>}
                    fallback={() => <span className="text-xl">{component.icon}</span>}
                  />
                ) : (
                  <span className="text-xl">{component.icon}</span>
                )}
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
            {/* Render Wires */}
            <svg 
              className="wires-layer absolute top-0 left-0 w-full h-full pointer-events-none" 
              style={{ zIndex: 5 }}
            >
              {/* Existing Wires */}
              {wires.map(wire => (
                <g key={wire.id} className="wire-group" style={{ pointerEvents: 'auto' }}>
                  <line
                    x1={wire.startPosition.x}
                    y1={wire.startPosition.y}
                    x2={wire.endPosition.x}
                    y2={wire.endPosition.y}
                    stroke={energizedComponentIds.has(wire.id) ? '#4ADE80' : wire.color}
                    strokeWidth={energizedComponentIds.has(wire.id) ? 3 : 2}
                    style={{ 
                      cursor: 'pointer',
                      filter: energizedComponentIds.has(wire.id) ? 'drop-shadow(0 0 2px rgba(0, 255, 0, 0.7))' : 'none'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWire(wire.id);
                    }}
                  />
                </g>
              ))}
              
              {/* Wire being drawn */}
              {isDrawingWire && wireStartPoint && wireEndPosition && (
                <line
                  x1={wireStartPoint ? 
                    getConnectionPointAbsolutePosition(
                      components.find(c => c.id === wireStartPoint.parentId)!,
                      wireStartPoint
                    ).x : 0
                  }
                  y1={wireStartPoint ? 
                    getConnectionPointAbsolutePosition(
                      components.find(c => c.id === wireStartPoint.parentId)!,
                      wireStartPoint
                    ).y : 0
                  }
                  x2={highlightedPoint ? 
                    getConnectionPointAbsolutePosition(
                      components.find(c => c.id === highlightedPoint.parentId)!,
                      highlightedPoint
                    ).x : wireEndPosition.x
                  }
                  y2={highlightedPoint ? 
                    getConnectionPointAbsolutePosition(
                      components.find(c => c.id === highlightedPoint.parentId)!,
                      highlightedPoint
                    ).y : wireEndPosition.y
                  }
                  stroke={highlightedPoint ? '#00FF00' : '#888888'}
                  strokeWidth={2}
                  strokeDasharray={highlightedPoint ? '0' : '5,5'}
                />
              )}
            </svg>
            
            {/* Circuit Components */}
            {components.map(component => (
              <div
                key={component.id}
                className={`circuit-component absolute select-none cursor-move flex items-center justify-center
                  ${problemComponentIds.has(component.id) ? 'animate-pulse' : ''}
                  ${energizedComponentIds.has(component.id) ? 'energized' : ''}
                `}
                style={{
                  left: `${component.position.x}px`,
                  top: `${component.position.y}px`,
                  width: `${component.width}px`,
                  height: `${component.height}px`,
                  backgroundColor: componentDefinitions[component.type].color,
                  transform: `rotate(${component.rotation}deg)`,
                  border: problemComponentIds.has(component.id) 
                    ? '2px solid rgba(255, 50, 50, 0.8)'
                    : energizedComponentIds.has(component.id)
                    ? '1px solid rgba(100, 255, 100, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  zIndex: draggedComponent?.id === component.id ? 100 : 10,
                  boxShadow: problemComponentIds.has(component.id)
                    ? '0 0 8px rgba(255, 0, 0, 0.5)'
                    : energizedComponentIds.has(component.id)
                    ? '0 0 8px rgba(0, 255, 0, 0.3)'
                    : '0 2px 4px rgba(0, 0, 0, 0.3)',
                }}
                onMouseDown={(e) => handleStartDragExisting(e, component)}
              >
                {/* Display LED lit version when energized, otherwise normal SVG */}
                {component.type === 'led' && energizedComponentIds.has(component.id) ? (
                  <ReactSVG
                    src="/images/components/led_lit.svg"
                    className="w-full h-full pointer-events-none p-1"
                    loading={() => <span className="text-center text-2xl pointer-events-none">💡</span>}
                    fallback={() => <span className="text-center text-2xl pointer-events-none">💡</span>}
                  />
                ) : componentDefinitions[component.type].svgPath ? (
                  <ReactSVG
                    src={componentDefinitions[component.type].svgPath}
                    className={`w-full h-full pointer-events-none p-1 ${energizedComponentIds.has(component.id) ? 'filter-active' : ''}`}
                    loading={() => <span className="text-center text-2xl pointer-events-none">{componentDefinitions[component.type].icon}</span>}
                    fallback={() => <span className="text-center text-2xl pointer-events-none">{componentDefinitions[component.type].icon}</span>}
                  />
                ) : (
                  <span className="text-center text-2xl pointer-events-none">
                    {componentDefinitions[component.type].icon}
                  </span>
                )}
                
                {/* Connection Points */}
                {component.connectionPoints.map((point, idx) => {
                  // Determine if the point is highlighted
                  const isHighlighted = highlightedPoint?.id === point.id;
                  const isDrawingFrom = wireStartPoint?.id === point.id;
                  
                  return (
                    <div 
                      key={point.id} 
                      className={`connection-point absolute rounded-full border 
                        ${isHighlighted ? 'border-green-500 animate-pulse' : 'border-gray-400'} 
                        ${isDrawingFrom ? 'border-blue-500' : ''}
                        ${point.type === 'input' ? 'bg-blue-500' : point.type === 'output' ? 'bg-red-500' : 'bg-gray-300'}
                      `}
                      style={{
                        left: `${point.position.x - CONNECTION_POINT_RADIUS}px`,
                        top: `${point.position.y - CONNECTION_POINT_RADIUS}px`,
                        width: `${CONNECTION_POINT_RADIUS * 2}px`,
                        height: `${CONNECTION_POINT_RADIUS * 2}px`,
                        cursor: 'crosshair',
                        zIndex: 15,
                        boxShadow: isHighlighted ? '0 0 8px #00FF00' : isDrawingFrom ? '0 0 8px #0088FF' : 'none'
                      }}
                      onClick={(e) => handleConnectionPointClick(e, component, point)}
                    />
                  );
                })}
                
                {/* Component Controls (visible on hover) */}
                <div className="component-controls absolute -top-6 left-0 right-0 flex justify-center space-x-1 opacity-0 hover:opacity-100 transition-opacity">
                  {/* Code editor button for microcontroller */}
                  {component.type === 'microcontroller' && (
                    <button 
                      className="code-btn p-1 bg-green-600 text-white rounded-full hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCodeEditor(component);
                      }}
                      title="Open Code Editor"
                    >
                      <Code size={12} />
                    </button>
                  )}
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
                {componentDefinitions[draggedComponent.type].svgPath ? (
                  <ReactSVG
                    src={componentDefinitions[draggedComponent.type].svgPath}
                    className="w-full h-full pointer-events-none p-1"
                    loading={() => <span className="text-center text-2xl pointer-events-none">{componentDefinitions[draggedComponent.type].icon}</span>}
                    fallback={() => <span className="text-center text-2xl pointer-events-none">{componentDefinitions[draggedComponent.type].icon}</span>}
                  />
                ) : (
                  <span className="text-center text-2xl pointer-events-none">
                    {componentDefinitions[draggedComponent.type].icon}
                  </span>
                )}
                
                {/* Preview Connection Points */}
                {draggedComponent.connectionPoints?.map((point, idx) => (
                  <div 
                    key={`preview-${point.id}`} 
                    className="connection-point absolute rounded-full border border-gray-400"
                    style={{
                      left: `${point.position.x - CONNECTION_POINT_RADIUS}px`,
                      top: `${point.position.y - CONNECTION_POINT_RADIUS}px`,
                      width: `${CONNECTION_POINT_RADIUS * 2}px`,
                      height: `${CONNECTION_POINT_RADIUS * 2}px`,
                      backgroundColor: point.type === 'input' ? 'rgba(59, 130, 246, 0.5)' : 
                                      point.type === 'output' ? 'rgba(239, 68, 68, 0.5)' : 
                                      'rgba(209, 213, 219, 0.5)',
                      zIndex: 15
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="status-bar bg-gray-800 text-white py-1 px-2 text-xs flex justify-between border-t border-gray-700">
        <div>Zoom: {Math.round(zoom * 100)}%</div>
        <div>Grid: {GRID_SIZE}px</div>
        <div>Components: {components.length} | Wires: {wires.length}</div>
        {isDrawingWire && (
          <div className="text-yellow-400">
            Drawing wire... {highlightedPoint ? "Connection found" : "Click on a connection point to complete"}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitBuilderWindow;