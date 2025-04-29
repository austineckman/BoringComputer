import React from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface BreadboardMiniComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const BreadboardMiniComponent: React.FC<BreadboardMiniComponentProps> = (props) => {
  const { componentData } = props;
  
  // Define pins for Breadboard
  // For a mini breadboard, we'll define a simplified set of pins
  const definePins = () => {
    const pins = [];
    
    // Top power rail (positive)
    for (let i = 0; i < 10; i++) {
      pins.push({
        id: `power-pos-${i}`,
        x: 20 + i * 20,
        y: 10,
        label: `+`
      });
    }
    
    // Bottom power rail (negative)
    for (let i = 0; i < 10; i++) {
      pins.push({
        id: `power-neg-${i}`,
        x: 20 + i * 20,
        y: 150,
        label: `-`
      });
    }
    
    // Main grid - top section (a-e)
    const rows = ['a', 'b', 'c', 'd', 'e'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        pins.push({
          id: `${rows[row]}${col + 1}`,
          x: 20 + col * 20,
          y: 30 + row * 20,
          label: `${rows[row]}${col + 1}`
        });
      }
    }
    
    // Main grid - bottom section (f-j)
    const bottomRows = ['f', 'g', 'h', 'i', 'j'];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        pins.push({
          id: `${bottomRows[row]}${col + 1}`,
          x: 20 + col * 20,
          y: 80 + row * 20,
          label: `${bottomRows[row]}${col + 1}`
        });
      }
    }
    
    return pins;
  };
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-240 h-160">
        {/* Breadboard body */}
        <div className="absolute inset-0 bg-white border border-gray-300 rounded-md shadow-md"></div>
        
        {/* Top power rail */}
        <div className="absolute top-5 left-10 right-10 h-10 bg-red-100 border border-red-200 rounded-sm flex items-center">
          <div className="absolute left-2 text-xs font-mono text-red-500">+</div>
          <div className="absolute right-2 text-xs font-mono text-red-500">+</div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-xs font-mono text-red-500">Power Rail (+)</div>
        </div>
        
        {/* Bottom power rail */}
        <div className="absolute bottom-5 left-10 right-10 h-10 bg-blue-100 border border-blue-200 rounded-sm flex items-center">
          <div className="absolute left-2 text-xs font-mono text-blue-500">-</div>
          <div className="absolute right-2 text-xs font-mono text-blue-500">-</div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-xs font-mono text-blue-500">Power Rail (-)</div>
        </div>
        
        {/* Center divider */}
        <div className="absolute left-1/2 top-30 bottom-30 w-4 bg-gray-300 transform -translate-x-1/2"></div>
        
        {/* Pin grid visualization (dots) */}
        <div className="absolute top-25 left-10 right-10 bottom-25 grid grid-cols-10 gap-4">
          {Array.from({ length: 100 }).map((_, index) => {
            // Skip drawing pins in the center divider area
            const col = index % 10;
            const row = Math.floor(index / 10);
            
            if (row < 5 || row >= 5) {
              return (
                <div 
                  key={index}
                  className={`w-1 h-1 rounded-full bg-gray-400 ${row === 4 || row === 5 ? 'opacity-0' : 'opacity-70'}`}
                  style={{
                    gridColumnStart: col + 1,
                    gridRowStart: row + 1
                  }}
                ></div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </BaseComponent>
  );
};

export default BreadboardMiniComponent;