import React from 'react';

export interface PinPosition {
  id: string;
  x: number;
  y: number;
}

interface CircuitPinProps {
  id: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  onClick: () => void;
}

const CircuitPin: React.FC<CircuitPinProps> = ({
  id,
  x,
  y,
  size = 6,
  color = '#ffcc00',
  onClick
}) => {
  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-125 z-10"
      style={{
        left: `${x - size/2}px`,
        top: `${y - size/2}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onClick={onClick}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={size/2 - 0.5} 
          fill={color} 
          stroke="#333" 
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
};

export default CircuitPin;