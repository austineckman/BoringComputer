import { useState, useRef, useEffect } from 'react';
import { nanoid } from 'nanoid';
import ComponentPalette from './components/ComponentPalette';
import WireManager from './components/WireManager';
import CircuitComponent from './components/CircuitComponent';

/**
 * CircuitBuilder is the main component for building electronic circuits
 * Features:
 * - Component palette for selecting and adding components
 * - Canvas for placing and connecting components
 * - Wire management for connecting components
 * - Component properties panel for configuring components
 */

// Helper function to generate unique IDs
const generateId = () => nanoid(8);

// Define available circuit components
export const componentOptions = [
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
const CircuitBuilder = () => {
  // State for tracking components and connections
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const canvasRef = useRef(null);
  
  // Get the currently selected component
  const selectedComponent = components.find(c => c.id === selectedComponentId);
  
  // Add a new component to the canvas
  const handleAddComponent = (type) => {
    // Generate random position near the center of the canvas
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;
    
    const randomX = (canvasWidth / 2) + (Math.random() * 100 - 50);
    const randomY = (canvasHeight / 2) + (Math.random() * 100 - 50);
    
    const newComponent = {
      id: generateId(type.toLowerCase()),
      type,
      x: randomX,
      y: randomY,
      rotation: 0,
      props: {} // Component-specific properties
    };
    
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponentId(newComponent.id);
  };
  
  // Handle component selection
  const handleSelectComponent = (id) => {
    setSelectedComponentId(id);
  };
  
  // Handle pin connections
  const handlePinConnect = (pinId, pinType, componentId) => {
    console.log(`Pin ${pinId} (${pinType}) of component ${componentId} clicked`);
    // Wire connections are handled by WireManager
  };
  
  // Handle component deletion
  const handleDeleteComponent = () => {
    if (selectedComponentId) {
      setComponents(prev => prev.filter(c => c.id !== selectedComponentId));
      setSelectedComponentId(null);
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected component with Delete key
      if (e.key === 'Delete' && selectedComponentId) {
        handleDeleteComponent();
      }
      
      // Escape key to deselect
      if (e.key === 'Escape') {
        setSelectedComponentId(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedComponentId]);
  
  // Render a component based on its type
  const renderComponent = (component) => {
    // Find the component definition from the options
    const componentDefinition = componentOptions.find(opt => opt.name === component.type);
    
    if (!componentDefinition) {
      console.warn(`Unknown component type: ${component.type}`);
      return null;
    }
    
    return (
      <CircuitComponent
        key={component.id}
        id={component.id}
        type={componentDefinition.displayName}
        image={componentDefinition.imagePath}
        x={component.x}
        y={component.y}
        rotation={component.rotation}
        pins={componentDefinition.pinConfig.map(pin => ({
          ...pin,
          position: {
            // Simple pin positioning - can be improved for more complex components
            x: pin.id.includes('left') ? 0 : pin.id.includes('right') ? 1 : 0.5,
            y: pin.id.includes('top') ? 0 : pin.id.includes('bottom') ? 1 : 0.5,
          }
        }))}
        onSelect={handleSelectComponent}
        isSelected={component.id === selectedComponentId}
        onPinConnect={handlePinConnect}
        canvasRef={canvasRef}
        width={componentDefinition.name === 'heroboard' ? 200 : 100}
        height={componentDefinition.name === 'heroboard' ? 150 : 100}
      />
    );
  };
  
  return (
    <div className="flex h-full">
      {/* Left sidebar - Component palette */}
      <div className="w-64 h-full overflow-y-auto border-r border-gray-300 p-3">
        <ComponentPalette onAddComponent={handleAddComponent} />
      </div>
      
      {/* Main canvas */}
      <div className="flex-1 relative h-full overflow-hidden bg-gray-50" ref={canvasRef}>
        {/* Circuit components */}
        {components.map(renderComponent)}
        
        {/* Wire management layer */}
        <WireManager canvasRef={canvasRef} />
        
        {/* Empty state */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="mb-2">Add components from the palette to get started</p>
              <p className="text-sm">Click and drag to position components</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Right sidebar - Component properties */}
      <div className="w-64 h-full overflow-y-auto border-l border-gray-300 p-3">
        <h3 className="font-semibold text-lg mb-3">Properties</h3>
        
        {selectedComponent ? (
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Component Type
              </label>
              <div className="mt-1 text-sm">{selectedComponent.type}</div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Component ID
              </label>
              <div className="mt-1 text-sm">{selectedComponent.id}</div>
            </div>
            
            {/* Component-specific properties would go here */}
            
            <button
              onClick={handleDeleteComponent}
              className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete Component
            </button>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Select a component to view and edit its properties
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitBuilder;