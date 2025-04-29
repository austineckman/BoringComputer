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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Use real resistor image */}
        <img
          src="/assets/components/resistor.icon.png"
          alt="Resistor Component"
          className="w-full h-full object-contain"
        />
        
        {/* Value label */}
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white/80 px-1 rounded text-xs"
          style={{ fontSize: '8px', pointerEvents: 'none' }}
        >
          {value}Ω
        </div>
      </div>
      
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