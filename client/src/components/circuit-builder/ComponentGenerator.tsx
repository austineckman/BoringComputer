import React from 'react';

// Type for component attributes
export interface ComponentAttributes {
  rotate: number;
  top: number;
  left: number;
  zIndex: number;
  // LED specific
  color?: string;
  brightness?: number;
  // RGBLED specific
  ledRed?: number;
  ledGreen?: number;
  ledBlue?: number;
  // Buzzer specific
  hasSignal?: boolean;
  // Photoresistor specific
  value?: number | string;
  // Hero Board specific
  ledPower?: boolean;
  // Additional props can be added for specific components
  [key: string]: any;
}

// Component data structure
export interface ComponentData {
  id: string;
  name: string;
  description?: string;
  attrs: ComponentAttributes;
}

// Component props interface
export interface ComponentProps {
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}

// Component options for the palette
export const componentOptions = [
  {
    name: 'led',
    displayName: 'LED',
    description: 'Simple LED light component',
    attrs: { 
      rotate: 0, 
      color: 'red', 
      brightness: 100, 
      value: 0,
      top: 10, 
      left: 10,
      zIndex: 1
    }
  },
  {
    name: 'rgb-led',
    displayName: 'RGB LED',
    description: 'RGB LED with adjustable colors',
    attrs: { 
      rotate: 0, 
      brightness: 100, 
      ledRed: 0.5, 
      ledGreen: 0.5, 
      ledBlue: 0.5, 
      top: 10, 
      left: 10,
      zIndex: 1
    }
  },
  {
    name: 'resistor',
    displayName: 'Resistor',
    description: 'Electrical resistor component',
    attrs: { 
      rotate: 0, 
      value: '220', 
      top: 10, 
      left: 10,
      zIndex: 1
    }
  },
  {
    name: 'hero-board',
    displayName: 'Hero Board',
    description: 'Main microcontroller board',
    attrs: { 
      rotate: 0, 
      ledPower: true, 
      top: 100, 
      left: 100,
      zIndex: 10
    }
  },
  {
    name: 'buzzer',
    displayName: 'Buzzer',
    description: 'Sound output component',
    attrs: { 
      rotate: 0, 
      hasSignal: false, 
      top: 10, 
      left: 10,
      zIndex: 1
    }
  },
  {
    name: 'photoresistor',
    displayName: 'Photoresistor',
    description: 'Light sensitive resistor',
    attrs: { 
      rotate: 0, 
      value: '100', 
      top: 10, 
      left: 10,
      zIndex: 1
    }
  },
  {
    name: 'breadboard-mini',
    displayName: 'Breadboard',
    description: 'Mini breadboard for connections',
    attrs: { 
      rotate: 0, 
      top: 10, 
      left: 10,
      zIndex: 5
    }
  }
];

// Temporary placeholder component until individual components are implemented
const PlaceholderComponent: React.FC<ComponentProps> = ({ 
  componentData, 
  onPinClicked, 
  isActive, 
  handleMouseDown 
}) => {
  const getColor = () => {
    switch (componentData.name) {
      case 'led': return componentData.attrs.color || 'red';
      case 'rgb-led': 
        const r = Math.round((componentData.attrs.ledRed || 0) * 255);
        const g = Math.round((componentData.attrs.ledGreen || 0) * 255);
        const b = Math.round((componentData.attrs.ledBlue || 0) * 255);
        return `rgb(${r}, ${g}, ${b})`;
      case 'resistor': return '#9c27b0';
      case 'hero-board': return '#1a365d';
      case 'buzzer': return '#444';
      case 'photoresistor': return '#ffc107';
      case 'breadboard-mini': return '#eee';
      default: return '#ccc';
    }
  };

  return (
    <div
      className={`absolute rounded-md cursor-move transition-shadow ${isActive ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${componentData.attrs.left}px`,
        top: `${componentData.attrs.top}px`,
        width: '80px',
        height: '80px',
        backgroundColor: getColor(),
        transform: `rotate(${componentData.attrs.rotate}deg)`,
        zIndex: componentData.attrs.zIndex || 1,
        transition: 'transform 0.2s ease'
      }}
      onMouseDown={() => handleMouseDown(componentData.id, true)}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
        <div className="bg-black bg-opacity-50 px-2 py-1 rounded">
          {componentData.name}
        </div>
      </div>
      
      {/* Display some pins */}
      <div 
        className="absolute w-3 h-3 rounded-full bg-yellow-400 top-0 left-1/2 transform -translate-x-1/2 cursor-pointer" 
        onClick={() => onPinClicked(`${componentData.id}-pin1`)}
      ></div>
      <div 
        className="absolute w-3 h-3 rounded-full bg-yellow-400 bottom-0 left-1/2 transform -translate-x-1/2 cursor-pointer" 
        onClick={() => onPinClicked(`${componentData.id}-pin2`)}
      ></div>
    </div>
  );
};

// Import actual components
import LEDComponent from './components/LEDComponent';
import RGBLEDComponent from './components/RGBLEDComponent';
import HeroBoardComponent from './components/HeroBoardComponent';
import ResistorComponent from './components/ResistorComponent';
import PhotoresistorComponent from './components/PhotoresistorComponent';
import BuzzerComponent from './components/BuzzerComponent';
import BreadboardMiniComponent from './components/BreadboardMiniComponent';

// Component map with real implementations where available
export const componentMap: Record<string, React.FC<ComponentProps>> = {
  'led': LEDComponent,
  'rgb-led': RGBLEDComponent,
  'resistor': ResistorComponent,
  'hero-board': HeroBoardComponent,
  'buzzer': BuzzerComponent, 
  'photoresistor': PhotoresistorComponent,
  'breadboard-mini': BreadboardMiniComponent
};

// Utility function to create a new component with default attributes
export const createComponent = (name: string, id?: string): ComponentData => {
  const componentOption = componentOptions.find(opt => opt.name === name);
  if (!componentOption) {
    throw new Error(`Component type '${name}' not found`);
  }
  
  return {
    id: id || Math.random().toString(36).substr(2, 9),
    name: componentOption.name,
    description: componentOption.description,
    attrs: {...componentOption.attrs}
  };
};

// Renders a component based on its type
export const renderComponent = (
  componentData: ComponentData,
  onPinClicked: (pinId: string) => void,
  isActive: boolean,
  handleMouseDown: (id: string, isActive: boolean) => void,
  handleDeleteComponent: (id: string) => void
): React.ReactNode => {
  const Component = componentMap[componentData.name];
  if (!Component) {
    console.error(`Component type '${componentData.name}' not found in component map`);
    return null;
  }
  
  return (
    <Component
      key={componentData.id}
      componentData={componentData}
      onPinClicked={onPinClicked}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDeleteComponent={handleDeleteComponent}
    />
  );
};

export default {
  componentMap,
  componentOptions,
  createComponent,
  renderComponent
};