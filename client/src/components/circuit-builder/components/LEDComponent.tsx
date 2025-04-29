import React, { useState, useEffect } from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface LEDComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const LEDComponent: React.FC<LEDComponentProps> = (props) => {
  const { componentData } = props;
  const [brightness, setBrightness] = useState(componentData.attrs.brightness || 0);
  const [color, setColor] = useState(componentData.attrs.color || 'red');
  
  // Update internal state when component data changes
  useEffect(() => {
    setBrightness(componentData.attrs.brightness || 0);
    setColor(componentData.attrs.color || 'red');
  }, [componentData.attrs.brightness, componentData.attrs.color]);
  
  // Define pins for LED (anode and cathode)
  const definePins = () => {
    return [
      { id: 'anode', x: 20, y: 5, label: 'Anode (+)' },
      { id: 'cathode', x: 20, y: 35, label: 'Cathode (-)' }
    ];
  };
  
  // Gets the color based on the LED's state and type
  const getLEDColor = () => {
    // Map the brightness (0-100) to opacity (0.1-1)
    const opacity = (brightness / 100) * 0.9 + 0.1;
    
    // Get the base color
    let baseColor;
    switch (color) {
      case 'red':
        baseColor = 'rgb(255, 0, 0)';
        break;
      case 'green':
        baseColor = 'rgb(0, 255, 0)';
        break;
      case 'blue':
        baseColor = 'rgb(0, 0, 255)';
        break;
      case 'yellow':
        baseColor = 'rgb(255, 255, 0)';
        break;
      default:
        baseColor = 'rgb(255, 0, 0)';
    }
    
    return { 
      backgroundColor: baseColor,
      opacity: opacity
    };
  };
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* LED body */}
        <div className="absolute w-24 h-24 rounded-full bg-gray-200 border border-gray-400"></div>
        
        {/* LED light */}
        <div 
          className="absolute w-16 h-16 rounded-full shadow-lg transition-opacity duration-200"
          style={getLEDColor()}
        ></div>
        
        {/* LED label */}
        <div className="absolute bottom-2 text-center text-xs font-bold text-gray-700">
          LED {componentData.attrs.color}
        </div>
        
        {/* LED legs */}
        <div className="absolute top-0 left-1/2 w-1 h-5 bg-gray-400 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-5 bg-gray-400 -translate-x-1/2"></div>
      </div>
    </BaseComponent>
  );
};

export default LEDComponent;