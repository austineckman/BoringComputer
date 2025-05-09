import React, { useState, useRef, useEffect } from 'react';
import { PinState } from '../EmulatorContext';

// SVG representation of an Arduino UNO board
const ARDUINO_BOARD_SVG = `
<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="280" height="180" rx="10" fill="#00979D" />
  <rect x="20" y="140" width="260" height="40" rx="5" fill="#E6E6E6" />
  <rect x="20" y="20" width="40" height="110" rx="5" fill="#E6E6E6" />
  <rect x="240" y="20" width="40" height="110" rx="5" fill="#E6E6E6" />
  <rect x="70" y="20" width="160" height="40" rx="5" fill="#E6E6E6" />
  <circle cx="250" cy="40" r="7" fill="#000000" />
  <text x="150" y="100" font-family="Arial" font-size="16" fill="#FFFFFF" text-anchor="middle">Arduino UNO</text>
</svg>
`;

// Pin definitions for Arduino UNO with type that matches CircuitComponent
const ARDUINO_PINS = [
  // Digital pins
  { id: '0', x: 270, y: 30, label: 'D0', type: 'bidirectional' },
  { id: '1', x: 270, y: 45, label: 'D1', type: 'bidirectional' },
  { id: '2', x: 270, y: 60, label: 'D2', type: 'bidirectional' },
  { id: '3', x: 270, y: 75, label: 'D3', type: 'bidirectional' },
  { id: '4', x: 270, y: 90, label: 'D4', type: 'bidirectional' },
  { id: '5', x: 270, y: 105, label: 'D5', type: 'bidirectional' },
  { id: '6', x: 270, y: 120, label: 'D6', type: 'bidirectional' },
  { id: '7', x: 270, y: 135, label: 'D7', type: 'bidirectional' },
  { id: '8', x: 270, y: 150, label: 'D8', type: 'bidirectional' },
  { id: '9', x: 270, y: 165, label: 'D9', type: 'bidirectional' },
  { id: '10', x: 240, y: 165, label: 'D10', type: 'bidirectional' },
  { id: '11', x: 210, y: 165, label: 'D11', type: 'bidirectional' },
  { id: '12', x: 180, y: 165, label: 'D12', type: 'bidirectional' },
  { id: '13', x: 150, y: 165, label: 'D13', type: 'bidirectional' },
  
  // Analog pins
  { id: 'A0', x: 30, y: 165, label: 'A0', type: 'input' },
  { id: 'A1', x: 45, y: 165, label: 'A1', type: 'input' },
  { id: 'A2', x: 60, y: 165, label: 'A2', type: 'input' },
  { id: 'A3', x: 75, y: 165, label: 'A3', type: 'input' },
  { id: 'A4', x: 90, y: 165, label: 'A4', type: 'input' },
  { id: 'A5', x: 105, y: 165, label: 'A5', type: 'input' },
  
  // Power pins
  { id: 'GND', x: 30, y: 30, label: 'GND', type: 'output' },
  { id: '5V', x: 30, y: 45, label: '5V', type: 'output' },
  { id: '3V3', x: 30, y: 60, label: '3.3V', type: 'output' },
  
  // Built-in LED at pin 13
  { id: 'LED_BUILTIN', x: 150, y: 120, label: 'LED', type: 'output' }
];

interface ArduinoBoardProps {
  id: string;
  pinStates: Record<string | number, PinState>;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}

/**
 * Arduino Board Component
 * 
 * Renders an Arduino UNO board with pins that reflect the current state
 * from the emulator. Uses the same styling and pin representation as
 * the CircuitComponent.
 */
