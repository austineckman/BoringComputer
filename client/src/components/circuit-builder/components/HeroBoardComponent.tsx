import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';
import heroBoardIconPath from '../../../assets/components/hero-board.icon.png';
import { useSimulator } from '../simulator/SimulatorContext';

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
  const { rotate = 0, left, ledPower = true } = attrs;
  const { isRunning, componentStates } = useSimulator();

  // LED state from AVR8 emulator
  const [ledState, setLedState] = React.useState(false);

  // Listen for pin 13 changes from the AVR8 emulator
  React.useEffect(() => {
    if (!isRunning) {
      setLedState(false);
      return;
    }

    // Check component states for pin 13
    const boardState = componentStates[id];

    if (boardState) {
      // Check for pin 13 state (Arduino pin 13 = Port B, bit 5)
      const pin13High = boardState.pins?.[13] || boardState.pin13 || false;

      if (pin13High !== ledState) {
        console.log(`🔴 HeroBoard ${id} LED: Pin 13 is ${pin13High ? 'HIGH' : 'LOW'}`);
        setLedState(pin13High);
      }
    }
  }, [isRunning, componentStates, id, ledState]);

  // Get pin states from simulator context
  const pinStates = componentStates[id]?.pins || {};

  // Check if pin 13 is HIGH
  const pin13IsHigh = pinStates['13']?.isHigh || pinStates['d13']?.isHigh || false;

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

  console.log(`HeroBoardComponent ${id} rendering. Pin 13 state:`, pin13IsHigh ? 'HIGH' : 'LOW');

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
      <div className="relative" style={{ width: '170px', height: '220px' }}>
        {/* Use the real hero board image */}
        <img
          src={heroBoardIconPath}
          alt="HERO Board Component"
          className="w-full h-full object-contain"
        />

        {/* Power LED overlay */}
        <div 
          className="absolute"
          style={{
            left: '40px',
            top: '30px',
            width: '4px',
            height: '4px',
            backgroundColor: ledPower ? '#5fea00' : 'transparent',
            borderRadius: '50%',
            boxShadow: ledPower ? '0 0 4px #5fea00' : 'none',
          }}
        />

        {/* Pin 13 LED overlay - responds to actual signals from simulation */}
        <div 
          className="absolute"
          style={{
            left: '135px',
            top: '75px',
            width: '8px',
            height: '8px',
            backgroundColor: ledState ? '#ff3300' : '#330000',
            borderRadius: '50%',
            boxShadow: ledState ? '0 0 10px 2px rgba(255, 50, 0, 0.8)' : 'none',
            transition: 'background-color 0.05s, box-shadow 0.05s',
            border: '1px solid #661100',
            zIndex: 999,
          }}
        />

        {/* Debug info overlay to show pin 13 state */}
        <div 
          className="absolute text-xs font-mono"
          style={{
            right: '5px',
            bottom: '5px',
            fontSize: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: ledState ? '#ff3300' : '#aaaaaa',
            padding: '2px 4px',
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        >
          PIN 13: {ledState ? 'HIGH' : 'LOW'}
        </div>
      </div>

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