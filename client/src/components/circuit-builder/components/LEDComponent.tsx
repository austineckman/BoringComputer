import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';
import ledIconPath from '../../../assets/components/led.icon.png';

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
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Use the real LED image */}
        <img 
          src={ledIconPath} 
          alt="LED Component" 
          className="w-full h-full object-contain"
          style={{
            filter: ledOpacity > 0.5 ? `drop-shadow(0 0 5px ${color})` : 'none',
          }}
        />
        
        {/* Overlay colored glow when LED is on */}
        {ledOpacity > 0.5 && (
          <div 
            className="absolute inset-0 rounded-full" 
            style={{
              backgroundColor: color,
              opacity: ledOpacity * 0.5,
              mixBlendMode: 'screen',
            }}
          />
        )}
      </div>

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