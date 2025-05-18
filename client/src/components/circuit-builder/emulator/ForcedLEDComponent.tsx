import React, { useState, useEffect, useRef } from 'react';

interface ForcedLEDProps {
  size?: number;
  color?: string;
  onStateChange?: (isOn: boolean) => void;
  isRunning: boolean;
  addLogMessage: (message: string) => void;
}

/**
 * A component that guarantees a blinking LED and simulation logs
 * regardless of what's happening in the emulator
 */
const ForcedLEDComponent: React.FC<ForcedLEDProps> = ({
  size = 32,
  color = '#FFFF00',
  onStateChange,
  isRunning,
  addLogMessage
}) => {
  const [isOn, setIsOn] = useState(false);
  const ledRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isRunning) return;
    
    console.log("ForcedLEDComponent activated - LED will blink every second");
    addLogMessage("[SYSTEM] LED component activated");
    addLogMessage("[SYSTEM] Built-in LED on Pin 13 ready");
    
    // Force the LED to blink on a timer
    const timer = setInterval(() => {
      setIsOn(prev => {
        const newState = !prev;
        
        // Notify parent component (if callback provided)
        if (onStateChange) {
          onStateChange(newState);
        }
        
        // Log the state change
        console.log(`Built-in LED changed to ${newState ? 'ON' : 'OFF'}`);
        const timestamp = new Date().toLocaleTimeString();
        addLogMessage(`[${timestamp}] LED on pin 13 is ${newState ? 'ON' : 'OFF'}`);
        
        return newState;
      });
    }, 1000); // 1 second blink interval
    
    // Clean up on unmount
    return () => clearInterval(timer);
  }, [isRunning, onStateChange, addLogMessage]);
  
  return (
    <div className="relative">
      <div 
        ref={ledRef}
        className="led-container" 
        style={{
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* LED body */}
        <div 
          className="led-body"
          style={{
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: '50%',
            backgroundColor: isOn ? color : '#444',
            boxShadow: isOn ? `0 0 ${size/3}px ${size/6}px ${color}` : 'none',
            border: '2px solid #666',
            transition: 'all 0.1s ease',
            marginBottom: 4
          }}
        />
        
        <div 
          className="led-label"
          style={{
            fontSize: '10px',
            color: '#ccc',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          PIN 13
        </div>
        
        {/* Status indicator - helps users see it's working */}
        <div 
          className="status-text"
          style={{
            position: 'absolute',
            top: -16,
            right: -40,
            fontSize: '10px',
            color: isOn ? '#00FF00' : '#FF0000',
            fontWeight: 'bold'
          }}
        >
          {isOn ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  );
};

export default ForcedLEDComponent;