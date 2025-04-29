import React from 'react';

interface PinPosition {
  id: string;
  x: number;
  y: number;
}

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
  // Calculate control points for a curved wire
  const dx = endPin.x - startPin.x;
  const dy = endPin.y - startPin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate a good curve control point
  // For short wires, make a small curve, for longer wires, make a larger curve
  const curveHeight = Math.min(40, distance * 0.3);
  
  // Calculate midpoint
  const midX = (startPin.x + endPin.x) / 2;
  const midY = (startPin.y + endPin.y) / 2;
  
  // Calculate perpendicular control point
  // This gives the wire a nice curved appearance
  const angle = Math.atan2(dy, dx) + Math.PI / 2;
  const controlX = midX + curveHeight * Math.cos(angle);
  const controlY = midY + curveHeight * Math.sin(angle);
  
  // SVG path for a quadratic Bezier curve
  const path = `M ${startPin.x} ${startPin.y} Q ${controlX} ${controlY}, ${endPin.x} ${endPin.y}`;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(id);
    }
  };
  
  // Use a glow effect for selected wires
  const strokeWidth = selected ? 3 : 2;
  const selectedFilter = selected ? 'drop-shadow(0 0 2px white)' : 'none';
  
  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        style={{ 
          filter: selectedFilter,
          pointerEvents: 'stroke'
        }}
        onClick={handleClick}
        className="cursor-pointer"
      />
      
      {/* Terminal points to show connection */}
      <circle 
        cx={startPin.x} 
        cy={startPin.y} 
        r={3} 
        fill={color} 
        opacity={0.7}
      />
      <circle 
        cx={endPin.x} 
        cy={endPin.y} 
        r={3} 
        fill={color} 
        opacity={0.7}
      />
    </svg>
  );
};

export default CircuitWire;