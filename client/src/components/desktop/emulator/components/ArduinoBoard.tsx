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

// Pin definitions for Arduino UNO
const ARDUINO_PINS = [
  // Digital pins
  { id: '0', x: 270, y: 30, label: 'D0', type: 'digital' },
  { id: '1', x: 270, y: 45, label: 'D1', type: 'digital' },
  { id: '2', x: 270, y: 60, label: 'D2', type: 'digital' },
  { id: '3', x: 270, y: 75, label: 'D3', type: 'digital' },
  { id: '4', x: 270, y: 90, label: 'D4', type: 'digital' },
  { id: '5', x: 270, y: 105, label: 'D5', type: 'digital' },
  { id: '6', x: 270, y: 120, label: 'D6', type: 'digital' },
  { id: '7', x: 270, y: 135, label: 'D7', type: 'digital' },
  { id: '8', x: 270, y: 150, label: 'D8', type: 'digital' },
  { id: '9', x: 270, y: 165, label: 'D9', type: 'digital' },
  { id: '10', x: 240, y: 165, label: 'D10', type: 'digital' },
  { id: '11', x: 210, y: 165, label: 'D11', type: 'digital' },
  { id: '12', x: 180, y: 165, label: 'D12', type: 'digital' },
  { id: '13', x: 150, y: 165, label: 'D13', type: 'digital' },
  
  // Analog pins
  { id: 'A0', x: 30, y: 165, label: 'A0', type: 'analog' },
  { id: 'A1', x: 45, y: 165, label: 'A1', type: 'analog' },
  { id: 'A2', x: 60, y: 165, label: 'A2', type: 'analog' },
  { id: 'A3', x: 75, y: 165, label: 'A3', type: 'analog' },
  { id: 'A4', x: 90, y: 165, label: 'A4', type: 'analog' },
  { id: 'A5', x: 105, y: 165, label: 'A5', type: 'analog' },
  
  // Power pins
  { id: 'GND', x: 30, y: 30, label: 'GND', type: 'power' },
  { id: '5V', x: 30, y: 45, label: '5V', type: 'power' },
  { id: '3V3', x: 30, y: 60, label: '3.3V', type: 'power' },
  
  // Built-in LED at pin 13
  { id: 'LED_BUILTIN', x: 150, y: 120, label: 'LED', type: 'led' }
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
 * from the emulator.
 */
export function ArduinoBoard({
  id,
  pinStates,
  isSelected,
  onSelect,
  onMove
}: ArduinoBoardProps) {
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the board, not pins
    if ((e.target as HTMLElement).classList.contains('pin')) {
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
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
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
  
  return (
    <div
      ref={boardRef}
      className={`relative w-[300px] h-[200px] cursor-move ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onMouseDown={handleMouseDown}
    >
      {/* Arduino Board SVG */}
      <div 
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: ARDUINO_BOARD_SVG }}
      />
      
      {/* Pins */}
      {ARDUINO_PINS.map(pin => {
        const state = pinStates[pin.id];
        const isActive = state?.isHigh || false;
        
        return (
          <div
            key={pin.id}
            className={`pin absolute w-4 h-4 rounded-full border cursor-pointer ${
              pin.type === 'power' ? 'bg-yellow-500' : 
              pin.type === 'analog' ? 'bg-blue-500' : 
              pin.type === 'led' ? (isActive ? 'bg-red-500' : 'bg-gray-500') : 
              (isActive ? 'bg-green-500' : 'bg-gray-500')
            }`}
            style={{
              left: pin.x - 8,
              top: pin.y - 8
            }}
            title={`${pin.label} (${pin.id}): ${isActive ? 'HIGH' : 'LOW'}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent board selection
              // This could trigger a pin connection in the future
            }}
          />
        );
      })}
      
      {/* Board ID label */}
      <div className="absolute bottom-1 right-1 text-xs text-white">
        {id}
      </div>
    </div>
  );
}