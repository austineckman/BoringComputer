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

/**
 * LED Component
 * 
 * Renders an LED that lights up based on the connected pin state
 * from the emulator. This demonstrates proper signal-driven component
 * behavior rather than hardcoded visuals.
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
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [connecting, setConnecting] = useState<string | null>(null);
  const ledRef = useRef<HTMLDivElement>(null);
  
  // Determine if LED is lit based on connected pin state
  const isLit = React.useMemo(() => {
    // Get the anode connection (pin where positive voltage is applied)
    const anodeConnection = connections['anode'];
    
    if (!anodeConnection) return false;
    
    // Check if the connected pin is HIGH
    const connectedPinState = pinStates[anodeConnection];
    return connectedPinState?.isHigh || false;
  }, [connections, pinStates]);
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the LED body, not pins or controls
    if (
      (e.target as HTMLElement).classList.contains('pin') ||
      (e.target as HTMLElement).classList.contains('control')
    ) {
      return;
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
    
    onSelect();
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStart) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Calculate new position based on current position and drag offset
    if (ledRef.current) {
      const rect = ledRef.current.getBoundingClientRect();
      onMove(rect.left + dx, rect.top + dy);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDragStart(null);
  };
  
  // Add and remove event listeners for dragging
  useEffect(() => {
    if (dragStart) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    
    return undefined;
  }, [dragStart]);
  
  // Handle rotation
  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    onRotate(newRotation);
  };
  
  // Handle pin click for connecting
  const handlePinClick = (pin: string) => {
    setConnecting(pin);
  };
  
  // Connect to a board pin
  const connectToBoardPin = (boardPin: string) => {
    if (connecting) {
      onConnect(connecting, boardPin);
      setConnecting(null);
    }
  };
  
  return (
    <div
      ref={ledRef}
      className={`relative flex flex-col items-center w-16 h-20 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      style={{ transform: `rotate(${rotation}deg)` }}
      onMouseDown={handleMouseDown}
    >
      {/* LED Body */}
      <div 
        className={`w-8 h-8 rounded-full ${
          isLit ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-red-200'
        } border border-gray-300`}
      />
      
      {/* LED Legs/Pins */}
      <div className="flex gap-4 mt-1">
        <div 
          className="pin h-8 w-1 bg-gray-400 cursor-pointer hover:bg-blue-500"
          onClick={() => handlePinClick('anode')}
          title="Anode (+)"
        />
        <div 
          className="pin h-8 w-1 bg-gray-400 cursor-pointer hover:bg-blue-500"
          onClick={() => handlePinClick('cathode')}
          title="Cathode (-)"
        />
      </div>
      
      {/* Connection Labels */}
      <div className="flex gap-2 mt-1 text-xs">
        <div>+</div>
        <div>-</div>
      </div>
      
      {/* Controls (only visible when selected) */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex gap-1">
          <button
            className="control p-1 bg-white rounded-full shadow hover:bg-gray-100"
            onClick={handleRotate}
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            className="control p-1 bg-white rounded-full shadow hover:bg-red-100"
            onClick={onRemove}
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Component ID label */}
      {isSelected && (
        <div className="absolute -bottom-5 left-0 text-xs">
          {id}
        </div>
      )}
      
      {/* Connection Status */}
      {connecting && (
        <div className="absolute -top-8 left-0 text-xs bg-blue-100 p-1 rounded">
          Connecting {connecting}...
        </div>
      )}
    </div>
  );
}