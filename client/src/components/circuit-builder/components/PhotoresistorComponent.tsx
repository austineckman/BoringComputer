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
        {/* Define gradients and patterns */}
        <defs>
          {/* Light-sensitive window gradient based on brightness */}
          <linearGradient id={`brightness-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={darkColor} />
            <stop offset={`${brightnessPct}%`} stopColor={lightColor} />
          </linearGradient>
          
          {/* Surface texture */}
          <pattern id={`photoresistor-grid-${id}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
            <path d="M 0,0 L 0,2" stroke="#444" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        
        {/* Photoresistor body - LDR shape with epoxy coating */}
        <ellipse cx="0" cy="0" rx="10" ry="10" fill="#1e1e1e" />
        <ellipse cx="0" cy="0" rx="9" ry="9" fill="#333" />
        
        {/* Light-sensitive zig-zag pattern */}
        <path 
          d="M -6,0 
             C -6,-4 -4,-6 0,-6 
             C 4,-6 6,-4 6,0 
             C 6,4 4,6 0,6 
             C -4,6 -6,4 -6,0" 
          fill="none" 
          stroke="#888" 
          strokeWidth="1.2" 
          strokeDasharray="1,0.5" 
        />
        
        {/* Light-sensitive element with brightness indication */}
        <circle 
          cx="0" 
          cy="0" 
          r="6" 
          fill={`url(#brightness-${id})`} 
          opacity="0.9" 
        />
        <circle 
          cx="0" 
          cy="0" 
          r="6" 
          fill={`url(#photoresistor-grid-${id})`} 
          opacity="0.5" 
        />
        
        {/* Highlight to show 3D nature */}
        <ellipse cx="-2" cy="-2" rx="3" ry="2" fill="#fff" opacity="0.15" />
        
        {/* Leads - metal legs */}
        <line x1="-15" y1="0" x2="-9" y2="0" stroke="#aaa" strokeWidth="1.2" />
        <line x1="9" y1="0" x2="15" y2="0" stroke="#aaa" strokeWidth="1.2" />
        
        {/* Light indicator symbols */}
        <path 
          d="M 14,-8 L 11,-5 M 16,-7 L 13,-4 M 18,-6 L 15,-3" 
          stroke="#ffcc33" 
          strokeWidth="0.8" 
          fill="none" 
        />
        
        {/* LDR symbol */}
        <path 
          d="M -14,-10 L -13,-11 L -12,-10" 
          stroke="#888" 
          strokeWidth="0.6" 
          fill="none" 
        />
        <path 
          d="M -15,-8 L -14,-9 L -13,-8" 
          stroke="#888" 
          strokeWidth="0.6" 
          fill="none" 
        />
        
        {/* Value display */}
        <text 
          x="0" 
          y="14" 
          fontSize="5" 
          fontWeight="bold"
          textAnchor="middle" 
          fill="#eee"
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