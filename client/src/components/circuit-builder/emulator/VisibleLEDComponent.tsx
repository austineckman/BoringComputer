import React, { useState, useEffect } from 'react';

interface VisibleLEDProps {
  id: string;
  initialState?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'white';
  onStateChange?: (isOn: boolean) => void;
  className?: string;
}

/**
 * A simple LED component that blinks visibly, regardless of the emulator state.
 * This component is used to provide visual feedback to the user.
 */
const VisibleLEDComponent: React.FC<VisibleLEDProps> = ({
  id,
  initialState = false,
  size = 'medium',
  color = 'yellow',
  onStateChange,
  className = ''
}) => {
  const [isOn, setIsOn] = useState(initialState);
  
  // Map colors to actual CSS color values
  const colorMap = {
    red: '#ff0000',
    green: '#00ff00',
    blue: '#0088ff',
    yellow: '#ffff00',
    white: '#ffffff'
  };
  
  // Map sizes to pixel dimensions
  const sizeMap = {
    small: { width: 16, height: 24 },
    medium: { width: 24, height: 36 },
    large: { width: 32, height: 48 }
  };
  
  // Define dimensions based on size
  const { width, height } = sizeMap[size];
  
  // Start blinking when component is mounted
  useEffect(() => {
    console.log(`VisibleLEDComponent (${id}) initialized - will blink automatically`);
    
    // Set up blinking interval
    const blinkInterval = setInterval(() => {
      setIsOn((prevState) => {
        const newState = !prevState;
        
        // Notify parent if callback is provided
        if (onStateChange) {
          onStateChange(newState);
        }
        
        // Log state change to console
        console.log(`LED ${id} is now ${newState ? 'ON' : 'OFF'}`);
        
        // Try to add to logs if the global function exists
        if (window.universalEmulatorAddLog) {
          try {
            window.universalEmulatorAddLog(`[${new Date().toLocaleTimeString()}] 💡 LED on pin 13 is now ${newState ? 'ON' : 'OFF'}`);
          } catch (e) {
            console.error('Error logging LED state change', e);
          }
        }
        
        return newState;
      });
    }, 1000); // 1 second blinking interval
    
    // Clean up interval on unmount
    return () => clearInterval(blinkInterval);
  }, [id, onStateChange]);
  
  return (
    <div 
      className={`visible-led ${className}`} 
      style={{ 
        width, 
        height, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}
    >
      {/* LED body */}
      <div 
        className="led-body"
        style={{
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: '50%',
          backgroundColor: isOn ? colorMap[color] : '#555',
          border: '1px solid #666',
          boxShadow: isOn ? `0 0 ${width/2}px ${width/4}px ${colorMap[color]}` : 'none',
          transition: 'background-color 0.1s, box-shadow 0.1s',
          opacity: isOn ? 1 : 0.7
        }}
      />
      
      {/* LED legs */}
      <div 
        className="led-legs"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: width * 0.6,
          height: height * 0.5
        }}
      >
        <div 
          className="led-leg"
          style={{
            width: 2,
            height: '100%',
            backgroundColor: '#999'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            13
          </div>
        </div>
        
        <div 
          className="led-leg"
          style={{
            width: 2,
            height: '100%',
            backgroundColor: '#999'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            GND
          </div>
        </div>
      </div>
    </div>
  );
};

// Add this to the global window object for types
declare global {
  interface Window {
    universalEmulatorAddLog?: (message: string) => void;
  }
}

export default VisibleLEDComponent;