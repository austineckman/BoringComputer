import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';

interface PinDefinition {
  id: string;
  x: number;
  y: number;
  label: string;
  isDigital?: boolean;
  isAnalog?: boolean;
  isPower?: boolean;
  isGround?: boolean;
}

const HeroBoardComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, top, left, ledPower = true } = attrs;
  
  // Define pins based on Arduino layout
  const basePins: PinDefinition[] = [
    // Power pins
    { id: 'vin', x: -55, y: -90, label: 'VIN', isPower: true },
    { id: 'gnd1', x: -45, y: -90, label: 'GND', isGround: true },
    { id: 'gnd2', x: -35, y: -90, label: 'GND', isGround: true },
    { id: '5v', x: -25, y: -90, label: '5V', isPower: true },
    { id: '3v3', x: -15, y: -90, label: '3.3V', isPower: true },
    { id: 'rst', x: -5, y: -90, label: 'RST' },
    { id: 'aref', x: 5, y: -90, label: 'AREF' },
    
    // Digital pins (left side)
    { id: 'd0', x: -55, y: 90, label: 'D0', isDigital: true },
    { id: 'd1', x: -45, y: 90, label: 'D1', isDigital: true },
    { id: 'd2', x: -35, y: 90, label: 'D2', isDigital: true },
    { id: 'd3', x: -25, y: 90, label: 'D3', isDigital: true },
    { id: 'd4', x: -15, y: 90, label: 'D4', isDigital: true },
    { id: 'd5', x: -5, y: 90, label: 'D5', isDigital: true },
    { id: 'd6', x: 5, y: 90, label: 'D6', isDigital: true },
    { id: 'd7', x: 15, y: 90, label: 'D7', isDigital: true },
    
    // Digital pins (right side)
    { id: 'd8', x: 25, y: 90, label: 'D8', isDigital: true },
    { id: 'd9', x: 35, y: 90, label: 'D9', isDigital: true },
    { id: 'd10', x: 45, y: 90, label: 'D10', isDigital: true },
    { id: 'd11', x: 55, y: 90, label: 'D11', isDigital: true },
    { id: 'd12', x: 65, y: 90, label: 'D12', isDigital: true },
    { id: 'd13', x: 75, y: 90, label: 'D13', isDigital: true },
    
    // Analog pins
    { id: 'a0', x: 15, y: -90, label: 'A0', isAnalog: true },
    { id: 'a1', x: 25, y: -90, label: 'A1', isAnalog: true },
    { id: 'a2', x: 35, y: -90, label: 'A2', isAnalog: true },
    { id: 'a3', x: 45, y: -90, label: 'A3', isAnalog: true },
    { id: 'a4', x: 55, y: -90, label: 'A4', isAnalog: true },
    { id: 'a5', x: 65, y: -90, label: 'A5', isAnalog: true },
    { id: 'a6', x: 75, y: -90, label: 'A6', isAnalog: true },
  ];
  
  // Rotate pins based on board rotation
  const getPinCoordinates = (pin: PinDefinition) => {
    switch (rotate) {
      case 0: 
        return { x: pin.x, y: pin.y };
      case 90:
        return { x: -pin.y, y: pin.x };
      case 180:
        return { x: -pin.x, y: -pin.y };
      case 270:
        return { x: pin.y, y: -pin.x };
      default:
        return { x: pin.x, y: pin.y };
    }
  };
  
  return (
    <BaseComponent
      id={id}
      left={left}
      top={top}
      rotate={rotate}
      width={170}
      height={220}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <svg width="170" height="220" viewBox="-85 -110 170 220" xmlns="http://www.w3.org/2000/svg">
        {/* Board Body */}
        <rect x="-80" y="-105" width="160" height="210" rx="10" ry="10" fill="#1a365d" />
        
        {/* Board Main Area */}
        <rect x="-70" y="-95" width="140" height="190" rx="5" ry="5" fill="#173156" />
        
        {/* USB Port */}
        <rect x="-20" y="-105" width="40" height="15" rx="3" ry="3" fill="#666" />
        
        {/* Power LED */}
        <circle cx="-60" cy="-85" r="3" fill={ledPower ? "#5fea00" : "#333"} />
        <text x="-52" y="-83" fill="#ccc" fontSize="5">PWR</text>
        
        {/* TX/RX LEDs */}
        <circle cx="-60" cy="-75" r="2" fill="#aa3333" />
        <text x="-52" y="-73" fill="#ccc" fontSize="5">TX</text>
        <circle cx="-60" cy="-65" r="2" fill="#33aa33" />
        <text x="-52" y="-63" fill="#ccc" fontSize="5">RX</text>
        
        {/* Center Chip (Microcontroller) */}
        <rect x="-30" y="-20" width="60" height="40" rx="2" ry="2" fill="#111" />
        <text x="0" y="0" fill="#ccc" fontSize="8" textAnchor="middle">HERO</text>
        <text x="0" y="12" fill="#ccc" fontSize="6" textAnchor="middle">MCU</text>
        
        {/* Crystal Oscillator */}
        <rect x="40" y="-25" width="10" height="5" fill="#aaa" />
        
        {/* Pin Headers (Digital) */}
        <rect x="-75" y="80" width="140" height="10" fill="#222" />
        
        {/* Pin Headers (Power + Analog) */}
        <rect x="-75" y="-90" width="140" height="10" fill="#222" />
        
        {/* Circuit Traces */}
        <path d="M-60 -85 L-60 -50 L-20 -20" stroke="#606060" strokeWidth="0.5" fill="none" />
        <path d="M-60 -65 L-40 -40 L-25 -20" stroke="#606060" strokeWidth="0.5" fill="none" />
        <path d="M60 -20 L70 -40 L70 80" stroke="#606060" strokeWidth="0.5" fill="none" />
        <path d="M-75 80 L-75 0 L-30 -20" stroke="#606060" strokeWidth="0.5" fill="none" />
        <path d="M75 -90 L75 -50 L30 -20" stroke="#606060" strokeWidth="0.5" fill="none" />
        <path d="M-30 20 L-50 50 L-50 80" stroke="#606060" strokeWidth="0.5" fill="none" />
        
        {/* Labels */}
        <text x="0" y="-50" fill="#fff" fontSize="10" textAnchor="middle">HERO BOARD</text>
        <text x="0" y="35" fill="#ccc" fontSize="6" textAnchor="middle">CIRCUIT BUILDER</text>
        <text x="0" y="45" fill="#ccc" fontSize="6" textAnchor="middle">v1.0</text>
      </svg>
      
      {/* Pins */}
      {basePins.map(pin => {
        const coords = getPinCoordinates(pin);
        return (
          <CircuitPin
            key={`${id}-${pin.id}`}
            id={`${id}-${pin.id}`}
            x={85 + coords.x}
            y={110 + coords.y}
            onClick={() => onPinClicked(`${id}-${pin.id}`)}
            color={
              pin.isPower ? '#ff6666' :
              pin.isGround ? '#aaaaaa' :
              pin.isDigital ? '#66ffff' :
              pin.isAnalog ? '#ffcc66' :
              '#ffcc00'
            }
          />
        );
      })}
    </BaseComponent>
  );
};

export default HeroBoardComponent;