import React, { useState, useEffect } from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface ResistorComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const ResistorComponent: React.FC<ResistorComponentProps> = (props) => {
  const { componentData } = props;
  const [value, setValue] = useState(componentData.attrs.value || '220');
  
  // Update internal state when component data changes
  useEffect(() => {
    setValue(componentData.attrs.value || '220');
  }, [componentData.attrs.value]);
  
  // Define pins for Resistor
  const definePins = () => {
    return [
      { id: 'pin1', x: 5, y: 20, label: 'Pin 1' },
      { id: 'pin2', x: 85, y: 20, label: 'Pin 2' }
    ];
  };
  
  // Get resistor band colors based on value
  const getResistorBands = () => {
    // This is a simplified color band calculator
    // In a real implementation, you would parse the resistance value
    // and calculate the correct color bands
    
    const bandColors = {
      '100': ['brown', 'black', 'brown', 'gold'],
      '220': ['red', 'red', 'brown', 'gold'],
      '330': ['orange', 'orange', 'brown', 'gold'],
      '470': ['yellow', 'violet', 'brown', 'gold'],
      '1000': ['brown', 'black', 'red', 'gold'],
      '2200': ['red', 'red', 'red', 'gold'],
      '4700': ['yellow', 'violet', 'red', 'gold'],
      '10000': ['brown', 'black', 'orange', 'gold']
    };
    
    // Default to 220 ohm
    return bandColors[value as keyof typeof bandColors] || ['red', 'red', 'brown', 'gold'];
  };
  
  const bands = getResistorBands();
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-90 h-40 flex items-center justify-center">
        {/* Lead wires */}
        <div className="absolute left-0 top-1/2 w-15 h-1 bg-gray-400 -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/2 w-15 h-1 bg-gray-400 -translate-y-1/2"></div>
        
        {/* Resistor body */}
        <div className="absolute left-15 top-1/2 w-60 h-15 bg-beige-200 -translate-y-1/2 border border-beige-300 rounded-sm"
             style={{ backgroundColor: '#e1c699' }}>
          {/* Color bands */}
          <div className="absolute left-5 top-0 bottom-0 w-4 rounded-sm" style={{ backgroundColor: bands[0] }}></div>
          <div className="absolute left-15 top-0 bottom-0 w-4 rounded-sm" style={{ backgroundColor: bands[1] }}></div>
          <div className="absolute left-25 top-0 bottom-0 w-4 rounded-sm" style={{ backgroundColor: bands[2] }}></div>
          <div className="absolute right-5 top-0 bottom-0 w-4 rounded-sm" style={{ backgroundColor: bands[3] }}></div>
        </div>
        
        {/* Value label */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-mono font-semibold">
          {value} Ω
        </div>
      </div>
    </BaseComponent>
  );
};

export default ResistorComponent;