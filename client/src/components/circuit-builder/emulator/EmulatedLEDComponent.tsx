/**
 * EmulatedLEDComponent.tsx
 * 
 * Emulated LED component that interfaces with the HeroEmulator.
 * This component will only respond to actual signals from the emulated CPU,
 * ensuring accurate hardware emulation.
 */

import React, { useEffect, useState, useRef } from 'react';
import { EmulatedLED } from './HeroEmulator';

interface LEDProps {
  id: string;
  anodePin: string;
  cathodePin: string;
  color?: string;
  size?: number;
  onRegister?: (component: EmulatedLED) => void;
  onUnregister?: (componentId: string) => void;
}

/**
 * EmulatedLEDComponent - A visually reactive LED component
 * that accurately emulates real LED hardware behavior
 */
const EmulatedLEDComponent: React.FC<LEDProps> = ({
  id,
  anodePin,
  cathodePin,
  color = 'red',
  size = 30,
  onRegister,
  onUnregister,
}) => {
  // LED state
  const [isOn, setIsOn] = useState(false);
  
  // Brightness level (for PWM pins)
  const [brightness, setBrightness] = useState(0);
  
  // Keep track of initialized state
  const initialized = useRef(false);
  
  // Set up the emulated LED component
  useEffect(() => {
    if (initialized.current) return;
    
    const ledComponent: EmulatedLED = {
      id,
      type: 'led',
      anode: anodePin,
      cathode: cathodePin,
      onStateChange: (state) => {
        // Update the LED visual state when the emulator changes its state
        if (state.isOn !== undefined) {
          setIsOn(state.isOn);
        }
        
        // Update brightness for PWM
        if (state.brightness !== undefined) {
          setBrightness(state.brightness);
        }
      },
      getState: () => {
        return { isOn, brightness };
      }
    };
    
    // Register with the emulator
    if (onRegister) {
      onRegister(ledComponent);
    }
    
    initialized.current = true;
    
    // Clean up
    return () => {
      if (onUnregister) {
        onUnregister(id);
      }
    };
  }, [id, anodePin, cathodePin, onRegister, onUnregister]);
  
  // Determine LED fill color based on state and color
  const getFillColor = () => {
    if (!isOn) {
      // LED off - show a darker version of the color
      switch (color) {
        case 'red':
          return '#300';
        case 'green':
          return '#030';
        case 'blue':
          return '#003';
        case 'yellow':
          return '#330';
        case 'white':
          return '#333';
        default:
          return '#300'; // Default to red
      }
    }
    
    // LED on - show the color at full brightness or with PWM dimming
    const brightnessValue = brightness > 0 ? brightness : 1;
    
    switch (color) {
      case 'red':
        return `rgba(255, 0, 0, ${brightnessValue})`;
      case 'green':
        return `rgba(0, 255, 0, ${brightnessValue})`;
      case 'blue':
        return `rgba(0, 0, 255, ${brightnessValue})`;
      case 'yellow':
        return `rgba(255, 255, 0, ${brightnessValue})`;
      case 'white':
        return `rgba(255, 255, 255, ${brightnessValue})`;
      default:
        return `rgba(255, 0, 0, ${brightnessValue})`;
    }
  };
  
  // Calculate glow effect based on brightness
  const getGlowEffect = () => {
    if (!isOn) return 'none';
    
    const glowColor = color === 'red' ? '#ff0000' :
                      color === 'green' ? '#00ff00' :
                      color === 'blue' ? '#0000ff' :
                      color === 'yellow' ? '#ffff00' : '#ffffff';
    
    // Adjust glow intensity based on brightness
    const glowIntensity = Math.max(2, Math.min(10, brightness * 10 || 5));
    
    return `0 0 ${glowIntensity}px ${glowColor}`;
  };
  
  return (
    <div
      className="emulated-led"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        display: 'inline-block',
      }}
      data-component-id={id}
      data-component-type="led"
      data-anode-pin={anodePin}
      data-cathode-pin={cathodePin}
    >
      {/* LED Body */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* LED Base */}
        <circle cx="50" cy="50" r="45" fill="#eee" stroke="#999" strokeWidth="2" />
        
        {/* LED Illuminated Element */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill={getFillColor()}
          style={{
            transition: 'fill 0.05s ease',
            filter: isOn ? `brightness(1.2) drop-shadow(${getGlowEffect()})` : 'none',
          }}
        />
        
        {/* Anode (+) Indicator */}
        <text x="40" y="85" fontSize="12" fill="#333">+</text>
        
        {/* Cathode (-) Indicator */}
        <text x="55" y="85" fontSize="12" fill="#333">-</text>
        
        {/* LED Label */}
        <text x="50" y="20" fontSize="10" textAnchor="middle" fill="#333">LED</text>
      </svg>
    </div>
  );
};

export default EmulatedLEDComponent;