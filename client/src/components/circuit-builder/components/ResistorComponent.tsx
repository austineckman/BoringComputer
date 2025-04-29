import React from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const ResistorComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, top, left, value = '220' } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default horizontal orientation
      pin1: { x: -25, y: 0 }, // Left pin
      pin2: { x: 25, y: 0 },  // Right pin
    },
    90: { // Vertical orientation
      pin1: { x: 0, y: -25 }, // Top pin
      pin2: { x: 0, y: 25 },  // Bottom pin
    },
    180: { // Horizontal flipped
      pin1: { x: 25, y: 0 },  // Right pin
      pin2: { x: -25, y: 0 }, // Left pin
    },
    270: { // Vertical flipped
      pin1: { x: 0, y: 25 },  // Bottom pin
      pin2: { x: 0, y: -25 }, // Top pin
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Determine color bands based on resistance value
  // This is a simplified version that just uses different colors 
  // for standard resistor values
  let colorBands = ['brown', 'black', 'brown', 'gold']; // 100 ohm default
  
  if (typeof value === 'string' || typeof value === 'number') {
    const resistanceValue = parseInt(value.toString(), 10);
    if (resistanceValue === 220) {
      colorBands = ['red', 'red', 'brown', 'gold']; // 220 ohm
    } else if (resistanceValue === 330) {
      colorBands = ['orange', 'orange', 'brown', 'gold']; // 330 ohm
    } else if (resistanceValue === 1000 || resistanceValue === 1) {
      colorBands = ['brown', 'black', 'red', 'gold']; // 1k ohm
    } else if (resistanceValue === 4700 || resistanceValue === 4.7) {
      colorBands = ['yellow', 'violet', 'red', 'gold']; // 4.7k ohm
    } else if (resistanceValue === 10000 || resistanceValue === 10) {
      colorBands = ['brown', 'black', 'orange', 'gold']; // 10k ohm
    } else if (resistanceValue === 100000 || resistanceValue === 100) {
      colorBands = ['brown', 'black', 'yellow', 'gold']; // 100k ohm
    } else if (resistanceValue === 1000000 || resistanceValue === 1000) {
      colorBands = ['brown', 'black', 'green', 'gold']; // 1M ohm
    }
  }
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={60}
      height={20}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="60" height="20" viewBox="-30 -10 60 20" xmlns="http://www.w3.org/2000/svg">
        {/* Resistor body - using actual through-hole resistor shape */}
        <defs>
          <linearGradient id={`resistor-grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f5efe5" />
            <stop offset="50%" stopColor="#e8dccb" />
            <stop offset="100%" stopColor="#d1c7b7" />
          </linearGradient>
        </defs>
        
        {/* Rounded-end resistor body */}
        <path 
          d="M-15,0 
             C-15,-4 -15,-7 -12,-7 
             H12 
             C15,-7 15,-4 15,0 
             C15,4 15,7 12,7 
             H-12 
             C-15,7 -15,4 -15,0 Z" 
          fill="url(#resistor-grad-${id})" 
          stroke="#bbb" 
          strokeWidth="0.5" 
        />
        
        {/* Color bands */}
        <rect x="-12" y="-7" width="3.5" height="14" rx="0.5" fill={colorBands[0]} />
        <rect x="-6" y="-7" width="3.5" height="14" rx="0.5" fill={colorBands[1]} />
        <rect x="0" y="-7" width="3.5" height="14" rx="0.5" fill={colorBands[2]} />
        <rect x="9" y="-7" width="3.5" height="14" rx="0.5" fill={colorBands[3]} />
        
        {/* Leads - metal wire */}
        <line x1="-25" y1="0" x2="-15" y2="0" stroke="#aaa" strokeWidth="1.2" />
        <line x1="15" y1="0" x2="25" y2="0" stroke="#aaa" strokeWidth="1.2" />
        
        {/* Shadow effect */}
        <path 
          d="M-15,0 C-15,4 -15,7 -12,7 H12 C15,7 15,4 15,0" 
          fill="none" 
          stroke="#aaa" 
          strokeWidth="0.5" 
          opacity="0.3" 
        />
        
        {/* Highlight effect */}
        <path 
          d="M-15,0 C-15,-4 -15,-7 -12,-7 H12 C15,-7 15,-4 15,0" 
          fill="none" 
          stroke="#fff" 
          strokeWidth="0.5" 
          opacity="0.5" 
        />
        
        {/* Value label */}
        <text 
          x="0" 
          y="-12" 
          fontSize="5" 
          fontWeight="bold"
          textAnchor="middle" 
          fill="#555"
          style={{ pointerEvents: 'none' }}
        >
          {value}Ω
        </text>
      </svg>
      
      {/* Connection pins */}
      <CircuitPin
        id={`${id}-pin1`}
        x={30 + currentPins.pin1.x}
        y={10 + currentPins.pin1.y}
        onClick={() => onPinClicked(`${id}-pin1`)}
      />
      <CircuitPin
        id={`${id}-pin2`}
        x={30 + currentPins.pin2.x}
        y={10 + currentPins.pin2.y}
        onClick={() => onPinClicked(`${id}-pin2`)}
      />
    </BaseComponent>
  );
};

export default ResistorComponent;