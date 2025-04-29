import { useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import HeroBoard image
import heroboardImg from '@assets/hero-board.icon.png';

/**
 * HeroBoard Component
 * 
 * Arduino UNO R3 compatible board with:
 * - 14 Digital pins (D0-D13)
 * - 6 Analog pins (A0-A5)
 * - Power, ground, and reference pins
 * - Accurately positioned connection points
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
  
  // Component dimensions (matches Arduino UNO R3)
  const width = 240;
  const height = 160;
  
  // Arduino UNO R3 pin layout
  // Created with exact positions based on the reference image
  const pins = [
    // Digital pins (right side, blue) - D0 to D13
    { id: `${id}-d0`, label: 'D0 (RX)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.30 },
    { id: `${id}-d1`, label: 'D1 (TX)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.35 },
    { id: `${id}-d2`, label: 'D2', pinType: 'bidirectional', x: width * 0.95, y: height * 0.40 },
    { id: `${id}-d3`, label: 'D3 (PWM)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.45 },
    { id: `${id}-d4`, label: 'D4', pinType: 'bidirectional', x: width * 0.95, y: height * 0.50 },
    { id: `${id}-d5`, label: 'D5 (PWM)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.55 },
    { id: `${id}-d6`, label: 'D6 (PWM)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.60 },
    { id: `${id}-d7`, label: 'D7', pinType: 'bidirectional', x: width * 0.95, y: height * 0.65 },
    { id: `${id}-d8`, label: 'D8', pinType: 'bidirectional', x: width * 0.95, y: height * 0.70 },
    { id: `${id}-d9`, label: 'D9 (PWM)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.75 },
    { id: `${id}-d10`, label: 'D10 (PWM)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.80 },
    { id: `${id}-d11`, label: 'D11 (PWM)', pinType: 'bidirectional', x: width * 0.95, y: height * 0.85 },
    { id: `${id}-d12`, label: 'D12', pinType: 'bidirectional', x: width * 0.95, y: height * 0.90 },
    { id: `${id}-d13`, label: 'D13', pinType: 'bidirectional', x: width * 0.95, y: height * 0.95 },
    
    // Analog pins (left side, green) - A0 to A5
    { id: `${id}-a0`, label: 'A0', pinType: 'input', x: width * 0.05, y: height * 0.30 },
    { id: `${id}-a1`, label: 'A1', pinType: 'input', x: width * 0.05, y: height * 0.38 },
    { id: `${id}-a2`, label: 'A2', pinType: 'input', x: width * 0.05, y: height * 0.46 },
    { id: `${id}-a3`, label: 'A3', pinType: 'input', x: width * 0.05, y: height * 0.54 },
    { id: `${id}-a4`, label: 'A4 (SDA)', pinType: 'input', x: width * 0.05, y: height * 0.62 },
    { id: `${id}-a5`, label: 'A5 (SCL)', pinType: 'input', x: width * 0.05, y: height * 0.70 },
    
    // Power pins
    { id: `${id}-vin`, label: 'VIN', pinType: 'input', x: width * 0.15, y: height * 0.95 },
    { id: `${id}-gnd1`, label: 'GND', pinType: 'bidirectional', x: width * 0.25, y: height * 0.95 },
    { id: `${id}-gnd2`, label: 'GND', pinType: 'bidirectional', x: width * 0.50, y: height * 0.95 },
    { id: `${id}-5v`, label: '5V', pinType: 'output', x: width * 0.35, y: height * 0.95 },
    { id: `${id}-3v3`, label: '3.3V', pinType: 'output', x: width * 0.45, y: height * 0.95 },
    
    // Reference pins
    { id: `${id}-aref`, label: 'AREF', pinType: 'input', x: width * 0.63, y: height * 0.95 },
    { id: `${id}-rst`, label: 'RESET', pinType: 'input', x: width * 0.77, y: height * 0.05 }
  ];
  
  return (
    <BaseComponent
      id={id}
      type="Hero Board"
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
        {/* Board image - rotated 90 degrees */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={heroboardImg} 
            alt="Hero Board (Arduino UNO R3)"
            className="max-w-full max-h-full object-contain"
            style={{ 
              pointerEvents: 'none',
              transform: 'rotate(90deg)',
              transformOrigin: 'center'
            }}
          />
        </div>
        
        {/* Pins */}
        {pins.map(pin => (
          <CircuitPin
            key={pin.id}
            id={pin.id}
            parentId={id}
            pinType={pin.pinType}
            label={pin.label}
            position={{ x: pin.x, y: pin.y }}
            parentRef={componentRef}
            onPinClick={onPinConnect}
            color={
              pin.label.includes('GND') ? '#333' : 
              pin.label.includes('5V') || pin.label.includes('3.3V') ? 'red' : 
              pin.label.startsWith('D') ? '#0066CC' :  // Digital pins are blue
              pin.label.startsWith('A') ? '#00CC66' :  // Analog pins are green
              '#FFA500'  // Other pins orange
            }
            size={6} // Slightly larger pins for better visibility
          />
        ))}
      </div>
    </BaseComponent>
  );
};

export default HeroBoard;