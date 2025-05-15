import React from 'react';

// Define component types to display in the palette
const componentTypes = [
  {
    id: 'heroboard',
    name: 'HERO Board',
    description: 'Arduino-compatible microcontroller board',
    image: '/attached_assets/hero-board.icon.png',
    category: 'boards'
  },
  {
    id: 'led',
    name: 'LED',
    description: 'Light-emitting diode',
    image: '/attached_assets/led.icon.png',
    category: 'output'
  },
  {
    id: 'rgbled',
    name: 'RGB LED',
    description: 'RGB light-emitting diode',
    image: '/attached_assets/led.icon.png', // Use a proper RGB LED icon
    category: 'output'
  },
  {
    id: 'button',
    name: 'Button',
    description: 'Pushbutton switch',
    image: '/attached_assets/button.icon.png',
    category: 'input'
  },
  {
    id: 'potentiometer',
    name: 'Potentiometer',
    description: 'Variable resistor',
    image: '/attached_assets/potentiometer.icon.png',
    category: 'input'
  },
  {
    id: 'oled',
    name: 'OLED Display',
    description: '128x64 I2C OLED display',
    image: '/attached_assets/oled-display.icon.png',
    category: 'output'
  },
  {
    id: 'buzzer',
    name: 'Buzzer',
    description: 'Piezo buzzer',
    image: '/attached_assets/buzzer.icon.png',
    category: 'output'
  },
  {
    id: 'servo',
    name: 'Servo Motor',
    description: 'Servo motor',
    image: '/attached_assets/servo.icon.png',
    category: 'output'
  },
  {
    id: 'resistor',
    name: 'Resistor',
    description: 'Passive resistor',
    image: '/attached_assets/resistor.icon.png',
    category: 'passive'
  }
];

// Group components by category
const groupedComponents = componentTypes.reduce((acc: Record<string, typeof componentTypes>, component) => {
  const category = component.category;
  if (!acc[category]) {
    acc[category] = [];
  }
  acc[category].push(component);
  return acc;
}, {});

// Define category display names and order
const categoryInfo = {
  boards: { name: 'Boards', order: 1 },
  input: { name: 'Input Components', order: 2 },
  output: { name: 'Output Components', order: 3 },
  passive: { name: 'Passive Components', order: 4 }
};

interface CircuitComponentPaletteProps {
  onAddComponent: (componentType: string) => void;
}

/**
 * Circuit Component Palette Component
 * 
 * This component displays a palette of available circuit components
 * that can be added to the circuit canvas.
 */
export function CircuitComponentPalette({ onAddComponent }: CircuitComponentPaletteProps) {
  // Sort categories by order
  const sortedCategories = Object.keys(groupedComponents).sort(
    (a, b) => (categoryInfo[a as keyof typeof categoryInfo]?.order || 99) - 
              (categoryInfo[b as keyof typeof categoryInfo]?.order || 99)
  );
  
  return (
    <div className="component-palette">
      {sortedCategories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
            {categoryInfo[category as keyof typeof categoryInfo]?.name || category}
          </h4>
          
          <div className="space-y-1">
            {groupedComponents[category].map(component => (
              <div
                key={component.id}
                className="flex items-center p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                onClick={() => onAddComponent(component.id)}
                title={component.description}
              >
                <div className="w-8 h-8 flex-shrink-0 mr-2 bg-gray-700 rounded flex items-center justify-center overflow-hidden">
                  {component.image ? (
                    <img 
                      src={component.image} 
                      alt={component.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-white">{component.name}</div>
                  <div className="text-xs text-gray-400">{component.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}