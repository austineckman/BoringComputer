import React from 'react';
import BaseComponent from '../components/BaseComponent';
import CircuitPin from '../CircuitPin';
import { ComponentProps } from '../ComponentGenerator';
import heroBoardIconPath from '../../../assets/components/hero-board.icon.png';
import { useSimulator } from '../simulator/SimulatorContext';

interface PinDefinition {
  id: string;
  x: number;
  y: number;
  label: string;
  isDigital?: boolean;
  isAnalog?: boolean;
  isPower?: boolean;
  isGround?: boolean;
}

const HeroBoardComponent: React.FC<ComponentProps> = ({
  componentData,
  onPinClicked,
  isActive,
  handleMouseDown,
  handleDeleteComponent
}) => {
  const { id, attrs } = componentData;
  const { rotate = 0, left, ledPower = true } = attrs;

  // Access simulator context to get the pin states and update function
  const { componentStates, updateComponentState } = useSimulator();

  // State to track the onboard LED status
  const [onboardLedState, setOnboardLedState] = React.useState(false);
  // State to trigger re-renders for visual updates
  const [props, setProps] = React.useState({ lastUpdate: Date.now(), ledUpdate: Date.now() });

  // Get component state from simulator context
  const componentState = componentStates[id] || {};

  // Check multiple possible sources for pin 13 state
  const pin13IsHigh = React.useMemo(() => {
    // Check various pin 13 state sources
    const sources = [
      componentState.pin13,
      componentState.onboardLED,
      componentState.pin13LED,
      componentState.ledBuiltIn,
      componentState.builtInLED,
      componentState.pins?.['13'],
      componentState.pins?.[13],
      componentState.pins?.['pin13'],
      componentState.pins?.['LED_BUILTIN']
    ];

    // Return the first truthy value or false
    return sources.find(state => state === true) || false;
  }, [componentState]);

  // Listen for pin change events from the simulator
  React.useEffect(() => {
    const handlePinChange = (event: any) => {
      const { pin, isHigh } = event.detail;
      console.log(`[HeroBoard] Received pin change event: pin ${pin} = ${isHigh ? 'HIGH' : 'LOW'}`);

      if (pin === 13) {
        console.log(`🔴 [HeroBoard] Pin 13 (onboard LED) changed to ${isHigh ? 'HIGH' : 'LOW'}`);
        setOnboardLedState(isHigh);
        // Force re-render
        setProps(prev => ({ ...prev, lastUpdate: Date.now() }));
      }
    };

    const handleComponentStateChange = (event: any) => {
      const { componentId, pin, isHigh } = event.detail;
      if (componentId === id && pin === 13) {
        console.log(`🔴 [HeroBoard] Component state change for pin 13: ${isHigh ? 'HIGH' : 'LOW'}`);
        setOnboardLedState(isHigh);
        // Force re-render
        setProps(prev => ({ ...prev, lastUpdate: Date.now() }));
      }
    };

    window.addEventListener('pinChange', handlePinChange);
    window.addEventListener('componentStateChange', handleComponentStateChange);

    return () => {
      window.removeEventListener('pinChange', handlePinChange);
      window.removeEventListener('componentStateChange', handleComponentStateChange);
    };
  }, [id]);

  // Monitor component state from simulator context
  useEffect(() => {
    const currentState = componentStates[id];
    if (currentState) {
      console.log(`[HeroBoard] Component state updated for ${id}:`, currentState);

      // Check for pin 13 state in various formats
      const pin13State = currentState.pin13 || 
                        currentState.onboardLED || 
                        currentState.pin13LED ||
                        currentState.ledBuiltIn ||
                        currentState.builtInLED ||
                        currentState.pins?.['13'] || 
                        currentState.pins?.[13] ||
                        currentState.pins?.['pin13'] ||
                        currentState.pins?.['LED_BUILTIN'] ||
                        false;

      console.log(`🔴 [HeroBoard] Pin 13 check for ${id}: current=${pin13State}, previous=${onboardLedState}`);

      if (pin13State !== onboardLedState) {
        console.log(`🔴 [HeroBoard] Pin 13 state change detected for ${id}: ${pin13State ? 'HIGH' : 'LOW'}`);
        setOnboardLedState(pin13State);
        // Force component re-render
        setProps(prev => ({ ...prev, ledUpdate: Date.now() }));
      }
    }
  }, [componentStates, id, onboardLedState]);

  // Debug logging for pin 13 state
  React.useEffect(() => {
    console.log(`🔴 HeroBoard ${id} Pin 13 State Update:`, {
      pin13: componentState.pin13,
      onboardLED: componentState.onboardLED,
      pin13LED: componentState.pin13LED,
      'pins.13': componentState.pins?.['13'],
      'pins[13]': componentState.pins?.[13],
      'pins.d13': componentState.pins?.['d13'],
      finalState: pin13IsHigh,
      componentStateExists: !!componentState,
      hasAnyPinData: Object.keys(componentState).length > 0
    });
  }, [componentState, pin13IsHigh, id]);

  // Define pins based on Arduino layout
  const basePins: PinDefinition[] = [
    // Power pins
    { id: 'vin', x: -55, y: -90, label: 'VIN', isPower: true },
    { id: 'gnd1', x: -45, y: -90, label: 'GND', isGround: true },
    { id: 'gnd2', x: -35, y: -90, label: 'GND', isGround: true },
    { id: '5v', x: -25, y: -90, label: '5V', isPower: true },
    { id: '3v3', x: -15, y: -90, label: '3.3V', isPower: true },
    { id: 'rst', x: -5, y: -90, label: 'RST' },
    { id: 'aref', x: 5, y: -90, label: 'AREF' },

    // Digital pins (left side)
    { id: 'd0', x: -55, y: 90, label: 'D0', isDigital: true },
    { id: 'd1', x: -45, y: 90, label: 'D1', isDigital: true },
    { id: 'd2', x: -35, y: 90, label: 'D2', isDigital: true },
    { id: 'd3', x: -25, y: 90, label: 'D3', isDigital: true },
    { id: 'd4', x: -15, y: 90, label: 'D4', isDigital: true },
    { id: 'd5', x: -5, y: 90, label: 'D5', isDigital: true },
    { id: 'd6', x: 5, y: 90, label: 'D6', isDigital: true },
    { id: 'd7', x: 15, y: 90, label: 'D7', isDigital: true },

    // Digital pins (right side)
    { id: 'd8', x: 25, y: 90, label: 'D8', isDigital: true },
    { id: 'd9', x: 35, y: 90, label: 'D9', isDigital: true },
    { id: 'd10', x: 45, y: 90, label: 'D10', isDigital: true },
    { id: 'd11', x: 55, y: 90, label: 'D11', isDigital: true },
    { id: 'd12', x: 65, y: 90, label: 'D12', isDigital: true },
    { id: 'd13', x: 75, y: 90, label: 'D13', isDigital: true },

    // Analog pins
    { id: 'a0', x: 15, y: -90, label: 'A0', isAnalog: true },
    { id: 'a1', x: 25, y: -90, label: 'A1', isAnalog: true },
    { id: 'a2', x: 35, y: -90, label: 'A2', isAnalog: true },
    { id: 'a3', x: 45, y: -90, label: 'A3', isAnalog: true },
    { id: 'a4', x: 55, y: -90, label: 'A4', isAnalog: true },
    { id: 'a5', x: 65, y: -90, label: 'A5', isAnalog: true },
    { id: 'a6', x: 75, y: -90, label: 'A6', isAnalog: true },
  ];

  // Rotate pins based on board rotation
  const getPinCoordinates = (pin: PinDefinition) => {
    switch (rotate) {
      case 0: 
        return { x: pin.x, y: pin.y };
      case 90:
        return { x: -pin.y, y: pin.x };
      case 180:
        return { x: -pin.x, y: -pin.y };
      case 270:
        return { x: pin.y, y: -pin.x };
      default:
        return { x: pin.x, y: pin.y };
    }
  };

  console.log(`HeroBoardComponent ${id} rendering. Pin 13 state:`, pin13IsHigh ? 'HIGH' : 'LOW');

  return (
    <BaseComponent
      id={id}
      left={left}
      top={componentData.attrs.top}
      rotate={rotate}
      width={170}
      height={220}
      isActive={isActive}
      handleMouseDown={handleMouseDown}
      handleDelete={() => handleDeleteComponent(id)}
    >
      <div className="relative" style={{ width: '170px', height: '220px' }}>
        {/* Use the real hero board image */}
        <img
          src={heroBoardIconPath}
          alt="HERO Board Component"
          className="w-full h-full object-contain"
        />

        {/* Power LED overlay */}
        <div 
          className="absolute"
          style={{
            left: '40px',
            top: '30px',
            width: '4px',
            height: '4px',
            backgroundColor: ledPower ? '#5fea00' : 'transparent',
            borderRadius: '50%',
            boxShadow: ledPower ? '0 0 4px #5fea00' : 'none',
          }}
        />

        {/* Pin 13 onboard LED - ENHANCED VISIBILITY */}
        <div 
          className={`absolute w-3 h-3 rounded-full transition-all duration-200 border ${
            onboardLedState 
              ? 'bg-orange-400 border-orange-300 shadow-orange-400/75 shadow-lg animate-pulse' 
              : 'bg-gray-700 border-gray-500'
          }`}
          style={{
            left: '84px',
            top: '14px',
            zIndex: 10
          }}
          title={`Pin 13 (Onboard LED) - ${onboardLedState ? 'ON' : 'OFF'}`}
        >
          {/* Extra glow effect when LED is on */}
          {onboardLedState && (
            <div className="absolute inset-0 rounded-full bg-orange-300 opacity-50 animate-ping" />
          )}
        </div>

        {/* Debug indicator for pin 13 state */}
        <div 
          className={`absolute text-xs font-mono px-1 rounded ${
            onboardLedState ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
          style={{
            left: '90px',
            top: '12px',
            fontSize: '8px',
            zIndex: 11
          }}
        >
          {onboardLedState ? 'ON' : 'OFF'}
        </div>

        {/* Pin 13 LED overlay - responds to actual signals from simulation */}
        <div 
          className="absolute"
          style={{
            left: '135px',
            top: '75px',
            width: '10px',
            height: '10px',
            backgroundColor: pin13IsHigh ? '#ff0000' : '#440000',
            borderRadius: '50%',
            boxShadow: pin13IsHigh ? '0 0 15px 3px rgba(255, 0, 0, 0.9), inset 0 0 5px rgba(255, 255, 255, 0.3)' : '0 0 2px rgba(68, 0, 0, 0.5)',
            transition: 'all 0.1s ease',
            border: pin13IsHigh ? '2px solid #ff6666' : '2px solid #220000',
            zIndex: 999,
            opacity: 1,
          }}
          title={`Built-in LED (Pin 13): ${pin13IsHigh ? 'ON' : 'OFF'}`}
        />

        {/* Debug info overlay to show pin 13 state */}
        <div 
          className="absolute text-xs font-mono"
          style={{
            right: '5px',
            bottom: '5px',
            fontSize: '8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: pin13IsHigh ? '#ff3300' : '#aaaaaa',
            padding: '2px 4px',
            borderRadius: '2px',
            pointerEvents: 'none',
          }}
        >
          PIN 13: {pin13IsHigh ? 'HIGH' : 'LOW'}
        </div>
      </div>

      {/* Pins */}
      {basePins.map(pin => {
        const coords = getPinCoordinates(pin);
        return (
          <CircuitPin
            key={`${id}-${pin.id}`}
            id={`${id}-${pin.id}`}
            x={85 + coords.x}
            y={110 + coords.y}
            onClick={() => onPinClicked(`${id}-${pin.id}`)}
            color={
              pin.isPower ? '#ff6666' :
              pin.isGround ? '#aaaaaa' :
              pin.isDigital ? '#66ffff' :
              pin.isAnalog ? '#ffcc66' :
              '#ffcc00'
            }
          />
        );
      })}
    </BaseComponent>
  );
};

export default HeroBoardComponent;