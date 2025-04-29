import React, { useState, useEffect } from 'react';

/**
 * Custom tooltip component for pins that works across Shadow DOM
 * and Web Components to provide consistent tooltips
 */
const PinTooltip = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState('');
  
  // Set up event listeners
  useEffect(() => {
    // Handler for custom event with pin information
    const handlePinHover = (e) => {
      // Extract data from the event
      const { detail } = e;
      if (detail) {
        // Set tooltip content
        setContent(detail.name || detail.label || detail.pinId || 'Pin');
        
        // Position the tooltip above the cursor
        setPosition({
          x: detail.clientX,
          y: detail.clientY - 20
        });
        
        // Show the tooltip
        setVisible(true);
      }
    };
    
    // Handler for mouseout
    const handlePinLeave = () => {
      setVisible(false);
    };
    
    // Register the event listeners
    document.addEventListener('pinHover', handlePinHover);
    document.addEventListener('pinLeave', handlePinLeave);
    
    // Cleanup
    return () => {
      document.removeEventListener('pinHover', handlePinHover);
      document.removeEventListener('pinLeave', handlePinLeave);
    };
  }, []);
  
  // Don't render if not visible
  if (!visible) return null;
  
  return (
    <div 
      className="pin-tooltip"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none',
        zIndex: 9999,
        border: '1px solid #00a0ff',
        whiteSpace: 'nowrap'
      }}
    >
      {content}
    </div>
  );
};

export default PinTooltip;