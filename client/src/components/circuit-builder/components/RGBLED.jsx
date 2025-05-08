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

  const [ledRed, setLedRed] = useState(0); // Initial red value (0-1)
  const [ledGreen, setLedGreen] = useState(0); // Initial green value (0-1)
  const [ledBlue, setLedBlue] = useState(0); // Initial blue value (0-1)
  const [commonPin, setCommonPin] = useState('anode'); // 'anode' or 'cathode'
  
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

  // Handle pin click with improved pin details for the new wire manager
  const handlePinClicked = (e) => {
    if (onPinConnect) {
      try {
        // Parse the data object to get detailed pin information
        const pinData = e.detail.data ? JSON.parse(e.detail.data) : {};
        console.log(`Pin clicked on RGB LED:`, e.detail);
        
        // Get the actual pin name from the data
        const pinId = e.detail.id;
        
        // Extract the proper pin name based on the data value
        let pinName = pinData.name || '';
        if (!pinName && pinId) {
          pinName = pinId.split('-').pop();
        }
        
        // Map the pin name to a proper type
        let pinType = 'bidirectional';
        if (pinName === 'R' || pinName.includes('red')) {
          pinName = 'red';
          pinType = 'input';
        } else if (pinName === 'G' || pinName.includes('green')) {
          pinName = 'green';
          pinType = 'input';
        } else if (pinName === 'B' || pinName.includes('blue')) {
          pinName = 'blue';
          pinType = 'input';
        } else if (pinName === 'COM' || pinName.includes('common')) {
          pinName = 'common';
          pinType = 'power';
        }
        
        // Get the position of the pin within the canvas if available
        const targetRect = targetRef.current?.getBoundingClientRect();
        const canvasRect = canvasRef?.current?.getBoundingClientRect();
        
        let pinPosition = null;
        if (e.detail.clientX && e.detail.clientY && canvasRect) {
          // Calculate the basic position
          pinPosition = {
            x: e.detail.clientX - canvasRect.left,
            y: e.detail.clientY - canvasRect.top
          };
          
          // Apply specific RGB LED pin position corrections
          if (pinName === 'red') {
            // Red pin on left side
            pinPosition.x -= 5;
          } else if (pinName === 'green') {
            // Green pin on top
            pinPosition.y -= 5;
          } else if (pinName === 'blue') {
            // Blue pin on right side
            pinPosition.x += 5;
          } else if (pinName === 'common') {
            // Common pin on bottom
            pinPosition.y += 5;
          }
        }
        
        // Create a custom event with enhanced details for the wire manager
        const pinClickEvent = new CustomEvent('pinClicked', {
          bubbles: true,
          detail: {
            id: `${id}-${pinName}`, // Use component ID + pin name for unique ID
            pinId: `${id}-${pinName}`,
            pinName,
            pinType,
            parentId: id,
            parentComponentId: id,
            clientX: e.detail.clientX,
            clientY: e.detail.clientY,
            pinPosition
          }
        });
        
        // Dispatch the event to be caught by the wire manager
        document.dispatchEvent(pinClickEvent);
        
        // Also call the provided callback for backward compatibility
        onPinConnect(`${id}-${pinName}`, pinType, id, pinPosition);
        
        console.log(`RGB LED Pin ${pinName} (${pinType}) of component ${id} clicked`, pinPosition);
      } catch (error) {
        console.error('Error processing RGB LED pin click:', error);
      }
    }
  };

  // Update LED color function
  const updateLEDColor = (color, value) => {
    switch(color) {
      case 'red':
        setLedRed(value);
        break;
      case 'green':
        setLedGreen(value);
        break;
      case 'blue': 
        setLedBlue(value);
        break;
      default:
        break;
    }
  };

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
      ></ReactRGBLEDComponent>
    </>
  );
};

export default RGBLED;