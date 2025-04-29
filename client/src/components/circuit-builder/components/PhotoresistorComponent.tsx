import React, { useState, useEffect } from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface PhotoresistorComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const PhotoresistorComponent: React.FC<PhotoresistorComponentProps> = (props) => {
  const { componentData } = props;
  const [value, setValue] = useState(componentData.attrs.value || 100);
  
  // Update internal state when component data changes
  useEffect(() => {
    setValue(componentData.attrs.value || 100);
  }, [componentData.attrs.value]);
  
  // Define pins for Photoresistor
  const definePins = () => {
    return [
      { id: 'pin1', x: 5, y: 20, label: 'Pin 1' },
      { id: 'pin2', x: 75, y: 20, label: 'Pin 2' }
    ];
  };
  
  // Calculate background color based on value
  // Lower values (more light) = lighter color
  const getBgColor = () => {
    // Map values from 0-1000 to hex color from light yellow to dark yellow
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    const mappedValue = Math.min(255, Math.max(0, 255 - (numValue / 1000) * 200));
    
    const hexValue = Math.round(mappedValue).toString(16).padStart(2, '0');
    return `#ffff${hexValue}`;
  };
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-80 h-40 flex items-center justify-center">
        {/* Lead wires */}
        <div className="absolute left-0 top-1/2 w-15 h-1 bg-gray-400 -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/2 w-15 h-1 bg-gray-400 -translate-y-1/2"></div>
        
        {/* Photoresistor body */}
        <div className="absolute left-15 top-1/2 w-50 h-30 -translate-y-1/2 rounded-md"
             style={{ backgroundColor: getBgColor(), border: '1px solid #e9a800' }}>
          {/* Light-sensitive pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-30 h-1 bg-black"></div>
            <div className="absolute w-1 h-30 bg-black"></div>
          </div>
          
          {/* Light rays (decorative) */}
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-3 h-1 bg-yellow-300"></div>
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-1 bg-yellow-300"></div>
          <div className="absolute left-1/2 -top-5 -translate-x-1/2 w-1 h-3 bg-yellow-300"></div>
          <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 w-1 h-3 bg-yellow-300"></div>
          <div className="absolute -left-3 -top-3 w-2 h-2 transform rotate-45 bg-yellow-300"></div>
          <div className="absolute -right-3 -top-3 w-2 h-2 transform rotate-45 bg-yellow-300"></div>
          <div className="absolute -left-3 -bottom-3 w-2 h-2 transform rotate-45 bg-yellow-300"></div>
          <div className="absolute -right-3 -bottom-3 w-2 h-2 transform rotate-45 bg-yellow-300"></div>
        </div>
        
        {/* Value label */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold">
          Photoresistor: {value} Ω
        </div>
      </div>
    </BaseComponent>
  );
};

export default PhotoresistorComponent;