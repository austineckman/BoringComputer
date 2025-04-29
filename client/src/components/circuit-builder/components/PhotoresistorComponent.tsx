import React from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const PhotoresistorComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, top, left, value = 512 } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default horizontal orientation
      pin1: { x: -15, y: 0 }, // Left pin
      pin2: { x: 15, y: 0 },  // Right pin
    },
    90: { // Vertical orientation
      pin1: { x: 0, y: -15 }, // Top pin
      pin2: { x: 0, y: 15 },  // Bottom pin
    },
    180: { // Horizontal flipped
      pin1: { x: 15, y: 0 },  // Right pin
      pin2: { x: -15, y: 0 }, // Left pin
    },
    270: { // Vertical flipped
      pin1: { x: 0, y: 15 },  // Bottom pin
      pin2: { x: 0, y: -15 }, // Top pin
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Convert the sensor value (0-1023) to a brightness percentage
  const brightnessPct = typeof value === 'number' 
    ? Math.min(100, Math.max(0, (value / 1023) * 100)) 
    : 50;
  
  // Calculate gradient colors based on brightness
  const darkColor = '#111';
  const lightColor = '#ffcc33';
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={40}
      height={30}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="40" height="30" viewBox="-20 -15 40 30" xmlns="http://www.w3.org/2000/svg">
        {/* Photoresistor body */}
        <rect x="-10" y="-7" width="20" height="14" rx="2" fill="#333" />
        
        {/* Light-sensitive window with brightness */}
        <rect 
          x="-6" 
          y="-5" 
          width="12" 
          height="10" 
          rx="1" 
          fill={`url(#brightness-${id})`} 
        />
        
        {/* Define gradient based on brightness */}
        <defs>
          <linearGradient id={`brightness-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkColor} />
            <stop offset={`${brightnessPct}%`} stopColor={lightColor} />
          </linearGradient>
        </defs>
        
        {/* Leads */}
        <line x1="-15" y1="0" x2="-10" y2="0" stroke="#999" strokeWidth="1.5" />
        <line x1="10" y1="0" x2="15" y2="0" stroke="#999" strokeWidth="1.5" />
        
        {/* Light-sensitive symbol */}
        <path 
          d="M 0 -12 L 3 -15 M 5 -10 L 8 -13 M 7 -5 L 10 -8" 
          stroke="#ffcc33" 
          strokeWidth="0.8" 
          fill="none" 
        />
        
        {/* Value display */}
        <text 
          x="0" 
          y="12" 
          fontSize="5" 
          textAnchor="middle" 
          fill="#fff"
          style={{ pointerEvents: 'none' }}
        >
          {typeof value === 'number' ? value : 'N/A'}
        </text>
      </svg>
      
      {/* Connection pins */}
      <CircuitPin
        id={`${id}-pin1`}
        x={20 + currentPins.pin1.x}
        y={15 + currentPins.pin1.y}
        onClick={() => onPinClicked(`${id}-pin1`)}
      />
      <CircuitPin
        id={`${id}-pin2`}
        x={20 + currentPins.pin2.x}
        y={15 + currentPins.pin2.y}
        onClick={() => onPinClicked(`${id}-pin2`)}
      />
    </BaseComponent>
  );
};

export default PhotoresistorComponent;