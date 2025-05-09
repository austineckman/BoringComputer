import React, { useState, useRef, useEffect } from 'react';
import { PinState } from '../EmulatorContext';
import { RotateCw, X } from 'lucide-react';

interface LEDProps {
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

// Type definition for pin positions (matching CircuitComponent)
interface PinConfig {
  id: string;
  type: 'input' | 'output' | 'bidirectional';
  label?: string;
}

/**
 * LED Component
 * 
 * Renders an LED that lights up based on the connected pin state
 * from the emulator. This demonstrates proper signal-driven component
 * behavior rather than hardcoded visuals.
 * 
 * Follows the same styling as the circuit-builder/components/CircuitComponent.jsx
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [connecting, setConnecting] = useState<string | null>(null);
  const ledRef = useRef<HTMLDivElement>(null);
  const width = 100;
  const height = 100;
  
  // Define pins in the same format as CircuitComponent
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
    onSelect();
  };
  
  // Handle mouse down on component for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button === 0) { // Left mouse button
      const rect = ledRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };

  // Generate a pin position based on its ID
  const generatePinPosition = (pinId: string) => {
    // Default position (center)
    let x = 0.5; 
    let y = 0.5;
    
    // Set positions for LED pins
    if (pinId === 'anode') {
      x = 0.5; 
      y = 0.1;
    } else if (pinId === 'cathode') {
      x = 0.5; 
      y = 0.9;
    }
    
    return { x, y };
  };
  
  // Calculate pin position
  const getPinPosition = (pin: PinConfig) => {
    const pinPosition = generatePinPosition(pin.id);
    
    // Create a new position that's relative to the component
    const newPosition = {
      x: position.x + pinPosition.x * width,
      y: position.y + pinPosition.y * height
    };
    
    // Store the pin position in the global cache for wire connections
    if (!window.pinPositionCache) {
      window.pinPositionCache = new Map();
    }
    
    const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pin.id}`;
    
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
  
  // Handle pin click for connecting
  const handlePinClick = (pinId: string, pinType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setConnecting(pinId);
    
    // Calculate exact pin position
    const pinConfig = pins.find(p => p.id === pinId);
    if (pinConfig) {
      const pinPosition = getPinPosition(pinConfig);
      
      // Create pin ID with consistent format
      const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pinId}`;
      
      // Create a detailed event with stable position data
      const clickEvent = new CustomEvent('pinClicked', {
        detail: {
          id: formattedPinId,
          pinId,
          componentId: id,
          pinType,
          clientX: pinPosition.x,
          clientY: pinPosition.y,
          componentType: 'led',
          pinData: JSON.stringify({
            x: pinPosition.x,
            y: pinPosition.y,
            origComponentX: position.x,
            origComponentY: position.y,
            pinId: pinId,
            componentId: id,
            formattedId: formattedPinId,
            type: pinType
          })
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
          setConnecting(null);
          
          // Clean up event listener
          document.removeEventListener('pinToConnect', pinToConnectHandler);
        }
      };
      
      // Add event listener for pin connection
      document.addEventListener('pinToConnect', pinToConnectHandler);
      
      // Create a timeout to clear the connecting state if no connection is made
      setTimeout(() => {
        if (connecting === pinId) {
          setConnecting(null);
          document.removeEventListener('pinToConnect', pinToConnectHandler);
        }
      }, 10000); // 10 second timeout
    }
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
      pins.forEach(pin => {
        const pinPos = getPinPosition(pin);
        const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pin.id}`;
        
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
  
  // Handle rotation
  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    onRotate(newRotation);
  };

  // Register pins for wire connections
  useEffect(() => {
    pins.forEach(pin => {
      const pinPosition = getPinPosition(pin);
      const formattedPinId = `pt-led-${id.replace(/ /g, '')}-${pin.id}`;
      
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
      ref={ledRef}
      id={`component-${id}`}
      className="circuit-component absolute select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        transform: `rotate(${rotation}deg)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: isSelected ? '2px solid #3b82f6' : 'none',
        borderRadius: '4px'
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
        const pinPos = getPinPosition(pin);
        const pinRelativeX = (pinPos.x - position.x) / width;
        const pinRelativeY = (pinPos.y - position.y) / height;
        
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
              left: `${pinRelativeX * 100}%`,
              top: `${pinRelativeY * 100}%`,
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
      
      {/* Connection Status */}
      {connecting && (
        <div className="absolute -top-8 left-0 text-xs bg-blue-100 text-blue-800 p-1 rounded">
          Connecting {connecting}...
        </div>
      )}
    </div>
  );
}