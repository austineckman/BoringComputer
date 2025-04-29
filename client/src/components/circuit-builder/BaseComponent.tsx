import React, { useRef, useState, useEffect } from 'react';
import { ComponentData } from './ComponentGenerator';
import CircuitPin, { PinPosition } from './CircuitPin';

interface BaseComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
  connectedPins?: string[];
  children?: React.ReactNode;
}

interface PinDefinition {
  id: string;
  x: number;
  y: number;
  label: string;
}

const BaseComponent: React.FC<BaseComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent,
  connectedPins = [],
  children
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<PinDefinition[]>([]);
  const [isDragged, setIsDragged] = useState(false);
  
  // This function should be overridden by specific components to define their pins
  const definePins = (): PinDefinition[] => {
    return [];
  };
  
  // Calculate pin positions based on component's rotation
  useEffect(() => {
    const basePins = definePins();
    
    if (basePins.length === 0) {
      setPins([]);
      return;
    }
    
    // Apply rotation transformation to pins
    const rotatePin = (pin: PinDefinition): PinDefinition => {
      const { x, y } = pin;
      const radians = (componentData.attrs.rotate * Math.PI) / 180;
      
      // Get component dimensions
      const element = componentRef.current;
      if (!element) return pin;
      
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      
      // Calculate center point
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Calculate relative coordinates from center
      const relativeX = x - centerX;
      const relativeY = y - centerY;
      
      // Apply rotation
      const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
      const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
      
      // Translate back to absolute coordinates
      return {
        ...pin,
        x: rotatedX + centerX,
        y: rotatedY + centerY
      };
    };
    
    // Apply rotation to each pin
    const rotatedPins = basePins.map(rotatePin);
    setPins(rotatedPins);
  }, [componentData.attrs.rotate, componentRef.current]);
  
  // Calculate absolute pin positions for wiring
  const getPinPosition = (pin: PinDefinition): PinPosition => {
    const { id, x, y } = pin;
    
    if (!componentRef.current) {
      return { id, x, y };
    }
    
    const rect = componentRef.current.getBoundingClientRect();
    const absoluteX = rect.left + x;
    const absoluteY = rect.top + y;
    
    return {
      id,
      x: absoluteX,
      y: absoluteY
    };
  };
  
  return (
    <div
      ref={componentRef}
      className={`absolute transition-shadow ${isActive ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${componentData.attrs.left}px`,
        top: `${componentData.attrs.top}px`,
        transform: `rotate(${componentData.attrs.rotate}deg)`,
        zIndex: componentData.attrs.zIndex || 1,
        cursor: 'move'
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        handleMouseDown(componentData.id, true);
      }}
    >
      {/* Component content */}
      {children}
      
      {/* Pins */}
      {pins.map((pin) => (
        <CircuitPin
          key={pin.id}
          id={`${componentData.id}-${pin.id}`}
          x={pin.x}
          y={pin.y}
          label={pin.label}
          isConnected={connectedPins.includes(`${componentData.id}-${pin.id}`)}
          onPinClick={onPinClicked}
        />
      ))}
    </div>
  );
};

export default BaseComponent;