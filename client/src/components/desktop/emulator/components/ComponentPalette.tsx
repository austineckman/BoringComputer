import React from 'react';
import { CircuitBoard, Cpu, Lightbulb, Sliders, ZapOff, Gauge } from 'lucide-react';

// Define the component types and their metadata
const COMPONENTS = [
  {
    id: 'led',
    name: 'LED',
    icon: <Lightbulb className="h-4 w-4" />,
    description: 'Light Emitting Diode'
  },
  {
    id: 'resistor',
    name: 'Resistor',
    icon: <ZapOff className="h-4 w-4" />,
    description: 'Limits current flow'
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    icon: <Sliders className="h-4 w-4" />,
    description: 'Variable resistor'
  },
  {
    id: 'button',
    name: 'Button',
    icon: <CircuitBoard className="h-4 w-4" />,
    description: 'Momentary switch'
  },
  {
    id: 'sensor',
    name: 'Light Sensor',
    icon: <Gauge className="h-4 w-4" />,
    description: 'Photoresistor'
  }
];

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

/**
 * Component Palette
 * 
 * Displays available components that can be added to the circuit
 */
export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Components</h3>
      
      <div className="space-y-2">
        {COMPONENTS.map(component => (
          <div
            key={component.id}
            className="p-2 flex items-center gap-2 border rounded-md hover:bg-accent cursor-pointer"
            onClick={() => onAddComponent(component.id)}
          >
            <div className="p-1 bg-primary/10 rounded-md">
              {component.icon}
            </div>
            <div>
              <div className="text-sm font-medium">{component.name}</div>
              <div className="text-xs text-muted-foreground">{component.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}