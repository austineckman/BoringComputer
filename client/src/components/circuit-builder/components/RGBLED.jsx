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

  // Handle pin click
  const handlePinClicked = (e) => {
    if (onPinConnect) {
      const pinId = e.detail.pinId;
      const pinType = e.detail.pinType;
      onPinConnect(pinId, pinType, id);
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
        isActive={isSelected}
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
          zIndex: isDragged ? 99999 : 10
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