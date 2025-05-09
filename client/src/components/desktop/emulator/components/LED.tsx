import React, { useState, useRef, useEffect } from 'react';
import { PinState } from '../EmulatorContext';
import { RotateCw, X } from 'lucide-react';

export interface LEDProps {
  id: string;
  pinStates: Record<string | number, PinState>;
  connections: Record<string, string>;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onRotate: (rotation: number) => void;
  onConnect: (pin: string, boardPin: string) => void;
  onRemove: () => void;
}

interface PinConfig {
  id: string;
  type: 'input' | 'output' | 'bidirectional';
  label?: string;
  position?: { x: number, y: number };
}

// Declare window properties for TypeScript
declare global {
  interface Window {
    pinPositionCache: Map<string, any>;
    _lastMoveEventTime: number | null;
  }
}

/**
 * LED Component - Exact implementation from sandbox CircuitComponent
 * 
 * This component is an exact match to the behavior in the sandbox app's
 * CircuitComponent.jsx, with the same pin management, position calculation,
 * and event handling mechanisms.
 */
export function LED({
  id,
  pinStates,
  connections,
  isSelected,
  onSelect,
  onMove,
  onRotate,
  onConnect,
  onRemove
}: LEDProps) {
  // State for component position and interaction
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  
  // Refs
  const componentRef = useRef<HTMLDivElement>(null);
  
  // Component dimensions
  const width = 100;
  const height = 100;
  
  // Define LED pins
  const pins: PinConfig[] = [
    { id: 'anode', type: 'input', label: 'Anode (+)' },
    { id: 'cathode', type: 'output', label: 'Cathode (-)' }
  ];
  
  // Determine if LED is lit based on connected pin state
  const isLit = React.useMemo(() => {
    // Get the anode connection (pin where positive voltage is applied)
    const anodeConnection = connections['anode'];
    if (!anodeConnection) return false;
    
    // Check if the connected pin is HIGH
    const connectedPinState = pinStates[anodeConnection];
    return connectedPinState?.isHigh || false;
  }, [connections, pinStates]);
  
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
  
  // Handle pin click - FIXED for improved position stability
  const handlePinClick = (pinId: string, pinType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (true) { // equivalent to onPinConnect in CircuitComponent
      // Calculate exact pin position
      const pinPosition = getPinPosition({ id: pinId } as PinConfig);
      
      // Create pin ID with consistent format
      const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pinId}`;
      
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
        pinId: pinId,
        componentId: id,
        formattedId: formattedPinId,
        type: pinType
      };
      
      // Save to global cache for future reference
      window.pinPositionCache.set(formattedPinId, pinPositionData);
      
      // Create a detailed event with stable position data from our cache
      const clickEvent = new CustomEvent('pinClicked', {
        detail: {
          id: formattedPinId,
          pinId,
          componentId: id,
          pinType,
          clientX: pinPosition.x,
          clientY: pinPosition.y,
          componentType: 'led',
          // Include full position data to ensure consistency
          pinData: JSON.stringify(pinPositionData)
        },
        bubbles: true
      });
      
      // Dispatch the detailed event
      document.dispatchEvent(clickEvent);
      
      // Listen for the pinToConnect event which will be fired when a second pin is clicked
      const pinToConnectHandler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail && detail.boardPin && detail.componentPin === pinId && detail.componentId === id) {
          onConnect(pinId, detail.boardPin);
          
          // Clean up event listener
          document.removeEventListener('pinToConnect', pinToConnectHandler);
        }
      };
      
      // Add event listener for pin connection
      document.addEventListener('pinToConnect', pinToConnectHandler);
    }
  };
  
  // Calculate the position of pins with stable positioning - exactly as in CircuitComponent
  const getPinPosition = (pinConfig: PinConfig) => {
    // Check if this pin already has a position in our stable cache
    const componentType = 'led';
    const pinId = pinConfig.id;
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
    
    // Otherwise calculate a new position based on the pin ID and component type
    const pinPosition = pinConfig.position || generatePinPosition(pinConfig.id);
    
    // Calculate position without rotation adjustment (matching CircuitComponent)
    const newPosition = {
      x: position.x + pinPosition.x * width,
      y: position.y + pinPosition.y * height
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
      pin: pinConfig.id
    });
    
    return newPosition;
  };
  
  // Generate a pin position based on its ID - copied from CircuitComponent
  const generatePinPosition = (pinId: string) => {
    // Default position (center)
    let x = 0.5; 
    let y = 0.5;
    
    // LED component - Using exact same positions as CircuitComponent
    if (pinId === 'anode') {
      x = 0.5; 
      y = 0.1;
    } else if (pinId === 'cathode') {
      x = 0.5; 
      y = 0.9;
    }
    
    return { x, y };
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
              const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pinId}`;
              
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
            const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pinId}`;
            
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
  
  // Handle rotation - matches CircuitComponent, but with parent callback
  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    
    // Call the parent's onRotate handler
    if (onRotate) {
      onRotate(newRotation);
    }
  };
  
  // Register pins in the global pin registry
  useEffect(() => {
    pins.forEach(pin => {
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
      pins.forEach(pin => {
        const event = new CustomEvent('unregisterPin', {
          detail: {
            id: `${id}-${pin.id}`
          }
        });
        
        document.dispatchEvent(event);
      });
    };
  }, [id, pins, position]);

  return (
    <div
      ref={componentRef}
      id={`component-${id}`}
      className="circuit-component absolute select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
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
      {/* LED Body */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div 
          className={`w-16 h-16 rounded-full ${
            isLit ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-red-200'
          } border-2 border-gray-400 flex items-center justify-center`}
        >
          <span className="text-xs font-mono text-gray-800">LED</span>
        </div>
      </div>
      
      {/* Component pins - using the exact same style as CircuitComponent */}
      {pins.map(pin => {
        const pinPosition = generatePinPosition(pin.id);
        
        return (
          <div
            key={pin.id}
            id={`${id}-${pin.id}`}
            data-pin-id={pin.id}
            className={`circuit-pin pin-point absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair border-2 shadow-md ${
              pin.type === 'input' ? 'bg-green-500 border-green-700' : 
              pin.type === 'output' ? 'bg-red-500 border-red-700' : 
              'bg-blue-500 border-blue-700' // bidirectional
            }`}
            style={{
              left: `${pinPosition.x * 100}%`,
              top: `${pinPosition.y * 100}%`,
              zIndex: 20
            }}
            onClick={(e) => handlePinClick(pin.id, pin.type, e)}
            title={pin.label || pin.id}
          >
            {/* Pin hover tooltip */}
            <div className="pin-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1 py-0.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {pin.label || pin.id}
            </div>
          </div>
        );
      })}
      
      {/* Component label */}
      <div 
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center whitespace-nowrap bg-gray-800 text-white px-1 rounded"
      >
        LED
      </div>
      
      {/* Controls (only visible when selected) */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <button
            className="control p-1 bg-gray-700 rounded-full shadow hover:bg-gray-600 text-white"
            onClick={handleRotate}
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            className="control p-1 bg-red-700 rounded-full shadow hover:bg-red-600 text-white"
            onClick={onRemove}
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}