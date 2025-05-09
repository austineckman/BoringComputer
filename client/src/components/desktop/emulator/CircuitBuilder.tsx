import React, { useState, useRef, useEffect } from 'react';
import { Layers, Plus, Minus, Grid, Undo, Redo, Tool } from 'lucide-react';
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

/**
 * Circuit Builder Component
 * 
 * Provides a canvas for building Arduino circuits with components
 * that are affected by the emulator state
 */
export function CircuitBuilder() {
  const { pinStates, components, addComponent, connectComponentPin } = useEmulator();
  const [circuitComponents, setCircuitComponents] = useState<ComponentPosition[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Add Arduino board by default
  useEffect(() => {
    if (circuitComponents.length === 0) {
      setCircuitComponents([
        {
          id: 'arduino-board',
          type: 'arduino-board',
          x: 100,
          y: 100,
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
  
  // Add a new component to the circuit
  const handleAddComponent = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const newComponent: ComponentPosition = {
      id,
      type,
      x: 300,
      y: 200,
      rotation: 0,
      connections: {}
    };
    
    setCircuitComponents(prev => [...prev, newComponent]);
    setSelectedComponent(id);
  };
  
  // Move a component on the canvas
  const handleMoveComponent = (id: string, x: number, y: number) => {
    setCircuitComponents(prev => 
      prev.map(component => 
        component.id === id 
          ? { ...component, x, y } 
          : component
      )
    );
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
  
  return (
    <div className="h-full w-full flex flex-col">
      <Tabs defaultValue="canvas" className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-2 border-b">
          <TabsList>
            <TabsTrigger value="canvas">
              <Layers className="h-4 w-4 mr-2" />
              Circuit
            </TabsTrigger>
            <TabsTrigger value="pins">
              <Grid className="h-4 w-4 mr-2" />
              Pin States
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(0.1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(-0.1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="canvas" className="flex-1 flex overflow-hidden mt-0 pt-0">
          {/* Component Palette */}
          <div className="w-48 border-r overflow-y-auto p-2">
            <ComponentPalette onAddComponent={handleAddComponent} />
          </div>
          
          {/* Circuit Canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 overflow-auto bg-muted/20 relative"
            style={{ cursor: selectedComponent ? 'move' : 'default' }}
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
                    cursor: 'move'
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
        </TabsContent>
        
        <TabsContent value="pins" className="flex-1 overflow-auto mt-0 pt-0">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Arduino Pin States</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Digital Pins</h4>
                <div className="space-y-2">
                  {Array.from({ length: 14 }, (_, i) => i).map(pin => {
                    const state = pinStates[pin];
                    return (
                      <div
                        key={pin}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="font-mono">D{pin}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs">{state?.mode || 'INPUT'}</div>
                          <div
                            className={`w-4 h-4 rounded-full ${
                              state?.isHigh ? 'bg-green-500' : 'bg-muted'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Analog Pins</h4>
                <div className="space-y-2">
                  {Array.from({ length: 6 }, (_, i) => `A${i}`).map(pin => {
                    const state = pinStates[pin];
                    return (
                      <div
                        key={pin}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="font-mono">{pin}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs">
                            {state?.value !== undefined ? state.value : '0'}
                          </div>
                          <div
                            className="w-4 h-4 rounded-full bg-blue-500"
                            style={{ opacity: state?.value ? Math.min(1, state.value / 1023) : 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}