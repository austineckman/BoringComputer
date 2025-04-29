import React from 'react';

// Import all component types
import LEDComponent from './components/LEDComponent';
import RGBLEDComponent from './components/RGBLEDComponent';
import ResistorComponent from './components/ResistorComponent';
import HeroBoardComponent from './components/HeroBoardComponent';
import BuzzerComponent from './components/BuzzerComponent';
import PhotoresistorComponent from './components/PhotoresistorComponent';
import BreadboardMiniComponent from './components/BreadboardMiniComponent';

// Type for component attributes
export interface ComponentAttributes {
  id: string;
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

// Component map for dynamically generating components
export const componentMap: Record<string, React.FC<{
  componentData: ComponentData;
  onPinClicked: (pinId: string) => void;
  isActive: boolean;
  handleMouseDown: (id: string, isActive: boolean) => void;
  handleDeleteComponent: (id: string) => void;
}>> = {
  'led': LEDComponent,
  'rgb-led': RGBLEDComponent,
  'resistor': ResistorComponent,
  'hero-board': HeroBoardComponent,
  'buzzer': BuzzerComponent,
  'photoresistor': PhotoresistorComponent,
  'breadboard-mini': BreadboardMiniComponent,
};

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
) => {
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