export function ArduinoBoard({
  id,
  pinStates,
  isSelected,
  onSelect,
  onMove
}: ArduinoBoardProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const width = 300;
  const height = 200;
  
  // Handle click on component
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };
  
  // Handle mouse down on component for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only allow dragging from the board, not pins
    if ((e.target as HTMLElement).classList.contains('circuit-pin')) {
      return;
    }
    
    if (e.button === 0) { // Left mouse button
      const rect = boardRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };
  
  // Calculate pin position (similar to CircuitComponent)
  const getPinPosition = (pin: typeof ARDUINO_PINS[0]) => {
    // Create a new position that's relative to the component
    const pinRelativeX = pin.x / width;
    const pinRelativeY = pin.y / height;
    
    const newPosition = {
      x: position.x + pinRelativeX * width,
      y: position.y + pinRelativeY * height
    };
    
    // Store the pin position in the global cache for wire connections
    if (!window.pinPositionCache) {
      window.pinPositionCache = new Map();
    }
    
    const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pin.id}`;
    
    window.pinPositionCache.set(formattedPinId, {
      x: newPosition.x,
      y: newPosition.y,
      origComponentX: position.x,
      origComponentY: position.y,
      component: id,
      pin: pin.id
    });
    
    return newPosition;
  };
  
  // Handle pin click for connection
  const handlePinClick = (pin: typeof ARDUINO_PINS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    const pinPosition = getPinPosition(pin);
    
    // Create pin ID with consistent format
    const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pin.id}`;
    
    // Create a detailed event with stable position data
    const clickEvent = new CustomEvent('pinClicked', {
      detail: {
        id: formattedPinId,
        pinId: pin.id,
        componentId: id,
        pinType: pin.type,
        clientX: pinPosition.x,
        clientY: pinPosition.y,
        componentType: 'arduinoboard',
        pinData: JSON.stringify({
          x: pinPosition.x,
          y: pinPosition.y,
          origComponentX: position.x,
          origComponentY: position.y,
          pinId: pin.id,
          componentId: id,
          formattedId: formattedPinId,
          type: pin.type
        })
      },
      bubbles: true
    });
    
    // Dispatch the detailed event
    document.dispatchEvent(clickEvent);
  };
  
  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate the new position based on mouse position and drag offset
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Update component position
      setPosition({ x: newX, y: newY });
      
      // Also update using the callback for parent component tracking
      onMove(newX, newY);
      
      // After position update, dispatch custom event for wire updates
      document.dispatchEvent(new CustomEvent('componentMoved', {
        detail: { 
          componentId: id,
          x: newX,
          y: newY
        }
      }));
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Final position update event
      const pinPositions: Record<string, {x: number, y: number}> = {};
      
      // Update all pin positions after movement
      ARDUINO_PINS.forEach(pin => {
        const pinPos = getPinPosition(pin);
        const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pin.id}`;
        
        pinPositions[formattedPinId] = {
          x: pinPos.x,
          y: pinPos.y
        };
      });
      
      // Dispatch final move event to update wires
      document.dispatchEvent(new CustomEvent('componentMovedFinal', {
        detail: { 
          componentId: id,
          pinPositions
        }
      }));
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onMove]);
  
  // Register pins for wire connections
  useEffect(() => {
    ARDUINO_PINS.forEach(pin => {
      const pinPosition = getPinPosition(pin);
      const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pin.id}`;
      
      // Dispatch event to register this pin for wire connections
      const event = new CustomEvent('registerPin', {
        detail: {
          id: formattedPinId,
          componentId: id,
          pinId: pin.id,
          pinType: pin.type,
          x: pinPosition.x,
          y: pinPosition.y
        },
        bubbles: true
      });
      
      document.dispatchEvent(event);
    });
  }, [id, position]);
  
  return (
    <div
      ref={boardRef}
      id={`component-${id}`}
      className="circuit-component absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #3b82f6' : 'none',
        borderRadius: '4px'
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* Arduino Board Image */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: ARDUINO_BOARD_SVG }}
      />
      
      {/* Component pins - using the exact same style as CircuitComponent */}
      {ARDUINO_PINS.map(pin => {
        const state = pinStates[pin.id];
        const isActive = state?.isHigh || false;
        const pinRelativeX = pin.x / width;
        const pinRelativeY = pin.y / height;
        
        return (
          <div
            key={pin.id}
            id={`${id}-${pin.id}`}
            data-pin-id={pin.id}
            className={`circuit-pin pin-point absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair border-2 shadow-md ${
              pin.type === 'input' ? 'bg-green-500 border-green-700' : 
              pin.type === 'output' ? 'bg-red-500 border-red-700' : 
              'bg-blue-500 border-blue-700' // bidirectional
            } ${isActive ? 'ring-2 ring-yellow-300 ring-opacity-70' : ''}`}
            style={{
              left: `${pinRelativeX * 100}%`,
              top: `${pinRelativeY * 100}%`,
              zIndex: 20
            }}
            onClick={(e) => handlePinClick(pin, e)}
            title={`${pin.label} (${pin.id}): ${isActive ? 'HIGH' : 'LOW'}`}
          >
            {/* Pin hover tooltip */}
            <div className="pin-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {pin.label} ({isActive ? 'HIGH' : 'LOW'})
            </div>
          </div>
        );
      })}
      
      {/* Component label */}
      <div 
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center whitespace-nowrap bg-gray-800 text-white px-1 rounded"
      >
        Arduino UNO
      </div>
    </div>
  );
}