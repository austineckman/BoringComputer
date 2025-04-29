import { useState, useRef, useEffect } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import LED image
const ledImagePath = '/components/led.png';

/**
 * LED Component
 * 
 * An electronic LED component with:
 * - Power input pin
 * - Ground input pin
 * - Visual feedback for power state
 */
const LED = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0,
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect,
  color = 'red'
}) => {
  const componentRef = useRef(null);
  const [powered, setPowered] = useState(false);
  
  // Component dimensions
  const width = 30;
  const height = 50;
  
  // Handle receiving power
  const updatePowerState = (isOn) => {
    setPowered(isOn);
  };
  
  // Pin positions relative to component center
  const pinPositions = {
    power: { x: 0, y: -height/2 }, // Top center
    ground: { x: 0, y: height/2 }  // Bottom center
  };
  
  return (
    <BaseComponent
      id={id}
      type="LED"
      initialX={initialX}
      initialY={initialY}
      initialRotation={initialRotation}
      width={width}
      height={height}
      onSelect={onSelect}
      isSelected={isSelected}
      canvasRef={canvasRef}
      componentProps={{ color, powered }}
    >
      <div
        ref={componentRef}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* LED body */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={ledImagePath} 
            alt="LED" 
            className="max-w-full max-h-full" 
            style={{
              filter: powered ? `drop-shadow(0 0 4px ${color})` : 'none'
            }}
          />
        </div>
        
        {/* Pins */}
        <CircuitPin
          id={`${id}-power`}
          parentId={id}
          pinType="input"
          label="+"
          position={pinPositions.power}
          parentRef={componentRef}
          onPinClick={onPinConnect}
        />
        
        <CircuitPin
          id={`${id}-ground`}
          parentId={id}
          pinType="input"
          label="-"
          position={pinPositions.ground}
          parentRef={componentRef}
          onPinClick={onPinConnect}
        />
      </div>
    </BaseComponent>
  );
};

export default LED;