import React, { useEffect, useRef, useState } from 'react';
import {
  ReactRGBLEDComponent
} from "../lib/inventr-component-lib.es.js";
import Moveable from "react-moveable";

// Define MOVE_SETTINGS - remove rotation
const MOVE_SETTINGS = {
  DRAGGABLE: true,
  SNAPPABLE: true,
  THROTTLE_DRAG: 0,
  ROTATABLE: false // Disable rotation
};

/**
 * RGB LED Component
 * Using the Wokwi implementation from invent-share-master
 * Rotation functionality removed for simplicity
 */
const RGBLED = ({
  id,
  initialX = 100,
  initialY = 100,
  initialRotation = 0, // Kept for compatibility but not used
  onSelect,
  isSelected,
  canvasRef,
  onPinConnect
}) => {
  const targetRef = useRef();
  const moveableRef = useRef();

  // Internal state is 0-1 values as required by ReactRGBLEDComponent
  const [ledRed, setLedRed] = useState(0);     // Internal red value (0-1)
  const [ledGreen, setLedGreen] = useState(0); // Internal green value (0-1)
  const [ledBlue, setLedBlue] = useState(0);   // Internal blue value (0-1)
  const [commonPin, setCommonPin] = useState('anode'); // 'anode' or 'cathode'
  
  // Debug values for checking what's coming in
  const [redRaw, setRedRaw] = useState(0);   // Raw value (0-255) for debugging
  const [greenRaw, setGreenRaw] = useState(0); // Raw value (0-255) for debugging
  const [blueRaw, setBlueRaw] = useState(0);  // Raw value (0-255) for debugging
  
  // Initialize from props at component creation
  useEffect(() => {
    // The props values are already destructured in the function signature
    if (typeof ledRed === 'number') {
      setLedRed(ledRed);
    }
    if (typeof ledGreen === 'number') {
      setLedGreen(ledGreen);
    }
    if (typeof ledBlue === 'number') {
      setLedBlue(ledBlue);
    }
    if (typeof commonPin === 'string') {
      setCommonPin(commonPin);
    }
  // Only run on mount - props changes handled below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle prop updates separately for each value to avoid dependency cycles
  useEffect(() => {
    if (typeof ledRed === 'number') setLedRed(ledRed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledRed]);
  
  useEffect(() => {
    if (typeof ledGreen === 'number') setLedGreen(ledGreen);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledGreen]);
  
  useEffect(() => {
    if (typeof ledBlue === 'number') setLedBlue(ledBlue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledBlue]);
  
  useEffect(() => {
    if (typeof commonPin === 'string') setCommonPin(commonPin);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonPin]);

  const [pinInfo, setPinInfo] = useState();
  const [isDragged, setIsDragged] = useState(false);
  const [posTop, setPosTop] = useState(initialY);
  const [posLeft, setPosLeft] = useState(initialX);
  const [initPosTop, setInitPosTop] = useState(initialY);
  const [initPosLeft, setInitPosLeft] = useState(initialX);

  // Create a component data structure that matches what the original code expects
  const componentData = {
    id,
    type: 'rgbled',
    attrs: {
      top: posTop,
      left: posLeft,
      zIndex: 10,
      ledRed,
      ledGreen,
      ledBlue,
      commonPin
    }
  };

  // Handle drag only (rotation removed)
  const onDrag = ({ target, beforeTranslate }) => {
    if (beforeTranslate) {
      const [x, y] = beforeTranslate;
      setPosTop(y);
      setPosLeft(x);
    }
  };

  // Update position when dragged
  useEffect(() => {
    triggerRedraw();
  }, [pinInfo, posTop, posLeft]);

  const onPinInfoChange = (e) => {
    setPinInfo(e.detail);
  }

  // Trigger redraw function to update position
  const triggerRedraw = () => {
    if (targetRef.current) {
      const newTransform = `translate(${posLeft}px, ${posTop}px)`;
      targetRef.current.style.transform = newTransform;
    }
  };

  // Handle pin click - IDENTICAL to LED component
  const handlePinClicked = (e) => {
    console.log("Pin clicked on RGB LED:", e.detail);
    
    // Extract pin information from the event
    if (onPinConnect) {
      try {
        // The data is a JSON string inside the detail object
        const pinDataJson = e.detail.data;
        const pinData = JSON.parse(pinDataJson);
        
        // Get pin ID and type from the parsed data
        const pinId = pinData.name;
        
        // Determine pin type based on name
        let pinType = 'bidirectional';
        if (pinId === 'common') {
          pinType = 'power';
        } else if (pinId === 'red' || pinId === 'green' || pinId === 'blue') {
          pinType = 'digital';
        }
        
        // Get position information
        const clientX = e.detail.clientX || 0;
        const clientY = e.detail.clientY || 0;
        
        console.log(`Pin clicked: ${pinId} (${pinType})`);
        
        // Call the parent's onPinConnect handler
        onPinConnect(pinId, pinType, id);
        
        // Send another event with the formatted pin ID to match our wire manager
        const formattedPinId = `pt-${id.toLowerCase().split('-')[0]}-${id}-${pinId}`;
        
        // Create a custom pin click event to trigger the wire manager
        const pinClickEvent = new CustomEvent('pinClicked', {
          detail: {
            id: formattedPinId,
            pinData: pinDataJson,
            pinType: pinType,
            parentId: id,
            clientX,
            clientY
          }
        });
        
        // Dispatch the event to be captured by the wire manager
        document.dispatchEvent(pinClickEvent);
      } catch (err) {
        console.error("Error parsing pin data:", err);
      }
    }
  };

  // Update LED color function - Convert Arduino values (0-255) to component values (0-1)
  const updateLEDColor = (color, rawValue) => {
    // Store raw value for debugging
    let normalizedValue;
    
    // Ensure value is within Arduino PWM range (0-255)
    const clampedValue = Math.max(0, Math.min(255, rawValue));
    
    // Convert to 0-1 range for the component
    normalizedValue = clampedValue / 255;
    
    console.log(`RGB LED ${id}: Setting ${color} to raw=${clampedValue}, normalized=${normalizedValue}`);
    
    switch(color) {
      case 'red':
        setRedRaw(clampedValue);
        setLedRed(normalizedValue);
        break;
      case 'green':
        setGreenRaw(clampedValue);
        setLedGreen(normalizedValue);
        break;
      case 'blue': 
        setBlueRaw(clampedValue);
        setLedBlue(normalizedValue);
        break;
      case 'all':
        // Set all colors to the same value
        setRedRaw(clampedValue);
        setGreenRaw(clampedValue);
        setBlueRaw(clampedValue);
        setLedRed(normalizedValue);
        setLedGreen(normalizedValue);
        setLedBlue(normalizedValue);
        break;
      default:
        break;
    }
  };
  
  // Make the updateLEDColor function available to external components
  useEffect(() => {
    // Attach the function to the window for simulator access
    window.updateRGBLED = window.updateRGBLED || {};
    window.updateRGBLED[id] = (color, value) => {
      console.log(`Updating RGB LED ${id} ${color} channel to ${value}`);
      updateLEDColor(color, value);
    };
    
    return () => {
      // Clean up when component unmounts
      if (window.updateRGBLED && window.updateRGBLED[id]) {
        delete window.updateRGBLED[id];
      }
    };
  }, [id]);

  // Check if any LED is on for simulation feedback
  const isSimulationRunning = window.isSimulationRunning;
  const redOn = ledRed > 0.1;
  const greenOn = ledGreen > 0.1;
  const blueOn = ledBlue > 0.1;

  return (
    <>
      {isSelected && (
        <Moveable
          ref={moveableRef}
          target={targetRef}
          draggable={MOVE_SETTINGS.DRAGGABLE}
          snappable={MOVE_SETTINGS.SNAPPABLE}
          throttleDrag={MOVE_SETTINGS.THROTTLE_DRAG}
          rotatable={false} // Explicitly set to false to prevent rotation
          hideDefaultLines={true} // Hide the default selection lines
          className="moveable-no-border" // Add custom class for styling
          onDrag={onDrag}
          onDragStart={() => setIsDragged(true)}
          onDragEnd={() => setIsDragged(false)}
        ></Moveable>
      )}
      
      <div className="relative">
        {/* Add debug info when selected */}
        {isSelected && isSimulationRunning && (
          <div 
            className="absolute bg-black bg-opacity-70 text-white text-xs p-1 rounded"
            style={{ 
              top: posTop - 40, 
              left: posLeft, 
              zIndex: 1000 
            }}
          >
            Raw: [R:{redRaw} G:{greenRaw} B:{blueRaw}]
          </div>
        )}
        
        <ReactRGBLEDComponent
          id={id}
          className="min-w-min cursor-pointer absolute"
          ref={targetRef}
          isActive={false} // Explicitly set to false to remove blue outline
          isDragged={isDragged}
          onPinClicked={handlePinClicked}
          onPininfoChange={(e) => onPinInfoChange(e)}
          rotationTransform={0} // Fixed to 0 degrees - no rotation
          onMouseDown={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(id);
          }}
          style={{
            transform: `translate(${initPosLeft}px, ${initPosTop}px)`,
            zIndex: isDragged ? 99999 : 10,
            outline: isSelected ? '1px solid #3b82f6' : 'none' // Apply a single outline when selected
          }}
          ledRed={ledRed}
          ledGreen={ledGreen}
          ledBlue={ledBlue}
          controlPin={commonPin}
        />
        
        {/* Simulation state indicators and glow effects */}
        {isSimulationRunning && (
          <div className="absolute" style={{ transform: `translate(${initPosLeft}px, ${initPosTop}px)` }}>
            {/* Status indicator dot */}
            <div 
              className={`rounded-full w-3 h-3 absolute top-2 right-2 ${redOn || greenOn || blueOn ? 'bg-green-500' : 'bg-red-500'}`}
              style={{
                boxShadow: redOn || greenOn || blueOn ? '0 0 8px 2px #4ade80' : 'none',
                transition: 'background-color 0.2s, box-shadow 0.2s',
                zIndex: 100
              }}
            ></div>
            
            {/* RGB Glow effects for each color when on */}
            {redOn && (
              <div 
                className="absolute rounded-full w-8 h-8 opacity-60"
                style={{
                  backgroundColor: `rgba(255, 0, 0, ${ledRed})`,
                  transform: 'translate(5px, 10px)',
                  boxShadow: `0 0 15px 5px rgba(255, 0, 0, ${ledRed})`,
                  filter: 'blur(4px)',
                  animation: 'pulse 1s infinite alternate',
                  zIndex: 99
                }}
              ></div>
            )}
            
            {greenOn && (
              <div 
                className="absolute rounded-full w-8 h-8 opacity-60"
                style={{
                  backgroundColor: `rgba(0, 255, 0, ${ledGreen})`,
                  transform: 'translate(5px, 10px)',
                  boxShadow: `0 0 15px 5px rgba(0, 255, 0, ${ledGreen})`,
                  filter: 'blur(4px)',
                  animation: 'pulse 1s infinite alternate',
                  zIndex: 99
                }}
              ></div>
            )}
            
            {blueOn && (
              <div 
                className="absolute rounded-full w-8 h-8 opacity-60"
                style={{
                  backgroundColor: `rgba(0, 0, 255, ${ledBlue})`,
                  transform: 'translate(5px, 10px)',
                  boxShadow: `0 0 15px 5px rgba(0, 0, 255, ${ledBlue})`,
                  filter: 'blur(4px)',
                  animation: 'pulse 1s infinite alternate',
                  zIndex: 99
                }}
              ></div>
            )}
            
            {/* Mixed color effect if multiple colors are on */}
            {((redOn && greenOn) || (redOn && blueOn) || (greenOn && blueOn)) && (
              <div 
                className="absolute rounded-full w-10 h-10 opacity-60"
                style={{
                  backgroundColor: `rgb(
                    ${Math.round(ledRed * 255)}, 
                    ${Math.round(ledGreen * 255)}, 
                    ${Math.round(ledBlue * 255)}
                  )`,
                  transform: 'translate(5px, 10px)',
                  boxShadow: `0 0 20px 8px rgb(
                    ${Math.round(ledRed * 255)}, 
                    ${Math.round(ledGreen * 255)}, 
                    ${Math.round(ledBlue * 255)}
                  )`,
                  filter: 'blur(6px)',
                  animation: 'pulse 1.5s infinite alternate',
                  zIndex: 98
                }}
              ></div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default RGBLED;