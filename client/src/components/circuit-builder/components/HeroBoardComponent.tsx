import React, { useState, useEffect } from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface HeroBoardComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const HeroBoardComponent: React.FC<HeroBoardComponentProps> = (props) => {
  const { componentData } = props;
  const [ledPower, setLedPower] = useState(componentData.attrs.ledPower || false);
  
  // Update internal state when component data changes
  useEffect(() => {
    setLedPower(componentData.attrs.ledPower || false);
  }, [componentData.attrs.ledPower]);
  
  // Define pins for Hero Board
  const definePins = () => {
    return [
      // Digital pins
      { id: 'D0', x: 20, y: 10, label: 'D0' },
      { id: 'D1', x: 30, y: 10, label: 'D1' },
      { id: 'D2', x: 40, y: 10, label: 'D2' },
      { id: 'D3', x: 50, y: 10, label: 'D3' },
      { id: 'D4', x: 60, y: 10, label: 'D4' },
      { id: 'D5', x: 70, y: 10, label: 'D5' },
      { id: 'D6', x: 80, y: 10, label: 'D6' },
      { id: 'D7', x: 90, y: 10, label: 'D7' },
      { id: 'D8', x: 100, y: 10, label: 'D8' },
      { id: 'D9', x: 110, y: 10, label: 'D9' },
      { id: 'D10', x: 120, y: 10, label: 'D10' },
      { id: 'D11', x: 130, y: 10, label: 'D11' },
      { id: 'D12', x: 140, y: 10, label: 'D12' },
      { id: 'D13', x: 150, y: 10, label: 'D13' },
      
      // Analog pins
      { id: 'A0', x: 20, y: 90, label: 'A0' },
      { id: 'A1', x: 30, y: 90, label: 'A1' },
      { id: 'A2', x: 40, y: 90, label: 'A2' },
      { id: 'A3', x: 50, y: 90, label: 'A3' },
      { id: 'A4', x: 60, y: 90, label: 'A4' },
      { id: 'A5', x: 70, y: 90, label: 'A5' },
      
      // Power pins
      { id: '5V', x: 90, y: 90, label: '5V' },
      { id: '3.3V', x: 100, y: 90, label: '3.3V' },
      { id: 'GND', x: 110, y: 90, label: 'GND' },
      { id: 'GND2', x: 120, y: 90, label: 'GND' },
      { id: 'VIN', x: 130, y: 90, label: 'VIN' },
    ];
  };
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-180 h-100 flex items-center justify-center">
        {/* Board */}
        <div className="absolute inset-0 rounded-md bg-blue-900 border border-blue-700 shadow-lg">
          {/* Digital pins labels */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <div className="text-xs font-mono font-bold text-white">DIGITAL</div>
            <div className="text-xs font-mono font-bold text-white">USB</div>
          </div>
          
          {/* Board center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
            HERO
          </div>
          
          {/* USB port */}
          <div className="absolute top-4 right-4 w-8 h-12 bg-gray-800 rounded-sm border border-gray-700"></div>
          
          {/* Power LED */}
          <div className="absolute top-20 right-6 flex flex-col items-center">
            <div 
              className={`w-3 h-3 rounded-full ${ledPower ? 'bg-green-500' : 'bg-green-900'}`}
              style={{ 
                boxShadow: ledPower ? '0 0 4px 1px rgba(74, 222, 128, 0.7)' : 'none',
                transition: 'all 0.2s ease' 
              }}
            ></div>
            <div className="text-[8px] font-mono text-green-300 mt-1">PWR</div>
          </div>
          
          {/* TX/RX LEDs */}
          <div className="absolute top-30 right-6 flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-900"></div>
            <div className="text-[8px] font-mono text-yellow-300 mt-1">TX</div>
          </div>
          <div className="absolute top-40 right-6 flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-900"></div>
            <div className="text-[8px] font-mono text-blue-300 mt-1">RX</div>
          </div>
          
          {/* Analog pins label */}
          <div className="absolute bottom-2 left-2">
            <div className="text-xs font-mono font-bold text-white">ANALOG</div>
          </div>
          
          {/* Power pins label */}
          <div className="absolute bottom-2 right-2">
            <div className="text-xs font-mono font-bold text-white">POWER</div>
          </div>
        </div>
      </div>
    </BaseComponent>
  );
};

export default HeroBoardComponent;