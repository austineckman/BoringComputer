import React from 'react';
import { PinPosition } from './CircuitPin';

interface CircuitWireProps {
  id: string;
  startPin: PinPosition;
  endPin: PinPosition;
  color?: string;
  selected?: boolean;
  onClick?: (id: string) => void;
}

const CircuitWire: React.FC<CircuitWireProps> = ({
  id,
  startPin,
  endPin,
  color = '#3b82f6',
  selected = false,
  onClick
}) => {
  // Calculate the midpoint between start and end pins for curved wires
  const midX = (startPin.x + endPin.x) / 2;
  const midY = (startPin.y + endPin.y) / 2;
  
  // Determine if we should use a curved wire (for longer distances)
  const distance = Math.sqrt(
    Math.pow(endPin.x - startPin.x, 2) + 
    Math.pow(endPin.y - startPin.y, 2)
  );
  
  // Use curved wires for longer distances
  const useCurvedWire = distance > 80;
  
  // Control point offset for curved wires (perpendicular to the wire)
  const dx = endPin.x - startPin.x;
  const dy = endPin.y - startPin.y;
  const perpX = -dy * 0.3; // Perpendicular direction
  const perpY = dx * 0.3;  // Perpendicular direction
  
  // Path definition for the wire
  let path;
  if (useCurvedWire) {
    path = `M ${startPin.x} ${startPin.y} Q ${midX + perpX} ${midY + perpY}, ${endPin.x} ${endPin.y}`;
  } else {
    path = `M ${startPin.x} ${startPin.y} L ${endPin.x} ${endPin.y}`;
  }
  
  // Handle wire click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(id);
    }
  };
  
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none" 
      style={{ zIndex: 5 }}
    >
      {/* Wire highlight for selected wires */}
      {selected && (
        <path
          d={path}
          stroke="#ffffff"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={0.5}
        />
      )}
      
      {/* Main wire */}
      <path
        d={path}
        stroke={color}
        strokeWidth={selected ? 3 : 2}
        fill="none"
        strokeLinecap="round"
        className="pointer-events-auto cursor-pointer"
        onClick={handleClick}
      />
    </svg>
  );
};

export default CircuitWire;