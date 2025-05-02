import React, { useState, useEffect } from 'react';

const PinTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Default tooltip style
  const tooltipStyle = {
    position: 'fixed',
    left: `${position.x + 15}px`,
    top: `${position.y + 15}px`,
    zIndex: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    maxWidth: '300px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    display: isVisible ? 'block' : 'none',
    pointerEvents: 'none',
    fontSize: '14px',
    transform: 'translate(0, 0)',
    transition: 'opacity 0.2s',
    opacity: isVisible ? 1 : 0
  };

  // Listen for pin hover/leave events
  useEffect(() => {
    const handlePinHover = (event) => {
      const { pin, component, position: eventPosition } = event.detail;
      
      // Set tooltip data
      setTooltipData({ pin, component });
      
      // Set position based on mouse position
      if (eventPosition) {
        setPosition(eventPosition);
      } else {
        // If no position provided, use a default
        setPosition({ x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 100 });
      }
      
      setIsVisible(true);
      
      // Log a message
      console.log('Pin tooltip enhancement initialized');
    };

    const handlePinLeave = () => {
      setIsVisible(false);
    };

    // Add global event listeners
    window.addEventListener('pin-hover', handlePinHover);
    window.addEventListener('pin-leave', handlePinLeave);

    return () => {
      // Clean up
      window.removeEventListener('pin-hover', handlePinHover);
      window.removeEventListener('pin-leave', handlePinLeave);
    };
  }, []);

  // Handle mouse movement when tooltip is visible
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isVisible) {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible]);

  // Don't render if no data
  if (!tooltipData) return null;

  const { pin } = tooltipData;

  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
        {pin.name}
      </div>
      
      <div style={{ fontSize: '12px', marginBottom: '6px' }}>
        {pin.description}
      </div>
      
      {pin.voltageRange && (
        <div style={{ fontSize: '11px', marginTop: '4px', color: '#8cc8ff' }}>
          <span style={{ fontWeight: 'bold' }}>Voltage:</span> {pin.voltageRange}
        </div>
      )}
      
      {pin.warnings && (
        <div style={{ fontSize: '11px', marginTop: '4px', color: '#ff9e80' }}>
          <span style={{ fontWeight: 'bold' }}>⚠️ Warning:</span> {pin.warnings}
        </div>
      )}
    </div>
  );
};

export default PinTooltip;
