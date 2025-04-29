import React, { useState, useRef, useEffect } from 'react';
import { componentOptions, generateId } from './constants/componentOptions';
import ComponentPalette from './components/ComponentPalette';
import WireManager from './components/WireManager';
import CircuitComponent from './components/CircuitComponent';

// Import specialized component implementations
import HeroBoard from './components/HeroBoard';
import LED from './components/LED';
import RGBLED from './components/RgbLed'; // Fixed case sensitivity issue
import Resistor from './components/Resistor';
import Photoresistor from './components/Photoresistor';
import Buzzer from './components/Buzzer';
import RotaryEncoder from './components/RotaryEncoder';
import DipSwitch from './components/DipSwitch';
import SegmentedDisplay from './components/SegmentedDisplay';
import Keypad from './components/Keypad';
import OLEDDisplay from './components/OLEDDisplay';

/**
 * Main Circuit Builder component
 * Manages components, wires, and interactions
 */
const CircuitBuilder = () => {
  // State for circuit components
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const canvasRef = useRef(null);
  
  // Get the currently selected component
  const selectedComponent = components.find(c => c.id === selectedComponentId);
  
  // Add a new component to the canvas
  const handleAddComponent = (type) => {
    // Find component details in our componentOptions
    const componentInfo = componentOptions.find(c => c.name === type);
    if (!componentInfo) {
      console.warn(`Unknown component type: ${type}`);
      return;
    }
    
    // Log the image path to debug
    console.log(`Adding component with image: ${componentInfo.imagePath}`);
    
    // Generate random position near the center of the canvas
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;
    
    // Adjust position to be more centered and randomized slightly
    const randomX = (canvasWidth / 2) + (Math.random() * 100 - 50);
    const randomY = (canvasHeight / 2) + (Math.random() * 100 - 50);
    
    // Create the new component with a unique ID
    const newComponent = {
      id: `${type}-${generateId()}`,
      type, // Use the component name from componentOptions
      x: randomX,
      y: randomY,
      rotation: 0,
      props: {
        // Add any component-specific properties
        label: componentInfo.displayName,
        description: componentInfo.description
      } 
    };
    
    // Add component to state
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
    // Specialized component renderers
    if (component.type === 'heroboard') {
      return (
        <HeroBoard
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
        />
      );
    }
    
    if (component.type === 'led') {
      return (
        <LED
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          color={component.props?.color || 'red'}
        />
      );
    }
    
    if (component.type === 'rgb-led') {
      return (
        <RGBLED
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          commonType={component.props?.commonType || 'cathode'}
        />
      );
    }
    
    if (component.type === 'resistor') {
      return (
        <Resistor
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          value={component.props?.value || '220Ω'}
        />
      );
    }
    
    if (component.type === 'photoresistor') {
      return (
        <Photoresistor
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          lightLevel={component.props?.lightLevel || 50}
        />
      );
    }
    
    if (component.type === 'buzzer') {
      return (
        <Buzzer
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          hasSignal={component.props?.hasSignal || false}
        />
      );
    }
    
    if (component.type === 'rotary-encoder') {
      return (
        <RotaryEncoder
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          stepSize={component.props?.stepSize || 1}
        />
      );
    }
    
    if (component.type === 'dip-switch-3') {
      return (
        <DipSwitch
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          initialValue={component.props?.value || [false, false, false]}
        />
      );
    }
    
    if (component.type === 'segmented-display') {
      return (
        <SegmentedDisplay
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          digits={component.props?.digits || 4}
          pins={component.props?.pins || "side"}
        />
      );
    }
    
    if (component.type === 'custom-keypad') {
      return (
        <Keypad
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
        />
      );
    }
    
    if (component.type === 'oled-display') {
      return (
        <OLEDDisplay
          key={component.id}
          id={component.id}
          initialX={component.x}
          initialY={component.y}
          initialRotation={component.rotation}
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
        />
      );
    }
    
    // Generic component renderer for other components
    const componentDefinition = componentOptions.find(opt => opt.name === component.type);
    
    if (!componentDefinition) {
      console.warn(`Unknown component type: ${component.type}`);
      return null;
    }
    
    // Get custom dimensions based on component type
    let width = 100;
    let height = 100;
    
    if (componentDefinition.name === 'oled-display') {
      width = 120;
      height = 80;
    } else if (componentDefinition.name === 'segmented-display') {
      width = 120;
      height = 80;
    } else if (componentDefinition.name === 'custom-keypad') {
      width = 120;
      height = 120;
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
        pins={componentDefinition.pinConfig}
        onSelect={handleSelectComponent}
        isSelected={component.id === selectedComponentId}
        onPinConnect={handlePinConnect}
        canvasRef={canvasRef}
        width={width}
        height={height}
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
              <div className="mt-1 text-sm font-semibold">{
                componentOptions.find(opt => opt.name === selectedComponent.type)?.displayName || 
                selectedComponent.type
              }</div>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Component ID
              </label>
              <div className="mt-1 text-xs text-gray-500 font-mono">{selectedComponent.id}</div>
            </div>
            
            {/* Component-specific properties */}
            {selectedComponent.type === 'led' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  LED Color
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {['red', 'green', 'blue', 'yellow', 'white'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setComponents(prev => 
                          prev.map(c => 
                            c.id === selectedComponent.id 
                              ? { ...c, props: { ...c.props, color } } 
                              : c
                          )
                        );
                      }}
                      className={`w-6 h-6 rounded-full border ${
                        selectedComponent.props?.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Set color to ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'resistor' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Resistance Value
                </label>
                <select 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedComponent.props?.value || '220Ω'}
                  onChange={(e) => {
                    setComponents(prev => 
                      prev.map(c => 
                        c.id === selectedComponent.id 
                          ? { ...c, props: { ...c.props, value: e.target.value } } 
                          : c
                      )
                    );
                  }}
                >
                  <option value="100Ω">100Ω</option>
                  <option value="220Ω">220Ω</option>
                  <option value="330Ω">330Ω</option>
                  <option value="470Ω">470Ω</option>
                  <option value="1kΩ">1kΩ</option>
                  <option value="4.7kΩ">4.7kΩ</option>
                  <option value="10kΩ">10kΩ</option>
                </select>
              </div>
            )}
            
            {selectedComponent.type === 'photoresistor' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Light Level
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Dark</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={selectedComponent.props?.lightLevel || 50}
                    onChange={(e) => {
                      setComponents(prev => 
                        prev.map(c => 
                          c.id === selectedComponent.id 
                            ? { ...c, props: { ...c.props, lightLevel: parseInt(e.target.value) } } 
                            : c
                        )
                      );
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs">Bright</span>
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'rgb-led' && (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Common Type
                </label>
                <div className="mt-1">
                  <select 
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedComponent.props?.commonType || 'cathode'}
                    onChange={(e) => {
                      setComponents(prev => 
                        prev.map(c => 
                          c.id === selectedComponent.id 
                            ? { ...c, props: { ...c.props, commonType: e.target.value } } 
                            : c
                        )
                      );
                    }}
                  >
                    <option value="cathode">Common Cathode</option>
                    <option value="anode">Common Anode</option>
                  </select>
                </div>
              </div>
            )}
            
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