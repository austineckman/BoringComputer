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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Use real photoresistor image */}
        <img
          src="/assets/components/photoresistor.icon.png"
          alt="Photoresistor Component"
          className="w-full h-full object-contain"
          style={{
            filter: `brightness(${brightnessPct / 50 + 0.5})`,
          }}
        />
        
        {/* Value display */}
        <div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 px-1 rounded text-white text-xs"
          style={{ fontSize: '7px', pointerEvents: 'none' }}
        >
          {typeof value === 'number' ? value : 'N/A'}
        </div>
      </div>
      
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