import React, { useState, useEffect } from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface BuzzerComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const BuzzerComponent: React.FC<BuzzerComponentProps> = (props) => {
  const { componentData } = props;
  const [hasSignal, setHasSignal] = useState(componentData.attrs.hasSignal || false);
  
  // Update internal state when component data changes
  useEffect(() => {
    setHasSignal(componentData.attrs.hasSignal || false);
  }, [componentData.attrs.hasSignal]);
  
  // Define pins for Buzzer
  const definePins = () => {
    return [
      { id: 'positive', x: 17, y: 40, label: '+ (VCC)' },
      { id: 'negative', x: 33, y: 40, label: '- (GND)' }
    ];
  };
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-50 h-50 flex items-center justify-center">
        {/* Buzzer body */}
        <div className="absolute w-40 h-40 rounded-full bg-gray-800 border border-gray-700 shadow-lg"></div>
        
        {/* Buzzer center */}
        <div className="absolute w-20 h-20 rounded-full bg-gray-900 border border-gray-700"></div>
        
        {/* Sound waves (only show when active) */}
        {hasSignal && (
          <>
            <div 
              className="absolute w-50 h-50 rounded-full border-2 border-yellow-500 opacity-0"
              style={{ animation: 'soundWave 1.5s infinite' }}
            ></div>
            <div 
              className="absolute w-60 h-60 rounded-full border-2 border-yellow-500 opacity-0"
              style={{ animation: 'soundWave 1.5s infinite 0.2s' }}
            ></div>
            <div 
              className="absolute w-70 h-70 rounded-full border-2 border-yellow-500 opacity-0"
              style={{ animation: 'soundWave 1.5s infinite 0.4s' }}
            ></div>
          </>
        )}
        
        {/* Buzzer label */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold">
          Buzzer
        </div>
        
        {/* + and - markings */}
        <div className="absolute top-[27px] left-[12px] text-sm font-bold text-white">+</div>
        <div className="absolute top-[27px] right-[12px] text-sm font-bold text-white">-</div>
      </div>
      
      {/* CSS for animations would go here in a real implementation */}
    </BaseComponent>
  );
};

export default BuzzerComponent;