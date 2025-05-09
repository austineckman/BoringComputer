import React, { useState, useRef, useEffect } from 'react';
import { Layers, Plus, Minus, Grid, Undo, Redo, Tool, RotateCcw, Trash2, Save, PanelRight, Move, HelpCircle, Maximize2, Image, LucideProps } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmulator } from './EmulatorContext';
import { ComponentPalette } from './components/ComponentPalette';
import { ArduinoBoard } from './components/ArduinoBoard';
import { LED } from './components/LED';

// Types for the circuit components
export interface ComponentPosition {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  connections: Record<string, string>; // pin -> boardPin
}

// Retro UI pixel art icons for a TinkerCAD-like interface
const PixelIcon = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`text-xs font-mono flex items-center justify-center ${className}`} style={{ 
    imageRendering: 'pixelated',
    fontFamily: "'Press Start 2P', monospace"
  }}>
    {children}
  </div>
);

/**
 * Circuit Builder Component - TinkerCAD-inspired with Retro Gaming Twist
 * 
 * Provides a canvas for building Arduino circuits with components
 * that are affected by the emulator state
 */
export function CircuitBuilder() {
  const { pinStates, components, addComponent, connectComponentPin } = useEmulator();
  const [circuitComponents, setCircuitComponents] = useState<ComponentPosition[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showProperties, setShowProperties] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Add Arduino board by default with safe initial position
  useEffect(() => {
    if (circuitComponents.length === 0) {
      // Get canvas size if available
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      // Calculate center position of the canvas
      const centerX = canvasRect ? (canvasRect.width / 2) - 150 : 200; // Half of Arduino width
      const centerY = canvasRect ? (canvasRect.height / 2) - 100 : 200; // Half of Arduino height
      
      setCircuitComponents([
        {
          id: 'arduino-board',
          type: 'arduino-board',
          x: centerX,
          y: centerY,
          rotation: 0,
          connections: {}
        }
      ]);
    }
  }, []);
  
  // Sync circuit components with emulator components
  useEffect(() => {
    // This would update the emulator components state
    circuitComponents.forEach(component => {
      if (component.type !== 'arduino-board' && !components[component.id]) {
        // Add component to emulator state if it doesn't exist
        addComponent({
          id: component.id,
          type: component.type,
          pins: component.connections,
          state: {}
        });
      }
    });
  }, [circuitComponents, components, addComponent]);
  
  // Add a new component to the circuit with proper positioning
  const handleAddComponent = (type: string) => {
    const id = `${type}-${Date.now()}`;
    
    // Get canvas size if available for better positioning
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    // Calculate a position based on where the canvas is currently scrolled to
    // and the center of the visible viewport
    const scrollLeft = canvasRef.current?.scrollLeft || 0;
    const scrollTop = canvasRef.current?.scrollTop || 0;
    
    // Using safer defaults that would keep components visible on the canvas
    const viewport = {
      width: canvasRect?.width || 800,
      height: canvasRect?.height || 600
    };
    
    // Calculate position to be in the center of the visible area
    const x = scrollLeft + (viewport.width / 2) - 40; // 40 is half the estimated component width
    const y = scrollTop + (viewport.height / 2) - 40; // 40 is half the estimated component height
    
    const newComponent: ComponentPosition = {
      id,
      type,
      x: x,
      y: y,
      rotation: 0,
      connections: {}
    };
    
    setCircuitComponents(prev => [...prev, newComponent]);
    setSelectedComponent(id);
  };
  
  // Move a component on the canvas with proper bounds checking
  const handleMoveComponent = (id: string, x: number, y: number) => {
    // Get the canvas dimensions for boundary checking
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    // Ensure component stays within canvas bounds
    let boundedX = x;
    let boundedY = y;
    
    // If we have canvas dimensions, ensure component stays within bounds
    if (canvasRect) {
      // Get the component to calculate its width and height
      const component = circuitComponents.find(c => c.id === id);
      if (component) {
        // Get component width and height (default to reasonable values if not set)
        const componentWidth = 100;
        const componentHeight = 100;
        
        // Calculate canvas bounds with margins for the component size
        const minX = 50; // Left margin
        const minY = 50; // Top margin
        const maxX = canvasRect.width - componentWidth - 50; // Right margin
        const maxY = canvasRect.height - componentHeight - 50; // Bottom margin
        
        // Constrain position within bounds
        boundedX = Math.max(minX, Math.min(maxX, x));
        boundedY = Math.max(minY, Math.min(maxY, y));
      }
    }
    
    // Update component position with bounded values
    setCircuitComponents(prev => 
      prev.map(component => 
        component.id === id 
          ? { ...component, x: boundedX, y: boundedY } 
          : component
      )
    );
    
    // Let everyone know the component has moved for wire updates
    document.dispatchEvent(new CustomEvent('componentMoved', {
      detail: { 
        componentId: id,
        x: boundedX,
        y: boundedY
      }
    }));
  };
  
  // Rotate a component
  const handleRotateComponent = (id: string, rotation: number) => {
    setCircuitComponents(prev => 
      prev.map(component => 
        component.id === id 
          ? { ...component, rotation } 
          : component
      )
    );
  };
  
  // Connect a component pin to a board pin
  const handleConnectPin = (componentId: string, componentPin: string, boardPin: string) => {
    // Update local state
    setCircuitComponents(prev => 
      prev.map(component => 
        component.id === componentId 
          ? { 
              ...component, 
              connections: { 
                ...component.connections, 
                [componentPin]: boardPin 
              } 
            } 
          : component
      )
    );
    
    // Update emulator state
    connectComponentPin(componentId, componentPin, boardPin);
  };
  
  // Remove a component
  const handleRemoveComponent = (id: string) => {
    setCircuitComponents(prev => prev.filter(component => component.id !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };
  
  // Zoom in/out the canvas
  const handleZoom = (factor: number) => {
    setZoom(prev => Math.max(0.5, Math.min(2, prev + factor)));
  };

  // Toggle the property panel
  const toggleProperties = () => {
    setShowProperties(!showProperties);
  };
  
  // Get the selected component details for display
  const selectedComponentData = selectedComponent 
    ? circuitComponents.find(c => c.id === selectedComponent) 
    : null;
    
  // Handle pin click events to establish connections between components
  useEffect(() => {
    let firstPinData: any = null;
    
    const handlePinClicked = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      
      if (!firstPinData) {
        // Store the first pin clicked
        firstPinData = detail;
      } else {
        // Second pin clicked - create connection if compatible
        const secondPinData = detail;
        
        // Don't allow connecting pins from the same component
        if (firstPinData.componentId === secondPinData.componentId) {
          firstPinData = secondPinData; // Replace with the new pin
          return;
        }
        
        // Determine which is the Arduino board pin
        let boardPin = null;
        let componentPin = null;
        let componentId = null;
        
        // Check which is the board and which is the component
        if (firstPinData.componentType === 'arduinoboard') {
          boardPin = firstPinData.pinId;
          componentPin = secondPinData.pinId;
          componentId = secondPinData.componentId;
        } else if (secondPinData.componentType === 'arduinoboard') {
          boardPin = secondPinData.pinId;
          componentPin = firstPinData.pinId;
          componentId = firstPinData.componentId;
        }
        
        // If we have a valid board pin and component pin
        if (boardPin && componentPin && componentId) {
          // Dispatch an event to let the component know which pins to connect
          document.dispatchEvent(new CustomEvent('pinToConnect', {
            detail: {
              boardPin,
              componentPin,
              componentId
            }
          }));
          
          // Update the connection in the circuit builder state
          handleConnectPin(componentId, componentPin, boardPin);
          
          // TODO: Wire visualization between pins will be added here
          console.log(`Connected ${componentId}.${componentPin} to Arduino.${boardPin}`);
        }
        
        // Reset for next connection
        firstPinData = null;
      }
    };
    
    // Listen for pin clicks
    document.addEventListener('pinClicked', handlePinClicked);
    
    return () => {
      document.removeEventListener('pinClicked', handlePinClicked);
    };
  }, [handleConnectPin]);
  
  return (
    <div className="h-full w-full flex flex-col relative">
      {/* Main toolbar - Retro style */}
      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-blue-800 to-indigo-900 text-white border-b-2 border-cyan-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300 ${showGrid ? 'bg-blue-800' : ''}`}
          >
            <Grid className="h-4 w-4 mr-1" />
            Grid
          </Button>

          <div className="px-2 border-l border-cyan-700 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(0.1)}
              className="border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono text-cyan-300">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleZoom(-0.1)}
              className="border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300"
          >
            <Undo className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300"
          >
            <Redo className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleProperties}
            className={`border border-cyan-500 bg-blue-900/50 hover:bg-blue-800 text-cyan-300 ${showProperties ? 'bg-blue-800' : ''}`}
          >
            <PanelRight className="h-4 w-4 mr-1" />
            Properties
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Circuit Canvas with retro pixelated grid background */}
        <div 
          ref={canvasRef}
          className="flex-1 overflow-auto relative"
          style={{ 
            cursor: selectedComponent ? 'move' : 'default',
            backgroundImage: showGrid 
              ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 20 20\'%3E%3Cpath d=\'M0 0h1v1H0V0zm19 0h1v1h-1V0zm0 19h1v1h-1v-1zM0 19h1v1H0v-1z\' fill=\'rgba(49, 101, 146, 0.3)\'/%3E%3Cpath d=\'M1 1h18v18H1V1z\' stroke=\'rgba(49, 101, 146, 0.1)\' fill=\'none\'/%3E%3C/svg%3E")'
              : 'none',
            backgroundColor: '#0c1929',
          }}
        >
          <div 
            className="absolute top-0 left-0 w-full h-full"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            {/* Render circuit components */}
            {circuitComponents.map(component => (
              <div 
                key={component.id}
                className="absolute"
                style={{
                  transform: `translate(${component.x}px, ${component.y}px) rotate(${component.rotation}deg)`,
                  cursor: 'move',
                  zIndex: selectedComponent === component.id ? 10 : 1,
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {component.type === 'arduino-board' && (
                  <ArduinoBoard
                    id={component.id}
                    pinStates={pinStates}
                    isSelected={selectedComponent === component.id}
                    onSelect={() => setSelectedComponent(component.id)}
                    onMove={(x, y) => handleMoveComponent(component.id, x, y)}
                  />
                )}
                
                {component.type === 'led' && (
                  <LED
                    id={component.id}
                    pinStates={pinStates}
                    connections={component.connections}
                    isSelected={selectedComponent === component.id}
                    onSelect={() => setSelectedComponent(component.id)}
                    onMove={(x, y) => handleMoveComponent(component.id, x, y)}
                    onRotate={(r) => handleRotateComponent(component.id, r)}
                    onConnect={(pin, boardPin) => handleConnectPin(component.id, pin, boardPin)}
                    onRemove={() => handleRemoveComponent(component.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Properties Panel - Slides in when a component is selected */}
        {showProperties && (
          <div className="w-64 border-l border-cyan-900 bg-slate-800 animate-slide-in-right p-3 overflow-auto">
            <div className="mb-4 text-cyan-300 border-b border-cyan-900 pb-2">
              <h3 className="font-bold uppercase tracking-wider">Properties</h3>
            </div>
            
            {selectedComponentData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-1">Component</h4>
                  <p className="text-xs text-cyan-100 px-2 py-1 bg-slate-700 rounded">
                    {selectedComponentData.type}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-1">Position</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs">
                      <span className="text-gray-400">X:</span> 
                      <span className="text-cyan-100 ml-1">{selectedComponentData.x}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-400">Y:</span>
                      <span className="text-cyan-100 ml-1">{selectedComponentData.y}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-1">Rotation</h4>
                  <div className="text-xs">
                    <span className="text-cyan-100">{selectedComponentData.rotation}°</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-green-300 mb-1">Connections</h4>
                  {Object.keys(selectedComponentData.connections).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(selectedComponentData.connections).map(([pin, boardPin]) => (
                        <div key={pin} className="text-xs flex justify-between bg-slate-700 p-1 rounded">
                          <span className="text-yellow-300">{pin}</span>
                          <span className="text-cyan-100">→ {boardPin}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No connections</p>
                  )}
                </div>
                
                <div className="pt-2 border-t border-cyan-900/50">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border border-red-500 bg-slate-800 hover:bg-red-900/50 text-red-400 w-full"
                    onClick={() => {
                      if (selectedComponentData.id !== 'arduino-board') {
                        handleRemoveComponent(selectedComponentData.id);
                      }
                    }}
                    disabled={selectedComponentData.id === 'arduino-board'}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove Component
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-xs italic">
                Select a component to view its properties
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Status bar with pin states */}
      <div className="px-2 py-1 bg-slate-800 border-t border-cyan-900 text-xs text-cyan-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            {selectedComponent 
              ? `Selected: ${selectedComponent}` 
              : "Click on a component to select it"}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {/* Show first few pin states in the status bar */}
          {Array.from({ length: 3 }, (_, i) => i).map(pin => {
            const state = pinStates[pin];
            return (
              <div key={pin} className="flex items-center space-x-1">
                <span className="font-mono">D{pin}</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    state?.isHigh ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              </div>
            );
          })}
          <span>...</span>
        </div>
      </div>
    </div>
  );
}