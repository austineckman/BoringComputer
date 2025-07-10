import React, { useState, useRef, useEffect } from 'react';
import { componentOptions, generateId } from './constants/componentOptions';
import ComponentPalette from './components/ComponentPalette';
import BasicWireManager from './components/BasicWireManager';
import CircuitComponent from './components/CircuitComponent';
import PinTooltip from './components/PinTooltip'; // Import custom tooltip component
import './styles/tooltips.css'; // Import custom tooltip styles
import './styles/wire-manager.css'; // Import wire manager styles
import './lib/pin-tooltips.js'; // Import pin tooltip enhancer

// Import simulator context to pass down simulation state to components
import { useSimulator } from './simulator/SimulatorContext';

// Import specialized component implementations
import HeroBoard from './components/HeroBoard';
import LED from './components/LED';
import RGBLED from './components/RGBLED';
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
  // Access simulator context to share component data
  const { setSimulationComponents } = useSimulator();
  
  // State for circuit components
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  
  // Get the currently selected component
  const selectedComponent = components.find(c => c.id === selectedComponentId);
  
  // Share components with the simulator context
  useEffect(() => {
    if (setSimulationComponents) {
      console.log(`Sharing ${components.length} components with simulator context`);
      setSimulationComponents(components);
    }
  }, [components, setSimulationComponents]);
  
  // Track mouse position for wire connections
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!canvasRef?.current) return;
      
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);
  
  // Add a new component to the canvas
  const handleAddComponent = (type) => {
    try {
      // Validate component type
      if (!type) {
        console.warn('No component type provided');
        return;
      }
      
      // Find component details in our componentOptions
      const componentInfo = componentOptions.find(c => c.name === type);
      if (!componentInfo) {
        console.warn(`Unknown component type: ${type}`);
        return;
      }
      
      // Log the image path to debug
      console.log(`Adding component with image: ${componentInfo.imagePath || 'no image path'}`);
      
      // Generate random position near the center of the canvas
      const canvasWidth = canvasRef.current?.clientWidth || 800;
      const canvasHeight = canvasRef.current?.clientHeight || 600;
      
      // Adjust position to be more centered and randomized slightly
      const randomX = (canvasWidth / 2) + (Math.random() * 100 - 50);
      const randomY = (canvasHeight / 2) + (Math.random() * 100 - 50);
      
      // Generate a unique ID that's safe for use as a component identifier
      const safeType = type.replace(/[^a-zA-Z0-9-]/g, '');
      const uniqueId = generateId();
      const componentId = `${safeType}-${uniqueId}`;
      
      console.log(`Creating component with ID: ${componentId}`);
      
      // Create the new component with robust defaults for all properties
      const newComponent = {
        id: componentId,
        type: safeType, // Use sanitized type name
        x: randomX,
        y: randomY,
        // No rotation property needed - rotation is removed
        props: {
          // Add any component-specific properties with defaults
          label: componentInfo.displayName || type,
          description: componentInfo.description || `${type} component`
        } 
      };
      
      console.log('New component created:', newComponent);
      
      // Add component to state with defensive copy to avoid state mutation issues
      setComponents(prev => {
        const newComponents = [...(prev || []), newComponent];
        console.log(`Updated components array, now contains ${newComponents.length} components`);
        return newComponents;
      });
      
      // Set the newly created component as selected
      setSelectedComponentId(componentId);
    } catch (error) {
      console.error('Error adding component:', error);
      // Provide user feedback that something went wrong
      alert('There was an error adding the component. Please try again.');
    }
  };
  
  // Handle component selection
  const handleSelectComponent = (id) => {
    setSelectedComponentId(id);
  };
  
  // Helper to dispatch component movement events for wire position updates
const dispatchComponentMoveEvent = (componentId, final = false) => {
  if (!componentId) return;
  
  const eventType = final ? 'componentMovedFinal' : 'componentMoved';
  
  // Create and dispatch the custom event
  const moveEvent = new CustomEvent(eventType, {
    detail: { componentId }
  });
  
  document.dispatchEvent(moveEvent);
};

