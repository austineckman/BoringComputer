import React, { useState } from 'react';

/**
 * ComponentPalette provides a UI for selecting circuit components
 */

// Define available circuit components
const componentOptions = [
  { 
    name: 'led', 
    displayName: 'LED',
    category: 'output',
    description: 'Light Emitting Diode',
    imagePath: '/images/components/led.icon.png',
    pinConfig: [
      { id: 'anode', type: 'input', label: '+' },
      { id: 'cathode', type: 'output', label: '-' }
    ]
  },
  { 
    name: 'heroboard', 
    displayName: 'HeroBoard',
    category: 'controller',
    description: 'Microcontroller Board',
    imagePath: '/images/components/hero-board.icon.png', 
    pinConfig: [
      { id: 'd0', type: 'bidirectional', label: 'D0' },
      { id: 'd1', type: 'bidirectional', label: 'D1' },
      { id: 'd2', type: 'bidirectional', label: 'D2' },
      { id: 'd3', type: 'bidirectional', label: 'D3' },
      { id: 'd4', type: 'bidirectional', label: 'D4' },
      { id: 'd5', type: 'bidirectional', label: 'D5' },
      { id: 'd6', type: 'bidirectional', label: 'D6' },
      { id: 'd7', type: 'bidirectional', label: 'D7' },
      { id: 'd8', type: 'bidirectional', label: 'D8' },
      { id: 'd9', type: 'bidirectional', label: 'D9' },
      { id: 'd10', type: 'bidirectional', label: 'D10' },
      { id: 'd11', type: 'bidirectional', label: 'D11' },
      { id: 'd12', type: 'bidirectional', label: 'D12' },
      { id: 'd13', type: 'bidirectional', label: 'D13' },
      { id: 'a0', type: 'input', label: 'A0' },
      { id: 'a1', type: 'input', label: 'A1' },
      { id: 'a2', type: 'input', label: 'A2' },
      { id: 'a3', type: 'input', label: 'A3' },
      { id: 'a4', type: 'input', label: 'A4' },
      { id: 'a5', type: 'input', label: 'A5' },
      { id: '5v', type: 'output', label: '5V' },
      { id: '3v3', type: 'output', label: '3.3V' },
      { id: 'gnd', type: 'input', label: 'GND' },
      { id: 'rst', type: 'input', label: 'RST' }
    ]
  },
  { 
    name: 'resistor', 
    displayName: 'Resistor',
    category: 'passive',
    description: 'Current Limiting Resistor',
    imagePath: '/images/components/resistor.icon.png',
    pinConfig: [
      { id: 'pin1', type: 'bidirectional', label: '1' },
      { id: 'pin2', type: 'bidirectional', label: '2' }
    ]
  },
  { 
    name: 'rgbled', 
    displayName: 'RGB LED',
    category: 'output',
    description: 'Red-Green-Blue LED',
    imagePath: '/images/components/rgb-led.icon.png',
    pinConfig: [
      { id: 'common', type: 'input', label: 'COM' },
      { id: 'red', type: 'output', label: 'R' },
      { id: 'green', type: 'output', label: 'G' },
      { id: 'blue', type: 'output', label: 'B' }
    ]
  },
  { 
    name: 'photoresistor', 
    displayName: 'Photoresistor',
    category: 'sensor',
    description: 'Light Sensor',
    imagePath: '/images/components/photoresistor.icon.png',
    pinConfig: [
      { id: 'pin1', type: 'bidirectional', label: '1' },
      { id: 'pin2', type: 'bidirectional', label: '2' }
    ]
  },
  { 
    name: 'oled-display', 
    displayName: 'OLED Display',
    category: 'output',
    description: 'Small OLED Screen',
    imagePath: '/images/components/oled-display.icon.png',
    pinConfig: [
      { id: 'vcc', type: 'input', label: 'VCC' },
      { id: 'gnd', type: 'output', label: 'GND' },
      { id: 'scl', type: 'input', label: 'SCL' },
      { id: 'sda', type: 'input', label: 'SDA' }
    ]
  },
  { 
    name: 'rotary-encoder', 
    displayName: 'Rotary Encoder',
    category: 'input',
    description: 'Rotary Input Control',
    imagePath: '/images/components/rotary-encoder.icon.png',
    pinConfig: [
      { id: 'clk', type: 'output', label: 'CLK' },
      { id: 'dt', type: 'output', label: 'DT' },
      { id: 'sw', type: 'output', label: 'SW' },
      { id: 'vcc', type: 'input', label: 'VCC' },
      { id: 'gnd', type: 'input', label: 'GND' }
    ]
  },
  { 
    name: 'dip-switch', 
    displayName: 'DIP Switch',
    category: 'input',
    description: '3-Way DIP Switch',
    imagePath: '/images/components/dip-switch-3.icon.png',
    pinConfig: [
      { id: 'com', type: 'input', label: 'COM' },
      { id: 'sw1', type: 'output', label: 'SW1' },
      { id: 'sw2', type: 'output', label: 'SW2' },
      { id: 'sw3', type: 'output', label: 'SW3' }
    ]
  },
  { 
    name: 'segmented-display', 
    displayName: '7-Segment Display',
    category: 'output',
    description: 'Numeric Display',
    imagePath: '/images/components/segmented-display.icon.png',
    pinConfig: [
      { id: 'vcc', type: 'input', label: 'VCC' },
      { id: 'gnd', type: 'input', label: 'GND' },
      { id: 'din', type: 'input', label: 'DIN' },
      { id: 'clk', type: 'input', label: 'CLK' },
      { id: 'cs', type: 'input', label: 'CS' }
    ]
  }
];
const ComponentPalette = ({ onAddComponent }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Define component categories
  const categories = [
    { id: 'all', name: 'All Components' },
    { id: 'controller', name: 'Controllers' },
    { id: 'input', name: 'Input Devices' },
    { id: 'output', name: 'Output Devices' },
    { id: 'sensor', name: 'Sensors' },
    { id: 'passive', name: 'Passive Components' }
  ];
  
  // Filter components based on category and search term
  const filteredComponents = componentOptions.filter(component => {
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    const matchesSearch = component.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          component.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="circuit-component-palette">
      <h3 className="text-lg font-bold mb-2">Component Palette</h3>
      
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search components..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Category tabs */}
      <div className="flex mb-3 overflow-x-auto whitespace-nowrap text-xs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`px-2 py-1 rounded-t border-b-2 ${
              selectedCategory === category.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Component grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredComponents.map((component) => (
          <div
            key={component.name}
            className="p-2 border border-gray-200 rounded bg-white hover:bg-blue-50 hover:border-blue-200 cursor-pointer text-center shadow-sm transition-colors"
            onClick={() => onAddComponent(component.name)}
          >
            <div className="mb-1 h-12 flex items-center justify-center">
              <img
                src={component.imagePath}
                alt={component.displayName}
                className="h-full object-contain"
              />
            </div>
            <div className="text-xs font-medium">{component.displayName}</div>
            <div className="text-xs text-gray-500 truncate">{component.description}</div>
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No components found</p>
          <p className="text-xs mt-1">Try another search term or category</p>
        </div>
      )}
    </div>
  );
};

export default ComponentPalette;