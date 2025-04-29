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
        {/* Board Body - Arduino Uno style but branded as HERO */}
        <rect x="-80" y="-105" width="160" height="210" rx="10" ry="10" fill="#00979c" /> {/* Arduino teal */}
        
        {/* PCB texture */}
        <rect x="-78" y="-103" width="156" height="206" rx="8" ry="8" fill="#00979c" stroke="#008184" strokeWidth="1" />
        
        {/* Board mounting holes */}
        <circle cx="-70" cy="-95" r="2" fill="#333" />
        <circle cx="70" cy="-95" r="2" fill="#333" />
        <circle cx="-70" cy="95" r="2" fill="#333" />
        <circle cx="70" cy="95" r="2" fill="#333" />
        
        {/* USB Port */}
        <rect x="-25" y="-105" width="30" height="15" rx="2" ry="2" fill="#aaa" stroke="#888" strokeWidth="0.5" />
        <rect x="-23" y="-103" width="26" height="11" rx="1" ry="1" fill="#444" />
        
        {/* Power Jack */}
        <rect x="-75" y="-105" width="20" height="15" rx="2" ry="2" fill="#333" />
        <circle cx="-65" cy="-97.5" r="5" fill="#222" stroke="#444" strokeWidth="0.5" />
        
        {/* Reset Button */}
        <rect x="45" y="-93" width="10" height="10" rx="2" ry="2" fill="#333" />
        <rect x="46" y="-92" width="8" height="8" rx="1" ry="1" fill="#c44" />
        <text x="50" y="-84" fill="#fff" fontSize="4" textAnchor="middle">RESET</text>
        
        {/* Power LED */}
        <circle cx="-40" cy="-80" r="2" fill={ledPower ? "#5fea00" : "#333"} />
        <text x="-33" y="-80" fill="#fff" fontSize="4">PWR</text>
        
        {/* TX/RX LEDs */}
        <circle cx="-40" cy="-73" r="1.5" fill="#ff9c00" /> {/* TX LED */}
        <text x="-33" y="-73" fill="#fff" fontSize="4">TX</text>
        <circle cx="-40" cy="-66" r="1.5" fill="#16bc00" /> {/* RX LED */}
        <text x="-33" y="-66" fill="#fff" fontSize="4">RX</text>
        
        {/* Main Microcontroller */}
        <rect x="-30" y="-25" width="60" height="40" rx="1" ry="1" fill="#222" stroke="#111" strokeWidth="1" />
        <circle cx="-26" cy="-21" r="1" fill="#999" />
        
        {/* Pin 1 indicator on the chip */}
        <circle cx="-26" cy="-21" r="1" fill="#999" />
        
        {/* Chip details */}
        <text x="0" y="-5" fill="#eee" fontSize="8" textAnchor="middle">HERO MCU</text>
        <text x="0" y="5" fill="#aaa" fontSize="4" textAnchor="middle">ATMEGA328P</text>
        
        {/* Pin Headers - Digital Side */}
        <rect x="-70" y="80" width="140" height="10" fill="#444" />
        {/* Digital pin labels */}
        <text x="-69" y="77" fill="#fff" fontSize="4">D0</text>
        <text x="-59" y="77" fill="#fff" fontSize="4">D1</text>
        <text x="-49" y="77" fill="#fff" fontSize="4">D2</text>
        <text x="-39" y="77" fill="#fff" fontSize="4">D3</text>
        <text x="-29" y="77" fill="#fff" fontSize="4">D4</text>
        <text x="-19" y="77" fill="#fff" fontSize="4">D5</text>
        <text x="-9" y="77" fill="#fff" fontSize="4">D6</text>
        <text x="1" y="77" fill="#fff" fontSize="4">D7</text>
        <text x="11" y="77" fill="#fff" fontSize="4">D8</text>
        <text x="21" y="77" fill="#fff" fontSize="4">D9</text>
        <text x="30" y="77" fill="#fff" fontSize="4">D10</text>
        <text x="40" y="77" fill="#fff" fontSize="4">D11</text>
        <text x="50" y="77" fill="#fff" fontSize="4">D12</text>
        <text x="60" y="77" fill="#fff" fontSize="4">D13</text>
        
        {/* Pin Headers - Analog Side */}
        <rect x="-70" y="-90" width="140" height="10" fill="#444" />
        {/* Power pin labels on top row */}
        <text x="-69" y="-93" fill="#fff" fontSize="4">VIN</text>
        <text x="-59" y="-93" fill="#fff" fontSize="4">GND</text>
        <text x="-49" y="-93" fill="#fff" fontSize="4">GND</text>
        <text x="-39" y="-93" fill="#fff" fontSize="4">5V</text>
        <text x="-29" y="-93" fill="#fff" fontSize="4">3.3V</text>
        <text x="-19" y="-93" fill="#fff" fontSize="4">RST</text>
        <text x="-9" y="-93" fill="#fff" fontSize="4">AREF</text>
        
        {/* Analog pin labels */}
        <text x="11" y="-93" fill="#fff" fontSize="4">A0</text>
        <text x="21" y="-93" fill="#fff" fontSize="4">A1</text>
        <text x="31" y="-93" fill="#fff" fontSize="4">A2</text>
        <text x="41" y="-93" fill="#fff" fontSize="4">A3</text>
        <text x="51" y="-93" fill="#fff" fontSize="4">A4</text>
        <text x="61" y="-93" fill="#fff" fontSize="4">A5</text>
        
        {/* Circuit Traces - subtle */}
        <path d="M-30 -5 L-50 20 L-50 80" stroke="#0086bb" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M30 -5 L60 20 L60 80" stroke="#0086bb" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M20 -25 L20 -60 L70 -85" stroke="#0086bb" strokeWidth="0.5" fill="none" opacity="0.5" />
        <path d="M-20 -25 L-20 -60 L-70 -85" stroke="#0086bb" strokeWidth="0.5" fill="none" opacity="0.5" />
        
        {/* HERO Board Logo */}
        <text x="0" y="-50" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">HERO</text>
        <text x="0" y="-40" fill="#eee" fontSize="6" textAnchor="middle">BOARD</text>
        <text x="0" y="50" fill="#eee" fontSize="5" textAnchor="middle">www.questgiver.tech</text>
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