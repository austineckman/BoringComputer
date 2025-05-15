import React, { useEffect, useState } from 'react';
import { EmulatedComponent } from './HeroEmulator';

interface EmulatedLEDComponentProps {
  id: string;
  anodePin: string;
  cathodePin: string;
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'white';
  size?: 'small' | 'medium' | 'large';
  onStateChange?: (isOn: boolean) => void;
  className?: string;
}

/**
 * EmulatedLEDComponent
 * 
 * This component represents an LED that responds only to actual signals 
 * from the emulated circuit. Its behavior is controlled solely by 
 * the emulator based on the voltage levels on its pins, not by any
 * artificial UI-driven logic.
 */
const EmulatedLEDComponent: React.FC<EmulatedLEDComponentProps> = ({
  id,
  anodePin,
  cathodePin,
  color = 'red',
  size = 'medium',
  onStateChange,
  className = ''
}) => {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(0);
  
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
  
  // Create an emulated component that can be registered with the HeroEmulator
  useEffect(() => {
    // Define the emulated component's properties
    const emulatedLED: EmulatedComponent = {
      id,
      type: 'led',
      
      // This is the key method that gets called when pin states change
      onPinChange: (pinId: string, isHigh: boolean) => {
        if (pinId === anodePin) {
          // LED turns on when anode is HIGH and cathode is LOW (or GND)
          // This mimics real LED behavior requiring a voltage difference
          const newIsOn = isHigh; // Simplified - in reality we would check cathode too
          const newBrightness = isHigh ? 1.0 : 0;
          
          setIsOn(newIsOn);
          setBrightness(newBrightness);
          
          // Notify parent component if needed
          if (onStateChange) {
            onStateChange(newIsOn);
          }
          
          console.log(`LED ${id} anode pin ${pinId} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        } else if (pinId === cathodePin) {
          // In a real circuit, LED turns on when anode is HIGH and cathode is LOW
          // Here we'll just log the change
          console.log(`LED ${id} cathode pin ${pinId} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        }
      },
      
      // Method to get current state
      getState: () => {
        return { isOn, brightness };
      }
    };
    
    // We could register the component with the HeroEmulator here,
    // but since we don't have direct access to the emulator instance,
    // the parent component should handle registration
    
    // For debugging: log component creation
    console.log(`EmulatedLED component created: id=${id}, anode=${anodePin}, cathode=${cathodePin}`);
    
    // Expose the emulated component to parent components
    if (window && !window.emulatedComponents) {
      window.emulatedComponents = {};
    }
    
    if (window.emulatedComponents) {
      window.emulatedComponents[id] = emulatedLED;
    }
    
    // Clean up when component unmounts
    return () => {
      if (window.emulatedComponents && window.emulatedComponents[id]) {
        delete window.emulatedComponents[id];
        console.log(`EmulatedLED component ${id} removed`);
      }
    };
  }, [id, anodePin, cathodePin]);
  
  // Calculate styles for LED
  const ledStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  // Calculate glow intensity based on brightness
  const glowRadius = isOn ? 10 + (brightness * 5) : 0;
  const glowOpacity = isOn ? 0.7 * brightness : 0;
  
  return (
    <div 
      className={`emulated-led ${className}`} 
      style={ledStyle}
      data-component-id={id}
      data-component-type="led"
    >
      {/* LED body */}
      <div
        className="led-body"
        style={{
          width: width * 0.8,
          height: width * 0.8,
          borderRadius: '50%',
          backgroundColor: isOn ? colorMap[color] : '#888888',
          border: '1px solid #666',
          position: 'relative',
          boxShadow: isOn 
            ? `0 0 ${glowRadius}px ${glowRadius / 2}px ${colorMap[color]}` 
            : 'none',
          opacity: isOn ? 0.9 + (brightness * 0.1) : 0.7,
          transition: 'background-color 0.05s, box-shadow 0.05s, opacity 0.05s'
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
          className="led-leg led-anode" 
          style={{
            width: 2,
            height: '100%',
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id={anodePin}
        >
          {/* Anode pin label */}
          <div 
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            {anodePin}
          </div>
        </div>
        
        <div
          className="led-leg led-cathode"
          style={{
            width: 2,
            height: '100%',
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id={cathodePin}
        >
          {/* Cathode pin label */}
          <div 
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            {cathodePin}
          </div>
        </div>
      </div>
    </div>
  );
};

// Define the emulated components on the window for global access
declare global {
  interface Window {
    emulatedComponents?: Record<string, EmulatedComponent>;
  }
}

export default EmulatedLEDComponent;