// Handle pin connections with stable pin positioning
const handlePinConnect = (pinId, pinType, componentId, pinPosition) => {
  // FIXED: Handle undefined or missing pin IDs by providing a default
  // This addresses the issue with component pins returning undefined values
  if (!pinId || pinId === 'undefined') {
    // Generate a valid pin name based on the component type
    const component = components.find(c => c.id === componentId);
    if (component) {
      const componentType = component.type || componentId.split('-')[0];
      // Use a different pin ID based on the component type
      if (componentType === 'buzzer') {
        pinId = 'pin1'; // Buzzer typically has one pin
      } else if (componentType === 'rgb-led') {
        pinId = 'red'; // Default to red pin for RGB LED
      } else if (componentType === 'led') {
        pinId = 'anode'; // Default to anode for regular LED
      } else if (componentType === 'custom-keypad') {
        pinId = 'out1'; // Default to out1 for keypad
      } else {
        pinId = `pin-${Date.now() % 1000}`; // Fallback to a unique pin name
      }
    } else {
      pinId = `pin-${Date.now() % 1000}`; // Fallback if component not found
    }
    
    // Also ensure pinType has a valid value
    if (!pinType) {
      pinType = 'bidirectional';
    }
    
    console.log(`Auto-assigned pin ID ${pinId} for component ${componentId}`);
  }
  
  console.log(`Pin ${pinId} (${pinType}) of component ${componentId} clicked`, pinPosition);
  
  // Get the component from our state
  const component = components.find(c => c.id === componentId);
  if (!component) {
    console.error(`Component ${componentId} not found in circuit`);
    return;
  }
  
  // Create proper format for pin ID that matches wire manager expectations
  // Avoid duplicate component types in the ID
  const componentType = componentId.toLowerCase().split('-')[0];
  const formattedPinId = `pt-${componentType}-${componentId.replace(/ /g, '')}-${pinId}`;
  
  // Get the absolute position of the pin in the canvas
  // CRITICAL IMPROVEMENT: Pin positions are now determined once and stored consistently
  let pinPosData;
  
  if (pinPosition && typeof pinPosition.x === 'number' && typeof pinPosition.y === 'number') {
    // Use the provided position which should be accurate
    pinPosData = {
      x: pinPosition.x,
      y: pinPosition.y,
      // Store the original component position for reference in case we need to
      // recalculate relative positions later
      origComponentX: component.x,
      origComponentY: component.y,
      component: componentId,
      pin: pinId,
      // Add a timestamp to track freshness of position data
      timestamp: Date.now()
    };
  } else {
    // Use component center as fallback - this is less accurate but prevents errors
    pinPosData = {
      x: component.x + (component.width ? component.width/2 : 50),
      y: component.y + (component.height ? component.height/2 : 50),
      isEstimated: true, // Mark as estimated for the wire manager
      component: componentId,
      pin: pinId,
      timestamp: Date.now()
    };
  }
  
  // Store pin connection in a stable cache that persists across component rerenders
  // This helps ensure stable wire positions
  if (!window.pinPositionCache) {
    window.pinPositionCache = new Map();
  }
  
  // Store both formattedPinId and a simplified version for more robust lookup
  window.pinPositionCache.set(formattedPinId, pinPosData);
  window.pinPositionCache.set(`${componentId}-${pinId}`, pinPosData);
  
  console.log(`Using pin position: (${pinPosData.x}, ${pinPosData.y})`);
  
  // Create a custom pin click event with stable positioning
  const pinClickEvent = new CustomEvent('pinClicked', {
    detail: {
      id: formattedPinId,
      pinId: pinId, // Include the actual pin ID separately for better debugging
      pinName: pinId, // Add pinName field for wire manager to use
      pinType: pinType || 'bidirectional',
      parentId: componentId,
      clientX: pinPosData.x,
      clientY: pinPosData.y,
      // Include comprehensive data about the pin for the wire manager
      pinData: JSON.stringify(pinPosData)
    }
  });
  
  // Dispatch the event to be captured by the wire manager
  document.dispatchEvent(pinClickEvent);
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
          onSelect={() => handleSelectComponent(component.id)}
          isSelected={component.id === selectedComponentId}
          canvasRef={canvasRef}
          onPinConnect={handlePinConnect}
          // Pass through all the component props to the RGB LED component
          ledRed={component.props?.ledRed || 0}
          ledGreen={component.props?.ledGreen || 0}
          ledBlue={component.props?.ledBlue || 0}
          commonPin={component.props?.commonPin || 'cathode'}
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
          initialRotation={0} // Fixed to 0 - no rotation
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
        rotation={0} // Fixed to 0 - no rotation
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
      <div 
        className="flex-1 relative h-full overflow-hidden bg-white" 
        ref={canvasRef}
        onClick={(e) => {
          // Only deselect when clicking directly on the canvas background
          if (e.target === canvasRef.current) {
            setSelectedComponentId(null);
          }
        }}
      >
        {/* Circuit components */}
        {components.map(renderComponent)}
        
        {/* Wire management layer */}
        <BasicWireManager canvasRef={canvasRef} />
        
        {/* Custom pin tooltip component */}
        <PinTooltip />
        
        {/* Wire Event Listener - Hidden element to capture wire selection events */}
        <div className="hidden" id="wire-event-listener"></div>
        
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
              <>
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
                
                {/* Wiring instructions */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">Wiring Instructions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                    <li><span className="font-medium">Anode (+):</span> Connect to digital pin (with resistor)</li>
                    <li><span className="font-medium">Cathode (-):</span> Connect to GND</li>
                    <li>Always use a resistor (220Ω-1kΩ) with LEDs to limit current</li>
                    <li>Pin 13 has a built-in LED on many Arduino boards</li>
                  </ul>
                </div>
              </>
            )}
            
            {selectedComponent.type === 'resistor' && (
              <>
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
                
                {/* Wiring instructions */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">Wiring Instructions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                    <li><span className="font-medium">Connect between:</span> Digital pin and LED anode</li>
                    <li>For LEDs, 220Ω to 1kΩ is typically appropriate</li>
                    <li>Resistors have no polarity - can be connected in either direction</li>
                    <li>Higher resistance = less current = dimmer LED</li>
                  </ul>
                </div>
              </>
            )}
            
            {selectedComponent.type === 'photoresistor' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex justify-between">
                    <span>Light Intensity</span>
                    <span className="text-amber-500">
                      {selectedComponent.props?.lightLevel || 50}%
                    </span>
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Dark</span>
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
                    <span className="text-xs text-gray-500">Bright</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div className="font-medium mb-1">Simulated Properties</div>
                  <div>Resistance: ~{Math.round((100 - (selectedComponent.props?.lightLevel || 50)) * 10)}Ω</div>
                  <div className="mt-1 text-xs text-gray-400">Lower light = higher resistance</div>
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'rgb-led' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Common Type
                  </label>
                  <div className="mt-1">
                    <select 
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={selectedComponent.props?.commonPin || 'cathode'}
                      onChange={(e) => {
                        setComponents(prev => 
                          prev.map(c => 
                            c.id === selectedComponent.id 
                              ? { ...c, props: { ...c.props, commonPin: e.target.value } } 
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
                
                {/* Wiring instructions */}
                <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <h4 className="font-medium text-sm text-gray-800 mb-2">Wiring Instructions:</h4>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                    <li><span className="font-medium">Red Pin:</span> Connect to digital pin 9 (via 220Ω resistor)</li>
                    <li><span className="font-medium">Green Pin:</span> Connect to digital pin 10 (via 220Ω resistor)</li>
                    <li><span className="font-medium">Blue Pin:</span> Connect to digital pin 11 (via 220Ω resistor)</li>
                    <li><span className="font-medium">Common Pin:</span> {selectedComponent.props?.commonPin === 'cathode' ? 'Connect to GND (common cathode)' : 'Connect to 5V (common anode)'}</li>
                    <li className="font-semibold">Example code: Use <span className="bg-gray-200 px-1 rounded">analogWrite(RED_PIN, value)</span> for PWM brightness control</li>
                    <li className="text-xs italic">{selectedComponent.props?.commonPin === 'anode' ? 'For common anode: HIGH (255) turns LED OFF, LOW (0) turns LED ON' : 'For common cathode: HIGH (255) turns LED ON, LOW (0) turns LED OFF'}</li>
                  </ul>
                </div>
                
                {/* Red control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex justify-between">
                    <span>Red</span>
                    <span className="text-red-500">
                      {Math.round((selectedComponent.props?.ledRed || 0) * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedComponent.props?.ledRed || 0}
                    onChange={(e) => {
                      setComponents(prev => 
                        prev.map(c => 
                          c.id === selectedComponent.id 
                            ? { ...c, props: { ...c.props, ledRed: parseFloat(e.target.value) } } 
                            : c
                        )
                      );
                    }}
                    className="mt-1 w-full"
                  />
                </div>
                
                {/* Green control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex justify-between">
                    <span>Green</span>
                    <span className="text-green-500">
                      {Math.round((selectedComponent.props?.ledGreen || 0) * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedComponent.props?.ledGreen || 0}
                    onChange={(e) => {
                      setComponents(prev => 
                        prev.map(c => 
                          c.id === selectedComponent.id 
                            ? { ...c, props: { ...c.props, ledGreen: parseFloat(e.target.value) } } 
                            : c
                        )
                      );
                    }}
                    className="mt-1 w-full"
                  />
                </div>
                
                {/* Blue control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 flex justify-between">
                    <span>Blue</span>
                    <span className="text-blue-500">
                      {Math.round((selectedComponent.props?.ledBlue || 0) * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={selectedComponent.props?.ledBlue || 0}
                    onChange={(e) => {
                      setComponents(prev => 
                        prev.map(c => 
                          c.id === selectedComponent.id 
                            ? { ...c, props: { ...c.props, ledBlue: parseFloat(e.target.value) } } 
                            : c
                        )
                      );
                    }}
                    className="mt-1 w-full"
                  />
                </div>
                
                {/* Color preview */}
                <div 
                  className="h-8 w-full mt-2 rounded-md border"
                  style={{ 
                    backgroundColor: `rgb(${Math.round((selectedComponent.props?.ledRed || 0) * 255)}, ${Math.round((selectedComponent.props?.ledGreen || 0) * 255)}, ${Math.round((selectedComponent.props?.ledBlue || 0) * 255)})`,
                    boxShadow: `0 0 10px rgb(${Math.round((selectedComponent.props?.ledRed || 0) * 255)}, ${Math.round((selectedComponent.props?.ledGreen || 0) * 255)}, ${Math.round((selectedComponent.props?.ledBlue || 0) * 255)})`
                  }}
                ></div>
              </div>
            )}
            
            {selectedComponent.type === 'dip-switch-3' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DIP Switch Settings
                  </label>
                  
                  <div className="space-y-2 bg-gray-50 p-3 rounded border">
                    {selectedComponent.props?.value?.map((switchValue, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Switch {index + 1}</span>
                        <button
                          onClick={() => {
                            setComponents(prev => 
                              prev.map(c => {
                                if (c.id === selectedComponent.id) {
                                  const newValue = [...(c.props?.value || [false, false, false])];
                                  newValue[index] = !newValue[index];
                                  return { ...c, props: { ...c.props, value: newValue } };
                                }
                                return c;
                              })
                            );
                          }}
                          className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                            switchValue 
                              ? 'bg-green-500 hover:bg-green-600 text-white' 
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }`}
                        >
                          {switchValue ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div className="font-medium mb-1">Component Information</div>
                  <div>A 3-position DIP switch with independent toggle control.</div>
                  <div className="mt-1">Each switch can be connected to a digital input pin.</div>
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'custom-keypad' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keypad Settings
                  </label>
                  
                  <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                    <div className="font-medium mb-1">Pin Configuration</div>
                    <p>This is a 4x4 matrix keypad with 8 pins:</p>
                    <ul className="list-disc pl-4 mt-1">
                      <li>4 row pins (output)</li>
                      <li>4 column pins (input)</li>
                    </ul>
                    <p className="mt-2 text-gray-600">Connection Example:</p>
                    <div className="bg-gray-200 p-2 mt-1 rounded font-mono">
                      <div>Row1 → Arduino pin 5</div>
                      <div>Row2 → Arduino pin 4</div>
                      <div>Row3 → Arduino pin 3</div>
                      <div>Row4 → Arduino pin 2</div>
                      <div>Col1 → Arduino pin 9</div>
                      <div>Col2 → Arduino pin 8</div>
                      <div>Col3 → Arduino pin 7</div>
                      <div>Col4 → Arduino pin 6</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div className="font-medium mb-1">Component Information</div>
                  <div>A standard 4x4 matrix keypad with 16 keys.</div>
                  <div className="mt-1">Requires the Keypad library to be used in Arduino code.</div>
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'oled-display' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OLED Display Settings
                  </label>
                  
                  <div>
                    <label htmlFor="display-scale" className="block text-sm font-medium text-gray-700 flex justify-between">
                      <span>Display Scale</span>
                      <span className="text-blue-500">{selectedComponent.props?.scale?.toFixed(1) || '1.0'}</span>
                    </label>
                    <input
                      id="display-scale"
                      type="range"
                      min="0.5"
                      max="1.0"
                      step="0.1"
                      value={selectedComponent.props?.scale || 1.0}
                      onChange={(e) => {
                        setComponents(prev => 
                          prev.map(c => 
                            c.id === selectedComponent.id 
                              ? { ...c, props: { ...c.props, scale: parseFloat(e.target.value) } } 
                              : c
                          )
                        );
                      }}
                      className="w-full mt-1"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                  <div className="font-medium mb-1">I2C Connection Guide</div>
                  <div className="bg-gray-200 p-2 rounded font-mono">
                    <div>GND → Arduino GND</div>
                    <div>VCC → Arduino 3.3V or 5V</div>
                    <div>SCL → Arduino SCL (A5 on Uno)</div>
                    <div>SDA → Arduino SDA (A4 on Uno)</div>
                  </div>
                  <div className="mt-2">Uses Adafruit SSD1306 library in Arduino code.</div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div className="font-medium mb-1">Component Information</div>
                  <div>128x64 pixel monochrome OLED display (SSD1306)</div>
                  <div className="mt-1">Communicates via I2C protocol.</div>
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'segmented-display' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    7-Segment Display Settings
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="digit-count" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Digits
                      </label>
                      <select
                        id="digit-count"
                        value={selectedComponent.props?.digits || 1}
                        onChange={(e) => {
                          setComponents(prev => 
                            prev.map(c => 
                              c.id === selectedComponent.id 
                                ? { ...c, props: { ...c.props, digits: parseInt(e.target.value) } } 
                                : c
                            )
                          );
                        }}
                        className="w-full text-sm rounded p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 Digit</option>
                        <option value="2">2 Digits</option>
                        <option value="4">4 Digits</option>
                        <option value="8">8 Digits</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="pin-layout" className="block text-sm font-medium text-gray-700 mb-1">
                        Pin Layout
                      </label>
                      <select
                        id="pin-layout"
                        value={selectedComponent.props?.pins || 'side'}
                        onChange={(e) => {
                          setComponents(prev => 
                            prev.map(c => 
                              c.id === selectedComponent.id 
                                ? { ...c, props: { ...c.props, pins: e.target.value } } 
                                : c
                            )
                          );
                        }}
                        className="w-full text-sm rounded p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="side">Side Pins</option>
                        <option value="bottom">Bottom Pins</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                  <div className="font-medium mb-1">Connection Guide</div>
                  <p>Using common cathode configuration:</p>
                  <div className="bg-gray-200 p-2 mt-1 rounded font-mono">
                    <div>A-G pins → Arduino digital pins through resistors (220Ω)</div>
                    <div>Common pins → Arduino GND</div>
                  </div>
                  <p className="mt-2">Libraries: TM1637 (4-digit) or MAX7219 (8-digit)</p>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div className="font-medium mb-1">Component Information</div>
                  <div>Seven-segment display for showing numbers and limited characters.</div>
                  <div className="mt-1">Each segment requires one digital pin or specialized driver.</div>
                </div>
              </div>
            )}
            
            {selectedComponent.type === 'rotary-encoder' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotary Encoder Settings
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="encoder-value" className="block text-sm font-medium text-gray-700 flex justify-between">
                        <span>Current Value</span>
                        <span className="text-blue-500">{selectedComponent.props?.value || 0}</span>
                      </label>
                      <input
                        id="encoder-value"
                        type="range"
                        min="0"
                        max="100"
                        value={selectedComponent.props?.value || 0}
                        onChange={(e) => {
                          setComponents(prev => 
                            prev.map(c => 
                              c.id === selectedComponent.id 
                                ? { ...c, props: { ...c.props, value: parseInt(e.target.value) } } 
                                : c
                            )
                          );
                        }}
                        className="w-full mt-1"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="step-size" className="block text-sm font-medium text-gray-700 mb-1">
                        Step Size
                      </label>
                      <select
                        id="step-size"
                        value={selectedComponent.props?.stepSize || 1}
                        onChange={(e) => {
                          setComponents(prev => 
                            prev.map(c => 
                              c.id === selectedComponent.id 
                                ? { ...c, props: { ...c.props, stepSize: parseInt(e.target.value) } } 
                                : c
                            )
                          );
                        }}
                        className="w-full text-sm rounded p-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="1">1 (Fine)</option>
                        <option value="5">5 (Medium)</option>
                        <option value="10">10 (Coarse)</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      <input
                        id="has-button"
                        type="checkbox"
                        checked={selectedComponent.props?.hasButton || false}
                        onChange={(e) => {
                          setComponents(prev => 
                            prev.map(c => 
                              c.id === selectedComponent.id 
                                ? { ...c, props: { ...c.props, hasButton: e.target.checked } } 
                                : c
                            )
                          );
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="has-button" className="ml-2 block text-sm text-gray-700">
                        Enable push button
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
                  <div className="font-medium mb-1">Connection Guide</div>
                  <div className="bg-gray-200 p-2 rounded font-mono">
                    <div>CLK → Arduino pin 2 (interrupt)</div>
                    <div>DT → Arduino pin 3 (interrupt)</div>
                    <div>SW → Arduino pin 4 (if button enabled)</div>
                    <div>+ → Arduino 5V</div>
                    <div>GND → Arduino GND</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <div className="font-medium mb-1">Component Information</div>
                  <div>Rotary encoder for selecting values by rotation.</div>
                  <div className="mt-1">Optionally includes a push button for selections.</div>
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