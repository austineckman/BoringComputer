import React, { useState, useEffect } from 'react';
import BaseComponent from '../BaseComponent';
import { ComponentData } from '../ComponentGenerator';

interface RGBLEDComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

const RGBLEDComponent: React.FC<RGBLEDComponentProps> = (props) => {
  const { componentData } = props;
  const [brightness, setBrightness] = useState(componentData.attrs.brightness || 0);
  const [redValue, setRedValue] = useState(componentData.attrs.ledRed || 0);
  const [greenValue, setGreenValue] = useState(componentData.attrs.ledGreen || 0);
  const [blueValue, setBlueValue] = useState(componentData.attrs.ledBlue || 0);
  
  // Update internal state when component data changes
  useEffect(() => {
    setBrightness(componentData.attrs.brightness || 0);
    setRedValue(componentData.attrs.ledRed || 0);
    setGreenValue(componentData.attrs.ledGreen || 0);
    setBlueValue(componentData.attrs.ledBlue || 0);
  }, [
    componentData.attrs.brightness,
    componentData.attrs.ledRed,
    componentData.attrs.ledGreen,
    componentData.attrs.ledBlue
  ]);
  
  // Define pins for RGB LED
  const definePins = () => {
    return [
      { id: 'common', x: 20, y: 5, label: 'Common' },
      { id: 'red', x: 10, y: 35, label: 'Red' },
      { id: 'green', x: 20, y: 35, label: 'Green' },
      { id: 'blue', x: 30, y: 35, label: 'Blue' }
    ];
  };
  
  // Calculate RGB color based on component values
  const getLEDColor = () => {
    // Map the values (0-1) to RGB (0-255)
    const red = Math.round(redValue * 255);
    const green = Math.round(greenValue * 255);
    const blue = Math.round(blueValue * 255);
    
    // Apply brightness (0-100) as opacity (0.1-1)
    const opacity = (brightness / 100) * 0.9 + 0.1;
    
    return {
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      opacity: opacity,
      boxShadow: `0 0 15px 5px rgba(${red}, ${green}, ${blue}, 0.5)`
    };
  };
  
  return (
    <BaseComponent {...props} connectedPins={[]}>
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* LED body */}
        <div className="absolute w-24 h-24 rounded-full bg-gray-200 border border-gray-400"></div>
        
        {/* LED light */}
        <div 
          className="absolute w-16 h-16 rounded-full transition-all duration-200"
          style={getLEDColor()}
        ></div>
        
        {/* LED label */}
        <div className="absolute bottom-2 text-center text-xs font-bold text-gray-700">
          RGB LED
        </div>
        
        {/* LED legs */}
        <div className="absolute top-0 left-1/2 w-1 h-5 bg-gray-400 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-1 h-5 bg-red-400"></div>
        <div className="absolute bottom-0 left-1/2 w-1 h-5 bg-green-400 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-3/4 w-1 h-5 bg-blue-400 -translate-x-1/2"></div>
      </div>
    </BaseComponent>
  );
};

export default RGBLEDComponent;