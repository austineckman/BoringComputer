import React, { useEffect, useState } from 'react';
import { EmulatedComponent } from './HeroEmulator';

interface EmulatedButtonComponentProps {
  id: string;
  pin: string;
  groundPin?: string;
  isPullup?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'push' | 'toggle' | 'momentary';
  className?: string;
  onStateChange?: (isPressed: boolean) => void;
}

/**
 * EmulatedButtonComponent
 * 
 * This component represents a push button that can be used in circuits.
 * It responds to user interaction and changes the electrical signals
 * in the circuit through the emulator.
 * 
 * The button can be configured as:
 * - Push button (default): Button is pressed while held down
 * - Toggle button: Button toggles state on each press
 * - Momentary button: Button is pressed for a short time on click
 * 
 * It can also be configured with internal pull-up resistor enabled.
 */
const EmulatedButtonComponent: React.FC<EmulatedButtonComponentProps> = ({
  id,
  pin,
  groundPin = 'GND',
  isPullup = true,
  size = 'medium',
  variant = 'push',
  className = '',
  onStateChange
}) => {
  // Button pressed state
  const [isPressed, setIsPressed] = useState(false);
  
  // For toggle button
  const [isToggled, setIsToggled] = useState(false);
  
  // For momentary button timing
  const momentaryTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Map sizes to pixel dimensions
  const sizeMap = {
    small: { width: 24, height: 24 },
    medium: { width: 32, height: 32 },
    large: { width: 48, height: 48 }
  };

  // Define dimensions based on size
  const { width, height } = sizeMap[size];

  // Create an emulated component that can be registered with the HeroEmulator
  useEffect(() => {
    // Define the component properties for the emulator
    const emulatedButton: EmulatedComponent = {
      id,
      type: 'button',
      
      // This method will be called when pin states change from the emulator
      onPinChange: (pinId: string, isHigh: boolean) => {
        // Button only responds to changes on its own pin
        if (pinId === pin) {
          console.log(`Button ${id} pin ${pinId} changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        }
      },
      
      // Method to get current state
      getState: () => {
        return { isPressed, isPullup };
      }
    };
    
    // Expose the emulated component to parent components
    if (window && !window.emulatedComponents) {
      window.emulatedComponents = {};
    }
    
    if (window.emulatedComponents) {
      window.emulatedComponents[id] = emulatedButton;
      console.log(`Button component ${id} registered with pin ${pin}`);
    }
    
    // Clean up when component unmounts
    return () => {
      if (momentaryTimeoutRef.current) {
        clearTimeout(momentaryTimeoutRef.current);
      }
      
      if (window.emulatedComponents && window.emulatedComponents[id]) {
        delete window.emulatedComponents[id];
        console.log(`Button component ${id} unregistered`);
      }
    };
  }, [id, pin, isPullup]);
  
  // Update emulator when button state changes
  useEffect(() => {
    // When the button is pressed, we need to update the signal
    // on the pin directly through the emulator
    if (window.heroEmulator) {
      // For a pullup configuration:
      // - When button is pressed: Connect to GND (LOW)
      // - When button is released: Internal pullup (HIGH)
      // 
      // For non-pullup configuration:
      // - When button is pressed: Connect to VCC (HIGH)
      // - When button is released: Floating (LOW, assuming no other connections)
      const pinState = isPullup ? !isPressed : isPressed;
      
      window.heroEmulator.setDigitalInput(pin, pinState);
      console.log(`Button ${id} state changed to ${isPressed ? 'PRESSED' : 'RELEASED'}, pin ${pin} set to ${pinState ? 'HIGH' : 'LOW'}`);
      
      // Call the callback if provided
      if (onStateChange) {
        onStateChange(isPressed);
      }
    }
  }, [isPressed, isPullup, pin, id]);
  
  // Handle mouse down event
  const handleMouseDown = () => {
    if (variant === 'toggle') {
      // Toggle button switches state on press
      setIsToggled(!isToggled);
      setIsPressed(!isToggled);
    } else {
      // Push button is pressed when mouse is down
      setIsPressed(true);
    }
  };
  
  // Handle mouse up event
  const handleMouseUp = () => {
    if (variant === 'push') {
      // Push button is released when mouse is up
      setIsPressed(false);
    }
    // Toggle button state is already handled in mouseDown
  };
  
  // Handle click for momentary button
  const handleClick = () => {
    if (variant === 'momentary') {
      // Press the button
      setIsPressed(true);
      
      // Release after a short delay
      if (momentaryTimeoutRef.current) {
        clearTimeout(momentaryTimeoutRef.current);
      }
      
      momentaryTimeoutRef.current = setTimeout(() => {
        setIsPressed(false);
        momentaryTimeoutRef.current = null;
      }, 250);
    }
  };

  // Calculate styles for the button
  const buttonStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  // Button animation style based on pressed state
  const buttonAnimationStyle: React.CSSProperties = {
    width: width * 0.8,
    height: height * 0.8,
    borderRadius: '4px',
    backgroundColor: isPressed ? '#444' : '#666',
    border: '2px solid #888',
    boxShadow: isPressed 
      ? 'inset 0 2px 4px rgba(0,0,0,0.5)' 
      : '0 2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
    transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
    transition: 'all 0.05s ease-in-out'
  };

  return (
    <div
      className={`emulated-button ${className}`}
      style={buttonStyle}
      data-component-id={id}
      data-component-type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onMouseLeave={() => variant === 'push' && setIsPressed(false)}
    >
      {/* Button body */}
      <div
        className="button-body"
        style={buttonAnimationStyle}
      />

      {/* Button pins */}
      <div
        className="button-pins"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: width * 0.8,
          position: 'absolute',
          bottom: -5
        }}
      >
        {/* Signal pin */}
        <div
          className="button-pin signal-pin"
          style={{
            width: 2,
            height: 8,
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id={pin}
        >
          <div
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            {pin}
          </div>
        </div>

        {/* Ground pin */}
        <div
          className="button-pin ground-pin"
          style={{
            width: 2,
            height: 8,
            backgroundColor: '#999',
            position: 'relative'
          }}
          data-pin-id={groundPin}
        >
          <div
            className="pin-label"
            style={{
              position: 'absolute',
              bottom: -15,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#ccc'
            }}
          >
            {groundPin}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add the emulator to the window object for global access
declare global {
  interface Window {
    emulatedComponents?: Record<string, EmulatedComponent>;
    heroEmulator?: any; // The emulator instance
  }
}

export default EmulatedButtonComponent;