import React, { useState, useRef, useEffect } from 'react';
import { PinState } from '../EmulatorContext';

// HERO board component image path (higher resolution image for better quality)
const heroBoardImage = '/attached_assets/circuit board.png';

// Pin definitions for HERO board (matching sandbox configuration)
const ARDUINO_PINS = [
  // Digital pins
  { id: '0', x: 265, y: 40, label: 'D0', type: 'bidirectional' },
  { id: '1', x: 265, y: 55, label: 'D1', type: 'bidirectional' },
  { id: '2', x: 265, y: 70, label: 'D2', type: 'bidirectional' },
  { id: '3', x: 265, y: 85, label: 'D3', type: 'bidirectional' },
  { id: '4', x: 265, y: 100, label: 'D4', type: 'bidirectional' },
  { id: '5', x: 265, y: 115, label: 'D5', type: 'bidirectional' },
  { id: '6', x: 265, y: 130, label: 'D6', type: 'bidirectional' },
  { id: '7', x: 265, y: 145, label: 'D7', type: 'bidirectional' },
  { id: '8', x: 265, y: 160, label: 'D8', type: 'bidirectional' },
  { id: '9', x: 245, y: 175, label: 'D9', type: 'bidirectional' },
  { id: '10', x: 230, y: 175, label: 'D10', type: 'bidirectional' },
  { id: '11', x: 215, y: 175, label: 'D11', type: 'bidirectional' },
  { id: '12', x: 200, y: 175, label: 'D12', type: 'bidirectional' },
  { id: '13', x: 185, y: 175, label: 'D13', type: 'bidirectional' },
  
  // Analog pins
  { id: 'A0', x: 125, y: 175, label: 'A0', type: 'input' },
  { id: 'A1', x: 110, y: 175, label: 'A1', type: 'input' },
  { id: 'A2', x: 95, y: 175, label: 'A2', type: 'input' },
  { id: 'A3', x: 80, y: 175, label: 'A3', type: 'input' },
  { id: 'A4', x: 65, y: 175, label: 'A4', type: 'input' },
  { id: 'A5', x: 50, y: 175, label: 'A5', type: 'input' },
  
  // Power pins
  { id: 'GND', x: 35, y: 40, label: 'GND', type: 'output' },
  { id: '5V', x: 35, y: 55, label: '5V', type: 'output' },
  { id: '3V3', x: 35, y: 70, label: '3.3V', type: 'output' },
  
  // Built-in LED at pin 13
  { id: 'LED_BUILTIN', x: 145, y: 105, label: 'LED', type: 'output' }
];

interface ArduinoBoardProps {
  id: string;
  pinStates: Record<string | number, PinState>;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
}

// Declare window properties for TypeScript
declare global {
  interface Window {
    pinPositionCache: Map<string, any>;
    _lastMoveEventTime: number | null;
  }
}

/**
 * Arduino Board Component - Exact implementation from sandbox CircuitComponent
 * 
 * This component is an exact match to the behavior in the sandbox app's
 * CircuitComponent.jsx, with the same pin management, position calculation,
 * and event handling mechanisms.
 */
