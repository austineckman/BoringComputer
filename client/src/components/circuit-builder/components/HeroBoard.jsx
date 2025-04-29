import { useRef } from 'react';
import BaseComponent from './BaseComponent';
import CircuitPin from './CircuitPin';

// Import HeroBoard image
import heroboardImg from '@assets/hero-board.icon.png';

/**
 * HeroBoard Component (Arduino UNO R3 compatible)
 * 
 * This implementation follows Wokwi's arduino-uno-element layout with:
 * - 14 Digital pins (D0-D13)
 * - 6 Analog pins (A0-A5)
 * - Power, ground, and reference pins
 * - Accurately positioned connection points matching Wokwi's implementation
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
  const width = 280; // Larger board size for better pin spacing
  const height = 200;
  
  // Wokwi-compatible Arduino UNO R3 pin layout
  // Following the same pin positions as in wokwi/wokwi-elements:arduino-uno-element.ts
  const pins = [
    // Digital pins side - Right side header pins (D0-D13)
    { id: `${id}-d0`, label: 'D0/RX', pinType: 'bidirectional', x: width * 0.96, y: height * 0.85 },
    { id: `${id}-d1`, label: 'D1/TX', pinType: 'bidirectional', x: width * 0.92, y: height * 0.85 },
    { id: `${id}-d2`, label: 'D2', pinType: 'bidirectional', x: width * 0.88, y: height * 0.85 },
    { id: `${id}-d3`, label: 'D3 (PWM)', pinType: 'bidirectional', x: width * 0.84, y: height * 0.85 },
    { id: `${id}-d4`, label: 'D4', pinType: 'bidirectional', x: width * 0.80, y: height * 0.85 },
    { id: `${id}-d5`, label: 'D5 (PWM)', pinType: 'bidirectional', x: width * 0.76, y: height * 0.85 },
    { id: `${id}-d6`, label: 'D6 (PWM)', pinType: 'bidirectional', x: width * 0.72, y: height * 0.85 },
    { id: `${id}-d7`, label: 'D7', pinType: 'bidirectional', x: width * 0.68, y: height * 0.85 },
    { id: `${id}-d8`, label: 'D8', pinType: 'bidirectional', x: width * 0.62, y: height * 0.85 },
    { id: `${id}-d9`, label: 'D9 (PWM)', pinType: 'bidirectional', x: width * 0.58, y: height * 0.85 },
    { id: `${id}-d10`, label: 'D10 (PWM)', pinType: 'bidirectional', x: width * 0.54, y: height * 0.85 },
    { id: `${id}-d11`, label: 'D11 (PWM)', pinType: 'bidirectional', x: width * 0.50, y: height * 0.85 },
    { id: `${id}-d12`, label: 'D12', pinType: 'bidirectional', x: width * 0.46, y: height * 0.85 },
    { id: `${id}-d13`, label: 'D13', pinType: 'bidirectional', x: width * 0.42, y: height * 0.85 },
    
    // Analog pins side - Top header pins (A0-A5 and power)
    { id: `${id}-a0`, label: 'A0', pinType: 'input', x: width * 0.31, y: height * 0.05 },
    { id: `${id}-a1`, label: 'A1', pinType: 'input', x: width * 0.35, y: height * 0.05 },
    { id: `${id}-a2`, label: 'A2', pinType: 'input', x: width * 0.39, y: height * 0.05 },
    { id: `${id}-a3`, label: 'A3', pinType: 'input', x: width * 0.43, y: height * 0.05 },
    { id: `${id}-a4`, label: 'A4/SDA', pinType: 'input', x: width * 0.47, y: height * 0.05 },
    { id: `${id}-a5`, label: 'A5/SCL', pinType: 'input', x: width * 0.51, y: height * 0.05 },
    
    // Power pins - Bottom left header
    { id: `${id}-3v3`, label: '3.3V', pinType: 'output', x: width * 0.56, y: height * 0.05, color: '#EC1B24' },
    { id: `${id}-5v`, label: '5V', pinType: 'output', x: width * 0.60, y: height * 0.05, color: '#EC1B24' },
    { id: `${id}-gnd1`, label: 'GND', pinType: 'bidirectional', x: width * 0.64, y: height * 0.05, color: '#222222' },
    { id: `${id}-gnd2`, label: 'GND', pinType: 'bidirectional', x: width * 0.68, y: height * 0.05, color: '#222222' },
    { id: `${id}-vin`, label: 'VIN', pinType: 'output', x: width * 0.72, y: height * 0.05, color: '#EC1B24' },
    
    // Additional pins
    { id: `${id}-aref`, label: 'AREF', pinType: 'input', x: width * 0.38, y: height * 0.05 },
    { id: `${id}-rst`, label: 'RESET', pinType: 'input', x: width * 0.76, y: height * 0.05 },
    
    // I2C, SPI pins included with the digital pins
    { id: `${id}-sda`, label: 'SDA', pinType: 'bidirectional', x: width * 0.80, y: height * 0.05 },
    { id: `${id}-scl`, label: 'SCL', pinType: 'bidirectional', x: width * 0.84, y: height * 0.05 }
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
        {/* Board image - proper orientation for Wokwi-style pin layout */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img 
            src={heroboardImg} 
            alt="Hero Board (Arduino UNO R3)"
            className="max-w-full max-h-full object-contain"
            style={{ 
              pointerEvents: 'none',
              // No rotation needed for the new pin layout
              filter: 'drop-shadow(0px 5px 10px rgba(0, 0, 0, 0.2))'
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