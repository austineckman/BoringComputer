import { useState, useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import HeroBoard image
const heroBoardImagePath = '/components/heroboard.png';

/**
 * HeroBoard Component
 * 
 * The main microcontroller board with:
 * - Multiple digital and analog pins
 * - Power and ground pins
 * - Visual representation of the board
 */
const HeroBoard = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect
}) => {
  const componentRef = useRef(null);
  
  // Component dimensions
  const width = 150;
  const height = 200;
  
  // Generate pin data
  const digitalPins = Array.from({ length: 14 }, (_, i) => ({
    id: `${id}-d${i}`,
    label: `D${i}`,
    pinType: 'output',
    x: width * 0.7,
    y: (height * 0.2) + (i * 14)
  }));
  
  const analogPins = Array.from({ length: 6 }, (_, i) => ({
    id: `${id}-a${i}`,
    label: `A${i}`,
    pinType: 'input',
    x: width * 0.3,
    y: (height * 0.2) + (i * 14)
  }));
  
  // Power and ground pins
  const utilityPins = [
    {
      id: `${id}-gnd`,
      label: 'GND',
      pinType: 'output',
      x: width * 0.3,
      y: height * 0.8
    },
    {
      id: `${id}-5v`,
      label: '5V',
      pinType: 'output',
      x: width * 0.7,
      y: height * 0.8
    }
  ];
  
  // Combine all pins
  const allPins = [...digitalPins, ...analogPins, ...utilityPins];
  
  return (
    <BaseComponent
      id={id}
      type="HeroBoard"
      initialX={initialX}
      initialY={initialY}
      initialRotation={initialRotation}
      width={width}
      height={height}
      onSelect={onSelect}
      isSelected={isSelected}
      canvasRef={canvasRef}
    >
      <div
        ref={componentRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Board image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={heroBoardImagePath} 
            alt="HeroBoard" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        {/* Pins */}
        {allPins.map(pin => (
          <CircuitPin
            key={pin.id}
            id={pin.id}
            parentId={id}
            pinType={pin.pinType}
            label={pin.label}
            position={{ x: pin.x, y: pin.y }}
            parentRef={componentRef}
            onPinClick={onPinConnect}
            color={pin.label === 'GND' ? '#333' : pin.label === '5V' ? 'red' : '#ffcc00'}
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default HeroBoard;