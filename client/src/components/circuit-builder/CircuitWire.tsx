import React from 'react';
import { PinPosition } from './CircuitPin';

interface CircuitWireProps {
  id: string;
  startPin: PinPosition;
  endPin: PinPosition;
  color?: string;
  thickness?: number;
  selected?: boolean;
  onClick?: (id: string) => void;
}

const CircuitWire: React.FC<CircuitWireProps> = ({ 
  id, 
  startPin, 
  endPin, 
  color = '#3b82f6', 
  thickness = 2,
  selected = false,
  onClick
}) => {
  // Calculate the path for a curved wire
  const createPath = () => {
    const dx = endPin.x - startPin.x;
    const dy = endPin.y - startPin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // For shorter wires, use a straight line
    if (distance < 50) {
      return `M ${startPin.x} ${startPin.y} L ${endPin.x} ${endPin.y}`;
    }
    
    // For longer wires, create a curved path with control points
    const mx = startPin.x + dx * 0.5;
    const my = startPin.y + dy * 0.5;
    
    // Calculate control points perpendicular to the direct line
    const perpX = -dy * 0.2;
    const perpY = dx * 0.2;
    
    // Create a curved path
    return `M ${startPin.x} ${startPin.y} 
            C ${startPin.x + dx/3 + perpX} ${startPin.y + dy/3 + perpY}, 
              ${startPin.x + dx*2/3 + perpX} ${startPin.y + dy*2/3 + perpY}, 
              ${endPin.x} ${endPin.y}`;
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(id);
  };
  
  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    >
      <path
        d={createPath()}
        stroke={color}
        strokeWidth={selected ? thickness + 2 : thickness}
        fill="none"
        strokeLinecap="round"
        className={`transition-all duration-100 ${selected ? 'stroke-yellow-400' : ''}`}
        style={{ pointerEvents: 'stroke' }}
        onClick={handleClick}
      />
      
      {/* Selected wire highlight */}
      {selected && (
        <path
          d={createPath()}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  );
};

export default CircuitWire;