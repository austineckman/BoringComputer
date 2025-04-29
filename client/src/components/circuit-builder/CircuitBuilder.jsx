import { useState, useRef, useEffect } from 'react';
import { generateId } from './utils/Utils';
import WireManager from './components/WireManager';
import ComponentPalette from './components/ComponentPalette';
import LED from './components/LED';
import HeroBoard from './components/HeroBoard';

// Component types mapping to their React components
const componentTypes = {
  'LED': LED,
  'HeroBoard': HeroBoard,
  // Add more component types as they are implemented
};

/**
 * CircuitBuilder is the main component for building electronic circuits
 * Features:
 * - Component palette for selecting and adding components
 * - Canvas for placing and connecting components
 * - Wire management for connecting components
 * - Component properties panel for configuring components
 */
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
    const ComponentToRender = componentTypes[component.type];
    
    if (!ComponentToRender) {
      console.warn(`Unknown component type: ${component.type}`);
      return null;
    }
    
    return (
      <ComponentToRender
        key={component.id}
        id={component.id}
        initialX={component.x}
        initialY={component.y}
        initialRotation={component.rotation}
        onSelect={handleSelectComponent}
        isSelected={component.id === selectedComponentId}
        canvasRef={canvasRef}
        onPinConnect={handlePinConnect}
        {...component.props}
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