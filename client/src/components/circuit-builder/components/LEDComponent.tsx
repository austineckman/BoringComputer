import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

const LEDComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate, top, left, color = 'red', brightness = 100 } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default orientation (LED pointing up)
      pin1: { x: 0, y: -20 }, // Top pin (anode)
      pin2: { x: 0, y: 20 },  // Bottom pin (cathode)
    },
    90: { // Rotated 90 degrees clockwise
      pin1: { x: 20, y: 0 },  // Right pin
      pin2: { x: -20, y: 0 }, // Left pin
    },
    180: { // Rotated 180 degrees
      pin1: { x: 0, y: 20 },  // Bottom pin
      pin2: { x: 0, y: -20 }, // Top pin
    },
    270: { // Rotated 270 degrees
      pin1: { x: -20, y: 0 }, // Left pin
      pin2: { x: 20, y: 0 },  // Right pin
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Calculate brightness opacity (0.2 to 1.0)
  const ledOpacity = 0.2 + (brightness / 100) * 0.8;
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={40}
      height={40}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        {/* LED Package - round 5mm style */}
        <defs>
          <radialGradient id={`led-glow-${id}`} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <stop offset="0%" stopColor={color} stopOpacity={ledOpacity} />
            <stop offset="40%" stopColor={color} stopOpacity={ledOpacity * 0.8} />
            <stop offset="80%" stopColor={color} stopOpacity={ledOpacity * 0.2} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        
        {/* LED body - epoxy dome */}
        <ellipse cx="20" cy="15" rx="10" ry="10" fill="#eee" opacity="0.3" />
        <circle cx="20" cy="20" r="8" fill="#ececec" /> 
        
        {/* Inner LED die */}
        <circle cx="20" cy="20" r="6" fill="#ddd" />
        <circle cx="20" cy="20" r="4" fill={color} opacity={ledOpacity > 0.3 ? 0.8 : 0.3} />
        
        {/* Glowing effect when on */}
        {ledOpacity > 0.5 && (
          <circle 
            cx="20" 
            cy="20" 
            r="12" 
            fill={`url(#led-glow-${id})`} 
          />
        )}
        
        {/* Leads */}
        <line x1="16" y1="28" x2="16" y2="38" stroke="#aaa" strokeWidth="1.5" />
        <line x1="24" y1="28" x2="24" y2="38" stroke="#aaa" strokeWidth="1.5" />
        
        {/* Package base */}
        <rect x="15" y="25" width="10" height="3" rx="1" fill="#333" />
        
        {/* Refraction highlight */}
        <ellipse cx="18" cy="17" rx="2" ry="1" fill="#fff" opacity="0.7" transform="rotate(-20 18 17)" />
        
        {/* Polarity indicator (longer lead is anode/positive) */}
        <text x="14" y="36" fontSize="6" fill="#666">-</text>
        <text x="22" y="36" fontSize="6" fill="#666">+</text>
      </svg>

      {/* Pin connections */}
      <CircuitPin
        id={`${id}-pin1`}
        x={20 + currentPins.pin1.x}
        y={20 + currentPins.pin1.y}
        onClick={() => onPinClicked(`${id}-pin1`)}
      />
      <CircuitPin
        id={`${id}-pin2`}
        x={20 + currentPins.pin2.x}
        y={20 + currentPins.pin2.y}
        onClick={() => onPinClicked(`${id}-pin2`)}
      />
    </BaseComponent>
  );
};

export default LEDComponent;