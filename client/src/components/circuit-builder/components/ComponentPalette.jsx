import { useState } from 'react';

/**
 * ComponentPalette displays available components for the circuit builder
 * Features:
 * - Categorized components
 * - Drag and drop functionality for adding components
 * - Visual representation of each component
 */
const ComponentPalette = ({ onAddComponent }) => {
  const [activeCategory, setActiveCategory] = useState('basics');
  
  // Component categories
  const categories = [
    { id: 'basics', name: 'Basics' },
    { id: 'inputs', name: 'Inputs' },
    { id: 'outputs', name: 'Outputs' },
    { id: 'advanced', name: 'Advanced' }
  ];
  
  // Component definitions by category
  const componentsByCategory = {
    basics: [
      { id: 'heroboard', name: 'HeroBoard', type: 'HeroBoard', imgSrc: '/components/heroboard.png' },
      { id: 'resistor', name: 'Resistor', type: 'Resistor', imgSrc: '/components/resistor.png' },
      { id: 'breadboard', name: 'Breadboard', type: 'Breadboard', imgSrc: '/components/breadboard.png' }
    ],
    inputs: [
      { id: 'button', name: 'Button', type: 'Button', imgSrc: '/components/button.png' },
      { id: 'photoresistor', name: 'Photoresistor', type: 'Photoresistor', imgSrc: '/components/photoresistor.png' },
      { id: 'potentiometer', name: 'Potentiometer', type: 'Potentiometer', imgSrc: '/components/potentiometer.png' }
    ],
    outputs: [
      { id: 'led', name: 'LED', type: 'LED', imgSrc: '/components/led.png' },
      { id: 'rgbled', name: 'RGB LED', type: 'RGBLED', imgSrc: '/components/rgbled.png' },
      { id: 'buzzer', name: 'Buzzer', type: 'Buzzer', imgSrc: '/components/buzzer.png' }
    ],
    advanced: [
      { id: 'servo', name: 'Servo Motor', type: 'Servo', imgSrc: '/components/servo.png' },
      { id: 'ultrasonic', name: 'Ultrasonic Sensor', type: 'Ultrasonic', imgSrc: '/components/ultrasonic.png' }
    ]
  };
  
  // Handle component selection
  const handleAddComponent = (componentType) => {
    if (onAddComponent) {
      onAddComponent(componentType);
    }
  };
  
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg shadow-sm p-3">
      <h3 className="font-semibold text-lg mb-3">Components</h3>
      
      {/* Category tabs */}
      <div className="flex mb-3 border-b border-gray-300">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-3 py-1 text-sm ${activeCategory === category.id 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Component grid */}
      <div className="grid grid-cols-3 gap-2">
        {componentsByCategory[activeCategory].map(component => (
          <div 
            key={component.id}
            className="flex flex-col items-center bg-white p-2 border border-gray-200 rounded cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => handleAddComponent(component.type)}
          >
            <img 
              src={component.imgSrc} 
              alt={component.name}
              className="w-12 h-12 object-contain mb-1"
            />
            <span className="text-xs text-center">{component.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;