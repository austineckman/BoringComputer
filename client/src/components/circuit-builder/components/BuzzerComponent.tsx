import React from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';
import buzzerIconPath from '../../../assets/components/buzzer.icon.png';

const BuzzerComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, top, left, hasSignal = false } = attrs;
  
  // Calculate pin positions based on rotation
  const pinPositions = {
    0: { // Default horizontal orientation
      pin1: { x: -15, y: 0 }, // Left pin (positive)
      pin2: { x: 15, y: 0 },  // Right pin (negative)
    },
    90: { // Vertical orientation
      pin1: { x: 0, y: -15 }, // Top pin (positive)
      pin2: { x: 0, y: 15 },  // Bottom pin (negative)
    },
    180: { // Horizontal flipped
      pin1: { x: 15, y: 0 },  // Right pin (positive)
      pin2: { x: -15, y: 0 }, // Left pin (negative)
    },
    270: { // Vertical flipped
      pin1: { x: 0, y: 15 },  // Bottom pin (positive)
      pin2: { x: 0, y: -15 }, // Top pin (negative)
    }
  };
  
  // Get current rotation's pin positions
  const currentPins = pinPositions[rotate as keyof typeof pinPositions] || pinPositions[0];
  
  // Animation for the active buzzer
  const [animationState, setAnimationState] = React.useState(0);
  
  React.useEffect(() => {
    if (hasSignal) {
      const interval = setInterval(() => {
        setAnimationState(state => (state + 1) % 4);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setAnimationState(0);
    }
  }, [hasSignal]);
  
  // Visualization for sound waves
  const getSoundWavePath = () => {
    if (!hasSignal) return null;
    
    const waves = [];
    const baseRadius = 8 + animationState * 2;
    
    for (let i = 0; i < 3; i++) {
      const radius = baseRadius + i * 5;
      const opacity = 1 - (i * 0.25 + animationState * 0.1);
      waves.push(
        <circle 
          key={`wave-${i}`}
          cx="0" 
          cy="0" 
          r={radius} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="1" 
          strokeDasharray="3,2"
          opacity={opacity}
        />
      );
    }
    
    return waves;
  };
  
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
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Use real buzzer image */}
        <img
          src={buzzerIconPath}
          alt="Buzzer Component"
          className="w-full h-full object-contain"
          style={{
            filter: hasSignal ? 'brightness(1.2)' : 'brightness(1)',
          }}
        />
        
        {/* Sound waves animation */}
        {hasSignal && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => {
              const size = 16 + (i * 10) + (animationState * 4);
              const opacity = 1 - (i * 0.25 + animationState * 0.1);
              return (
                <div 
                  key={`wave-${i}`}
                  className="absolute rounded-full border border-blue-500"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    opacity: opacity,
                    borderStyle: 'dashed',
                    borderWidth: '1px',
                  }}
                />
              );
            })}
          </div>
        )}
        
        {/* Polarity indicator */}
        <div className="absolute -bottom-1 -left-2 text-xs text-red-500" style={{ fontSize: '7px' }}>+</div>
      </div>
      
      {/* Connection pins */}
      <CircuitPin
        id={`${id}-pin1`}
        x={20 + currentPins.pin1.x}
        y={20 + currentPins.pin1.y}
        onClick={() => onPinClicked(`${id}-pin1`)}
        color="#ff6666"  // red for positive terminal
      />
      <CircuitPin
        id={`${id}-pin2`}
        x={20 + currentPins.pin2.x}
        y={20 + currentPins.pin2.y}
        onClick={() => onPinClicked(`${id}-pin2`)}
        color="#aaaaaa"  // gray for negative terminal
      />
    </BaseComponent>
  );
};

export default BuzzerComponent;