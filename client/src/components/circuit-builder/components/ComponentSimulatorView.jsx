import React, { useState, useEffect } from 'react';
import { useComponentRegistry } from '../hooks/useComponentRegistry';

const ComponentSimulatorView = ({ component }) => {
  const [hoveredPin, setHoveredPin] = useState(null);
  const { getComponentDefinition } = useComponentRegistry();

  // Style for the component simulator container
  const containerStyle = {
    width: '200px',
    height: '200px',
    margin: '0 auto',
    position: 'relative',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Get the simulator component based on component id
  const renderSimulatorComponent = () => {
    if (!component || !component.id) return null;
    
    // This is where we would render the actual component
    // For now, we'll just render a placeholder with the component icon
    return (
      <div style={{ textAlign: 'center' }}>
        <img 
          src={component.iconSrc} 
          alt={component.name}
          style={{ 
            width: '100px', 
            height: '100px', 
            objectFit: 'contain',
            marginBottom: '10px'
          }}
        />
        
        {/* Pin visualization */}
        <div className="pin-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {component.pins.map((pin) => (
            <div 
              key={pin.id}
              className={`pin ${hoveredPin === pin.id ? 'hovered' : ''}`}
              style={{
                padding: '5px 10px',
                border: '1px solid #ccc',
                borderRadius: '3px',
                backgroundColor: hoveredPin === pin.id ? '#e0f7fa' : '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={() => {
                setHoveredPin(pin.id);
                // Trigger the global pin tooltip
                const event = new CustomEvent('pin-hover', { 
                  detail: { pin, component, position: { x: 0, y: 0 } } 
                });
                window.dispatchEvent(event);
              }}
              onMouseLeave={() => {
                setHoveredPin(null);
                // Hide the tooltip
                const event = new CustomEvent('pin-leave');
                window.dispatchEvent(event);
              }}
            >
              {pin.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {renderSimulatorComponent()}
    </div>
  );
};

export default ComponentSimulatorView;
