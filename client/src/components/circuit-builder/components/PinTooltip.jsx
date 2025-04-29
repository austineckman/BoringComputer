import React, { useState, useEffect } from 'react';

/**
 * Enhanced tooltip component for pins that works across Shadow DOM
 * and Web Components to provide detailed information about pin connections
 * following Wokwi's implementation style
 */
const PinTooltip = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState('');
  const [pinType, setPinType] = useState('');
  const [pinInfo, setPinInfo] = useState(null);
  
  // Set up event listeners
  useEffect(() => {
    // Handler for custom event with pin information
    const handlePinHover = (e) => {
      // Extract data from the event
      const { detail } = e;
      if (detail) {
        // Set tooltip content
        const label = detail.name || detail.label || detail.pinId || 'Pin';
        setContent(label);
        
        // Set pin type for styling
        const type = detail.type || detail.pinType || 'unknown';
        setPinType(type);
        
        // Store additional pin information
        setPinInfo({
          componentId: detail.componentId || detail.parentId,
          pinId: detail.pinId || detail.id,
          description: detail.description || getDefaultDescription(type, label)
        });
        
        // Position the tooltip above the cursor
        setPosition({
          x: detail.clientX || detail.x,
          y: detail.clientY || detail.y - 30
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
    
    // Log for debugging
    console.log('Pin tooltip enhancement initialized');
    
    // Cleanup
    return () => {
      document.removeEventListener('pinHover', handlePinHover);
      document.removeEventListener('pinLeave', handlePinLeave);
    };
  }, []);
  
  // Generate default pin description based on type and label
  const getDefaultDescription = (type, label) => {
    if (label.includes('GND')) return 'Ground connection (0V)';
    if (label.includes('VCC') || label.includes('5V') || label.includes('3.3V')) 
      return `Power ${label.includes('3.3') ? '3.3V' : '5V'} connection`;
    
    if (label.includes('A') && !isNaN(label.replace('A', ''))) 
      return `Analog input pin ${label}`;
    
    if (label.includes('SCL')) return 'I²C clock line';
    if (label.includes('SDA')) return 'I²C data line';
    if (label.includes('TX')) return 'Serial transmit pin';
    if (label.includes('RX')) return 'Serial receive pin';
    
    if (label.includes('PWM') || label.match(/~D\d+/)) 
      return 'PWM capable digital pin';
    
    if (type === 'input') return 'Digital input pin';
    if (type === 'output') return 'Digital output pin';
    if (type === 'bidirectional') return 'Bidirectional I/O pin';
    
    return 'Component connection pin';
  };
  
  // Get pin type-specific styling
  const getPinTypeColor = () => {
    switch (pinType) {
      case 'input': return '#4CAF50';
      case 'output': return '#F44336';
      case 'bidirectional': return '#2196F3';
      case 'power': return '#FF9800';
      case 'ground': return '#607D8B';
      default: return '#9C27B0';
    }
  };
  
  // Don't render if not visible
  if (!visible) return null;
  
  return (
    <div 
      className="pin-tooltip animate-fadeIn"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'medium',
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        border: `2px solid ${getPinTypeColor()}`,
        whiteSpace: 'nowrap',
        maxWidth: '250px',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="flex flex-col gap-1">
        <div className="font-bold text-sm" style={{ color: getPinTypeColor() }}>
          {content}
        </div>
        
        {pinInfo && pinInfo.description && (
          <div className="text-xs text-gray-300">
            {pinInfo.description}
          </div>
        )}
        
        {pinType && (
          <div className="text-xs mt-1 px-1.5 py-0.5 rounded-sm" 
            style={{ 
              backgroundColor: `${getPinTypeColor()}30`,
              border: `1px solid ${getPinTypeColor()}80`,
              display: 'inline-block',
              alignSelf: 'flex-start'
            }}>
            {pinType.charAt(0).toUpperCase() + pinType.slice(1)}
          </div>
        )}
      </div>
      
      {/* Tooltip arrow */}
      <div style={{
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '12px',
        height: '12px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        border: `0 solid ${getPinTypeColor()}`,
        borderRightWidth: '2px',
        borderBottomWidth: '2px',
        boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.3)',
        transform: 'translateX(-50%) rotate(45deg)'
      }} />
    </div>
  );
};

export default PinTooltip;