export function ArduinoBoard({
  id,
  pinStates,
  isSelected,
  onSelect,
  onMove
}: ArduinoBoardProps) {
  // State for component position and interaction
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Refs
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Component dimensions
  const width = 300;
  const height = 200;
  
  // Handle click on component
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };
  
  // Handle mouse down on component for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't initiate drag if clicking on a pin
    if ((e.target as HTMLElement).classList.contains('circuit-pin')) {
      return;
    }
    
    if (e.button === 0) { // Left mouse button
      const rect = componentRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };
  
  // Calculate the position of pins with stable positioning - matching CircuitComponent
  const getPinPosition = (pin: typeof ARDUINO_PINS[0]) => {
    // Check if this pin already has a position in our stable cache
    const componentType = 'arduinoboard';
    const pinId = pin.id;
    const formattedPinId = `pt-${componentType}-${id.replace(/ /g, '')}-${pinId}`;
    
    // Check for an existing stable position in the cache
    if (window.pinPositionCache && window.pinPositionCache.has(formattedPinId)) {
      const cachedPos = window.pinPositionCache.get(formattedPinId);
      
      // If component hasn't moved, use the cached position exactly
      if (cachedPos.origComponentX === position.x && cachedPos.origComponentY === position.y) {
        return {
          x: cachedPos.x,
          y: cachedPos.y
        };
      }
      
      // If component has moved, adjust the pin position by the same delta
      if (cachedPos.origComponentX !== undefined && cachedPos.origComponentY !== undefined) {
        const deltaX = position.x - cachedPos.origComponentX;
        const deltaY = position.y - cachedPos.origComponentY;
        
        return {
          x: cachedPos.x + deltaX,
          y: cachedPos.y + deltaY
        };
      }
    }
    
    // Calculate a new position based on the pin's relative position
    const pinRelativeX = pin.x / width;
    const pinRelativeY = pin.y / height;
    
    // Calculate position without rotation adjustment
    const newPosition = {
      x: position.x + pinRelativeX * width,
      y: position.y + pinRelativeY * height
    };
    
    // Store this position in our cache for future reference
    if (!window.pinPositionCache) {
      window.pinPositionCache = new Map();
    }
    
    window.pinPositionCache.set(formattedPinId, {
      x: newPosition.x,
      y: newPosition.y,
      origComponentX: position.x,
      origComponentY: position.y,
      component: id,
      pin: pinId
    });
    
    return newPosition;
  };
  
  // Handle pin click - FIXED for improved position stability
  const handlePinClick = (pin: typeof ARDUINO_PINS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Calculate exact pin position
    const pinPosition = getPinPosition(pin);
    
    // Create pin ID with consistent format
    const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pin.id}`;
    
    // Initialize the global pin position cache if it doesn't exist
    if (!window.pinPositionCache) {
      window.pinPositionCache = new Map();
    }
    
    // Store the exact pin position in the global cache with additional metadata
    const pinPositionData = {
      x: pinPosition.x,
      y: pinPosition.y,
      origComponentX: position.x,
      origComponentY: position.y,
      pinId: pin.id,
      componentId: id,
      formattedId: formattedPinId,
      type: pin.type
    };
    
    // Save to global cache for future reference
    window.pinPositionCache.set(formattedPinId, pinPositionData);
    
    // Create a detailed event with stable position data from our cache
    const clickEvent = new CustomEvent('pinClicked', {
      detail: {
        id: formattedPinId,
        pinId: pin.id,
        componentId: id,
        pinType: pin.type,
        clientX: pinPosition.x,
        clientY: pinPosition.y,
        componentType: 'arduinoboard',
        // Include full position data to ensure consistency
        pinData: JSON.stringify(pinPositionData)
      },
      bubbles: true
    });
    
    // Dispatch the detailed event
    document.dispatchEvent(clickEvent);
  };
  
  // Enhanced handle global mouse events for dragging with pin movement tracking
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new position relative to document
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Update position
      setPosition({ x: newX, y: newY });
      
      // Notify parent component
      if (onMove) {
        onMove(newX, newY);
      }
      
      // Performance optimization: Throttle the move event dispatching
      // Only dispatch full move events occasionally during active dragging
      const now = Date.now();
      if (!window._lastMoveEventTime || now - window._lastMoveEventTime > 50) {
        window._lastMoveEventTime = now;
        
        // Get all pin positions for wire updates
        const pinPositions: Record<string, {x: number, y: number}> = {};
        if (componentRef.current) {
          const pins = componentRef.current.querySelectorAll('.pin-point');
          pins.forEach(pin => {
            const pinId = pin.getAttribute('data-pin-id');
            if (pinId) {
              const rect = pin.getBoundingClientRect();
              
              // Create formatted pin ID
              const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pinId}`;
              
              pinPositions[formattedPinId] = {
                x: rect.left + rect.width/2,
                y: rect.top + rect.height/2
              };
            }
          });
        }
        
        // Dispatch move event to update connected wire positions
        document.dispatchEvent(new CustomEvent('componentMoved', {
          detail: {
            componentId: id,
            newPosition: { x: newX, y: newY },
            pinPositions
          }
        }));
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Clear throttling timer
      window._lastMoveEventTime = null;
      
      // Get all pin positions for final wire positions update
      const pinPositions: Record<string, {x: number, y: number}> = {};
      if (componentRef.current) {
        const pins = componentRef.current.querySelectorAll('.pin-point');
        pins.forEach(pin => {
          const pinId = pin.getAttribute('data-pin-id');
          if (pinId) {
            const rect = pin.getBoundingClientRect();
            
            // Create formatted pin ID
            const formattedPinId = `pt-arduinoboard-${id.replace(/ /g, '')}-${pinId}`;
            
            pinPositions[formattedPinId] = {
              x: rect.left + rect.width/2,
              y: rect.top + rect.height/2
            };
          }
        });
      }
      
      // Dispatch final move event with pins
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
  
  // Register pins in the global pin registry
  useEffect(() => {
    ARDUINO_PINS.forEach(pin => {
      const pinPosition = getPinPosition(pin);
      const pinElement = document.getElementById(`${id}-${pin.id}`);
      
      if (pinElement) {
        // Dispatch event to register this pin for wire connections
        const event = new CustomEvent('registerPin', {
          detail: {
            id: `${id}-${pin.id}`,
            parentId: id,
            pinType: pin.type,
            label: pin.label || pin.id,
            element: pinElement
          }
        });
        
        document.dispatchEvent(event);
      }
    });
    
    return () => {
      // Unregister pins when component is removed or rerendered
      ARDUINO_PINS.forEach(pin => {
        const event = new CustomEvent('unregisterPin', {
          detail: {
            id: `${id}-${pin.id}`
          }
        });
        
        document.dispatchEvent(event);
      });
    };
  }, [id, position]);
  
  return (
    <div
      ref={componentRef}
      id={`component-${id}`}
      className="circuit-component absolute select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #3b82f6' : 'none',
        borderRadius: '4px',
        zIndex: isSelected ? 10 : 1
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {/* HERO Board Image - Using the exact same image from 30 Days Lost in Space sandbox */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={heroBoardImage} 
          alt="HERO Board" 
          className="w-full h-full object-contain"
          style={{
            filter: isSelected ? 'brightness(1.2)' : 'none',
            transition: 'filter 0.2s',
            imageRendering: 'crisp-edges',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
      
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
            className={`circuit-pin pin-point absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair border-2 shadow-md ${
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
            <div className="pin-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
              {pin.label} ({isActive ? 'HIGH' : 'LOW'})
            </div>
          </div>
        );
      })}
      
      {/* Component label */}
      <div 
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center whitespace-nowrap bg-gray-800 text-white px-1 rounded"
      >
        HERO Board
      </div>
    </div>
  );
}